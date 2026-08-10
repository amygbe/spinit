import SwiftUI

extension Color {
    /// Hex literals keep these readable next to the design tokens they came from.
    init(_ hex: UInt32, opacity: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: opacity
        )
    }
}

/// The six blue-raspberry-family palettes, lifted verbatim from the prototype.
///
/// Two colour pairs, and which one a view uses depends entirely on what it sits
/// on: `ground`/`onGround` for anything directly on the screen, `card`/`ink`
/// for anything on a raised surface. Getting this backwards is what made the
/// prototype's tiles go muddy, so it's worth keeping the names literal.
enum Palette: String, CaseIterable, Identifiable, Codable {
    case blueRaspberry, slushie, blueberry, freezie, razz, midnight

    var id: String { rawValue }

    var title: String {
        switch self {
        case .blueRaspberry: "Blue Raspberry"
        case .slushie: "Slushie"
        case .blueberry: "Blueberry"
        case .freezie: "Freezie"
        case .razz: "Razz"
        case .midnight: "Midnight"
        }
    }

    var blurb: String {
        switch self {
        case .blueRaspberry: "The original. Royal blue, cream, and a yellow pop."
        case .slushie: "Brighter and colder, with a magenta pop."
        case .blueberry: "Deeper blue, warmed up with orange."
        case .freezie: "The pale icy one."
        case .razz: "The raspberry half, with royal blue as the pop."
        case .midnight: "The dark one."
        }
    }

    var ground: Color {
        switch self {
        case .blueRaspberry: Color(0x2B3AF0)
        case .slushie: Color(0x00A8E8)
        case .blueberry: Color(0x2012C4)
        case .freezie: Color(0xCFEDFF)
        case .razz: Color(0xC81355)
        case .midnight: Color(0x0B1030)
        }
    }

    var onGround: Color {
        switch self {
        case .blueRaspberry: Color(0xFFF6E3)
        case .slushie: Color(0x04263B)
        case .blueberry: Color(0xEFEBFF)
        case .freezie: Color(0x093A5E)
        case .razz: Color(0xFFF0F6)
        case .midnight: Color(0xEAF0FF)
        }
    }

    var onGroundDim: Color {
        switch self {
        case .blueRaspberry: Color(0xB9C0FF)
        case .slushie: Color(0x075C86)
        case .blueberry: Color(0xA79BFF)
        case .freezie: Color(0x3E6E94)
        case .razz: Color(0xFFA9C9)
        case .midnight: Color(0x8FA0D8)
        }
    }

    var card: Color {
        switch self {
        case .blueRaspberry: Color(0xFFF7E8)
        case .slushie: Color(0xF2FBFF)
        case .blueberry: Color(0xF4F1FF)
        case .freezie: Color(0xFDFEFF)
        case .razz: Color(0xFFF5F9)
        case .midnight: Color(0x1B2250)
        }
    }

    var ink: Color {
        switch self {
        case .blueRaspberry: Color(0x15104A)
        case .slushie: Color(0x05304A)
        case .blueberry: Color(0x170A56)
        case .freezie: Color(0x0A2E4A)
        case .razz: Color(0x4A0A26)
        case .midnight: Color(0xEFF3FF)
        }
    }

    var inkSoft: Color {
        switch self {
        case .blueRaspberry: Color(0x5A5490)
        case .slushie: Color(0x34627E)
        case .blueberry: Color(0x4A3E8E)
        case .freezie: Color(0x38607F)
        case .razz: Color(0x8E3A5E)
        case .midnight: Color(0xBAC5F0)
        }
    }

    /// The muted one. These values were raised until every palette cleared
    /// 4.5:1 against its own card — the first pass sat between 2.6 and 4.1.
    var inkMuted: Color {
        switch self {
        case .blueRaspberry: Color(0x5F5A93)
        case .slushie: Color(0x45708C)
        case .blueberry: Color(0x574B9C)
        case .freezie: Color(0x486F8D)
        case .razz: Color(0x964063)
        case .midnight: Color(0xA2B0E6)
        }
    }

    var pop: Color {
        switch self {
        case .blueRaspberry: Color(0xFFD426)
        case .slushie: Color(0xD50F63)
        case .blueberry: Color(0xFF9E00)
        case .freezie: Color(0xC7137A)
        case .razz: Color(0x2B3AF0)
        case .midnight: Color(0xFFD426)
        }
    }

    var onPop: Color {
        switch self {
        case .blueRaspberry: Color(0x15104A)
        case .slushie: .white
        case .blueberry: Color(0x2A1600)
        case .freezie: .white
        case .razz: .white
        case .midnight: Color(0x201A00)
        }
    }

    var popSoft: Color {
        switch self {
        case .blueRaspberry: Color(0xFFF3C4)
        case .slushie: Color(0xFFDCEA)
        case .blueberry: Color(0xFFE9C4)
        case .freezie: Color(0xFBDCEC)
        case .razz: Color(0xDCE0FF)
        case .midnight: Color(0xFFD426, opacity: 0.15)
        }
    }

    var hairline: Color { ink.opacity(0.08) }

    /// Drives the status bar, so the clock stays legible on dark grounds.
    var colorScheme: ColorScheme {
        switch self {
        case .midnight, .blueRaspberry, .blueberry, .razz: .dark
        case .slushie, .freezie: .light
        }
    }
}

// MARK: - Flavour colours

/// Flavour colours are deliberately palette-independent: a tile always sits on
/// a card, so it only ever has to work against `card`.
extension Swatch {
    var colour: Color {
        switch self {
        case .banana: Color(0xFFC42E)
        case .vanilla: Color(0xFF9F45)
        case .pumpkin: Color(0xFF6B1A)
        case .mint: Color(0x00D49B)
        case .mango: Color(0xFF8C1A)
        case .cocoa: Color(0xB0632F)
        case .olive: Color(0x9BC72B)
        case .berry: Color(0xE8336F)
        case .matcha: Color(0x86C232)
        case .coffee: Color(0x8B5E3C)
        case .cherry: Color(0xE22B47)
        case .bubblegum: Color(0xFF7BC1)
        case .grape: Color(0x8B4DE8)
        case .lavender: Color(0xB79CFF)
        case .blueberry: Color(0x4353FF)
        case .sky: Color(0x3BB8FF)
        case .charcoal: Color(0x494A5A)
        case .snow: Color(0xF2EDE4)
        }
    }
}

// MARK: - Environment

private struct PaletteKey: EnvironmentKey {
    static let defaultValue: Palette = .blueRaspberry
}

extension EnvironmentValues {
    var palette: Palette {
        get { self[PaletteKey.self] }
        set { self[PaletteKey.self] = newValue }
    }
}
