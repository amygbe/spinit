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
  header.top img { width:42px; height:42px; border-radius:12px; box-shadow:0 3px 0 rgba(0,0,0,.35) }

  .palbtn {
    margin-left:auto; width:40px; height:40px; border-radius:14px; flex:none;
    border:2px solid var(--on-dim); background:transparent; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:3px; padding:0;
    transition:transform .18s var(--bounce);
  }
  .palbtn:active { transform:scale(.92) }
  .palbtn span { width:11px; height:11px; border-radius:50%; display:block; box-shadow:0 0 0 1.5px rgba(0,0,0,.25) }
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
  .ico-wrap { display:block; width:44px; height:44px; color:var(--ink) }
  .ico .body { fill:var(--accent, currentColor); fill-opacity:.9; stroke:var(--ink) }
  .ico .part { fill:var(--pc, currentColor) }
  .dethead .ico-wrap { width:38px; height:38px }
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

  .icogrid { display:flex; flex-direction:column; gap:6px; margin-bottom:4px;
             max-height:210px; overflow-y:auto; padding:2px }
  .icogroup { display:grid; grid-template-columns:repeat(auto-fill,minmax(46px,1fr)); gap:6px }
  .icobtn { padding:5px; border-radius:13px; border:2px solid var(--line); background:var(--card);
            cursor:pointer; display:grid; place-items:center; transition:transform .15s var(--bounce) }
  .icobtn .ico-wrap { width:30px; height:30px }
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
function panelCard(ground, isDarkTheme){
  if (isDarkTheme) return _mix(ground, "#FFFFFF", 0.14);
  return _lum(ground) > 0.30 ? _mix(ground, "#000000", 0.74)
                             : _mix(ground, "#FFFFFF", 0.90);
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
  var tc = document.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute("content", pal.vars["--ground"]);
  CUR_PALETTE = PALETTES[name] ? name : "blueRaspberry";
  if (persist) { try { localStorage.setItem(PALETTE_KEY, CUR_PALETTE); } catch (e) {} }
}
applyPalette((function () { try { return localStorage.getItem(PALETTE_KEY); } catch (e) { return null; } })(), false);

var SWATCH = {
  banana:"#FFC42E", vanilla:"#FF9F45", pumpkin:"#FF6B1A", mango:"#FF8C1A", cherry:"#E22B47",
  berry:"#E8336F", bubblegum:"#FF7BC1", grape:"#8B4DE8", lavender:"#B79CFF", blueberry:"#4353FF",
  sky:"#3BB8FF", mint:"#00D49B", matcha:"#86C232", olive:"#9BC72B", cocoa:"#B0632F",
  coffee:"#8B5E3C", charcoal:"#494A5A", snow:"#F2EDE4",
};

// What the editor offers: eight bold ones plus a neutral light and dark.
// SWATCH keeps every historical colour so old recipes still render.
var PICKER_SWATCHES = ["cherry", "mango", "banana", "mint", "sky", "grape",
                       "bubblegum", "cocoa", "snow", "charcoal"];

// ---------------------------------------------------------------- icons
// The flavour icon set, ported from design/icons.html. Each icon is one
// closed silhouette plus detail lines, so the same drawing works hollow or
// flooded. Colours: the outline takes the palette ink, the body takes the
// icon's own colour (a banana is yellow whatever the recipe is tagged).
var SWIRL_32 = "M 16.00 4.70 C 16.15 4.79 16.62 5.01 16.91 5.23 C 17.20 5.45 17.53 5.72 17.76 6.01 C 17.98 6.30 18.18 6.64 18.24 6.97 C 18.29 7.30 18.26 7.66 18.10 7.97 C 17.93 8.28 17.62 8.59 17.23 8.84 C 16.85 9.09 16.31 9.30 15.79 9.45 C 15.27 9.60 14.63 9.69 14.13 9.73 C 13.62 9.77 13.08 9.74 12.75 9.69 C 12.42 9.65 12.17 9.54 12.16 9.46 C 12.15 9.38 12.31 9.27 12.67 9.22 C 13.02 9.17 13.62 9.13 14.29 9.17 C 14.95 9.21 15.85 9.30 16.66 9.47 C 17.47 9.64 18.43 9.89 19.16 10.19 C 19.88 10.49 20.61 10.87 21.01 11.27 C 21.42 11.66 21.66 12.13 21.58 12.55 C 21.50 12.97 21.13 13.43 20.54 13.80 C 19.94 14.17 19.00 14.53 18.02 14.78 C 17.03 15.04 15.74 15.23 14.62 15.33 C 13.50 15.43 12.23 15.43 11.30 15.38 C 10.37 15.33 9.48 15.17 9.04 15.02 C 8.60 14.87 8.41 14.64 8.63 14.47 C 8.85 14.30 9.49 14.10 10.37 14.00 C 11.25 13.90 12.58 13.83 13.91 13.88 C 15.24 13.93 16.94 14.06 18.37 14.29 C 19.80 14.52 21.38 14.87 22.49 15.27 C 23.60 15.67 24.59 16.18 25.03 16.68 C 25.47 17.19 25.11 18.01 25.13 18.28";

function I(body, l, d, parts){ return { body:body, l:l||[], d:d||[], parts:parts||[] }; }

/* A circle as one subpath. Several of these concatenated into a single 'd'
   union into a berry cluster when filled, and draw as overlapping outlines when
   hollow -- which is exactly the texture a raspberry needs, from one path. */
function O(cx, cy, r){
  var k = 0.5523 * r, n = function(v){ return Math.round(v*100)/100; };
  return "M " + n(cx+r) + " " + n(cy) +
    " C " + n(cx+r) + " " + n(cy+k) + " " + n(cx+k) + " " + n(cy+r) + " " + n(cx) + " " + n(cy+r) +
    " C " + n(cx-k) + " " + n(cy+r) + " " + n(cx-r) + " " + n(cy+k) + " " + n(cx-r) + " " + n(cy) +
    " C " + n(cx-r) + " " + n(cy-k) + " " + n(cx-k) + " " + n(cy-r) + " " + n(cx) + " " + n(cy-r) +
    " C " + n(cx+k) + " " + n(cy-r) + " " + n(cx+r) + " " + n(cy-k) + " " + n(cx+r) + " " + n(cy) + " Z";
}

