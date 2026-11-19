// Laden-Lager: hier landen Waren aus dem Versandportal und gekaufte Rohstoffe.

import { SHOP_LEVELS, STORAGE_UPGRADE } from './data/shop.js';

// Plätze im Laden-Lager: je Level (SHOP_LEVELS) plus die gekauften Ausbauten.
export function storageCapacity(state) {
  const base = SHOP_LEVELS[state.shopLevel]?.storage ?? SHOP_LEVELS[1].storage;
  return base + storageUpgrades(state) * STORAGE_UPGRADE.size;
}

// ---------- Laden-Lager vergrößern (v0.30.0, Tobias) ----------

// So oft wurde das Laden-Lager schon vergrößert.
export function storageUpgrades(state) {
  return state.storageUpgrades ?? 0;
}

// Preis des Ausbaus Nummer index (0 = der erste): 5.000, 7.500, 10.000 …
export function storageUpgradePrice(index) {
  return STORAGE_UPGRADE.firstPrice + index * STORAGE_UPGRADE.priceStep;
}

// Der nächste Ausbau: { number (1–max), price, size, from, to } oder null,
// wenn das Lager schon ganz ausgebaut ist.
export function nextStorageUpgrade(state) {
  const done = storageUpgrades(state);
  if (done >= STORAGE_UPGRADE.max) return null;
  const from = storageCapacity(state);
  return { number: done + 1, price: storageUpgradePrice(done), size: STORAGE_UPGRADE.size, from, to: from + STORAGE_UPGRADE.size };
}

// Was hindert am nächsten Ausbau? 'max' (ganz ausgebaut), 'level' (erst ab
// STORAGE_UPGRADE.level), 'gold' (zu wenig Gold) oder null (es geht).
export function storageUpgradeBlocker(state) {
  const next = nextStorageUpgrade(state);
  if (!next) return 'max';
  if (state.shopLevel < STORAGE_UPGRADE.level) return 'level';
  if (state.gold < next.price) return 'gold';
  return null;
}

// Kauft den nächsten Ausbau. Ergebnis: 'ok' | 'max' | 'level' | 'gold'
export function buyStorageUpgrade(state) {
  const blocker = storageUpgradeBlocker(state);
  if (blocker) return blocker;
  state.gold -= nextStorageUpgrade(state).price;
  state.storageUpgrades = storageUpgrades(state) + 1;
  return 'ok';
}

// ---------- Größe und Tempo der Theken ----------

// Plätze auf jeder Theke auf diesem Level (v0.10.1: alle Theken gleich groß).
export function counterSizeFor(level) {
  return (SHOP_LEVELS[level] ?? SHOP_LEVELS[1]).counterSize;
}

// v0.25.0: An jeder Theke kommt alle min–max Sekunden ein Kunde.
export function customerSecondsFor(level) {
  const [min, max] = (SHOP_LEVELS[level] ?? SHOP_LEVELS[1]).customerSeconds;
  return { min, max };
}

export function emptyCounter() {
  return { type: null, count: 0 };
}

// Beim Laden eines Spielstands: Was nicht mehr auf eine Theke passt, zurück
// ins Laden-Lager (v0.10.1: In v0.10.0 fasste Theke 5 noch 35 Stück, jetzt
// höchstens 30). Gibt zurück, was zurückkam.
export function fitCounters(state) {
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
