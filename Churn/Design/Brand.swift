import CoreText
import SwiftUI
import UIKit

/// Type for the app.
///
/// Sour Gummy ships only as a variable font, and its default instance is Black
/// (the `wght` axis runs 100–900 with a default of 900). Left alone it would
/// render far heavier than the design, so the weight axis is set explicitly on
/// every request.
///
/// The font is registered at runtime rather than declared in Info.plist, which
/// keeps the generated project free of a hand-maintained plist.
enum Brand {
    /// 'wght' as a four-byte identifier, the form CoreText wants.
    private static let weightAxis: UInt32 = 0x7767_6874
    private static let postScriptName = "SourGummy-Black"

    private static let isRegistered: Bool = {
        guard let url = Bundle.main.url(forResource: "SourGummy", withExtension: "ttf") else {
            return false
        }
        var error: Unmanaged<CFError>?
        return CTFontManagerRegisterFontsForURL(url as CFURL, .process, &error)
    }()

    /// False when the bundled font is missing or failed to register, in which
    /// case everything below quietly falls back to a heavy rounded system face.
    /// Surfaced in Settings so a silent substitution can't go unnoticed.
    static var isDisplayFontAvailable: Bool { uiDisplay(17, weight: 600) != nil }

    static func display(_ size: CGFloat, weight: CGFloat = 600) -> Font {
        if let font = uiDisplay(size, weight: weight) { return Font(font) }
        return .system(size: size, weight: .heavy, design: .rounded)
    }

    /// Body copy stays on the system rounded face — it reads better at small
    /// sizes than a display face, and costs nothing to ship.
    static func body(_ size: CGFloat, weight: Font.Weight = .medium) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }

    private static func uiDisplay(_ size: CGFloat, weight: CGFloat) -> UIFont? {
        guard isRegistered else { return nil }
        let descriptor = UIFontDescriptor(fontAttributes: [
            .name: postScriptName,
            UIFontDescriptor.AttributeName(rawValue: kCTFontVariationAttribute as String):
                [weightAxis: weight],
        ])
        // UIFont(descriptor:size:) never returns nil — it substitutes silently —
        // so confirm we actually got the family we asked for.
        let font = UIFont(descriptor: descriptor, size: size)
        guard font.familyName.hasPrefix("Sour Gummy") else { return nil }
        return font
    }
}

// MARK: - Deterministic randomness

/// Small LCG so sprinkles and squiggles look hand-scattered but never move
/// between redraws. `SystemRandomNumberGenerator` would reshuffle every frame.
struct SeededRNG: RandomNumberGenerator {
    private var state: UInt64

    init(seed: UInt64) { state = seed &* 6_364_136_223_846_793_005 &+ 1_442_695_040_888_963_407 }

    mutating func next() -> UInt64 {
        state = state &* 6_364_136_223_846_793_005 &+ 1_442_695_040_888_963_407
        return state
    }

    /// A value in 0..<1.
    mutating func unit() -> Double {
        Double(next() >> 11) / Double(1 << 53)
    }

    mutating func between(_ low: Double, _ high: Double) -> Double {
        low + unit() * (high - low)
    }
}