var SWIRL_32 = "M 16.00 4.70 C 16.15 4.79 16.62 5.01 16.91 5.23 C 17.20 5.45 17.53 5.72 17.76 6.01 C 17.98 6.30 18.18 6.64 18.24 6.97 C 18.29 7.30 18.26 7.66 18.10 7.97 C 17.93 8.28 17.62 8.59 17.23 8.84 C 16.85 9.09 16.31 9.30 15.79 9.45 C 15.27 9.60 14.63 9.69 14.13 9.73 C 13.62 9.77 13.08 9.74 12.75 9.69 C 12.42 9.65 12.17 9.54 12.16 9.46 C 12.15 9.38 12.31 9.27 12.67 9.22 C 13.02 9.17 13.62 9.13 14.29 9.17 C 14.95 9.21 15.85 9.30 16.66 9.47 C 17.47 9.64 18.43 9.89 19.16 10.19 C 19.88 10.49 20.61 10.87 21.01 11.27 C 21.42 11.66 21.66 12.13 21.58 12.55 C 21.50 12.97 21.13 13.43 20.54 13.80 C 19.94 14.17 19.00 14.53 18.02 14.78 C 17.03 15.04 15.74 15.23 14.62 15.33 C 13.50 15.43 12.23 15.43 11.30 15.38 C 10.37 15.33 9.48 15.17 9.04 15.02 C 8.60 14.87 8.41 14.64 8.63 14.47 C 8.85 14.30 9.49 14.10 10.37 14.00 C 11.25 13.90 12.58 13.83 13.91 13.88 C 15.24 13.93 16.94 14.06 18.37 14.29 C 19.80 14.52 21.38 14.87 22.49 15.27 C 23.60 15.67 24.59 16.18 25.03 16.68 C 25.47 17.19 25.11 18.01 25.13 18.28";

