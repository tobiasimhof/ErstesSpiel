// v0.33.0: Grafik-Probe, Teil 2 – was von Kenneys Modellen gebraucht wird,
// ohne three.js (deshalb in node testbar): welche Modelle aus welchem Paket,
// wie die Farbtafeln für „Farben: Spiel“ umgefärbt werden und aus welchen
// Stücken ein Band-Feld besteht.
//
// Alle Modelle eines Pakets färben sich über eine gemeinsame kleine
// Farbtafel (Textures/colormap.png, 512 × 512): 16 Spalten × 4 Bänder, jedes
// Feld 32 × 128 Bildpunkte, oben hell, unten dunkel. Für den Schalter
// „Farben: Spiel“ malen wir einzelne Felder in neuen Farben nach (die
// Helligkeit jedes Bildpunkts bleibt) – so bekommen z. B. die Dächer die
// Farbe ihres Reiters wie im Spiel (Tobias, Chat 23: „Ja lass uns beides
// probieren, damit ich alles sehen kann“).

import { inputSides } from '../core/belts.js';
import { DELTA } from '../core/dirs.js';
import { parseTileKey } from '../core/state.js';

export const KENNEY_DIR = 'assets/kenney';

// Welche Modelle die Probe aus welchem Paket lädt (ein Test prüft, dass
// genau diese Dateien im Projekt liegen).
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
    'fountain-round',
    'tree',
    'tree-high',
    'tree-crooked',
    'tree-high-round',
    'rock-large',
    'rock-small',
    'rock-wide',
    'fence',
    'fence-gate',
    'lantern',
    'road',
  ],
  'castle-kit': ['tree-log', 'tree-trunk', 'tree-large', 'tree-small'],
  'factory-kit': [
    'conveyor-long-part-middle',
    'conveyor-long-part-end',
    'machine',
    'machine-window',
    'machine-fortified',
    'machine-connection-hole',
    'hopper-square',
    'cog-a',
    'pipe-large',
    'robot-arm-a',
    'box-large',
    'box-wide',
    'box-long',
    'box-small',
    'button-floor-round',
    'cone',
    'indicator-special-lines',
  ],
};

// ---------- Farbtafeln ----------

// Ein Feld der Farbtafel: Spalte 0–15, Band 0–3 (0 = oben).
// Neue Farbe: entweder fest ('#rrggbb') oder 'gebäude' (die Farbe des Reiters).
//
// fantasy-town-kit / castle-kit: Band 3, Spalten 0–3 = rote und grüne Dächer;
// Band 2, Spalten 2–3 und Band 3, Spalten 14–15 = lila-grauer Stein.
// factory-kit: Band 3, Spalten 8–11 = blaue Maschinen; Spalten 0–7 = lila-graues
// Metall und die Bänder (Spalte 7 = Gurt, 5 = helle Teile, 1 = Rahmen).
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
  },
  'factory-kit': {
    // Maschinen in der Farbe ihres Reiters, das übrige Metall neutral grau
    spiel: [
      { band: 3, cols: [8, 9], color: 'gebäude' },
      { band: 3, cols: [10, 11], color: 'gebäude-hell' },
      { band: 3, cols: [0, 1], color: '#7e8086' },
      { band: 3, cols: [2, 3], color: '#56585e' },
      { band: 3, cols: [4, 5], color: '#9a9ca2' },
      { band: 3, cols: [6, 7], color: '#3a3b40' },
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

// Felder, die am Abend leuchten (Glas der Laterne)
export const GLOW = {
  'fantasy-town-kit': [{ band: 2, cols: [5], color: '#ffd27a' }],
};

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lighten(hex, f) {
  return '#' + hexRgb(hex).map((v) => Math.round(v + (255 - v) * f).toString(16).padStart(2, '0')).join('');
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
    if (hex === 'gebäude-hell') hex = lighten(buildingColor, 0.25);
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

// Malt nur die leuchtenden Felder auf schwarzem Grund (für emissiveMap)
export function glowPixels(data, width, height, rules) {
  const bw = width / 16;
  const bh = height / 4;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i + 1] = data[i + 2] = 0;
    data[i + 3] = 255;
  }
  for (const rule of rules) {
    const [r, g, b] = hexRgb(rule.color);
    for (const col of rule.cols) {
      for (let y = rule.band * bh; y < (rule.band + 1) * bh; y++) {
        for (let x = col * bw; x < (col + 1) * bw; x++) {
          const i = (y * width + x) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
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

