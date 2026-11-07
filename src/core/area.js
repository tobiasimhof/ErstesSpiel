// Bereiche umbauen (v0.11.0): einen rechteckigen Bereich markieren und alles
// darin – Gebäude und Förderbänder – auf einmal verschieben, drehen oder
// abreißen. So lässt sich z. B. eine ganze Eisen-Linie umsetzen, ohne jedes
// Band neu zu legen (Wunsch von Tobias). Kennt keine Grafik.
//
// Eine Auswahl ist { buildings: [Gebäude-IDs], belts: ["x,y", …] }.
// Gebäude gehören dazu, sobald eines ihrer Felder im Rechteck liegt.

import { BELT_COST } from './data/buildings.js';
import { DIRS, opposite, rotateCW, sortDirs, step } from './dirs.js';
import { footprintSize, rotateLocal } from './geometry.js';
import { buildingContents, losesWorkOnRemove } from './production.js';
import { addAllToStorage } from './shop.js';
import { beltAt, buildingAt, findBuilding, isOwned, parseTileKey, tileKey } from './state.js';

// Alles, was in dem Rechteck zwischen den Feldern a und b liegt.
export function selectArea(state, a, b) {
  const x1 = Math.min(a.x, b.x);
  const x2 = Math.max(a.x, b.x);
  const y1 = Math.min(a.y, b.y);
  const y2 = Math.max(a.y, b.y);
  const buildings = state.buildings
    .filter((bld) => {
      const { width, height } = footprintSize(bld.type, bld.rot);
      return bld.x <= x2 && bld.x + width - 1 >= x1 && bld.y <= y2 && bld.y + height - 1 >= y1;
    })
    .map((bld) => bld.id);
  const belts = Object.keys(state.belts).filter((key) => {
    const { x, y } = parseTileKey(key);
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  });
  return { buildings, belts };
}

// Nur, was es (noch) gibt – z. B. nach dem Abreißen einzelner Teile.
export function cleanSelection(state, sel) {
  return {
    buildings: (sel?.buildings ?? []).filter((id) => findBuilding(state, id)),
    belts: (sel?.belts ?? []).filter((key) => state.belts[key]),
  };
}

export function isEmptySelection(sel) {
  return !sel || (sel.buildings.length === 0 && sel.belts.length === 0);
}

// Felder, die die Auswahl belegt (Gebäude mit allen Feldern).
export function selectionTiles(state, sel) {
  const tiles = [];
  for (const id of sel.buildings) {
    const b = findBuilding(state, id);
    if (!b) continue;
    const { width, height } = footprintSize(b.type, b.rot);
    for (let y = b.y; y < b.y + height; y++) for (let x = b.x; x < b.x + width; x++) tiles.push({ x, y });
  }
  for (const key of sel.belts) if (state.belts[key]) tiles.push(parseTileKey(key));
  return tiles;
}

// Kleinstes Rechteck um die Auswahl: { x, y, width, height } oder null.
export function selectionBounds(state, sel) {
  const tiles = selectionTiles(state, sel);
  if (tiles.length === 0) return null;
  const xs = tiles.map((t) => t.x);
  const ys = tiles.map((t) => t.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x + 1, height: Math.max(...ys) - y + 1 };
}

// Rechnet die Auswahl an eine neue Stelle um: (x, y) ist die linke obere Ecke
// des (gedrehten) Rechtecks um die Auswahl, turns = Vierteldrehungen im
// Uhrzeigersinn. Gebäude und Bänder werden dabei nicht verändert.
// Ergebnis: { buildings: [{ id, type, x, y, rot, prod }], belts: { "x,y": Band },
//             tiles: [{ x, y, ok }], valid, width, height }
export function planAreaMove(state, sel, x, y, turns = 0) {
  const box = selectionBounds(state, sel);
  if (!box) return null;
  const t = ((turns % 4) + 4) % 4;
  const width = t % 2 === 1 ? box.height : box.width;
  const height = t % 2 === 1 ? box.width : box.height;
  const moving = new Set(sel.buildings);
  const movingBelts = new Set(sel.belts);

  const buildings = [];
  for (const id of sel.buildings) {
    const b = findBuilding(state, id);
    if (!b) continue;
    let { width: w, height: h } = footprintSize(b.type, b.rot);
    let lx = b.x - box.x;
    let ly = b.y - box.y;
    let boxH = box.height;
    let boxW = box.width;
    // Rechteck des Gebäudes Vierteldrehung für Vierteldrehung mitdrehen
    // (wie rotateLocal, aber für die linke obere Ecke eines Rechtecks).
    for (let i = 0; i < t; i++) {
      [lx, ly] = [boxH - (ly + h), lx];
      [w, h] = [h, w];
      [boxW, boxH] = [boxH, boxW];
    }
    buildings.push({ id, type: b.type, x: x + lx, y: y + ly, rot: (b.rot + t) % 4, prod: b.prod });
  }

  const belts = {};
  for (const key of sel.belts) {
    const belt = state.belts[key];
    if (!belt) continue;
    const pos = parseTileKey(key);
    const local = rotateLocal(pos.x - box.x, pos.y - box.y, box.width, box.height, t);
    belts[tileKey(x + local.x, y + local.y)] = turnBelt(belt, t);
  }

  // Passt es? Jedes Zielfeld muss zum Grundstück gehören und frei sein –
  // Teile der Auswahl selbst zählen nicht als Hindernis (sie ziehen ja weg).
  const blocked = (tx, ty) => {
    if (!isOwned(state, tx, ty)) return true;
    const other = buildingAt(state, tx, ty);
    if (other && !moving.has(other.id)) return true;
    const key = tileKey(tx, ty);
    return Boolean(state.belts[key]) && !movingBelts.has(key);
  };
  const tiles = [];
  for (const b of buildings) {
    const { width: w, height: h } = footprintSize(b.type, b.rot);
    for (let ty = b.y; ty < b.y + h; ty++) {
      for (let tx = b.x; tx < b.x + w; tx++) tiles.push({ x: tx, y: ty, ok: !blocked(tx, ty) });
    }
  }
  for (const key of Object.keys(belts)) {
    const p = parseTileKey(key);
    tiles.push({ x: p.x, y: p.y, ok: !blocked(p.x, p.y) });
  }
  return { buildings, belts, tiles, valid: tiles.every((tile) => tile.ok), width, height };
}

