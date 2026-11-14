// v0.26.0: Level 9 „Die Schreibstube“ (Tobias, Chat 19) – die Werkzeuge
// wachsen weiter, während das Kräuter-Kapitel läuft: Kohlenmeiler (Holzstamm →
// Holzkohle), Schreibstube mit Zeichenbrett und Reißzeug, eigener Reiter
// „Werkstatt“ in der Bauleiste.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { buyBuilding, placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS, BUILD_TABS, TAB_COLORS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { isBuildingUnlocked, itemLevel, levelUp, unlocksOf } from '../src/core/levels.js';
import { applyTestPack, refillInput, refillPlan, refillSource } from '../src/core/market.js';
import { buildingStatus, loadInput, setRecipe, sourceCount } from '../src/core/production.js';
import { levelQuests, questReward, xpNeeded } from '../src/core/quests.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function level9() {
  const state = createNewGame(9);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = 9;
  state.gold = 0;
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

const worth = (items) => Object.entries(items).reduce((sum, [t, n]) => sum + ITEMS[t].price * n, 0);

// ---------- Datentabellen ----------

test('Level 9 gibt es (seit v0.27.0 ist Level 10 das höchste)', () => {
  assert.equal(MAX_LEVEL, 10);
});

test('Kohlenmeiler: wie das Holzfällerlager – 1 Holzstamm → 100 Holzkohle in 15 Minuten, Vorrat 3', () => {
  const def = BUILDINGS.kohlenmeiler;
  assert.deepEqual([def.level, def.size, def.color], [9, [2, 2], TAB_COLORS.holz]);
  assert.deepEqual(def.production, { kind: 'source', input: 'holzstamm', output: 'holzkohle', amount: 100, duration: 900, capacity: 3 });
  assert.equal(def.ports.filter((p) => p.kind === 'out').length, 1);
});

test('Schreibstube: 2 × 2, zwei Eingänge (Tobias: es bleibt bei 2), Zeichenbrett und Reißzeug', () => {
  const def = BUILDINGS.schreibstube;
  assert.deepEqual([def.level, def.size, def.color], [9, [2, 2], TAB_COLORS.werkstatt]);
  assert.equal(def.ports.filter((p) => p.kind === 'in').length, 2);
  assert.deepEqual(def.production.recipes, ['zeichenbrett', 'reisszeug']);
  assert.deepEqual(RECIPES.zeichenbrett.inputs, { verstaerkteholzplatte: 1, flachsfaser: 10 });
  assert.deepEqual(RECIPES.reisszeug.inputs, { zirkel: 1, holzkohle: 10 });
  assert.deepEqual([RECIPES.zeichenbrett.time, RECIPES.reisszeug.time], [20, 30]);
});

test('Jede Maschine hat höchstens 2 Eingänge (Tobias, Chat 19)', () => {
  for (const [type, def] of Object.entries(BUILDINGS)) {
    assert.ok(def.ports.filter((p) => p.kind === 'in').length <= 2, type);
  }
  for (const [key, recipe] of Object.entries(RECIPES)) {
    assert.ok(Object.keys(recipe.inputs).length <= 2, `${key}: höchstens 2 Zutaten`);
  }
});

test('Preise: Holzkohle wie Holzblöcke (1 Holzstamm → 200 Gold), jede Stufe rund 20 % mehr', () => {
  assert.equal(BUILDINGS.kohlenmeiler.production.amount * ITEMS.holzkohle.price, 200);
  assert.equal(ITEMS.zeichenbrett.price, Math.round(worth(RECIPES.zeichenbrett.inputs) * 1.2));
  assert.equal(ITEMS.reisszeug.price, Math.round(worth(RECIPES.reisszeug.inputs) * 1.2));
  assert.deepEqual([ITEMS.holzkohle.price, ITEMS.zeichenbrett.price, ITEMS.reisszeug.price], [2, 355, 818]);
});

test('Die neuen Stufen verarbeiten Werkzeug-Waren weiter, die bisher Endprodukte waren', () => {
  const used = new Set(Object.values(RECIPES).flatMap((r) => Object.keys(r.inputs)));
  assert.ok(used.has('zirkel'), 'Zirkel → Reißzeug');
  assert.ok(used.has('verstaerkteholzplatte'), 'Verstärkte Holzplatte → Zeichenbrett');
  assert.ok(used.has('holzkohle'));
});