var FLAVOURS = {
  softserve: { label:"Soft serve", swatch:"vanilla", i:
    I("M 6.6 20.2 L 8.9 27.1 C 9.2 27.9 9.9 28.4 10.7 28.5 C 13.3 28.9 18.7 28.9 21.3 28.5 C 22.1 28.4 22.8 27.9 23.1 27.1 L 25.4 20.2 C 25.4 20.2 20 21.5 16 21.5 C 12 21.5 6.6 20.2 6.6 20.2 Z",
      ["M 26.4 19.2 C 26.4 20.85 21.75 22.2 16 22.2 C 10.25 22.2 5.6 20.85 5.6 19.2 C 5.6 17.55 10.25 16.2 16 16.2 C 21.75 16.2 26.4 17.55 26.4 19.2 Z", SWIRL_32]) },

  chocolate: { label:"Chocolate", swatch:"cocoa", i:
    I("M 9.6 5.8 L 24.9 8.6 L 22.4 25.4 L 7.1 22.6 Z",
      ["M 16.9 7.15 L 14.75 24", "M 8.35 14.2 L 23.65 17"]) },

  /* Drawn as a band between two curves that meet at BOTH ends, so each tip is a
     sharp corner that the round linejoin softens to a point. The earlier version
     closed one end with a straight cut and hooked the other, which read as a
     comma. Laid on a diagonal rather than a symmetric smile, and left plain
     inside -- an interior ridge line only added to the hook. */
  banana: { label:"Banana", swatch:"banana", i:
    I("M 8.6 5.4 C 4.8 12 5.2 20 9.4 23.8 C 13.4 27.4 20.2 27.6 25.6 24.4 " +
      "C 23.4 23.2 20 22.4 16.6 21.2 C 12.4 19.8 10.2 14.2 8.6 5.4 Z",
      ["M 8.6 5.4 L 8.0 2.4"]) },

  /* A circle with a leaf reads as an orange. What makes a mango a mango is the
     lean -- an ellipse tipped ~28 degrees, so the body is a plump teardrop. */
  mango: { label:"Mango", swatch:"mango", i:
    I("M 23.4 13.5 C 26.2 18.7 25.2 24.8 21.1 26.9 C 17.0 29.1 11.4 26.6 8.6 21.3 C 5.8 16.1 6.8 10.1 10.9 7.9 C 15.0 5.7 20.6 8.2 23.4 13.5 Z",
      ["M 18.6 6.8 C 20.4 3.4 24.0 2.4 26.2 3.2 C 25.4 6.2 22.4 8.2 19.6 8.0"]) },

  /* A combination, for recipes that are plainly two things. Both shapes shrink
     to about 60% and sit on a diagonal so neither hides the other's outline;
     the plain 'chocolate' square stays in the set for chocolate on its own. */
  /* Stacked, not overlapped -- side by side at this size the two shapes tangle
     into one unreadable object. Banana above, bar below, each still itself. */
  chocoBanana: { label:"Chocolate banana", swatch:"cocoa", i:
    I("M 7.4 21.4 L 26.6 21.4 C 27.2 21.4 27.6 21.8 27.6 22.4 L 27.6 28 C 27.6 28.6 27.2 29 26.6 29 L 7.4 29 C 6.8 29 6.4 28.6 6.4 28 L 6.4 22.4 C 6.4 21.8 6.8 21.4 7.4 21.4 Z",
      ["M 13.4 21.4 L 13.4 29", "M 20.6 21.4 L 20.6 29", "M 6.4 25.2 L 27.6 25.2",
       "M 7.95 4.44 L 7.54 2.4"],
      [],
      [{ c:"banana", d:"M 7.95 4.44 C 5.36 8.93 5.64 14.37 8.49 16.95 C 11.21 19.40 15.84 19.54 19.51 17.36 " +
                        "C 18.01 16.54 15.70 16.00 13.39 15.19 C 10.53 14.23 9.04 10.43 7.95 4.44 Z" }]) },

  /* Not a flavour. Ren's joke recipe needs somewhere to live, and a fish in the
     same hand is funnier than a fallback emoji sitting in a grid of line art. */
  fish: { label:"Fish", swatch:"bubblegum", fill:"#FFAFC5", i:
    I("M 27.0 16.0 C 24.0 10.4 18.6 7.6 13.4 8.6 C 11.6 9.0 10.1 10.0 9.2 11.6 C 6.6 11.0 4.4 9.2 3.2 7.4 C 2.7 12.0 2.7 20.0 3.2 24.6 C 4.4 22.8 6.6 21.0 9.2 20.4 C 10.1 22.0 11.6 23.0 13.4 23.4 C 18.6 24.4 24.0 21.6 27.0 16.0 Z",
      ["M 13.8 9.2 C 11.8 12.0 11.8 20.0 13.8 22.8",
       "M 16.4 8.2 C 18.0 5.4 21.0 4.8 23.0 5.6 C 22.0 8.0 20.0 9.4 18.0 9.6"],
      ["22.4 13.8"]) },

  mint: { label:"Mint", swatch:"mint", i:
    I("M 25.6 5.9 C 25.6 5.9 10.6 5.4 7.4 14.6 C 5.3 20.7 9.2 26.2 9.2 26.2 C 9.2 26.2 20.2 24.6 24 15.6 C 25.8 11.3 25.6 5.9 25.6 5.9 Z",
      ["M 9.2 26.2 C 12.2 20 16.3 13.9 24.4 9"]) },

  pumpkin: { label:"Pumpkin", swatch:"pumpkin", i:
    I("M 16 9.4 C 22.2 7.9 27.2 12.4 27.2 18.4 C 27.2 24.4 22.2 28.4 16 28.4 C 9.8 28.4 4.8 24.4 4.8 18.4 C 4.8 12.4 9.8 7.9 16 9.4 Z",
      ["M 16 9.4 C 12.4 13.4 12.4 24.4 16 28.4", "M 16 9.4 C 19.6 13.4 19.6 24.4 16 28.4",
       "M 16 9.4 L 16 4.8 C 16 4.8 18.6 3.6 20.2 5.4"]) },

  cookie: { label:"Cookie", swatch:"cocoa", i:
    I("M 16 4.6 C 22.3 4.6 27.4 9.7 27.4 16 C 27.4 22.3 22.3 27.4 16 27.4 C 9.7 27.4 4.6 22.3 4.6 16 C 4.6 9.7 9.7 4.6 16 4.6 Z",
      [], ["11.8 12.2","20.1 11.4","16.6 17.6","11.4 20.4","21.4 20.2"]) },

  /* Face-on, a sandwich cookie reads as a gear. From the side, dark wafers with
     a pale cream band between them are unmistakable -- the cream is the whole
     tell, so it gets its own colour rather than a pair of divider lines. */
  oreo: { label:"Sandwich", swatch:"charcoal", i:
    I("M 6.4 8.4 L 25.6 8.4 C 26.5 8.4 27.2 9.1 27.2 10 L 27.2 21.6 C 27.2 22.5 26.5 23.2 25.6 23.2 L 6.4 23.2 C 5.5 23.2 4.8 22.5 4.8 21.6 L 4.8 10 C 4.8 9.1 5.5 8.4 6.4 8.4 Z",
      [], [],
      [{ c:"snow", d:"M 4.8 12.8 L 27.2 12.8 L 27.2 18.8 L 4.8 18.8 Z" }]) },

  olive: { label:"Olive oil", swatch:"olive", i:
    I("M 16 5.6 C 20.9 5.6 24 10.6 24 17 C 24 23.3 20.5 27.9 16 27.9 C 11.5 27.9 8 23.3 8 17 C 8 10.6 11.1 5.6 16 5.6 Z",
      ["M 16 5.8 C 18 3.2 21.9 2.6 24 3.6 C 23.1 6.2 20.1 7.7 17.6 7.4",
       "M 12.2 12.6 C 11.2 15.1 11.2 18.1 11.9 20.5"]) },

  /* A wedge, not a bowl: rind across the top, converging to a point. The flesh
     is the body so it follows the recipe's swatch; the rind is a part with its
     own green, since a watermelon rind is green regardless. */
  watermelon: { label:"Watermelon", swatch:"cherry", i:
    I("M 7.6 12.8 C 10.4 11.4 13.0 11.0 16 11.0 C 19 11.0 21.6 11.4 24.4 12.8 L 16 28.0 Z",
      [], ["13.4 16.6","18.6 16.6","16 21.2"],
      [{ c:"matcha", d:"M 4.6 9.6 C 4.6 9.6 9.0 7.0 16 7.0 C 23 7.0 27.4 9.6 27.4 9.6 L 24.4 12.8 C 21.6 11.4 19 11.0 16 11.0 C 13 11.0 10.4 11.4 7.6 12.8 Z" }]) },

  strawberry: { label:"Strawberry", swatch:"cherry", i:
    I("M 16 28.2 C 11 26.2 6.2 20 6.7 14.2 C 7.1 10.7 11.1 9.1 16 9.1 C 20.9 9.1 24.9 10.7 25.3 14.2 C 25.8 20 21 26.2 16 28.2 Z",
      ["M 16 9.1 L 16 4.6", "M 11.4 10.3 C 9.2 7.3 10.2 5.4 10.2 5.4 C 12.3 6.1 13.7 7.6 14.2 9.4",
       "M 20.6 10.3 C 22.8 7.3 21.8 5.4 21.8 5.4 C 19.7 6.1 18.3 7.6 17.8 9.4"],
      ["12.4 15.4","19.6 15.4","16 20.4"]) },

  cherry: { label:"Cherry", swatch:"cherry", i:
    I("M 9.6 17.2 C 12.5 17.2 14.8 19.5 14.8 22.4 C 14.8 25.3 12.5 27.6 9.6 27.6 C 6.7 27.6 4.4 25.3 4.4 22.4 C 4.4 19.5 6.7 17.2 9.6 17.2 Z",
      ["M 22.2 18.2 C 25.1 18.2 27.4 20.5 27.4 23.4 C 27.4 26.3 25.1 28.6 22.2 28.6 C 19.3 28.6 17 26.3 17 23.4 C 17 20.5 19.3 18.2 22.2 18.2 Z",
       "M 9.6 17.2 C 11.4 11.4 15.4 7.2 21.4 5.4", "M 22.2 18.2 C 22.4 13.4 22 9.2 21.4 5.4",
       "M 21.4 5.4 C 23.4 2.8 27.2 2.8 28.4 4.4 C 27.2 6.9 24.2 7.8 21.8 6.9"]) },

  blueberry: { label:"Blueberry", swatch:"blueberry", i:
    I("M 16 9.6 C 20.7 9.6 24.5 13.4 24.5 18.1 C 24.5 22.8 20.7 26.6 16 26.6 C 11.3 26.6 7.5 22.8 7.5 18.1 C 7.5 13.4 11.3 9.6 16 9.6 Z",
      ["M 12.8 14.6 C 14 12.6 18 12.6 19.2 14.6", "M 16 12.9 L 16 15.8"]) },

  lemon: { label:"Lemon", swatch:"banana", i:
    I("M 5.6 17.4 C 5.6 12.4 10.3 8.9 16 8.9 C 21.7 8.9 26.4 12.4 26.4 17.4 C 26.4 22.4 21.7 25.4 16 25.4 C 10.3 25.4 5.6 22.4 5.6 17.4 Z",
      ["M 5.6 17.2 L 2.9 16.2","M 26.4 17.6 L 29.1 18.6","M 10.4 13.4 C 12.6 12 15 11.6 17.4 12"]) },

  orange: { label:"Citrus", swatch:"vanilla", i:
    I("M 16 5.4 C 21.9 5.4 26.6 10.1 26.6 16 C 26.6 21.9 21.9 26.6 16 26.6 C 10.1 26.6 5.4 21.9 5.4 16 C 5.4 10.1 10.1 5.4 16 5.4 Z",
      ["M 16 8.4 C 20.2 8.4 23.6 11.8 23.6 16 C 23.6 20.2 20.2 23.6 16 23.6 C 11.8 23.6 8.4 20.2 8.4 16 C 8.4 11.8 11.8 8.4 16 8.4 Z",
       "M 16 8.4 L 16 23.6","M 9.4 12.2 L 22.6 19.8","M 22.6 12.2 L 9.4 19.8"]) },

  /* Bean: a narrow ellipse leaned 35 degrees, with the crease as one S down
     the long axis -- the crease is the whole tell, so it has to be the boldest
     line in the drawing rather than a squiggle across the middle. */
  coffee: { label:"Coffee", swatch:"coffee", i:
    I("M 22.06 11.76 C 25.42 16.56 25.43 22.34 22.08 24.68 C 18.73 27.02 13.30 25.04 9.94 20.24 C 6.58 15.44 6.57 9.66 9.92 7.32 C 13.27 4.98 18.70 6.96 22.06 11.76 Z",
      ["M 10.8 8.6 C 14.6 11.6 12.6 15.0 15.6 17.4 C 18.6 19.8 17.6 21.4 21.2 23.4"]) },

  peanut: { label:"Peanut butter", swatch:"coffee", i:
    I("M 8.4 12.4 L 23.6 12.4 L 23.6 26.4 C 23.6 28 22.3 29.3 20.7 29.3 L 11.3 29.3 C 9.7 29.3 8.4 28 8.4 26.4 Z",
      ["M 6.8 7.6 L 25.2 7.6 L 25.2 12.4 L 6.8 12.4 Z",
       "M 11.6 19.6 C 14.2 17.6 17.8 17.6 20.4 19.6"]) },

  caramel: { label:"Caramel", swatch:"vanilla", i:
    I("M 16 6.4 C 16 6.4 8.6 16 8.6 21 C 8.6 25.1 11.9 28.4 16 28.4 C 20.1 28.4 23.4 25.1 23.4 21 C 23.4 16 16 6.4 16 6.4 Z",
      ["M 12.6 20.8 C 12.6 23.2 14 24.6 15.6 24.9"]) },

  /* Half a coconut: brown husk, white meat. Three dots on a plain circle was
     too weak to carry it -- the white ring is what names the fruit. */
  coconut: { label:"Coconut", swatch:"cocoa", i:
    I(O(16,16,11), [], ["13.2 13.4","18.4 12.6","15.6 17.4"],
      [{ c:"snow", d:O(16,16,7.6) }]) },

  /* Deliberately generic: one shell shape covers pistachio, hazelnut, almond
     and pecan, which is better than four near-identical ovals in the picker. */
  nut: { label:"Almond / nut", swatch:"matcha", i:
    I("M 16 4.2 C 21.4 8.6 24.6 14.6 24.6 19.4 C 24.6 24.6 20.8 28 16 28 C 11.2 28 7.4 24.6 7.4 19.4 C 7.4 14.6 10.6 8.6 16 4.2 Z",
      ["M 16 6.6 C 14.2 12.4 14 21.4 16 27.4"]) },

  cheesecake: { label:"Cheesecake", swatch:"vanilla", i:
    I("M 4.6 26.4 L 27.4 26.4 L 27.4 13.6 L 4.6 18.4 Z",
      ["M 4.6 22.6 L 27.4 21.4", "M 20.4 15.6 C 20.4 13.4 22 12 23.4 12"],
      ["23.4 11.4"]) },

  sprinkles: { label:"Sprinkles", swatch:"bubblegum", i:
    I("", ["M 6.6 12.4 L 10.6 8.4","M 14 8.6 L 18 11.6","M 21.4 6.6 L 24.6 10.6",
           "M 7.4 21.6 L 11.4 18.6","M 15.6 20.4 L 19.6 23.4","M 22.6 17.6 L 25.6 21.6",
           "M 11.4 26.4 L 15.4 24.4"]) },

  protein: { label:"Protein", swatch:"sky", i:
    I("M 10.4 11.4 L 21.6 11.4 L 21.6 26.6 C 21.6 28.2 20.3 29.5 18.7 29.5 L 13.3 29.5 C 11.7 29.5 10.4 28.2 10.4 26.6 Z",
      ["M 11.6 6.4 L 20.4 6.4 L 21.6 11.4 L 10.4 11.4 Z", "M 10.4 20.4 L 21.6 20.4"]) },

  sorbet: { label:"Sorbet pop", swatch:"bubblegum", i:
    I("M 16 3.4 C 20.6 3.4 24 6.4 24 10.4 L 24 20.4 C 24 22 22.7 23.4 21 23.4 L 11 23.4 C 9.3 23.4 8 22 8 20.4 L 8 10.4 C 8 6.4 11.4 3.4 16 3.4 Z",
      ["M 16 23.4 L 16 29.4",
       "M 8 15.6 C 10.4 17.6 13.4 16.6 16 15.6 C 18.6 14.6 21.6 15.6 24 16.6"]) },

  /* Steam over a bowl reads as soup. A leaf over the bowl says which tea. */
  matcha: { label:"Matcha", swatch:"matcha", i:
    I("M 5.4 15.6 L 26.6 15.6 C 26.6 15.6 25.2 27.2 16 27.2 C 6.8 27.2 5.4 15.6 5.4 15.6 Z",
      ["M 21.6 3.8 C 21.6 3.8 14.4 4.2 12.9 8.9 C 12 11.9 14.1 14.3 14.1 14.3 C 14.1 14.3 19.5 13.2 21.1 8.7 C 21.9 6.6 21.6 3.8 21.6 3.8 Z"]) },

  soda: { label:"Fizz", swatch:"sky", i:
    I("M 8.4 8.4 L 23.6 8.4 L 21.6 26.9 C 21.4 28.3 20.4 29.3 19 29.3 L 13 29.3 C 11.6 29.3 10.6 28.3 10.4 26.9 Z",
      ["M 8.4 8.4 C 8.4 6.9 11.8 5.7 16 5.7 C 20.2 5.7 23.6 6.9 23.6 8.4"],
      ["13.4 13.4","18.2 15.4","15.4 19.0","18.6 22.2"]) },

  /* ---- berries: one path of overlapping circles, so the drupelets read ---- */
  raspberry: { label:"Raspberry", swatch:"berry", i:
    I(O(10.8,15.4,3.5) + O(16,14.2,3.5) + O(21.2,15.4,3.5) +
      O(13.4,20.6,3.5) + O(18.6,20.6,3.5) + O(16,25.6,3.5),
      ["M 16 10.6 L 16 5.8", "M 16 6.6 C 13.6 5.4 11.6 6 10.8 7.4",
       "M 16 6.6 C 18.4 5.4 20.4 6 21.2 7.4"]) },

  blackberry: { label:"Blackberry", swatch:"grape", i:
    I(O(16,10.8,3.2) + O(12.6,15.8,3.2) + O(19.4,15.8,3.2) +
      O(16,20.4,3.2) + O(12.8,24.6,3.2) + O(19.2,24.6,3.2),
      ["M 16 7.4 L 16 3.6"]) },

  grape: { label:"Grape", swatch:"grape", i:
    I(O(10.6,13.8,3.0) + O(16,13.8,3.0) + O(21.4,13.8,3.0) +
      O(13.3,19.4,3.0) + O(18.7,19.4,3.0) + O(16,25,3.0),
      ["M 16 10.8 L 16 5.6",
       "M 16 6.4 C 18.4 3.6 22.4 3.4 24 4.6 C 23 7.4 20 9 17.4 8.6"]) },

  pomegranate: { label:"Pomegranate", swatch:"cherry", i:
    I(O(16,18.4,9.4),
      ["M 13.4 9.8 L 14.4 5.6 L 16 8.2 L 17.6 5.6 L 18.6 9.8"],
      ["13.0 16.0","19.0 16.0","16.0 19.6","13.2 22.2","18.8 22.2"]) },

  /* ---- stone & orchard fruit ---- */
  peach: { label:"Peach", swatch:"vanilla", fill:"#FFB07A", i:
    I("M 16 8.4 C 21.8 8.4 26 13 26 18.6 C 26 24.2 21.6 28.4 16 28.4 C 10.4 28.4 6 24.2 6 18.6 C 6 13 10.2 8.4 16 8.4 Z",
      ["M 16 9.4 C 14 14 14 24 16 27.8",
       "M 17 8.6 C 19 5.4 22.6 4.6 24.6 5.4 C 23.8 8.2 21 10 18.4 9.8"]) },

  apple: { label:"Apple", swatch:"cherry", i:
    I("M 16 11.2 C 13.8 9.2 10 9 7.8 11.6 C 5.4 14.4 5.8 20.2 8.4 24.4 C 10.2 27.4 12.6 28.8 14.4 28 C 15.4 27.6 16.6 27.6 17.6 28 C 19.4 28.8 21.8 27.4 23.6 24.4 C 26.2 20.2 26.6 14.4 24.2 11.6 C 22 9 18.2 9.2 16 11.2 Z",
      ["M 16 11 C 16 8 16.6 5.6 17.6 4",
       "M 17.2 6.6 C 19.4 4.4 22.8 4.4 24 5.6 C 23 8 20.2 9.4 17.8 9"]) },

  pear: { label:"Pear", swatch:"matcha", i:
    I("M 16 8.6 C 18.8 8.6 20.2 11 19.6 13.6 C 19 16.2 21.4 17.6 22.8 20 C 24.6 23.2 23 27.8 18.6 28.8 C 17.8 29 14.2 29 13.4 28.8 C 9 27.8 7.4 23.2 9.2 20 C 10.6 17.6 13 16.2 12.4 13.6 C 11.8 11 13.2 8.6 16 8.6 Z",
      ["M 16 8.4 C 16 6 16.4 4.4 17.2 3.2",
       "M 16.8 5.6 C 18.6 3.6 21.4 3.6 22.4 4.6 C 21.6 6.6 19.4 7.8 17.4 7.6"]) },

  /* ---- tropical & citrus ---- */
  pineapple: { label:"Pineapple", swatch:"banana", i:
    I("M 16 11.4 C 21 11.4 24.6 15 24.6 20 C 24.6 25.4 20.8 29.2 16 29.2 C 11.2 29.2 7.4 25.4 7.4 20 C 7.4 15 11 11.4 16 11.4 Z",
      ["M 8.8 17.2 L 19.2 28.4", "M 13.2 12.0 L 24.0 23.2",
       "M 23.2 17.2 L 12.8 28.4", "M 18.8 12.0 L 8.0 23.2",
       "M 16 11.4 L 16 3.6",
       "M 16 6.6 C 13.6 5.2 11.4 5.6 10.4 6.6 C 11.6 8.8 13.8 9.8 16 9.8",
       "M 16 6.6 C 18.4 5.2 20.6 5.6 21.6 6.6 C 20.4 8.8 18.2 9.8 16 9.8"]) },

  kiwi: { label:"Kiwi", swatch:"matcha", i:
    I(O(16,16,10.6),
      [O(16,16,7.2), O(16,16,2.4)],
      ["21.0 16.0","19.5 19.5","16.0 21.0","12.5 19.5",
       "11.0 16.0","12.5 12.5","16.0 11.0","19.5 12.5"]) },

  lime: { label:"Lime", swatch:"matcha", i:
    I("M 5.6 23.4 C 5.6 17 10.2 11.6 16 11.6 C 21.8 11.6 26.4 17 26.4 23.4 Z",
      ["M 7.2 22.2 C 8.0 17.8 11.6 14.6 16 14.6 C 20.4 14.6 24 17.8 24.8 22.2",
       "M 16 23.4 L 16 14.6", "M 16 23.4 L 9.4 17.4", "M 16 23.4 L 22.6 17.4",
       "M 16 23.4 L 7.4 20.4", "M 16 23.4 L 24.6 20.4"]) },

  avocado: { label:"Avocado", swatch:"matcha", i:
    I("M 16 6.6 C 19.6 6.6 21.6 9.4 20.8 12.8 C 20 16 23.4 17.6 24.4 21 C 25.6 25 22.4 29 16 29 C 9.6 29 6.4 25 7.6 21 C 8.6 17.6 12 16 11.2 12.8 C 10.4 9.4 12.4 6.6 16 6.6 Z",
      [], [], [{ c:"cocoa", d:O(16,21.2,5.0) }]) },

  /* ---- nuts, grain, corn ---- */
  /* Grains have to sweep UP from where they join the stem. Angled down they are
     fir needles, and the whole thing reads as a Christmas tree -- which is
     exactly what the first two attempts drew. */
  oat: { label:"Oats", swatch:"banana", i:
    I("M 16 22 C 17.6 18.4 20 16.6 21.6 17.4 C 22.2 19.6 20 22.4 16 22 Z" +
      "M 16 22 C 14.4 18.4 12 16.6 10.4 17.4 C 9.8 19.6 12 22.4 16 22 Z" +
      "M 16 17 C 17.6 13.4 20 11.6 21.6 12.4 C 22.2 14.6 20 17.4 16 17 Z" +
      "M 16 17 C 14.4 13.4 12 11.6 10.4 12.4 C 9.8 14.6 12 17.4 16 17 Z" +
      "M 16 12 C 14.6 9 14.8 6 16 4.4 C 17.2 6 17.4 9 16 12 Z",
      ["M 16 29.6 L 16 12"]) },

  popcorn: { label:"Popcorn", swatch:"snow", i:
    I(O(12.6,11.6,3.6) + O(19.4,11.0,3.8) + O(16,14.2,3.4),
      [], [],
      [{ c:"cherry", d:"M 9.4 15.6 L 22.6 15.6 L 21 28.4 C 20.9 29.2 20.2 29.8 19.4 29.8 L 12.6 29.8 C 11.8 29.8 11.1 29.2 11 28.4 Z" }]) },

  /* ---- bakery & sweets ---- */
  brownie: { label:"Brownie", swatch:"cocoa", i:
    I("M 5.6 12.6 L 26.4 12.6 L 26.4 24 C 26.4 24.8 25.8 25.4 25 25.4 L 7 25.4 C 6.2 25.4 5.6 24.8 5.6 24 Z",
      ["M 5.6 16.6 C 9 15.4 12 17.2 16 16.6 C 20 16 23 17.2 26.4 16.4"],
      ["10.6 20.6","16 21.4","21.4 20.4"]) },

  donut: { label:"Donut", swatch:"bubblegum", er:true, i:
    I(O(16,16,11) + O(16,16,4),
      ["M 16 5.4 L 16 7.0", "M 11.6 10.2 L 10.4 9.0", "M 20.4 10.2 L 21.6 9.0",
       "M 9.0 15.2 L 7.4 14.8", "M 23.0 15.2 L 24.6 14.8",
       "M 11.0 21.4 L 9.8 22.8", "M 21.0 21.4 L 22.2 22.8", "M 16 25.0 L 16 26.6"]) },

  cupcake: { label:"Cupcake", swatch:"snow", i:
    I("M 8 17.6 C 8 12.4 11.6 8.4 16 8.4 C 20.4 8.4 24 12.4 24 17.6 Z",
      ["M 13.4 17.8 L 12.6 29.6", "M 16 17.8 L 16 29.8", "M 18.6 17.8 L 19.4 29.6"],
      ["16 5.6"],
      [{ c:"bubblegum", d:"M 8.4 17.6 L 23.6 17.6 L 21.6 28.4 C 21.5 29.2 20.8 29.8 20 29.8 L 12 29.8 C 11.2 29.8 10.5 29.2 10.4 28.4 Z" }]) },

  waffle: { label:"Waffle", swatch:"vanilla", i:
    I(O(16,16,10.8),
      ["M 6.4 11.4 L 25.6 11.4", "M 5.4 16 L 26.6 16", "M 6.4 20.6 L 25.6 20.6",
       "M 11.4 6.4 L 11.4 25.6", "M 16 5.4 L 16 26.6", "M 20.6 6.4 L 20.6 25.6"]) },

  marshmallow: { label:"Marshmallow", swatch:"snow", i:
    I("M 8.4 12.4 C 8.4 10.4 11.8 9 16 9 C 20.2 9 23.6 10.4 23.6 12.4 L 23.6 23.6 C 23.6 25.6 20.2 27 16 27 C 11.8 27 8.4 25.6 8.4 23.6 Z",
      ["M 23.6 12.4 C 23.6 14.4 20.2 15.8 16 15.8 C 11.8 15.8 8.4 14.4 8.4 12.4"]) },

  lollipop: { label:"Lollipop", swatch:"bubblegum", i:
    I(O(16,12.6,8.4),
      ["M 16 12.6 C 16 11 17.6 10.2 19 10.8 C 21 11.6 21.6 14.6 20 16.8 C 18 19.6 13.6 20 10.8 17.6 C 7.6 14.8 7.6 9.6 11 6.6",
       "M 16 21 L 16 29.4"]) },

  /* ---- spice, floral, syrup ---- */
  vanilla: { label:"Vanilla", swatch:"coffee", i:
    I("M 15.56 16.05 C 16.66 22.31 16.41 27.58 15.00 27.83 C 13.59 28.08 11.54 23.21 10.44 16.95 C 9.34 10.70 9.59 5.42 11.00 5.17 C 12.41 4.92 14.46 9.80 15.56 16.05 Z" +
      "M 16.44 16.05 C 15.34 22.31 15.59 27.58 17.00 27.83 C 18.41 28.08 20.46 23.21 21.56 16.95 C 22.66 10.70 22.41 5.42 21.00 5.17 C 19.59 4.92 17.54 9.80 16.44 16.05 Z", []) },

  cinnamon: { label:"Cinnamon", swatch:"cocoa", i:
    I("M 9.4 24.6 L 21.4 6.6 C 22.2 5.4 23.8 5 25 5.8 C 26.2 6.6 26.6 8.2 25.8 9.4 L 13.8 27.4 C 13 28.6 11.4 29 10.2 28.2 C 9 27.4 8.6 25.8 9.4 24.6 Z",
      ["M 10.6 26.8 C 12 27.8 13.8 27 13.6 25.4 C 13.4 24 11.8 23.6 11 24.6"]) },

  lavender: { label:"Lavender", swatch:"lavender", i:
    I(O(16,6.2,2.5) + O(13.1,9.8,2.5) + O(18.9,9.8,2.5) +
      O(14.3,13.8,2.5) + O(17.7,13.8,2.5),
      ["M 16 29.4 C 16 24 16 20 16 15.6",
       "M 16 21.4 C 13.6 20.4 12.4 21.4 12 22.8", "M 16 23.8 C 18.4 22.8 19.6 23.8 20 25.2"]) },

  honey: { label:"Honey", swatch:"banana", i:
    I("M 16 5.6 L 25 10.8 L 25 21.2 L 16 26.4 L 7 21.2 L 7 10.8 Z",
      ["M 16 10.4 L 20.8 13.2 L 20.8 18.8 L 16 21.6 L 11.2 18.8 L 11.2 13.2 Z"]) },

  /* ---- drinks ---- */
  tea: { label:"Tea", swatch:"vanilla", i:
    I("M 8.4 12.6 L 22.6 12.6 L 21.4 24 C 21.2 25.6 19.9 26.8 18.3 26.8 L 12.7 26.8 C 11.1 26.8 9.8 25.6 9.6 24 Z",
      ["M 22.4 15 C 25.4 15 27 16.6 27 18.4 C 27 20.2 25.4 21.6 22.6 21.6",
       "M 12.4 12.6 C 12.4 9 10.4 7.4 8 7.4",
       "M 4.4 5.4 L 8 5.4 L 8 9.2 L 4.4 9.2 Z"]) },

  boba: { label:"Boba", swatch:"vanilla", i:
    I("M 9 10.6 L 23 10.6 L 21.4 27.4 C 21.3 28.6 20.3 29.5 19.1 29.5 L 12.9 29.5 C 11.7 29.5 10.7 28.6 10.6 27.4 Z",
      ["M 17.4 10.6 L 21.4 3.6"],
      ["13.4 25.6","16.4 26.0","19.0 25.4","14.8 22.6","18.0 22.4"]) }
};

