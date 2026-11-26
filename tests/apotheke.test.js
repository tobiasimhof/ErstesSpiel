// v0.29.0: Level 12 „Die Apotheke“ (Entwurf v0.29.0, Tobias, Chat 21: „Von mir
// aus kannst du nach meinem Feedback alles so umsetzen“) – Kamille als 4.
// Pflanze, Apotheke im Reiter „Werkstatt“ mit Kräutermischung, Kamillenkissen
// und Heilpäckchen; Reißbrett als 3. Einstellung der Schreibstube (60 s);
// Aufstieg 7.500 Gold, kein Geschenk.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buyBuilding, placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS, BUILD_TABS, TAB_COLORS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { SHOP_LEVELS } from '../src/core/data/shop.js';
import { fitWorldToLevel } from '../src/core/land.js';
import { isItemUnlocked, isRecipeUnlocked, itemLevel, levelUp, recipeLevel, unlocksOf } from '../src/core/levels.js';
import { applyTestPack } from '../src/core/market.js';
import { harvest, loadInput, setRecipe, sowFromStorage } from '../src/core/production.js';
import { levelQuests, questReward, xpOfLevel } from '../src/core/quests.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(12);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = level;
  state.gold = gold;
  fitWorldToLevel(state); // ab Level 10 ist die Welt größer
  return state;
}

const worth = (items) => Object.entries(items).reduce((sum, [t, n]) => sum + ITEMS[t].price * n, 0);
const APOTHEKE = ['kraeutermischung', 'kamillenkissen', 'heilpaeckchen'];

// ---------- Datentabellen ----------

test('Level 12 gibt es, der Laden bleibt wie auf Level 7 bis 11', () => {
  assert.ok(MAX_LEVEL >= 12);
  assert.deepEqual(SHOP_LEVELS[12], SHOP_LEVELS[11]);
});

test('Kamille: Samen 830 Gold, wächst 30 Minuten im Beet, die Erntebank macht 50 Blüten à 20 Gold', () => {
  assert.deepEqual([ITEMS.kamillensamen.buyPrice, ITEMS.kamillensamen.level, ITEMS.kamillensamen.raw], [830, 12, true]);
  assert.ok(ITEMS.kamille.grown && ITEMS.kamille.raw && !ITEMS.kamille.price, 'Pflanze: nicht verkäuflich');
  assert.equal(ITEMS.kamillenbluete.price, 20);
  assert.deepEqual(BUILDINGS.beet.production.crops.kamillensamen, { plant: 'kamille', time: 1800 });
  assert.equal(BUILDINGS.flachsbreche.production.inputs.kamille, 'kamillenbluete');
  // Teurer, bringt aber mehr: 830 → 1.000 (+20 %)
  assert.equal(50 * ITEMS.kamillenbluete.price, 1000);
  assert.ok(1000 / 830 > 1.19 && 1000 / 830 < 1.23);
});

test('Apotheke: 2 × 2, zwei Eingänge, Kräutermischung, Kamillenkissen und Heilpäckchen', () => {
  const def = BUILDINGS.apotheke;
  assert.deepEqual([def.level, def.size, def.color, def.name], [12, [2, 2], TAB_COLORS.werkstatt, 'Apotheke']);
  assert.equal(def.ports.filter((p) => p.kind === 'in').length, 2, 'höchstens 2 Eingänge (Tobias)');
  assert.equal(def.ports.filter((p) => p.kind === 'out').length, 1);
  // v0.45.0: ab Level 14 als 4. Einstellung die Tinktur (tests/tinktur.test.js)
  assert.deepEqual(def.production.recipes, [...APOTHEKE, 'tinktur']);
  assert.deepEqual(RECIPES.kraeutermischung.inputs, { schafgarbenbluete: 5, kamillenbluete: 5 });
  assert.deepEqual(RECIPES.kamillenkissen.inputs, { flachsfaser: 10, kamillenbluete: 5 });
  assert.deepEqual(RECIPES.heilpaeckchen.inputs, { wundverband: 1, kraeuterkompresse: 1 });
  assert.deepEqual(
    APOTHEKE.map((k) => RECIPES[k].time),
    [20, 20, 30],
  );
});

test('Reißbrett: 3. Einstellung der Schreibstube, 1 Zeichenbrett + 1 Reißzeug, 60 s, erst ab Level 12', () => {
  assert.deepEqual(BUILDINGS.schreibstube.production.recipes, ['zeichenbrett', 'reisszeug', 'reissbrett']);
  const r = RECIPES.reissbrett;
  assert.deepEqual([r.building, r.inputs, r.output, r.amount, r.time], ['schreibstube', { zeichenbrett: 1, reisszeug: 1 }, 'reissbrett', 1, 60]);
  assert.equal(recipeLevel('reissbrett'), 12);
  assert.equal(recipeLevel('reisszeug'), 9);
  assert.equal(itemLevel('reissbrett'), 12);
  assert.equal(isRecipeUnlocked(levelGame(11), 'reissbrett'), false);
  assert.equal(isRecipeUnlocked(levelGame(12), 'reissbrett'), true);
});

