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
    // v0.16.0: Kräuter-Kapitel
    case 'seeds': {
      // Säckchen Leinsamen, oben zugebunden, ein paar Samen davor
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.18, cy - s * 0.3);
      ctx.quadraticCurveTo(cx - s * 0.48, cy + s * 0.05, cx - s * 0.36, cy + s * 0.44);
      ctx.lineTo(cx + s * 0.36, cy + s * 0.44);
      ctx.quadraticCurveTo(cx + s * 0.48, cy + s * 0.05, cx + s * 0.18, cy - s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Zipfel über dem Band
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.16, cy - s * 0.3);
      ctx.lineTo(cx - s * 0.24, cy - s * 0.5);
      ctx.lineTo(cx + s * 0.24, cy - s * 0.5);
      ctx.lineTo(cx + s * 0.16, cy - s * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#7a4f2a';
      ctx.lineWidth = Math.max(1.5, s * 0.08);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, cy - s * 0.3);
      ctx.lineTo(cx + s * 0.2, cy - s * 0.3);
      ctx.stroke();
      ctx.fillStyle = '#8a5a2b';
      for (const [dx, dy] of [[-0.12, 0.12], [0.1, 0.2], [0.02, 0.0], [-0.04, 0.3]]) {
        ctx.beginPath();
        ctx.ellipse(cx + dx * s, cy + dy * s, s * 0.05, s * 0.03, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'plant': {
      // Pflanze aus dem Beet: Bündel grüner Stängel mit Blüten (v0.17.0:
      // Farbe der Blüten aus der Tabelle – Flachs blau, Ringelblume orange).
      // thickLine rechnet ab der Mitte, deshalb erst dorthin verschieben.
      ctx.translate(cx, cy);
      const stems = [[-0.24, -0.3], [0, -0.4], [0.24, -0.3]];
      for (const [dx, dy] of stems) thickLine(ctx, [[0, 0.5], [dx, dy]], s, 0.08, def.color);
      ctx.fillStyle = def.flower ?? '#5b8ff9';
      ctx.lineWidth = Math.max(1, s * 0.05);
      for (const [dx, dy] of stems) {
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc((dx + Math.cos(a) * 0.1) * s, (dy + Math.sin(a) * 0.1) * s, s * 0.085, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.fillStyle = '#f6e7a1';
      for (const [dx, dy] of stems) {
        ctx.beginPath();
        ctx.arc(dx * s, dy * s, s * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }
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
