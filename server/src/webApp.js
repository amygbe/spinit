// The web version of Churn — the full experience, reachable by anyone with a
// link, on any phone, with no App Store involved.
//
// Two halves, same split as the iOS app:
//   - Explore: the shared catalogue (Amy's approved + community), fetched from
//     this Worker, with submission into the review queue
//   - My recipes: recipes you saved or wrote, your ratings, notes and photos —
//     stored in the browser's localStorage, never uploaded unless you share
//
// One self-contained page on purpose: no build step, no framework. All event
// handling is delegated through data-act attributes, so no user content ever
// lands inside an inline handler.

export const WEB_APP = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Spin It — Ninja Creami recipes</title>
<meta name="description" content="A shelf of Ninja Creami recipes worth making twice.">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icon-180.png">
<link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png">
<meta name="theme-color" content="#2B3AF0">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Spin It">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sour+Gummy:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --ground:#2B3AF0; --on-ground:#FFF6E3; --on-dim:#B9C0FF;
    --card:#FFF7E8; --ink:#15104A; --ink-soft:#5A5490; --ink-mute:#5F5A93;
    --pop:#FFD426; --on-pop:#15104A; --line:rgba(21,16,74,.10);
    --display:"Sour Gummy", ui-rounded, -apple-system, system-ui, sans-serif;
    --body:ui-rounded, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    --bounce:cubic-bezier(.34,1.56,.64,1);
  }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent }
  html { background:var(--ground) }
  body {
    margin:0 auto; background:var(--ground); color:var(--on-ground);
    font-family:var(--body); font-weight:500; line-height:1.4;
    padding:max(14px, env(safe-area-inset-top)) 15px calc(26px + env(safe-area-inset-bottom));
    max-width:640px; -webkit-font-smoothing:antialiased;
  }
  body::before {
    content:""; position:fixed; inset:0; z-index:-1; pointer-events:none;
    background-image:
      radial-gradient(circle at 12% 18%, rgba(255,246,227,.15) 2.5px, transparent 2.6px),
      radial-gradient(circle at 68% 42%, rgba(255,246,227,.15) 2px, transparent 2.1px),
      radial-gradient(circle at 34% 76%, rgba(255,246,227,.15) 2.5px, transparent 2.6px),
      radial-gradient(circle at 88% 88%, rgba(255,246,227,.15) 2px, transparent 2.1px);
    background-size:190px 190px;
  }

  h1 { font-family:var(--display); font-size:32px; font-weight:700; margin:0; line-height:1.05 }
  .squiggle { display:block; width:98px; height:8px; margin:4px 0 0 }
  header.top { display:flex; align-items:center; gap:11px; margin-bottom:12px }
  header.top img { width:42px; height:42px; border-radius:12px; box-shadow:0 3px 0 rgba(0,0,0,.35) }

  .tabs { display:flex; gap:8px; margin-bottom:16px }
  .tab {
    flex:1; text-align:center; font-family:var(--display); font-size:16px; font-weight:700;
    padding:10px 8px; border-radius:15px; border:2px solid var(--on-dim);
    background:transparent; color:var(--on-ground); cursor:pointer;
  }
  .tab[data-on="1"] { background:var(--pop); color:var(--on-pop); border-color:var(--ink); box-shadow:0 4px 0 var(--ink) }

  button, input, select, textarea { font:inherit; font-family:var(--body) }
  .btn {
    background:var(--pop); color:var(--on-pop); border:2px solid var(--ink);
    border-radius:16px; padding:11px 16px; font-weight:700; font-size:15px;
    cursor:pointer; box-shadow:0 4px 0 var(--ink); transition:transform .18s var(--bounce), box-shadow .18s;
  }
  .btn:active { transform:translateY(4px); box-shadow:0 0 0 var(--ink) }
  .btn.wide { width:100%; font-family:var(--display); font-size:18px }
  .btn.ghost { background:transparent; color:var(--on-ground); border-color:var(--on-dim); box-shadow:none }
  .btn.small { padding:7px 13px; font-size:13.5px; border-radius:13px; box-shadow:0 3px 0 var(--ink) }
  .btn.ghost.small { box-shadow:none }
  .btn.danger { background:transparent; color:var(--on-dim); border-style:dashed; border-color:var(--on-dim); box-shadow:none }

  .group { font-size:14px; font-weight:800; color:var(--on-dim); margin:16px 0 8px; display:flex; align-items:center; gap:8px }
  .count { background:var(--pop); color:var(--on-pop); border-radius:999px; padding:1px 9px; font-size:11.5px; font-weight:800 }

  .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px }
  .scard {
    position:relative; display:flex; flex-direction:column; align-items:center; gap:7px;
    background:var(--card); color:var(--ink); border:2px solid var(--ink); border-radius:22px;
    padding:18px 10px 13px; min-height:138px; justify-content:center; cursor:pointer;
    box-shadow:0 5px 0 var(--ink); transition:transform .2s var(--bounce); text-align:center;
  }
  .scard:active { transform:translateY(4px) }
  .scard.untried { background:transparent; border-style:dashed; border-color:var(--on-dim); color:var(--on-ground); box-shadow:none }
  .scard .name { font-family:var(--display); font-size:16px; font-weight:700; line-height:1.15; overflow-wrap:anywhere }
  .scard .by { font-size:11px; color:var(--ink-mute); font-weight:600 }
  .scard.untried .by { color:var(--on-dim) }
  .badge {
    position:absolute; top:8px; right:9px; font-family:var(--display); font-weight:700;
    background:var(--pop); color:var(--on-pop); border-radius:999px; padding:1px 9px; font-size:14px;
  }
  .scard.untried .badge, .badge.dim { background:transparent; color:var(--on-dim); font-family:var(--body); font-size:10.5px; font-weight:700 }
  .scard .badge.dim { color:var(--ink-mute) }
  .scard.untried .badge.dim { color:var(--on-dim) }

  .tile {
    width:56px; height:56px; border-radius:18px; display:grid; place-items:center;
    font-size:27px; background:#fff; border:2px solid rgba(21,16,74,.2); flex:none; overflow:hidden;
  }
  .tile img { width:100%; height:100%; object-fit:cover; border-radius:inherit }

  /* ---------- compact recipe detail ---------- */
  .dethead { display:flex; align-items:center; gap:11px; margin:8px 0 2px }
  .dethead .tile { width:46px; height:46px; border-radius:15px; font-size:24px }
  h2.title { font-family:var(--display); font-size:24px; font-weight:700; margin:0; line-height:1.1; overflow-wrap:anywhere }
  .byline { color:var(--on-dim); font-size:12.5px; font-weight:600 }

  .raterow {
    display:flex; align-items:center; gap:10px; margin:10px 0;
    background:var(--card); color:var(--ink); border:2px solid var(--ink); border-radius:18px;
    padding:8px 13px; box-shadow:0 4px 0 var(--ink);
  }
  .raterow .lbl { font-size:13px; font-weight:800; color:var(--ink-mute) }
  .rbtn {
    width:38px; height:38px; border-radius:13px; border:2px solid var(--ink);
    background:var(--pop); color:var(--on-pop); font-size:21px; font-weight:800;
    cursor:pointer; line-height:1; box-shadow:0 3px 0 var(--ink); flex:none;
  }
  .rbtn:active { transform:translateY(3px); box-shadow:0 0 0 var(--ink) }
  .rate-num { font-family:var(--display); font-size:30px; font-weight:700; color:var(--ink);
              min-width:72px; text-align:center; font-variant-numeric:tabular-nums; flex:1 }
  .rate-num small { font-family:var(--body); font-size:12px; font-weight:700; color:var(--ink-mute) }
  .rate-num.none { font-size:15px; color:var(--ink-mute); font-family:var(--body); font-weight:700 }
  .clear-rate { background:none; border:none; color:var(--ink-mute); font-size:12px; text-decoration:underline; cursor:pointer; padding:2px; flex:none }

  /* each stage is its own sticker, so the ground shows between them */
  .panel { background:var(--card); color:var(--ink); border:2px solid var(--ink); border-radius:18px;
           padding:9px 14px 10px; box-shadow:0 4px 0 var(--ink); margin-bottom:12px }
  .sub { display:flex; align-items:baseline; gap:8px; font-family:var(--display); font-size:15px;
         font-weight:700; padding:2px 0 3px }
  .subhint { font-family:var(--body); font-size:11px; font-weight:600; color:var(--ink-mute) }
  .irow { display:flex; gap:10px; align-items:baseline; padding:3px 0; font-size:14px; font-weight:600 }
  .amt { font-weight:800; font-size:12px; color:var(--ink-soft); min-width:56px; text-align:right;
         font-variant-numeric:tabular-nums; flex:none }
  .opt { font-size:10.5px; color:var(--ink-mute) }
  .inote { font-size:11.5px; color:var(--ink-mute); font-weight:500 }
  .method { font-size:12.5px; color:var(--on-dim); margin:8px 2px 10px; line-height:1.45 }

  .adj { display:flex; gap:10px; align-items:center; background:var(--card); color:var(--ink);
         border:2px solid var(--pop); border-radius:14px; padding:8px 12px; margin-bottom:7px; cursor:pointer;
         box-shadow:0 3px 0 var(--ink); font-weight:600; font-size:13.5px }
  .adj.done { background:transparent; border-style:dashed; border-color:var(--on-dim); color:var(--on-dim); box-shadow:none }
  .adj.done .t { text-decoration:line-through }
  .adj .box { width:18px; height:18px; border-radius:6px; border:2.5px solid var(--pop); flex:none; display:grid; place-items:center; font-size:11px }
  .adj.done .box { border-color:var(--on-dim); background:var(--on-dim); color:var(--ground) }
  .adj .x { margin-left:auto; color:var(--ink-mute); border:0; background:none; font-size:16px; cursor:pointer; flex:none }
  .adj.done .x { color:var(--on-dim) }
  .addrow { display:flex; gap:8px; margin-top:2px }
  .addrow input { flex:1 }

  label { display:block; font-size:13px; font-weight:800; color:var(--on-dim); margin:13px 0 5px }
  input, select, textarea {
    width:100%; background:var(--card); color:var(--ink); border:2px solid var(--ink);
    border-radius:13px; padding:10px 12px; font-weight:600;
  }
  textarea { min-height:76px; resize:vertical }
  .ingrow { display:grid; grid-template-columns:1fr 60px 86px 32px; gap:6px; margin-bottom:6px }
  .ingrow input, .ingrow select { padding:8px 9px; border-radius:11px }
  .ingrow .rm { background:transparent; border:0; color:var(--on-dim); font-size:19px; cursor:pointer; width:auto }
  .rolerow { display:grid; grid-template-columns:1fr; margin-top:-1px; margin-bottom:6px }

  .swgrid { display:grid; grid-template-columns:repeat(6, 1fr); gap:9px; padding:3px 0 }
  .sw { aspect-ratio:1; width:100%; border-radius:14px; border:3px solid transparent; cursor:pointer; padding:0 }
  .sw[data-on="1"] { border-color:var(--on-ground); box-shadow:0 0 0 2px var(--ink) inset }

  .iconrow { display:flex; gap:10px; align-items:center }
  .iconrow input { width:82px; text-align:center }
  .photo-prev { width:52px; height:52px; border-radius:16px; overflow:hidden; border:2px solid var(--on-dim); flex:none; display:none }
  .photo-prev img { width:100%; height:100%; object-fit:cover }
  .filebtn { position:relative; overflow:hidden }
  .filebtn input[type=file] { position:absolute; inset:0; opacity:0; cursor:pointer }

  .basechips { display:flex; gap:8px }
  .chip {
    flex:1; text-align:center; font-weight:700; font-size:13.5px; padding:9px 8px;
    border-radius:13px; border:2px solid var(--on-dim); background:transparent;
    color:var(--on-ground); cursor:pointer;
  }
  .chip[data-on="1"] { background:var(--card); color:var(--ink); border-color:var(--ink); box-shadow:0 3px 0 var(--ink) }
  .basehint { font-size:11.5px; color:var(--on-dim); margin-top:5px }

  .actions { display:flex; flex-direction:column; gap:8px; margin-top:14px }
  .btnrow { display:flex; gap:8px; margin-top:12px }
  .btnrow .btn { flex:1; padding:10px 8px; font-size:13.5px }
  .msg { text-align:center; padding:40px 10px; color:var(--on-dim) }
  .msg .big { font-size:40px; display:block; margin-bottom:9px }
  .spin { display:inline-block; width:26px; height:26px; border:3px solid var(--on-dim); border-top-color:var(--pop); border-radius:50%; animation:sp .8s linear infinite }
  @keyframes sp { to { transform:rotate(360deg) } }

  .install {
    background:rgba(255,255,255,.10); border:2px dashed var(--on-dim); border-radius:16px;
    padding:11px 13px; font-size:13px; color:var(--on-ground); margin-top:20px;
  }
  .install b { color:var(--pop) }
  @media (display-mode: standalone) { .install { display:none } }
  @media (prefers-reduced-motion: reduce) { * { transition:none !important; animation:none !important } }