var UI = {
  scoop:    { label:"Empty shelf", i: FLAVOURS.softserve.i },
  cloud:    { label:"Offline", i:
    I("M 10.2 24.6 C 6.4 24.6 3.4 21.6 3.4 17.8 C 3.4 14.2 6.1 11.3 9.6 11.05 C 10.9 7.5 14.3 5 18.3 5 C 23 5 26.9 8.6 27.3 13.2 C 29 14.1 30.2 15.9 30.2 18.1 C 30.2 21.7 27.3 24.6 23.7 24.6 Z",
      [], ["11.6 29","17.4 29","23.2 29"]) },
  pencil:   { label:"Write", i:
    I("M 5.6 26.4 L 5.6 21.2 L 20.8 6 L 26 11.2 L 10.8 26.4 Z",
      ["M 17.8 9 L 23 14.2","M 5.6 21.2 L 10.8 26.4"]) },
  camera:   { label:"Photo", i:
    I("M 4.4 11.4 L 10.2 11.4 L 12.2 8 L 19.8 8 L 21.8 11.4 L 27.6 11.4 C 28.8 11.4 29.6 12.2 29.6 13.4 L 29.6 24.6 C 29.6 25.8 28.8 26.6 27.6 26.6 L 4.4 26.6 C 3.2 26.6 2.4 25.8 2.4 24.6 L 2.4 13.4 C 2.4 12.2 3.2 11.4 4.4 11.4 Z",
      ["M 16 13.6 C 19 13.6 21.4 16 21.4 19 C 21.4 22 19 24.4 16 24.4 C 13 24.4 10.6 22 10.6 19 C 10.6 16 13 13.6 16 13.6 Z"]) },
  install:  { label:"Add to home", i:
    I("M 10.4 2.6 L 21.6 2.6 C 22.9 2.6 24 3.7 24 5 L 24 27 C 24 28.3 22.9 29.4 21.6 29.4 L 10.4 29.4 C 9.1 29.4 8 28.3 8 27 L 8 5 C 8 3.7 9.1 2.6 10.4 2.6 Z",
      ["M 16 11.4 L 16 20.6","M 11.4 16 L 20.6 16"]) },
  sent:     { label:"Sent", i:
    I("M 4.4 7.4 L 27.6 7.4 C 28.5 7.4 29.2 8.1 29.2 9 L 29.2 23 C 29.2 23.9 28.5 24.6 27.6 24.6 L 4.4 24.6 C 3.5 24.6 2.8 23.9 2.8 23 L 2.8 9 C 2.8 8.1 3.5 7.4 4.4 7.4 Z",
      ["M 3.4 8.4 L 16 18.4 L 28.6 8.4"]) },
  star:     { label:"Star", i:
    I("M 16 3.4 L 20.1 11.7 L 29.3 13 L 22.6 19.5 L 24.2 28.6 L 16 24.3 L 7.8 28.6 L 9.4 19.5 L 2.7 13 L 11.9 11.7 Z", []) },
  starHalf: { label:"Half star", i:
    I("M 16 3.4 L 20.1 11.7 L 29.3 13 L 22.6 19.5 L 24.2 28.6 L 16 24.3 L 7.8 28.6 L 9.4 19.5 L 2.7 13 L 11.9 11.7 Z",
      ["M 16 3.4 L 16 24.3"]) },
  back:     { label:"Back", i: I("", ["M 19.4 5.6 L 10 16 L 19.4 26.4"]) },
  check:    { label:"Done", i: I("", ["M 5.6 16.6 L 12.8 24 L 26.4 8.4"]) },
  plus:     { label:"New", i: I("", ["M 16 5.6 L 16 26.4","M 5.6 16 L 26.4 16"]) },
  close:    { label:"Remove", i: I("", ["M 7.6 7.6 L 24.4 24.4","M 24.4 7.6 L 7.6 24.4"]) }
};

