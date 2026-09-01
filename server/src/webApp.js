import { ICON_SOURCE } from "./iconSource.js";
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
<title>Spin It · Ninja Creami recipes</title>
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
    --card:#FFF0CF; --ink:#15104A; --ink-soft:#5A5490; --ink-mute:#5F5A93;
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
  .brandmark {
    width:42px; height:42px; flex:none; border-radius:12px;
    background:var(--ground); box-shadow:0 3px 0 rgba(0,0,0,.35);
    fill:none; stroke:var(--pop); stroke-width:5.5;
    stroke-linecap:round; stroke-linejoin:round;
  }

  .palbtn {
    margin-left:auto; width:40px; height:40px; border-radius:14px; flex:none;
    border:2px solid var(--on-dim); background:transparent; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:3px; padding:0;
    transition:transform .18s var(--bounce);
  }
  .palbtn:active { transform:scale(.92) }
  .palbtn span { width:11px; height:11px; border-radius:50%; display:block; box-shadow:0 0 0 1.5px rgba(0,0,0,.25) }
  .tip { display:flex; align-items:flex-start; gap:14px }
  .tipnum { font-family:var(--display); font-weight:700; font-size:19px; line-height:1;
            background:var(--pop); color:var(--on-pop); flex:none; width:38px; height:38px;
            border-radius:999px; display:grid; place-items:center; box-shadow:0 3px 0 var(--ico-ink, var(--ink)) }
  .tiptext { font-family:var(--display); font-weight:600; font-size:16.5px; line-height:1.45;
             color:var(--ink); padding-top:5px }
  .palcard {
    display:block; width:100%; text-align:left; border:2px solid var(--ink);
    border-radius:18px; padding:14px 16px; margin-bottom:12px; cursor:pointer;
    box-shadow:0 4px 0 var(--ink); transition:transform .18s var(--bounce), box-shadow .18s;
  }
  .palcard:active { transform:translateY(3px); box-shadow:0 1px 0 var(--ink) }
  .palcard[data-on="1"] { outline:3px solid var(--pop); outline-offset:2px }
  .paldots { display:flex; gap:6px; margin-bottom:8px }
  .paldots i { width:22px; height:22px; border-radius:50%; box-shadow:0 0 0 1.5px rgba(0,0,0,.2) }
  .palname { display:block; font-family:var(--display); font-weight:700; font-size:19px }
  .palname em { font-style:normal; font-size:11px; font-weight:800; opacity:.6; text-transform:uppercase; letter-spacing:.06em }
  .paldesc { display:block; font-size:12.5px; font-weight:700; margin-top:2px }
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
  .scard .cattag { position:absolute; top:14px; left:16px; font-size:9px; font-weight:800;
                   letter-spacing:.07em; text-transform:uppercase; color:var(--ink-mute); opacity:.75 }
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

  /* No box behind the emoji: it sits straight on the card, so nothing on a
     card carries colour except the emoji itself. Photos keep their frame. */
  .tile {
    width:56px; height:56px; border-radius:18px; display:grid; place-items:center;
    font-size:38px; background:none; border:0; flex:none; overflow:visible;
  }
  .ico { fill:none; stroke:currentColor; stroke-linecap:round; stroke-linejoin:round;
         stroke-width:2.5; width:100%; height:100% }
  .ico .dot { stroke-width:3.4 }
  /* Two-tone: the silhouette floods with the icon's own colour, detail parts
     take theirs, and the line work stays palette ink. */
  .ico-wrap { display:grid; place-items:center; width:48px; height:48px; padding:4px;
              color:var(--ico-ink, var(--ink)); background:var(--ico-pad, transparent);
              border-radius:14px }
  .ico .body { fill:var(--accent, currentColor); fill-opacity:.9; stroke:var(--ico-ink, var(--ink)) }
  .ico .part { fill:var(--pc, currentColor) }
  .dethead .ico-wrap { width:40px; height:40px; padding:3px; border-radius:11px }
  .tile.photo {
    background:var(--card); border:2px solid var(--line); overflow:hidden;
  }
  .tile img { width:100%; height:100%; object-fit:cover; border-radius:inherit }

  /* ---------- compact recipe detail ---------- */
  .dethead { display:flex; align-items:center; gap:11px; margin:8px 0 2px }
  .dethead .tile { width:46px; height:46px; border-radius:15px; font-size:33px }
  .dethead .tile.photo { font-size:24px }
  h2.title { font-family:var(--display); font-size:24px; font-weight:700; margin:0; line-height:1.1; overflow-wrap:anywhere }
  .byline { color:var(--on-dim); font-size:12.5px; font-weight:600 }

  .spinrow { position:relative; padding:8px 26px 8px 0; border-bottom:1.5px solid var(--line) }
  .spinrow:last-of-type { border-bottom:0 }
  .spindate { font-weight:800; font-size:12.5px; color:var(--ink-mute); margin-right:10px }
  .spinstars { font-weight:800; font-size:13px; color:var(--ink) }
  .spinnote { font-size:12.5px; color:var(--ink-soft); margin-top:2px }
  .spinrow .x { position:absolute; right:0; top:6px; color:var(--ink-mute); border:0;
                background:none; font-size:16px; cursor:pointer }
  .spinform { border-top:1.5px solid var(--line); padding-top:10px; margin-top:6px }
  .spinfield { margin-bottom:9px }
  .spinfield label { display:block; font-size:11px; font-weight:800; letter-spacing:.04em;
                     text-transform:uppercase; color:var(--ink-mute); margin-bottom:4px }
  .spinform input[type="date"] { width:auto }
  .unitrow { display:flex; align-items:center; justify-content:flex-end; gap:6px; margin:10px 0 6px }
  .unitrow .ulab { font-size:10.5px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--on-dim) }
  .uchip { font-size:11.5px; font-weight:800; padding:4px 11px; border-radius:99px;
           border:2px solid var(--on-dim); background:transparent; color:var(--on-dim); cursor:pointer }
  .uchip[data-on="1"] { background:var(--card); color:var(--ink); border-color:var(--ink); box-shadow:0 2px 0 var(--ink) }
  .starrow { display:flex; gap:4px; margin:8px 0 2px }
  .star {
    position:relative; font-size:30px; line-height:1; background:none; border:none;
    padding:4px 3px; color:var(--ink-mute); cursor:pointer;
    transition:transform .18s var(--bounce); touch-action:manipulation;
  }
  .star.on { color:#FFB800; text-shadow:0 2px 0 var(--ink) }
  .star .sh {
    position:absolute; inset:0; padding:4px 3px; color:#FFB800;
    text-shadow:0 2px 0 var(--ink); pointer-events:none;
    -webkit-clip-path:inset(0 50% 0 0); clip-path:inset(0 50% 0 0);
  }
  .star:active { transform:scale(1.25) rotate(-8deg) }
  .ratemeta { font-size:12.5px; font-weight:800; color:var(--ink-mute); margin-top:4px }
  .scard .by.rated { color:#B8860B; font-weight:800 }
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
  .noterow { display:grid; grid-template-columns:1fr auto; gap:6px; align-items:center; margin:-1px 0 10px }
  .noterow input[type="checkbox"] { width:auto; margin:0 }
  .noterow .b-note, .noterow .i-note { padding:8px 9px; border-radius:11px; margin-bottom:0 }
  .optlab { display:flex; align-items:center; gap:5px; font-size:12px; font-weight:700; color:var(--ink-mute) }

  .icogrid { display:flex; flex-direction:column; gap:6px; margin-bottom:4px;
             max-height:210px; overflow-y:auto; padding:2px }
  .icogroup { display:grid; grid-template-columns:repeat(auto-fill,minmax(46px,1fr)); gap:6px }
  .icobtn { padding:5px; border-radius:13px; border:2px solid var(--line); background:var(--card);
            cursor:pointer; display:grid; place-items:center; transition:transform .15s var(--bounce) }
  .icobtn .ico-wrap { width:32px; height:32px; padding:2px; border-radius:9px }
  .icobtn:active { transform:scale(.92) }
  .icobtn[data-on="1"] { border-color:var(--ink); box-shadow:0 3px 0 var(--ink) }
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

// Anonymous per-device identity for community ratings. Generated once,
// never tied to a name — "one rating per person" means per device.
var RATER = (function () {
  var k = "spinit.rater.v1";
  try {
    var v = localStorage.getItem(k);
    if (!v) { v = crypto.randomUUID(); localStorage.setItem(k, v); }
    return v;
  } catch (e) { return crypto.randomUUID(); }
})();
var UNITS = ["whole","grams","milliliters","teaspoons","tablespoons","cups","pinch","drops","scoops","toTaste"];
var UNIT_LABEL = { whole:"", grams:"g", milliliters:"ml", teaspoons:"tsp", tablespoons:"tbsp", cups:"cup", pinch:"pinch", drops:"drops", scoops:"scoop", toTaste:"to taste" };

// Metric is canonical: every recipe is STORED in g and ml, so the catalogue
// stays uniform and the server never learns about ounces. Imperial is a live
// conversion at display and entry time, per device, metric by default.
var UNITS_KEY = "spinit.units.v1";
var UNITS_MODE = (function () {
  try { return localStorage.getItem(UNITS_KEY) === "imperial" ? "imperial" : "metric"; }
  catch (e) { return "metric"; }
})();
var OZ_G = 28.3495, FLOZ_ML = 29.5735, CUP_ML = 240;
function trim1(v) { return String(Math.round(v * 10) / 10); }

/// Cups in the fractions a measuring set actually has; anything between
/// notches falls back to one decimal rather than pretending.
function fmtCups(v) {
  var whole = Math.floor(v), frac = v - whole;
  if (frac < 0.045) return String(whole);
  if (frac > 0.955) return String(whole + 1);
  var FR = [[0.125, "\u215b"], [0.25, "\u00bc"], [1/3, "\u2153"], [0.375, "\u215c"],
            [0.5, "\u00bd"], [0.625, "\u215d"], [2/3, "\u2154"], [0.75, "\u00be"], [0.875, "\u215e"]];
  for (var k = 0; k < FR.length; k++) {
    if (Math.abs(frac - FR[k][0]) < 0.04) return (whole || "") + FR[k][1];
  }
  return trim1(v);
}

/// What a stored g/ml amount becomes in the given display mode, and back.
function convOut(a, u, mode) {
  if (a === null || a === undefined) return a;
  if (u === "grams" && mode !== "metric") return a / OZ_G;
  if (u === "milliliters" && mode === "imperial") return a / FLOZ_ML;
  if (u === "milliliters" && mode === "cups") return a / CUP_ML;
  return a;
}
function convIn(a, u, mode) {
  if (a === null || a === undefined) return a;
  var f = 1;
  if (u === "grams" && mode !== "metric") f = OZ_G;
  else if (u === "milliliters" && mode === "imperial") f = FLOZ_ML;
  else if (u === "milliliters" && mode === "cups") f = CUP_ML;
  return Math.round(a * f * 10) / 10;
}
function dispNum(v, u, mode) {
  if (u === "milliliters" && mode === "cups") return fmtCups(v);
  if (mode !== "metric" && (u === "grams" || u === "milliliters")) return trim1(v);
  return fmtAmount(v);
}
function unitEntryLabel(u) {
  if (UNITS_MODE !== "metric" && u === "grams") return "oz";
  if (UNITS_MODE === "imperial" && u === "milliliters") return "fl oz";
  if (UNITS_MODE === "cups" && u === "milliliters") return "cup";
  return UNIT_LABEL[u] !== undefined ? UNIT_LABEL[u] : "—";
}
function entryAmount(i) {
  if (i.amount === null || i.amount === undefined) return "";
  return dispNum(convOut(i.amount, i.unit, UNITS_MODE), i.unit, UNITS_MODE);
}
function unitBar() {
  return '<div class="unitrow"><span class="ulab">Units</span>' +
    '<button class="uchip" data-act="units" data-id="metric" data-on="' + (UNITS_MODE === "metric" ? 1 : 0) + '">g \u00b7 ml</button>' +
    '<button class="uchip" data-act="units" data-id="imperial" data-on="' + (UNITS_MODE === "imperial" ? 1 : 0) + '">oz \u00b7 fl oz</button>' +
    '<button class="uchip" data-act="units" data-id="cups" data-on="' + (UNITS_MODE === "cups" ? 1 : 0) + '">cups</button></div>';
}
function classicHintText() {
  if (UNITS_MODE === "imperial")
    return "13.5 fl oz milk \u00b7 1.4 oz sweetener \u00b7 pinch of salt \u00b7 \u00bc tsp xanthan gum";
  if (UNITS_MODE === "cups")
    return "1\u2154 cups milk \u00b7 1.4 oz sweetener \u00b7 pinch of salt \u00b7 \u00bc tsp xanthan gum";
  return "400 ml milk \u00b7 40 g sweetener \u00b7 pinch of salt \u00b7 \u00bc tsp xanthan gum";
}
var ROLES = ["flavour","mixIn","topping"];
var ROLE_LABEL = { base:"Base", flavour:"Flavour", mixIn:"Mix-ins", topping:"Toppings" };
var ROLE_HINT = { base:"blend, then freeze 24h", flavour:"blend into the pint", mixIn:"fold in after the first spin", topping:"at the bowl" };
// The six palettes from the design phase, straight out of Theme.swift.
// Blue Raspberry is the original; Midnight is the dark one.
var PALETTES = {
  blueRaspberry: { label: "Blue Raspberry", desc: "The original. Royal blue, cream, and a yellow pop.",
    vars: { "--ground":"#2B3AF0", "--on-ground":"#FFF6E3", "--on-dim":"#B9C0FF", "--card":"#FFF0CF",
            "--ink":"#15104A", "--ink-soft":"#5A5490", "--ink-mute":"#5F5A93",
            "--pop":"#FFD426", "--on-pop":"#15104A", "--line":"rgba(21,16,74,.10)" } },
  slushie: { label: "Slushie", desc: "Brighter and colder, with a magenta pop.",
    vars: { "--ground":"#00A8E8", "--on-ground":"#04263B", "--on-dim":"#075C86", "--card":"#DDF2FE",
            "--ink":"#05304A", "--ink-soft":"#34627E", "--ink-mute":"#45708C",
            "--pop":"#D50F63", "--on-pop":"#FFFFFF", "--line":"rgba(5,48,74,.10)" } },
  blueberry: { label: "Blueberry", desc: "Deeper blue, warmed up with orange.",
    vars: { "--ground":"#2012C4", "--on-ground":"#EFEBFF", "--on-dim":"#A79BFF", "--card":"#E7E1FF",
            "--ink":"#170A56", "--ink-soft":"#4A3E8E", "--ink-mute":"#574B9C",
            "--pop":"#FF9E00", "--on-pop":"#2A1600", "--line":"rgba(23,10,86,.10)" } },
  freezie: { label: "Freezie", desc: "The pale icy one.",
    vars: { "--ground":"#CFEDFF", "--on-ground":"#093A5E", "--on-dim":"#3E6E94", "--card":"#E4F3FF",
            "--ink":"#0A2E4A", "--ink-soft":"#38607F", "--ink-mute":"#486F8D",
            "--pop":"#C7137A", "--on-pop":"#FFFFFF", "--line":"rgba(10,46,74,.10)" } },
  razz: { label: "Razz", desc: "The raspberry half, with royal blue as the pop.",
    vars: { "--ground":"#C81355", "--on-ground":"#FFF0F6", "--on-dim":"#FFA9C9", "--card":"#FFE3EE",
            "--ink":"#4A0A26", "--ink-soft":"#8E3A5E", "--ink-mute":"#964063",
            "--pop":"#2B3AF0", "--on-pop":"#FFFFFF", "--line":"rgba(74,10,38,.10)" } },
  midnight: { label: "Midnight", desc: "The dark one.",
    vars: { "--ground":"#0B1030", "--on-ground":"#EAF0FF", "--on-dim":"#8FA0D8", "--card":"#1B2250",
            "--ink":"#EFF3FF", "--ink-soft":"#BAC5F0", "--ink-mute":"#A2B0E6",
            "--pop":"#FFD426", "--on-pop":"#201A00", "--line":"rgba(239,243,255,.14)" } }
};
var PALETTE_KEY = "spinit.palette.v1";
var CUR_PALETTE = "blueRaspberry";

// ---- colour maths, so card and text colours are derived, never guessed ----
function _hx(h){ h = h.replace("#",""); return [0,2,4].map(function(i){ return parseInt(h.slice(i,i+2),16); }); }
function _hex(a){ return "#" + a.map(function(v){ return Math.round(v).toString(16).padStart(2,"0"); }).join("").toUpperCase(); }
function _mix(a,b,t){ var A=_hx(a), B=_hx(b); return _hex(A.map(function(v,i){ return v*(1-t)+B[i]*t; })); }
function _lum(h){
  var c = _hx(h).map(function(v){ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); });
  return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
}
function _ratio(a,b){ var x=_lum(a), y=_lum(b); if (y>x){ var t=x; x=y; y=t; } return (x+0.05)/(y+0.05); }
/// The strongest readable text for a card, tinted with the palette so it never
/// looks like pure black or pure white sitting on colour.
function _textFor(card, ground){
  var lt = _mix("#FFFFFF", ground, 0.08), dk = _mix("#000000", ground, 0.16);
  return _ratio(lt,card) >= _ratio(dk,card) ? lt : dk;
}
/// As soft as a secondary colour can get while still clearing the target ratio.
function _soften(text, card, target){
  var lo = 0, hi = 1;
  for (var i = 0; i < 22; i++) {
    var m = (lo+hi)/2;
    if (_ratio(_mix(text,card,m), card) >= target) lo = m; else hi = m;
  }
  return _mix(text, card, lo);
}
/// "Panel": push the card hard away from the ground so text has maximum room.
/// Light grounds get a deep card; dark grounds get a pale one. Midnight is the
/// exception -- a near-white card there would stop it being a dark theme, so it
/// lifts just far enough to separate from the ground instead.
/// A pale colour must never fall below the target contrast against the card.
function _ensure(c, card, target){
  if (_ratio(c, card) >= target) return c;
  var toward = _lum(card) > 0.4 ? "#000000" : "#FFFFFF";
  var lo = 0, hi = 1;
  for (var i = 0; i < 22; i++) {
    var m = (lo + hi) / 2;
    if (_ratio(_mix(c, toward, m), card) >= target) hi = m; else lo = m;
  }
  return _mix(c, toward, hi);
}
function panelCard(ground, isDarkTheme){
  // Light card + dark ink on every theme; Midnight is the one dark theme and
  // lifts instead. (Slushie and Freezie used to flip to dark cards, which put
  // pale outlines around the coloured icons.)
  if (isDarkTheme) return _mix(ground, "#FFFFFF", 0.14);
  return _mix(ground, "#FFFFFF", 0.90);
}

function applyPalette(name, persist) {
  var pal = PALETTES[name] || PALETTES.blueRaspberry;
  var rootStyle = document.documentElement.style;
  Object.keys(pal.vars).forEach(function (k) { rootStyle.setProperty(k, pal.vars[k]); });

  // Card and the three ink levels are computed from the ground, so every
  // palette lands on the same measured contrast rather than a hand-picked hex.
  var ground = pal.vars["--ground"];
  var card   = panelCard(ground, name === "midnight");
  var ink    = _textFor(card, ground);
  rootStyle.setProperty("--card", card);
  rootStyle.setProperty("--ink", ink);
  rootStyle.setProperty("--ink-soft", _soften(ink, card, 6.0));
  rootStyle.setProperty("--ink-mute", _soften(ink, card, 4.6));
  rootStyle.setProperty("--line", _mix(ink, card, 0.86));

  // Icons keep a dark outline everywhere. On Midnight the card is dark, so
  // each icon sits on a small light pad instead of switching to pale lines.
  var darkTheme = name === "midnight";
  rootStyle.setProperty("--ico-ink", darkTheme ? _mix("#000000", ground, 0.16) : ink);
  rootStyle.setProperty("--ico-pad", darkTheme ? _mix(ground, "#FFFFFF", 0.90) : "transparent");
  var tc = document.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute("content", pal.vars["--ground"]);
  CUR_PALETTE = PALETTES[name] ? name : "blueRaspberry";
  if (persist) { try { localStorage.setItem(PALETTE_KEY, CUR_PALETTE); } catch (e) {} }
}
applyPalette((function () { try { return localStorage.getItem(PALETTE_KEY); } catch (e) { return null; } })(), false);

${ICON_SOURCE}
var CATS = ["protein", "froyo", "cream", "sorbet"];
var CAT_LABEL = { protein: "Protein", froyo: "Froyo", cream: "Ice cream", sorbet: "Sorbet" };

var CLASSIC_BASE = [
  [400, "milliliters", "Milk"],
  [40, "grams", "Sugar, monk fruit, or any sweetener"],
  [null, "pinch", "Salt"],
  [0.25, "teaspoons", "Xanthan gum"],
];

var app = document.getElementById("app");
var CAT = null;
var FILTER = "all";
var SORT = "new";   // "new" | "top"
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
// (DB.myStars was folded into DB.logs by the v3 migration below)

// Personal ratings used to be out of 10. Stars are out of 5, so halve any
// existing score once and mark the shelf as migrated. Without this an old
// 8/10 would silently read as 8 stars.
if (!(DB.v >= 2)) {
  Object.keys(DB.logs || {}).forEach(function (id) {
    var lg = DB.logs[id];
    if (lg && typeof lg.rating === "number") {
      lg.rating = Math.max(0.5, Math.min(5, Math.round(lg.rating) / 2));
    }
  });
  DB.v = 2;
  save();
}

// One rating, not two. The community star (myStars) and the private score were
// separate; they fold into the single log rating. Where both exist, the
// community one wins, since the server already holds it for this device.
if (!(DB.v >= 3)) {
  Object.keys(DB.myStars || {}).forEach(function (id) {
    if (DB.myStars[id]) logFor(id).rating = DB.myStars[id];
  });
  delete DB.myStars;
  DB.v = 3;
  save();
}
function save() { localStorage.setItem(KEY, JSON.stringify(DB)); }
function recipeById(id) { return DB.recipes.find(function (r) { return r.id === id; }); }
function logFor(id) {
  if (!DB.logs[id]) DB.logs[id] = { rating: null, adjustments: [] };
  if (!DB.logs[id].spins) DB.logs[id].spins = [];
  return DB.logs[id];
}
function tried(id) {
  var lg = logFor(id);
  return lg.rating !== null || (lg.spins && lg.spins.length > 0);
}

var SPIN_DRAFT = { stars: 0 };

/// The one rating. It lives on the device; if the catalogue knows the recipe,
/// the same press is also this device's community vote.
function repaintRating(recipeId) {
  if (VIEW.id !== recipeId) return;
  if (VIEW.spinForm) return;
  if (VIEW.name === "remote") showRemote(recipeId);
  else if (VIEW.name === "local") showLocal(recipeId);
}
function applyRating(recipeId, stars) {
  logFor(recipeId).rating = stars;
  save();
  repaintRating(recipeId);
  var inCat = (CAT || []).some(function (x) { return x.id === recipeId; });
  if (!inCat) return;
  sendRating(recipeId, stars).then(function (d) {
    var w = CAT.find(function (x) { return x.id === recipeId; });
    if (w) w.rating = { avg: d.avg, count: d.count };
    repaintRating(recipeId);
  }).catch(function () {
    // Your rating stays; the community average just catches your next press.
  });
}

/// Five stars: a full glyph, a half (the same glyph clipped), or an outline.
/// Shared by your own rating and the community one.
function starRow(value, act, id) {
  var out = "";
  for (var st = 1; st <= 5; st++) {
    var full = value >= st, half = !full && value >= st - 0.5;
    out += '<button class="star' + (full ? " on" : "") + '" data-act="' + act +
      '" data-id="' + (id || "") + '" data-stars="' + st +
      '" aria-label="' + st + ' stars, press again for ' + (st - 0.5) + '">' +
      '<span class="sb">' + (full ? "\u2605" : "\u2606") + '</span>' +
      (half ? '<span class="sh">\u2605</span>' : "") + '</button>';
  }
  return '<div class="starrow">' + out + '</div>';
}

/// Pressing a star sets it; pressing the one you are already on drops to the
/// half below, and pressing again returns to full. No double-tap and no timer,
/// so it behaves the same under a thumb as under a mouse.
function nextStars(current, pressed) {
  return current === pressed ? pressed - 0.5 : pressed;
}

/// Community numbers for a recipe, if the catalogue knows it.
function communityFor(id) {
  if (!CAT) return null;
  var w = CAT.find(function (x) { return x.id === id; });
  return w && w.rating && w.rating.count ? w.rating : null;
}

/// Warm the catalogue so the shelf can show community averages. One request,
/// edge-cached, and nothing polls.
function ensureCatalogue(then) {
  if (CAT !== null) return;
  fetch("/catalogue").then(function (res) { return res.json(); })
    .then(function (d) { CAT = d.recipes; if (then) then(); })
    .catch(function () {});
}

/// Flip the editor's amounts and unit labels without re-rendering the form.
/// A re-render would rebuild EDIT from the saved recipe and eat the draft.
function editorSwapUnits(newMode) {
  var oldMode = UNITS_MODE;
  document.querySelectorAll("#bings .ingrow, #ings .ingrow").forEach(function (row) {
    var amt = row.querySelector(".b-amt, .i-amt");
    var sel = row.querySelector(".b-unit, .i-unit");
    if (!amt || !sel) return;
    var v = parseAmount(amt.value);
    if (v === null) return;
    var metric = convIn(v, sel.value, oldMode);
    amt.value = dispNum(convOut(metric, sel.value, newMode), sel.value, newMode);
  });
  UNITS_MODE = newMode;
  document.querySelectorAll("#bings select, #ings select").forEach(function (sel) {
    for (var k = 0; k < sel.options.length; k++) {
      var o = sel.options[k];
      if (o.value === "grams" || o.value === "milliliters") o.textContent = unitEntryLabel(o.value);
    }
  });
  var hint = document.getElementById("classichint");
  if (hint) hint.textContent = classicHintText();
}

function sendRating(recipeId, stars) {
  return fetch("/rate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ recipeId: recipeId, raterId: RATER, stars: stars })
  }).then(function (res) {
    return res.json().then(function (d) { if (!res.ok) throw d; return d; });
  });
}

