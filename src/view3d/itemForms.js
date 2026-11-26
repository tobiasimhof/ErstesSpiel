// v0.46.0: Waren auf dem Band mit eigenem Aussehen (Tobias, Chat 27: „damit
// man auch besser unterscheiden kann, was auf dem band liegt“; zum Probebild:
// „Die Probebilder haben mir sehr gut gefallen. Die sollen so groß bleiben wie
// sie sind“). Kenneys Pakete haben fast keine passenden Gegenstände, deshalb
// baut sich jede Ware aus wenigen einfachen Grundkörpern – kantig, flache
// Farben, dieselben Farben und Erkennungszeichen wie ihr Warenbild.
//
// Nur Daten, ohne three.js (in node testbar). items3d.js baut daraus je Ware
// ein Teil. Ein Teil ist:
//   { k: 'box',  c: Farbe, s: [breit, hoch, tief] }
//   { k: 'cyl',  c, s: [Radius oben, Radius unten, Höhe, Ecken] }   (Achse senkrecht)
//   { k: 'ball', c, s: [Radius, Ecken waagrecht, Ecken senkrecht] }
//   { k: 'ring', c, s: [Radius, Dicke, Ecken Rohr, Ecken Ring, Bogen] } (liegt in x–y)
//   { k: 'group', parts: [...], sc: Maßstab }
// dazu p: [x, y, z] (Mitte) und r: [x, y, z] (Drehung). Die Ware steht auf
// y = 0 (Oberkante des Bands) mitten im Feld; x ist die Laufrichtung.

const box = (c, s, p, r) => ({ k: 'box', c, s, p, r });
const cyl = (c, rTop, rBottom, h, p, r, seg = 12) => ({ k: 'cyl', c, s: [rTop, rBottom, h, seg], p, r });
const ball = (c, radius, p, seg = 12, rings = 8) => ({ k: 'ball', c, s: [radius, seg, rings], p });
const ring = (c, radius, tube, p, r, arc = Math.PI * 2) => ({ k: 'ring', c, s: [radius, tube, 6, 16, arc], p, r });
const group = (parts, p, r, sc = 1) => ({ k: 'group', parts, p, r, sc });

const QUARTER = Math.PI / 2;
// Die neuen Formen sind etwas größer gezeichnet (wie im Probebild, Chat 27)
const BIG = 1.15;
const big = (...parts) => [group(parts, [0, 0, 0], [0, 0, 0], BIG)];

// Zahnrad: Scheibe mit Zähnen und Nabe, liegt flach (Achse senkrecht)
function cog(c, radius, thick, p, r, teeth = 10) {
  const parts = [cyl(c, radius, radius, thick, [0, 0, 0], null, 16)];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    parts.push(box(c, [radius * 0.32, thick, radius * 0.3], [Math.cos(a) * radius * 1.08, 0, Math.sin(a) * radius * 1.08], [0, -a, 0]));
  }
  parts.push(cyl('#6e747c', radius * 0.3, radius * 0.3, thick * 1.2, [0, 0, 0], null, 10));
  return group(parts, p, r);
}

// Blüte aus Blättern um eine Mitte, liegt flach
function blossom(petal, center, p, r, size = 0.045) {
  const parts = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    parts.push(box(petal, [size * 1.1, 0.012, size * 0.5], [Math.cos(a) * size, 0, Math.sin(a) * size], [0, -a, 0]));
  }
  parts.push(cyl(center, size * 0.65, size * 0.65, 0.03, [0, 0, 0], null, 10));
  return group(parts, p, r);
}

// Verbandsrolle (liegt in Laufrichtung, daneben das lose Ende)
const roll = (c) => [cyl(c, 0.1, 0.1, 0.17, [0, 0.1, 0], [0, 0, QUARTER], 14), box('#e9e3d2', [0.17, 0.012, 0.12], [0, 0.006, 0.11])];

// Schale (Mörser, Kräutermischung): oben weit, unten schmal
const bowl = (c, inner, h = 0.1) => [cyl(c, 0.13, 0.08, h, [0, h / 2, 0], null, 14), cyl(inner, 0.115, 0.115, 0.008, [0, h + 0.001, 0], null, 14)];

