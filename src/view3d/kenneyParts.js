// 3D-Test: was von Kenneys Modellen gebraucht wird, ohne three.js (deshalb
// in node testbar): welche Modelle aus welchem Paket, wie die Farbtafeln in
// die Farben des Spiels umgefärbt werden und aus welchen Stücken ein
// Band-Feld besteht.
//
// Alle Modelle eines Pakets färben sich über eine gemeinsame kleine
// Farbtafel (Textures/colormap.png, 512 × 512): 16 Spalten × 4 Bänder, jedes
// Feld 32 × 128 Bildpunkte, oben hell, unten dunkel. Für den Schalter
// „Farben: Spiel“ malen wir einzelne Felder in neuen Farben nach (die
// Helligkeit jedes Bildpunkts bleibt) – so bekommen z. B. die Dächer die
// Farbe ihres Reiters wie im Spiel (Tobias' Wahl aus der Grafik-Probe,
// Chat 23: „weil es mehr harmoniert“).

import { inputSides } from '../core/belts.js';
import { DELTA } from '../core/dirs.js';
import { parseTileKey } from '../core/state.js';

export const KENNEY_DIR = 'assets/kenney';

// Welche Modelle der 3D-Test aus welchem Paket lädt (ein Test prüft, dass
// genau diese Dateien im Projekt liegen und jede verbaut wird).
export const MODELS = {
  'fantasy-town-kit': [
    'wall-wood',
    'wall-wood-door',
    'wall-wood-window-shutters',
    'wall-wood-window-glass',
    'wall',
    'wall-door',
    'wall-window-stone',
    'wall-window-shutters',
    'roof-gable',
    'roof-high-gable',
    'chimney-base',
    'chimney',
    'chimney-top',
    'overhang',
    'watermill',
    'planks',
    'cart',
    'pillar-wood',
    'tree',
    'tree-high',
    'tree-crooked',
    'tree-high-round',
    'rock-large',
    'rock-small',
    'rock-wide',
    'fence',
    // v0.42.0: eigene Häuser für Steinmetz, Zimmerei, Feinschmiede, Schlosserei
    'wall-doorway-round',
    'wall-doorway-square-wide',
    'wall-wood-doorway-square-wide',
    'wall-window-round',
    'wall-window-small',
    'roof-point',
    'stall-bench',
    'planks-half',
    // v0.43.0: Erntebank, Webstube, Kräuterstube, Apotheke
    'stall-green',
    'wheel',
    'balcony-wall-fence',
    'banner-green',
    'lantern',
  ],
  // v0.34.0: das kleine Burgtor ist das Versandportal im Mittelalter (Tobias, Chat 24)
  // v0.42.0: Turm der Schmelzhütte, Felsen im Steinbruch, Eisengitter der Schlosserei
  // v0.43.0: Türme für Schreibstube (sechseckig, mit Fahne) und Uhrmacherei (eckig)
  'castle-kit': [
    'tree-log',
    'tree-trunk',
    'tree-large',
    'tree-small',
    'wall-narrow-gate',
    'tower-base',
    'tower-top',
    'rocks-large',
    'metal-gate',
    'tower-hexagon-base',
    'tower-hexagon-roof',
    'flag-pennant',
    'tower-square-base',
    'tower-square-roof',
  ],
  // die Bänder (in Holz umgefärbt); v0.42.0: ein Zahnrad (Messing bzw. als Sägeblatt Stahl)
  // v0.43.0: Glasrohre an der Apotheke
  'factory-kit': ['conveyor-long-part-middle', 'conveyor-long-part-end', 'cog-a', 'pipe-glass-large-long'],
};

// ---------- Farbtafeln ----------

