// The review queue, as one self-contained page. No build step, no framework,
// no dependencies — it has to work from a phone with nothing installed.
//
// The token is typed in and held in memory only; it is never stored.

import { ICON_SOURCE } from "./iconSource.js";

export const ADMIN_PAGE = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Spin It — review</title>
<style>
  :root { --ground:#2B3AF0; --card:#FFF7E8; --ink:#15104A; --pop:#FFD426; --dim:#B9C0FF; --muted:#5F5A93; }
  * { box-sizing:border-box }
  body { margin:0; background:var(--ground); color:#FFF6E3;
         font:16px/1.5 ui-rounded,-apple-system,system-ui,sans-serif; padding:20px; max-width:760px; margin:0 auto }
  h1 { font-size:30px; margin:0 0 2px }
  p.sub { color:var(--dim); margin:0 0 18px }
  input, button, select, textarea { font:inherit; border-radius:12px; border:2px solid var(--ink); padding:9px 12px }
  input, select, textarea { width:100%; background:var(--card); color:var(--ink); margin-bottom:8px }
  textarea { min-height:70px; resize:vertical }
  button { background:var(--pop); color:var(--ink); font-weight:700; cursor:pointer;
           box-shadow:0 3px 0 rgba(0,0,0,.35); margin:0 }
  button.ghost { background:transparent; color:#FFF6E3; border-color:var(--dim); box-shadow:none }
  /* ghost buttons inside a cream card were cream-on-cream — invisible */
  .card button.ghost { color:var(--muted); border-color:var(--muted) }
  button.small { padding:5px 10px; font-size:14px; box-shadow:0 2px 0 rgba(0,0,0,.3) }
  .bar { display:flex; gap:8px; align-items:flex-start; margin-bottom:16px }
  .bar input, .bar select { margin-bottom:0 }
  .card { background:var(--card); color:var(--ink); border:2px solid var(--ink); border-radius:18px;
          padding:15px; margin-bottom:13px; box-shadow:0 4px 0 rgba(0,0,0,.35) }
  .card h2 { margin:0 0 2px; font-size:20px }
  .by { color:var(--muted); font-size:14px; margin-bottom:9px }
  ul { margin:0 0 10px; padding-left:19px }
  li { margin-bottom:2px }
  .row { display:flex; gap:8px; flex-wrap:wrap }
  .ing { display:grid; grid-template-columns:1fr 68px 92px 96px 34px; gap:6px; margin-bottom:10px }
  .ing input, .ing select { margin-bottom:0 }
  .ing .i-note { grid-column:1 / 4 }
  .ing .opt { grid-column:4 / 6; align-self:center; font-size:13px; color:var(--muted); font-weight:700 }
  .ing .opt input { width:auto; margin:0 4px 0 0; vertical-align:-2px }
  .lbl { font-size:13px; color:var(--muted); font-weight:700; margin:10px 0 4px }
  .empty { color:var(--dim); padding:28px 0; text-align:center }
  .pill { font-size:12px; font-weight:700; background:var(--ink); color:var(--pop);
          border-radius:999px; padding:2px 9px; margin-left:6px; vertical-align:2px }
  @media (max-width:560px) { .ing { grid-template-columns:1fr 60px 1fr 34px } .ing .role { grid-column:1/-1 } }
  .ico { fill:none; stroke:var(--ink); stroke-linecap:round; stroke-linejoin:round;
         stroke-width:2.5; width:100%; height:100% }
  .ico .dot { stroke-width:3.4 }
  .ico .body { fill:var(--accent, currentColor); fill-opacity:.9 }
  .ico .part { fill:var(--pc, currentColor) }
  .ico-wrap { display:grid; place-items:center; width:30px; height:30px }
  .icogrid { display:flex; flex-direction:column; gap:6px; max-height:200px; overflow-y:auto;
             background:rgba(21,16,74,.05); border-radius:12px; padding:6px; margin-bottom:8px }
  .icogroup { display:grid; grid-template-columns:repeat(auto-fill, minmax(42px, 1fr)); gap:5px }
  .icobtn { padding:4px; border-radius:10px; border:2px solid transparent; background:transparent;
            cursor:pointer; display:grid; place-items:center; box-shadow:none; margin:0 }
  .icobtn[data-on='1'] { border-color:var(--ink); background:#fff; box-shadow:0 2px 0 var(--ink) }
</style>

<h1>Review queue</h1>
<p class="sub">Nothing reaches the catalogue until you approve it. Changes show up in the app within about five minutes.</p>

<input id="token" type="password" placeholder="Admin token" autocomplete="current-password">
<div class="bar">
  <select id="status" onchange="load()">
    <option value="pending">Pending</option>
    <option value="approved">Approved</option>
    <option value="rejected">Rejected</option>
    <option value="tips">Spin tips</option>
  </select>
  <button onclick="load()">Load</button>
  <button class="ghost" onclick="startNew()">New</button>
</div>
<div class="card" id="tipscard" style="display:none">
  <h2>Spin tips</h2>
  <div class="by">One tip per line. These show on the app's Spin tips tab within about five minutes.</div>
  <textarea id="tips-box" style="min-height:110px">Loading…</textarea>
  <div class="row">
    <button class="small" onclick="saveTips()">Save tips</button>
    <span class="by" id="tips-msg" style="align-self:center;margin:0"></span>
  </div>
</div>

<div id="out"></div>

<script>
${ICON_SOURCE}
</script>

<script>
var CACHE = {};

var UNITS = ["whole","grams","milliliters","teaspoons","tablespoons","cups","pinch","drops","scoops","toTaste"];
var UNIT_LABEL = { whole:"—", grams:"g", milliliters:"ml", teaspoons:"tsp", tablespoons:"tbsp",
                   cups:"cup", pinch:"pinch", drops:"drops", scoops:"scoop", toTaste:"to taste" };
var ROLES = ["base","flavour","mixIn","topping"];
var ROLE_LABEL = { base:"Base", flavour:"Flavour", mixIn:"Mix-in", topping:"Topping" };
var SWATCHES = ["mint","cocoa","banana","mango","vanilla","pumpkin","berry","matcha","olive","coffee","cherry","bubblegum","grape","lavender","blueberry","sky","charcoal","snow"];
var CATS = ["protein","cream","sorbet"];
var CAT_LABEL = { protein:"Protein / froyo", cream:"Ice cream", sorbet:"Sorbet" };

function esc(s) {
  return String(s === null || s === undefined ? "" : s)
    // Apostrophes matter: the edit form puts values into single-quoted
    // attributes, so "Amy's Banana" would otherwise break out of value='...'.
    .replace(/[&<>"']/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
    });
}
function token() { return document.getElementById("token").value.trim(); }
function headers() { return { "content-type":"application/json", authorization:"Bearer " + token() }; }

var TIPS_LOADED = false;
async function load() {
  var tipsMode = document.getElementById("status").value === "tips";
  document.getElementById("tipscard").style.display = tipsMode ? "" : "none";
  document.getElementById("out").style.display = tipsMode ? "none" : "";
  if (tipsMode) {
    if (!TIPS_LOADED) {
      TIPS_LOADED = true;
      fetch("/tips").then(function (r) { return r.json(); }).then(function (d) {
        document.getElementById("tips-box").value = (d.tips || []).join(NL);
      }).catch(function () { document.getElementById("tips-box").value = ""; });
    }
    return;
  }
  var status = document.getElementById("status").value;
  var out = document.getElementById("out");
  out.innerHTML = "<p class='empty'>Loading…</p>";
  var res = await fetch("/admin/pending?status=" + status, { headers: headers() });
  if (!res.ok) {
    out.innerHTML = "<p class='empty'>" + esc((await res.json()).error) + "</p>";
    return;
  }
  var data = await res.json();
  CACHE = {};
  data.submissions.forEach(function (s) { CACHE[s.id] = s; });
  if (!data.submissions.length) { out.innerHTML = "<p class='empty'>Nothing here.</p>"; return; }
  out.innerHTML = data.submissions.map(function (s) { return viewCard(s, status); }).join("");
}

function viewCard(s, status) {
  var allIng = (s.recipe.customBase || []).concat(s.recipe.ingredients || []);
  var ing = allIng.map(function (i) {
    var amount = fmtAmount(i.amount);
    var unit = i.unit === "whole" ? "" : (UNIT_LABEL[i.unit] || i.unit);
    var measure = [amount, unit].filter(Boolean).join(" ");
    return "<li>" + (measure ? "<b>" + esc(measure) + "</b> " : "") + esc(i.name) +
      " <span class='pill'>" + esc(ROLE_LABEL[i.role] || i.role) + "</span>" +
      (i.note ? "<br><i>" + esc(i.note) + "</i>" : "") + "</li>";
  }).join("");

  var actions = "<div class='row'>";
  if (status === "pending") {
    actions += "<button class='small' onclick=\\"decide('" + s.id + "','approved')\\">Approve</button>";
    actions += "<button class='small ghost' onclick=\\"decide('" + s.id + "','rejected')\\">Reject</button>";
  } else if (status === "approved") {
    actions += "<button class='small ghost' onclick=\\"decide('" + s.id + "','rejected')\\">Unpublish</button>";
  } else {
    actions += "<button class='small' onclick=\\"decide('" + s.id + "','approved')\\">Publish</button>";
  }
  actions += "<button class='small ghost' onclick=\\"startEdit('" + s.id + "')\\">Edit</button></div>";

  return "<div class='card' id='card-" + s.id + "'>" +
    "<h2>" + esc(s.recipe.glyph) + " " + esc(s.name) + "</h2>" +
    "<div class='by'>by " + esc(s.author) + " · " + new Date(s.createdAt).toLocaleDateString() +
      " · <b>" + esc(CAT_LABEL[s.recipe.category] || "Ice cream") + "</b>" +
      " · icon: <b>" + esc(s.recipe.icon || "emoji") + "</b>" +
      " · <b>" + (s.recipe.customBase && s.recipe.customBase.length ? "custom" : "classic") + "</b> base</div>" +
    "<ul>" + ing + "</ul>" +
    (s.recipe.method ? "<p>" + esc(s.recipe.method) + "</p>" : "") +
    actions + "</div>";
}

// MARK: editing

function startEdit(id) {
  var s = CACHE[id];
  if (!s) return;
  document.getElementById("card-" + id).outerHTML = editForm(id, s.recipe);
}

function startNew() {
  if (!token()) { alert("Paste your admin token first."); return; }
  var blank = { name:"", author:"", glyph:"🍨", swatch:"vanilla", category:"cream", method:"",
                icon:null, customBase:null,
                ingredients:[{ name:"", amount:null, unit:"whole", role:"flavour", note:"", isOptional:false }] };
  document.getElementById("out").insertAdjacentHTML("afterbegin", editForm("new", blank));
}

function editForm(id, r) {
  var rows = r.ingredients.map(function (i, n) { return ingRow(id, n, i, false); }).join("");
  var baseRows = (r.customBase || []).map(function (i, n) { return ingRow(id, n, i, true); }).join("");
  return "<div class='card' id='edit-" + id + "'>" +
    "<div class='lbl'>Name</div><input id='f-name-" + id + "' value='" + esc(r.name) + "'>" +
    "<div class='row'>" +
      "<div style='flex:1'><div class='lbl'>Author</div><input id='f-author-" + id + "' value='" + esc(r.author) + "'></div>" +
      "<div style='width:90px'><div class='lbl'>Emoji</div><input id='f-glyph-" + id + "' value='" + esc(r.glyph) + "'></div>" +
    "</div>" +
    "<div class='lbl'>Icon (tap to pick, tap again to clear · wins over the emoji)</div>" +
    "<input type='hidden' id='f-icon-" + id + "' value='" + esc(r.icon || "") + "'>" +
    "<div class='icogrid' id='f-icongrid-" + id + "'>" + iconGrid(id, r.icon || "") + "</div>" +
    "<div class='lbl'>Category</div><select id='f-cat-" + id + "'>" +
      CATS.map(function (c) {
        return "<option value='" + c + "'" + (c === (r.category || "cream") ? " selected" : "") + ">" + CAT_LABEL[c] + "</option>";
      }).join("") + "</select>" +
    "<div class='lbl'>Colour</div><select id='f-swatch-" + id + "'>" +
      SWATCHES.map(function (s) {
        return "<option value='" + s + "'" + (s === r.swatch ? " selected" : "") + ">" + s + "</option>";
      }).join("") + "</select>" +
    "<div class='lbl'>Method</div><textarea id='f-method-" + id + "'>" + esc(r.method) + "</textarea>" +
    "<div class='lbl'>Custom base (leave empty to use the classic base)</div>" +
    "<div class='row' style='margin-bottom:6px'>" +
      "<select id='f-basepre-" + id + "' style='flex:1;min-width:200px;margin-bottom:0'>" +
        "<option value=''>Start from a saved base…</option>" +
        Object.keys(BASE_PRESETS).map(function (k) {
          return "<option value='" + k + "'>" + BASE_PRESETS[k].label + "</option>";
        }).join("") + "</select>" +
      "<button type='button' class='small ghost' onclick=\\"applyBasePreset('" + id + "')\\">Apply</button>" +
    "</div>" +
    "<div id='f-base-" + id + "'>" + baseRows + "</div>" +
    "<button class='small ghost' onclick=\\"addIng('" + id + "', true)\\">+ base ingredient</button>" +
    "<div class='lbl'>Ingredients</div><div id='f-ings-" + id + "'>" + rows + "</div>" +
    "<button class='small ghost' onclick=\\"addIng('" + id + "', false)\\">+ ingredient</button>" +
    "<div class='row' style='margin-top:12px'>" +
      "<button onclick=\\"saveEdit('" + id + "')\\">Save</button>" +
      "<button class='ghost' onclick=\\"load()\\">Cancel</button>" +
    "</div></div>";
}

// Amy's saved bases. Applying one fills the custom-base rows; edit from there.
var BASE_PRESETS = {
  classic: { label: "Classic base", ings: [
    { name:"Milk", amount:400, unit:"milliliters", role:"base", note:"", isOptional:false },
    { name:"Sugar, monk fruit, or any sweetener", amount:40, unit:"grams", role:"base", note:"", isOptional:false },
    { name:"Salt", amount:null, unit:"pinch", role:"base", note:"", isOptional:false },
    { name:"Xanthan gum", amount:0.25, unit:"teaspoons", role:"base", note:"", isOptional:false } ] },
  chocolate: { label: "Chocolate base", ings: [
    { name:"Fairlife chocolate protein shake (or equivalent)", amount:350, unit:"milliliters", role:"base", note:"", isOptional:false },
    { name:"Milk", amount:50, unit:"milliliters", role:"base", note:"", isOptional:false },
    { name:"Monkfruit sweetener or sugar", amount:20, unit:"grams", role:"base", note:"", isOptional:false },
    { name:"Dutch processed/dark cocoa powder", amount:15, unit:"grams", role:"base",
      note:"Doesn't have to be dutch processed, but it has a richer taste that works really well in this creami", isOptional:false },
    { name:"Xanthan gum", amount:0.25, unit:"teaspoons", role:"base", note:"", isOptional:false },
    { name:"Salt", amount:null, unit:"pinch", role:"base", note:"", isOptional:false } ] },
  icecream: { label: "Ice cream base", ings: [
    { name:"Milk", amount:125, unit:"milliliters", role:"base", note:"", isOptional:false },
    { name:"Heavy cream", amount:125, unit:"milliliters", role:"base", note:"", isOptional:false },
    { name:"Monkfruit sweetener or sugar", amount:40, unit:"grams", role:"base", note:"", isOptional:false },
    { name:"Salt", amount:null, unit:"pinch", role:"base", note:"", isOptional:false } ] },
  yogurt: { label: "Yogurt base", ings: [
    { name:"Plain Greek yogurt", amount:125, unit:"milliliters", role:"base", note:"", isOptional:false },
    { name:"Milk", amount:225, unit:"milliliters", role:"base", note:"", isOptional:false },
    { name:"Monkfruit sweetener or sugar", amount:35, unit:"grams", role:"base", note:"", isOptional:false },
    { name:"Salt", amount:null, unit:"pinch", role:"base", note:"", isOptional:false } ] }
};

function applyBasePreset(id) {
  var key = document.getElementById("f-basepre-" + id).value;
  if (!key || !BASE_PRESETS[key]) return;
  var box = document.getElementById("f-base-" + id);
  if (box.children.length && !confirm("Replace the current base rows with " + BASE_PRESETS[key].label + "?")) return;
  box.innerHTML = BASE_PRESETS[key].ings.map(function (i, n) { return ingRow(id, n, i, true); }).join("");
}

function iconGrid(id, current) {
  return GROUPS.map(function (g) {
    return "<div class='icogroup'>" + g[1].filter(function (k) { return FLAVOURS[k]; })
      .map(function (k) {
        return "<button type='button' class='icobtn' data-on='" + (k === current ? 1 : 0) +
          "' onclick=\\"pickIcon('" + id + "','" + k + "')\\" title='" + FLAVOURS[k].label + "'>" +
          iconMarkup(k) + "</button>";
      }).join("") + "</div>";
  }).join("");
}

function pickIcon(id, key) {
  var input = document.getElementById("f-icon-" + id);
  input.value = input.value === key ? "" : key;
  document.getElementById("f-icongrid-" + id).innerHTML = iconGrid(id, input.value);
}

function ingRow(id, n, i, isBase) {
  var roleCell = isBase
    ? "<span class='pill' style='align-self:center;justify-self:center'>Base</span>"
    : "<select class='i-role role'>" + ROLES.map(function (ro) {
        return "<option value='" + ro + "'" + (ro === i.role ? " selected" : "") + ">" + esc(ROLE_LABEL[ro]) + "</option>";
      }).join("") + "</select>";
  return "<div class='ing" + (isBase ? " base" : "") + "' data-row='" + n + "'>" +
    "<input placeholder='Ingredient' class='i-name' value='" + esc(i.name) + "'>" +
    "<input placeholder='qty' class='i-amt' value='" + fmtAmount(i.amount) + "'>" +
    "<select class='i-unit'>" + UNITS.map(function (u) {
      return "<option value='" + u + "'" + (u === i.unit ? " selected" : "") + ">" + esc(UNIT_LABEL[u]) + "</option>";
    }).join("") + "</select>" +
    roleCell +
    "<button class='small ghost' onclick='this.parentNode.remove()'>×</button>" +
    "<input placeholder='note (optional)' class='i-note' value='" + esc(i.note || "") + "'>" +
    "<label class='opt'><input type='checkbox' class='i-opt'" + (i.isOptional ? " checked" : "") + "> optional</label>" +
    "</div>";
}

function addIng(id, isBase) {
  var box = document.getElementById((isBase ? "f-base-" : "f-ings-") + id);
  box.insertAdjacentHTML("beforeend",
    ingRow(id, box.children.length, { name:"", amount:null, unit:"whole", role:(isBase ? "base" : "flavour"), note:"", isOptional:false }, isBase));
}

function readIngs(sel, forceBase) {
  var ings = [];
  document.querySelectorAll(sel + " .ing").forEach(function (row) {
    var name = row.querySelector(".i-name").value.trim();
    if (!name) return;
    var amount = parseAmount(row.querySelector(".i-amt").value);
    var roleSel = row.querySelector(".i-role");
    ings.push({
      name: name,
      amount: amount,
      unit: row.querySelector(".i-unit").value,
      role: forceBase ? "base" : (roleSel ? roleSel.value : "flavour"),
      note: row.querySelector(".i-note").value.trim(),
      isOptional: row.querySelector(".i-opt").checked
    });
  });
  return ings;
}

function collect(id) {
  // Start from the original and overwrite only what the form edits. Rebuilding
  // from the form is how icons and custom bases used to get silently wiped.
  var original = (CACHE[id] && CACHE[id].recipe) || {};
  var out = {};
  for (var k in original) out[k] = original[k];
  out.category = document.getElementById("f-cat-" + id).value;
  out.name = document.getElementById("f-name-" + id).value;
  out.author = document.getElementById("f-author-" + id).value;
  out.glyph = document.getElementById("f-glyph-" + id).value;
  out.swatch = document.getElementById("f-swatch-" + id).value;
  out.icon = document.getElementById("f-icon-" + id).value || null;
  out.method = document.getElementById("f-method-" + id).value;
  var baseIngs = readIngs("#f-base-" + id, true);
  out.customBase = baseIngs.length ? baseIngs : null;
  out.ingredients = readIngs("#f-ings-" + id, false);
  return out;
}

async function saveEdit(id) {
  var recipe = collect(id);
  var isNew = id === "new";
  var res = await fetch(isNew ? "/admin/create" : "/admin/edit", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(isNew ? { recipe: recipe, status: "approved" } : { id: id, recipe: recipe })
  });
  if (res.ok) { load(); } else { alert((await res.json()).error); }
}

var NL = String.fromCharCode(10);   // literal escapes do not survive the page template

async function saveTips() {
  if (!token()) { alert("Paste your admin token first."); return; }
  var tips = document.getElementById("tips-box").value
    .split(NL).map(function (t) { return t.trim(); }).filter(Boolean);
  var msg = document.getElementById("tips-msg");
  var res = await fetch("/admin/tips", { method: "POST", headers: headers(), body: JSON.stringify({ tips: tips }) });
  if (res.ok) { msg.textContent = "Saved ✓"; setTimeout(function () { msg.textContent = ""; }, 2500); }
  else { alert((await res.json()).error); }
}

async function decide(id, status) {
  // Rejecting pulls a recipe out of the catalogue, and the button sits right
  // next to Edit. One mis-tap should not quietly unpublish someone's recipe.
  if (status === "rejected") {
    var s = CACHE[id];
    var label = s ? s.name : "this recipe";
    if (!confirm("Take " + label + " out of the catalogue?")) return;
  }
  var res = await fetch("/admin/review", {
    method: "POST", headers: headers(), body: JSON.stringify({ id: id, status: status })
  });
  if (res.ok) { load(); } else { alert((await res.json()).error); }
}
</script>`;
