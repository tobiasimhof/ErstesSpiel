// Aussehen der Waren: kleine Formen, gleich auf dem Band und in Listen.

import { ITEMS } from '../core/data/items.js';

const OUTLINE = 'rgba(40, 26, 12, 0.75)';

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

// Dicke Linie mit dunklem Rand (Kurbelarm, Hebel, Feder). Punkte in Bruchteilen
// von s, der Ursprung ist schon in die Mitte verschoben.
function thickLine(ctx, points, s, width, color) {
  ctx.beginPath();
  points.forEach(([px, py], i) => (i ? ctx.lineTo(px * s, py * s) : ctx.moveTo(px * s, py * s)));
  ctx.lineWidth = Math.max(2, s * (width + 0.09));
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.lineWidth = Math.max(1, s * width);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.lineWidth = Math.max(1, s * 0.09);
  ctx.strokeStyle = OUTLINE;
}

// Zahnrad mit teeth Zähnen (v0.13.0: für Zahnradwelle, Räderwerk und Uhrwerk).
function gear(ctx, x, y, outer, inner, teeth, color, s) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a0 = (i / (teeth * 2)) * Math.PI * 2;
    const a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
    ctx.lineTo(x + Math.cos(a0) * r, y + Math.sin(a0) * r);
    ctx.lineTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = Math.max(1, s * 0.08);
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
}

// ---------- v0.47.0 (Tobias, Chat 28): Kräuter mit eigener Wuchsform ----------
// „diese Kräuter sehen alle gleich aus unterscheiden sich nur in der Farbe“ –
// jetzt hat jede Pflanze ihre Form (bloom in data/items.js), die Samen sind eine
// Tüte mit dem Bild der Pflanze. Gezeichnet auf einem Raster von 40 Einheiten
// (Mitte 20/20, wie im Musterbild); u = Pixel je Einheit, Ursprung in der Mitte.

// Farbe heller (f > 0) oder dunkler (f < 0) machen, f zwischen -1 und 1.
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f));
  const r = mix(n >> 16);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
}

// Zeichnet path() mit dunklem Umriss nur außen herum: erst dick umranden, dann
// füllen – so verschwinden die Linien zwischen überlappenden Blütenblättern.
function silhouette(ctx, path, fill, u, outline = 1) {
  ctx.beginPath();
  path();
  ctx.lineWidth = Math.max(1, u * 1.1 * outline);
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.fillStyle = fill;
  ctx.fill();
}

// Stängel als Linie mit dunklem Rand (Punkte in Einheiten, Kurve mit 4 Punkten
// als Bezier, sonst gerade Stücke).
function stem(ctx, pts, u, width, color) {
  const at = (v) => (v - 20) * u;
  const trace = () => {
    ctx.beginPath();
    ctx.moveTo(at(pts[0][0]), at(pts[0][1]));
    if (pts.length === 4) {
      ctx.bezierCurveTo(at(pts[1][0]), at(pts[1][1]), at(pts[2][0]), at(pts[2][1]), at(pts[3][0]), at(pts[3][1]));
    } else for (const [x, y] of pts.slice(1)) ctx.lineTo(at(x), at(y));
  };
  trace();
  ctx.lineWidth = Math.max(1.4, u * (width + 1.1));
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  trace();
  ctx.lineWidth = Math.max(0.8, u * width);
  ctx.strokeStyle = color;
  ctx.stroke();
}

// Blütenblätter rund um (x, y): count Ellipsen (rx, ry) im Abstand dist.
function petalRing(ctx, x, y, count, rx, ry, dist, u, turn = 0) {
  for (let k = 0; k < count; k++) {
    const a = turn + (k / count) * Math.PI * 2;
    const px = (x + Math.sin(a) * dist) * u;
    const py = (y - Math.cos(a) * dist) * u;
    // Anfangspunkt der Ellipse (Winkel 0, gedreht um a) – sonst zieht der Pfad einen Strich
    ctx.moveTo(px + Math.cos(a) * rx * u, py + Math.sin(a) * rx * u);
    ctx.ellipse(px, py, rx * u, ry * u, a, 0, Math.PI * 2);
  }
}

function circlesPath(ctx, list, u) {
  for (const [x, y, r] of list) {
    ctx.moveTo((x + r) * u, y * u);
    ctx.arc(x * u, y * u, r * u, 0, Math.PI * 2);
  }
}

