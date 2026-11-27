// v0.47.0: Pflanzen, die im Beet sichtbar wachsen (Tobias, Chat 28: „die Bilder
// in den Kräuterbeeten kann man jetzt auch nicht wirklich gut erkenne … es wäre
// besser die Kräuter anders darzustellen, damit man da einen klaren Unterschied
// erkennen kann“; zum Vorschlag: „Die Idee, dass man die Kräuter auch aufwachsen
// sieht, finde ich auch super“).
//
// Jede Pflanze hat ihre Wuchsform wie ihr Warenbild (bloom in data/items.js):
// Flachs hohe Halme mit kleinen blauen Blüten, Ringelblume eine große orange
// Blüte, Schafgarbe ein flacher weißer Schirm, Kamille kleine Gänseblümchen,
// v0.59.0 Farn gefiederte Wedel ohne Blüte.
// Sie wächst in vier Stufen: Keimling, kleine Pflanze, groß mit Knospen, reif.
//
// Nur Daten, ohne three.js (in node testbar) – dieselben Grundkörper wie die
// Waren auf dem Band (itemForms.js); items3d.js baut daraus ein Teil je Beet.

import { ITEMS } from '../core/data/items.js';

const box = (c, s, p, r) => ({ k: 'box', c, s, p, r });
const cyl = (c, rTop, rBottom, h, p, r, seg = 6) => ({ k: 'cyl', c, s: [rTop, rBottom, h, seg], p, r });
const ball = (c, radius, p, seg = 6, rings = 4) => ({ k: 'ball', c, s: [radius, seg, rings], p });
const group = (parts, p, r, sc = 1) => ({ k: 'group', parts, p, r, sc });

// Stufen: 0 Keimling, 1 kleine Pflanze, 2 groß mit Knospen, 3 reif (blüht)
export const PLANT_STAGES = 4;

// Wachstum (0 … 1) und reif → Stufe; Knospen wie in 2D ab 60 %
export function plantStage(growth, ripe) {
  if (ripe) return 3;
  if (growth >= 0.6) return 2;
  if (growth >= 0.2) return 1;
  return 0;
}

// Stängel von unten (y = 0) bis zur Höhe h, etwas geneigt (lean in Bogenmaß)
function stalk(c, h, x, z, lean = 0, turn = 0, radius = 0.012) {
  return group([cyl(c, radius * 0.8, radius, h, [0, h / 2, 0])], [x, 0, z], [lean * Math.cos(turn), 0, lean * Math.sin(turn)]);
}

// Spitze eines geneigten Stängels (für die Blüte obendrauf)
function tip(h, x, z, lean = 0, turn = 0) {
  // Drehung um x (lean·cos) und z (lean·sin) – kleine Winkel, so genau genug
  return [x - Math.sin(lean * Math.sin(turn)) * h, Math.cos(lean) * h, z + Math.sin(lean * Math.cos(turn)) * h];
}

// Blatt: flacher, schräg stehender Quader
const leafBox = (c, len, wide, p, turn, tilt = 0.6) => box(c, [len, 0.006, wide], p, [0, turn, tilt]);

// Blütenblätter im Kreis (liegen flach, leicht nach oben gebogen)
function petals(c, count, len, wide, dist, tilt = 0.25) {
  const out = [];
  for (let k = 0; k < count; k++) {
    const a = (k / count) * Math.PI * 2;
    out.push(box(c, [len, 0.008, wide], [Math.cos(a) * dist, 0, Math.sin(a) * dist], [0, -a, tilt]));
  }
  return out;
}

// ---------- die vier Wuchsformen (reife Höhe etwa 0,3 – 0,55) ----------

function flachs(def, stage) {
  const leaf = def.color;
  const h = [0.12, 0.3, 0.5, 0.55][stage];
  const parts = [];
  const stems = stage === 0 ? [[0, 0, 0.1, 0]] : [[-0.04, 0.01, 0.16, 2.6], [0.03, -0.03, 0.12, 0.4], [0.02, 0.05, 0.1, 4.6]];
  for (const [x, z, lean, turn] of stems) {
    parts.push(stalk(leaf, h, x, z, lean, turn, 0.01));
    if (stage >= 1) parts.push(leafBox(leaf, 0.07, 0.02, [x, h * 0.45, z], turn + 1.2, 0.9));
    const top = tip(h, x, z, lean, turn);
    if (stage === 2) parts.push(ball(def.flower, 0.018, top));
    if (stage === 3) parts.push(group([...petals(def.flower, 5, 0.035, 0.026, 0.024, 0.35), ball('#ffe066', 0.01, [0, 0.004, 0])], top));
  }
  if (stage === 0) parts.push(leafBox(leaf, 0.06, 0.025, [0.02, 0.1, 0], 0.3), leafBox(leaf, 0.06, 0.025, [-0.02, 0.1, 0], 3.4));
  return parts;
}