var GROUPS = [
  ["Berries",            ["strawberry","raspberry","blackberry","blueberry","cherry","grape","pomegranate"]],
  ["Orchard &amp; stone", ["apple","pear","peach","banana"]],
  ["Tropical &amp; citrus",["mango","pineapple","kiwi","watermelon","coconut","lemon","lime","orange","avocado"]],
  ["Chocolate &amp; cookies",["chocolate","chocoBanana","cookie","oreo","brownie","caramel"]],
  ["Bakery &amp; sweets", ["cheesecake","cupcake","donut","waffle","marshmallow","lollipop","sprinkles","sorbet","softserve"]],
  ["Garden, nuts &amp; grain",["pumpkin","nut","peanut","oat","popcorn","olive","protein"]],
  ["Spice, floral &amp; drinks",["vanilla","cinnamon","lavender","matcha","mint","coffee","tea","boba","soda","honey"]],
  ["Not a flavour",      ["fish"]]
];


/// An icon's own colour wins over the recipe's swatch when it declares one.
function accentFor(f) { return f.fill || SWATCH[f.swatch] || SWATCH.snow; }

/// Render one icon. The size argument is optional; CSS sizes it otherwise.
function svgFor(def, size) {
  var out = '<svg class="ico" viewBox="0 0 32 32"' +
            (size ? ' width="' + size + '" height="' + size + '"' : '') + ' aria-hidden="true">';
  if (def.body) out += '<path class="body"' + (def.er ? ' fill-rule="evenodd"' : '') + ' d="' + def.body + '"/>';
  (def.parts || []).forEach(function (p) {
    out += '<path class="part" style="--pc:' + (SWATCH[p.c] || p.c) + '" d="' + p.d + '"/>';
  });
  def.l.forEach(function (p) { out += '<path d="' + p + '"/>'; });
  def.d.forEach(function (p) { out += '<path class="dot" d="M ' + p + ' h0"/>'; });
  return out + '</svg>';
}