test('Preise: Zutaten + 20 % (216, 216, 504, 1.408)', () => {
  for (const key of [...APOTHEKE, 'reissbrett']) {
    assert.equal(ITEMS[key].price, Math.round(worth(RECIPES[key].inputs) * 1.2), key);
  }
  assert.deepEqual(
    [...APOTHEKE, 'reissbrett'].map((k) => ITEMS[k].price),
    [216, 216, 504, 1408],
  );
});

test('Wundverband, Kräuterkompresse, Zeichenbrett und Reißzeug werden jetzt weiterverarbeitet', () => {
  const used = new Set(Object.values(RECIPES).flatMap((r) => Object.keys(r.inputs)));
  for (const type of ['wundverband', 'kraeuterkompresse', 'zeichenbrett', 'reisszeug', 'schafgarbenbluete', 'kamillenbluete']) {
    assert.ok(used.has(type), type);
  }
});

test('Bauleiste: Apotheke im Reiter „Werkstatt“ (Tobias: „weil die Tränke einen eigenen Reiter bekommen“)', () => {
  const werkstatt = BUILD_TABS.find((t) => t.id === 'werkstatt');
  assert.deepEqual(werkstatt.buildings, ['schreibstube', 'uhrmacherei', 'apotheke']);
  assert.equal(BUILD_TABS.find((t) => t.id === 'kraeuter').buildings.length, 4, '„Erde“ ist voll');
  for (const tab of BUILD_TABS) assert.ok(tab.buildings.length <= 4, `${tab.name}: höchstens 4 Gebäude`);
});

test('Baukosten: 1 Verstärkte Holzplatte + 1 Gewichtstein (432 Gold, nur Werkzeug-Waren, unter 480)', () => {
  const cost = BUILDINGS.apotheke.cost;
  assert.deepEqual(cost, { verstaerkteholzplatte: 1, gewichtstein: 1 });
  assert.equal(worth(cost), 432);
  assert.ok(worth(cost) <= 480, 'Kräuter-Gebäude höchstens so viel wie ein Leinsamen als Verbände');
  for (const item of Object.keys(cost)) assert.ok(itemLevel(item) <= 6, `${item} ist eine Werkzeug-Ware`);
});

// ---------- Level 12 ----------

test('Level 12 schaltet frei: Apotheke, Kamillensamen beim Händler, Reißbrett', () => {
  assert.deepEqual(unlocksOf(12), { buildings: ['apotheke'], raws: ['kamillensamen'], recipes: ['reissbrett'] });
  const eleven = levelGame(11);
  assert.equal(isItemUnlocked(eleven, 'kamillensamen'), false);
  assert.equal(isItemUnlocked(eleven, 'kamillenbluete'), false, 'die Erntebank macht Kamillenblüten erst mit der Kamille');
  assert.equal(isItemUnlocked(levelGame(12), 'kamillensamen'), true);
});

test('Level 12 „Die Apotheke“: Aufstieg 7.500 Gold, kein Geschenk, keine neue Fläche', () => {
  const def = LEVELS[12];
  assert.equal(def.name, 'Die Apotheke');
  assert.equal(def.cost, 7500, 'Tobias: „weil man sehr viel Gold verdient“');
  assert.equal(def.gift, undefined);
  const state = levelGame(11, 8000);
  state.quest.index = levelQuests(11).length; // v0.56.0: alle Aufträge abgegeben
  const storageBefore = { ...state.storage };
  const worldBefore = { ...state.world };
  assert.deepEqual(levelUp(state), { level: 12, gift: {}, cost: 7500, moreLand: false });
  assert.equal(state.gold, 500);
  assert.deepEqual(state.storage, storageBefore, 'nichts ins Laden-Lager');
  assert.deepEqual(state.world, worldBefore, 'die Welt bleibt, wie sie ist');
});

test('Ohne genug Gold kein Aufstieg auf Level 12', () => {
  const state = levelGame(11, 7499);
  state.quest.index = levelQuests(11).length; // v0.56.0: alle Aufträge abgegeben
  assert.equal(levelUp(state), null);
  assert.equal(state.shopLevel, 11);
});

test('Aufträge auf Level 12: 4 Stück, zusammen 2.722 Erfahrung und 9.072 Gold', () => {
  const quests = levelQuests(12);
  assert.deepEqual(
    quests.map((q) => [q.from, q.items]),
    [
      ['Apothekerin Klara', { kamillenbluete: 50 }],
      ['Apothekerin Klara', { kraeutermischung: 10 }],
      ['Heilerin Agnes', { kamillenkissen: 5, heilpaeckchen: 4 }],
      ['Baumeister Anton', { reissbrett: 2 }],
    ],
  );
  const rewards = quests.map((q) => questReward(q));
  assert.deepEqual(
    rewards.map((r) => r.xp),
    [300, 648, 929, 845],
  );
  assert.equal(xpOfLevel(12), 2722);
  assert.ok(xpOfLevel(12) > xpOfLevel(11), 'mehr Erfahrung als Level 11');
  assert.equal(
    rewards.reduce((sum, r) => sum + r.gold, 0),
    9072,
  );
});

