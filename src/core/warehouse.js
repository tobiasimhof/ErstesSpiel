// Lagerhaus und Laden-Lager (v0.12.0, Wunsch von Tobias): Das Lagerhaus ist
// das Gegenstück zum Versandportal. Das Versandportal schickt Waren vom Band
// ins Laden-Lager; das Lagerhaus holt sie zurück aufs Band.
//
// - Befüllen: einmal eine bestimmte Menge aus dem Laden-Lager hineinlegen.
// - Nachschub: dauerhaft nachholen. Das Lagerhaus hält nur ein paar Stück
//   bereit (supplyBuffer), der Rest bleibt sichtbar im Laden-Lager. Ein
//   einstellbarer Rest (keep) bleibt immer dort, z. B. zum Bauen.
// - Ausräumen: alles zurück ins Laden-Lager, Nachschub aus.
//
// Was im Lagerhaus liegt, läuft wie bisher am Ausgang aufs Band.
// Kennt keine Grafik.

import { BUILDINGS } from './data/buildings.js';
import { ITEMS } from './data/items.js';
import { addToStorage, storageCount, takeFromStorage } from './shop.js';

function storageDef(building) {
  const p = BUILDINGS[building?.type]?.production;
  return p?.kind === 'storage' ? p : null;
}

export function isWarehouse(building) {
  return Boolean(storageDef(building));
}

// Rohstoffe legt man in Gebäude ein; ins Lagerhaus kommt alles andere.
export function canStoreItem(type) {
  return Boolean(ITEMS[type]) && !ITEMS[type].raw;
}

export function warehouseCount(building, type) {
  return building.prod.slots.filter((s) => s.type === type).reduce((sum, s) => sum + s.count, 0);
}

export function warehouseTotal(building) {
  return building.prod.slots.reduce((sum, s) => sum + s.count, 0);
}

// Wie viele Stück dieser Ware passen noch hinein? (angefangene Fächer
// derselben Ware und freie Fächer)
export function warehouseRoom(building, type) {
  const p = storageDef(building);
  if (!p) return 0;
  const slots = building.prod.slots;
  const partial = slots.filter((s) => s.type === type).reduce((sum, s) => sum + (p.slotSize - s.count), 0);
  return partial + (p.slots - slots.length) * p.slotSize;
}

// Legt n Stück ins Lagerhaus: erst in angefangene Fächer derselben Ware,
// dann in freie Fächer. Gibt zurück, wie viele hineingepasst haben.
function putIn(building, type, n) {
  const p = storageDef(building);
  let left = n;
  for (const slot of building.prod.slots) {
    if (left <= 0) break;
    if (slot.type !== type) continue;
    const add = Math.min(left, p.slotSize - slot.count);
    slot.count += add;
    left -= add;
  }
  while (left > 0 && building.prod.slots.length < p.slots) {
    const add = Math.min(left, p.slotSize);
    building.prod.slots.push({ type, count: add });
    left -= add;
  }
  return n - left;
}

// ---------- Befüllen ----------

// So viele Stück lassen sich gerade hineinlegen.
export function fillMax(state, building, type) {
  if (!isWarehouse(building) || !canStoreItem(type)) return 0;
  return Math.min(storageCount(state, type), warehouseRoom(building, type));
}

// Legt bis zu n Stück aus dem Laden-Lager hinein. Gibt die Anzahl zurück.
export function fillWarehouse(state, building, type, n) {
  const count = Math.min(Math.max(0, Math.floor(n)), fillMax(state, building, type));
  if (count <= 0) return 0;
  takeFromStorage(state, type, count);
  putIn(building, type, count);
  return count;
}

// ---------- Nachschub ----------

export function setSupply(building, type, keep = 0) {
  if (!isWarehouse(building) || !canStoreItem(type)) return false;
  building.prod.supply = { type, keep: Math.max(0, Math.floor(keep)) };
  return true;
}

export function stopSupply(building) {
  if (isWarehouse(building)) building.prod.supply = null;
}

// So viele Stück darf der Nachschub gerade aus dem Laden-Lager holen
// (alles über dem Rest, der dort bleiben soll).
export function supplyAvailable(state, building) {
  const supply = building.prod.supply;
  if (!supply) return 0;
  return Math.max(0, storageCount(state, supply.type) - supply.keep);
}

// Jeden Takt: Das Lagerhaus füllt seine Ware auf supplyBuffer Stück auf.
// Gibt zurück, wie viele es geholt hat.
export function updateSupply(state, building) {
  const p = storageDef(building);
  const supply = building.prod.supply;
  if (!p || !supply) return 0;
  const want = Math.min(
    (p.supplyBuffer ?? p.slotSize) - warehouseCount(building, supply.type),
    warehouseRoom(building, supply.type),
    supplyAvailable(state, building),
  );
  if (want <= 0) return 0;
  takeFromStorage(state, supply.type, want);
  putIn(building, supply.type, want);
  return want;
}

// ---------- Ausräumen ----------

// Legt alles ins Laden-Lager (wie beim Abreißen darf es dabei übervoll
// werden, damit nichts verloren geht) und schaltet den Nachschub aus –
// sonst wäre es sofort wieder voll. Gibt zurück: { Ware: Anzahl }.
export function emptyWarehouse(state, building) {
  if (!isWarehouse(building)) return {};
  const back = {};
  for (const slot of building.prod.slots) {
    back[slot.type] = (back[slot.type] ?? 0) + slot.count;
    addToStorage(state, slot.type, slot.count);
  }
  building.prod.slots = [];
  building.prod.supply = null;
  return back;
}
