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
export function createItemIcon(type, cssSize = 28) {
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssSize * dpr);
  canvas.height = Math.round(cssSize * dpr);
  canvas.style.width = `${cssSize}px`;
  canvas.style.height = `${cssSize}px`;
  canvas.className = 'item-icon';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  drawItem(ctx, type, cssSize / 2, cssSize / 2, cssSize * 0.62);
  return canvas;
}
