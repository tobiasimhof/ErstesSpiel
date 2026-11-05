// Zeichnet die Welt auf die Zeichenfläche (Canvas).
// Liest nur den Spielzustand, verändert ihn nie.

import { TILE } from './camera.js';
import { BUILDINGS } from '../core/data/buildings.js';
import { buildingSize, isOwned } from '../core/state.js';

const COLORS = {
  background: '#1f1a14',
  owned: '#7fa35a',
  ownedAlt: '#789c53',
  locked: '#4f5848',
  lockedAlt: '#4b5444',
  lockedHatch: 'rgba(0, 0, 0, 0.18)',
  gridLine: 'rgba(0, 0, 0, 0.13)',
  plotBorder: '#f3e6c4',
  shadow: 'rgba(0, 0, 0, 0.28)',
  labelBg: 'rgba(36, 26, 16, 0.82)',
  labelText: '#f3e6c4',
  selection: '#ffd43b',
};

const EMOJI_FONT = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
const LABEL_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let dpr = 1;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    return { width: rect.width, height: rect.height };
  }

  function draw(state, cam, ui) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = dpr * cam.zoom;
    ctx.setTransform(scale, 0, 0, scale, -cam.x * scale, -cam.y * scale);

    drawGround(state, cam);
    for (const building of state.buildings) {
      drawBuilding(building, cam, building.id === ui.selectedId);
    }
  }

  function drawGround(state, cam) {
    const { width, height } = state.world;
    for (let ty = 0; ty < height; ty++) {
      for (let tx = 0; tx < width; tx++) {
        const owned = isOwned(state, tx, ty);
        const alt = (tx + ty) % 2 === 1;
        ctx.fillStyle = owned ? (alt ? COLORS.ownedAlt : COLORS.owned) : alt ? COLORS.lockedAlt : COLORS.locked;
        ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
        if (!owned) {
          // Schraffur für gesperrte Fläche
          ctx.strokeStyle = COLORS.lockedHatch;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tx * TILE, (ty + 1) * TILE);
          ctx.lineTo((tx + 1) * TILE, ty * TILE);
          ctx.stroke();
        }
      }
    }

    // Rasterlinien auf dem eigenen Grundstück
    const p = state.plot;
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 1 / cam.zoom;
    ctx.beginPath();
    for (let tx = p.x; tx <= p.x + p.width; tx++) {
      ctx.moveTo(tx * TILE, p.y * TILE);
      ctx.lineTo(tx * TILE, (p.y + p.height) * TILE);
    }
    for (let ty = p.y; ty <= p.y + p.height; ty++) {
      ctx.moveTo(p.x * TILE, ty * TILE);
      ctx.lineTo((p.x + p.width) * TILE, ty * TILE);
    }
    ctx.stroke();

    // Grundstücksgrenze
    ctx.strokeStyle = COLORS.plotBorder;
    ctx.lineWidth = 3 / cam.zoom;
    ctx.strokeRect(p.x * TILE, p.y * TILE, p.width * TILE, p.height * TILE);
  }

  function drawBuilding(building, cam, selected) {
    const def = BUILDINGS[building.type];
    const { width, height } = buildingSize(building);
    const inset = 4;
    const x = building.x * TILE + inset;
    const y = building.y * TILE + inset;
    const w = width * TILE - 2 * inset;
    const h = height * TILE - 2 * inset;
    const radius = 10;

    // Schatten
    ctx.fillStyle = COLORS.shadow;
    roundRect(x + 4, y + 5, w, h, radius);
    ctx.fill();

    // Körper
    ctx.fillStyle = def.color;
    roundRect(x, y, w, h, radius);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lichtkante oben
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    roundRect(x + 3, y + 3, w - 6, h * 0.35, radius - 3);
    ctx.fill();

    // Symbol (deckende Füllfarbe, sonst werden farbige Emojis durchsichtig)
    const iconSize = Math.min(w, h) * 0.55;
    ctx.fillStyle = '#000';
    ctx.font = `${iconSize}px ${EMOJI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.icon, x + w / 2, y + h * 0.46);

    // Name: sitzt mittig auf der Unterkante, bleibt auf dem Bildschirm etwa
    // 12 px groß und darf breiter als das Gebäude sein. Bei sehr kleinem
    // Zoom wird er ausgeblendet.
    if (cam.zoom >= 0.5) {
      const fontSize = 12 / cam.zoom;
      ctx.font = `600 ${fontSize}px ${LABEL_FONT}`;
      const textW = ctx.measureText(def.name).width;
      const padX = 6 / cam.zoom;
      const boxH = fontSize * 1.5;
      const boxX = x + w / 2 - textW / 2 - padX;
      const boxY = y + h - boxH / 2;
      ctx.fillStyle = COLORS.labelBg;
      roundRect(boxX, boxY, textW + 2 * padX, boxH, boxH / 2);
      ctx.fill();
      ctx.fillStyle = COLORS.labelText;
      ctx.fillText(def.name, x + w / 2, boxY + boxH / 2 + fontSize * 0.05);
    }

    if (selected) {
      ctx.strokeStyle = COLORS.selection;
      ctx.lineWidth = 4 / cam.zoom;
      roundRect(x - 3, y - 3, w + 6, h + 6, radius + 3);
      ctx.stroke();
    }
  }

  function roundRect(x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  return { resize, draw };
}
