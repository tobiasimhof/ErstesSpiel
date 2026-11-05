// Laden-Lager: hier landen Waren aus dem Versandportal und gekaufte Rohstoffe.

import { SHOP_LEVELS } from './data/shop.js';

export function storageCapacity(state) {
  return SHOP_LEVELS[state.shopLevel]?.storage ?? SHOP_LEVELS[1].storage;
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
