// Push the curated recipes into the catalogue as already-approved.
//
//   node seed-catalogue.mjs http://127.0.0.1:8787 <admin-token>
//   node seed-catalogue.mjs https://churn.<you>.workers.dev <admin-token>
//
// Safe to re-run: it reads what's already approved and skips anything whose
// name is already there, so it tops up rather than duplicating.

const [, , baseURL, token] = process.argv;

if (!baseURL || !token) {
  console.error("usage: node seed-catalogue.mjs <base-url> <admin-token>");
  process.exit(1);
}

const AUTHOR = "Amy";

const RECIPES = [
  {
    name: "Banana", glyph: "🍌", swatch: "banana",
    method: "Classic base with banana extract. Blend, freeze 24h, spin on Lite Ice Cream.",
    ingredients: [
      { name: "Banana extract", role: "flavour", unit: "toTaste", note: "a splash" },
      { name: "Freeze-dried banana", role: "mixIn", amount: 15, unit: "grams", isOptional: true },
    ],
  },
  {
    name: "Oreo McFlurry", glyph: "🍪", swatch: "vanilla",
    method: "Vanilla bean paste in the base, crushed Oreos folded in after the first spin.",
    ingredients: [
      { name: "Vanilla bean paste", role: "flavour", note: "Or swap for vanilla + cake batter extract" },
      { name: "Oreos", role: "mixIn", note: "Crushed" },
    ],
  },
  {
    name: "Pumpkin Pie", glyph: "🎃", swatch: "pumpkin",
    method: "Pumpkin purée and warm spices in the base, graham cracker folded in.",
    ingredients: [
      { name: "Pumpkin purée", role: "flavour", note: "45 cal serving? Half cup? — needs pinning down" },
      { name: "Cinnamon", role: "flavour" },
      { name: "Nutmeg", role: "flavour" },
      { name: "Allspice", role: "flavour" },
      { name: "Graham cracker", role: "mixIn" },
    ],
  },
  {
    name: "Mint Chocolate", glyph: "🍃", swatch: "mint",
    method: "Peppermint extract in the base. Dark cocoa and syrup go in on the mix-in cycle.",
    ingredients: [
      { name: "Peppermint extract", role: "flavour", note: "To taste — start small" },
      { name: "Dark cocoa powder", role: "mixIn" },
      { name: "Chocolate syrup", role: "mixIn" },
    ],
  },
  {
    name: "Mango Sticky Rice", glyph: "🥭", swatch: "mango",
    method: "Coconut extract in the base. Rice crispies and freeze-dried mango folded in, fresh mango over the top.",
    ingredients: [
      { name: "Coconut extract", role: "flavour" },
      { name: "Rice crispies", role: "mixIn" },
      { name: "Freeze-dried mango", role: "mixIn" },
      { name: "Fresh mango", role: "topping", note: "Sliced, over the top" },
    ],
  },
  {
    name: "Chocolate Banana", glyph: "🍫", swatch: "cocoa",
    method: "Leaves the classic base behind — chocolate milk, less sweetener, a splash of extra milk.",
    customBase: [
      { name: "Fairlife chocolate milk", amount: 400, unit: "milliliters", role: "base",
        note: "Volume assumed to match the classic base — check this" },
      { name: "Monk fruit sweetener", amount: 20, unit: "grams", role: "base" },
      { name: "Milk", amount: 75, unit: "grams", role: "base" },
      { name: "Salt", unit: "pinch", role: "base" },
      { name: "Xanthan gum", amount: 0.25, unit: "teaspoons", role: "base" },
    ],
    ingredients: [
      { name: "Banana extract", role: "flavour" },
      { name: "Cocoa powder", role: "flavour", note: "Regular, not dark" },
    ],
  },
  {
    name: "Olive Oil", glyph: "🫒", swatch: "olive",
    method: "Classic base, but leave the vanilla out. Use an olive oil you'd happily drink.",
    ingredients: [
      { name: "Olive oil", role: "flavour", note: "Amount TBD — use one you'd drink" },
    ],
  },
];

const headers = {
  "content-type": "application/json",
  authorization: `Bearer ${token}`,
};

const existing = await fetch(`${baseURL}/admin/pending?status=approved`, { headers });
if (!existing.ok) {
  console.error("Could not read the catalogue:", (await existing.json()).error);
  process.exit(1);
}
const already = new Set(
  (await existing.json()).submissions.map((s) => s.name.toLowerCase())
);

let added = 0;
for (const recipe of RECIPES) {
  if (already.has(recipe.name.toLowerCase())) {
    console.log(`  skip   ${recipe.name} (already in the catalogue)`);
    continue;
  }
  const res = await fetch(`${baseURL}/admin/create`, {
    method: "POST",
    headers,
    body: JSON.stringify({ recipe: { ...recipe, author: AUTHOR }, status: "approved" }),
  });
  if (res.ok) {
    console.log(`  added  ${recipe.name}`);
    added += 1;
  } else {
    console.log(`  FAILED ${recipe.name}: ${(await res.json()).error}`);
  }
}

const after = await fetch(`${baseURL}/catalogue`);
const { count } = await after.json();
console.log(`\n${added} added. Catalogue now holds ${count} recipe(s).`);
