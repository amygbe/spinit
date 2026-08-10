#!/usr/bin/env python3
"""Turn the supplied logo artwork into icons the app and the web can both use.

    python3 tools/prepare_logo.py <source.png>

The artwork arrives with its corners already rounded and the area outside the
rounding filled with black. That's wrong for an icon: iOS masks icons with its
own squircle, so a rounding baked into the image leaves dark slivers where the
two curves disagree. The fix is to flood the dark corners with the logo's own
blue and hand out a full-bleed square — iOS then rounds it perfectly, and so
does every Android launcher and browser.

Pure standard library. PNG is simple enough to read and write by hand, and this
keeps the pipeline dependency-free.
"""

from __future__ import annotations

import pathlib
import struct
import sys
import zlib

DARK_LUMA = 60  # below this counts as the black corner fill

# The app's own palette, so the icon matches the screens it sits next to.
BRAND_BLUE = (0x2B, 0x3A, 0xF0)
BRAND_YELLOW = (0xFF, 0xD4, 0x26)
BRAND_BLUE_HEX = "2B3AF0"
BRAND_YELLOW_HEX = "FFD426"


def dist2(a: tuple[int, int, int], b: tuple[int, int, int]) -> int:
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2


def find_yellow(rows: list[bytearray], blue: tuple[int, int, int]) -> tuple[int, int, int]:
    """The most common colour that clearly isn't the background."""
    counts: dict[tuple[int, int, int], int] = {}
    for row in rows[::7]:
        for x in range(0, len(row), 3 * 7):
            px = (row[x], row[x + 1], row[x + 2])
            if dist2(px, blue) > 8000:
                counts[px] = counts.get(px, 0) + 1
    if not counts:
        return BRAND_YELLOW
    return max(counts.items(), key=lambda kv: kv[1])[0]


def read_png(path: pathlib.Path) -> tuple[int, int, list[bytearray]]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"{path} is not a PNG")

    pos, width, height, depth, colour = 8, 0, 0, 0, 0
    idat = b""
    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        tag = data[pos + 4 : pos + 8]
        body = data[pos + 8 : pos + 8 + length]
        if tag == b"IHDR":
            width, height, depth, colour = struct.unpack(">IIBB", body[:10])
        elif tag == b"IDAT":
            idat += body
        pos += 12 + length

    if depth != 8 or colour not in (2, 6):
        raise SystemExit(f"Only 8-bit RGB/RGBA PNGs are handled (got depth {depth}, type {colour})")

    channels = 3 if colour == 2 else 4
    raw = zlib.decompress(idat)
    stride = width * channels
    rows: list[bytearray] = []
    prev = bytearray(stride)
    i = 0
    for _ in range(height):
        filt = raw[i]
        i += 1
        line = bytearray(raw[i : i + stride])
        i += stride
        for x in range(stride):
            a = line[x - channels] if x >= channels else 0
            b = prev[x]
            c = prev[x - channels] if x >= channels else 0
            if filt == 1:
                line[x] = (line[x] + a) & 255
            elif filt == 2:
                line[x] = (line[x] + b) & 255
            elif filt == 3:
                line[x] = (line[x] + (a + b) // 2) & 255
            elif filt == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pred) & 255
        rows.append(line)
        prev = line

    # normalise to RGB
    if channels == 4:
        rows = [bytearray(b for j, b in enumerate(r) if j % 4 != 3) for r in rows]
    return width, height, rows


def write_png(path: pathlib.Path, width: int, rows: list[bytearray]) -> None:
    raw = b"".join(b"\x00" + bytes(r) for r in rows)

    def chunk(tag: bytes, body: bytes) -> bytes:
        return (
            struct.pack(">I", len(body))
            + tag
            + body
            + struct.pack(">I", zlib.crc32(tag + body) & 0xFFFFFFFF)
        )

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", width, len(rows), 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: prepare_logo.py <source.png>")
    src = pathlib.Path(sys.argv[1]).expanduser()
    root = pathlib.Path(__file__).resolve().parent.parent

    width, height, rows = read_png(src)
    print(f"read {src.name}: {width}x{height}")

    # The background blue, taken from a point that is unambiguously background:
    # a tenth of the way in, halfway down, is well outside the artwork.
    sx, sy = width // 10, height // 2
    blue = tuple(rows[sy][sx * 3 : sx * 3 + 3])
    print(f"background blue sampled as #{blue[0]:02X}{blue[1]:02X}{blue[2]:02X}")

    replaced = 0
    for row in rows:
        for x in range(0, len(row), 3):
            r, g, b = row[x], row[x + 1], row[x + 2]
            if (r * 299 + g * 587 + b * 114) // 1000 < DARK_LUMA:
                row[x], row[x + 1], row[x + 2] = blue
                replaced += 1
    pct = replaced / (width * height) * 100
    print(f"filled {replaced:,} dark corner pixels ({pct:.1f}% of the image)")

    # The artwork is two flat colours, but arrives with thousands of near-
    # identical shades — the sort of noise a generated or re-compressed image
    # carries. PNG compresses that terribly (a 512px flat icon came out at
    # 252 KB), and it makes the edges look slightly muddy.
    #
    # Every pixel is re-expressed as a blend of exactly two colours: the app's
    # own blue and yellow. Flat areas snap to a single value, and edge pixels
    # keep their antialiasing by interpolating between the two — so the shape
    # stays smooth while the palette collapses to what it always should have been.
    yellow = find_yellow(rows, blue)
    print(f"artwork yellow sampled as #{yellow[0]:02X}{yellow[1]:02X}{yellow[2]:02X}")
    print(f"snapping to the app palette: #{BRAND_BLUE_HEX} and #{BRAND_YELLOW_HEX}")

    for row in rows:
        for x in range(0, len(row), 3):
            px = (row[x], row[x + 1], row[x + 2])
            db = dist2(px, blue)
            dy = dist2(px, yellow)
            total = db + dy
            t = 0.0 if total == 0 else db / total  # 0 = fully blue, 1 = fully yellow
            if t < 0.06:
                t = 0.0
            elif t > 0.94:
                t = 1.0
            row[x] = round(BRAND_BLUE[0] + (BRAND_YELLOW[0] - BRAND_BLUE[0]) * t)
            row[x + 1] = round(BRAND_BLUE[1] + (BRAND_YELLOW[1] - BRAND_BLUE[1]) * t)
            row[x + 2] = round(BRAND_BLUE[2] + (BRAND_YELLOW[2] - BRAND_BLUE[2]) * t)

    out = root / "design" / "logo-square.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    write_png(out, width, rows)
    print(f"wrote {out.relative_to(root)}  ({out.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