</style>

<div id="app"><div class="msg"><span class="spin"></span></div></div>

<script>
"use strict";
var KEY = "churn.shelf.v1";
var UNITS = ["whole","grams","milliliters","teaspoons","tablespoons","cups","pinch","drops","scoops","toTaste"];
var UNIT_LABEL = { whole:"", grams:"g", milliliters:"ml", teaspoons:"tsp", tablespoons:"tbsp", cups:"cup", pinch:"pinch", drops:"drops", scoops:"scoop", toTaste:"to taste" };
var ROLES = ["flavour","mixIn","topping"];
var ROLE_LABEL = { base:"Base", flavour:"Flavour", mixIn:"Mix-ins", topping:"Toppings" };
var ROLE_HINT = { base:"blend, then freeze 24h", flavour:"blend into the pint", mixIn:"fold in after the first spin", topping:"at the bowl" };
var SWATCH = {
  banana:"#FFC42E", vanilla:"#FF9F45", pumpkin:"#FF6B1A", mango:"#FF8C1A", cherry:"#E22B47",
  berry:"#E8336F", bubblegum:"#FF7BC1", grape:"#8B4DE8", lavender:"#B79CFF", blueberry:"#4353FF",
  sky:"#3BB8FF", mint:"#00D49B", matcha:"#86C232", olive:"#9BC72B", cocoa:"#B0632F",
  coffee:"#8B5E3C", charcoal:"#494A5A", snow:"#F2EDE4",
};

