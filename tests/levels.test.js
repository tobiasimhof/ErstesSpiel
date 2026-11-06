import { test } from 'node:test';
import assert from 'node:assert/strict';

import { BUILDINGS, BUILD_MENU } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { SHOP_LEVELS } from '../src/core/data/shop.js';
import { buyBuilding, placeBuilding } from '../src/core/buildings.js';
import {
  canLevelUp,
  isBuildingUnlocked,
  itemLevel,
  levelUp,
  nextLevelGoal,
  producedCount,
  unlocksOf,
} from '../src/core/levels.js';
import { buyRaw } from '../src/core/market.js';
import { loadInput, setRecipe } from '../src/core/production.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { simulate } from '../src/core/sim.js';
import { storageCount } from '../src/core/shop.js';
import { createNewGame } from '../src/core/state.js';

// ---------- Datentabellen ----------

test('Level-Tabelle: Level 1 bis MAX_LEVEL, jedes ab Level 2 mit Ziel und Gratis-Rohstoff', () => {
  assert.equal(MAX_LEVEL, 3);
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const def = LEVELS[level];
    assert.ok(def?.name, `Level ${level} hat einen Namen`);
    assert.ok(SHOP_LEVELS[level], `Laden-Daten für Level ${level}`);
    if (level === 1) continue;
    assert.ok(Object.keys(def.goal ?? {}).length > 0, `Level ${level} hat ein Ziel`);
    for (const [type, n] of Object.entries(def.goal)) {
      assert.ok(ITEMS[type], `Ziel-Ware ${type} gibt es`);
      assert.ok(n > 0);
      assert.ok(itemLevel(type) < level, `${type} lässt sich vor Level ${level} herstellen`);
    }
    // Zu Beginn jedes Levels genau ein Rohstoff dieses Levels gratis (Tobias)
    assert.deepEqual(Object.values(def.gift), [1]);
    const [raw] = Object.keys(def.gift);
    assert.ok(ITEMS[raw].raw && itemLevel(raw) === level, `Geschenk ${raw} ist der Rohstoff von Level ${level}`);
  }
});

test('Jedes Gebäude und jede Ware gehört zu einem Level', () => {
  for (const type of Object.keys(BUILDINGS)) {
    const level = BUILDINGS[type].level;
    assert.ok(Number.isInteger(level) && level >= 1 && level <= MAX_LEVEL, `${type}: Level ${level}`);
  }
  for (const type of Object.keys(ITEMS)) {
    const level = itemLevel(type);
    assert.ok(level >= 1 && level <= MAX_LEVEL, `${type}: Level ${level}`);
  }
});

test('Holz ab Level 1, Stein ab Level 2, Eisen ab Level 3', () => {
  assert.deepEqual(unlocksOf(1), { buildings: ['holzfaeller', 'saegewerk', 'lagerhaus', 'versandportal'], raws: ['holzstamm'] });
  assert.deepEqual(unlocksOf(2), { buildings: ['steinbruch', 'steinmetz'], raws: ['felsbrocken'] });
  assert.deepEqual(unlocksOf(3), { buildings: ['schmelzhuette', 'schmiede'], raws: ['eisenerz'] });
  assert.equal(itemLevel('holzblock'), 1);
  assert.equal(itemLevel('holzstab'), 1);
  assert.equal(itemLevel('steinblock'), 2);
  assert.equal(itemLevel('steinzahnrad'), 2);
  assert.equal(itemLevel('eisenbarren'), 3);
  assert.equal(itemLevel('eisenstange'), 3);
  assert.equal(BUILD_MENU.filter((t) => BUILDINGS[t].level === 1).length, 4);
});

// ---------- Sperren ----------

test('Level 1: Stein- und Eisen-Gebäude lassen sich nicht bauen, auch mit genug Waren', () => {
  const state = createNewGame(1);
  state.storage = { holzplatte: 100, holzstab: 100, steinplatte: 100, steinblock: 100, eisenbarren: 100 };
  assert.equal(isBuildingUnlocked(state, 'saegewerk'), true);
  assert.equal(isBuildingUnlocked(state, 'steinbruch'), false);
  assert.equal(buyBuilding(state, 'steinbruch', 20, 12), 'locked');
  assert.equal(buyBuilding(state, 'schmiede', 20, 12), 'locked');
  assert.equal(storageCount(state, 'holzplatte'), 100, 'nichts bezahlt');
  assert.equal(state.buildings.length, 2);
  state.shopLevel = 2;
  assert.ok(typeof buyBuilding(state, 'steinbruch', 20, 12) === 'object', 'ab Level 2 baubar');
  assert.equal(buyBuilding(state, 'schmiede', 24, 12), 'locked', 'Eisen erst ab Level 3');
});

test('Händler: Felsbrocken erst ab Level 2, Eisenerz ab Level 3', () => {
  const state = createNewGame(1);
  state.gold = 10000;
  assert.equal(buyRaw(state, 'felsbrocken'), 'locked');
  assert.equal(buyRaw(state, 'eisenerz'), 'locked');
  assert.equal(state.gold, 10000, 'nichts bezahlt');
  assert.equal(buyRaw(state, 'holzstamm'), 'ok');
  state.shopLevel = 2;
  assert.equal(buyRaw(state, 'felsbrocken'), 'ok');
  assert.equal(buyRaw(state, 'eisenerz'), 'locked');
  state.shopLevel = 3;
  assert.equal(buyRaw(state, 'eisenerz'), 'ok');
});

