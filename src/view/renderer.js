// Zeichnet die Welt auf die Zeichenfläche (Canvas).
// Liest nur den Spielzustand, verändert ihn nie.

import { TILE } from './camera.js';
import { BUILDINGS } from '../core/data/buildings.js';
import { DELTA, opposite, step } from '../core/dirs.js';
import { buildingPorts, footprintSize } from '../core/geometry.js';
import { inputSides, pathDirections } from '../core/belts.js';
import { landOffer, landOffers } from '../core/land.js';
import { buildingProgress, buildingStatus } from '../core/production.js';
import { BELT_SPEED, TICK } from '../core/sim.js';
import { drawItem } from './itemArt.js';
import { beltAt, isOwned, parseTileKey } from '../core/state.js';

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
  beltRail: '#3a342d',
  beltBand: '#655c51',
  beltArrow: '#f2c94c',
  portIn: '#74c0fc',
  portOut: '#ffa94d',
  portStroke: 'rgba(0, 0, 0, 0.55)',
  ghostOk: '#51cf66',
  ghostBad: '#ff6b6b',
  preview: 'rgba(255, 212, 59, 0.38)',
  statusWork: '#51cf66',
  statusIdle: '#fcc419',
  statusBlocked: '#ff6b6b',
  barBack: 'rgba(0, 0, 0, 0.45)',
  barFill: '#ffe066',
  previewArrow: '#fff8dc',
  landSignText: '#ffe066',
  landSignPoor: 'rgba(243, 230, 196, 0.6)',
  landPick: 'rgba(255, 212, 59, 0.28)',
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
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = dpr * cam.zoom;
    ctx.setTransform(scale, 0, 0, scale, -cam.x * scale, -cam.y * scale);

    drawGround(state, cam);

    drawBelts(state, ui.simAlpha ?? 0);

    // Auswahlrahmen vor den Gebäuden zeichnen: er liegt in der Lücke um das
    // Gebäude und verdeckt so weder Namen noch Pfeile.
    drawSelection(state, cam, ui.selected);

    const movingId = ui.ghost?.movingId ?? null;
    for (const building of state.buildings) {
      drawBuilding(building, cam, { alpha: building.id === movingId ? 0.3 : 1, state });
    }

    if (ui.beltPreview) drawBeltPreview(state, ui.beltPreview);
    if (ui.ghost) drawBuilding(ui.ghost, cam, { alpha: 0.7, outline: ui.ghost.valid ? COLORS.ghostOk : COLORS.ghostBad });

    drawPlotLabel(state, cam);
    // Schilder „＋ Preis“ zum Flächenkauf, nur beim Ansehen und in der Bauleiste
    if (ui.mode === 'normal' || ui.mode === 'menu') drawLandSigns(state, cam);
  }

  // ---------- Fläche kaufen (v0.9.0) ----------

  // An jeder Seite, an der es noch Fläche gibt, ein Schild mit dem Preis.
  // Es liegt auf der gesperrten Fläche direkt neben dem Grundstück, mittig
  // zur Seite, und ist auf dem Bildschirm etwa gleich groß.
  function drawLandSigns(state, cam) {
    const p = state.plot;
    const fontSize = 13 / cam.zoom;
    const gap = 5 / cam.zoom;
    ctx.font = `700 ${fontSize}px ${LABEL_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const offer of landOffers(state)) {
      const text = `＋ ${offer.price.toLocaleString('de-DE')} 🪙`;
      const boxW = ctx.measureText(text).width + 16 / cam.zoom;
      const boxH = fontSize * 1.8;
      const midX = (offer.x + offer.width / 2) * TILE;
      const midY = (offer.y + offer.height / 2) * TILE;
      let x = midX - boxW / 2;
      let y = midY - boxH / 2;
      if (offer.side === 'E') x = (p.x + p.width) * TILE + gap;
      if (offer.side === 'W') x = p.x * TILE - gap - boxW;
      if (offer.side === 'N') y = p.y * TILE - gap - boxH;
      if (offer.side === 'S') y = (p.y + p.height) * TILE + gap;
      ctx.fillStyle = COLORS.labelBg;
      roundRect(x, y, boxW, boxH, boxH / 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.plotBorder;
      ctx.lineWidth = 1.5 / cam.zoom;
      ctx.stroke();
      ctx.fillStyle = state.gold >= offer.price ? COLORS.landSignText : COLORS.landSignPoor;
      ctx.fillText(text, x + boxW / 2, y + boxH / 2 + fontSize * 0.05);
    }
  }

  // ---------- Boden ----------

  function drawGround(state, cam) {
    const { width, height } = state.world;
    for (let ty = 0; ty < height; ty++) {
      for (let tx = 0; tx < width; tx++) {
        const owned = isOwned(state, tx, ty);
        const alt = (tx + ty) % 2 === 1;
        ctx.fillStyle = owned ? (alt ? COLORS.ownedAlt : COLORS.owned) : alt ? COLORS.lockedAlt : COLORS.locked;
        ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
        if (!owned) {
          ctx.strokeStyle = COLORS.lockedHatch;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tx * TILE, (ty + 1) * TILE);
          ctx.lineTo((tx + 1) * TILE, ty * TILE);
          ctx.stroke();
        }
      }
    }

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

    ctx.strokeStyle = COLORS.plotBorder;
    ctx.lineWidth = 3 / cam.zoom;
    ctx.strokeRect(p.x * TILE, p.y * TILE, p.width * TILE, p.height * TILE);
  }

  // Der Laden ist das ganze Grundstück: Schild oben links.
  function drawPlotLabel(state, cam) {
    const p = state.plot;
    const text = `⚖️ Dein Laden · Level ${state.shopLevel}`;
    const fontSize = 12 / cam.zoom;
    ctx.font = `600 ${fontSize}px ${LABEL_FONT}`;
    const textW = ctx.measureText(text).width;
    const padX = 8 / cam.zoom;
    const boxH = fontSize * 1.7;
    const x = p.x * TILE + 6 / cam.zoom;
    const y = p.y * TILE + 6 / cam.zoom;
    ctx.fillStyle = COLORS.labelBg;
    roundRect(x, y, textW + 2 * padX, boxH, boxH / 2);
    ctx.fill();
    ctx.fillStyle = COLORS.labelText;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padX, y + boxH / 2 + fontSize * 0.05);
  }

  // ---------- Förderbänder ----------

  // Bänder in drei Durchgängen: erst alle Ränder, dann alle Laufflächen, dann
  // alle Pfeile. So malt kein Feld über die Lauffläche seines Nachbarn. Arme zu
  // Nachbarbändern ragen ein kleines Stück über die Feldgrenze, damit dort
  // keine feine Fuge durchscheint.
  function drawBelts(state, simAlpha) {
    const tiles = Object.entries(state.belts).map(([key, belt]) => {
      const { x, y } = parseTileKey(key);
      let ins = inputSides(state, x, y);
      // Bandanfang ohne Zulauf: als gerades Stück zeichnen
      if (ins.length === 0 && belt.outs.length > 0) ins = [opposite(belt.outs[0])];
      const sides = new Set([...belt.outs, ...ins]);
      const joined = new Set([...sides].filter((d) => {
        const n = step({ x, y }, d);
        return Boolean(beltAt(state, n.x, n.y));
      }));
      return { x, y, outs: belt.outs, ins, sides, joined };
    });

    ctx.fillStyle = COLORS.beltRail;
    for (const t of tiles) drawBand(t, TILE * 0.7);
    ctx.fillStyle = COLORS.beltBand;
    for (const t of tiles) drawBand(t, TILE * 0.54);

    ctx.strokeStyle = COLORS.beltArrow;
    ctx.lineWidth = TILE * 0.08;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const t of tiles) drawBeltArrows(t);

    // Waren: vom Eingang zur Feldmitte, dann zum geplanten Ausgang. simAlpha
    // schiebt sie zwischen zwei Takten weich weiter.
    for (const [key, belt] of Object.entries(state.belts)) {
      if (!belt.item) continue;
      const { x, y } = parseTileKey(key);
      const item = belt.item;
      const p = item.progress >= 1 ? 1 : Math.min(1, item.progress + BELT_SPEED * TICK * simAlpha);
      const exit = belt.outs[(belt.rr ?? 0) % belt.outs.length];
      const cx = (x + 0.5) * TILE;
      const cy = (y + 0.5) * TILE;
      let px;
      let py;
      if (p < 0.5) {
        const f = p / 0.5;
        px = cx + DELTA[item.from].x * TILE * 0.5 * (1 - f);
        py = cy + DELTA[item.from].y * TILE * 0.5 * (1 - f);
      } else {
        const f = (p - 0.5) / 0.5;
        px = cx + DELTA[exit].x * TILE * 0.5 * f;
        py = cy + DELTA[exit].y * TILE * 0.5 * f;
      }
      drawItem(ctx, item.type, px, py, TILE * 0.34);
    }
  }

  function drawBand(t, width) {
    const cx = (t.x + 0.5) * TILE;
    const cy = (t.y + 0.5) * TILE;
    const w = width;
    ctx.fillRect(cx - w / 2, cy - w / 2, w, w);
    for (const dir of t.sides) {
      const len = TILE / 2 + (t.joined.has(dir) ? 1 : 0);
      if (dir === 'N') ctx.fillRect(cx - w / 2, cy - len, w, len);
      if (dir === 'S') ctx.fillRect(cx - w / 2, cy, w, len);
      if (dir === 'W') ctx.fillRect(cx - len, cy - w / 2, len, w);
      if (dir === 'E') ctx.fillRect(cx, cy - w / 2, len, w);
    }
  }

  // Pfeile: normalerweise einer pro Feld. An Abzweigungen steht nur der Pfeil,
  // der geradeaus weiterläuft, in der Mitte – die Richtung der Abzweige zeigt
  // das nächste Band. Führt ein Abzweig nicht auf ein Band (z. B. direkt in
  // ein Gebäude), bekommt er einen Pfeil an seiner Mündung. Bleibt ein
  // Verteiler ganz ohne Pfeil, markiert ihn ein Punkt.
  function drawBeltArrows(t) {
    const cx = (t.x + 0.5) * TILE;
    const cy = (t.y + 0.5) * TILE;
    if (t.outs.length === 1) {
      const dir = t.outs[0];
      drawChevron(cx + DELTA[dir].x * TILE * 0.22, cy + DELTA[dir].y * TILE * 0.22, dir, TILE * 0.15);
      return;
    }
    const straight = new Set(t.ins.map(opposite));
    let drawn = 0;
    for (const dir of t.outs) {
      if (straight.has(dir)) {
        drawChevron(cx, cy, dir, TILE * 0.15);
        drawn++;
      } else if (!t.joined.has(dir)) {
        drawChevron(cx + DELTA[dir].x * TILE * 0.36, cy + DELTA[dir].y * TILE * 0.36, dir, TILE * 0.11);
        drawn++;
      }
    }
    if (drawn === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, TILE * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.beltArrow;
      ctx.fill();
    }
  }

  function drawChevron(px, py, dir, size) {
    const d = DELTA[dir];
    const perp = { x: -d.y, y: d.x };
    ctx.beginPath();
    ctx.moveTo(px - d.x * size * 0.5 + perp.x * size, py - d.y * size * 0.5 + perp.y * size);
    ctx.lineTo(px + d.x * size * 0.5, py + d.y * size * 0.5);
    ctx.lineTo(px - d.x * size * 0.5 - perp.x * size, py - d.y * size * 0.5 - perp.y * size);
    ctx.stroke();
  }

  function drawBeltPreview(state, path) {
    const dirs = pathDirections(path);
    ctx.strokeStyle = COLORS.previewArrow;
    ctx.lineWidth = TILE * 0.08;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    path.tiles.forEach((t, i) => {
      ctx.fillStyle = COLORS.preview;
      roundRect(t.x * TILE + 3, t.y * TILE + 3, TILE - 6, TILE - 6, 8);
      ctx.fill();
      const dir = dirs[i];
      if (dir) {
        const cx = (t.x + 0.5) * TILE;
        const cy = (t.y + 0.5) * TILE;
        const offset = beltAt(state, t.x, t.y) ? 0.25 : 0.1;
        drawChevron(cx + DELTA[dir].x * TILE * offset, cy + DELTA[dir].y * TILE * offset, dir, TILE * 0.16);
      }
    });
  }

  // ---------- Gebäude ----------

  function drawBuilding(building, cam, { alpha = 1, outline = null, state = null } = {}) {
    const def = BUILDINGS[building.type];
    const { width, height } = footprintSize(building.type, building.rot);
    const inset = 4;
    const x = building.x * TILE + inset;
    const y = building.y * TILE + inset;
    const w = width * TILE - 2 * inset;
    const h = height * TILE - 2 * inset;
    const radius = 10;

    ctx.globalAlpha = alpha;

    ctx.fillStyle = COLORS.shadow;
    roundRect(x + 4, y + 5, w, h, radius);
    ctx.fill();

    ctx.fillStyle = def.color;
    roundRect(x, y, w, h, radius);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

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

    // Name: bleibt auf dem Bildschirm etwa 12 px groß. Er sucht sich die erste
    // Stelle, an der er keinen Ein-/Ausgangspfeil verdeckt: Unterkante,
    // Oberkante, unter dem Gebäude, über dem Gebäude. Bei kleinen Gebäuden (auf
    // dem Bildschirm) nur außerhalb, damit das Symbol sichtbar bleibt. Bei sehr
    // kleinem Zoom ausgeblendet.
    const ports = buildingPorts(building);
    if (cam.zoom >= 0.5) {
      const fontSize = 12 / cam.zoom;
      ctx.font = `600 ${fontSize}px ${LABEL_FONT}`;
      const textW = ctx.measureText(def.name).width;
      const padX = 6 / cam.zoom;
      const boxW = textW + 2 * padX;
      const boxH = fontSize * 1.5;
      const boxX = x + w / 2 - boxW / 2;
      const clear = TILE * 0.26; // Abstand, damit Pfeile frei bleiben (größer als portBox)
      const candidates = [
        y + h - boxH / 2, // auf der Unterkante
        y - boxH / 2, // auf der Oberkante
        y + h + clear, // unter dem Gebäude
        y - boxH - clear, // über dem Gebäude
      ];
      const small = h * cam.zoom < 56;
      const arrows = ports.map((port) => portBox(port));
      const free = (by) =>
        arrows.every((a) => boxX + boxW < a.x0 || boxX > a.x1 || by + boxH < a.y0 || by > a.y1);
      const options = small ? candidates.slice(2) : candidates;
      const boxY = options.find(free) ?? options[0];
      ctx.fillStyle = COLORS.labelBg;
      roundRect(boxX, boxY, boxW, boxH, boxH / 2);
      ctx.fill();
      ctx.fillStyle = COLORS.labelText;
      ctx.fillText(def.name, x + w / 2, boxY + boxH / 2 + fontSize * 0.05);
    }

    // Ein- und Ausgänge zuletzt, damit der Name sie nicht verdeckt
    for (const port of ports) drawPort(port);

    // Status (nur gebaute Gebäude): Licht oben rechts, Fortschrittsleiste oben
    if (state && building.prod) {
      const status = buildingStatus(state, building);
      // Licht etwa 12 px groß, bei kleinen Gebäuden (z. B. 1 × 1 auf dem Handy) kleiner
      const r = Math.min(6 / cam.zoom, Math.min(w, h) * 0.13);
      ctx.beginPath();
      ctx.arc(x + w - r - 4 / cam.zoom, y + r + 4 / cam.zoom, r, 0, Math.PI * 2);
      ctx.fillStyle =
        status.level === 'work' ? COLORS.statusWork : status.level === 'blocked' ? COLORS.statusBlocked : COLORS.statusIdle;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 2 / cam.zoom;
      ctx.stroke();

      const progress = buildingProgress(building);
      if (progress !== null) {
        const barH = 5 / cam.zoom;
        const barX = x + 8;
        const barW = w - 16 - 2 * r - 8 / cam.zoom;
        const barY = y + 4 / cam.zoom + r - barH / 2;
        ctx.fillStyle = COLORS.barBack;
        roundRect(barX, barY, barW, barH, barH / 2);
        ctx.fill();
        ctx.fillStyle = COLORS.barFill;
        roundRect(barX, barY, Math.max(barH, barW * progress), barH, barH / 2);
        ctx.fill();
      }
    }

    if (outline) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 4 / cam.zoom;
      roundRect(x - 3, y - 3, w + 6, h + 6, radius + 3);
      ctx.stroke();
      if (outline === COLORS.ghostBad) {
        ctx.fillStyle = 'rgba(255, 107, 107, 0.25)';
        roundRect(x, y, w, h, radius);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Ungefähre Fläche eines Pfeils (für die Platzierung des Namens).
  function portBox(port) {
    const d = DELTA[port.side];
    const ex = (port.tile.x + 0.5) * TILE + d.x * (TILE / 2 - 4);
    const ey = (port.tile.y + 0.5) * TILE + d.y * (TILE / 2 - 4);
    const r = TILE * 0.22;
    return { x0: ex - r, x1: ex + r, y0: ey - r, y1: ey + r };
  }

  // Pfeil auf der Gebäudekante: blau zeigt hinein (Eingang), orange hinaus (Ausgang).
  function drawPort(port) {
    const d = DELTA[port.side];
    const perp = { x: -d.y, y: d.x };
    const ex = (port.tile.x + 0.5) * TILE + d.x * (TILE / 2 - 4);
    const ey = (port.tile.y + 0.5) * TILE + d.y * (TILE / 2 - 4);
    const dir = port.kind === 'out' ? 1 : -1;
    const tipX = ex + d.x * dir * TILE * 0.16;
    const tipY = ey + d.y * dir * TILE * 0.16;
    const baseX = ex - d.x * dir * TILE * 0.1;
    const baseY = ey - d.y * dir * TILE * 0.1;
    const half = TILE * 0.17;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(baseX + perp.x * half, baseY + perp.y * half);
    ctx.lineTo(baseX - perp.x * half, baseY - perp.y * half);
    ctx.closePath();
    ctx.fillStyle = port.kind === 'out' ? COLORS.portOut : COLORS.portIn;
    ctx.fill();
    ctx.strokeStyle = COLORS.portStroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawSelection(state, cam, selected) {
    if (!selected) return;
    ctx.strokeStyle = COLORS.selection;
    ctx.lineWidth = 4 / cam.zoom;
    if (selected.kind === 'building') {
      const b = state.buildings.find((item) => item.id === selected.id);
      if (!b) return;
      const { width, height } = footprintSize(b.type, b.rot);
      ctx.lineWidth = 6 / cam.zoom;
      roundRect(b.x * TILE, b.y * TILE, width * TILE, height * TILE, 14);
      ctx.stroke();
    } else if (selected.kind === 'belt') {
      roundRect(selected.x * TILE + 2, selected.y * TILE + 2, TILE - 4, TILE - 4, 8);
      ctx.stroke();
    } else if (selected.kind === 'land') {
      // Der Streifen, der gekauft würde
      const offer = landOffer(state, selected.side);
      if (!offer) return;
      ctx.fillStyle = COLORS.landPick;
      ctx.fillRect(offer.x * TILE, offer.y * TILE, offer.width * TILE, offer.height * TILE);
      ctx.strokeRect(offer.x * TILE, offer.y * TILE, offer.width * TILE, offer.height * TILE);
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
