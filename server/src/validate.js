// Nothing submitted from a phone is trusted. Everything that reaches the
// database goes through here first and comes out as a freshly built object —
// unknown fields are dropped rather than stored, so a future client can't
// smuggle extra data into the catalogue.

export const LIMITS = {
  body: 16 * 1024,
  name: 60,
  author: 40,
  method: 2000,
  note: 300,
  ingredientName: 80,
  ingredients: 40,
  glyph: 8,
};

const ROLES = new Set(["base", "flavour", "mixIn", "topping"]);
const UNITS = new Set([
  "grams", "milliliters", "teaspoons", "tablespoons", "cups",
  "pinch", "drops", "scoops", "whole", "toTaste",
]);
const CATEGORIES = new Set(["protein", "cream", "sorbet"]);

const SWATCHES = new Set([
  "mint", "cocoa", "banana", "mango", "vanilla",
  "pumpkin", "berry", "matcha", "olive", "coffee",
  "cherry", "bubblegum", "grape", "lavender", "blueberry",
  "sky", "charcoal", "snow",
]);

const SPACE = 32;
const DELETE = 127;

/**
 * Trim to length and drop C0 control characters and DEL. Done by code point
 * rather than a regex character class, so no control characters appear in this
 * source file — they are invisible in diffs and easy to corrupt in transit.
 */
function cleanString(value, max) {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (code < SPACE || code === DELETE) continue;
    out += ch;
  }
  return out.trim().slice(0, max);
}

function cleanIngredient(raw) {
  if (typeof raw !== "object" || raw === null) return null;
  const name = cleanString(raw.name, LIMITS.ingredientName);
  if (!name) return null;

  let amount = null;
  if (typeof raw.amount === "number" && Number.isFinite(raw.amount)) {
    amount = Math.max(0, Math.min(raw.amount, 100000));
  }

  return {
    name,
    amount,
    unit: UNITS.has(raw.unit) ? raw.unit : "whole",
    role: ROLES.has(raw.role) ? raw.role : "flavour",
    note: cleanString(raw.note, LIMITS.note),
    isOptional: raw.isOptional === true,
  };
}

/**
 * Validate and normalise a submitted recipe.
 * @returns {{ok: true, recipe: object} | {ok: false, error: string}}
 */
export function validateSubmission(raw) {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Expected an object." };
  }

  const name = cleanString(raw.name, LIMITS.name);
  if (!name) return { ok: false, error: "A recipe needs a name." };

  const author = cleanString(raw.author, LIMITS.author);
  if (!author) return { ok: false, error: "Add a display name so you get credit." };

  const list = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  const ingredients = list
    .slice(0, LIMITS.ingredients)
    .map(cleanIngredient)
    .filter(Boolean);

  const customBase = Array.isArray(raw.customBase)
    ? raw.customBase.slice(0, LIMITS.ingredients).map(cleanIngredient).filter(Boolean)
    : null;

  // A recipe with only a custom base is legitimate — a watermelon-and-Sprite
  // sorbet has no flavour stage at all. Empty means empty of everything.
  if (ingredients.length === 0 && !(customBase && customBase.length)) {
    return { ok: false, error: "A recipe needs at least one ingredient." };
  }

  // A glyph is one or two characters of emoji. Anything longer is someone
  // putting a name where a picture goes. Split by code point so an emoji
  // never gets sliced in half.
  const glyph = cleanString(raw.glyph, LIMITS.glyph) || "🍨";

  return {
    ok: true,
    recipe: {
      name,
      author,
      // Which shelf of the catalogue this belongs on. "cream" is the neutral
      // default for anything that doesn't say.
      category: CATEGORIES.has(raw.category) ? raw.category : "cream",
      glyph: [...glyph].slice(0, 2).join(""),
      swatch: SWATCHES.has(raw.swatch) ? raw.swatch : "vanilla",
      method: cleanString(raw.method, LIMITS.method),
      ingredients,
      customBase: customBase && customBase.length ? customBase : null,
    },
  };
}
