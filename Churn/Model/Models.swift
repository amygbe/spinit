import Foundation

// MARK: - Units

enum Unit: String, Codable, CaseIterable, Hashable {
    case grams, milliliters, teaspoons, tablespoons, cups
    case pinch, drops, scoops, whole, toTaste

    var short: String {
        switch self {
        case .grams: "g"
        case .milliliters: "ml"
        case .teaspoons: "tsp"
        case .tablespoons: "tbsp"
        case .cups: "cup"
        case .pinch: "pinch"
        case .drops: "drops"
        case .scoops: "scoop"
        case .whole: ""
        case .toTaste: "to taste"
        }
    }

    /// Units that read better without a number in front of them ("pinch of salt").
    var isQualitative: Bool { self == .pinch || self == .toTaste }
}

// MARK: - Ingredient

/// Where an ingredient lands in the process. The Creami workflow is genuinely
/// staged — things blended before freezing behave differently from things
/// folded in after the spin — so the role is part of the recipe, not a label.
enum IngredientRole: String, Codable, CaseIterable, Hashable {
    case base       // goes in the pint before freezing
    case flavour    // extracts, powders, purées — also pre-freeze
    case mixIn      // folded in during the MIX-IN cycle, after the first spin
    case topping    // added to the bowl at serving

    var title: String {
        switch self {
        case .base: "Base"
        case .flavour: "Flavour"
        case .mixIn: "Mix-ins"
        case .topping: "Toppings"
        }
    }

    var verb: String {
        switch self {
        case .base: "Blend into the pint"
        case .flavour: "Blend into the pint"
        case .mixIn: "Fold in on the mix-in cycle"
        case .topping: "Add at the bowl"
        }
    }
}

struct Ingredient: Codable, Identifiable, Hashable {
    var id: UUID = UUID()
    var name: String
    var amount: Double?
    var unit: Unit
    var role: IngredientRole
    /// Free text for the things a number can't hold — "half cup?", "or cake batter extract".
    var note: String = ""
    /// True for ingredients the recipe works fine without.
    var isOptional: Bool = false

    init(
        _ name: String,
        amount: Double? = nil,
        unit: Unit = .whole,
        role: IngredientRole = .flavour,
        note: String = "",
        isOptional: Bool = false
    ) {
        self.name = name
        self.amount = amount
        self.unit = unit
        self.role = role
        self.note = note
        self.isOptional = isOptional
    }

    /// "400 ml", "pinch", "¼ tsp" — the left-hand column of the ingredient list.
    var measurement: String {
        if unit.isQualitative { return unit.short }
        guard let amount else { return unit.short }
        return "\(Self.format(amount))\(unit.short.isEmpty ? "" : " \(unit.short)")"
    }

    /// Scores out of ten, where "9.5" is what you'd say out loud. Deliberately
    /// separate from `format`, whose fractions are right for ¼ tsp and wrong here.
    static func formatScore(_ value: Double) -> String {
        value == value.rounded()
            ? String(Int(value))
            : String(format: "%.1f", value)
    }

    static func format(_ value: Double) -> String {
        // Fractions read better than decimals for spoon measures.
        let fractions: [(Double, String)] = [
            (0.125, "⅛"), (0.25, "¼"), (0.333, "⅓"), (0.5, "½"),
            (0.667, "⅔"), (0.75, "¾"),
        ]
        let whole = value.rounded(.down)
        let remainder = value - whole
        if let match = fractions.first(where: { abs($0.0 - remainder) < 0.02 }) {
            let prefix = whole > 0 ? "\(Int(whole))" : ""
            return prefix + match.1
        }
        if abs(value.rounded() - value) < 0.001 { return String(Int(value.rounded())) }
        return String(format: "%g", value)
    }
}

// MARK: - Base

/// A reusable pint base. The whole point of the Creami workflow is that one
/// base carries most of the recipes, so it lives on its own and recipes
/// reference it rather than each restating 400ml of milk.
struct Base: Codable, Identifiable, Hashable {
    var id: UUID = UUID()
    var name: String
    var ingredients: [Ingredient]
    var note: String = ""
    var isDefault: Bool = false

    var summary: String {
        ingredients.prefix(3).map(\.name).joined(separator: " · ")
    }
}

// MARK: - Spin log

enum Program: String, Codable, CaseIterable, Hashable {
    case liteIceCream, iceCream, gelato, sorbet, frozenYogurt, milkshake, smoothieBowl

