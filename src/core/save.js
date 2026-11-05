// Spielstand in Text umwandeln und zurück, mit Prüfung auf Beschädigung.
// Steigt SAVE_VERSION, muss hier eine Umwandlung alter Spielstände ergänzt
// werden (sonst startet ein neues Spiel).

import { BUILDINGS } from './data/buildings.js';
import { isDir, sortDirs } from './dirs.js';
import { parseTileKey } from './state.js';

export const SAVE_VERSION = 1;

export function serializeGame(state, now = Date.now()) {
  return JSON.stringify({ saveVersion: SAVE_VERSION, savedAt: now, state });
}

// Gibt { state, savedAt } zurück oder null, wenn der Text kein gültiger
// Spielstand ist.
export function deserializeGame(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || data.saveVersion !== SAVE_VERSION || !isValidState(data.state)) return null;
  const state = data.state;
  for (const belt of Object.values(state.belts)) belt.outs = sortDirs(belt.outs);
  return { state, savedAt: Number(data.savedAt) || 0 };
}

const isInt = (n) => Number.isInteger(n);

export function isValidState(s) {
  if (!s || typeof s !== 'object') return false;
  if (typeof s.gold !== 'number' || !Number.isFinite(s.gold)) return false;
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
    ids.add(b.id);
  }

  if (!s.belts || typeof s.belts !== 'object' || Array.isArray(s.belts)) return false;
  for (const [key, belt] of Object.entries(s.belts)) {
    const { x, y } = parseTileKey(key);
    if (!isInt(x) || !isInt(y) || key !== `${x},${y}`) return false;
    if (!belt || !Array.isArray(belt.outs) || belt.outs.length === 0 || belt.outs.length > 4) return false;
    if (!belt.outs.every(isDir) || new Set(belt.outs).size !== belt.outs.length) return false;
  }
  return true;
}