export const ITEM_FORMS = {
  // ---------- Grundwaren (Formen wie bis v0.45.0, das Zahnrad jetzt mit Zähnen) ----------
  holzblock: [box('#cf9a5f', [0.22, 0.22, 0.22], [0, 0.11, 0])],
  steinblock: [box('#a7adb5', [0.22, 0.22, 0.22], [0, 0.11, 0])],
  eisenbarren: [box('#8e98a6', [0.28, 0.1, 0.16], [0, 0.05, 0])],
  holzplatte: [box('#c79459', [0.36, 0.06, 0.28], [0, 0.03, 0])],
  holzstab: [box('#c48d55', [0.42, 0.07, 0.07], [0, 0.035, 0]), box('#c48d55', [0.42, 0.07, 0.07], [0, 0.105, 0], [0, 0.25, 0])],
  steinplatte: [box('#c3c8ce', [0.36, 0.06, 0.28], [0, 0.03, 0])],
  steinzahnrad: [cog('#9aa1aa', 0.12, 0.07, [0, 0.035, 0])],
  eisenblech: [box('#a9b4c2', [0.26, 0.05, 0.22], [0, 0.025, 0])],
  eisenstange: [box('#9fa9b7', [0.42, 0.06, 0.06], [0, 0.03, 0])],

  // ---------- Mechanik ----------
  // Zahnrad aus Stein auf einer Holzwelle
  zahnradwelle: big(cyl('#b98a52', 0.035, 0.035, 0.44, [0, 0.13, 0], [0, 0, QUARTER], 8), cog('#9aa1aa', 0.1, 0.06, [0, 0.13, 0], [0, 0, QUARTER])),
  // zwei Zahnräder mit Holzachsen
  raederwerk: big(
    cog('#9aa1aa', 0.11, 0.06, [-0.06, 0.03, 0.03]),
    cog('#9aa1aa', 0.075, 0.06, [0.11, 0.06, -0.06]),
    cyl('#c48d55', 0.022, 0.022, 0.16, [-0.06, 0.08, 0.03], null, 8),
    cyl('#c48d55', 0.02, 0.02, 0.13, [0.11, 0.1, -0.06], null, 8),
  ),
  // Messing-Zahnräder auf einer Holzplatte
  uhrwerk: big(
    box('#6e4a2b', [0.26, 0.03, 0.2], [0, 0.015, 0]),
    cog('#c9a24a', 0.08, 0.035, [-0.04, 0.05, 0.01]),
    cog('#b0844f', 0.05, 0.035, [0.08, 0.05, -0.05], null, 8),
    cyl('#6e747c', 0.015, 0.015, 0.09, [-0.04, 0.06, 0.01], null, 6),
  ),

  // ---------- Metall ----------
  // Holzplatte mit zwei Eisenbändern
  verstaerkteholzplatte: big(
    box('#c79459', [0.36, 0.07, 0.28], [0, 0.035, 0]),
    box('#6e747c', [0.045, 0.078, 0.29], [-0.11, 0.035, 0]),
    box('#6e747c', [0.045, 0.078, 0.29], [0.11, 0.035, 0]),
  ),
  // zwei Bleche mit Stift
  scharnier: big(
    box('#a9b4c2', [0.13, 0.025, 0.17], [-0.075, 0.0125, 0]),
    box('#a9b4c2', [0.13, 0.025, 0.17], [0.075, 0.0125, 0]),
    cyl('#8e98a6', 0.028, 0.028, 0.19, [0, 0.028, 0], [QUARTER, 0, 0], 8),
  ),
  schluessel: big(
    ring('#c9a24a', 0.065, 0.022, [-0.12, 0.022, 0], [QUARTER, 0, 0]),
    box('#c9a24a', [0.22, 0.036, 0.036], [0.05, 0.02, 0]),
    box('#c9a24a', [0.036, 0.036, 0.085], [0.14, 0.02, 0.045]),
    box('#c9a24a', [0.036, 0.036, 0.06], [0.085, 0.02, 0.035]),
  ),
  // zwei Beine, oben das Messing-Gelenk
  zirkel: big(
    box('#b5bfcc', [0.026, 0.03, 0.28], [-0.04, 0.015, 0.01], [0, -0.28, 0]),
    box('#b5bfcc', [0.026, 0.03, 0.28], [0.04, 0.015, 0.01], [0, 0.28, 0]),
    cyl('#c9a24a', 0.036, 0.036, 0.045, [0, 0.025, -0.13], null, 10),
    cyl('#c9a24a', 0.014, 0.014, 0.06, [0, 0.07, -0.13], null, 6),
  ),
  // Stein mit Eisenring
  gewichtstein: big(cyl('#a7adb5', 0.08, 0.11, 0.15, [0, 0.075, 0], null, 10), ring('#6e747c', 0.035, 0.012, [0, 0.18, 0])),
  vorhaengeschloss: big(
    box('#8e98a6', [0.2, 0.17, 0.1], [0, 0.085, 0]),
    ring('#b5bfcc', 0.065, 0.02, [0, 0.17, 0], null, Math.PI),
    cyl('#2a2a2a', 0.018, 0.018, 0.02, [0, 0.09, 0.051], [QUARTER, 0, 0], 8),
  ),
  // Kasten mit Schlüsselloch, der Schlüssel steckt
  kastenschloss: big(
    box('#9aa3ad', [0.26, 0.16, 0.13], [0, 0.08, 0]),
    box('#7e8792', [0.2, 0.11, 0.012], [0, 0.08, 0.068]),
    cyl('#2a2a2a', 0.016, 0.016, 0.02, [0, 0.09, 0.075], [QUARTER, 0, 0], 8),
    box('#c9a24a', [0.022, 0.022, 0.06], [0, 0.09, 0.1]),
    ring('#c9a24a', 0.028, 0.01, [0, 0.09, 0.14], [0, QUARTER, 0]),
  ),

  // ---------- Uhren ----------
  // Holzkasten mit Zifferblatt und Messing-Pendel
  raederuhr: big(
    box('#8a5a2b', [0.18, 0.26, 0.1], [0, 0.13, 0]),
    cyl('#f4f1e8', 0.06, 0.06, 0.012, [0, 0.18, 0.053], [QUARTER, 0, 0], 14),
    box('#2a2018', [0.008, 0.045, 0.006], [0, 0.195, 0.061]),
    box('#2a2018', [0.035, 0.008, 0.006], [0.015, 0.18, 0.061]),
    cyl('#c9a24a', 0.028, 0.028, 0.012, [0, 0.07, 0.053], [QUARTER, 0, 0], 10),
  ),
  // dunkelblaue Scheibe mit Goldrand, Sonne und Mond, auf einem Fuß
  sternenuhr: big(
    box('#c9a24a', [0.14, 0.03, 0.08], [0, 0.015, 0]),
    cyl('#2b3f73', 0.13, 0.13, 0.04, [0, 0.16, 0], [QUARTER, 0, 0], 16),
    ring('#c9a24a', 0.13, 0.012, [0, 0.16, 0.02]),
    ball('#f2b705', 0.025, [0.04, 0.19, 0.025], 8, 6),
    ball('#e9e3d2', 0.018, [-0.05, 0.13, 0.025], 8, 6),
  ),

  // ---------- Bretter und Zeichnen ----------
  // Holzbrett mit hellem Papier und einem Kohlestrich
  zeichenbrett: big(
    box('#c79459', [0.34, 0.05, 0.26], [0, 0.025, 0]),
    box('#efe6cf', [0.28, 0.01, 0.2], [0, 0.055, 0]),
    box('#34302d', [0.14, 0.004, 0.012], [-0.03, 0.061, 0.02], [0, 0.4, 0]),
  ),
  // Etui aus Leder mit Messingverschluss, obenauf die Zirkelbeine
  reisszeug: big(
    box('#6b4428', [0.26, 0.07, 0.16], [0, 0.035, 0]),
    box('#5a3820', [0.26, 0.012, 0.16], [0, 0.075, 0]),
    box('#c9a24a', [0.04, 0.03, 0.012], [0, 0.05, 0.085]),
    box('#b5bfcc', [0.16, 0.012, 0.02], [-0.02, 0.087, -0.03], [0, 0.15, 0]),
  ),
  // wie das Zeichenbrett, dunkler gerahmt, mit Lineal und Zirkel
  reissbrett: big(
    box('#8a5a2b', [0.36, 0.05, 0.28], [0, 0.025, 0]),
    box('#efe6cf', [0.29, 0.01, 0.21], [0, 0.055, 0]),
    box('#c48d55', [0.32, 0.016, 0.035], [0, 0.068, 0.07]),
    box('#b5bfcc', [0.012, 0.012, 0.12], [0.06, 0.066, -0.03], [0, 0.3, 0]),
    box('#b5bfcc', [0.012, 0.012, 0.12], [0.1, 0.066, -0.03], [0, -0.3, 0]),
  ),

  // ---------- Kräuter ----------
  // Bündel aus Fasern mit einem Band
  flachsfaser: big(
    cyl('#e3d3a4', 0.02, 0.02, 0.3, [0, 0.02, -0.035], [0, 0, QUARTER], 6),
    cyl('#e3d3a4', 0.02, 0.02, 0.3, [0, 0.02, 0], [0, 0, QUARTER], 6),
    cyl('#e3d3a4', 0.02, 0.02, 0.3, [0, 0.02, 0.035], [0, 0, QUARTER], 6),
    cyl('#d8c690', 0.02, 0.02, 0.3, [0, 0.05, -0.018], [0, 0, QUARTER], 6),
    cyl('#d8c690', 0.02, 0.02, 0.3, [0, 0.05, 0.018], [0, 0, QUARTER], 6),
    cyl('#b59a62', 0.06, 0.06, 0.03, [0, 0.035, 0], [0, 0, QUARTER], 10),
  ),
  ringelbluete: big(
    blossom('#f08c00', '#b85a00', [-0.07, 0.02, 0.02], [0.3, 0, 0], 0.05),
    blossom('#f59f00', '#b85a00', [0.07, 0.04, -0.04], [0, 1, 0.3], 0.05),
    blossom('#f08c00', '#b85a00', [0.01, 0.03, 0.08], [0.2, 2, 0], 0.045),
  ),
  // flache weiße Dolden aus kleinen Kugeln auf grünen Stielen
  schafgarbenbluete: big(
    ...[
      [-0.06, 0.03],
      [0.07, -0.04],
    ].flatMap(([x, z]) => [
      cyl('#6a8f3a', 0.012, 0.012, 0.06, [x, 0.03, z], null, 6),
      ...[0, 1, 2, 3, 4, 5].map((i) => ball('#f4efdc', 0.028, [x + Math.cos(i) * 0.04, 0.07, z + Math.sin(i) * 0.04], 6, 4)),
      ball('#d8c98a', 0.028, [x, 0.075, z], 6, 4),
    ]),
  ),
  kamillenbluete: big(
    blossom('#ffffff', '#f2b705', [-0.08, 0.02, 0.02], [0, 0, 0]),
    blossom('#ffffff', '#f2b705', [0.07, 0.06, -0.05], [0.3, 1, 0]),
    blossom('#ffffff', '#f2b705', [0, 0.04, 0.09], [0.6, 2, 0]),
    blossom('#ffffff', '#f2b705', [0.02, 0.09, 0], [0.9, 3, 0]),
  ),
  // Holzschale mit Kräutern
  kraeutermischung: big(
    ...bowl('#9a6a3c', '#6f8f3a'),
    ball('#f4efdc', 0.022, [-0.04, 0.11, 0.02], 6, 4),
    ball('#ffffff', 0.022, [0.03, 0.11, -0.03], 6, 4),
    ball('#f2b705', 0.018, [0.04, 0.11, 0.04], 6, 4),
  ),

  // ---------- Verbände ----------
  verband: big(...roll('#f4f1e8')),
  // mit orangem Ringelblumen-Streifen
  heilverband: big(...roll('#f4f1e8'), cyl('#f59f00', 0.103, 0.103, 0.06, [0, 0.1, 0], [0, 0, QUARTER], 14)),
  // orange Streifen, obenauf ein weißer Schafgarben-Büschel
  wundverband: big(
    ...roll('#f4f1e8'),
    cyl('#f59f00', 0.103, 0.103, 0.05, [-0.04, 0.1, 0], [0, 0, QUARTER], 14),
    cyl('#f59f00', 0.103, 0.103, 0.05, [0.04, 0.1, 0], [0, 0, QUARTER], 14),
    ball('#f8f5ea', 0.03, [-0.02, 0.205, 0], 6, 4),
    ball('#f8f5ea', 0.03, [0.025, 0.2, 0.02], 6, 4),
    ball('#6a8f3a', 0.022, [0.01, 0.195, -0.03], 6, 4),
  ),
  // gefaltetes Tuch mit orangen Kräutern
  kraeuterkompresse: big(
    box('#efe3c2', [0.25, 0.05, 0.19], [0, 0.025, 0]),
    box('#f6ecd2', [0.25, 0.03, 0.1], [0, 0.065, -0.045]),
    box('#f08c00', [0.04, 0.012, 0.04], [-0.05, 0.085, -0.04], [0, 0.4, 0]),
    box('#f08c00', [0.035, 0.012, 0.035], [0.05, 0.085, -0.05], [0, 1.1, 0]),
  ),
  // verschnürtes Päckchen mit grünem Kreuz
  heilpaeckchen: big(
    box('#d6bd8e', [0.24, 0.12, 0.18], [0, 0.06, 0]),
    box('#7a5232', [0.245, 0.125, 0.02], [0, 0.06, 0]),
    box('#7a5232', [0.02, 0.125, 0.185], [0, 0.06, 0]),
    box('#5f8f3a', [0.08, 0.01, 0.025], [0.06, 0.125, 0.045]),
    box('#5f8f3a', [0.025, 0.01, 0.08], [0.06, 0.125, 0.045]),
  ),
  // kleines Kissen mit Kamillenblüte
  kamillenkissen: big(
    box('#e9dcc0', [0.28, 0.07, 0.2], [0, 0.035, 0]),
    box('#efe3c8', [0.24, 0.03, 0.16], [0, 0.08, 0]),
    blossom('#ffffff', '#f2b705', [0, 0.1, 0], null, 0.04),
  ),

  // ---------- Glas und Tränke ----------
  holzkohle: big(
    ball('#34302d', 0.065, [-0.06, 0.05, 0.02], 5, 3),
    ball('#2a2622', 0.06, [0.06, 0.045, -0.04], 5, 3),
    ball('#3d3833', 0.055, [0.03, 0.045, 0.07], 5, 3),
  ),
  // kantiger, grünlicher Glasklumpen
  glas: big(ball('#a8dcd9', 0.11, [0, 0.09, 0], 6, 4), ball('#d4f0ee', 0.05, [0.03, 0.15, 0.04], 5, 3)),
  flaeschchen: big(
    ball('#bfe6e2', 0.1, [0, 0.1, 0], 14, 10),
    cyl('#bfe6e2', 0.035, 0.04, 0.08, [0, 0.22, 0], null, 10),
    cyl('#b07a45', 0.03, 0.032, 0.05, [0, 0.28, 0], null, 10),
  ),
  // braune Flasche mit Korken und Etikett mit Kräuterblatt
  tinktur: big(
    box('#7a4a24', [0.15, 0.2, 0.11], [0, 0.1, 0]),
    cyl('#7a4a24', 0.03, 0.045, 0.05, [0, 0.225, 0], null, 10),
    cyl('#b07a45', 0.03, 0.03, 0.05, [0, 0.27, 0], null, 10),
    box('#efe3c2', [0.11, 0.08, 0.005], [0, 0.09, 0.057]),
    ball('#5f8f3a', 0.022, [0, 0.09, 0.062], 8, 6),
  ),
  // Steinschale mit Holzstößel
  moerser: big(...bowl('#a7adb5', '#5d636b', 0.11), cyl('#b07a45', 0.022, 0.032, 0.25, [0.04, 0.2, 0], [0, 0, -0.5], 8)),
  // v0.55.0: Traumtrank – bauchiges Fläschchen mit lila Trank und Korken
  traumtrank: big(
    ball('#7b4fc9', 0.105, [0, 0.105, 0], 14, 10),
    ball('#c9a7ff', 0.05, [0.03, 0.08, 0.06], 8, 6),
    cyl('#cfe9ee', 0.034, 0.042, 0.08, [0, 0.235, 0], null, 10),
    cyl('#b07a45', 0.03, 0.032, 0.05, [0, 0.295, 0], null, 10),
  ),
  // v0.57.0: Heilpuder – Leinensäckchen, oben offen mit goldgelbem Pulver, rotes Band
  heilpuder: big(
    cyl('#efe3c4', 0.085, 0.105, 0.15, [0, 0.075, 0], null, 12),
    cyl('#c2410c', 0.088, 0.088, 0.022, [0, 0.12, 0], null, 12),
    cyl('#efe3c4', 0.095, 0.08, 0.04, [0, 0.17, 0], null, 12),
    ball('#f2b705', 0.08, [0, 0.175, 0], 10, 6),
  ),
  // v0.57.0: Heiltrank – wie der Traumtrank, mit rotem Trank
  heiltrank: big(
    ball('#c92a2a', 0.105, [0, 0.105, 0], 14, 10),
    ball('#ff8787', 0.05, [0.03, 0.08, 0.06], 8, 6),
    cyl('#cfe9ee', 0.034, 0.042, 0.08, [0, 0.235, 0], null, 10),
    cyl('#b07a45', 0.03, 0.032, 0.05, [0, 0.295, 0], null, 10),
  ),
};

// Die Form einer Ware (fehlt eine, eine Kugel in ihrer Farbe)
export function itemForm(type, color = '#cccccc') {
  return ITEM_FORMS[type] ?? [ball(color, 0.11, [0, 0.11, 0])];
}

// Alle Grundkörper einer Form (Gruppen aufgelöst) – für die Tests
export function formParts(parts) {
  return parts.flatMap((part) => (part.k === 'group' ? formParts(part.parts) : [part]));
}
