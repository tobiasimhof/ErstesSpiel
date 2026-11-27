// v0.60.0: Level 19 „Die Landvermessung“ (Entwurf v0.60.0, 2. Fassung, Tobias,
// Chat 33: „Die neuen Produkte passen“, „Aufträge passen auch“; ab Level 19
// „alles mit allem mischen“, Abwechslung vor Gold) – sechs neue Produkte in
// drei Arten: Endprodukte verbinden (Astrolabium, Messtisch, Heilertasche),
// Endprodukt + Zwischenprodukt (Schatztruhe), nur Zwischenprodukte (Laterne,
// Lupe). Neue Maschine: Kaspars Instrumentenbau im Reiter „Werkstatt“.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS, BUILD_TABS, TAB_COLORS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { SHOP_LEVELS } from '../src/core/data/shop.js';
import { fitWorldToLevel, worldForLevel } from '../src/core/land.js';
import { isBuildingUnlocked, isRecipeUnlocked, levelUp, recipeLevel, unlocksOf } from '../src/core/levels.js';
import { applyTestPack } from '../src/core/market.js';
import { buildingStatus, setRecipe } from '../src/core/production.js';
import { levelQuests, questReward, xpOfLevel } from '../src/core/quests.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function levelGame(level, gold = 0) {
  const state = createNewGame(19);
  state.buildings = [];
  state.belts = {};
  state.storage = {};
  state.shopLevel = level;
  state.gold = gold;
  fitWorldToLevel(state);
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

const worth = (items) => Object.entries(items).reduce((sum, [t, n]) => sum + ITEMS[t].price * n, 0);

const NEW = ['astrolabium', 'messtisch', 'lupe', 'heilertasche', 'schatztruhe', 'laterne'];

// ---------- Datentabellen ----------

test('Level 19 „Die Landvermessung“: Geschichte mit Anton und Kaspar, Laden wie auf Level 18, Aufstieg 25.000 Gold ohne Geschenk', () => {
  assert.equal(MAX_LEVEL, 19);
  const def = LEVELS[19];
  assert.equal(def.name, 'Die Landvermessung');
  for (const word of ['Anton', 'Kaspar', 'Messinstrumente', 'Laternen', 'Truhen', 'Heilerin']) assert.ok(def.story.includes(word), word);
  assert.equal(def.cost, 25000, 'die Reihe 20.000 → 22.500 → 25.000');
  assert.equal(def.gift, undefined, 'kein Geschenk');
  assert.deepEqual(SHOP_LEVELS[19], SHOP_LEVELS[18]);
  assert.deepEqual(worldForLevel(19), worldForLevel(18), 'keine neue Fläche');
  assert.deepEqual(unlocksOf(19), { buildings: ['instrumentenbau'], raws: [], recipes: ['heilertasche', 'schatztruhe', 'laterne'] });
});

test('Instrumentenbau: Reiter „Werkstatt“ (damit voll), 2 × 2 mit 2 Eingängen, 1 Zirkel + 2 Linsen (950 Gold, unter 960), ab Level 19', () => {
  const def = BUILDINGS.instrumentenbau;
  assert.deepEqual([def.level, def.size, def.color, def.icon], [19, [2, 2], TAB_COLORS.werkstatt, '🧭']);
  assert.deepEqual(def.cost, { zirkel: 1, linse: 2 });
  assert.equal(worth(def.cost), 950);
  assert.ok(worth(def.cost) <= 960, 'Grenze für Baukosten ab Eisen');
  assert.equal(def.ports.filter((p) => p.kind === 'in').length, 2, 'höchstens 2 Eingänge');
  assert.deepEqual(def.production, { kind: 'workshop', recipes: ['astrolabium', 'messtisch', 'lupe'] });
  const werkstatt = BUILD_TABS.find((t) => t.id === 'werkstatt');
  assert.deepEqual(werkstatt.buildings, ['schreibstube', 'uhrmacherei', 'apotheke', 'instrumentenbau']);
  for (const tab of BUILD_TABS) assert.equal(tab.buildings.length, 4, `${tab.name}: voll (höchstens 4 aufs Handy)`);
  assert.equal(isBuildingUnlocked(levelGame(18), 'instrumentenbau'), false);
  assert.equal(isBuildingUnlocked(levelGame(19), 'instrumentenbau'), true);
});