function ringelblume(def, stage) {
  const leaf = def.color;
  const h = [0.07, 0.17, 0.27, 0.3][stage];
  const parts = [stalk(leaf, h, 0, 0, 0, 0, 0.016)];
  const leaves = stage === 0 ? 2 : 4;
  for (let k = 0; k < leaves; k++) {
    const a = (k / leaves) * Math.PI * 2 + 0.4;
    const size = stage === 0 ? 0.06 : 0.12;
    parts.push(leafBox(leaf, size, size * 0.45, [Math.cos(a) * size * 0.4, stage === 0 ? h : 0.05 + (k % 2) * 0.05, Math.sin(a) * size * 0.4], -a, 0.45));
  }
  if (stage === 2) parts.push(ball(def.flower, 0.035, [0, h, 0], 6, 4));
  if (stage === 3) {
    parts.push(group([
      ...petals(def.flower, 12, 0.07, 0.03, 0.06, 0.2),
      ...petals('#ffc24d', 6, 0.045, 0.024, 0.035, 0.3).map((p) => ({ ...p, p: [p.p[0], 0.006, p.p[2]] })),
      cyl(def.center ?? '#a8520a', 0.03, 0.034, 0.024, [0, 0.01, 0], null, 8),
    ], [0, h, 0], [0.25, 0, 0]));
  }
  return parts;
}

function schafgarbe(def, stage) {
  const leaf = def.color;
  const h = [0.09, 0.22, 0.4, 0.44][stage];
  const parts = [stalk(leaf, h, 0, 0, 0, 0, 0.012)];
  // gefiederte Blätter: Mittelrippe mit kleinen Fiedern
  const fronds = stage === 0 ? 2 : 3;
  for (let k = 0; k < fronds; k++) {
    const a = (k / fronds) * Math.PI * 2;
    const y = stage === 0 ? h : 0.06 + k * 0.06;
    const len = stage === 0 ? 0.06 : 0.11;
    const fern = [box(leaf, [len, 0.006, 0.008], [len / 2, 0, 0])];
    for (let f = 1; f <= 3; f++) fern.push(box(leaf, [0.008, 0.006, 0.035], [(len * f) / 4, 0, 0]));
    parts.push(group(fern, [0, y, 0], [0, -a, 0.5]));
  }
  if (stage >= 2) {
    // flacher Schirm aus vielen Pünktchen
    const color = stage === 3 ? def.flower : '#cfd8b0';
    const dots = [[0, 0]];
    for (let k = 0; k < 6; k++) dots.push([Math.cos((k / 6) * Math.PI * 2) * 0.045, Math.sin((k / 6) * Math.PI * 2) * 0.045]);
    if (stage === 3) for (let k = 0; k < 8; k++) dots.push([Math.cos((k / 8) * Math.PI * 2 + 0.3) * 0.085, Math.sin((k / 8) * Math.PI * 2 + 0.3) * 0.085]);
    const r = stage === 3 ? 0.024 : 0.018;
    parts.push(group(dots.map(([x, z]) => ball(color, r, [x, 0, z], 5, 3)), [0, h, 0]));
  }
  return parts;
}