var CATS = ["protein", "cream", "sorbet"];
var CAT_LABEL = { protein: "Protein / froyo", cream: "Ice cream", sorbet: "Sorbet" };

var CLASSIC_BASE = [
  ["400 ml", "Fairlife 0% milk"],
  ["40 g", "Monk fruit sweetener"],
  ["pinch", "Salt"],
  ["¼ tsp", "Xanthan gum"],
];

var app = document.getElementById("app");
var CAT = null;
var FILTER = "all";
var VIEW = { name: "shelf" };
var EDIT = null;

function esc(s) {
  return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
  });
}

// ---------- personal storage ----------

function load() {
  try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.recipes) return d; } catch (e) {}
  return { recipes: [], logs: {} };
}
var DB = load();
function save() { localStorage.setItem(KEY, JSON.stringify(DB)); }
function recipeById(id) { return DB.recipes.find(function (r) { return r.id === id; }); }
function logFor(id) {
  if (!DB.logs[id]) DB.logs[id] = { rating: null, adjustments: [] };
  return DB.logs[id];
}
function tried(id) { return logFor(id).rating !== null; }

// ---------- shared bits ----------

var SQUIGGLE = '<svg class="squiggle" viewBox="0 0 104 9" preserveAspectRatio="none" aria-hidden="true">' +
  '<path d="M0 4.5 Q7.4 0 14.9 4.5 T29.7 4.5 T44.6 4.5 T59.4 4.5 T74.3 4.5 T89.1 4.5 T104 4.5" fill="none" stroke="#FFD426" stroke-width="3" stroke-linecap="round"/></svg>';

function tileHTML(r) {
  if (r.image) return '<span class="tile"><img src="' + r.image + '" alt=""></span>';
  var c = SWATCH[r.swatch] || SWATCH.vanilla;
  return '<span class="tile" style="background:color-mix(in srgb, ' + c +
    ' 26%, #FFF7E8); border-color:color-mix(in srgb, ' + c + ' 65%, #FFF7E8)">' + esc(r.glyph) + '</span>';
}

function header(tab) {
  return '<header class="top"><img src="/icon-180.png" alt=""><div><h1>Spin It</h1>' + SQUIGGLE + '</div></header>' +
    '<div class="tabs">' +
    '<button class="tab" data-act="nav-shelf" data-on="' + (tab === "shelf" ? 1 : 0) + '">My recipes</button>' +
    '<button class="tab" data-act="nav-cat" data-on="' + (tab === "cat" ? 1 : 0) + '">Explore</button>' +
    '</div>';
}