// Ein Band, um t Vierteldrehungen gedreht (Ausgänge und die Ware darauf).
function turnBelt(belt, t) {
  const copy = { ...belt, outs: sortDirs(belt.outs.map((d) => rotateCW(d, t))) };
  if (belt.item) copy.item = { ...belt.item, from: rotateCW(belt.item.from, t) };
  if (belt.lastFrom) copy.lastFrom = rotateCW(belt.lastFrom, t);
  if (t !== 0 && copy.rr !== undefined) copy.rr = 0;
  return copy;
}

// Verschiebt (und dreht) die Auswahl. Alles darin bleibt miteinander
// verbunden; Waren auf Bändern und in Gebäuden ziehen mit um. Kostet nichts.
// Ergebnis: die Auswahl an der neuen Stelle, oder null, wenn es nicht passt.
export function moveArea(state, sel, x, y, turns = 0) {
  const clean = cleanSelection(state, sel);
  const plan = planAreaMove(state, clean, x, y, turns);
  if (!plan || !plan.valid) return null;
  const vacated = clean.belts.map(parseTileKey);
  for (const id of clean.buildings) {
    const b = findBuilding(state, id);
    const { width, height } = footprintSize(b.type, b.rot);
    for (let ty = b.y; ty < b.y + height; ty++) for (let tx = b.x; tx < b.x + width; tx++) vacated.push({ x: tx, y: ty });
  }
  for (const key of clean.belts) delete state.belts[key];
  Object.assign(state.belts, plan.belts);
  for (const moved of plan.buildings) {
    const b = findBuilding(state, moved.id);
    b.x = moved.x;
    b.y = moved.y;
    b.rot = moved.rot;
  }
  // Wie beim Abreißen eines Bandes: Bänder außerhalb, die in ein frei
  // gewordenes Feld gezeigt haben, verlieren diesen Ausgang, sofern sie noch
  // einen anderen haben.
  const movedKeys = new Set(Object.keys(plan.belts));
  for (const tile of vacated) {
    if (beltAt(state, tile.x, tile.y) || buildingAt(state, tile.x, tile.y)) continue;
    for (const dir of DIRS) {
      const n = step(tile, dir);
      const key = tileKey(n.x, n.y);
      const neighbor = state.belts[key];
      if (!neighbor || movedKeys.has(key)) continue;
      const back = opposite(dir);
      if (neighbor.outs.includes(back) && neighbor.outs.length > 1) {
        neighbor.outs = neighbor.outs.filter((d) => d !== back);
      }
    }
  }
  return { buildings: plan.buildings.map((b) => b.id), belts: Object.keys(plan.belts) };
}

// Geht beim Abreißen der Auswahl ein angefangener Rohstoff verloren?
export function areaLosesWork(state, sel) {
  return sel.buildings.some((id) => {
    const b = findBuilding(state, id);
    return b && losesWorkOnRemove(b);
  });
}

// Reißt alles in der Auswahl ab. Waren und bezahlte Baukosten kommen wie beim
// einzelnen Abreißen ins Laden-Lager. Ergebnis: { buildings, belts, returned }
// mit der Anzahl abgerissener Teile und allem, was ins Laden-Lager kam.
export function removeArea(state, sel) {
  const clean = cleanSelection(state, sel);
  const returned = {};
  const give = (contents) => {
    for (const [type, n] of Object.entries(contents)) if (n > 0) returned[type] = (returned[type] ?? 0) + n;
  };
  for (const key of clean.belts) {
    const belt = state.belts[key];
    if (belt.item) give({ [belt.item.type]: 1 });
    if (belt.paid) give(BELT_COST);
    delete state.belts[key];
  }
  for (const id of clean.buildings) {
    const index = state.buildings.findIndex((b) => b.id === id);
    const [b] = state.buildings.splice(index, 1);
    give(buildingContents(b));
    if (b.paid) give(b.paid);
  }
  addAllToStorage(state, returned);
  // Bänder außerhalb, die in den Bereich gezeigt haben: wie beim einzelnen Abreißen
  for (const key of clean.belts) {
    const tile = parseTileKey(key);
    for (const dir of DIRS) {
      const n = step(tile, dir);
      const neighbor = beltAt(state, n.x, n.y);
      const back = opposite(dir);
      if (neighbor && neighbor.outs.includes(back) && neighbor.outs.length > 1) {
        neighbor.outs = neighbor.outs.filter((d) => d !== back);
      }
    }
  }
  return { buildings: clean.buildings.length, belts: clean.belts.length, returned };
}