// ---------- Hergestellte Waren zählen ----------

// Neues Spiel: Holzfäller (10,6) gibt bei (12,6) direkt ins Sägewerk (12,6),
// das gibt bei (14,6) direkt in ein Versandportal.
function woodLine(seed = 5) {
  const state = createNewGame(seed);
  const saw = placeBuilding(state, 'saegewerk', 12, 6, 0);
  placeBuilding(state, 'versandportal', 14, 6, 0);
  assert.ok(loadInput(state, state.buildings[0]));
  return { state, saw };
}

test('Hergestellte Waren werden gezählt – Blöcke und Teile', () => {
  const { state } = woodLine();
  simulate(state, 60);
  assert.ok(producedCount(state, 'holzblock') >= 12, `Blöcke: ${producedCount(state, 'holzblock')}`);
  assert.ok(producedCount(state, 'holzplatte') >= 1, `Platten: ${producedCount(state, 'holzplatte')}`);
  assert.equal(producedCount(state, 'holzstab'), 0);
  // Die Zähler werden mitgespeichert
  const loaded = deserializeGame(serializeGame(state));
  assert.deepEqual(loaded.state.produced, state.produced);
});

// ---------- Aufsteigen ----------

test('Aufstieg auf Level 2: 1 Holzplatte und 1 Holzstab herstellen, dann gibt es einen Felsbrocken', () => {
  const { state, saw } = woodLine();
  assert.equal(canLevelUp(state), false);
  assert.equal(levelUp(state), null, 'Ziel noch nicht erreicht');
  assert.deepEqual(nextLevelGoal(state), [
    { type: 'holzplatte', need: 1, have: 0, done: false },
    { type: 'holzstab', need: 1, have: 0, done: false },
  ]);

  simulate(state, 60);
  assert.equal(canLevelUp(state), false, 'nur Platten reichen nicht');
  assert.deepEqual(nextLevelGoal(state)[0], { type: 'holzplatte', need: 1, have: 1, done: true }, 'have höchstens need');

  setRecipe(saw, 'holzstab');
  simulate(state, 60);
  assert.equal(canLevelUp(state), true);
  const result = levelUp(state);
  assert.deepEqual(result, { level: 2, gift: { felsbrocken: 1 } });
  assert.equal(state.shopLevel, 2);
  assert.equal(storageCount(state, 'felsbrocken'), 1, 'Gratis-Felsbrocken im Laden-Lager');
  assert.equal(canLevelUp(state), false, 'nächstes Ziel: Stein');
  assert.deepEqual(
    nextLevelGoal(state).map((g) => g.type),
    ['steinplatte', 'steinzahnrad'],
  );
});

test('Aufstieg auf Level 3 nach Steinplatte und Stein-Zahnrad, dann gibt es ein Eisenerz; danach ist Schluss', () => {
  const state = createNewGame(2);
  state.shopLevel = 2;
  state.produced = { steinplatte: 1 };
  assert.equal(canLevelUp(state), false);
  state.produced.steinzahnrad = 3;
  assert.deepEqual(levelUp(state), { level: 3, gift: { eisenerz: 1 } });
  assert.equal(storageCount(state, 'eisenerz'), 1);
  assert.equal(nextLevelGoal(state), null, 'höchstes Level');
  assert.equal(canLevelUp(state), false);
  assert.equal(levelUp(state), null);
  assert.equal(state.shopLevel, 3);
});

test('Ein neues Spiel lässt sich von Holz bis Eisen durchspielen', () => {
  const { state, saw } = woodLine(11);
  simulate(state, 40);
  setRecipe(saw, 'holzstab');
  simulate(state, 40);
  assert.ok(levelUp(state));
  // Stein: Steinbruch und Steinmetz bauen (Waren aus dem Test), Felsbrocken einlegen
  Object.assign(state.storage, { holzplatte: 10, holzstab: 10, steinblock: 30 });
  const quarry = buyBuilding(state, 'steinbruch', 10, 12, 0);
  const mason = buyBuilding(state, 'steinmetz', 12, 12, 0);
  assert.ok(typeof quarry === 'object' && typeof mason === 'object');
  placeBuilding(state, 'versandportal', 14, 12, 0);
  assert.ok(loadInput(state, quarry), 'Gratis-Felsbrocken eingelegt');
  simulate(state, 40);
  setRecipe(mason, 'steinzahnrad');
  simulate(state, 40);
  assert.deepEqual(levelUp(state), { level: 3, gift: { eisenerz: 1 } });
  Object.assign(state.storage, { steinplatte: 30, holzplatte: 10, eisenbarren: 30 });
  assert.equal(typeof buyBuilding(state, 'schmelzhuette', 18, 12, 0), 'object');
  assert.equal(typeof buyBuilding(state, 'schmiede', 20, 12, 0), 'object');
});