function fmtScore(v) { return v === Math.round(v) ? String(v) : v.toFixed(1); }

function measure(i) {
  var unit = UNIT_LABEL[i.unit] !== undefined ? UNIT_LABEL[i.unit] : "";
  if (i.amount === null || i.amount === undefined) return unit;
  return (i.amount + " " + unit).trim();
}

/// Each stage is its own sticker panel, so the ground shows between them.
function ingredientPanels(r) {
  function irow(amtText, name, note, optional) {
    return '<div class="irow"><span class="amt">' + esc(amtText) + '</span><span>' + esc(name) +
      (optional ? ' <span class="opt">optional</span>' : "") +
      (note ? ' <span class="inote">— ' + esc(note) + '</span>' : "") + '</span></div>';
  }
  function panel(title, hint, rowsHTML) {
    return '<div class="panel"><div class="sub">' + title + ' <span class="subhint">' + hint + '</span></div>' + rowsHTML + '</div>';
  }

  var html = "";
  if (r.customBase && r.customBase.length) {
    html += panel("Base", ROLE_HINT.base, r.customBase.map(function (i) {
      return irow(measure(i), i.name, i.note, i.isOptional);
    }).join(""));
  } else {
    html += panel("Classic base", ROLE_HINT.base, CLASSIC_BASE.map(function (p) {
      return irow(p[0], p[1], "", false);
    }).join(""));
  }
  ROLES.forEach(function (role) {
    var items = (r.ingredients || []).filter(function (i) { return i.role === role; });
    if (!items.length) return;
    html += panel(ROLE_LABEL[role], ROLE_HINT[role], items.map(function (i) {
      return irow(measure(i), i.name, i.note, i.isOptional);
    }).join(""));
  });
  return html;
}

// ---------- my recipes ----------

function renderShelf() {
  VIEW = { name: "shelf" };
  var madeList = DB.recipes.filter(function (r) { return tried(r.id); });
  var ideaList = DB.recipes.filter(function (r) { return !tried(r.id); });
  madeList.sort(function (a, b) { return (logFor(b.id).rating || 0) - (logFor(a.id).rating || 0); });

  function card(r) {
    var lg = logFor(r.id);
    var isTried = lg.rating !== null;
    return '<div class="scard' + (isTried ? "" : " untried") + '" data-act="open-local" data-id="' + r.id + '">' +
      '<span class="badge">' + (isTried ? fmtScore(lg.rating) : "not yet") + '</span>' +
      tileHTML(r) +
      '<span class="name">' + esc(r.name) + '</span></div>';
  }

  var body = "";
  if (!DB.recipes.length) {
    body = '<div class="msg"><span class="big">🍨</span>Nothing here yet.<br>' +
      'Write your own flavour, or save some from Explore.</div>';
  } else {
    if (madeList.length) body += '<div class="group">Tried &amp; true <span class="count">' + madeList.length + '</span></div>' +
      '<div class="grid">' + madeList.map(card).join("") + '</div>';
    if (ideaList.length) body += '<div class="group">On the list <span class="count">' + ideaList.length + '</span></div>' +
      '<div class="grid">' + ideaList.map(card).join("") + '</div>';
  }

  app.innerHTML = header("shelf") + body +
    '<div class="actions">' +
    '<button class="btn wide" data-act="new-recipe">+ New flavour</button>' +
    '</div>' +
    '<div class="install">📲 <b>Add it to your home screen:</b> tap Share, then <b>Add to Home Screen</b>. ' +
    'Your recipes, photos and ratings live on this device — nothing is shared unless you choose to.</div>';
  window.scrollTo(0, 0);
}

function showLocal(id) {
  var r = recipeById(id);
  if (!r) return renderShelf();
  VIEW = { name: "local", id: id };
  var lg = logFor(id);

  var rate = '<div class="raterow"><span class="lbl">Rating</span>' +
    '<button class="rbtn" data-act="rate-down">−</button>' +
    (lg.rating !== null
      ? '<span class="rate-num">' + fmtScore(lg.rating) + '<small> /10</small></span>'
      : '<span class="rate-num none">not yet — tap + </span>') +
    '<button class="rbtn" data-act="rate-up">+</button>' +
    (lg.rating !== null ? '<button class="clear-rate" data-act="clear-rate">clear</button>' : "") +
    '</div>';

  var open = lg.adjustments.filter(function (a) { return !a.done; }).length;
  var adjs = '<div class="group">Next time' + (open ? ' <span class="count">' + open + '</span>' : "") + '</div>' +
    lg.adjustments.map(function (a) {
      return '<div class="adj' + (a.done ? " done" : "") + '" data-act="adj-toggle" data-id="' + a.id + '">' +
        '<span class="box">' + (a.done ? "✓" : "") + '</span><span class="t">' + esc(a.text) + '</span>' +
        '<button class="x" data-act="adj-del" data-id="' + a.id + '">×</button></div>';
    }).join("") +
    '<div class="addrow"><input id="newadj" placeholder="Try Nilla Wafers…">' +
    '<button class="btn small" data-act="adj-add">Add</button></div>';

  app.innerHTML =
    '<button class="btn ghost small" data-act="nav-shelf">‹ My recipes</button>' +
    '<div class="dethead">' + tileHTML(r) +
    '<div><h2 class="title">' + esc(r.name) + '</h2>' +
    '<div class="byline">by ' + esc(r.author || "you") + '</div></div></div>' +
    rate +
    ingredientPanels(r) +
    (r.method ? '<div class="method">' + esc(r.method) + '</div>' : "") +
    adjs +
    '<div class="btnrow">' +
    '<button class="btn" data-act="edit" data-id="' + id + '">Edit</button>' +
    (r.origin === "mine"
      ? '<button class="btn ghost" data-act="share-open" data-id="' + id + '">' + (r.shared ? "Share again" : "Share") + '</button>'
      : "") +
    '<button class="btn danger" data-act="del-recipe" data-id="' + id + '">Remove</button>' +
    '</div>';
  window.scrollTo(0, 0);
}