test('Bauleiste: Kohlenmeiler im Reiter „Holz“, Schreibstube im neuen Reiter „Werkstatt“', () => {
  const tab = (id) => BUILD_TABS.find((t) => t.id === id);
  assert.deepEqual(tab('holz').buildings, ['holzfaeller', 'saegewerk', 'zimmerei', 'kohlenmeiler']);
  assert.deepEqual(
    BUILD_TABS.map((t) => t.name),
    ['Holz', 'Stein', 'Eisen', 'Erde', 'Werkstatt'],
  );
  assert.deepEqual(tab('werkstatt').buildings, ['schreibstube']);
  assert.equal(tab('werkstatt').item, 'reisszeug');
});

test('Baukosten: nur Werkzeug-Waren, höchstens ein Eisenerz als Teile (960 Gold)', () => {
  for (const type of ['kohlenmeiler', 'schreibstube']) {
    const cost = BUILDINGS[type].cost;
    assert.ok(worth(cost) <= 960, `${type}: ${worth(cost)} Gold`);
    for (const item of Object.keys(cost)) assert.ok(itemLevel(item) <= 6, `${type} kostet ${item} (Werkzeug-Ware)`);
  }
});

// ---------- Level 9 ----------

test('Level 9 „Die Schreibstube“: Kohlenmeiler und Schreibstube, Aufstieg 1.670 Gold, 1 Holzstamm gratis', () => {
  assert.deepEqual(unlocksOf(9), { buildings: ['kohlenmeiler', 'schreibstube'], raws: [], recipes: [] });
  assert.equal(LEVELS[9].name, 'Die Schreibstube');
  const state = createNewGame(9);
  state.shopLevel = 8;
  state.quest.xp = xpNeeded(8);
  state.gold = 1670;
  assert.equal(isBuildingUnlocked(state, 'schreibstube'), false);
  const up = levelUp(state);
  assert.deepEqual([up.level, up.gift, up.cost], [9, { holzstamm: 1 }, 1670]);
  assert.equal(state.gold, 0);
  assert.equal(storageCount(state, 'holzstamm'), 2, 'Startvorrat + Geschenk');
  assert.ok(isBuildingUnlocked(state, 'kohlenmeiler') && isBuildingUnlocked(state, 'schreibstube'));
  assert.deepEqual([itemLevel('holzkohle'), itemLevel('zeichenbrett'), itemLevel('reisszeug')], [9, 9, 9]);
});

test('Aufträge auf Level 9: 4 Stück, Waren aus Werkzeug- und Kräuter-Kapitel, zusammen 1.657 Erfahrung', () => {
  const quests = levelQuests(9);
  assert.equal(quests.length, 4);
  const asked = new Set(quests.flatMap((q) => Object.keys(q.items)));
  for (const type of ['holzkohle', 'zeichenbrett', 'reisszeug']) assert.ok(asked.has(type), `${type} wird verlangt`);
  assert.ok([...asked].some((type) => itemLevel(type) >= 7 && itemLevel(type) <= 8), 'auch eine Kräuter-Ware');
  assert.equal(xpNeeded(9), 1657);
  assert.equal(
    quests.reduce((sum, q) => sum + questReward(q).gold, 0),
    5521,
    'Gold so viel, wie die Waren an der Theke bringen',
  );
});

// ---------- Kohlenmeiler ----------

test('Kohlenmeiler: 1 Holzstamm → 100 Holzkohle in 15 Minuten, ins Laden-Lager', () => {
  const state = level9();
  state.storage.holzstamm = 1;
  const meiler = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  placeBuilding(state, 'versandportal', 12, 6, 0);
  assert.ok(loadInput(state, meiler, 'holzstamm'));
  assert.equal(buildingStatus(state, meiler).text, 'Arbeitet: noch 100 von 100.');
  simulate(state, 900 + 5);
  assert.equal(storageCount(state, 'holzkohle'), 100);
  assert.equal(sourceCount(meiler), 0);
});