// ---------- shared bits ----------

var SQUIGGLE = '<svg class="squiggle" viewBox="0 0 104 9" preserveAspectRatio="none" aria-hidden="true">' +
  '<path d="M0 4.5 Q7.4 0 14.9 4.5 T29.7 4.5 T44.6 4.5 T59.4 4.5 T74.3 4.5 T89.1 4.5 T104 4.5" fill="none" style="stroke:var(--pop)" stroke-width="3" stroke-linecap="round"/></svg>';

function tileHTML(r) {
  if (r.image) return '<span class="tile photo"><img src="' + r.image + '" alt=""></span>';
  // An icon if the recipe picked one, otherwise whatever emoji it has. Nothing
  // is ever blocked on an icon existing for a flavour.
  if (r.icon && FLAVOURS[r.icon]) return '<span class="tile">' + iconMarkup(r.icon) + '</span>';
  return '<span class="tile">' + esc(r.glyph) + '</span>';
}

function header(tab) {
  return '<header class="top">' + brandMark("brandmark") + '<div><h1>Spin It</h1>' + SQUIGGLE + '</div>' +
    '<button class="palbtn" data-act="palette-open" aria-label="Colour themes">' +
    '<span style="background:' + PALETTES[CUR_PALETTE].vars["--pop"] + '"></span>' +
    '<span style="background:' + PALETTES[CUR_PALETTE].vars["--card"] + '"></span>' +
    '</button></header>' +
    '<div class="tabs">' +
    '<button class="tab" data-act="nav-shelf" data-on="' + (tab === "shelf" ? 1 : 0) + '">My recipes</button>' +
    '<button class="tab" data-act="nav-cat" data-on="' + (tab === "cat" ? 1 : 0) + '">Explore</button>' +
    '<button class="tab" data-act="nav-tips" data-on="' + (tab === "tips" ? 1 : 0) + '">Spin tips</button>' +
    '</div>';
}

