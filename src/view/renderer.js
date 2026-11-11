// Zeichnet die Welt auf die Zeichenfläche (Canvas).
// Liest nur den Spielzustand, verändert ihn nie.

import { intersects, TILE, visibleRect } from './camera.js';
import { BUILDINGS } from '../core/data/buildings.js';
import { DELTA, opposite, step } from '../core/dirs.js';
import { buildingPorts, footprintSize } from '../core/geometry.js';
import { beltLine, inputSides, pathDirections } from '../core/belts.js';
import { landOffer, landOffers } from '../core/land.js';
import { buildingProgress, buildingStatus, gardenCrop, growth, isRipe } from '../core/production.js';
import { BELT_SPEED, TICK } from '../core/sim.js';
import { buildingFace } from './buildingFace.js';
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
  areaMark: 'rgba(255, 212, 59, 0.38)',
  areaRect: '#fff8dc',
  areaOk: 'rgba(81, 207, 102, 0.3)',
  areaBad: 'rgba(255, 107, 107, 0.6)',
  lineMark: 'rgba(255, 212, 59, 0.3)',
  // v0.21.0: helle Scheibe mit dem Produkt, Ring für den Fortschritt, gelbes „?“-Schild
  disc: '#fbf3dc',
  discEdge: 'rgba(0, 0, 0, 0.5)',
  ringBack: 'rgba(28, 20, 12, 0.55)',
  ringFill: '#ffe066',
  askFill: '#fff3bf',
  askEdge: '#f2b705',
  askText: '#7a4a00',
};

// v0.16.0: Aussehen der Pflanzen im Beet (Stängel, Blätter, Blüten)
const PLANT_LOOK = {
  flachspflanze: { stem: '#5f8f3a', leaf: '#7fb24e', flower: '#5b8ff9', center: '#f6e7a1' },
  // v0.17.0: Ringelblume mit orangen Blüten
  ringelblume: { stem: '#557f33', leaf: '#6fa046', flower: '#f59f00', center: '#a85a00' },
};
const DEFAULT_PLANT = { stem: '#5f8f3a', leaf: '#7fb24e', flower: '#f2c94c', center: '#fff3bf' };