test('Unter Level 12 lässt sich die Apotheke nicht bauen', () => {
  const state = levelGame(11);
  state.storage = { verstaerkteholzplatte: 1, gewichtstein: 1 };
  assert.equal(buyBuilding(state, 'apotheke', 10, 6), 'locked');
  state.shopLevel = 12;
  assert.ok(buyBuilding(state, 'apotheke', 10, 6)?.id, 'ab Level 12 gebaut');
  assert.deepEqual(state.storage, {}, 'Baukosten bezahlt');
});

// ---------- Herstellen ----------

test('Kette: Kamillensamen → Beet → Erntebank → 50 Kamillenblüten', () => {
  const state = levelGame(12);
  state.storage.kamillensamen = 1;
  const beet = placeBuilding(state, 'beet', 8, 6, 0);
  assert.ok(sowFromStorage(state, beet, 'kamillensamen'));
  simulate(state, 1799);
  assert.equal(harvest(state, beet), 'unripe', 'nach knapp 30 Minuten noch nicht reif');
  simulate(state, 2);
  assert.equal(harvest(state, beet), 'ok');
  assert.equal(storageCount(state, 'kamille'), 1);
  const bank = placeBuilding(state, 'flachsbreche', 12, 6, 0);
  assert.ok(loadInput(state, bank, 'kamille'));
  placeBuilding(state, 'versandportal', 14, 6, 0);
  simulate(state, 600 + 30);
  assert.equal(storageCount(state, 'kamillenbluete'), 50);
  // Rechenhilfe: 1 Schafgarbe + 1 Kamille (je 50 Blüten) = genau 10 Kräutermischungen
  assert.equal(50 / RECIPES.kraeutermischung.inputs.kamillenbluete, 10);
  assert.equal(50 / RECIPES.kraeutermischung.inputs.schafgarbenbluete, 10);
});

test('Jede Einstellung braucht ihre Zeit: Apotheke 20 / 20 / 30 s, Reißbrett 60 s', () => {
  const cases = [
    ['apotheke', 'kraeutermischung', { schafgarbenbluete: 5, kamillenbluete: 5 }, 20],
    ['apotheke', 'kamillenkissen', { flachsfaser: 10, kamillenbluete: 5 }, 20],
    ['apotheke', 'heilpaeckchen', { wundverband: 1, kraeuterkompresse: 1 }, 30],
    ['schreibstube', 'reissbrett', { zeichenbrett: 1, reisszeug: 1 }, 60],
  ];
  for (const [type, key, stock, time] of cases) {
    const state = levelGame(12);
    const b = placeBuilding(state, type, 16, 6, 0);
    assert.ok(setRecipe(b, key));
    b.prod.stock = { ...stock };
    simulate(state, time - 1);
    assert.equal(b.prod.out, null, `${key}: nach ${time - 1} s noch nicht fertig`);
    simulate(state, 2);
    assert.deepEqual(b.prod.out, { type: key, count: 1 }, key);
  }
});

test('Testpaket auf Level 12: Kamillenblüten, die Apotheken-Waren und Reißbretter; auf Level 11 noch nicht', () => {
  const twelve = levelGame(12);
  applyTestPack(twelve);
  for (const type of ['kamillenbluete', ...APOTHEKE, 'reissbrett']) assert.ok(storageCount(twelve, type) > 0, type);
  assert.equal(storageCount(twelve, 'kamille'), 0, 'Pflanzen gibt es im Testpaket nicht');
  const eleven = levelGame(11);
  applyTestPack(eleven);
  for (const type of ['kamillenbluete', 'kraeutermischung', 'reissbrett']) assert.equal(storageCount(eleven, type), 0, type);
});

test('Spielstand: Apotheke, Kamille im Beet und Reißbrett bleiben nach Speichern und Laden erhalten', () => {
  const state = levelGame(12);
  const apo = placeBuilding(state, 'apotheke', 16, 6, 0);
  setRecipe(apo, 'heilpaeckchen');
  apo.prod.stock = { wundverband: 1, kraeuterkompresse: 0 };
  const stube = placeBuilding(state, 'schreibstube', 16, 10, 0);
  setRecipe(stube, 'reissbrett');
  state.storage.kamillensamen = 1;
  const beet = placeBuilding(state, 'beet', 8, 6, 0);
  sowFromStorage(state, beet, 'kamillensamen');
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  assert.equal(loaded.state.shopLevel, 12);
  const a = loaded.state.buildings.find((b) => b.type === 'apotheke');
  assert.equal(a.prod.recipe, 'heilpaeckchen');
  assert.deepEqual(a.prod.stock, { wundverband: 1, kraeuterkompresse: 0 });
  assert.equal(loaded.state.buildings.find((b) => b.type === 'schreibstube').prod.recipe, 'reissbrett');
  assert.equal(loaded.state.buildings.find((b) => b.type === 'beet').prod.crop, 'kamillensamen');
});
