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
import { fitWorldToLevel } from './land.js';
import { createQuestState, levelXp, xpNeeded } from './quests.js';
import { addAllToStorage } from './shop.js';

export { LEVELS, MAX_LEVEL };

export function buildingLevel(type) {
  return BUILDINGS[type]?.level ?? 1;
}

export function isBuildingUnlocked(state, type) {
  return buildingLevel(type) <= state.shopLevel;
}

// v0.27.0: Ein Rezept kann später kommen als seine Maschine (Wundverband in
// der Kräuterstube erst ab Level 10) – dann steht level im Rezept.
export function recipeLevel(key) {
  const recipe = RECIPES[key];
  if (!recipe) return Infinity;
  return Math.max(buildingLevel(recipe.building), recipe.level ?? 1);
}

export function isRecipeUnlocked(state, key) {
  return recipeLevel(key) <= state.shopLevel;
}

// Level einer Ware: Rohstoffe aus der Tabelle, alles andere nach dem
// (niedrigsten) Gebäude, das sie herstellt (seit v0.27.0: nach dem Rezept).
export function itemLevel(type) {
  const def = ITEMS[type];
  if (!def) return Infinity;
  if (def.raw) return def.level ?? 1;
  let level = Infinity;
  for (const b of Object.values(BUILDINGS)) {
    const p = b.production;
    if (p?.kind === 'source') {
      // v0.27.0: Die Erntebank macht Schafgarbenblüten erst, wenn es die Schafgarbe gibt.
      for (const [input, output] of Object.entries(p.inputs ?? { [p.input]: p.output })) {
        if (output === type) level = Math.min(level, Math.max(b.level ?? 1, ITEMS[input]?.level ?? 1));
      }
    }
    if (p?.kind === 'workshop') {
      for (const key of p.recipes) if (RECIPES[key]?.output === type) level = Math.min(level, recipeLevel(key));
    }
  }
  return level;
}

export function isItemUnlocked(state, type) {
  return itemLevel(type) <= state.shopLevel;
}

// Was ein Level neu freischaltet: { buildings: [...], raws: [...], recipes: [...] }
// raws: was es neu beim Händler gibt (v0.16.0: nicht die Flachspflanze – die
// wächst im Beet). recipes (v0.27.0): neue Einstellungen älterer Maschinen.
export function unlocksOf(level) {
  return {
    buildings: BUILD_MENU.filter((type) => buildingLevel(type) === level),
    raws: Object.keys(ITEMS).filter((type) => ITEMS[type].raw && ITEMS[type].buyPrice > 0 && itemLevel(type) === level),
    recipes: Object.keys(RECIPES).filter((key) => recipeLevel(key) === level && buildingLevel(RECIPES[key].building) < level),
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

// Steigt auf (kostet Gold) und legt das Geschenk ins Laden-Lager. Die
// Aufträge des neuen Levels beginnen von vorn. Seit v0.24.0 bringt ein
// Aufstieg keine Theken mehr – die kauft man mit Gold. Seit v0.27.0 rückt
// der Rand der Welt nach außen, wenn das Level mehr Fläche bringt (Level 10).
// Ergebnis: { level, gift, cost, moreLand } oder null.
export function levelUp(state) {
  if (!canLevelUp(state)) return null;
  const cost = nextLevelCost(state);
  const rest = Math.max(0, levelXp(state) - xpNeeded(state.shopLevel));
  state.gold -= cost;
  state.shopLevel++;
  state.quest = { ...createQuestState(), xp: rest };
  const gift = { ...(LEVELS[state.shopLevel].gift ?? {}) };
  addAllToStorage(state, gift);
  const moreLand = fitWorldToLevel(state);
  return { level: state.shopLevel, gift, cost, moreLand };
}