    var title: String {
        switch self {
        case .liteIceCream: "Lite Ice Cream"
        case .iceCream: "Ice Cream"
        case .gelato: "Gelato"
        case .sorbet: "Sorbet"
        case .frozenYogurt: "Frozen Yogurt"
        case .milkshake: "Milkshake"
        case .smoothieBowl: "Smoothie Bowl"
        }
    }
}

enum Texture: String, Codable, CaseIterable, Hashable {
    case crumbly, icy, justRight, soft, soupy

    var title: String {
        switch self {
        case .crumbly: "Crumbly"
        case .icy: "Icy"
        case .justRight: "Just right"
        case .soft: "Soft"
        case .soupy: "Soupy"
        }
    }

    /// What to do next time. Crumbly and icy both mean respin; soupy means refreeze.
    var advice: String {
        switch self {
        case .crumbly: "Add a splash of milk and respin."
        case .icy: "Respin — and consider a touch more xanthan next batch."
        case .justRight: ""
        case .soft: "Freeze a little longer before spinning."
        case .soupy: "Too warm going in. Give it the full 24 hours."
        }
    }
}

/// One trip through the machine.
struct Spin: Codable, Identifiable, Hashable {
    var id: UUID = UUID()
    var date: Date = .now
    var program: Program = .liteIceCream
    var respins: Int = 0
    var texture: Texture = .justRight
    var rating: Double?
    var note: String = ""
}

// MARK: - Adjustment

/// The "try this next time" list. Every one of the original recipes came with a
/// note like *try nilla wafers* — those are the most valuable thing in the log,
/// so they're real objects you can tick off instead of buried prose.
struct Experiment: Codable, Identifiable, Hashable {
    var id: UUID = UUID()
    var text: String
    var isDone: Bool = false
    var verdict: String = ""
}

// MARK: - Recipe

/// Where a recipe came from. This is what lets one shelf hold your own
/// scribbles, the curated set, and other people's submissions without
/// pretending they're the same thing.
enum Origin: String, Codable, CaseIterable, Hashable {
    case mine       // you wrote it
    case curated    // Amy's approved set
    case community  // somebody else's, approved into the catalogue

    var title: String {
        switch self {
        case .mine: "Yours"
        case .curated: "Approved"
        case .community: "Community"
        }
    }
}

/// The shareable half: everything that travels when a recipe is published.
///
/// Notably absent are the rating, the spins, and the adjustments — those are
/// opinions about the recipe, not the recipe, and they live in `Log`. Keeping
/// them apart is what makes it possible to hand someone your Banana recipe
/// without also handing them your 10/10.
struct Recipe: Codable, Identifiable, Hashable {
    var id: UUID = UUID()
    var name: String
    /// nil means "uses the default base".
    var baseID: UUID?
    /// Set when a recipe departs from the shared base (chocolate milk, less sweetener).
    var customBase: [Ingredient]?
    var ingredients: [Ingredient] = []
    /// The author's own notes on making it — travels with the recipe.
    var method: String = ""
    var swatch: Swatch = .vanilla
    var glyph: String = "🍨"
    var author: String = ""
    var origin: Origin = .mine
    var createdAt: Date = .now

    func ingredients(_ role: IngredientRole) -> [Ingredient] {
        ingredients.filter { $0.role == role }
    }
}

// MARK: - Log

/// Your half: what happened when *you* made it. Never published.
struct Log: Codable, Identifiable, Hashable {
    var id: UUID { recipeID }
    var recipeID: Recipe.ID
    var rating: Double?
    var spins: [Spin] = []
    /// Changes to try on the next spin.
    var adjustments: [Experiment] = []
    /// Private scratch notes, as opposed to the author's `method`.
    var notes: String = ""
    var isPinned: Bool = false

    var hasBeenMade: Bool { rating != nil || !spins.isEmpty }
    var openAdjustments: [Experiment] { adjustments.filter { !$0.isDone } }
}

// MARK: - Swatch

/// A small fixed palette instead of free colour picking. Each swatch drives the
/// tile colour on a recipe's card, so constraining the set is what keeps a
/// shelf of them looking composed rather than like confetti.
enum Swatch: String, Codable, CaseIterable, Hashable {
    case mint, cocoa, banana, mango, vanilla, pumpkin, berry, matcha, olive, coffee
    case cherry, bubblegum, grape, lavender, blueberry, sky, charcoal, snow

    var title: String { rawValue.capitalized }
}