// Eine Pflanze mittig am Ursprung, Größe wie die übrigen Waren (s).
function drawPlant(ctx, def, s) {
  const u = s * 0.035;
  const leaf = def.color;
  const flower = def.flower ?? '#5b8ff9';
  // Einheiten relativ zur Mitte (20/20)
  const c = (list) => list.map(([x, y, r]) => [x - 20, y - 20, r]);
  switch (def.bloom) {
    case 'disc': {
      // Ringelblume: eine große, runde orange Blüte mit braunem Knopf
      stem(ctx, [[20, 39], [20, 22]], u, 2.2, leaf);
      for (const side of [-1, 1]) {
        silhouette(ctx, () => {
          ctx.moveTo(0, 13 * u);
          ctx.quadraticCurveTo(side * 6 * u, 13 * u, side * 12 * u, (side < 0 ? 5 : 2) * u);
          ctx.quadraticCurveTo(side * 5 * u, (side < 0 ? 5 : 2) * u, 0, 11 * u);
          ctx.closePath();
        }, shade(leaf, -0.05), u);
      }
      silhouette(ctx, () => petalRing(ctx, 0, -5, 12, 2.7, 6.6, 6, u), flower, u);
      ctx.beginPath();
      petalRing(ctx, 0, -5, 6, 2, 4.4, 4, u, Math.PI / 6);
      ctx.fillStyle = shade(flower, 0.3);
      ctx.fill();
      silhouette(ctx, () => circlesPath(ctx, [[0, -5, 3.6]], u), def.center ?? shade(flower, -0.45), u, 0.7);
      break;
    }
    case 'umbel': {
      // Schafgarbe: flacher weißer Schirm aus vielen Pünktchen, gefiederte Blätter
      stem(ctx, [[20, 39], [20, 15]], u, 1.6, leaf);
      for (const [x, y] of [[11, 11], [15, 9.5], [20, 9], [25, 9.5], [29, 11]]) stem(ctx, [[20, 15], [x, y]], u, 1, leaf);
      for (const side of [-1, 1]) {
        const y0 = side < 0 ? 34 : 27;
        stem(ctx, [[20, y0], [20 + side * 8, y0 - 5]], u, 1.1, leaf);
        for (const f of [0.35, 0.7]) {
          const x = 20 + side * 8 * f;
          const y = y0 - 5 * f;
          stem(ctx, [[x, y], [x + side * 0.8, y - 3]], u, 0.9, leaf);
          stem(ctx, [[x, y], [x + side * 2.6, y + 1.2]], u, 0.9, leaf);
        }
      }
      const florets = c([
        [8, 10, 2.1], [11.5, 8.4, 2.1], [15, 7.3, 2.1], [18.5, 6.8, 2.1], [22, 6.8, 2.1], [25.5, 7.3, 2.1], [29, 8.4, 2.1], [32, 10, 2.1],
        [10, 11.4, 2.1], [13.5, 10.2, 2.1], [17, 9.6, 2.1], [20.5, 9.4, 2.1], [24, 9.7, 2.1], [27.5, 10.3, 2.1], [30.5, 11.5, 2.1],
        [12, 5.8, 2], [15, 4.6, 2], [19, 3.9, 2], [23, 4.2, 2], [26.5, 5.2, 2],
      ]);
      silhouette(ctx, () => circlesPath(ctx, florets, u), flower, u);
      // feine Pünktchen, damit man die vielen Einzelblüten ahnt
      ctx.fillStyle = 'rgba(120, 110, 80, 0.35)';
      ctx.beginPath();
      circlesPath(ctx, florets.map(([x, y]) => [x, y, 0.7]), u);
      ctx.fill();
      break;
    }
    case 'daisies': {
      // Kamille: drei kleine Gänseblümchen, weiß mit dickem gelbem Knopf
      stem(ctx, [[12, 39], [12, 30], [11, 22], [10, 15]], u, 1.4, leaf);
      stem(ctx, [[21, 39], [21, 28], [22, 18], [23, 9]], u, 1.4, leaf);
      stem(ctx, [[29, 39], [29, 32], [30, 26], [31, 21]], u, 1.4, leaf);
      for (const [x, y, k] of [[10, 14, 1], [31, 20, 0.9], [23, 9, 1.15]]) {
        silhouette(ctx, () => petalRing(ctx, x - 20, y - 20, 12, 1.4 * k, 3.4 * k, 4.2 * k, u), flower, u, 0.8);
        silhouette(ctx, () => circlesPath(ctx, [[x - 20, y - 20, 3 * k]], u), def.center ?? '#f2b705', u, 0.6);
        ctx.fillStyle = 'rgba(255, 240, 160, 0.9)';
        ctx.beginPath();
        circlesPath(ctx, [[x - 20.9, y - 20.9, 1.2 * k]], u);
        ctx.fill();
      }
      break;
    }
    default: {
      // 'stars' – Flachs: hohe dünne Halme mit kleinen blauen Sternblüten
      stem(ctx, [[14, 38], [14, 28], [13, 18], [12, 9]], u, 1.6, leaf);
      stem(ctx, [[20, 38], [20, 26], [21, 16], [21, 6]], u, 1.6, leaf);
      stem(ctx, [[26, 38], [26, 28], [27, 20], [29, 11]], u, 1.6, leaf);
      for (const [x, y] of [[13.5, 26], [20.3, 22], [26.6, 26]]) stem(ctx, [[x, y], [x + (x < 20 ? -3 : 3), y - 2.5]], u, 1.2, leaf);
      for (const [x, y] of [[12, 8], [21, 5.5], [29, 10]]) {
        const petals = [[0, -2.2], [2.1, -0.6], [1.3, 1.8], [-1.3, 1.8], [-2.1, -0.6]].map(([dx, dy]) => [x - 20 + dx, y - 20 + dy, 2.2]);
        silhouette(ctx, () => circlesPath(ctx, petals, u), flower, u, 0.8);
        ctx.fillStyle = '#ffe066';
        ctx.beginPath();
        circlesPath(ctx, [[x - 20, y - 20, 1]], u);
        ctx.fill();
      }
    }
  }
}

// Samentüte mit dem Bild der Pflanze, die daraus wächst (def.grows).
function drawSeedBag(ctx, def, s) {
  const u = s * 0.035;
  const at = (v) => (v - 20) * u;
  const y = (v) => (v - 22.5) * u; // Tüte reicht von 8 bis 37 – mittig setzen
  silhouette(ctx, () => {
    ctx.moveTo(at(8), y(8));
    ctx.lineTo(at(32), y(8));
    ctx.lineTo(at(33), y(37));
    ctx.lineTo(at(7), y(37));
    ctx.closePath();
  }, def.color, u, 1.2);
  // umgeschlagener Rand oben
  ctx.beginPath();
  ctx.moveTo(at(8), y(8));
  ctx.lineTo(at(32), y(8));
  ctx.lineTo(at(31.8), y(12.5));
  ctx.lineTo(at(8.2), y(12.5));
  ctx.closePath();
  ctx.fillStyle = shade(def.color, -0.18);
  ctx.fill();
  ctx.lineWidth = Math.max(1, u * 0.8);
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Etikett mit der Pflanze
  roundRect(ctx, at(11), y(15), 18 * u, 19 * u, 2 * u);
  ctx.fillStyle = '#fffaf0';
  ctx.fill();
  ctx.lineWidth = Math.max(1, u * 0.7);
  ctx.strokeStyle = 'rgba(40, 26, 12, 0.5)';
  ctx.stroke();
  const plant = ITEMS[def.grows];
  if (plant) {
    ctx.save();
    ctx.translate(0, y(24.5));
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    drawPlant(ctx, plant, s * 0.44);
    ctx.restore();
  }
}

