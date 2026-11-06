// Gebäude bauen, verschieben, drehen und abreißen.

import { BUILDINGS } from './data/buildings.js';
import { footprintSize, footprintTiles } from './geometry.js';
import { buildingContents, createProductionState } from './production.js';
import { addAllToStorage, payCost, refundCost } from './shop.js';
import { beltAt, buildingAt, findBuilding, isOwned } from './state.js';

// Passt ein Gebäude an diese Stelle? Alle Felder müssen zum eigenen
// Grundstück gehören und frei sein (kein anderes Gebäude, kein Band).
// ignoreId: das Gebäude, das gerade verschoben wird, zählt nicht als Hindernis.
export function canPlaceBuilding(state, type, x, y, rot = 0, ignoreId = null) {
  if (!BUILDINGS[type]) return false;
  for (const tile of footprintTiles(type, x, y, rot)) {
    if (!isOwned(state, tile.x, tile.y)) return false;
    const other = buildingAt(state, tile.x, tile.y);
    if (other && other.id !== ignoreId) return false;
    if (beltAt(state, tile.x, tile.y)) return false;
  }
  return true;
}

export function placeBuilding(state, type, x, y, rot = 0) {
  if (!canPlaceBuilding(state, type, x, y, rot)) return null;
  const building = { id: state.nextBuildingId++, type, x, y, rot, prod: createProductionState(type) };
  state.buildings.push(building);
  return building;
}

// Bauen mit Baukosten (v0.7.0): Die Waren kommen aus dem Laden-Lager. Was
// bezahlt wurde, merkt sich das Gebäude (paid) und gibt es beim Abreißen zurück.
// Ergebnis: das Gebäude, 'cost' (Waren fehlen) oder null (kein Platz).
export function buyBuilding(state, type, x, y, rot = 0) {
  if (!canPlaceBuilding(state, type, x, y, rot)) return null;
  const cost = BUILDINGS[type].cost ?? {};
  if (!payCost(state, cost)) return 'cost';
  const building = placeBuilding(state, type, x, y, rot);
  if (Object.keys(cost).length > 0) building.paid = { ...cost };
  return building;
}

export function moveBuilding(state, id, x, y, rot) {
  const building = findBuilding(state, id);
  if (!building || !canPlaceBuilding(state, building.type, x, y, rot, id)) return false;
  building.x = x;
  building.y = y;
  building.rot = rot;
  return true;
}

// Dreht an Ort und Stelle (obere linke Ecke bleibt). false, wenn der Platz fehlt.
export function rotateBuilding(state, id) {
  const building = findBuilding(state, id);
  if (!building) return false;
  return moveBuilding(state, id, building.x, building.y, (building.rot + 1) % 4);
}

// Reißt ab. Waren im Gebäude kommen ins Laden-Lager (siehe buildingContents),
// ebenso die bezahlten Baukosten. Startgebäude und Gebäude von vor v0.7.0
// haben nichts gekostet und geben deshalb keine Baukosten zurück.
export function removeBuilding(state, id) {
  const index = state.buildings.findIndex((b) => b.id === id);
  if (index === -1) return false;
  const [building] = state.buildings.splice(index, 1);
  addAllToStorage(state, buildingContents(building));
  if (building.paid) refundCost(state, building.paid);
  return true;
}

// Sucht in wachsenden Ringen um (cx, cy) die nächste freie Stelle, an der das
// Gebäude mit seiner Mitte möglichst nah an (cx, cy) steht. null, wenn nichts passt.
export function findFreeSpot(state, type, rot, cx, cy, ignoreId = null, maxRadius = 12) {
  const { width, height } = footprintSize(type, rot);
  const baseX = cx - Math.floor((width - 1) / 2);
  const baseY = cy - Math.floor((height - 1) / 2);
  for (let r = 0; r <= maxRadius; r++) {
    let best = null;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = baseX + dx;
        const y = baseY + dy;
        if (!canPlaceBuilding(state, type, x, y, rot, ignoreId)) continue;
        const dist = dx * dx + dy * dy;
        if (!best || dist < best.dist) best = { x, y, dist };
      }
    }
    if (best) return { x: best.x, y: best.y };
  }
  return null;
}
