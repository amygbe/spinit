// The review queue, as one self-contained page. No build step, no framework,
// no dependencies — it has to work from a phone with nothing installed.
//
// The token is typed in and held in memory only; it is never stored.

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
  .ing { display:grid; grid-template-columns:1fr 68px 92px 96px 34px; gap:6px; margin-bottom:6px }
  .ing input, .ing select { margin-bottom:0 }
  .lbl { font-size:13px; color:var(--muted); font-weight:700; margin:10px 0 4px }
  .empty { color:var(--dim); padding:28px 0; text-align:center }
  .pill { font-size:12px; font-weight:700; background:var(--ink); color:var(--pop);
          border-radius:999px; padding:2px 9px; margin-left:6px; vertical-align:2px }
  @media (max-width:560px) { .ing { grid-template-columns:1fr 60px 1fr 34px } .ing .role { grid-column:1/-1 } }
</style>

<h1>Review queue</h1>
<p class="sub">Nothing reaches the catalogue until you approve it. Changes show up in the app within about five minutes.</p>

<input id="token" type="password" placeholder="Admin token" autocomplete="current-password">
<div class="bar">
  <select id="status">
    <option value="pending">Pending</option>
    <option value="approved">Approved</option>
    <option value="rejected">Rejected</option>
  </select>
  <button onclick="load()">Load</button>
  <button class="ghost" onclick="startNew()">New</button>
</div>
<div id="out"></div>

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

async function load() {
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
    var amount = i.amount === null || i.amount === undefined ? "" : i.amount;
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
      " · <b>" + esc(CAT_LABEL[s.recipe.category] || "Ice cream") + "</b></div>" +
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
                ingredients:[{ name:"", amount:null, unit:"whole", role:"flavour", note:"", isOptional:false }] };
  document.getElementById("out").insertAdjacentHTML("afterbegin", editForm("new", blank));
}

function editForm(id, r) {
  var rows = r.ingredients.map(function (i, n) { return ingRow(id, n, i); }).join("");
  return "<div class='card' id='edit-" + id + "'>" +
    "<div class='lbl'>Name</div><input id='f-name-" + id + "' value='" + esc(r.name) + "'>" +
    "<div class='row'>" +
      "<div style='flex:1'><div class='lbl'>Author</div><input id='f-author-" + id + "' value='" + esc(r.author) + "'></div>" +
      "<div style='width:90px'><div class='lbl'>Emoji</div><input id='f-glyph-" + id + "' value='" + esc(r.glyph) + "'></div>" +
    "</div>" +
    "<div class='lbl'>Category</div><select id='f-cat-" + id + "'>" +
      CATS.map(function (c) {
        return "<option value='" + c + "'" + (c === (r.category || "cream") ? " selected" : "") + ">" + CAT_LABEL[c] + "</option>";
      }).join("") + "</select>" +
    "<div class='lbl'>Colour</div><select id='f-swatch-" + id + "'>" +
      SWATCHES.map(function (s) {
        return "<option value='" + s + "'" + (s === r.swatch ? " selected" : "") + ">" + s + "</option>";
      }).join("") + "</select>" +
    "<div class='lbl'>Method</div><textarea id='f-method-" + id + "'>" + esc(r.method) + "</textarea>" +
    "<div class='lbl'>Ingredients</div><div id='f-ings-" + id + "'>" + rows + "</div>" +
    "<button class='small ghost' onclick=\\"addIng('" + id + "')\\">+ ingredient</button>" +
    "<div class='row' style='margin-top:12px'>" +
      "<button onclick=\\"saveEdit('" + id + "')\\">Save</button>" +
      "<button class='ghost' onclick=\\"load()\\">Cancel</button>" +
    "</div></div>";
}

function ingRow(id, n, i) {
  return "<div class='ing' data-row='" + n + "'>" +
    "<input placeholder='Ingredient' class='i-name' value='" + esc(i.name) + "'>" +
    "<input placeholder='qty' class='i-amt' value='" + (i.amount === null || i.amount === undefined ? "" : i.amount) + "'>" +
    "<select class='i-unit'>" + UNITS.map(function (u) {
      return "<option value='" + u + "'" + (u === i.unit ? " selected" : "") + ">" + esc(UNIT_LABEL[u]) + "</option>";
    }).join("") + "</select>" +
    "<select class='i-role role'>" + ROLES.map(function (ro) {
      return "<option value='" + ro + "'" + (ro === i.role ? " selected" : "") + ">" + esc(ROLE_LABEL[ro]) + "</option>";
    }).join("") + "</select>" +
    "<button class='small ghost' onclick='this.parentNode.remove()'>×</button>" +
    "</div>";
}

function addIng(id) {
  var box = document.getElementById("f-ings-" + id);
  box.insertAdjacentHTML("beforeend",
    ingRow(id, box.children.length, { name:"", amount:null, unit:"whole", role:"flavour", note:"", isOptional:false }));
}

function collect(id) {
  var ings = [];
  document.querySelectorAll("#f-ings-" + id + " .ing").forEach(function (row) {
    var name = row.querySelector(".i-name").value.trim();
    if (!name) return;
    var raw = row.querySelector(".i-amt").value.trim().replace(",", ".");
    var amount = raw === "" ? null : Number(raw);
    ings.push({
      name: name,
      amount: (amount === null || isNaN(amount)) ? null : amount,
      unit: row.querySelector(".i-unit").value,
      role: row.querySelector(".i-role").value,
      note: "",
      isOptional: false
    });
  });
  return {
    category: document.getElementById("f-cat-" + id).value,
    name: document.getElementById("f-name-" + id).value,
    author: document.getElementById("f-author-" + id).value,
    glyph: document.getElementById("f-glyph-" + id).value,
    swatch: document.getElementById("f-swatch-" + id).value,
    method: document.getElementById("f-method-" + id).value,
    ingredients: ings
  };
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