// ---------- explore ----------

function renderCatalogue() {
  VIEW = { name: "cat" };
  if (CAT === null) {
    app.innerHTML = header("cat") + '<div class="msg"><span class="spin"></span></div>';
    fetch("/catalogue").then(function (res) {
      if (!res.ok) throw 0;
      return res.json();
    }).then(function (d) {
      CAT = d.recipes;
      if (VIEW.name === "cat") renderCatalogue();
    }).catch(function () {
      app.innerHTML = header("cat") +
        '<div class="msg"><span class="big">🌨️</span>Couldn&#39;t reach the catalogue.' +
        '<div style="margin-top:16px"><button class="btn" data-act="retry-cat">Try again</button></div></div>';
    });
    return;
  }

  function onShelf(w) {
    var nm = w.name.toLowerCase();
    return DB.recipes.some(function (r) { return r.id === w.id || r.name.toLowerCase() === nm; });
  }
  function card(w) {
    return '<div class="scard" data-act="open-remote" data-id="' + w.id + '">' +
      (onShelf(w) ? '<span class="badge dim">saved ✓</span>' : "") +
      tileHTML(w) +
      '<span class="name">' + esc(w.name) + '</span>' +
      '<span class="by">by ' + esc(w.author) + '</span></div>';
  }
  // Curated versus community comes from the server's origin field — how the
  // recipe got in, not what the author typed as their name.
  var pool = CAT.filter(function (w) {
    return FILTER === "all" || (w.category || "cream") === FILTER;
  });
  var chips = '<div class="basechips" style="margin-bottom:4px">' +
    ["all"].concat(CATS).map(function (c) {
      return '<button class="chip" data-act="filter-cat" data-id="' + c + '" data-on="' + (FILTER === c ? 1 : 0) + '">' +
        (c === "all" ? "All" : CAT_LABEL[c]) + '</button>';
    }).join("") + '</div>';
  var mine = pool.filter(function (w) { return w.origin !== "community"; });
  var rest = pool.filter(function (w) { return w.origin === "community"; });

  app.innerHTML = header("cat") + chips +
    (mine.length ? '<div class="group">Amy&#39;s approved <span class="count">' + mine.length + '</span></div>' +
      '<div class="grid">' + mine.map(card).join("") + '</div>' : "") +
    (rest.length ? '<div class="group">From the community <span class="count">' + rest.length + '</span></div>' +
      '<div class="grid">' + rest.map(card).join("") + '</div>' : "") +
    (pool.length ? "" : '<div class="msg"><span class="big">🍨</span>Nothing in this category yet.</div>') +
    '<div class="actions">' +
    '<button class="btn wide" data-act="share-pick">Share one of yours</button>' +
    '</div>';
  window.scrollTo(0, 0);
}

function showRemote(id) {
  var w = (CAT || []).find(function (x) { return x.id === id; });
  if (!w) return renderCatalogue();
  VIEW = { name: "remote", id: id };
  var already = DB.recipes.some(function (r) {
    return r.id === w.id || r.name.toLowerCase() === w.name.toLowerCase();
  });

  app.innerHTML =
    '<button class="btn ghost small" data-act="nav-cat">‹ Explore</button>' +
    '<div class="dethead">' + tileHTML(w) +
    '<div><h2 class="title">' + esc(w.name) + '</h2>' +
    '<div class="byline">by ' + esc(w.author) + '</div></div></div>' +
    '<div style="height:8px"></div>' +
    ingredientPanels(w) +
    (w.method ? '<div class="method">' + esc(w.method) + '</div>' : "") +
    '<div class="actions"><button class="btn wide" data-act="add-shelf" data-id="' + id + '"' +
    (already ? " disabled style='opacity:.55'" : "") + '>' +
    (already ? "Saved to My recipes ✓" : "Save to My recipes") + '</button></div>';
  window.scrollTo(0, 0);
}

/// Pick one of your own creations to submit.
function showSharePicker() {
  VIEW = { name: "sharepick" };
  var mine = DB.recipes.filter(function (r) { return r.origin === "mine"; });
  var body;
  if (!mine.length) {
    body = '<div class="msg"><span class="big">✏️</span>Nothing of yours to share yet.<br>' +
      'Write a flavour first — sharing is always optional.' +
      '<div style="margin-top:16px"><button class="btn" data-act="new-recipe">+ New flavour</button></div></div>';
  } else {
    body = '<div class="group">Which one?</div><div class="grid">' + mine.map(function (r) {
      return '<div class="scard" data-act="share-open" data-id="' + r.id + '">' +
        (r.shared ? '<span class="badge dim">sent ✓</span>' : "") +
        tileHTML(r) + '<span class="name">' + esc(r.name) + '</span></div>';
    }).join("") + '</div>';
  }
  app.innerHTML = '<button class="btn ghost small" data-act="nav-cat">‹ Explore</button>' +
    '<h2 class="title" style="margin-top:8px">Share a recipe</h2>' + SQUIGGLE +
    '<div class="byline" style="margin:6px 0 4px">Amy reads every submission before it appears.</div>' + body;
  window.scrollTo(0, 0);
}

// ---------- editor ----------