/// The markup for a recipe's icon, ready to drop in a tile.
function iconMarkup(key) {
  var f = FLAVOURS[key];
  if (!f) return "";
  return '<span class="ico-wrap" style="--accent:' + accentFor(f) + '">' + svgFor(f.i) + '</span>';
}

var CATS = ["protein", "cream", "sorbet"];
var CAT_LABEL = { protein: "Protein / froyo", cream: "Ice cream", sorbet: "Sorbet" };

var CLASSIC_BASE = [
  ["400 ml", "Milk"],
  ["40 g", "Sugar, monk fruit, or any sweetener"],
  ["pinch", "Salt"],
  ["¼ tsp", "Xanthan gum"],
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
if (!DB.myStars) DB.myStars = {};   // recipeId -> my community stars (0.5-5)

// Personal ratings used to be out of 10. Stars are out of 5, so halve any
// existing score once and mark the shelf as migrated. Without this an old
// 8/10 would silently read as 8 stars.
if (DB.v !== 2) {
  Object.keys(DB.logs || {}).forEach(function (id) {
    var lg = DB.logs[id];
    if (lg && typeof lg.rating === "number") {
      lg.rating = Math.max(0.5, Math.min(5, Math.round(lg.rating) / 2));
    }
  });
  DB.v = 2;
  save();
}
function save() { localStorage.setItem(KEY, JSON.stringify(DB)); }
function recipeById(id) { return DB.recipes.find(function (r) { return r.id === id; }); }
function logFor(id) {
  if (!DB.logs[id]) DB.logs[id] = { rating: null, adjustments: [] };
  return DB.logs[id];
}
function tried(id) { return logFor(id).rating !== null; }

function applyRating(recipeId, stars) {
  var prev = DB.myStars[recipeId];
  DB.myStars[recipeId] = stars; save();
  if (VIEW.name === "remote" && VIEW.id === recipeId) showRemote(recipeId);
  sendRating(recipeId, stars).then(function (d) {
    var w = (CAT || []).find(function (x) { return x.id === recipeId; });
    if (w) w.rating = { avg: d.avg, count: d.count };
    if (VIEW.name === "remote" && VIEW.id === recipeId) showRemote(recipeId);
  }).catch(function (err) {
    if (prev === undefined) delete DB.myStars[recipeId]; else DB.myStars[recipeId] = prev;
    save();
    if (VIEW.name === "remote" && VIEW.id === recipeId) showRemote(recipeId);
    alert((err && err.error) || "Couldn't save your rating. Try again in a bit.");
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
  return '<header class="top"><img src="/icon-180.png" alt=""><div><h1>Spin It</h1>' + SQUIGGLE + '</div>' +
    '<button class="palbtn" data-act="palette-open" aria-label="Colour themes">' +
    '<span style="background:' + PALETTES[CUR_PALETTE].vars["--pop"] + '"></span>' +
    '<span style="background:' + PALETTES[CUR_PALETTE].vars["--card"] + '"></span>' +
    '</button></header>' +
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
    var comm = communityFor(r.id);
    return '<div class="scard' + (isTried ? "" : " untried") + '" data-act="open-local" data-id="' + r.id + '">' +
      '<span class="badge">' + (isTried ? "\u2605 " + fmtScore(lg.rating) : "not yet") + '</span>' +
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
    'Your recipes, photos and ratings live on this device. Nothing is shared unless you choose to.</div>';
  window.scrollTo(0, 0);
}

function showLocal(id) {
  var r = recipeById(id);
  if (!r) return renderShelf();
  VIEW = { name: "local", id: id };
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
  var mine = DB.myStars[w.id] || 0;
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

    '<label>Base</label>' +
    '<div class="basechips">' +
    '<button class="chip" data-act="base-mode" data-id="classic" data-on="' + (EDIT.baseMode === "classic" ? 1 : 0) + '">Classic base</button>' +
    '<button class="chip" data-act="base-mode" data-id="custom" data-on="' + (EDIT.baseMode === "custom" ? 1 : 0) + '">My own base</button>' +
    '</div>' +
    '<div id="basebox" style="' + (EDIT.baseMode === "custom" ? "" : "display:none") + '">' +
    '<div class="basehint">Anything goes: chocolate Fairlife, Greek yogurt, watermelon and Sprite…</div>' +
    '<div style="height:7px"></div>' +
    '<div id="bings">' + EDIT.customBase.map(baseRowHTML).join("") + '</div>' +
    '<button class="btn ghost small" data-act="add-bing">+ base ingredient</button>' +
    '</div>' +
    '<div class="basehint" id="classichint" style="' + (EDIT.baseMode === "classic" ? "" : "display:none") + '">' +
    '400 ml milk · 40 g sweetener · pinch of salt · ¼ tsp xanthan gum</div>' +

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
      method: w.method || "", ingredients: w.ingredients, customBase: w.customBase || null,
      origin: "saved", author: w.author });
    save(); showRemote(id);
  }
  else if (act === "sort-cat") { SORT = id; renderCatalogue(); }
  else if (act === "palette-open") showPalettes();
  else if (act === "palette-pick") { applyPalette(id, true); showPalettes(); }
  else if (act === "rate-remote") {
    var pick = parseInt(el.getAttribute("data-stars"), 10);
    applyRating(id, nextStars(DB.myStars[id] || 0, pick));
  }
  else if (act === "rate-local") {
    var lgR = logFor(id);
    lgR.rating = nextStars(lgR.rating === null ? 0 : lgR.rating, parseInt(el.getAttribute("data-stars"), 10));
    save();
    showLocal(id);
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
    { src: "/icon-180.png", sizes: "180x180", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  ],
});

// Shell cached so the app opens instantly and offline; the catalogue is
// network-first so an approval is never hidden behind a stale cache.
export const SERVICE_WORKER = `
const SHELL = "churn-shell-v15";
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
