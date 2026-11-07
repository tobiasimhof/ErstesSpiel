// Laden-Level (v0.9.0): was freigeschaltet ist, was hergestellt wurde und
// wann man aufsteigen kann. Kennt keine Grafik.
//
// - Gebäude und Rohstoffe haben in ihrer Datentabelle ein Level.
// - Waren gehören zum Level des Gebäudes, das sie herstellt.
// - Das Spiel zählt alles, was hergestellt wird (state.produced).
// - v0.13.0 (Tobias): Aufsteigen braucht Erfahrung aus den Aufträgen der
//   Bewohner (quests.js) und kostet Gold. Die alten Ziele („1 Holzplatte und
//   1 Holzstab hergestellt“) gibt es nicht mehr.

import { BUILDINGS, BUILD_MENU } from './data/buildings.js';
import { ITEMS } from './data/items.js';
import { LEVELS, MAX_LEVEL } from './data/levels.js';
import { RECIPES } from './data/recipes.js';
import { createQuestState, levelXp, xpNeeded } from './quests.js';
import { addAllToStorage, addMissingCounters } from './shop.js';

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

// Preis des Aufstiegs auf das nächste Level (null: höchstes Level).
export function nextLevelCost(state) {
  const next = LEVELS[state.shopLevel + 1];
  return next ? (next.cost ?? 0) : null;
}

// Erfahrung genug für das nächste Level?
export function hasEnoughXp(state) {
  return Boolean(LEVELS[state.shopLevel + 1]) && levelXp(state) >= xpNeeded(state.shopLevel);
}

// Was fehlt noch zum Aufstieg? 'max' (es gibt kein höheres Level), 'xp',
// 'gold' oder null (es geht).
export function levelUpBlocker(state) {
  if (!LEVELS[state.shopLevel + 1]) return 'max';
  if (!hasEnoughXp(state)) return 'xp';
  if (state.gold < nextLevelCost(state)) return 'gold';
  return null;
}

export function canLevelUp(state) {
  return levelUpBlocker(state) === null;
}

// Steigt auf (kostet Gold), legt das Geschenk ins Laden-Lager und stellt neue
// Theken auf (v0.10.0). Die Aufträge des neuen Levels beginnen von vorn.
// Ergebnis: { level, gift, counters, cost } oder null.
// counters: Anzahl neuer Verkaufstheken.
export function levelUp(state) {
  if (!canLevelUp(state)) return null;
  const cost = nextLevelCost(state);
  const rest = Math.max(0, levelXp(state) - xpNeeded(state.shopLevel));
  state.gold -= cost;
  state.shopLevel++;
  state.quest = { ...createQuestState(), xp: rest };
  const gift = { ...(LEVELS[state.shopLevel].gift ?? {}) };
  addAllToStorage(state, gift);
  const counters = addMissingCounters(state);
  return { level: state.shopLevel, gift, counters, cost };
}