function fmtScore(v) { return v === Math.round(v) ? String(v) : v.toFixed(1); }

/// Today as YYYY-MM-DD in local time (toISOString would drift near midnight).
function todayISO() {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
         "-" + String(d.getDate()).padStart(2, "0");
}
/// A stored YYYY-MM-DD, shown the way a person says it.
function fmtDay(iso) {
  var q = (iso || "").split("-");
  if (q.length !== 3) return iso || "";
  var d = new Date(+q[0], +q[1] - 1, +q[2]);
  var opts = { month: "short", day: "numeric" };
  if (+q[0] !== new Date().getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString(undefined, opts);
}

function measure(i) {
  var label = unitEntryLabel(i.unit);
  if (label === "\u2014") label = "";
  if (i.amount === null || i.amount === undefined) return label;
  var v = convOut(i.amount, i.unit, UNITS_MODE);
  return (dispNum(v, i.unit, UNITS_MODE) + " " + label).trim();
}

/// Each stage is its own sticker panel, so the ground shows between them.
function ingredientPanels(r) {
  function irow(amtText, name, note, optional) {
    return '<div class="irow"><span class="amt">' + esc(amtText) + '</span><span>' + esc(name) +
      (optional ? ' <span class="opt">optional</span>' : "") +
      (note ? ' <span class="inote">\u00b7 ' + esc(note) + '</span>' : "") + '</span></div>';
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
      return irow(measure({ amount: p[0], unit: p[1] }), p[2], "", false);
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

  function shelfBadge(lg) {
    if (lg.rating !== null) return "\u2605 " + fmtScore(lg.rating);
    if (lg.spins && lg.spins.length) return "spun \u00d7" + lg.spins.length;
    return "not yet";
  }

  function card(r) {
    var lg = logFor(r.id);
    var isTried = tried(r.id);   // a spin counts, same rule as the grouping
    var comm = communityFor(r.id);
    return '<div class="scard' + (isTried ? "" : " untried") + '" data-act="open-local" data-id="' + r.id + '">' +
      '<span class="badge">' + shelfBadge(lg) + '</span>' +
      '<span class="cattag">' + CAT_LABEL[r.category || "cream"] + '</span>' +
      tileHTML(r) +
      '<span class="name">' + esc(r.name) + '</span>' +
      (comm ? '<span class="cstat">community \u2605 ' + fmtScore(comm.avg) +
              ' \u00b7 ' + comm.count + '</span>' : "") +
      '</div>';
  }

  // Community averages live in the catalogue; fetch it once, then repaint.
  ensureCatalogue(function () { if (VIEW.name === "shelf") renderShelf(); });

  var body = "";
  if (!DB.recipes.length) {
    body = '<div class="msg"><span class="big">🍨</span>Nothing here yet.<br>' +
      'Write your own flavour, or save some from Explore.</div>';
  } else {
    if (madeList.length) body += '<div class="group">Spun <span class="count">' + madeList.length + '</span></div>' +
      '<div class="grid">' + madeList.map(card).join("") + '</div>';
    if (ideaList.length) body += '<div class="group">On the list <span class="count">' + ideaList.length + '</span></div>' +
      '<div class="grid">' + ideaList.map(card).join("") + '</div>';
  }

  app.innerHTML = header("shelf") + body +
    '<div class="actions">' +
    '<button class="btn wide" data-act="new-recipe">+ New flavour</button>' +
    '</div>' +
    '<div class="install">📲 <b>Add it to your home screen:</b> tap Share, then <b>Add to Home Screen</b>. ' +
    'Your recipes, photos and ratings live on this device. Nothing is shared unless you choose to.</div>';
  window.scrollTo(0, 0);
}

function showLocal(id) {
  var r = recipeById(id);
  if (!r) return renderShelf();
  var keepForm = VIEW.name === "local" && VIEW.id === id && VIEW.spinForm;
  VIEW = { name: "local", id: id, spinForm: !!keepForm };
  var lg = logFor(id);

  var comm = communityFor(VIEW.id);
  var meta = lg.rating !== null
    ? 'You: \u2605 ' + fmtScore(lg.rating)
    : 'Not rated yet \u00b7 press a star';
  if (comm) {
    meta += ' \u00b7 community \u2605 ' + fmtScore(comm.avg) + ' from ' + comm.count +
            (comm.count === 1 ? ' rating' : ' ratings');
  }
  var rate = '<div class="panel"><div class="sub">Your rating ' +
    '<span class="subhint">press again for a half</span></div>' +
    starRow(lg.rating || 0, "rate-local", VIEW.id) +
    '<div class="ratemeta">' + meta +
    (lg.rating !== null ? ' <button class="clear-rate" data-act="clear-rate">clear</button>' : "") +
    '</div></div>';

  // Every time you actually made it: date, how that batch came out, and what
  // you changed. All on-device, like every other opinion.
  var spinRows = (lg.spins || []).map(function (sp) {
    return '<div class="spinrow">' +
      '<span class="spindate">' + fmtDay(sp.date) + '</span>' +
      (sp.stars ? '<span class="spinstars">\u2605 ' + fmtScore(sp.stars) + '</span>' : '') +
      '<button class="x" data-act="spin-del" data-id="' + sp.id + '">\u00d7</button>' +
      (sp.note ? '<div class="spinnote">' + esc(sp.note) + '</div>' : '') +
      '</div>';
  }).join("");
  var spinForm = !VIEW.spinForm ? "" :
    '<div class="spinform">' +
    '<div class="spinfield"><label>When</label>' +
    '<input type="date" id="sp-date" value="' + todayISO() + '" max="' + todayISO() + '"></div>' +
    '<div class="spinfield"><label>How did this batch come out?</label>' +
    '<div id="sp-stars">' + starRow(SPIN_DRAFT.stars, "spin-stars", VIEW.id) + '</div></div>' +
    '<div class="spinfield"><label>Notes</label>' +
    '<textarea id="sp-note" rows="2" placeholder="Used 30 g sweetener, added a pinch of espresso powder\u2026"></textarea></div>' +
    '<div class="btnrow"><button class="btn small" data-act="spin-save">Save spin</button>' +
    '<button class="btn ghost small" data-act="spin-cancel">Cancel</button></div>' +
    '</div>';
  var spins = '<div class="panel"><div class="sub">Spins ' +
    '<span class="subhint">each time you make it</span></div>' +
    (spinRows || (VIEW.spinForm ? "" : '<div class="ratemeta">No spins logged yet.</div>')) +
    spinForm +
    (VIEW.spinForm ? "" :
      '<div style="margin-top:8px"><button class="btn small" data-act="spin-open">+ Log a spin</button></div>') +
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
    spins +
    unitBar() +
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

// ---------- spin tips ----------

/// Fallback if /tips is unreachable; the live list is edited from /admin.
var TIPS = [
  "Let the pint sit out for 10 to 15 minutes after the first spin so it can defrost a little.",
  "No time to wait? Add a splash of milk and re-spin. It can take 2 or more re-spins to reach the best texture.",
  "Add mix-ins before the texture is fully ready. The best moment is when it still looks a little pebbly."
];

var TIPS_REMOTE = null;
function renderTips() {
  VIEW = { name: "tips" };
  if (TIPS_REMOTE === null) {
    app.innerHTML = header("tips") + '<div class="msg"><span class="spin"></span></div>';
    fetch("/tips").then(function (res) { return res.json(); }).then(function (d) {
      TIPS_REMOTE = (d && Array.isArray(d.tips) && d.tips.length) ? d.tips : TIPS;
      if (VIEW.name === "tips") renderTips();
    }).catch(function () {
      TIPS_REMOTE = TIPS;
      if (VIEW.name === "tips") renderTips();
    });
    return;
  }
  app.innerHTML = header("tips") +
    '<div class="group">Making the best pint</div>' +
    TIPS_REMOTE.map(function (t, i) {
      return '<div class="panel tip"><span class="tipnum">' + (i + 1) + '</span>' +
        '<span class="tiptext">' + esc(t) + '</span></div>';
    }).join("") +
    '<div class="byline" style="margin-top:10px">Got a trick of your own? Put it in a recipe\u2019s method and share it.</div>';
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
      '<span class="cattag">' + CAT_LABEL[w.category || "cream"] + '</span>' +
      tileHTML(w) +
      '<span class="name">' + esc(w.name) + '</span>' +
      '<span class="by">by ' + esc(w.author) + '</span>' +
      (w.rating && w.rating.count
        ? '<span class="by rated">\u2605 ' + fmtScore(w.rating.avg) + ' \u00b7 ' + w.rating.count + '</span>'
        : "") + '</div>';
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
  chips += '<div class="basechips" style="margin-bottom:4px">' +
    '<button class="chip" data-act="sort-cat" data-id="new" data-on="' + (SORT === "new" ? 1 : 0) + '">Newest</button>' +
    '<button class="chip" data-act="sort-cat" data-id="top" data-on="' + (SORT === "top" ? 1 : 0) + '">Top rated</button></div>';
  var mine = pool.filter(function (w) { return w.origin !== "community"; });
  var rest = pool.filter(function (w) { return w.origin === "community"; });
  if (SORT === "top") {
    // Best first; unrated sink to the bottom, more ratings break ties.
    var byRating = function (a, b) {
      var ra = a.rating ? a.rating.avg : -1, rb = b.rating ? b.rating.avg : -1;
      if (rb !== ra) return rb - ra;
      return (b.rating ? b.rating.count : 0) - (a.rating ? a.rating.count : 0);
    };
    mine = mine.slice().sort(byRating);
    rest = rest.slice().sort(byRating);
  }

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

/// My stars vs the community's — the private 0-10 spin score on the shelf
/// stays a completely separate, on-device thing.
function ratingPanel(w) {
  var mine = logFor(w.id).rating || 0;
  var row = starRow(mine, "rate-remote", w.id);
  var meta;
  if (w.rating && w.rating.count) {
    meta = 'Community: \u2605 ' + fmtScore(w.rating.avg) + ' from ' + w.rating.count +
      (w.rating.count === 1 ? " rating" : " ratings");
    if (mine) {
      var d = mine - w.rating.avg;
      meta += ' \u00b7 you: \u2605 ' + mine +
        (Math.abs(d) < 0.05 ? " (right on the average)"
          : d > 0 ? " (" + fmtScore(Math.abs(d)) + " above average)"
                  : " (" + fmtScore(Math.abs(d)) + " below average)");
    }
  } else {
    meta = mine ? 'You: \u2605 ' + mine + ' \u00b7 first rating in!' : "No ratings yet. Be the first!";
  }
  return '<div class="panel"><div class="sub">Rate it ' +
    '<span class="subhint">press again for a half</span></div>' + row +
    '<div class="ratemeta">' + meta + '</div></div>';
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
    ratingPanel(w) +
    unitBar() +
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
      'Write a flavour first. Sharing is always optional.' +
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

// ---------- palettes ----------

function showPalettes() {
  VIEW = { name: "palettes" };
  var cards = Object.keys(PALETTES).map(function (k) {
    var pal = PALETTES[k], v = pal.vars, on = k === CUR_PALETTE;
    // Preview each card with the same computed surface the palette will
    // actually produce, so what you see here is what you get.
    var pc = panelCard(v["--ground"], k === "midnight");
    var pi = _textFor(pc, v["--ground"]);
    var pm = _soften(pi, pc, 4.6);
    return '<div class="palcard" data-act="palette-pick" data-id="' + k + '" data-on="' + (on ? 1 : 0) + '"' +
      ' style="background:' + pc + '; color:' + pi + '">' +
      '<span class="paldots">' +
        '<i style="background:' + v["--ground"] + '"></i>' +
        '<i style="background:' + v["--pop"] + '"></i>' +
        '<i style="background:' + v["--on-dim"] + '"></i>' +
      '</span>' +
      '<span class="palname">' + pal.label + (on ? ' <em>current</em>' : '') + '</span>' +
      '<span class="paldesc" style="color:' + pm + '">' + pal.desc + '</span>' +
      '</div>';
  }).join("");
  app.innerHTML =
    '<button class="btn ghost small" data-act="nav-shelf">\u2039 Back</button>' +
    '<h2 class="title" style="margin-top:8px">Colour themes</h2>' + SQUIGGLE +
    '<div class="byline" style="margin:6px 0 10px">Pick a mood \u00b7 it sticks on this device.</div>' +
    cards;
  window.scrollTo(0, 0);
}

// ---------- editor ----------

function showEditor(id) {
  var r = id ? recipeById(id) : null;
  EDIT = r ? JSON.parse(JSON.stringify(r))
           : { id: crypto.randomUUID(), name: "", glyph: "🍨", swatch: "banana", image: null, icon: null,
               category: "cream", method: "", ingredients: [], customBase: null, origin: "mine",
               author: localStorage.getItem("churnName") || "" };
  if (!EDIT.category) EDIT.category = "cream";
  if (!EDIT.ingredients.length) EDIT.ingredients.push({ name: "", amount: null, unit: "whole", role: "flavour" });
  EDIT.baseMode = EDIT.customBase && EDIT.customBase.length ? "custom" : "classic";
  if (!EDIT.customBase || !EDIT.customBase.length) EDIT.customBase = [{ name: "", amount: null, unit: "whole", role: "base" }];
  VIEW = { name: "editor", id: id };


  app.innerHTML =
    '<button class="btn ghost small" data-act="cancel-edit">‹ Cancel</button>' +
    '<h2 class="title" style="margin-top:8px">' + (id ? "Edit recipe" : "New flavour") + '</h2>' + SQUIGGLE +
    '<label for="e-name">Name</label><input id="e-name" placeholder="Cookie Dough" value="' + esc(EDIT.name) + '">' +

    '<label>Icon</label>' +
    '<div class="icogrid">' + GROUPS.map(function (g) {
      return '<div class="icogroup">' + g[1].filter(function (k) { return FLAVOURS[k]; })
        .map(function (k) {
          return '<button type="button" class="icobtn" data-act="pick-icon" data-id="' + k +
            '" data-on="' + (EDIT.icon === k ? 1 : 0) + '" title="' + FLAVOURS[k].label + '">' +
            iconMarkup(k) + '</button>';
        }).join("") + '</div>';
    }).join("") + '</div>' +
    '<div class="basehint">Pick one, or use an emoji or a photo below.</div>' +
    '<label>Emoji or your own photo</label>' +
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

    unitBar() +
    '<label>Base</label>' +
    '<div class="basechips">' +
    '<button class="chip" data-act="base-mode" data-id="classic" data-on="' + (EDIT.baseMode === "classic" ? 1 : 0) + '">Classic base</button>' +
    '<button class="chip" data-act="base-mode" data-id="custom" data-on="' + (EDIT.baseMode === "custom" ? 1 : 0) + '">My own base</button>' +
    '</div>' +
    '<div id="basebox" style="' + (EDIT.baseMode === "custom" ? "" : "display:none") + '">' +
    '<div class="basehint">Start from a saved base and tweak it, or build your own:</div>' +
    '<div class="basechips" style="margin:6px 0 4px">' + Object.keys(BASE_PRESETS).map(function (k) {
      return '<button class="chip" data-act="base-preset" data-id="' + k + '">' + BASE_PRESETS[k].label + '</button>';
    }).join("") + '</div>' +
    '<div style="height:7px"></div>' +
    '<div id="bings">' + EDIT.customBase.map(baseRowHTML).join("") + '</div>' +
    '<button class="btn ghost small" data-act="add-bing">+ base ingredient</button>' +
    '</div>' +
    '<div class="basehint" id="classichint" style="' + (EDIT.baseMode === "classic" ? "" : "display:none") + '">' +
    classicHintText() + '</div>' +

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
    return '<option value="' + u + '"' + (u === i.unit ? " selected" : "") + '>' + unitEntryLabel(u) + '</option>';
  }).join("");
  return '<div class="ingrow">' +
    '<input class="b-name" placeholder="Chocolate Fairlife" value="' + esc(i.name) + '">' +
    '<input class="b-amt" placeholder="qty" inputmode="decimal" value="' + entryAmount(i) + '">' +
    '<select class="b-unit">' + opts + '</select>' +
    '<button class="rm" data-act="rm-row">×</button>' +
    '</div>' +
    '<div class="noterow"><input class="b-note" placeholder="note (optional)" value="' + esc(i.note || "") + '">' +
    '<label class="optlab"><input type="checkbox" class="b-opt"' + (i.isOptional ? " checked" : "") + '> optional</label></div>';
}

function ingRowHTML(i) {
  var opts = UNITS.map(function (u) {
    return '<option value="' + u + '"' + (u === i.unit ? " selected" : "") + '>' + unitEntryLabel(u) + '</option>';
  }).join("");
  var ropts = ROLES.map(function (ro) {
    return '<option value="' + ro + '"' + (ro === i.role ? " selected" : "") + '>' + ROLE_LABEL[ro] + '</option>';
  }).join("");
  return '<div class="ingrow">' +
    '<input class="i-name" placeholder="Ingredient" value="' + esc(i.name) + '">' +
    '<input class="i-amt" placeholder="qty" inputmode="decimal" value="' + entryAmount(i) + '">' +
    '<select class="i-unit">' + opts + '</select>' +
    '<button class="rm" data-act="rm-row">×</button>' +
    '</div><div class="rolerow"><select class="i-role">' + ropts + '</select></div>' +
    '<div class="noterow"><input class="i-note" placeholder="note (optional)" value="' + esc(i.note || "") + '">' +
    '<label class="optlab"><input type="checkbox" class="i-opt"' + (i.isOptional ? " checked" : "") + '> optional</label></div>';
}

function collectRows(box, prefix, role) {
  var out = [];
  var names = box.querySelectorAll("." + prefix + "-name");
  var amts = box.querySelectorAll("." + prefix + "-amt");
  var units = box.querySelectorAll("." + prefix + "-unit");
  var notes = box.querySelectorAll("." + prefix + "-note");
  var optsC = box.querySelectorAll("." + prefix + "-opt");
  var roles = box.querySelectorAll(".i-role");
  for (var k = 0; k < names.length; k++) {
    var nm = names[k].value.trim();
    if (!nm) continue;
    var amount = convIn(parseAmount(amts[k].value), units[k].value, UNITS_MODE);
    out.push({
      name: nm,
      amount: amount === null || isNaN(amount) ? null : amount,
      unit: units[k].value,
      role: role || (roles[k] ? roles[k].value : "flavour"),
      note: notes[k] ? notes[k].value.trim() : "",
      isOptional: !!(optsC[k] && optsC[k].checked),
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
               icon: r.icon || null,
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


app.addEventListener("change", function (e) {
  if (e.target.id === "e-photo" && e.target.files && e.target.files[0]) loadPhoto(e.target.files[0]);
});

app.addEventListener("click", function (e) {
  var el = e.target.closest("[data-act]");
  if (!el) return;
  var act = el.getAttribute("data-act");
  var id = el.getAttribute("data-id");

  if (act === "nav-shelf") renderShelf();
  else if (act === "nav-tips") renderTips();
  else if (act === "nav-cat" || act === "retry-cat") { if (act === "retry-cat") CAT = null; renderCatalogue(); }
  else if (act === "open-local") showLocal(id);
  else if (act === "open-remote") showRemote(id);
  else if (act === "new-recipe") showEditor(null);
  else if (act === "edit") showEditor(id);
  else if (act === "cancel-edit") { EDIT = null; renderShelf(); }
  else if (act === "pick-icon") {
    // Toggle in place rather than re-rendering: showEditor() rebuilds EDIT from
    // scratch, which would drop the icon and everything typed so far.
    EDIT.icon = (EDIT.icon === id) ? null : id;   // press again to clear
    document.querySelectorAll('[data-act="pick-icon"]').forEach(function (b) {
      b.setAttribute("data-on", b.getAttribute("data-id") === EDIT.icon ? "1" : "0");
    });
  }
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
  else if (act === "base-preset") {
    var pre = BASE_PRESETS[id];
    if (!pre) return;
    var hasRows = EDIT.customBase.some(function (i) { return (i.name || "").trim(); });
    if (hasRows && !confirm("Replace the current base with " + pre.label + "?")) return;
    EDIT.customBase = JSON.parse(JSON.stringify(pre.ings));
    // repaint only the base rows so nothing typed elsewhere is lost
    document.getElementById("bings").innerHTML = EDIT.customBase.map(baseRowHTML).join("");
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
    DB.recipes.push({ id: w.id, name: w.name, glyph: w.glyph, swatch: w.swatch, icon: w.icon || null, image: null,
      category: w.category || "cream",
      method: w.method || "", ingredients: w.ingredients, customBase: w.customBase || null,
      origin: "saved", author: w.author });
    save(); showRemote(id);
  }
  else if (act === "sort-cat") { SORT = id; renderCatalogue(); }
  else if (act === "palette-open") showPalettes();
  else if (act === "palette-pick") { applyPalette(id, true); showPalettes(); }
  else if (act === "units") {
    if (id !== UNITS_MODE) {
      if (VIEW.name === "editor") editorSwapUnits(id);
      UNITS_MODE = id;
      try { localStorage.setItem(UNITS_KEY, id); } catch (e) {}
      document.querySelectorAll('[data-act="units"]').forEach(function (b) {
        b.setAttribute("data-on", b.getAttribute("data-id") === UNITS_MODE ? "1" : "0");
      });
      if (VIEW.name === "local") showLocal(VIEW.id);
      else if (VIEW.name === "remote") showRemote(VIEW.id);
    }
  }
  else if (act === "spin-open") { SPIN_DRAFT = { stars: 0 }; VIEW.spinForm = true; showLocal(VIEW.id); }
  else if (act === "spin-cancel") { VIEW.spinForm = false; showLocal(VIEW.id); }
  else if (act === "spin-stars") {
    // Repaint only the star row: re-rendering the view would eat the note.
    SPIN_DRAFT.stars = nextStars(SPIN_DRAFT.stars, parseInt(el.getAttribute("data-stars"), 10));
    var box = document.getElementById("sp-stars");
    if (box) box.innerHTML = starRow(SPIN_DRAFT.stars, "spin-stars", VIEW.id);
  }
  else if (act === "spin-save") {
    var lgS = logFor(VIEW.id);
    lgS.spins.unshift({
      id: crypto.randomUUID(),
      date: (document.getElementById("sp-date") || {}).value || todayISO(),
      stars: SPIN_DRAFT.stars || null,
      note: ((document.getElementById("sp-note") || {}).value || "").trim().slice(0, 300)
    });
    lgS.spins.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    VIEW.spinForm = false;
    save();
    showLocal(VIEW.id);
  }
  else if (act === "spin-del") {
    if (!confirm("Remove this spin?")) return;
    var lgD = logFor(VIEW.id);
    lgD.spins = lgD.spins.filter(function (x) { return x.id !== id; });
    save();
    showLocal(VIEW.id);
  }
  else if (act === "rate-remote" || act === "rate-local") {
    applyRating(id, nextStars(logFor(id).rating || 0, parseInt(el.getAttribute("data-stars"), 10)));
  }
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
    { src: "/icon-180.png?v=2", sizes: "180x180", type: "image/png" },
    { src: "/icon-512.png?v=2", sizes: "512x512", type: "image/png", purpose: "any" },
  ],
});

// Shell cached so the app opens instantly and offline; the catalogue is
// network-first so an approval is never hidden behind a stale cache.
export const SERVICE_WORKER = `
const SHELL = "churn-shell-v27";
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