function showEditor(id) {
  var r = id ? recipeById(id) : null;
  EDIT = r ? JSON.parse(JSON.stringify(r))
           : { id: crypto.randomUUID(), name: "", glyph: "🍨", swatch: "vanilla", image: null,
               category: "cream", method: "", ingredients: [], customBase: null, origin: "mine",
               author: localStorage.getItem("churnName") || "" };
  if (!EDIT.category) EDIT.category = "cream";
  if (!EDIT.ingredients.length) EDIT.ingredients.push({ name: "", amount: null, unit: "whole", role: "flavour" });
  EDIT.baseMode = EDIT.customBase && EDIT.customBase.length ? "custom" : "classic";
  if (!EDIT.customBase || !EDIT.customBase.length) EDIT.customBase = [{ name: "", amount: null, unit: "whole", role: "base" }];
  VIEW = { name: "editor", id: id };

  var sw = Object.keys(SWATCH).map(function (k) {
    return '<button class="sw" data-act="pick-swatch" data-id="' + k + '" data-on="' + (EDIT.swatch === k ? 1 : 0) +
      '" style="background:' + SWATCH[k] + '" aria-label="' + k + '"></button>';
  }).join("");

  app.innerHTML =
    '<button class="btn ghost small" data-act="cancel-edit">‹ Cancel</button>' +
    '<h2 class="title" style="margin-top:8px">' + (id ? "Edit recipe" : "New flavour") + '</h2>' + SQUIGGLE +
    '<label for="e-name">Name</label><input id="e-name" placeholder="Cookie Dough" value="' + esc(EDIT.name) + '">' +

    '<label>Icon — emoji, or your own photo</label>' +
    '<div class="iconrow">' +
    '<input id="e-glyph" value="' + esc(EDIT.glyph) + '">' +
    '<span class="photo-prev" id="photo-prev"' + (EDIT.image ? ' style="display:block"' : "") + '>' +
    (EDIT.image ? '<img src="' + EDIT.image + '">' : "") + '</span>' +
    '<button class="btn ghost small filebtn" type="button">📷 Photo<input type="file" id="e-photo" accept="image/*"></button>' +
    (EDIT.image ? '<button class="btn ghost small" data-act="photo-clear">✕</button>' : "") +
    '</div>' +

    '<label>Category</label>' +
    '<div class="basechips">' + CATS.map(function (c) {
      return '<button class="chip" data-act="pick-cat" data-id="' + c + '" data-on="' + (EDIT.category === c ? 1 : 0) + '">' + CAT_LABEL[c] + '</button>';
    }).join("") + '</div>' +
    '<label>Colour</label><div class="swgrid">' + sw + '</div>' +

    '<label>Base</label>' +
    '<div class="basechips">' +
    '<button class="chip" data-act="base-mode" data-id="classic" data-on="' + (EDIT.baseMode === "classic" ? 1 : 0) + '">Classic base</button>' +
    '<button class="chip" data-act="base-mode" data-id="custom" data-on="' + (EDIT.baseMode === "custom" ? 1 : 0) + '">My own base</button>' +
    '</div>' +
    '<div id="basebox" style="' + (EDIT.baseMode === "custom" ? "" : "display:none") + '">' +
    '<div class="basehint">Anything goes — chocolate Fairlife, Greek yogurt, watermelon and Sprite…</div>' +
    '<div style="height:7px"></div>' +
    '<div id="bings">' + EDIT.customBase.map(baseRowHTML).join("") + '</div>' +
    '<button class="btn ghost small" data-act="add-bing">+ base ingredient</button>' +
    '</div>' +
    '<div class="basehint" id="classichint" style="' + (EDIT.baseMode === "classic" ? "" : "display:none") + '">' +
    '400 ml Fairlife 0% milk · 40 g monk fruit · pinch of salt · ¼ tsp xanthan gum</div>' +

    '<label for="e-method">How do you make it?</label>' +
    '<textarea id="e-method" placeholder="Blend, freeze 24h, spin on Lite Ice Cream…">' + esc(EDIT.method) + '</textarea>' +
    '<label>Flavour, mix-ins &amp; toppings</label><div id="ings">' + EDIT.ingredients.map(ingRowHTML).join("") + '</div>' +
    '<button class="btn ghost small" data-act="add-ing">+ ingredient</button>' +
    '<div class="actions"><button class="btn wide" data-act="save-recipe">Save to My recipes</button></div>' +
    '<div class="basehint" style="margin-top:8px">Saving is private. Sharing to the community is a separate step, and photos never leave your device.</div>';
  window.scrollTo(0, 0);
}

function baseRowHTML(i) {
  var opts = UNITS.map(function (u) {
    return '<option value="' + u + '"' + (u === i.unit ? " selected" : "") + '>' + (UNIT_LABEL[u] || "—") + '</option>';
  }).join("");
  return '<div class="ingrow">' +
    '<input class="b-name" placeholder="Chocolate Fairlife" value="' + esc(i.name) + '">' +
    '<input class="b-amt" placeholder="qty" inputmode="decimal" value="' + (i.amount === null || i.amount === undefined ? "" : i.amount) + '">' +
    '<select class="b-unit">' + opts + '</select>' +
    '<button class="rm" data-act="rm-row">×</button>' +
    '</div>';
}

function ingRowHTML(i) {
  var opts = UNITS.map(function (u) {
    return '<option value="' + u + '"' + (u === i.unit ? " selected" : "") + '>' + (UNIT_LABEL[u] || "—") + '</option>';
  }).join("");
  var ropts = ROLES.map(function (ro) {
    return '<option value="' + ro + '"' + (ro === i.role ? " selected" : "") + '>' + ROLE_LABEL[ro] + '</option>';
  }).join("");
  return '<div class="ingrow">' +
    '<input class="i-name" placeholder="Ingredient" value="' + esc(i.name) + '">' +
    '<input class="i-amt" placeholder="qty" inputmode="decimal" value="' + (i.amount === null || i.amount === undefined ? "" : i.amount) + '">' +
    '<select class="i-unit">' + opts + '</select>' +
    '<button class="rm" data-act="rm-row">×</button>' +
    '</div><div class="rolerow"><select class="i-role">' + ropts + '</select></div>';
}