// Ein Feld der Farbtafel: Spalte 0–15, Band 0–3 (0 = oben).
// Neue Farbe: entweder fest ('#rrggbb') oder 'gebäude' (die Farbe des Reiters).
//
// fantasy-town-kit / castle-kit: Band 3, Spalten 0–3 = rote und grüne Dächer;
// Band 2, Spalten 2–3 und Band 3, Spalten 14–15 = lila-grauer Stein.
// factory-kit: Band 3, Spalten 0–7 = lila-graues Metall der Bänder
// (Spalte 7 = Gurt, 5 = helle Teile, 1 = Rahmen).
const WARM_STONE = [
  { band: 2, cols: [2, 3], color: '#bdb3a3' },
  { band: 3, cols: [14, 15], color: '#8f877b' },
];
export const PALETTES = {
  'fantasy-town-kit': {
    spiel: [{ band: 3, cols: [0, 1, 2, 3], color: 'gebäude' }, ...WARM_STONE],
  },
  'castle-kit': {
    spiel: [{ band: 3, cols: [2, 3], color: '#bdb3a3' }],
    // v0.34.0: das Burgtor des Versandportals in warmem Steingrau wie die
    // Steinhäuser (statt Kenneys Sandstein): Band 3, Spalte 13 = Mauer, 15 = Kanten
    tor: [
      { band: 3, cols: [13], color: '#bdb3a3' },
      { band: 3, cols: [15], color: '#8f877b' },
    ],
    // v0.43.0: Türme in warmem Steingrau wie die Steinhäuser, Dach und Fahne
    // in der Farbe des Reiters (Band 2, Spalte 9 = Kenneys blaue Dächer)
    turm: [
      { band: 3, cols: [13], color: '#bdb3a3' },
      { band: 3, cols: [15], color: '#8f877b' },
      { band: 2, cols: [9], color: 'gebäude' },
    ],
    // v0.42.0: das Eisengitter der Schlosserei dunkler, wie geschmiedetes Eisen
    eisen: [
      { band: 3, cols: [5], color: '#6f757e' },
      { band: 3, cols: [7], color: '#4b5058' },
    ],
  },
  'factory-kit': {
    // v0.42.0 (Tobias, Chat 26: Möglichkeit B, Mittelalter mit ein paar
    // Technik-Teilen): das Zahnrad (Band 3, Spalten 1 und 5) in Messing für
    // die Feinschmiede, in Stahl als Sägeblatt der Zimmerei
    messing: [
      { band: 3, cols: [0, 1], color: '#7a5a24' },
      { band: 3, cols: [4, 5], color: '#c9a043' },
    ],
    stahl: [
      { band: 3, cols: [0, 1], color: '#5b5f66' },
      { band: 3, cols: [4, 5], color: '#b9bdc2' },
    ],
    // v0.43.0: Glasrohre der Apotheke – helles, grünliches Glas (Spalte 0)
    // mit Messingringen (Spalte 1)
    glas: [
      { band: 3, cols: [0], color: '#bfe8de' },
      { band: 3, cols: [1], color: '#9a7a34' },
    ],
    // Bänder im Mittelalter: Holz und Leder statt Metall (Tobias, Chat 23: ja)
    holz: [
      { band: 3, cols: [0, 1], color: '#6e4a2c' },
      { band: 3, cols: [2, 3], color: '#5e4029' },
      { band: 3, cols: [4, 5], color: '#b4834f' },
      { band: 3, cols: [6, 7], color: '#8a6039' },
    ],
  },
};

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Malt die Felder einer Farbtafel nach (rgba-Daten, Breite, Höhe).
// Jeder Bildpunkt behält seine Helligkeit im Verhältnis zum Mittel des Felds.
export function recolorPixels(data, width, height, rules, buildingColor = null) {
  // ohne Gebäude (Bäume, Zaun …) bleiben die Felder „gebäude“ grau-braun
  buildingColor ??= '#8a7a66';
  const bw = width / 16;
  const bh = height / 4;
  const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  for (const rule of rules) {
    let hex = rule.color;
    if (hex === 'gebäude') hex = buildingColor;
    const target = hexRgb(hex);
    for (const col of rule.cols) {
      const x0 = col * bw;
      const y0 = rule.band * bh;
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y0 + bh; y++) {
        for (let x = x0; x < x0 + bw; x++) {
          const i = (y * width + x) * 4;
          sum += lum(i);
          count++;
        }
      }
      const mean = Math.max(1, sum / count);
      for (let y = y0; y < y0 + bh; y++) {
        for (let x = x0; x < x0 + bw; x++) {
          const i = (y * width + x) * 4;
          const f = lum(i) / mean;
          for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round(target[c] * f)));
        }
      }
    }
  }
}

// ---------- Bänder ----------

// Drehung um die Hochachse, damit die +x-Seite eines Modells in Richtung dir zeigt
export const FACE = { E: 0, N: Math.PI / 2, W: Math.PI, S: -Math.PI / 2 };

// Höhe und Breite der Bänder (die Kenney-Bänder sind 0,4 hoch und ein
// ganzes Feld breit – wir nehmen die halbe Höhe und 80 % der Breite)
export const BELT_SCALE_Y = 0.5;
export const BELT_TOP = 0.4 * BELT_SCALE_Y;
export const BELT_WIDTH = 0.8;

// Welche Kenney-Teile ein Band-Feld braucht. Ergebnis: Liste von
// { name, x, y, z, rot, len } (Lage relativ zur Feldmitte, len = Länge im
// Verhältnis zum halben Stück).
// Gerade Strecken bestehen aus zwei halben Stücken: in der Mitte einer
// Strecke durchgehend, am Ende (an Gebäuden) mit rundem Abschluss.
// Kurven, Abzweige und Kreuzungen setzen sich aus „Armen“ zusammen – je
// verbundene Seite ein Stück vom Rand bis knapp über die Mitte; so passen sie
// in Breite und Farbe zu den geraden Strecken.
export function beltPieces(state, key) {
  const { x, y } = parseTileKey(key);
  const belt = state.belts[key];
  const conn = new Set([...belt.outs, ...inputSides(state, x, y)]);
  const has = (dir) => conn.has(dir);
  const beltNext = (dir) => has(dir) && Boolean(state.belts[`${x + DELTA[dir].x},${y + DELTA[dir].y}`]);
  const n = conn.size;
  const straight = n === 0 || n === 1 || (n === 2 && ((has('E') && has('W')) || (has('N') && has('S'))));
  if (straight) {
    const lead = [...conn][0] ?? belt.outs[0] ?? 'E';
    const [a, b] = lead === 'E' || lead === 'W' ? ['W', 'E'] : ['N', 'S'];
    // das Endstück hat seinen runden Abschluss auf seiner +x-Seite
    return [a, b].map((dir) => ({
      name: beltNext(dir) ? 'conveyor-long-part-middle' : 'conveyor-long-part-end',
      x: DELTA[dir].x * 0.25,
      y: 0,
      z: DELTA[dir].y * 0.25,
      rot: FACE[dir],
      len: 1,
    }));
  }
  const reach = BELT_WIDTH / 2; // so weit ragt jeder Arm über die Mitte
  const len = 0.5 + reach;
  const mid = (0.5 - reach) / 2;
  return [...conn].map((dir, i) => ({
    name: 'conveyor-long-part-middle',
    x: DELTA[dir].x * mid,
    y: -0.003 * i, // leicht versetzt, damit sich die Flächen in der Mitte nicht flackernd überlagern
    z: DELTA[dir].y * mid,
    rot: FACE[dir],
    len: len / 0.5,
  }));
}