test('Kohlenmeiler auffüllen: Holzstämme aus dem Laden-Lager, den Rest beim Händler', () => {
  const state = level9();
  state.storage.holzstamm = 1;
  state.gold = 500;
  const meiler = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  assert.equal(refillInput(state, meiler), 'holzstamm');
  const plan = refillPlan(state, meiler);
  assert.deepEqual([plan.fromStorage, plan.buy, plan.cost], [1, 2, 2 * ITEMS.holzstamm.buyPrice]);
  refillSource(state, meiler);
  assert.equal(sourceCount(meiler), 3);
  assert.equal(state.gold, 500 - 2 * ITEMS.holzstamm.buyPrice);
});

test('Unter Level 9 lässt sich der Kohlenmeiler nicht bauen', () => {
  const state = level9();
  state.shopLevel = 8;
  state.storage = { steinplatte: 20, verstaerkteholzplatte: 2 };
  assert.equal(buyBuilding(state, 'kohlenmeiler', 10, 6), 'locked');
  state.shopLevel = 9;
  assert.ok(buyBuilding(state, 'kohlenmeiler', 10, 6)?.id, 'ab Level 9 gebaut');
  assert.deepEqual(state.storage, {}, 'Baukosten bezahlt');
});

// ---------- Schreibstube ----------

test('Kette: Holzstamm → Kohlenmeiler → Band → Schreibstube (mit Zirkeln) → 10 Reißzeuge im Laden-Lager', () => {
  const state = level9();
  state.storage.holzstamm = 1;
  const meiler = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  drag(state, [
    [12, 6],
    [15, 6],
  ]);
  const stube = placeBuilding(state, 'schreibstube', 16, 6, 0);
  drag(state, [
    [18, 6],
    [20, 6],
  ]);
  placeBuilding(state, 'versandportal', 21, 6, 0);
  assert.ok(setRecipe(stube, 'reisszeug'));
  stube.prod.stock = { zirkel: 10 }; // die Zirkel kämen sonst über den zweiten Eingang
  assert.ok(loadInput(state, meiler, 'holzstamm'));
  simulate(state, 900 + 60);
  assert.equal(storageCount(state, 'reisszeug'), 10);
  assert.equal(storageCount(state, 'reisszeug') * ITEMS.reisszeug.price, 8180);
});

test('Schreibstube: Zeichenbrett aus 1 Verstärkten Holzplatte + 10 Flachsfasern', () => {
  const state = level9();
  const stube = placeBuilding(state, 'schreibstube', 16, 6, 0);
  assert.equal(stube.prod.recipe, 'zeichenbrett');
  stube.prod.stock = { verstaerkteholzplatte: 1, flachsfaser: 10 };
  simulate(state, 21);
  assert.deepEqual(stube.prod.out, { type: 'zeichenbrett', count: 1 });
  assert.deepEqual(stube.prod.stock, { verstaerkteholzplatte: 0, flachsfaser: 0 });
});

// ---------- Testpaket und Spielstand ----------

test('Testpaket auf Level 9: Holzkohle, Zeichenbrett und Reißzeug je 5', () => {
  const state = level9();
  applyTestPack(state);
  assert.equal(storageCount(state, 'holzkohle'), 5, 'Holzkohle zählt wie alles ab Level 4 als Kombi-Stufe');
  assert.equal(storageCount(state, 'zeichenbrett'), 5);
  assert.equal(storageCount(state, 'reisszeug'), 5);
});

test('Spielstand: Kohlenmeiler und Schreibstube auf Level 9 bleiben nach Speichern und Laden erhalten', () => {
  const state = level9();
  state.storage.holzstamm = 2;
  const meiler = placeBuilding(state, 'kohlenmeiler', 10, 6, 0);
  loadInput(state, meiler, 'holzstamm');
  loadInput(state, meiler, 'holzstamm');
  const stube = placeBuilding(state, 'schreibstube', 16, 6, 0);
  setRecipe(stube, 'reisszeug');
  stube.prod.stock = { zirkel: 1, holzkohle: 4 };
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.equal(loaded.state.shopLevel, 9);
  const m = loaded.state.buildings.find((b) => b.type === 'kohlenmeiler');
  const s = loaded.state.buildings.find((b) => b.type === 'schreibstube');
  assert.equal(sourceCount(m), 2);
  assert.equal(s.prod.recipe, 'reisszeug');
  assert.deepEqual(s.prod.stock, { zirkel: 1, holzkohle: 4 });
});