function collectRows(box, prefix, role) {
  var out = [];
  var names = box.querySelectorAll("." + prefix + "-name");
  var amts = box.querySelectorAll("." + prefix + "-amt");
  var units = box.querySelectorAll("." + prefix + "-unit");
  var roles = box.querySelectorAll(".i-role");
  for (var k = 0; k < names.length; k++) {
    var nm = names[k].value.trim();
    if (!nm) continue;
    var raw = amts[k].value.trim().replace(",", ".");
    var amount = raw === "" ? null : Number(raw);
    out.push({
      name: nm,
      amount: amount === null || isNaN(amount) ? null : amount,
      unit: units[k].value,
      role: role || (roles[k] ? roles[k].value : "flavour"),
    });
  }
  return out;
}

/// Square-crop and shrink a photo so it stores comfortably in localStorage.
function loadPhoto(file) {
  var rd = new FileReader();
  rd.onload = function () {
    var im = new Image();
    im.onload = function () {
      var c = document.createElement("canvas");
      var s = 112;
      c.width = s; c.height = s;
      var g = c.getContext("2d");
      var m = Math.min(im.width, im.height);
      g.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, s, s);
      EDIT.image = c.toDataURL("image/jpeg", 0.82);
      var pv = document.getElementById("photo-prev");
      pv.style.display = "block";
      pv.innerHTML = '<img src="' + EDIT.image + '">';
    };
    im.src = rd.result;
  };
  rd.readAsDataURL(file);
}

// ---------- sharing ----------

function showShare(id) {
  var r = recipeById(id);
  if (!r) return renderShelf();
  VIEW = { name: "share", id: id };
  app.innerHTML =
    '<button class="btn ghost small" data-act="open-local" data-id="' + id + '">‹ Back</button>' +
    '<h2 class="title" style="margin-top:8px">Share ' + esc(r.name) + '</h2>' + SQUIGGLE +
    '<div class="byline" style="margin-top:6px">Amy reads every submission before it appears. Your rating and notes stay on this device' +
    (r.image ? ", and photos stay here too — the community sees your emoji" : "") + '.</div>' +
    '<label for="s-author">Your name</label>' +
    '<input id="s-author" placeholder="What the credit should say" value="' + esc(localStorage.getItem("churnName") || "") + '">' +
    '<div class="actions"><button class="btn wide" id="send" data-act="share-send" data-id="' + id + '">Send for review</button></div>' +
    '<div id="result" style="margin-top:12px"></div>';
  window.scrollTo(0, 0);
}