test('Sechs neue Produkte: Zutaten, Maschine, Zeit, Wert = Zutaten × 1,2', () => {
  const want = {
    astrolabium: ['instrumentenbau', { sternenuhr: 1, fernrohr: 1 }, 90, 2087],
    messtisch: ['instrumentenbau', { reissbrett: 1, fernrohr: 1 }, 90, 2450],
    lupe: ['instrumentenbau', { linse: 1, eisenstange: 5 }, 30, 317],
    heilertasche: ['kraeuterstube', { heilpaeckchen: 1, moerser: 2 }, 30, 708],
    schatztruhe: ['schlosserei', { kastenschloss: 1, verstaerkteholzplatte: 5 }, 60, 2851],
    laterne: ['feinschmiede', { eisenblech: 5, glas: 5 }, 20, 216],
  };
  for (const [key, [building, inputs, time, price]] of Object.entries(want)) {
    const r = RECIPES[key];
    assert.deepEqual([r.building, r.inputs, r.time, r.output, r.amount], [building, inputs, time, key, 1], key);
    assert.equal(ITEMS[key].price, price, key);
    assert.equal(price, Math.round(worth(inputs) * 1.2), `${key}: +20 %`);
    assert.equal(recipeLevel(key), 19, key);
    assert.equal(isRecipeUnlocked(levelGame(18), key), false, `${key} nicht auf Level 18`);
    assert.equal(isRecipeUnlocked(levelGame(19), key), true, key);
    assert.ok(Object.keys(inputs).length <= 2, `${key}: höchstens 2 Zutaten`);
  }
  // die drei Arten (Tobias, Chat 33): an Endprodukte anbinden, mit Zwischenprodukten neue Stätten
  const ends = ['sternenuhr', 'fernrohr', 'reissbrett', 'heilpaeckchen', 'moerser', 'kastenschloss'];
  for (const key of ['astrolabium', 'messtisch', 'heilertasche']) {
    assert.ok(Object.keys(RECIPES[key].inputs).every((t) => ends.includes(t)), `${key}: nur aus Endprodukten`);
  }
  for (const key of ['laterne', 'lupe']) {
    assert.ok(Object.keys(RECIPES[key].inputs).every((t) => !ends.includes(t)), `${key}: nur aus Zwischenprodukten`);
  }
});

test('Die alten Maschinen bekommen ihre 4. Einstellung: Kräuterstube, Schlosserei, Feinschmiede', () => {
  assert.deepEqual(BUILDINGS.kraeuterstube.production.recipes, ['heilverband', 'kraeuterkompresse', 'wundverband', 'heilertasche']);
  assert.deepEqual(BUILDINGS.schlosserei.production.recipes, ['gewichtstein', 'uhrwerk', 'vorhaengeschloss', 'schatztruhe']);
  assert.deepEqual(BUILDINGS.feinschmiede.production.recipes, ['scharnier', 'schluessel', 'zirkel', 'laterne']);
});

test('Aufträge auf Level 19: Kaspar, Anton, Ulrich, Agnes, Marta – zusammen 33.501 Gold (×1,2 gegenüber Level 18)', () => {
  const quests = levelQuests(19);
  assert.deepEqual(
    quests.map((q) => [q.from, q.items]),
    [
      ['Uhrmacher Kaspar', { astrolabium: 3, lupe: 10 }],
      ['Baumeister Anton', { messtisch: 4 }],
      ['Torwächter Ulrich', { laterne: 20 }],
      ['Heilerin Agnes', { heilertasche: 6 }],
      ['Händlerin Marta', { schatztruhe: 2 }],
    ],
  );
  const gold = quests.map((q) => questReward(q).gold);
  assert.deepEqual(gold, [9431, 9800, 4320, 4248, 5702]);
  assert.equal(gold.reduce((a, b) => a + b, 0), 33501);
  assert.equal(xpOfLevel(19), 10050);
  // jede neue Ware kommt in einem Auftrag vor
  for (const type of NEW) assert.ok(quests.some((q) => q.items[type]), type);
  const ratio = 33501 / 27891;
  assert.ok(ratio > 1.15 && ratio < 1.3, `Sprung zu Level 18: ×${ratio.toFixed(2)}`);
});

test('Aufstieg auf Level 19: 25.000 Gold, keine neue Fläche; danach ist Level 19 das höchste', () => {
  const state = levelGame(18, 30000);
  const before = { ...state.world };
  state.quest.index = levelQuests(18).length;
  assert.deepEqual(levelUp(state), { level: 19, gift: {}, cost: 25000, moreLand: false });
  assert.equal(state.gold, 5000);
  assert.deepEqual(state.world, before);
  state.gold = 100000;
  state.quest.index = levelQuests(19).length;
  assert.equal(levelUp(state), null);
});

