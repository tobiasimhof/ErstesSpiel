// Laden-Level (v0.9.0): was freigeschaltet ist, was hergestellt wurde und
// wann man aufsteigen kann. Kennt keine Grafik.
//
// - Gebäude und Rohstoffe haben in ihrer Datentabelle ein Level.
// - Waren gehören zum Level des Gebäudes, das sie herstellt.
// - Das Spiel zählt alles, was hergestellt wird (state.produced). Darauf
//   bauen die Ziele für den Aufstieg auf – und später die Aufgaben.

import { BUILDINGS, BUILD_MENU } from './data/buildings.js';
import { ITEMS } from './data/items.js';
import { LEVELS, MAX_LEVEL } from './data/levels.js';
import { RECIPES } from './data/recipes.js';
import { addAllToStorage } from './shop.js';

export { LEVELS, MAX_LEVEL };

export function buildingLevel(type) {
  return BUILDINGS[type]?.level ?? 1;
}

export function isBuildingUnlocked(state, type) {
  return buildingLevel(type) <= state.shopLevel;
}

// Level einer Ware: Rohstoffe aus der Tabelle, alles andere nach dem
// (niedrigsten) Gebäude, das sie herstellt.
export function itemLevel(type) {
  const def = ITEMS[type];
  if (!def) return Infinity;
  if (def.raw) return def.level ?? 1;
  let level = Infinity;
  for (const b of Object.values(BUILDINGS)) {
    const p = b.production;
    const makes =
      (p?.kind === 'source' && p.output === type) ||
      (p?.kind === 'workshop' && p.recipes.some((key) => RECIPES[key]?.output === type));
    if (makes) level = Math.min(level, b.level ?? 1);
  }
  return level;
}

export function isItemUnlocked(state, type) {
  return itemLevel(type) <= state.shopLevel;
}

// Was ein Level neu freischaltet: { buildings: [...], raws: [...] }
export function unlocksOf(level) {
  return {
    buildings: BUILD_MENU.filter((type) => buildingLevel(type) === level),
    raws: Object.keys(ITEMS).filter((type) => ITEMS[type].raw && itemLevel(type) === level),
  };
}

// ---------- Hergestellte Waren ----------

export function producedCount(state, type) {
  return state.produced?.[type] ?? 0;
}

export function countProduced(state, type, n = 1) {
  if (!state.produced) state.produced = {};
  state.produced[type] = producedCount(state, type) + n;
}

// ---------- Aufsteigen ----------

// Ziel für das nächste Level: [{ type, need, have, done }] oder null (höchstes Level).
export function nextLevelGoal(state) {
  const next = LEVELS[state.shopLevel + 1];
  if (!next) return null;
  return Object.entries(next.goal ?? {}).map(([type, need]) => {
    const have = Math.min(need, producedCount(state, type));
    return { type, need, have, done: have >= need };
  });
}

export function canLevelUp(state) {
  const goal = nextLevelGoal(state);
  return Boolean(goal) && goal.every((g) => g.done);
}

// Steigt auf, legt das Geschenk ins Laden-Lager. Ergebnis: { level, gift } oder null.
export function levelUp(state) {
  if (!canLevelUp(state)) return null;
  state.shopLevel++;
  const gift = { ...(LEVELS[state.shopLevel].gift ?? {}) };
  addAllToStorage(state, gift);
  return { level: state.shopLevel, gift };
}
