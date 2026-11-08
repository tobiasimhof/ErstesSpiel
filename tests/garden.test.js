// v0.16.0: Kräuter-Kapitel, Level 7 „Die Heilstube“ – Beet (säen, wachsen,
// ernten), Flachsbreche (1 Pflanze → 50 Fasern), Webstube (5 Fasern → 1 Verband).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding, removeBuilding } from '../src/core/buildings.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { isItemUnlocked, levelUp, unlocksOf } from '../src/core/levels.js';
import {
  applyTestPack,
  buyRaw,
  defaultSeed,
  isBroke,
  isBuyable,
  isSellable,
  refillPlan,
  refillSource,
  sowPlan,
  sowSeed,
} from '../src/core/market.js';
import { catchUp } from '../src/core/offline.js';
import {
  buildingContents,
  buildingProgress,
  buildingStatus,
  growth,
  growthLeft,
  harvest,
  isRipe,
  loadInput,
  losesWorkOnRemove,
  sourceCount,
} from '../src/core/production.js';
import { xpNeeded } from '../src/core/quests.js';
import { SAVE_VERSION, deserializeGame, isValidState, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';
import { canStoreItem } from '../src/core/warehouse.js';

const GROW = 1800; // 30 Minuten (Tobias)

function level7() {
  const state = createNewGame(7);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = 7;
  state.gold = 0;
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

const clone = (state) => deserializeGame(serializeGame(state)).state;

// ---------- Datentabellen ----------

test('Datentabellen: Beet 2 × 2 ohne Band, 1 Leinsamen → 1 Flachspflanze in 30 Minuten', () => {
  const beet = BUILDINGS.beet;
  assert.deepEqual([beet.level, beet.size, beet.ports], [7, [2, 2], []]);
  assert.deepEqual(beet.production, { kind: 'garden', crops: { leinsamen: { plant: 'flachspflanze', time: GROW } } });
  assert.deepEqual(BUILDINGS.flachsbreche.production, {
    kind: 'source',
    input: 'flachspflanze',
    output: 'flachsfaser',
    amount: 50,
    duration: 600,
    capacity: 3,
  });
  assert.deepEqual(BUILDINGS.webstube.production.recipes, ['verband']);
  assert.deepEqual(RECIPES.verband.inputs, { flachsfaser: 5 });
  assert.equal(RECIPES.verband.time, 10);
  for (const type of ['beet', 'flachsbreche', 'webstube']) assert.deepEqual(BUILDINGS[type].size, [2, 2], type);
});

test('Preise (Tobias): Samen 1.000, aus einem Samen 1.500 Gold – jede Stufe bringt mehr', () => {
  const seed = ITEMS.leinsamen.buyPrice;
  const fibers = 50 * ITEMS.flachsfaser.price;
  const bandages = 10 * ITEMS.verband.price;
  assert.deepEqual([seed, fibers, bandages], [1000, 1250, 1500]);
  assert.ok(seed < fibers && fibers < bandages);
});

test('Baukosten aus Waren von Level 1–6, keins teurer, als ein Samen einbringt', () => {
  const worth = (cost) => Object.entries(cost).reduce((sum, [t, n]) => sum + ITEMS[t].price * n, 0);
  assert.equal(worth(BUILDINGS.beet.cost), 360);
  assert.equal(worth(BUILDINGS.flachsbreche.cost), 828);
  assert.equal(worth(BUILDINGS.webstube.cost), 1008);
  for (const type of ['beet', 'flachsbreche', 'webstube']) {
    assert.ok(worth(BUILDINGS[type].cost) <= 1500, type);
    for (const item of Object.keys(BUILDINGS[type].cost)) {
      assert.ok(ITEMS[item].price > 0 && ITEMS[item].price < 1000, `${type}: ${item} aus dem Werkzeug-Kapitel`);
    }
  }
});

test('Die Flachspflanze ist ein Rohstoff zum Einlegen: nicht kaufen, nicht verkaufen, nicht ins Lagerhaus', () => {
  const state = level7();
  state.gold = 5000;
  assert.equal(isBuyable('flachspflanze'), false);
  assert.equal(isBuyable('leinsamen'), true);
  assert.equal(buyRaw(state, 'flachspflanze'), 'invalid');
  assert.equal(isSellable('flachspflanze'), false);
  assert.equal(isSellable('leinsamen'), false);
  assert.equal(canStoreItem('flachspflanze'), false);
  assert.equal(isSellable('flachsfaser'), true);
  assert.equal(isSellable('verband'), true);
});

// ---------- Level 7 ----------

test('Level 7 „Die Heilstube“: Beet, Flachsbreche, Webstube, Leinsamen beim Händler; Aufstieg 3.000 Gold', () => {
  assert.deepEqual(unlocksOf(7), { buildings: ['beet', 'flachsbreche', 'webstube'], raws: ['leinsamen'] });
  const state = createNewGame(7);
  state.shopLevel = 6;
  assert.equal(isItemUnlocked(state, 'leinsamen'), false);
  state.gold = 2999;
  state.quest.xp = xpNeeded(6);
  assert.equal(levelUp(state), null, 'zu wenig Gold');
  state.gold = 3000;
  const up = levelUp(state);
  assert.deepEqual([up.level, up.gift, up.cost], [7, { leinsamen: 1 }, 3000]);
  assert.equal(state.gold, 0);
  assert.equal(storageCount(state, 'leinsamen'), 1);
  assert.equal(isItemUnlocked(state, 'leinsamen'), true);
  assert.equal(LEVELS[7].name, 'Die Heilstube');
  assert.equal(xpNeeded(7), 850);
});

// ---------- Beet ----------

test('Säen aus dem Laden-Lager; die Pflanze ist nach genau 30 Minuten reif und wartet dann', () => {
  const state = level7();
  state.storage.leinsamen = 2;
  const beet = placeBuilding(state, 'beet', 10, 6, 0);
  assert.equal(buildingStatus(state, beet).text, 'Leer – Samen säen.');
  assert.equal(defaultSeed(state, beet), 'leinsamen');
  const plan = sowSeed(state, beet);
  assert.deepEqual([plan.result, plan.fromStorage, plan.buy], ['ok', true, false]);
  assert.equal(storageCount(state, 'leinsamen'), 1);
  assert.equal(sowPlan(state, beet).result, 'busy', 'es wächst schon etwas');
  assert.equal(buildingStatus(state, beet).level, 'work');
  simulate(state, GROW - 10);
  assert.equal(isRipe(beet), false);
  assert.ok(growthLeft(beet) > 9 && growthLeft(beet) <= 10.1, `noch ${growthLeft(beet)} s`);
  assert.ok(buildingProgress(beet) > 0.99 && buildingProgress(beet) < 1);
  assert.equal(harvest(state, beet), 'unripe');
  simulate(state, 10.5);
  assert.equal(isRipe(beet), true);
  assert.equal(growth(beet), 1);
  assert.equal(buildingStatus(state, beet).text, 'Reif – Flachspflanze ernten.');
  simulate(state, 600);
  assert.equal(beet.prod.timer, GROW, 'die reife Pflanze wartet');
});

test('Ernten und Säen sind zwei Schritte (Tobias): Ernten legt die Pflanze ins Laden-Lager, das Beet ist danach leer', () => {
  const state = level7();
  state.storage.leinsamen = 1;
  const beet = placeBuilding(state, 'beet', 10, 6, 0);
  sowSeed(state, beet);
  simulate(state, GROW + 1);
  assert.equal(harvest(state, beet), 'ok');
  assert.equal(storageCount(state, 'flachspflanze'), 1);
  assert.equal(state.produced.flachspflanze, 1);
  assert.deepEqual([beet.prod.crop, beet.prod.timer], [null, 0]);
  assert.equal(harvest(state, beet), 'invalid', 'nichts mehr zu ernten');
  simulate(state, GROW);
  assert.equal(beet.prod.crop, null, 'nichts wächst von allein nach');
});

test('Säen ohne Samen im Laden-Lager kauft einen (1.000 Gold); ohne Gold oder unter Level 7 geht es nicht', () => {
  const state = level7();
  const beet = placeBuilding(state, 'beet', 10, 6, 0);
  state.gold = 999;
  assert.deepEqual([sowPlan(state, beet).result, sowPlan(state, beet).cost], ['gold', 1000]);
  assert.equal(sowSeed(state, beet).result, 'gold');
  assert.equal(beet.prod.crop, null);
  state.gold = 1500;
  const plan = sowSeed(state, beet);
  assert.deepEqual([plan.result, plan.buy, plan.cost], ['ok', true, 1000]);
  assert.equal(state.gold, 500);
  assert.equal(beet.prod.crop, 'leinsamen');
  assert.equal(storageCount(state, 'leinsamen'), 0, 'direkt gesät, nicht im Laden-Lager');

  const low = level7();
  low.shopLevel = 6;
  low.gold = 5000;
  const beet6 = placeBuilding(low, 'beet', 10, 6, 0);
  assert.equal(sowPlan(low, beet6, 'leinsamen').result, 'locked');
});

test('Ernten bei vollem Laden-Lager geht nicht – die Pflanze bleibt reif im Beet', () => {
  const state = level7();
  const beet = placeBuilding(state, 'beet', 10, 6, 0);
  state.gold = 1000;
  sowSeed(state, beet);
  simulate(state, GROW);
  state.storage.holzblock = 1000;
  assert.equal(harvest(state, beet), 'full');
  assert.equal(isRipe(beet), true);
});

test('Abreißen: gerade gesäter Samen und reife Pflanze kommen zurück, eine halb gewachsene geht verloren', () => {
  const state = level7();
  state.storage.leinsamen = 3;
  const fresh = placeBuilding(state, 'beet', 10, 6, 0);
  sowSeed(state, fresh);
  assert.deepEqual(buildingContents(fresh), { leinsamen: 1 });
  assert.equal(losesWorkOnRemove(fresh), false);
  simulate(state, 60);
  assert.deepEqual(buildingContents(fresh), {});
  assert.equal(losesWorkOnRemove(fresh), true);
  simulate(state, GROW);
  assert.deepEqual(buildingContents(fresh), { flachspflanze: 1 });
  assert.equal(losesWorkOnRemove(fresh), false);
  removeBuilding(state, fresh.id);
  assert.equal(storageCount(state, 'flachspflanze'), 1);
});

// ---------- Flachsbreche und Webstube ----------

test('Flachsbreche: Pflanze einlegen wie einen Holzstamm, 1 Pflanze → 50 Fasern in 10 Minuten, Vorrat 3', () => {
  const state = level7();
  state.storage.flachspflanze = 4;
  const breche = placeBuilding(state, 'flachsbreche', 10, 6, 0);
  // Auffüllen nur aus dem Laden-Lager – Flachspflanzen gibt es nicht beim Händler
  state.gold = 100000;
  const plan = refillPlan(state, breche);
  assert.deepEqual([plan.fromStorage, plan.buy, plan.cost], [3, 0, 0]);
  refillSource(state, breche);
  assert.equal(sourceCount(breche), 3);
  assert.equal(storageCount(state, 'flachspflanze'), 1);
  assert.equal(loadInput(state, breche), false, 'Vorrat voll');
  assert.equal(state.gold, 100000);
  const noPlants = level7();
  noPlants.gold = 100000;
  const empty = placeBuilding(noPlants, 'flachsbreche', 10, 6, 0);
  assert.deepEqual([refillPlan(noPlants, empty).fromStorage, refillPlan(noPlants, empty).buy], [0, 0]);
});

test('Ganze Kette: 1 Flachspflanze → 50 Fasern → 10 Verbände im Laden-Lager (1.500 Gold)', () => {
  const state = level7();
  state.storage.flachspflanze = 1;
  const breche = placeBuilding(state, 'flachsbreche', 10, 6, 0);
  drag(state, [
    [12, 6],
    [15, 6],
  ]);
  placeBuilding(state, 'webstube', 16, 6, 0);
  drag(state, [
    [18, 6],
    [20, 6],
  ]);
  placeBuilding(state, 'versandportal', 21, 6, 0);
  assert.ok(loadInput(state, breche));
  simulate(state, 600 + 60);
  assert.equal(sourceCount(breche), 0);
  assert.equal(state.produced.flachsfaser, 50);
  assert.equal(storageCount(state, 'verband'), 10);
  assert.equal(storageCount(state, 'verband') * ITEMS.verband.price, 1500);
});

test('Rhythmus: 3 Beete füllen eine Flachsbreche für genau eine Wachszeit', () => {
  const p = BUILDINGS.flachsbreche.production;
  assert.equal(p.capacity * p.duration, GROW);
  // Eine Webstube schafft die Fasern von bis zu 6 Flachsbrechen
  const fibersPerSecond = p.amount / p.duration;
  const webPerSecond = RECIPES.verband.inputs.flachsfaser / RECIPES.verband.time;
  assert.equal(Math.round(webPerSecond / fibersPerSecond), 6);
});

// ---------- Hintergrund, Pleiteschutz, Testpaket ----------

test('Im Hintergrund wächst das Beet weiter; „Willkommen zurück“ zählt reife Beete', () => {
  const state = level7();
  state.storage.leinsamen = 2;
  const a = placeBuilding(state, 'beet', 10, 6, 0);
  const b = placeBuilding(state, 'beet', 13, 6, 0);
  sowSeed(state, a);
  sowSeed(state, b);
  const report = catchUp(state, 2 * 3600);
  assert.equal(isRipe(a) && isRipe(b), true);
  assert.equal(report.ripe, 2);
  assert.equal(report.running, false, 'danach steht alles still');
  assert.equal(catchUp(state, 3600).ripe, 0, 'schon reif – zählt nicht noch einmal');
});

test('Pleiteschutz: Solange im Beet etwas wächst, ist man nicht pleite', () => {
  const state = level7();
  state.gold = 100;
  const beet = placeBuilding(state, 'beet', 10, 6, 0);
  assert.equal(isBroke(state), true);
  beet.prod.crop = 'leinsamen';
  assert.equal(isBroke(state), false);
});

test('Testpaket auf Level 7: Fasern und Verbände je 5, keine Samen oder Pflanzen', () => {
  const state = level7();
  applyTestPack(state);
  assert.equal(storageCount(state, 'flachsfaser'), 5);
  assert.equal(storageCount(state, 'verband'), 5);
  assert.equal(storageCount(state, 'leinsamen'), 0);
  assert.equal(storageCount(state, 'flachspflanze'), 0);
});

// ---------- Spielstand ----------

test('Spielstand (Version 13): Beete mit wachsender Pflanze bleiben erhalten', () => {
  assert.equal(SAVE_VERSION, 13);
  const state = level7();
  state.storage.leinsamen = 1;
  const beet = placeBuilding(state, 'beet', 10, 6, 0);
  placeBuilding(state, 'beet', 13, 6, 0);
  sowSeed(state, beet);
  simulate(state, 100);
  const loaded = clone(state);
  const [b1, b2] = loaded.buildings;
  assert.equal(b1.prod.crop, 'leinsamen');
  assert.ok(Math.abs(b1.prod.timer - 100) < 0.01);
  assert.deepEqual([b2.prod.crop, b2.prod.timer], [null, 0]);
});

test('Ungültige Beete im Spielstand werden erkannt', () => {
  for (const [change, ok] of [
    [() => {}, true],
    [(p) => Object.assign(p, { crop: 'holzstamm', timer: 0 }), false],
    [(p) => Object.assign(p, { crop: 'leinsamen', timer: -1 }), false],
    [(p) => Object.assign(p, { crop: 'leinsamen', timer: GROW + 1 }), false],
    [(p) => Object.assign(p, { crop: null, timer: 5 }), false],
    [(p) => delete p.crop, false],
  ]) {
    const state = level7();
    const beet = placeBuilding(state, 'beet', 10, 6, 0);
    change(beet.prod);
    assert.equal(isValidState(state), ok, JSON.stringify(beet.prod));
  }
});

test('Spielstand aus v0.15 (Version 12) öffnet sich unverändert', () => {
  const v12 = createNewGame(12);
  v12.shopLevel = 6;
  v12.gold = 4321;
  v12.storage = { holzplatte: 20 };
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 12, savedAt: 1, state: v12 }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 12);
  assert.deepEqual(loaded.notes, []);
  assert.deepEqual([loaded.state.shopLevel, loaded.state.gold, loaded.state.storage], [6, 4321, { holzplatte: 20 }]);
});