// ---------- In der Fabrik ----------

test('Instrumentenbau: ein neuer stellt Astrolabien her; Sternenuhr + Fernrohr → 1 Astrolabium in 90 s', () => {
  const state = levelGame(19);
  const b = placeBuilding(state, 'instrumentenbau', 12, 6, 0);
  assert.equal(b.prod.recipe, 'astrolabium');
  b.prod.stock = { sternenuhr: 1 };
  simulate(state, 5);
  assert.equal(b.prod.out, null);
  assert.equal(buildingStatus(state, b).text, 'Wartet auf Fernrohr (0 / 1).');
  b.prod.stock = { sternenuhr: 1, fernrohr: 1 };
  simulate(state, 89);
  assert.equal(b.prod.out, null, 'nach 89 s noch nicht fertig');
  simulate(state, 2);
  assert.deepEqual(b.prod.out, { type: 'astrolabium', count: 1 });
});

test('Jede neue Einstellung braucht ihre Zeit und liefert 1 Stück', () => {
  const cases = [
    ['instrumentenbau', 'messtisch', { reissbrett: 1, fernrohr: 1 }, 90],
    ['instrumentenbau', 'lupe', { linse: 1, eisenstange: 5 }, 30],
    ['kraeuterstube', 'heilertasche', { heilpaeckchen: 1, moerser: 2 }, 30],
    ['schlosserei', 'schatztruhe', { kastenschloss: 1, verstaerkteholzplatte: 5 }, 60],
    ['feinschmiede', 'laterne', { eisenblech: 5, glas: 5 }, 20],
  ];
  for (const [type, key, stock, time] of cases) {
    const state = levelGame(19);
    const b = placeBuilding(state, type, 16, 6, 0);
    assert.ok(setRecipe(b, key), key);
    b.prod.stock = { ...stock };
    simulate(state, time - 1);
    assert.equal(b.prod.out, null, `${key}: nach ${time - 1} s noch nicht fertig`);
    simulate(state, 2);
    assert.deepEqual(b.prod.out, { type: key, count: 1 }, key);
  }
});

test('Eine Straße aus Zwischenprodukten: Schmiede (Eisenbleche) → Feinschmiede (Glas am 2. Eingang) → Portal: Laternen ins Laden-Lager', () => {
  const state = levelGame(19);
  const s = placeBuilding(state, 'schmiede', 10, 6, 0);
  const f = placeBuilding(state, 'feinschmiede', 15, 6, 0);
  placeBuilding(state, 'versandportal', 20, 6, 0);
  drag(state, [
    [12, 6],
    [14, 6],
  ]);
  drag(state, [
    [17, 6],
    [20, 6],
  ]);
  setRecipe(s, 'eisenblech');
  setRecipe(f, 'laterne');
  s.prod.stock = { eisenbarren: 50 };
  f.prod.stock = { glas: 10 };
  simulate(state, 400);
  assert.equal(storageCount(state, 'laterne'), 2, 'zwei Laternen im Laden-Lager');
});

test('Testpaket auf Level 19: die sechs neuen Waren; auf Level 18 noch nicht', () => {
  const state = levelGame(19);
  applyTestPack(state);
  for (const type of NEW) assert.ok(storageCount(state, type) > 0, type);
  const eighteen = levelGame(18);
  applyTestPack(eighteen);
  for (const type of NEW) assert.equal(storageCount(eighteen, type), 0, type);
});

test('Spielstand: Instrumentenbau auf Messtische, Schlosserei auf Schatztruhen und die neuen Waren bleiben erhalten', () => {
  const state = levelGame(19);
  const i = placeBuilding(state, 'instrumentenbau', 10, 6, 0);
  const s = placeBuilding(state, 'schlosserei', 15, 6, 0);
  setRecipe(i, 'messtisch');
  setRecipe(s, 'schatztruhe');
  i.prod.stock = { reissbrett: 1 };
  Object.assign(state.storage, { astrolabium: 1, messtisch: 2, lupe: 3, heilertasche: 4, schatztruhe: 1, laterne: 7 });
  const loaded = deserializeGame(serializeGame(state));
  assert.ok(loaded);
  const [i2, s2] = loaded.state.buildings;
  assert.deepEqual([i2.type, i2.prod.recipe, i2.prod.stock], ['instrumentenbau', 'messtisch', { reissbrett: 1 }]);
  assert.deepEqual([s2.prod.recipe], ['schatztruhe']);
  assert.deepEqual(NEW.map((t) => loaded.state.storage[t]), [1, 2, 3, 4, 1, 7]);
});
