// The flavour icon set as page-ready JS source, interpolated into both the
// web app and the admin page so there is exactly one copy. Keep this file
// free of backticks and dollar-brace: it lands inside template literals.
export const ICON_SOURCE = String.raw`
var SWATCH = {
  banana:"#FFC42E", vanilla:"#FF9F45", pumpkin:"#FF6B1A", mango:"#FF8C1A", cherry:"#E22B47",
  berry:"#E8336F", bubblegum:"#FF7BC1", grape:"#8B4DE8", lavender:"#B79CFF", blueberry:"#4353FF",
  sky:"#3BB8FF", mint:"#00D49B", matcha:"#86C232", olive:"#9BC72B", cocoa:"#B0632F",
  coffee:"#8B5E3C", charcoal:"#494A5A", snow:"#F2EDE4",
};



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
    /* Both cherries carry the red: the first is the body, the second is a
       part shape with the same colour, so neither is left hollow in colour mode. */
    I("M 9.6 17.2 C 12.5 17.2 14.8 19.5 14.8 22.4 C 14.8 25.3 12.5 27.6 9.6 27.6 C 6.7 27.6 4.4 25.3 4.4 22.4 C 4.4 19.5 6.7 17.2 9.6 17.2 Z",
      ["M 9.6 17.2 C 11.4 11.4 15.4 7.2 21.4 5.4", "M 22.2 18.2 C 22.4 13.4 22 9.2 21.4 5.4",
       "M 21.4 5.4 C 23.4 2.8 27.2 2.8 28.4 4.4 C 27.2 6.9 24.2 7.8 21.8 6.9"],
      null,
      [{ c:"cherry", d:"M 22.2 18.2 C 25.1 18.2 27.4 20.5 27.4 23.4 C 27.4 26.3 25.1 28.6 22.2 28.6 C 19.3 28.6 17 26.3 17 23.4 C 17 20.5 19.3 18.2 22.2 18.2 Z" }]) },

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

  peanutButter: { label:"Peanut butter", swatch:"coffee", i:
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

  peanut: { label:"Peanut", fill:"#E0A85C", i:
    I("M 16 4.5 C 20 4.5 22.5 7.5 22.5 10.8 C 22.5 13 21.3 14.7 19.8 16 C 21.8 17.6 23.2 19.9 23.2 22.3 C 23.2 25.6 20 27.9 16 27.9 C 12 27.9 8.8 25.6 8.8 22.3 C 8.8 19.9 10.2 17.6 12.2 16 C 10.7 14.7 9.5 13 9.5 10.8 C 9.5 7.5 12 4.5 16 4.5 Z",
      ["M 12.2 16 C 14.6 17.1 17.4 17.1 19.8 16",
       "M 13.2 8.9 C 14.9 8 17.1 8 18.8 8.9"]) },

  pistachio: { label:"Pistachio", fill:"#E8C79A", i:
    /* Shell with the kernel showing through the crack; the lens is a part so
       it goes pistachio-green in colour mode and stays line work in one-ink. */
    I("M 16 4.6 C 21.6 4.6 25.4 9.4 25.4 15.4 C 25.4 21.9 21.2 27.4 16 27.4 C 10.8 27.4 6.6 21.9 6.6 15.4 C 6.6 9.4 10.4 4.6 16 4.6 Z",
      [],
      null,
      [{ c:"matcha", d:"M 16 6.4 C 18.2 9.6 19 13.4 19 16 C 19 19.4 17.8 23.4 16 25.8 C 14.2 23.4 13 19.4 13 16 C 13 13.4 13.8 9.6 16 6.4 Z" }]) },

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
  ["Garden, nuts &amp; grain",["pumpkin","nut","peanut","pistachio","peanutButter","oat","popcorn","olive","protein"]],
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

/* ------------------------------------------------------------- the mark */

/// The swirl-cup, as an inline SVG that inherits its colours from CSS, so the
/// header logo re-inks itself with the palette. Same paths as the app icon.
function brandMark(cls) {
  return '<svg class="' + (cls || "brandmark") + '" viewBox="0 0 120 120" aria-hidden="true">' +
    '<g transform="translate(60 60) scale(0.82) translate(-60 -61.5)">' +
    '<path d="M 24.4 80.5 L 33.2 105.4 C 34 107.7 36 109.3 38.4 109.7 C 45.6 110.9 74.4 110.9 81.6 109.7 C 84 109.3 86 107.7 86.8 105.4 L 95.6 80.5"/><path d="M 97 76 C 97 79.87 80.44 83 60 83 C 39.56 83 23 79.87 23 76 C 23 72.13 39.56 69 60 69 C 80.44 69 97 72.13 97 76 Z"/><path d="M 60.00 13.40 C 60.36 13.61 61.47 14.18 62.19 14.68 C 62.90 15.18 63.68 15.77 64.29 16.41 C 64.91 17.05 65.51 17.78 65.90 18.52 C 66.28 19.26 66.56 20.07 66.59 20.85 C 66.62 21.62 66.47 22.43 66.09 23.17 C 65.71 23.91 65.10 24.65 64.32 25.28 C 63.55 25.91 62.52 26.50 61.45 26.98 C 60.38 27.45 59.10 27.85 57.91 28.14 C 56.72 28.43 55.40 28.61 54.31 28.72 C 53.22 28.83 52.12 28.83 51.36 28.80 C 50.59 28.78 49.97 28.65 49.71 28.55 C 49.46 28.45 49.48 28.28 49.85 28.19 C 50.22 28.10 50.95 27.99 51.94 27.99 C 52.93 28.00 54.30 28.04 55.78 28.21 C 57.26 28.38 59.07 28.64 60.81 29.02 C 62.54 29.40 64.50 29.91 66.18 30.51 C 67.86 31.11 69.59 31.85 70.89 32.64 C 72.19 33.43 73.34 34.34 73.99 35.25 C 74.63 36.16 74.94 37.16 74.74 38.09 C 74.54 39.03 73.87 40.01 72.80 40.87 C 71.73 41.73 70.13 42.58 68.32 43.28 C 66.51 43.97 64.21 44.59 61.94 45.06 C 59.67 45.53 57.04 45.87 54.71 46.08 C 52.37 46.30 49.89 46.36 47.91 46.33 C 45.94 46.31 44.08 46.14 42.86 45.94 C 41.64 45.74 40.79 45.43 40.62 45.15 C 40.44 44.88 40.83 44.54 41.79 44.31 C 42.76 44.07 44.40 43.83 46.40 43.75 C 48.40 43.66 51.07 43.65 53.80 43.80 C 56.54 43.95 59.80 44.23 62.81 44.67 C 65.82 45.10 69.11 45.70 71.86 46.43 C 74.60 47.15 77.32 48.04 79.28 48.99 C 81.24 49.94 82.84 51.05 83.61 52.13 C 84.37 53.21 84.51 54.40 83.87 55.49 C 83.23 56.59 81.78 57.71 79.78 58.69 C 77.78 59.66 74.94 60.59 71.87 61.34 C 68.80 62.08 65.00 62.71 61.37 63.14 C 57.73 63.58 53.63 63.85 50.07 63.97 C 46.51 64.08 42.83 64.00 40.00 63.83 C 37.16 63.65 34.61 63.29 33.06 62.92 C 31.51 62.55 30.60 62.04 30.68 61.60 C 30.75 61.16 31.74 60.65 33.50 60.29 C 35.27 59.92 38.06 59.57 41.27 59.42 C 44.49 59.26 48.65 59.20 52.80 59.36 C 56.94 59.52 61.79 59.84 66.15 60.35 C 70.52 60.87 75.19 61.59 78.98 62.44 C 82.78 63.30 86.42 64.37 88.94 65.49 C 91.46 66.61 93.36 67.91 94.09 69.17 C 94.81 70.43 93.42 72.39 93.29 73.04"/>' +
    '</g></svg>';
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

/* ---------------------------------------------------- shared amount utils */

/// "1/4", "1 1/2", unicode fractions, "0.25", and "0,25" all become numbers.
function parseAmount(raw) {
  if (raw === null || raw === undefined) return null;
  var t = String(raw).trim().replace(",", ".");
  if (!t) return null;
  var VULGAR = { "¼":0.25, "½":0.5, "¾":0.75, "⅓":1/3, "⅔":2/3,
                 "⅛":0.125, "⅜":0.375, "⅝":0.625, "⅞":0.875 };
  var m = t.match(/^(\d+)?\s*([¼½¾⅓⅔⅛-⅞])$/);
  if (m) return (m[1] ? parseInt(m[1], 10) : 0) + VULGAR[m[2]];
  m = t.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (m && +m[3]) return +m[1] + (+m[2] / +m[3]);
  m = t.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m && +m[2]) return +m[1] / +m[2];
  var n = Number(t);
  return isNaN(n) ? null : n;
}

/// Numbers come back out the way a recipe says them: 0.25 is a quarter.
function fmtAmount(v) {
  if (v === null || v === undefined) return "";
  var whole = Math.floor(v), frac = v - whole;
  var FR = [[0.25, "¼"], [1/3, "⅓"], [0.5, "½"], [2/3, "⅔"], [0.75, "¾"]];
  for (var i = 0; i < FR.length; i++) {
    if (Math.abs(frac - FR[i][0]) < 0.01) return (whole ? whole : "") + FR[i][1];
  }
  return String(Math.round(v * 100) / 100);
}
`;
