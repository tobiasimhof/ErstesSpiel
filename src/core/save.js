// Spielstand in Text umwandeln und zurück, mit Prüfung auf Beschädigung.
// Steigt SAVE_VERSION, wandelt migrate() alte Spielstände um, damit keine
// Fabrik verloren geht.
//
// Versionen:
//   1 (v0.4.x): Gebäude, Förderbänder
//   2 (v0.5.0): + Laden-Lager, Zustand der Gebäude, Waren auf Bändern

import { BUILDINGS } from './data/buildings.js';
import { ITEMS } from './data/items.js';
import { RECIPES } from './data/recipes.js';
import { START_STORAGE } from './data/shop.js';
import { isDir, sortDirs } from './dirs.js';
import { createProductionState, productionOf } from './production.js';
import { parseTileKey } from './state.js';

export const SAVE_VERSION = 2;

export function serializeGame(state, now = Date.now()) {
  return JSON.stringify({ saveVersion: SAVE_VERSION, savedAt: now, state });
}

// Gibt { state, savedAt, migratedFrom? } zurück oder null, wenn der Text kein
// gültiger Spielstand ist.
export function deserializeGame(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object' || !data.state || typeof data.state !== 'object') return null;
  const from = data.saveVersion;
  if (!Number.isInteger(from) || from < 1 || from > SAVE_VERSION) return null;
  const state = migrate(data.state, from);
  if (!isValidState(state)) return null;
  for (const belt of Object.values(state.belts)) belt.outs = sortDirs(belt.outs);
  const result = { state, savedAt: Number(data.savedAt) || 0 };
  if (from < SAVE_VERSION) result.migratedFrom = from;
  return result;
}

function migrate(state, from) {
  if (from < 2) {
    // v0.4 → v0.5: Laden-Lager mit Startvorrat, Gebäude bekommen ihren Zustand
    state.storage = { ...START_STORAGE };
    if (Array.isArray(state.buildings)) {
      for (const b of state.buildings) if (b && BUILDINGS[b.type]) b.prod = createProductionState(b.type);
    }
  }
  return state;
}

const isInt = (n) => Number.isInteger(n);
const isCount = (n) => isInt(n) && n >= 0;
const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
const isItem = (t) => typeof t === 'string' && Boolean(ITEMS[t]);
const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);

function isValidStack(stack) {
  return stack === null || (isObj(stack) && isItem(stack.type) && isInt(stack.count) && stack.count > 0);
}

function isValidProduction(b) {
  const p = productionOf(b.type);
  const prod = b.prod;
  if (!isObj(prod)) return false;
  switch (p?.kind) {
    case 'source':
      return typeof prod.loaded === 'boolean' && isCount(prod.remaining) && isNum(prod.timer) && isValidStack(prod.out);
    case 'workshop':
      return (
        p.recipes.includes(prod.recipe) &&
        Boolean(RECIPES[prod.recipe]) &&
        isObj(prod.stock) &&
        Object.entries(prod.stock).every(([t, n]) => isItem(t) && isCount(n)) &&
        typeof prod.busy === 'boolean' &&
        isNum(prod.timer) &&
        isValidStack(prod.out)
      );
    case 'storage':
      return (
        Array.isArray(prod.slots) &&
        prod.slots.length <= p.slots &&
        prod.slots.every((s) => isObj(s) && isItem(s.type) && isInt(s.count) && s.count > 0 && s.count <= p.slotSize)
      );
    case 'shipping':
      return isCount(prod.shipped);
    default:
      return true;
  }
}

export function isValidState(s) {
  if (!isObj(s)) return false;
  if (!isNum(s.gold)) return false;
  if (!isInt(s.shopLevel) || s.shopLevel < 1) return false;

  const w = s.world;
  if (!w || !isInt(w.width) || !isInt(w.height) || w.width <= 0 || w.height <= 0) return false;
  const p = s.plot;
  if (!p || ![p.x, p.y, p.width, p.height].every(isInt)) return false;
  if (p.x < 0 || p.y < 0 || p.width <= 0 || p.height <= 0) return false;
  if (p.x + p.width > w.width || p.y + p.height > w.height) return false;

  if (!Array.isArray(s.buildings) || !isInt(s.nextBuildingId)) return false;
  const ids = new Set();
  for (const b of s.buildings) {
    if (!b || !isInt(b.id) || ids.has(b.id) || !BUILDINGS[b.type]) return false;
    if (!isInt(b.x) || !isInt(b.y) || !isInt(b.rot) || b.rot < 0 || b.rot > 3) return false;
    if (b.id >= s.nextBuildingId) return false;
    if (!isValidProduction(b)) return false;
    ids.add(b.id);
  }

  if (!isObj(s.belts)) return false;
  for (const [key, belt] of Object.entries(s.belts)) {
    const { x, y } = parseTileKey(key);
    if (!isInt(x) || !isInt(y) || key !== `${x},${y}`) return false;
    if (!isObj(belt) || !Array.isArray(belt.outs) || belt.outs.length === 0 || belt.outs.length > 4) return false;
    if (!belt.outs.every(isDir) || new Set(belt.outs).size !== belt.outs.length) return false;
    if (belt.rr !== undefined && !isCount(belt.rr)) return false;
    if (belt.lastFrom !== undefined && belt.lastFrom !== null && !isDir(belt.lastFrom)) return false;
    if (belt.item !== undefined && belt.item !== null) {
      const it = belt.item;
      if (!isObj(it) || !isItem(it.type) || !isNum(it.progress) || it.progress < 0 || it.progress > 1) return false;
      if (!isDir(it.from)) return false;
    }
  }

  if (!isObj(s.storage)) return false;
  if (!Object.entries(s.storage).every(([t, n]) => isItem(t) && isCount(n))) return false;
  return true;
}
