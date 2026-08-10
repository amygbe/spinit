#!/usr/bin/env python3
"""Inline the display fonts into prototype.html as base64 @font-face rules.

The Artifact CSP blocks every external host, so a <link> to a font CDN would
fail silently and fall back to a system sans — exactly the "boring basic sans
serif" we're trying to get away from. Embedding is the only way the prototype
looks the same for everyone who opens it.

Idempotent: re-run it after editing the HTML and it replaces the old block.

    python3 design/inject_fonts.py
"""

from __future__ import annotations

import base64
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
HTML = HERE / "prototype.html"
FONTS = HERE / "fonts"

START = "/* === injected fonts: do not edit by hand === */"
END = "/* === end injected fonts === */"

# family name -> file stem. All SIL Open Font Licence, so they're free to embed
# here and to bundle in the shipped app later.
#
# Every one of these is hand-drawn, marker, or wonky — the Shantell Sans family
# of shapes. The earlier retro-display set (Bagel Fat One, Shrikhand, Bungee…)
# is still in fonts/ if we ever want to go back to it.
FAMILIES = {
    "Shantell Sans": "Shantell-Sans",
    "Grandstander": "Grandstander",
    "Gochi Hand": "Gochi-Hand",
    "Caveat Brush": "Caveat-Brush",
    "Fuzzy Bubbles": "Fuzzy-Bubbles",
    "Sour Gummy": "Sour-Gummy",
    "Permanent Marker": "Permanent-Marker",
    "Indie Flower": "Indie-Flower",
    "Patrick Hand": "Patrick-Hand",
    "Sedgwick Ave": "Sedgwick-Ave",
}


def face(family: str, stem: str) -> str:
    data = (FONTS / f"{stem}.woff2").read_bytes()
    b64 = base64.b64encode(data).decode()
    return (
        f"@font-face{{font-family:'{family}';font-style:normal;font-weight:400;"
        f"font-display:swap;src:url(data:font/woff2;base64,{b64}) format('woff2');}}"
    )


def main() -> None:
    html = HTML.read_text()

    block = "\n".join([START] + [face(f, s) for f, s in FAMILIES.items()] + [END])

    if START in html:
        html = re.sub(
            re.escape(START) + ".*?" + re.escape(END), block, html, flags=re.DOTALL
        )
    else:
        # first <style> wins; the rules must land before anything uses them
        html = html.replace("<style>", "<style>\n" + block, 1)

    HTML.write_text(html)
    total = sum((FONTS / f"{s}.woff2").stat().st_size for s in FAMILIES.values())
    print(f"Embedded {len(FAMILIES)} fonts ({total // 1024} KB raw)")
    print(f"prototype.html is now {HTML.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