function kamille(def, stage) {
  const leaf = def.color;
  const scale = [0.4, 0.65, 0.95, 1][stage];
  const parts = [];
  const stems = stage === 0 ? [[0, 0, 0.12, 0, 0]] : [[-0.05, 0.02, 0.3, 0.2, 2.8], [0.04, -0.03, 0.24, 0.25, 0.3], [0.03, 0.06, 0.2, 0.3, 4.4]];
  for (const [x, z, full, lean, turn] of stems) {
    const h = full * scale;
    parts.push(stalk(leaf, h, x, z, lean, turn, 0.009));
    if (stage >= 1) parts.push(leafBox(leaf, 0.06, 0.012, [x, h * 0.4, z], turn + 1.5, 0.8));
    const top = tip(h, x, z, lean, turn);
    if (stage === 2) parts.push(ball('#d8e0a8', 0.016, top));
    if (stage === 3) {
      parts.push(group([
        ...petals(def.flower, 10, 0.04, 0.014, 0.032, 0.15),
        ball(def.center ?? '#f2b705', 0.02, [0, 0.008, 0], 6, 4),
      ], top));
    }
  }
  if (stage === 0) parts.push(leafBox(leaf, 0.05, 0.012, [0.015, 0.1, 0], 0.4), leafBox(leaf, 0.05, 0.012, [-0.015, 0.1, 0], 3.5));
  return parts;
}

// v0.59.0: Farn – keine Blüte, dafür gefiederte Wedel, die schräg nach außen
// stehen; in der Mitte ein junger Wedel mit eingerollter, hellgrüner Spitze
// (def.flower). Keimling: zwei eingerollte Spitzen; Stufe 2: Spitzen noch rund.
function farn(def, stage) {
  const leaf = def.color;
  const curl = def.flower;
  const h = [0.08, 0.12, 0.16, 0.2][stage];
  const parts = [stalk(leaf, h, 0, 0, 0.2, 0.4, 0.011), ball(curl, stage === 3 ? 0.018 : 0.024, tip(h, 0, 0, 0.2, 0.4), 6, 4)];
  if (stage === 0) {
    parts.push(stalk(leaf, h * 0.7, 0.03, -0.02, 0.25, 3.5, 0.01), ball(curl, 0.02, tip(h * 0.7, 0.03, -0.02, 0.25, 3.5), 6, 4));
    return parts;
  }
  const fronds = stage === 1 ? 3 : 5;
  const len = [0, 0.16, 0.3, 0.36][stage];
  const pairs = stage === 1 ? 3 : 5;
  for (let k = 0; k < fronds; k++) {
    const a = (k / fronds) * Math.PI * 2 + 0.5;
    const frond = [box(leaf, [len, 0.008, 0.012], [len / 2, 0, 0])];
    for (let f = 1; f <= pairs; f++) {
      const wide = 0.075 * (1 - f / (pairs + 1.5)) * (stage === 1 ? 0.7 : 1);
      frond.push(box(leaf, [0.018, 0.006, wide * 2], [(len * f) / (pairs + 1), 0, 0]));
    }
    frond.push(stage === 2 ? ball(curl, 0.02, [len, 0, 0], 5, 3) : box(curl, [0.04, 0.006, 0.02], [len, 0, 0]));
    parts.push(group(frond, [0, 0.02, 0], [0, -a, 0.75]));
  }
  return parts;
}

const FORMS = { stars: flachs, disc: ringelblume, umbel: schafgarbe, daisies: kamille, fronds: farn };

// Eine Pflanze (steht auf y = 0) in der Stufe stage
export function plantForm(type, stage) {
  const def = ITEMS[type];
  if (!def) return [];
  const build = FORMS[def.bloom] ?? flachs;
  return build(def, Math.max(0, Math.min(PLANT_STAGES - 1, stage)));
}

const PLANT_SCALE = 1.6;

// Ein Beet voller Pflanzen: 3 × 3 Pflanzen auf der Erde (Mitte des Beets ist
// 0/0, die Erde liegt auf y = 0,1), jede etwas gedreht und verschieden groß.
export function bedForm(type, stage, width = 2, depth = 2) {
  const plant = plantForm(type, stage);
  const parts = [];
  let i = 0;
  for (const fz of [-1, 0, 1]) {
    for (const fx of [-1, 0, 1]) {
      const turn = (i * 2.399) % (Math.PI * 2); // goldener Winkel – wirkt zufällig
      // etwas größer als die Waren, damit man die Pflanzen auch von weiter weg erkennt
      const sc = PLANT_SCALE * (0.9 + ((i * 37) % 5) * 0.05);
      const x = fx * width * 0.26 + (((i * 13) % 5) - 2) * 0.02;
      const z = fz * depth * 0.26 + (((i * 7) % 5) - 2) * 0.02;
      parts.push(group(plant, [x, 0.1, z], [0, turn, 0], sc));
      i++;
    }
  }
  return parts;
}
