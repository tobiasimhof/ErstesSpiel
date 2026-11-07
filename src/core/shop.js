// Laden-Lager: hier landen Waren aus dem Versandportal und gekaufte Rohstoffe.

import { SHOP_LEVELS } from './data/shop.js';

export function storageCapacity(state) {
  return SHOP_LEVELS[state.shopLevel]?.storage ?? SHOP_LEVELS[1].storage;
}

// ---------- Anzahl und Größe der Theken (v0.10.0) ----------

export function counterCountFor(level) {
  return (SHOP_LEVELS[level] ?? SHOP_LEVELS[1]).counters;
}

// Plätze auf jeder Theke auf diesem Level (v0.10.1: alle Theken gleich groß).
export function counterSizeFor(level) {
  return (SHOP_LEVELS[level] ?? SHOP_LEVELS[1]).counterSize;
}

export function emptyCounter() {
  return { type: null, count: 0 };
}

// Stellt so viele leere Theken dazu, wie das Laden-Level vorsieht (nach dem
// Aufstieg und beim Laden eines Spielstands). Gibt die Anzahl neuer Theken zurück.
export function addMissingCounters(state) {
  let added = 0;
  while (state.counters.length < counterCountFor(state.shopLevel)) {
    state.counters.push(emptyCounter());
    added++;
  }
  return added;
}

// Beim Laden eines Spielstands: fehlende Theken dazu, und was nicht mehr auf
// eine Theke passt, zurück ins Laden-Lager (v0.10.1: In v0.10.0 fasste
// Theke 5 noch 35 Stück, jetzt höchstens 30). Gibt zurück, was zurückkam.
export function fitCounters(state) {
  addMissingCounters(state);
  const size = counterSizeFor(state.shopLevel);
  const returned = {};
  for (const counter of state.counters) {
    if (!counter.type || counter.count <= size) continue;
    const extra = counter.count - size;
    addToStorage(state, counter.type, extra);
    returned[counter.type] = (returned[counter.type] ?? 0) + extra;
    counter.count = size;
  }
  return returned;
}

export function storageTotal(state) {
  return Object.values(state.storage).reduce((sum, n) => sum + n, 0);
}

export function storageFree(state) {
  return Math.max(0, storageCapacity(state) - storageTotal(state));
}

export function storageCount(state, type) {
  return state.storage[type] ?? 0;
}

// Legt Waren ins Laden-Lager. Rückerstattungen (z. B. beim Abreißen) dürfen
// die Lagergröße überschreiten, damit nichts verloren geht.
export function addToStorage(state, type, count = 1) {
  if (count <= 0) return;
  state.storage[type] = storageCount(state, type) + count;
}

export function takeFromStorage(state, type, count = 1) {
  const have = storageCount(state, type);
  if (have < count) return false;
  if (have === count) delete state.storage[type];
  else state.storage[type] = have - count;
  return true;
}

export function addAllToStorage(state, contents) {
  for (const [type, count] of Object.entries(contents)) addToStorage(state, type, count);
}

// ---------- Baukosten (v0.7.0) ----------
// Kosten sind Waren aus dem Laden-Lager, z. B. { holzblock: 40 }.

// Was fehlt noch? { Ware: Anzahl } – leer, wenn alles da ist.
export function missingFor(state, cost, times = 1) {
  const missing = {};
  for (const [type, n] of Object.entries(cost ?? {})) {
    const lack = n * times - storageCount(state, type);
    if (lack > 0) missing[type] = lack;
  }
  return missing;
}

export function canAfford(state, cost, times = 1) {
  return Object.keys(missingFor(state, cost, times)).length === 0;
}

// Wie oft lassen sich die Kosten bezahlen? (z. B. Förderband-Felder)
export function affordableCount(state, cost) {
  let count = Infinity;
  for (const [type, n] of Object.entries(cost ?? {})) {
    if (n > 0) count = Math.min(count, Math.floor(storageCount(state, type) / n));
  }
  return count;
}

export function payCost(state, cost, times = 1) {
  if (!canAfford(state, cost, times)) return false;
  for (const [type, n] of Object.entries(cost ?? {})) takeFromStorage(state, type, n * times);
  return true;
}

export function refundCost(state, cost, times = 1) {
  for (const [type, n] of Object.entries(cost ?? {})) addToStorage(state, type, n * times);
}