function shareSend(id) {
  var r = recipeById(id);
  var author = document.getElementById("s-author").value.trim();
  var out = document.getElementById("result");
  if (!author) { out.innerHTML = '<div class="panel">Add your name so you get the credit.</div>'; return; }
  var btn = document.getElementById("send");
  btn.disabled = true; btn.textContent = "Sending…";
  var body = { name: r.name, author: author, glyph: r.glyph, swatch: r.swatch,
               category: r.category || "cream", method: r.method, ingredients: r.ingredients };
  if (r.customBase && r.customBase.length) body.customBase = r.customBase;
  fetch("/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, d: d }; }); })
    .then(function (x) {
      if (x.ok) {
        localStorage.setItem("churnName", author);
        r.shared = true; save();
        app.innerHTML = '<div class="msg"><span class="big">💌</span>Sent! It&#39;ll show up once Amy approves it.' +
          '<div style="margin-top:18px"><button class="btn" data-act="open-local" data-id="' + id + '">Back to the recipe</button></div></div>';
      } else {
        out.innerHTML = '<div class="panel">' + esc(x.d.error || "That didn&#39;t work.") + '</div>';
        btn.disabled = false; btn.textContent = "Send for review";
      }
    })
    .catch(function () {
      out.innerHTML = '<div class="panel">Couldn&#39;t reach the catalogue. Check your connection.</div>';
      btn.disabled = false; btn.textContent = "Send for review";
    });
}

// ---------- events ----------

function nudgeRating(delta) {
  var lg = logFor(VIEW.id);
  if (lg.rating === null) lg.rating = 8;
  else lg.rating = Math.max(0, Math.min(10, lg.rating + delta));
  save(); showLocal(VIEW.id);
}

app.addEventListener("change", function (e) {
  if (e.target.id === "e-photo" && e.target.files && e.target.files[0]) loadPhoto(e.target.files[0]);
});

app.addEventListener("click", function (e) {
  var el = e.target.closest("[data-act]");
  if (!el) return;
  var act = el.getAttribute("data-act");
  var id = el.getAttribute("data-id");

  if (act === "nav-shelf") renderShelf();
  else if (act === "nav-cat" || act === "retry-cat") { if (act === "retry-cat") CAT = null; renderCatalogue(); }
  else if (act === "open-local") showLocal(id);
  else if (act === "open-remote") showRemote(id);
  else if (act === "new-recipe") showEditor(null);
  else if (act === "edit") showEditor(id);
  else if (act === "cancel-edit") { EDIT = null; renderShelf(); }
  else if (act === "pick-cat") {
    EDIT.category = id;
    document.querySelectorAll('[data-act="pick-cat"]').forEach(function (b) {
      b.setAttribute("data-on", b.getAttribute("data-id") === id ? "1" : "0");
    });
  }
  else if (act === "filter-cat") { FILTER = id; renderCatalogue(); }
  else if (act === "pick-swatch") {
    EDIT.swatch = id;
    document.querySelectorAll(".sw").forEach(function (b) {
      b.setAttribute("data-on", b.getAttribute("data-id") === id ? "1" : "0");
    });
  }
  else if (act === "photo-clear") {
    EDIT.image = null;
    var pv = document.getElementById("photo-prev");
    pv.style.display = "none"; pv.innerHTML = "";
    el.remove();
  }
  else if (act === "base-mode") {
    // keep whatever's typed before flipping the panels
    EDIT.customBase = collectRows(document.getElementById("bings"), "b", "base");
    if (!EDIT.customBase.length) EDIT.customBase = [{ name: "", amount: null, unit: "whole", role: "base" }];
    EDIT.baseMode = id;
    document.querySelectorAll(".chip").forEach(function (b) {
      b.setAttribute("data-on", b.getAttribute("data-id") === id ? "1" : "0");
    });
    document.getElementById("basebox").style.display = id === "custom" ? "" : "none";
    document.getElementById("classichint").style.display = id === "classic" ? "" : "none";
  }
  else if (act === "add-bing") {
    document.getElementById("bings").insertAdjacentHTML("beforeend",
      baseRowHTML({ name: "", amount: null, unit: "whole", role: "base" }));
  }
  else if (act === "add-ing") {
    document.getElementById("ings").insertAdjacentHTML("beforeend",
      ingRowHTML({ name: "", amount: null, unit: "whole", role: "flavour" }));
  }
  else if (act === "rm-row") {
    var row = el.closest(".ingrow");
    var roleRow = row.nextElementSibling;
    if (roleRow && roleRow.classList.contains("rolerow")) roleRow.remove();
    row.remove();
  }
  else if (act === "save-recipe") {
    EDIT.name = document.getElementById("e-name").value.trim();
    EDIT.glyph = document.getElementById("e-glyph").value.trim() || "🍨";
    EDIT.method = document.getElementById("e-method").value.trim();
    EDIT.ingredients = collectRows(document.getElementById("ings"), "i", null);
    EDIT.customBase = EDIT.baseMode === "custom"
      ? collectRows(document.getElementById("bings"), "b", "base")
      : null;
    if (EDIT.customBase && !EDIT.customBase.length) EDIT.customBase = null;
    if (!EDIT.name) { alert("Give it a name first."); return; }
    if (!EDIT.ingredients.length && !(EDIT.customBase && EDIT.customBase.length)) {
      alert("Add at least one ingredient."); return;
    }
    delete EDIT.baseMode;
    var ix = DB.recipes.findIndex(function (r) { return r.id === EDIT.id; });
    if (ix >= 0) DB.recipes[ix] = EDIT; else DB.recipes.push(EDIT);
    save();
    var doneID = EDIT.id; EDIT = null;
    showLocal(doneID);
  }
  else if (act === "del-recipe") {
    var r = recipeById(id);
    if (r && confirm("Remove " + r.name + " from My recipes? Your rating and notes for it go too.")) {
      DB.recipes = DB.recipes.filter(function (x) { return x.id !== id; });
      delete DB.logs[id];
      save(); renderShelf();
    }
  }
  else if (act === "add-shelf") {
    var w = (CAT || []).find(function (x) { return x.id === id; });
    if (!w) return;
    DB.recipes.push({ id: w.id, name: w.name, glyph: w.glyph, swatch: w.swatch, image: null,
      method: w.method || "", ingredients: w.ingredients, customBase: w.customBase || null,
      origin: "saved", author: w.author });
    save(); showRemote(id);
  }
  else if (act === "rate-up") nudgeRating(0.5);
  else if (act === "rate-down") nudgeRating(-0.5);
  else if (act === "clear-rate") { logFor(VIEW.id).rating = null; save(); showLocal(VIEW.id); }
  else if (act === "adj-toggle") {
    if (e.target.closest("[data-act='adj-del']")) return;
    var lg = logFor(VIEW.id);
    var a = lg.adjustments.find(function (x) { return x.id === id; });
    if (a) { a.done = !a.done; save(); showLocal(VIEW.id); }
  }
  else if (act === "adj-del") {
    e.stopPropagation();
    var lg2 = logFor(VIEW.id);
    lg2.adjustments = lg2.adjustments.filter(function (x) { return x.id !== id; });
    save(); showLocal(VIEW.id);
  }
  else if (act === "adj-add") {
    var inp = document.getElementById("newadj");
    var t = inp.value.trim();
    if (!t) return;
    logFor(VIEW.id).adjustments.push({ id: crypto.randomUUID(), text: t, done: false });
    save(); showLocal(VIEW.id);
  }
  else if (act === "share-pick") showSharePicker();
  else if (act === "share-open") showShare(id);
  else if (act === "share-send") shareSend(id);
});

if ("serviceWorker" in navigator) {
  addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
}
renderShelf();
</script>
</html>`;

export const MANIFEST = JSON.stringify({
  name: "Spin It — Creami recipes",
  short_name: "Spin It",
  description: "A shelf of Ninja Creami recipes worth making twice.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#2B3AF0",
  theme_color: "#2B3AF0",
  icons: [
    { src: "/icon-180.png", sizes: "180x180", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  ],
});

// Shell cached so the app opens instantly and offline; the catalogue is
// network-first so an approval is never hidden behind a stale cache.
export const SERVICE_WORKER = `
const SHELL = "churn-shell-v6";
const FILES = ["/", "/manifest.webmanifest", "/icon-180.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  if (url.pathname === "/catalogue") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
`;