const EMOJI_FONT = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
const LABEL_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let dpr = 1;
  let zoom = 1;

  // v0.21.0 (Belastungstest): Warenbilder auf Bändern und Gebäuden als fertige
  // kleine Bilder zwischenspeichern, statt sie in jedem Bild neu zu malen. Die
  // Größe wird in Stufen (etwa 19 %) aufgerundet und dann leicht verkleinert.
  const sprites = new Map();
  function drawItemCached(type, cx, cy, size) {
    const px = size * dpr * zoom;
    if (!(px >= 4)) {
      drawItem(ctx, type, cx, cy, size);
      return;
    }
    const step = 2 ** (Math.ceil(Math.log2(px) * 4) / 4);
    const key = `${type}|${step}`;
    let sprite = sprites.get(key);
    if (!sprite) {
      if (sprites.size > 400) sprites.clear();
      sprite = document.createElement('canvas');
      sprite.width = sprite.height = Math.ceil(step * 1.5);
      drawItem(sprite.getContext('2d'), type, sprite.width / 2, sprite.height / 2, step);
      sprites.set(key, sprite);
    }
    const drawn = (sprite.width * size) / step;
    ctx.drawImage(sprite, cx - drawn / 2, cy - drawn / 2, drawn, drawn);
  }

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

    zoom = cam.zoom;
    const scale = dpr * cam.zoom;
    ctx.setTransform(scale, 0, 0, scale, -cam.x * scale, -cam.y * scale);

    // v0.21.0 (Belastungstest): nur zeichnen, was im Bild ist. Der Rand ist so
    // groß, dass auch Namen neben und unter einem Gebäude ganz zu sehen sind
    // (unter Zoom 0,5 gibt es keine Namen).
    const view = visibleRect(cam, cam.zoom >= 0.5 ? Math.max(TILE, 80 / cam.zoom) : TILE);

    drawGround(state, cam, view);

    // v0.11.0: Beim Verschieben eines Bereichs bleibt er an der alten Stelle
    // blass stehen, die Vorschau zeigt die neue.
    const simAlpha = ui.simAlpha ?? 0;
    const area = ui.area ?? null;
    const areaGhost = ui.mode === 'areaMove' ? area?.ghost : null;
    const dimBelts = areaGhost ? new Set(area.sel.belts) : null;
    const dimBuildings = areaGhost ? new Set(area.sel.buildings) : null;
    if (dimBelts) {
      drawBelts(state, simAlpha, (key) => !dimBelts.has(key), view);
      ctx.globalAlpha = 0.3;
      drawBelts(state, simAlpha, (key) => dimBelts.has(key), view);
      ctx.globalAlpha = 1;
    } else {
      drawBelts(state, simAlpha, null, view);
    }

    // Auswahlrahmen vor den Gebäuden zeichnen: er liegt in der Lücke um das
    // Gebäude und verdeckt so weder Namen noch Pfeile.
    drawSelection(state, cam, ui.selected);

    const movingId = ui.ghost?.movingId ?? null;
    let moving = null;
    for (const building of state.buildings) {
      if (building.id === movingId) moving = building;
      const { width, height } = footprintSize(building.type, building.rot);
      if (!intersects(view, building.x * TILE, building.y * TILE, width * TILE, height * TILE)) continue;
      const dim = building.id === movingId || Boolean(dimBuildings?.has(building.id));
      drawBuilding(building, cam, { alpha: dim ? 0.3 : 1, state });
    }

    if (ui.beltPreview) drawBeltPreview(state, ui.beltPreview);
    // Beim Verschieben zeigt die Vorschau, was das Gebäude gerade herstellt.
    if (ui.ghost) {
      const ghost = moving ? { ...ui.ghost, prod: moving.prod } : ui.ghost;
      drawBuilding(ghost, cam, { alpha: 0.7, outline: ui.ghost.valid ? COLORS.ghostOk : COLORS.ghostBad });
    }
    if (area && ui.mode === 'area') drawAreaMarks(state, cam, area);
    if (areaGhost?.plan) drawAreaGhost(cam, areaGhost, simAlpha);

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

  function drawGround(state, cam, view) {
    // Die Welt beginnt seit v0.10.2 nicht mehr bei Feld 0, 0 (oben bei y = −3).
    // v0.21.0: nur die Felder im Bild, jede Farbe in einem Rutsch
    const w = state.world;
    const tx0 = Math.max(w.x, Math.floor(view.x0 / TILE));
    const tx1 = Math.min(w.x + w.width, Math.ceil(view.x1 / TILE));
    const ty0 = Math.max(w.y, Math.floor(view.y0 / TILE));
    const ty1 = Math.min(w.y + w.height, Math.ceil(view.y1 / TILE));
    if (tx1 <= tx0 || ty1 <= ty0) return;
    const pass = (color, wanted) => {
      ctx.beginPath();
      for (let ty = ty0; ty < ty1; ty++) {
        for (let tx = tx0; tx < tx1; tx++) {
          if (wanted(isOwned(state, tx, ty), Math.abs(tx + ty) % 2 === 1)) ctx.rect(tx * TILE, ty * TILE, TILE, TILE);
        }
      }
      ctx.fillStyle = color;
      ctx.fill();
    };
    ctx.fillStyle = COLORS.locked;
    ctx.fillRect(tx0 * TILE, ty0 * TILE, (tx1 - tx0) * TILE, (ty1 - ty0) * TILE);
    pass(COLORS.lockedAlt, (owned, alt) => !owned && alt);
    pass(COLORS.owned, (owned, alt) => owned && !alt);
    pass(COLORS.ownedAlt, (owned, alt) => owned && alt);
    ctx.strokeStyle = COLORS.lockedHatch;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let ty = ty0; ty < ty1; ty++) {
      for (let tx = tx0; tx < tx1; tx++) {
        if (isOwned(state, tx, ty)) continue;
        ctx.moveTo(tx * TILE, (ty + 1) * TILE);
        ctx.lineTo((tx + 1) * TILE, ty * TILE);
      }
    }
    ctx.stroke();

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
  // filter(key): nur diese Bänder zeichnen (v0.11.0); Form und Anschlüsse
  // richten sich trotzdem nach allen Bändern. view (v0.21.0): nur Bänder im Bild.
  function drawBelts(state, simAlpha, filter = null, view = null) {
    const inView = (key) => {
      if (!view) return true;
      const { x, y } = parseTileKey(key);
      return intersects(view, x * TILE, y * TILE, TILE, TILE);
    };
    const entries = Object.entries(state.belts).filter(([key]) => (!filter || filter(key)) && inView(key));
    const tiles = entries.map(([key, belt]) => {
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
    for (const [key, belt] of entries) {
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
      drawItemCached(item.type, px, py, TILE * 0.34);
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
    const live = Boolean(state && building.prod);

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

    // v0.21.0: Aufteilung des Gebäudes. Oben eine Zeile (links Vorrat oder
    // „?“-Schild, rechts das Statuslicht), in der Mitte das Produkt, unten der
    // Name. Ein- und Ausgangspfeile bleiben frei. u = ein Bildschirmpixel,
    // höchstens so groß, dass alles ins Gebäude passt.
    const ports = buildingPorts(building);
    const reserve = portReserve(ports);
    const label = cam.zoom >= 0.5 ? nameBox(def.name, ports, x, y, w, h, cam) : null;
    const u = Math.min(1 / cam.zoom, Math.min(w, h) / 80);
    const pad = Math.min(4 / cam.zoom, Math.min(w, h) * 0.08);
    const r = Math.min(6 / cam.zoom, Math.min(w, h) * 0.13);
    const topReserve = Math.max(reserve.N, label?.where === 'top' ? label.boxH / 2 + 2 * u : 0);
    const row = { top: y + Math.max(pad, topReserve), h: Math.max(20 * u, 2 * r) };
    row.mid = row.top + row.h / 2;
    const light = { x: x + w - Math.max(pad, reserve.E) - r, y: row.mid, r };
    const layout = { x, y, w, h, u, pad, row, light, reserve, label };

    const face = buildingFace(building);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (face.kind === 'product') {
      drawProduct(face, layout, live);
    } else if (face.kind === 'storage' && face.items.length > 0) {
      drawStorage(face.items, layout);
    } else {
      // v0.16.0: Beet – Erde mit Furchen, darauf die Pflanze (groß, Tobias).
      // Das Bild (deckende Füllfarbe, sonst werden farbige Emojis
      // durchsichtig) steht nur noch auf Beet, leerem Lagerhaus und Versandportal.
      const garden = face.kind === 'garden';
      const crop = garden && building.prod ? gardenCrop(building) : null;
      if (garden) drawGarden(building, crop, x, y, w, h);
      if (!crop) {
        const iconSize = Math.min(w, h) * (garden ? 0.4 : 0.55);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.font = `${iconSize}px ${EMOJI_FONT}`;
        ctx.fillText(def.icon, x + w / 2, y + h * 0.46);
      }
    }

    // Name: bleibt auf dem Bildschirm etwa 12 px groß (Platz sucht nameBox).
    if (label) {
      ctx.font = `600 ${label.fontSize}px ${LABEL_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLORS.labelBg;
      roundRect(label.x, label.y, label.boxW, label.boxH, label.boxH / 2);
      ctx.fill();
      ctx.fillStyle = COLORS.labelText;
      ctx.fillText(def.name, x + w / 2, label.y + label.boxH / 2 + label.fontSize * 0.05);
    }

    // Ein- und Ausgänge zuletzt, damit der Name sie nicht verdeckt
    for (const port of ports) drawPort(port);

    // Status (nur gebaute Gebäude): Licht oben rechts. Das Beet behält seine
    // Fortschrittsleiste; Maschinen und Rohstoff-Gebäude zeigen den Fortschritt
    // seit v0.21.0 als Ring um das Produkt.
    if (live) {
      const status = buildingStatus(state, building);
      ctx.beginPath();
      ctx.arc(light.x, light.y, r, 0, Math.PI * 2);
      ctx.fillStyle =
        status.level === 'work' ? COLORS.statusWork : status.level === 'blocked' ? COLORS.statusBlocked : COLORS.statusIdle;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 2 / cam.zoom;
      ctx.stroke();

      if (face.kind === 'garden') {
        const progress = buildingProgress(building);
        if (progress !== null) {
          const barH = 5 / cam.zoom;
          const barX = x + 8;
          const barW = light.x - r - 4 / cam.zoom - barX;
          const barY = light.y - barH / 2;
          ctx.fillStyle = COLORS.barBack;
          roundRect(barX, barY, barW, barH, barH / 2);
          ctx.fill();
          ctx.fillStyle = COLORS.barFill;
          roundRect(barX, barY, Math.max(barH, barW * progress), barH, barH / 2);
          ctx.fill();
        }
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

  // Wie tief die Pfeile an jeder Seite ins Gebäude ragen (plus etwas Luft):
  // blaue Eingänge zeigen hinein und ragen weiter als orange Ausgänge.
  function portReserve(ports) {
    const reserve = { N: 0, E: 0, S: 0, W: 0 };
    for (const port of ports) {
      const depth = (port.kind === 'out' ? 0.1 : 0.16) * TILE + 1.5;
      reserve[port.side] = Math.max(reserve[port.side], depth);
    }
    return reserve;
  }

  // Platz für den Namen: die erste Stelle, an der er keinen Pfeil verdeckt –
  // Unterkante, Oberkante, unter dem Gebäude, über dem Gebäude. Bei kleinen
  // Gebäuden (auf dem Bildschirm) nur außerhalb, damit das Produkt frei bleibt.
  function nameBox(name, ports, x, y, w, h, cam) {
    const fontSize = 12 / cam.zoom;
    ctx.font = `600 ${fontSize}px ${LABEL_FONT}`;
    const textW = ctx.measureText(name).width;
    const padX = 6 / cam.zoom;
    const boxW = textW + 2 * padX;
    const boxH = fontSize * 1.5;
    const boxX = x + w / 2 - boxW / 2;
    const clear = TILE * 0.26; // Abstand, damit Pfeile frei bleiben (größer als portBox)
    const candidates = [
      { where: 'bottom', y: y + h - boxH / 2 },
      { where: 'top', y: y - boxH / 2 },
      { where: 'below', y: y + h + clear },
      { where: 'above', y: y - boxH - clear },
    ];
    const small = h * cam.zoom < 56;
    const arrows = ports.map((port) => portBox(port));
    const free = (c) => arrows.every((a) => boxX + boxW < a.x0 || boxX > a.x1 || c.y + boxH < a.y0 || c.y > a.y1);
    const options = small ? candidates.slice(2) : candidates;
    const pick = options.find(free) ?? options[0];
    return { where: pick.where, x: boxX, y: pick.y, boxW, boxH, fontSize };
  }

  // v0.21.0 (Tobias: Variante B): Das Produkt steht groß auf einer hellen
  // Scheibe, der Ring darum zeigt den Fortschritt. Oben links der
  // Rohstoff-Vorrat (Punkte) oder das gelbe „?“-Schild mit den fehlenden
  // Zutaten einer wartenden Kombi-Maschine.
  function drawProduct(face, layout, live) {
    const { x, y, w, h, u, pad, row, light, reserve, label } = layout;
    const gap = 2 * u;
    const top = row.top + row.h + gap;
    const bottom = y + h - Math.max(pad, reserve.S, label?.where === 'bottom' ? label.boxH / 2 + gap : 0);
    const cx = x + w / 2;
    const left = x + reserve.W + gap;
    const right = x + w - reserve.E - gap;
    const R = Math.min(Math.min(w, h) * 0.3, (bottom - top) / 2, cx - left, right - cx);
    if (R > 4) {
      const cy = (top + bottom) / 2;
      const ringW = R * 0.17;
      ctx.lineCap = 'butt';
      ctx.lineWidth = ringW;
      ctx.strokeStyle = COLORS.ringBack;
      ctx.beginPath();
      ctx.arc(cx, cy, R - ringW / 2, 0, Math.PI * 2);
      ctx.stroke();
      if (face.ring > 0) {
        ctx.strokeStyle = COLORS.ringFill;
        ctx.beginPath();
        ctx.arc(cx, cy, R - ringW / 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, face.ring));
        ctx.stroke();
      }
      ctx.fillStyle = COLORS.disc;
      ctx.beginPath();
      ctx.arc(cx, cy, R - ringW, 0, Math.PI * 2);
      ctx.fill();
      const base = ctx.globalAlpha;
      if (face.faded) ctx.globalAlpha = base * 0.35; // leer: blass
      drawItemCached(face.item, cx, cy, (R - ringW) * 1.2);
      ctx.globalAlpha = base;
    }
    if (!live) return;

    const rowLeft = x + Math.max(2 * pad, reserve.W + gap);
    const rowRight = light.x - light.r - 3 * u;
    if (face.missing.length > 0) drawAsk(face.missing, rowLeft, rowRight, row, u);
    else if (face.dots) {
      // v0.14.0: Rohstoff-Vorrat – ein Punkt je Platz, gefüllt = Rohstoff darin
      const dot = Math.min(row.h * 0.22, ((rowRight - rowLeft) / face.dots.capacity) * 0.35);
      const step = dot * 3.1;
      for (let i = 0; i < face.dots.capacity; i++) {
        ctx.beginPath();
        ctx.arc(rowLeft + dot + i * step, row.mid, dot, 0, Math.PI * 2);
        ctx.fillStyle = i < face.dots.filled ? COLORS.barFill : COLORS.barBack;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.lineWidth = 1.2 * u;
        ctx.stroke();
      }
    }
  }

  // Gelbes Schild „? + fehlende Zutat(en)“ in der oberen Zeile. Ist zu wenig
  // Platz, wird es kleiner.
  function drawAsk(types, left, right, row, u) {
    let pillH = row.h;
    const sizes = (hgt) => {
      const pad = hgt * 0.16;
      const s = hgt - 2 * pad;
      const qW = s * 0.62;
      return { pad, s, qW, pillW: pad + qW + pad * 0.7 + types.length * s + (types.length - 1) * pad * 0.5 + pad };
    };
    let m = sizes(pillH);
    if (m.pillW > right - left && right > left) {
      pillH *= (right - left) / m.pillW;
      m = sizes(pillH);
    }
    const top = row.mid - pillH / 2;
    ctx.fillStyle = COLORS.askFill;
    roundRect(left, top, m.pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.askEdge;
    ctx.lineWidth = Math.max(1.5 * u, pillH * 0.08);
    ctx.stroke();
    ctx.fillStyle = COLORS.askText;
    ctx.font = `800 ${m.s * 1.05}px ${LABEL_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', left + m.pad + m.qW / 2, row.mid + m.s * 0.04);
    types.forEach((type, i) => {
      const ix = left + m.pad + m.qW + m.pad * 0.7 + m.s / 2 + i * (m.s + m.pad * 0.5);
      drawItemCached(type, ix, row.mid, m.s * 0.82);
    });
  }

  // v0.21.0: Lagerhaus – die Waren seiner Fächer auf einem hellen Schild,
  // entlang der langen Seite; das Statuslicht und die Pfeile bleiben frei.
  function drawStorage(items, layout) {
    const { x, y, w, h, u, pad, light, reserve } = layout;
    const gap = 2 * u;
    const horizontal = w >= h;
    let x0 = x + Math.max(pad, reserve.W) + gap;
    let x1 = x + w - Math.max(pad, reserve.E) - gap;
    let y0 = y + Math.max(pad, reserve.N) + gap;
    const y1 = y + h - Math.max(pad, reserve.S) - gap;
    if (horizontal) x1 = Math.min(x1, light.x - light.r - gap);
    else y0 = Math.max(y0, light.y + light.r + gap);
    const along = horizontal ? x1 - x0 : y1 - y0;
    const across = horizontal ? y1 - y0 : x1 - x0;
    const n = items.length;
    let T = Math.min(across, 30 * u);
    let s = T * 0.74;
    let ipad = (T - s) / 2;
    const need = n * s + (n + 1) * ipad;
    if (need > along) {
      const k = along / need;
      T *= k;
      s *= k;
      ipad *= k;
    }
    const L = n * s + (n + 1) * ipad;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const bw = horizontal ? L : T;
    const bh = horizontal ? T : L;
    ctx.fillStyle = COLORS.disc;
    roundRect(cx - bw / 2, cy - bh / 2, bw, bh, T / 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.discEdge;
    ctx.lineWidth = Math.max(1, 1.5 * u);
    ctx.stroke();
    items.forEach((type, i) => {
      const offset = -L / 2 + ipad + s / 2 + i * (s + ipad);
      drawItemCached(type, horizontal ? cx + offset : cx, horizontal ? cy : cy + offset, s * 0.9);
    });
  }

  // v0.16.0: Beet. Die Pflanze wächst sichtbar in Stufen: Keimling, kleine
  // Pflanze, große Pflanze mit Knospen, reif mit Blüten – dann ein 🌾.
  function drawGarden(building, crop, x, y, w, h) {
    const m = Math.min(w, h) * 0.1;
    ctx.fillStyle = '#4a3220';
    roundRect(x + m, y + m, w - 2 * m, h - 2 * m, 8);
    ctx.fill();
    // Furchen
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.lineWidth = Math.max(2, h * 0.025);
    for (let i = 1; i <= 4; i++) {
      const fy = y + m + ((h - 2 * m) * i) / 5;
      ctx.beginPath();
      ctx.moveTo(x + m * 1.6, fy);
      ctx.lineTo(x + w - m * 1.6, fy);
      ctx.stroke();
    }
    if (!crop) return;
    const g = growth(building);
    const ripe = isRipe(building);
    const look = PLANT_LOOK[crop.plant] ?? DEFAULT_PLANT;
    const baseY = y + h - m * 1.4;
    const cx = x + w / 2;
    const size = Math.min(w, h);
    // Höhe: Keimling 15 %, ausgewachsen 62 % des Beets (die Blüten bleiben auf der Erde)
    const height = size * (0.15 + 0.47 * Math.min(1, g / 0.85));
    const stems = g < 0.2 ? 3 : g < 0.5 ? 5 : 7;
    ctx.lineCap = 'round';
    for (let i = 0; i < stems; i++) {
      const t = stems === 1 ? 0 : i / (stems - 1) - 0.5; // -0.5 … 0.5
      const sx = cx + t * size * 0.32;
      const lean = t * size * 0.22;
      const top = { x: sx + lean, y: baseY - height * (1 - Math.abs(t) * 0.35) };
      ctx.strokeStyle = look.stem;
      ctx.lineWidth = Math.max(2, size * 0.028);
      ctx.beginPath();
      ctx.moveTo(sx, baseY);
      ctx.quadraticCurveTo(sx, (baseY + top.y) / 2, top.x, top.y);
      ctx.stroke();
      // Blätter ab der kleinen Pflanze
      if (g >= 0.2) {
        ctx.fillStyle = look.leaf;
        for (const f of [0.35, 0.6]) {
          const lx = sx + (top.x - sx) * f;
          const ly = baseY + (top.y - baseY) * f;
          const side = i % 2 === 0 ? 1 : -1;
          ctx.beginPath();
          ctx.ellipse(lx + side * size * 0.035, ly, size * 0.045, size * 0.016, side * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Knospen ab 60 %, Blüten wenn reif
      if (ripe) {
        const r = size * 0.05;
        ctx.fillStyle = look.flower;
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(top.x + Math.cos(a) * r * 0.75, top.y + Math.sin(a) * r * 0.75, r * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = look.center;
        ctx.beginPath();
        ctx.arc(top.x, top.y, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (g >= 0.6) {
        ctx.fillStyle = look.flower;
        ctx.globalAlpha *= 0.85;
        ctx.beginPath();
        ctx.ellipse(top.x, top.y, size * 0.022, size * 0.034, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha /= 0.85;
      }
    }
    // Reif: 🌾 in einem hellen Kreis – auch von Weitem gut zu sehen
    if (ripe) {
      const r = size * 0.16;
      const bx = x + w * 0.22;
      const by = y + h * 0.6;
      ctx.fillStyle = 'rgba(255, 236, 153, 0.95)';
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.lineWidth = Math.max(2, size * 0.02);
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.font = `${r * 1.25}px ${EMOJI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌾', bx, by + r * 0.05);
    }
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

  // ---------- Bereich (v0.11.0) ----------

  // Markierte Gebäude und Bänder leuchten gelb; beim Ziehen ein gestrichelter Rahmen.
  function drawAreaMarks(state, cam, area) {
    ctx.fillStyle = COLORS.areaMark;
    ctx.strokeStyle = COLORS.selection;
    ctx.lineWidth = 3 / cam.zoom;
    for (const key of area.sel.belts) {
      const { x, y } = parseTileKey(key);
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
    for (const id of area.sel.buildings) {
      const b = state.buildings.find((item) => item.id === id);
      if (!b) continue;
      const { width, height } = footprintSize(b.type, b.rot);
      roundRect(b.x * TILE + 2, b.y * TILE + 2, width * TILE - 4, height * TILE - 4, 12);
      ctx.fill();
      ctx.stroke();
    }
    if (area.rect) {
      const { a, b } = area.rect;
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(a.x - b.x) + 1;
      const h = Math.abs(a.y - b.y) + 1;
      ctx.strokeStyle = COLORS.areaRect;
      ctx.setLineDash([10 / cam.zoom, 6 / cam.zoom]);
      ctx.strokeRect(x * TILE, y * TILE, w * TILE, h * TILE);
      ctx.setLineDash([]);
    }
  }

  // Vorschau beim Verschieben: grüne Felder passen, rote sind belegt oder
  // gehören nicht zum Grundstück (rot liegt obenauf, damit man es sieht).
  function drawAreaGhost(cam, ghost, simAlpha) {
    const { plan } = ghost;
    ctx.fillStyle = COLORS.areaOk;
    for (const t of plan.tiles) if (t.ok) ctx.fillRect(t.x * TILE, t.y * TILE, TILE, TILE);
    ctx.globalAlpha = 0.8;
    drawBelts({ belts: plan.belts, buildings: plan.buildings }, simAlpha);
    ctx.globalAlpha = 1;
    for (const b of plan.buildings) drawBuilding(b, cam, { alpha: 0.8 });
    ctx.fillStyle = COLORS.areaBad;
    for (const t of plan.tiles) if (!t.ok) ctx.fillRect(t.x * TILE, t.y * TILE, TILE, TILE);
    ctx.strokeStyle = plan.valid ? COLORS.ghostOk : COLORS.ghostBad;
    ctx.lineWidth = 4 / cam.zoom;
    ctx.setLineDash([12 / cam.zoom, 6 / cam.zoom]);
    ctx.strokeRect(ghost.x * TILE, ghost.y * TILE, plan.width * TILE, plan.height * TILE);
    ctx.setLineDash([]);
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
      // v0.12.0: Die ganze Strecke leicht markieren – sie wird mit
      // „Strecke leeren“ geleert.
      ctx.fillStyle = COLORS.lineMark;
      for (const key of beltLine(state, selected.x, selected.y)) {
        const t = parseTileKey(key);
        ctx.fillRect(t.x * TILE, t.y * TILE, TILE, TILE);
      }
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

  // Der Browser kann zwischengespeicherte Bilder wegwerfen (z. B. App im
  // Hintergrund) – dann neu malen.
  function clearCache() {
    sprites.clear();
  }

  return { resize, draw, clearCache };
}