// Zeichnet eine Ware mittig auf (cx, cy) in etwa der Größe size.
export function drawItem(ctx, type, cx, cy, size) {
  const def = ITEMS[type];
  if (!def) return;
  const s = size;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1, s * 0.09);
  ctx.strokeStyle = OUTLINE;
  ctx.fillStyle = def.color;

  switch (def.shape) {
    case 'block': {
      roundRect(ctx, cx - s / 2, cy - s / 2, s, s, s * 0.16);
      ctx.fill();
      ctx.stroke();
      if (def.grain) {
        ctx.strokeStyle = 'rgba(90, 55, 20, 0.55)';
        ctx.lineWidth = Math.max(1, s * 0.06);
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.3, cy - s * 0.12);
        ctx.lineTo(cx + s * 0.3, cy - s * 0.12);
        ctx.moveTo(cx - s * 0.3, cy + s * 0.14);
        ctx.lineTo(cx + s * 0.18, cy + s * 0.14);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        roundRect(ctx, cx - s * 0.36, cy - s * 0.36, s * 0.3, s * 0.18, s * 0.05);
        ctx.fill();
      }
      break;
    }
    case 'rod': {
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 4);
      roundRect(ctx, -s * 0.6, -s * 0.13, s * 1.2, s * 0.26, s * 0.13);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'plate': {
      roundRect(ctx, cx - s * 0.58, cy - s * 0.22, s * 1.16, s * 0.44, s * 0.08);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = def.grain ? 'rgba(90, 55, 20, 0.55)' : 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.45, cy - s * 0.08);
      ctx.lineTo(cx + s * 0.2, cy - s * 0.08);
      if (def.grain) {
        ctx.moveTo(cx - s * 0.2, cy + s * 0.08);
        ctx.lineTo(cx + s * 0.45, cy + s * 0.08);
      }
      ctx.stroke();
      break;
    }
    case 'smallplate': {
      roundRect(ctx, cx - s * 0.42, cy - s * 0.42, s * 0.84, s * 0.84, s * 0.1);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = OUTLINE;
      for (const [dx, dy] of [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]]) {
        ctx.beginPath();
        ctx.arc(cx + dx * s, cy + dy * s, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'gear': {
      const teeth = 8;
      const outer = s * 0.52;
      const inner = s * 0.38;
      ctx.beginPath();
      for (let i = 0; i < teeth * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a0 = (i / (teeth * 2)) * Math.PI * 2;
        const a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
        ctx.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r);
        ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(40, 26, 12, 0.55)';
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.13, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ingot': {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.4, cy - s * 0.22);
      ctx.lineTo(cx + s * 0.4, cy - s * 0.22);
      ctx.lineTo(cx + s * 0.56, cy + s * 0.24);
      ctx.lineTo(cx - s * 0.56, cy + s * 0.24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(cx - s * 0.3, cy - s * 0.14, s * 0.44, s * 0.08);
      break;
    }
    case 'bar': {
      // Eisenstange: kantig, mit hellem Glanzstreifen (Holzstab ist rund)
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 4);
      roundRect(ctx, -s * 0.62, -s * 0.15, s * 1.24, s * 0.3, s * 0.04);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = Math.max(1, s * 0.07);
      ctx.beginPath();
      ctx.moveTo(-s * 0.48, -s * 0.05);
      ctx.lineTo(s * 0.48, -s * 0.05);
      ctx.stroke();
      break;
    }
    // ---------- v0.10.0: Kombi-Teile (v0.13.0: neue Namen und Bilder) ----------
    case 'shaft': {
      // Zahnradwelle: Holzachse mit einem Stein-Zahnrad in der Mitte
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#c48d55';
      roundRect(ctx, -s * 0.62, -s * 0.1, s * 1.24, s * 0.2, s * 0.08);
      ctx.fill();
      ctx.stroke();
      gear(ctx, 0, 0, s * 0.36, s * 0.26, 8, '#9aa1aa', s);
      ctx.fillStyle = '#c48d55';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'gears': {
      // Räderwerk: zwei ineinandergreifende Zahnräder auf Holzachsen
      gear(ctx, cx - s * 0.16, cy + s * 0.12, s * 0.38, s * 0.28, 9, def.color, s);
      gear(ctx, cx + s * 0.3, cy - s * 0.26, s * 0.26, s * 0.18, 7, '#b5bcc5', s);
      ctx.fillStyle = '#c48d55';
      for (const [dx, dy, r] of [[-0.16, 0.12, 0.1], [0.3, -0.26, 0.07]]) {
        ctx.beginPath();
        ctx.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case 'reinforced': {
      // Verstärkte Holzplatte: Holzplatte mit zwei Eisenbändern und Nieten
      roundRect(ctx, cx - s * 0.58, cy - s * 0.26, s * 1.16, s * 0.52, s * 0.08);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(90, 55, 20, 0.55)';
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.5, cy - s * 0.1);
      ctx.lineTo(cx + s * 0.5, cy - s * 0.1);
      ctx.moveTo(cx - s * 0.5, cy + s * 0.1);
      ctx.lineTo(cx + s * 0.5, cy + s * 0.1);
      ctx.stroke();
      for (const dx of [-0.3, 0.3]) {
        ctx.fillStyle = '#8e98a6';
        ctx.strokeStyle = OUTLINE;
        ctx.fillRect(cx + (dx - 0.08) * s, cy - s * 0.26, s * 0.16, s * 0.52);
        ctx.strokeRect(cx + (dx - 0.08) * s, cy - s * 0.26, s * 0.16, s * 0.52);
        ctx.fillStyle = OUTLINE;
        for (const dy of [-0.15, 0.15]) {
          ctx.beginPath();
          ctx.arc(cx + dx * s, cy + dy * s, s * 0.035, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'hinge': {
      // Scharnier: zwei Lappen mit Löchern, in der Mitte das Gelenk
      for (const x0 of [-0.52, 0.1]) {
        roundRect(ctx, cx + x0 * s, cy - s * 0.32, s * 0.42, s * 0.64, s * 0.06);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = OUTLINE;
      for (const [dx, dy] of [[-0.31, -0.15], [-0.31, 0.15], [0.31, -0.15], [0.31, 0.15]]) {
        ctx.beginPath();
        ctx.arc(cx + dx * s, cy + dy * s, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#7d8794';
      roundRect(ctx, cx - s * 0.1, cy - s * 0.42, s * 0.2, s * 0.84, s * 0.1);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'key': {
      // Schlüssel: Ring (Reide), Schaft aus der Eisenstange, Bart aus dem Blech
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 4);
      ctx.fillRect(-s * 0.2, -s * 0.07, s * 0.76, s * 0.14);
      ctx.strokeRect(-s * 0.2, -s * 0.07, s * 0.76, s * 0.14);
      ctx.beginPath();
      ctx.moveTo(s * 0.32, s * 0.06);
      ctx.lineTo(s * 0.56, s * 0.06);
      ctx.lineTo(s * 0.56, s * 0.3);
      ctx.lineTo(s * 0.46, s * 0.3);
      ctx.lineTo(s * 0.46, s * 0.2);
      ctx.lineTo(s * 0.32, s * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-s * 0.36, 0, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(40, 26, 12, 0.85)';
      ctx.beginPath();
      ctx.arc(-s * 0.36, 0, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'compass': {
      // Zirkel: zwei Schenkel aus Eisenstangen an einem Scharnier-Gelenk
      ctx.translate(cx, cy);
      thickLine(ctx, [[0, -0.36], [-0.32, 0.5]], s, 0.11, def.color);
      thickLine(ctx, [[0, -0.36], [0.32, 0.5]], s, 0.11, def.color);
      ctx.fillStyle = '#7d8794';
      ctx.beginPath();
      ctx.arc(0, -0.36 * s, 0.14 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e0b277';
      roundRect(ctx, -0.05 * s, -0.62 * s, 0.1 * s, 0.16 * s, 0.04 * s);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'weight': {
      // Gewichtstein: Steinkörper mit eisernem Haken (für Waage, Uhr oder Zugbrücke)
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = Math.max(1, s * 0.2);
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.32, s * 0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#8e98a6';
      ctx.lineWidth = Math.max(1, s * 0.1);
      ctx.stroke();
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = Math.max(1, s * 0.09);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.26, cy - s * 0.18);
      ctx.lineTo(cx + s * 0.26, cy - s * 0.18);
      ctx.lineTo(cx + s * 0.46, cy + s * 0.48);
      ctx.lineTo(cx - s * 0.46, cy + s * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(cx - s * 0.18, cy - s * 0.08, s * 0.1, s * 0.4);
      break;
    }
    case 'clockwork': {
      // Uhrwerk: Zahnrad aus Messing mit Zifferblatt und Zeigern
      gear(ctx, cx, cy, s * 0.54, s * 0.44, 12, def.color, s);
      ctx.fillStyle = '#efe2c2';
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = Math.max(1, s * 0.08);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - s * 0.24);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + s * 0.17, cy + s * 0.06);
      ctx.stroke();
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'lock': {
      // Vorhängeschloss (v0.13.0, vorher Mini-Schloss): Bügel und Körper mit Schlüsselloch
      ctx.lineWidth = Math.max(1, s * 0.22);
      ctx.strokeStyle = OUTLINE;
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.1, s * 0.24, Math.PI, 0);
      ctx.stroke();
      ctx.lineWidth = Math.max(1, s * 0.12);
      ctx.strokeStyle = '#a9b4c2';
      ctx.stroke();
      ctx.lineWidth = Math.max(1, s * 0.09);
      ctx.strokeStyle = OUTLINE;
      roundRect(ctx, cx - s * 0.4, cy - s * 0.12, s * 0.8, s * 0.6, s * 0.1);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.arc(cx, cy + s * 0.1, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - s * 0.035, cy + s * 0.1, s * 0.07, s * 0.2);
      break;
    }
    // Nagel: derzeit ungenutzt (Nägel kommen vielleicht später zurück)
    case 'nail': {
      ctx.translate(cx, cy);
      ctx.rotate(-Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(-s * 0.42, -s * 0.07);
      ctx.lineTo(s * 0.34, -s * 0.07);
      ctx.lineTo(s * 0.58, 0);
      ctx.lineTo(s * 0.34, s * 0.07);
      ctx.lineTo(-s * 0.42, s * 0.07);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      roundRect(ctx, -s * 0.56, -s * 0.22, s * 0.14, s * 0.44, s * 0.04);
      ctx.fill();
      ctx.stroke();
      break;
    }
    // v0.16.0: Kräuter-Kapitel; v0.47.0: Samentüte und Pflanzen mit eigener Form
    case 'seeds': {
      ctx.translate(cx, cy);
      drawSeedBag(ctx, def, s);
      break;
    }
    case 'plant': {
      ctx.translate(cx, cy);
      drawPlant(ctx, def, s);
      break;
    }
    case 'fiber': {
      // Flachsfasern: helles Bündel, in der Mitte zusammengebunden
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.55, cy - s * 0.28);
      ctx.quadraticCurveTo(cx, cy - s * 0.02, cx + s * 0.55, cy - s * 0.28);
      ctx.lineTo(cx + s * 0.55, cy + s * 0.28);
      ctx.quadraticCurveTo(cx, cy + s * 0.02, cx - s * 0.55, cy + s * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(120, 95, 50, 0.55)';
      ctx.lineWidth = Math.max(1, s * 0.04);
      for (const f of [-0.14, 0, 0.14]) {
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.48, cy + f * s * 1.4);
        ctx.quadraticCurveTo(cx, cy + f * s * 0.3, cx + s * 0.48, cy + f * s * 1.4);
        ctx.stroke();
      }
      ctx.fillStyle = '#a0703c';
      roundRect(ctx, cx - s * 0.07, cy - s * 0.16, s * 0.14, s * 0.32, s * 0.04);
      ctx.fill();
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = Math.max(1, s * 0.07);
      ctx.stroke();
      break;
    }
    case 'petals': {
      // v0.17.0: getrocknete Ringelblüten – kleines Häufchen oranger Blütenblätter
      const leaves = [
        [-0.28, 0.2, 0.4],
        [0.05, 0.25, -0.3],
        [0.3, 0.15, 0.8],
        [-0.12, -0.02, 1.2],
        [0.18, -0.12, -0.9],
        [-0.3, -0.2, 0.2],
        [0.02, -0.32, 0.6],
      ];
      for (const [dx, dy, a] of leaves) {
        ctx.beginPath();
        ctx.ellipse(cx + dx * s, cy + dy * s, s * 0.2, s * 0.09, a, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      // v0.27.0: Schafgarbenblüten sind weiß mit blassgelber Mitte
      ctx.fillStyle = def.center ?? '#a85a00';
      ctx.beginPath();
      ctx.arc(cx, cy + s * 0.05, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'compress': {
      // v0.17.0: Kräuterkompresse – helles, abgestepptes Polster mit Blüten darin
      roundRect(ctx, cx - s * 0.5, cy - s * 0.36, s, s * 0.72, s * 0.14);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(120, 95, 50, 0.5)';
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.setLineDash([s * 0.07, s * 0.05]);
      roundRect(ctx, cx - s * 0.38, cy - s * 0.24, s * 0.76, s * 0.48, s * 0.08);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = def.herb ?? '#f08c00';
      for (const [dx, dy] of [[-0.18, -0.06], [0.14, 0.08], [0.02, -0.1], [-0.06, 0.12]]) {
        ctx.beginPath();
        ctx.arc(cx + dx * s, cy + dy * s, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'bandage': {
      // Verband: weiße Leinenrolle mit herabhängendem Ende
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.05, cy + s * 0.2);
      ctx.lineTo(cx + s * 0.55, cy + s * 0.32);
      ctx.lineTo(cx + s * 0.5, cy + s * 0.5);
      ctx.lineTo(cx, cy + s * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - s * 0.08, cy - s * 0.04, s * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(150, 140, 120, 0.8)';
      ctx.lineWidth = Math.max(1, s * 0.05);
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.2) {
        const r = s * (0.06 + (a / (Math.PI * 4)) * 0.28);
        const px = cx - s * 0.08 + Math.cos(a) * r;
        const py = cy - s * 0.04 + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      // v0.17.0: Heilverband – mit einem Streifen Ringelblüten am Ende
      if (def.herb) {
        ctx.strokeStyle = def.herb;
        ctx.lineWidth = Math.max(1.5, s * 0.1);
        ctx.beginPath();
        ctx.moveTo(cx + s * 0.08, cy + s * 0.3);
        ctx.lineTo(cx + s * 0.5, cy + s * 0.41);
        ctx.stroke();
      }
      // v0.27.0: Wundverband – dazu ein Zweig Schafgarbe auf der Rolle
      // (grüner Stiel, gefiederte Blätter, weiße Blütendolde)
      if (def.sprig) {
        ctx.translate(cx, cy);
        thickLine(ctx, [[-0.42, 0.34], [-0.1, -0.06], [0.2, -0.42]], s, 0.07, '#5c8a35');
        ctx.fillStyle = '#7fae4b';
        for (const [dx, dy, a] of [[-0.3, 0.12, -0.6], [-0.06, 0.06, 0.9], [0.02, -0.22, -0.5]]) {
          ctx.beginPath();
          ctx.ellipse(dx * s, dy * s, s * 0.13, s * 0.05, a, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.fillStyle = def.sprig;
        ctx.lineWidth = Math.max(1, s * 0.05);
        for (const [dx, dy] of [[0.2, -0.46], [0.31, -0.4], [0.12, -0.38], [0.24, -0.31], [0.34, -0.5]]) {
          ctx.beginPath();
          ctx.arc(dx * s, dy * s, s * 0.075, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
      break;
    }
    // v0.26.0: Level 9 „Die Schreibstube“
    case 'charcoal': {
      // Holzkohle: zwei schwarze Brocken mit glänzenden Bruchkanten
      for (const [dx, dy, k] of [[-0.14, 0.08, 1], [0.22, -0.12, 0.72]]) {
        const pts = [[-0.34, 0.06], [-0.18, -0.3], [0.16, -0.32], [0.36, -0.04], [0.24, 0.28], [-0.2, 0.3]];
        ctx.fillStyle = def.color;
        ctx.beginPath();
        pts.forEach(([px, py], i) => {
          const x = cx + (dx + px * k) * s;
          const y = cy + (dy + py * k) * s;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'rgba(200, 200, 210, 0.55)';
        ctx.lineWidth = Math.max(1, s * 0.05);
        ctx.beginPath();
        ctx.moveTo(cx + (dx - 0.16 * k) * s, cy + (dy - 0.18 * k) * s);
        ctx.lineTo(cx + (dx + 0.12 * k) * s, cy + (dy - 0.2 * k) * s);
        ctx.stroke();
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = Math.max(1, s * 0.09);
      }
      break;
    }
    case 'drawingboard': {
      // Zeichenbrett: Holzrahmen, mit Leinen bespannt, darauf ein Hausplan in Kohle
      ctx.fillStyle = '#b07a45';
      roundRect(ctx, cx - s * 0.58, cy - s * 0.44, s * 1.16, s * 0.88, s * 0.08);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = def.color;
      roundRect(ctx, cx - s * 0.46, cy - s * 0.32, s * 0.92, s * 0.64, s * 0.04);
      ctx.fill();
      ctx.strokeStyle = 'rgba(40, 26, 12, 0.45)';
      ctx.lineWidth = Math.max(1, s * 0.05);
      ctx.stroke();
      ctx.strokeStyle = '#3a3633';
      ctx.lineWidth = Math.max(1, s * 0.06);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.22, cy + s * 0.22);
      ctx.lineTo(cx - s * 0.22, cy - s * 0.04);
      ctx.lineTo(cx, cy - s * 0.22);
      ctx.lineTo(cx + s * 0.22, cy - s * 0.04);
      ctx.lineTo(cx + s * 0.22, cy + s * 0.22);
      ctx.closePath();
      ctx.moveTo(cx - s * 0.22, cy - s * 0.04);
      ctx.lineTo(cx + s * 0.22, cy - s * 0.04);
      ctx.stroke();
      break;
    }
    // v0.28.0: Level 11 „Die Uhrmacherei“
    case 'weightclock': {
      // Räderuhr: Holzgehäuse mit Giebel und Zifferblatt, darunter zwei
      // Gewichte an Ketten (der Antrieb der ersten Räderuhren)
      ctx.strokeStyle = '#6b6f73';
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.16, cy + s * 0.05);
      ctx.lineTo(cx - s * 0.16, cy + s * 0.3);
      ctx.moveTo(cx + s * 0.16, cy + s * 0.05);
      ctx.lineTo(cx + s * 0.16, cy + s * 0.4);
      ctx.stroke();
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = Math.max(1, s * 0.07);
      ctx.fillStyle = '#8d8f8a';
      for (const [dx, top] of [[-0.16, 0.26], [0.16, 0.36]]) {
        roundRect(ctx, cx + (dx - 0.08) * s, cy + top * s, s * 0.16, s * 0.2, s * 0.04);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.36, cy + s * 0.08);
      ctx.lineTo(cx - s * 0.36, cy - s * 0.38);
      ctx.lineTo(cx, cy - s * 0.58);
      ctx.lineTo(cx + s * 0.36, cy - s * 0.38);
      ctx.lineTo(cx + s * 0.36, cy + s * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#efe2c2';
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.2, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = Math.max(1, s * 0.06);
      ctx.beginPath();
      ctx.moveTo(cx, cy - s * 0.2);
      ctx.lineTo(cx, cy - s * 0.36);
      ctx.moveTo(cx, cy - s * 0.2);
      ctx.lineTo(cx + s * 0.12, cy - s * 0.14);
      ctx.stroke();
      break;
    }
    case 'boxlock': {
      // Kastenschloss: eiserner Schlosskasten mit Nieten, im Schlüsselloch
      // steckt der passende Schlüssel aus Messing
      roundRect(ctx, cx - s * 0.52, cy - s * 0.36, s * 0.92, s * 0.66, s * 0.08);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = OUTLINE;
      for (const [dx, dy] of [[-0.42, -0.26], [0.3, -0.26], [-0.42, 0.2], [0.3, 0.2]]) {
        ctx.beginPath();
        ctx.arc(cx + dx * s, cy + dy * s, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx - s * 0.08, cy - s * 0.08, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - s * 0.115, cy - s * 0.08, s * 0.07, s * 0.2);
      // Schlüssel: Schaft aus dem Schlüsselloch nach rechts, Ring außen
      ctx.fillStyle = '#d4a63a';
      ctx.lineWidth = Math.max(1, s * 0.06);
      roundRect(ctx, cx - s * 0.1, cy - s * 0.12, s * 0.42, s * 0.08, s * 0.03);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + s * 0.42, cy - s * 0.08, s * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.arc(cx + s * 0.42, cy - s * 0.08, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'starclock': {
      // Sternenuhr: Messingring, dunkelblaues Zifferblatt mit Sonne, Mond und
      // Sternen, goldene Zeiger
      ctx.fillStyle = '#c9a24a';
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.43, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Sonne mit Strahlen
      ctx.strokeStyle = '#ffd43b';
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        ctx.moveTo(cx - s * 0.2 + Math.cos(a) * s * 0.1, cy - s * 0.16 + Math.sin(a) * s * 0.1);
        ctx.lineTo(cx - s * 0.2 + Math.cos(a) * s * 0.15, cy - s * 0.16 + Math.sin(a) * s * 0.15);
      }
      ctx.stroke();
      ctx.fillStyle = '#ffd43b';
      ctx.beginPath();
      ctx.arc(cx - s * 0.2, cy - s * 0.16, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      // Mondsichel
      ctx.fillStyle = '#f1ead2';
      ctx.beginPath();
      ctx.arc(cx + s * 0.2, cy - s * 0.14, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(cx + s * 0.25, cy - s * 0.18, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
      // Sterne
      ctx.fillStyle = '#fff8db';
      for (const [dx, dy] of [[-0.24, 0.16], [0.22, 0.2], [0.02, 0.3], [0.3, 0.04], [-0.06, -0.3]]) {
        ctx.beginPath();
        ctx.arc(cx + dx * s, cy + dy * s, s * 0.035, 0, Math.PI * 2);
        ctx.fill();
      }
      // Zeiger
      ctx.strokeStyle = '#c9a24a';
      ctx.lineWidth = Math.max(1.5, s * 0.06);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + s * 0.06, cy + s * 0.3);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx - s * 0.16, cy + s * 0.12);
      ctx.stroke();
      ctx.fillStyle = '#c9a24a';
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'drawingset': {
      // Reißzeug: offenes Lederetui mit Zirkel und Zeichenkohle
      roundRect(ctx, cx - s * 0.56, cy - s * 0.38, s * 1.12, s * 0.76, s * 0.12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#8f2f2a';
      roundRect(ctx, cx - s * 0.44, cy - s * 0.27, s * 0.88, s * 0.54, s * 0.06);
      ctx.fill();
      ctx.translate(cx - s * 0.1, cy);
      thickLine(ctx, [[0, -0.2], [-0.2, 0.22]], s, 0.07, '#d4dbe4');
      thickLine(ctx, [[0, -0.2], [0.2, 0.22]], s, 0.07, '#d4dbe4');
      ctx.fillStyle = '#9aa3ae';
      ctx.beginPath();
      ctx.arc(0, -0.2 * s, 0.07 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      thickLine(ctx, [[0.3, -0.18], [0.36, 0.2]], s, 0.08, '#34302d');
      break;
    }
    // v0.29.0: Level 12 „Die Apotheke“
    case 'daisies': {
      // Kamillenblüten: drei getrocknete Köpfchen – weiße Blütenblätter um
      // eine gewölbte gelbe Mitte (anders als die Schafgarbe: ein Häufchen Blätter)
      for (const [dx, dy, k] of [[-0.24, 0.16, 1], [0.24, 0.12, 0.9], [0, -0.22, 0.95]]) {
        const x = cx + dx * s;
        const y = cy + dy * s;
        ctx.fillStyle = def.color;
        ctx.lineWidth = Math.max(1, s * 0.05);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(x + Math.cos(a) * s * 0.15 * k, y + Math.sin(a) * s * 0.15 * k, s * 0.1 * k, s * 0.05 * k, a, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.fillStyle = def.center ?? '#f2b705';
        ctx.beginPath();
        ctx.arc(x, y, s * 0.1 * k, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case 'herbmix': {
      // Kräutermischung: Holzschale mit einem Häufchen weißer Schafgarben-
      // und gelb-weißer Kamillenblüten
      const pile = [
        [-0.22, -0.06, '#f4efdc'],
        [0.2, -0.04, '#ffffff'],
        [0, -0.18, '#f4efdc'],
        [-0.08, -0.02, '#ffffff'],
        [0.12, -0.2, '#f4efdc'],
        [-0.18, -0.24, '#ffffff'],
      ];
      ctx.lineWidth = Math.max(1, s * 0.05);
      for (const [dx, dy, color] of pile) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx + dx * s, cy + dy * s, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#f2b705';
      for (const [dx, dy] of [[0.2, -0.04], [-0.08, -0.02], [-0.18, -0.24]]) {
        ctx.beginPath();
        ctx.arc(cx + dx * s, cy + dy * s, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#7fae4b';
      ctx.beginPath();
      ctx.ellipse(cx + s * 0.3, cy - s * 0.2, s * 0.12, s * 0.045, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Schale
      ctx.lineWidth = Math.max(1, s * 0.09);
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.52, cy);
      ctx.quadraticCurveTo(cx - s * 0.46, cy + s * 0.46, cx, cy + s * 0.46);
      ctx.quadraticCurveTo(cx + s * 0.46, cy + s * 0.46, cx + s * 0.52, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(60, 36, 16, 0.45)';
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.36, cy + s * 0.14);
      ctx.quadraticCurveTo(cx, cy + s * 0.24, cx + s * 0.36, cy + s * 0.14);
      ctx.stroke();
      break;
    }
    case 'pillow': {
      // Kamillenkissen: kleines Leinenkissen mit eingezogenen Seiten, darauf
      // eine aufgestickte Kamillenblüte
      const w = s * 0.56;
      const h = s * 0.4;
      ctx.beginPath();
      ctx.moveTo(cx - w, cy - h);
      ctx.quadraticCurveTo(cx, cy - h * 0.7, cx + w, cy - h);
      ctx.quadraticCurveTo(cx + w * 0.86, cy, cx + w, cy + h);
      ctx.quadraticCurveTo(cx, cy + h * 0.7, cx - w, cy + h);
      ctx.quadraticCurveTo(cx - w * 0.86, cy, cx - w, cy - h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(120, 95, 50, 0.5)';
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.setLineDash([s * 0.07, s * 0.05]);
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.78, cy - h * 0.72);
      ctx.quadraticCurveTo(cx, cy - h * 0.48, cx + w * 0.78, cy - h * 0.72);
      ctx.moveTo(cx - w * 0.78, cy + h * 0.72);
      ctx.quadraticCurveTo(cx, cy + h * 0.48, cx + w * 0.78, cy + h * 0.72);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = OUTLINE;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * s * 0.11, cy + Math.sin(a) * s * 0.11, s * 0.07, s * 0.035, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f2b705';
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.065, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'kit': {
      // Heilpäckchen: verschnürtes Leinenpäckchen mit grünem Apothekerkreuz
      // und einem Zweig Schafgarbe unter der Schnur
      roundRect(ctx, cx - s * 0.52, cy - s * 0.4, s * 1.04, s * 0.8, s * 0.1);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#7a4f2a';
      ctx.lineWidth = Math.max(1.5, s * 0.06);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.52, cy + s * 0.04);
      ctx.lineTo(cx + s * 0.52, cy + s * 0.04);
      ctx.moveTo(cx + s * 0.2, cy - s * 0.4);
      ctx.lineTo(cx + s * 0.2, cy + s * 0.4);
      ctx.stroke();
      ctx.fillStyle = '#2f8f4e';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = Math.max(1, s * 0.05);
      const k = s * 0.07;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2 - k, cy - s * 0.18 - 3 * k);
      ctx.lineTo(cx - s * 0.2 + k, cy - s * 0.18 - 3 * k);
      ctx.lineTo(cx - s * 0.2 + k, cy - s * 0.18 - k);
      ctx.lineTo(cx - s * 0.2 + 3 * k, cy - s * 0.18 - k);
      ctx.lineTo(cx - s * 0.2 + 3 * k, cy - s * 0.18 + k);
      ctx.lineTo(cx - s * 0.2 + k, cy - s * 0.18 + k);
      ctx.lineTo(cx - s * 0.2 + k, cy - s * 0.18 + 3 * k);
      ctx.lineTo(cx - s * 0.2 - k, cy - s * 0.18 + 3 * k);
      ctx.lineTo(cx - s * 0.2 - k, cy - s * 0.18 + k);
      ctx.lineTo(cx - s * 0.2 - 3 * k, cy - s * 0.18 + k);
      ctx.lineTo(cx - s * 0.2 - 3 * k, cy - s * 0.18 - k);
      ctx.lineTo(cx - s * 0.2 - k, cy - s * 0.18 - k);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Knoten und Zweig
      ctx.fillStyle = '#7a4f2a';
      ctx.beginPath();
      ctx.arc(cx + s * 0.2, cy + s * 0.04, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(cx, cy);
      thickLine(ctx, [[0.24, 0.02], [0.42, -0.3]], s, 0.05, '#5c8a35');
      ctx.fillStyle = '#f8f5ea';
      for (const [dx, dy] of [[0.42, -0.34], [0.5, -0.28], [0.36, -0.28]]) {
        ctx.beginPath();
        ctx.arc(dx * s, dy * s, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case 'draftingboard': {
      // Reißbrett: großes Zeichenbrett mit fertigem Plan (Ofen mit Schornstein
      // für die Glashütte), oben die Reißschiene, rechts unten ein Zirkel
      ctx.fillStyle = '#a06c3a';
      roundRect(ctx, cx - s * 0.6, cy - s * 0.46, s * 1.2, s * 0.92, s * 0.08);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = def.color;
      roundRect(ctx, cx - s * 0.5, cy - s * 0.3, s, s * 0.68, s * 0.04);
      ctx.fill();
      ctx.strokeStyle = 'rgba(40, 26, 12, 0.45)';
      ctx.lineWidth = Math.max(1, s * 0.05);
      ctx.stroke();
      // Plan: Ofen mit Kuppel und Schornstein
      ctx.strokeStyle = '#2b4a7a';
      ctx.lineWidth = Math.max(1, s * 0.05);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.34, cy + s * 0.26);
      ctx.lineTo(cx - s * 0.34, cy + s * 0.02);
      ctx.quadraticCurveTo(cx - s * 0.14, cy - s * 0.2, cx + s * 0.06, cy + s * 0.02);
      ctx.lineTo(cx + s * 0.06, cy + s * 0.26);
      ctx.closePath();
      ctx.moveTo(cx - s * 0.04, cy - s * 0.06);
      ctx.lineTo(cx - s * 0.04, cy - s * 0.2);
      ctx.lineTo(cx + s * 0.04, cy - s * 0.2);
      ctx.lineTo(cx + s * 0.04, cy - s * 0.02);
      ctx.moveTo(cx - s * 0.2, cy + s * 0.26);
      ctx.lineTo(cx - s * 0.2, cy + s * 0.14);
      ctx.lineTo(cx - s * 0.08, cy + s * 0.14);
      ctx.lineTo(cx - s * 0.08, cy + s * 0.26);
      ctx.stroke();
      // Reißschiene oben
      ctx.fillStyle = '#d9a86c';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = Math.max(1, s * 0.06);
      roundRect(ctx, cx - s * 0.66, cy - s * 0.42, s * 0.18, s * 0.16, s * 0.03);
      ctx.fill();
      ctx.stroke();
      roundRect(ctx, cx - s * 0.5, cy - s * 0.38, s * 1.02, s * 0.08, s * 0.02);
      ctx.fill();
      ctx.stroke();
      // Zirkel rechts unten
      ctx.translate(cx + s * 0.3, cy + s * 0.06);
      thickLine(ctx, [[0, -0.12], [-0.12, 0.22]], s, 0.05, '#d4dbe4');
      thickLine(ctx, [[0, -0.12], [0.12, 0.22]], s, 0.05, '#d4dbe4');
      ctx.fillStyle = '#9aa3ae';
      ctx.beginPath();
      ctx.arc(0, -0.12 * s, 0.05 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    // v0.31.0: Level 13 „Die Glashütte“
    case 'sandsack': {
      // Sand: ein zugebundener Jutesack, davor ein Häufchen Sand
      ctx.fillStyle = '#a9824f';
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, cy - s * 0.32);
      ctx.quadraticCurveTo(cx - s * 0.56, cy - s * 0.02, cx - s * 0.44, cy + s * 0.44);
      ctx.lineTo(cx + s * 0.3, cy + s * 0.44);
      ctx.quadraticCurveTo(cx + s * 0.44, cy - s * 0.02, cx + s * 0.12, cy - s * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Zipfel über dem Band
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.18, cy - s * 0.32);
      ctx.lineTo(cx - s * 0.28, cy - s * 0.52);
      ctx.lineTo(cx + s * 0.2, cy - s * 0.52);
      ctx.lineTo(cx + s * 0.1, cy - s * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#5c3d1e';
      ctx.lineWidth = Math.max(1.5, s * 0.08);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.22, cy - s * 0.32);
      ctx.lineTo(cx + s * 0.14, cy - s * 0.32);
      ctx.stroke();
      // Jute-Streifen
      ctx.strokeStyle = 'rgba(70, 45, 20, 0.35)';
      ctx.lineWidth = Math.max(1, s * 0.04);
      for (const dx of [-0.2, 0, 0.18]) {
        ctx.beginPath();
        ctx.moveTo(cx + (dx - 0.04) * s, cy - s * 0.16);
        ctx.lineTo(cx + (dx - 0.06) * s, cy + s * 0.38);
        ctx.stroke();
      }
      // Häufchen Sand vorne rechts
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = Math.max(1, s * 0.07);
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.06, cy + s * 0.5);
      ctx.quadraticCurveTo(cx + s * 0.32, cy + s * 0.04, cx + s * 0.58, cy + s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b8995e';
      for (const [dx, dy] of [[0.24, 0.38], [0.36, 0.3], [0.44, 0.42], [0.3, 0.46]]) {
        ctx.beginPath();
        ctx.arc(cx + dx * s, cy + dy * s, s * 0.025, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'glass': {
      // Glas: ein durchscheinender, grünlich-blauer Klumpen Rohglas mit Glanz
      const pts = [[-0.46, 0.08], [-0.3, -0.3], [0.06, -0.42], [0.42, -0.2], [0.46, 0.2], [0.14, 0.42], [-0.3, 0.36]];
      ctx.fillStyle = def.color;
      ctx.beginPath();
      pts.forEach(([px, py], i) => (i ? ctx.lineTo(cx + px * s, cy + py * s) : ctx.moveTo(cx + px * s, cy + py * s)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Kanten im Inneren
      ctx.strokeStyle = 'rgba(40, 110, 110, 0.45)';
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.3, cy - s * 0.3);
      ctx.lineTo(cx - s * 0.02, cy + s * 0.02);
      ctx.lineTo(cx + s * 0.46, cy + s * 0.2);
      ctx.moveTo(cx - s * 0.02, cy + s * 0.02);
      ctx.lineTo(cx + s * 0.14, cy + s * 0.42);
      ctx.stroke();
      // Glanz
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = Math.max(1.5, s * 0.08);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.26, cy - s * 0.12);
      ctx.lineTo(cx - s * 0.12, cy - s * 0.28);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(cx + s * 0.2, cy - s * 0.16, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'vial': {
      // Fläschchen: runder Glaskolben mit schmalem Hals und Korken
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.1, cy - s * 0.3);
      ctx.arc(cx, cy + s * 0.18, s * 0.32, -Math.PI / 2 - 0.32, Math.PI * 1.5 + 0.32, true);
      ctx.lineTo(cx + s * 0.1, cy - s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Rand am Hals
      roundRect(ctx, cx - s * 0.15, cy - s * 0.34, s * 0.3, s * 0.08, s * 0.03);
      ctx.fill();
      ctx.stroke();
      // Korken
      ctx.fillStyle = '#b07a45';
      roundRect(ctx, cx - s * 0.11, cy - s * 0.52, s * 0.22, s * 0.2, s * 0.04);
      ctx.fill();
      ctx.stroke();
      // Glanz
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = Math.max(1.5, s * 0.07);
      ctx.beginPath();
      ctx.arc(cx, cy + s * 0.18, s * 0.2, Math.PI * 1.1, Math.PI * 1.45);
      ctx.stroke();
      break;
    }
    case 'mortar': {
      // v0.45.0 Mörser: Schale aus Stein, darin ein Stößel aus Holz
      const w = s * 0.5;
      const rim = cy - s * 0.04;
      const rh = s * 0.15;
      // Innen dunkel
      ctx.fillStyle = '#5d636b';
      ctx.beginPath();
      ctx.ellipse(cx, rim, w, rh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Stößel: steht schräg in der Schale
      ctx.lineWidth = s * 0.2;
      ctx.strokeStyle = OUTLINE;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.04, rim + s * 0.02);
      ctx.lineTo(cx + s * 0.3, cy - s * 0.5);
      ctx.stroke();
      ctx.lineWidth = s * 0.12;
      ctx.strokeStyle = '#b07a45';
      ctx.stroke();
      ctx.lineWidth = Math.max(1, s * 0.09);
      ctx.strokeStyle = OUTLINE;
      // Schale vorn (deckt das untere Ende des Stößels ab)
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.ellipse(cx, rim, w, rh, 0, Math.PI, 0, true);
      ctx.quadraticCurveTo(cx + w, cy + s * 0.46, cx, cy + s * 0.46);
      ctx.quadraticCurveTo(cx - w, cy + s * 0.46, cx - w, rim);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Glanz auf dem Stein
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = Math.max(1, s * 0.06);
      ctx.beginPath();
      ctx.arc(cx, rim, w * 0.72, Math.PI * 0.62, Math.PI * 0.85);
      ctx.stroke();
      break;
    }
    case 'tincture': {
      // v0.45.0 Tinktur: kleine braune Apothekerflasche mit Korken und
      // einem Etikett mit grünem Kräuterblatt
      ctx.fillStyle = def.color;
      roundRect(ctx, cx - s * 0.3, cy - s * 0.16, s * 0.6, s * 0.62, s * 0.12);
      ctx.fill();
      ctx.stroke();
      roundRect(ctx, cx - s * 0.13, cy - s * 0.32, s * 0.26, s * 0.2, s * 0.05);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b07a45';
      roundRect(ctx, cx - s * 0.11, cy - s * 0.5, s * 0.22, s * 0.2, s * 0.04);
      ctx.fill();
      ctx.stroke();
      // Etikett
      ctx.fillStyle = '#efe3c2';
      ctx.lineWidth = Math.max(1, s * 0.05);
      roundRect(ctx, cx - s * 0.22, cy, s * 0.44, s * 0.3, s * 0.04);
      ctx.fill();
      ctx.stroke();
      // Kräuterblatt
      ctx.fillStyle = def.herb ?? '#5f8f3a';
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 0.15, s * 0.14, s * 0.07, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(40, 60, 25, 0.8)';
      ctx.lineWidth = Math.max(1, s * 0.03);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.12, cy + s * 0.22);
      ctx.lineTo(cx + s * 0.1, cy + s * 0.09);
      ctx.stroke();
      // Glanz
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = Math.max(1.5, s * 0.06);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.21, cy - s * 0.06);
      ctx.lineTo(cx - s * 0.21, cy + s * 0.36);
      ctx.stroke();
      break;
    }
    case 'powder': {
      // v0.57.0 Heilpuder: ein offenes Leinensäckchen mit goldgelbem Pulver,
      // zugebunden mit einem roten Band, davor ein kleines Häufchen
      ctx.fillStyle = '#efe3c4';
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.3, cy - s * 0.2);
      ctx.quadraticCurveTo(cx - s * 0.58, cy + s * 0.12, cx - s * 0.4, cy + s * 0.46);
      ctx.lineTo(cx + s * 0.24, cy + s * 0.46);
      ctx.quadraticCurveTo(cx + s * 0.42, cy + s * 0.12, cx + s * 0.16, cy - s * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Öffnung mit dem Pulver
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.ellipse(cx - s * 0.07, cy - s * 0.24, s * 0.27, s * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.3, cy - s * 0.26);
      ctx.quadraticCurveTo(cx - s * 0.07, cy - s * 0.52, cx + s * 0.16, cy - s * 0.26);
      ctx.fill();
      // Band um den Hals
      ctx.strokeStyle = def.herb ?? '#c2410c';
      ctx.lineWidth = Math.max(1.5, s * 0.08);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.34, cy - s * 0.08);
      ctx.quadraticCurveTo(cx - s * 0.07, cy + s * 0.02, cx + s * 0.2, cy - s * 0.08);
      ctx.stroke();
      // Häufchen vorne rechts
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = Math.max(1, s * 0.07);
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.1, cy + s * 0.5);
      ctx.quadraticCurveTo(cx + s * 0.34, cy + s * 0.08, cx + s * 0.58, cy + s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'potion': {
      // v0.55.0 Traumtrank: bauchiges Fläschchen mit lila Trank, Korken und
      // einem kleinen Glanz – der Trank leuchtet von innen heller; v0.57.0 auch
      // der Heiltrank (rot), Farben aus color und glow
      const r = s * 0.34;
      const by = cy + s * 0.14;
      ctx.fillStyle = '#cfe9ee';
      roundRect(ctx, cx - s * 0.11, cy - s * 0.36, s * 0.22, s * 0.22, s * 0.04);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, by, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // der Trank: lila, oben eine gerade Kante
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, by, r - Math.max(1, s * 0.04), 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = def.color;
      ctx.fillRect(cx - r, by - r * 0.35, r * 2, r * 1.5);
      ctx.fillStyle = def.glow ?? '#c9a7ff';
      ctx.beginPath();
      ctx.arc(cx + r * 0.15, by + r * 0.25, r * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Korken
      ctx.fillStyle = '#b07a45';
      roundRect(ctx, cx - s * 0.1, cy - s * 0.52, s * 0.2, s * 0.18, s * 0.04);
      ctx.fill();
      ctx.stroke();
      // Glanz
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = Math.max(1.5, s * 0.06);
      ctx.beginPath();
      ctx.arc(cx, by, r * 0.72, Math.PI * 1.1, Math.PI * 1.4);
      ctx.stroke();
      break;
    }
    case 'log': {
      roundRect(ctx, cx - s * 0.6, cy - s * 0.3, s * 1.1, s * 0.6, s * 0.3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d9a86c';
      ctx.beginPath();
      ctx.ellipse(cx + s * 0.35, cy, s * 0.2, s * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'rock': {
      ctx.beginPath();
      const pts = [
        [-0.5, 0.1],
        [-0.3, -0.38],
        [0.15, -0.48],
        [0.5, -0.12],
        [0.42, 0.36],
        [-0.1, 0.48],
      ];
      pts.forEach(([dx, dy], i) => (i ? ctx.lineTo(cx + dx * s, cy + dy * s) : ctx.moveTo(cx + dx * s, cy + dy * s)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (def.ore) {
        ctx.fillStyle = '#d98a4a';
        for (const [dx, dy, r] of [[-0.18, -0.12, 0.09], [0.16, 0.1, 0.08], [0.12, -0.26, 0.06]]) {
          ctx.beginPath();
          ctx.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    default: {
      ctx.beginPath();
      ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Kleines Bild einer Ware für Listen (CSS-Größe cssSize Pixel).
//
// v0.10.2: Der Browser darf die Zeichnung solcher Bilder wegwerfen, z. B. wenn
// man die App minimiert (Tobias: danach standen in der Bauleiste nur noch die
// Zahlen). Jedes Bild merkt sich deshalb, was es zeigt, und lässt sich mit
// redrawItemIcons() jederzeit neu zeichnen; nach einem Verlust zeichnet es
// sich selbst neu, sobald der Browser es wieder freigibt.
export function createItemIcon(type, cssSize = 28) {
  const canvas = document.createElement('canvas');
  canvas.className = 'item-icon';
  canvas.dataset.item = type;
  canvas.dataset.size = String(cssSize);
  canvas.style.width = `${cssSize}px`;
  canvas.style.height = `${cssSize}px`;
  canvas.addEventListener('contextrestored', () => paintItemIcon(canvas));
  paintItemIcon(canvas);
  return canvas;
}

function paintItemIcon(canvas) {
  const type = canvas.dataset.item;
  const cssSize = Number(canvas.dataset.size);
  if (!type || !cssSize) return;
  const dpr = window.devicePixelRatio || 1;
  // Breite neu setzen leert die Fläche und setzt Skalierung & Co. zurück.
  canvas.width = Math.round(cssSize * dpr);
  canvas.height = Math.round(cssSize * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  drawItem(ctx, type, cssSize / 2, cssSize / 2, cssSize * 0.62);
}

// Zeichnet alle Warenbilder in root neu (z. B. beim Öffnen der Bauleiste oder
// wenn man ins Spiel zurückkommt).
export function redrawItemIcons(root = document) {
  for (const canvas of root.querySelectorAll('canvas.item-icon')) paintItemIcon(canvas);
}
