import Foundation

// The original log, transcribed. Where a note carried a question mark
// ("45 cal serving? Half cup?") the uncertainty is preserved in the
// ingredient's note rather than resolved into a number nobody wrote.
//
// These are the curated set — the ones that ship with the app — so their
// ratings and adjustments arrive as Logs, separate from the recipes themselves.

extension Library {
    static var seed: Library {
        let house = Base(
            name: "Classic Base",
            ingredients: [
                Ingredient("Fairlife 0% milk", amount: 400, unit: .milliliters, role: .base),
                Ingredient("Monk fruit sweetener", amount: 40, unit: .grams, role: .base),
                Ingredient("Salt", unit: .pinch, role: .base),
                Ingredient("Xanthan gum", amount: 0.25, unit: .teaspoons, role: .base,
                           note: "Confirm your amount — this was blank in the log"),
            ],
            note: "The workhorse. Blend, freeze 24h, spin on Lite Ice Cream.",
            isDefault: true
        )

        let author = "Amy"

        let banana = Recipe(
            name: "Banana",
            ingredients: [
                Ingredient("Banana extract", unit: .toTaste, role: .flavour, note: "A splash"),
                Ingredient("Freeze-dried banana", amount: 15, unit: .grams, role: .mixIn, isOptional: true),
            ],
            swatch: .banana, glyph: "🍌", author: author, origin: .curated
        )

        let oreoMcFlurry = Recipe(
            name: "Oreo McFlurry",
            ingredients: [
                Ingredient("Vanilla bean paste", role: .flavour,
                           note: "Or swap for vanilla + cake batter extract"),
                Ingredient("Oreos", role: .mixIn, note: "Crushed"),
            ],
            swatch: .vanilla, glyph: "🍪", author: author, origin: .curated
        )

        let pumpkinPie = Recipe(
            name: "Pumpkin Pie",
            ingredients: [
                Ingredient("Pumpkin purée", role: .flavour,
                           note: "45 cal serving? Half cup? — needs pinning down"),
                Ingredient("Cinnamon", role: .flavour),
                Ingredient("Nutmeg", role: .flavour),
                Ingredient("Allspice", role: .flavour),
                Ingredient("Graham cracker", role: .mixIn),
            ],
            swatch: .pumpkin, glyph: "🎃", author: author, origin: .curated
        )

        let mintChocolate = Recipe(
            name: "Mint Chocolate",
            ingredients: [
                Ingredient("Peppermint extract", role: .flavour, note: "To taste — start small"),
                Ingredient("Dark cocoa powder", role: .mixIn),
                Ingredient("Chocolate syrup", role: .mixIn),
            ],
            swatch: .mint, glyph: "🍃", author: author, origin: .curated
        )

        let mangoStickyRice = Recipe(
            name: "Mango Sticky Rice",
            ingredients: [
                Ingredient("Coconut extract", role: .flavour),
                Ingredient("Rice crispies", role: .mixIn),
                Ingredient("Freeze-dried mango", role: .mixIn),
                Ingredient("Fresh mango", role: .topping, note: "Sliced, over the top"),
            ],
            swatch: .mango, glyph: "🥭", author: author, origin: .curated
        )

        // The one recipe that leaves the house base behind.
        let chocolateBanana = Recipe(
            name: "Chocolate Banana",
            customBase: [
                Ingredient("Fairlife chocolate milk", amount: 400, unit: .milliliters, role: .base,
                           note: "Volume assumed to match the house base — check this"),
                Ingredient("Monk fruit sweetener", amount: 20, unit: .grams, role: .base),
                Ingredient("Milk", amount: 75, unit: .grams, role: .base),
                Ingredient("Salt", unit: .pinch, role: .base),
                Ingredient("Xanthan gum", amount: 0.25, unit: .teaspoons, role: .base),
            ],
            ingredients: [
                Ingredient("Banana extract", role: .flavour),
                Ingredient("Cocoa powder", role: .flavour, note: "Regular, not dark"),
            ],
            swatch: .cocoa, glyph: "🍫", author: author, origin: .curated
        )

        let oliveOil = Recipe(
            name: "Olive Oil",
            ingredients: [
                Ingredient("Olive oil", role: .flavour, note: "Amount TBD — use one you'd drink"),
            ],
            method: "Classic base, but leave the vanilla out.",
            swatch: .olive, glyph: "🫒", author: author, origin: .curated
        )

        let recipes = [
            banana, oreoMcFlurry, pumpkinPie, mintChocolate,
            mangoStickyRice, chocolateBanana, oliveOil,
        ]

        let logs = [
            Log(recipeID: banana.id, rating: 10, adjustments: [
                Experiment(text: "Try Nilla Wafers as the mix-in"),
                Experiment(text: "Biscoff mix-in", isDone: true, verdict: "Fine, not a keeper"),
            ]),
            Log(recipeID: oreoMcFlurry.id, rating: 9.5),
            Log(recipeID: pumpkinPie.id, rating: 9.5, adjustments: [
                Experiment(text: "Add a small amount of vanilla"),
                Experiment(text: "Buy ginger powder, then add it"),
            ]),
            Log(recipeID: mintChocolate.id, rating: 9, adjustments: [
                Experiment(text: "Mix in Oreos"),
            ]),
            Log(recipeID: mangoStickyRice.id, rating: 9),
            // Never made, but already has an idea attached — which is exactly
            // why adjustments can't live behind a rating.
            Log(recipeID: chocolateBanana.id, adjustments: [
                Experiment(text: "Try it with dark cocoa instead"),
            ]),
            Log(recipeID: oliveOil.id, adjustments: [
                Experiment(text: "First attempt — base, no vanilla"),
            ]),
        ]

        return Library(bases: [house], recipes: recipes, logs: logs)
    }
}
