// v0.10.0: Kombi-Maschinen mit zwei Eingängen (Techbaum, Teil 2) und
// mitwachsende Verkaufstheken mit einstellbarer Menge.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { buildingPorts } from '../src/core/geometry.js';
import { levelUp, producedCount } from '../src/core/levels.js';
import { xpNeeded } from '../src/core/quests.js';
import {
  counterMaxFor,
  counterSize,
  fillCounter,
  serveCustomer,
  setCounterAmount,
  setCounterItem,
} from '../src/core/market.js';
import {
  buildingContents,
  buildingStatus,
  inputJam,
  missingInputs,
  returnUnusedStock,
  setRecipe,
  unusedStock,
  workshopInputs,
} from '../src/core/production.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCapacity, storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { createNewGame } from '../src/core/state.js';

function emptyGame() {
  const state = createNewGame(7);
  state.buildings = [];
  state.storage = {};
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

// Lagerhaus als Zulieferer: gibt seine Fächer der Reihe nach aus.
function feeder(state, x, y, slots) {
  const store = placeBuilding(state, 'lagerhaus', x, y, 0);
  store.prod.slots = slots.map(([type, count]) => ({ type, count }));
  return store;
}

// Kombi-Maschine bei (20,10)-(21,11): Eingänge links bei (20,10) und (20,11),
// Ausgang rechts oben → Band (22,10),(23,10) → Versandportal (24,10).
// Zulieferer A (Lagerhaus 16,9) → Band (17,10)…(19,10) → oberer Eingang.
// Zulieferer B (Lagerhaus 16,11) → Band (17,12),(18,12),(18,11),(19,11) → unterer Eingang.
function comboLine(type, recipe, slotsA, slotsB) {
  const state = emptyGame();
  const machine = placeBuilding(state, type, 20, 10, 0);
  setRecipe(machine, recipe);
  if (slotsA) {
    feeder(state, 16, 9, slotsA);
    drag(state, [
      [17, 10],
      [19, 10],
    ]);
  }
  if (slotsB) {
    feeder(state, 16, 11, slotsB);
    drag(state, [
      [17, 12],
      [18, 12],
      [18, 11],
      [19, 11],
    ]);
  }
  drag(state, [
    [22, 10],
    [23, 10],
  ]);
  placeBuilding(state, 'versandportal', 24, 10, 0);
  return { state, machine };
}

// ---------- Datentabellen ----------

test('3 Kombi-Maschinen: 2 × 2, zwei Eingänge links, Ausgang rechts oben, je 3 Einstellungen', () => {
  for (const type of ['zimmerei', 'feinschmiede', 'schlosserei']) {
    const def = BUILDINGS[type];
    assert.deepEqual(def.size, [2, 2], type);
    assert.deepEqual(
      def.ports.map((p) => `${p.kind}:${p.x},${p.y}:${p.side}`),
      ['in:0,0:W', 'in:0,1:W', 'out:1,0:E'],
      type,
    );
    assert.equal(def.production.recipes.length, 3, type);
  }
  assert.deepEqual(BUILDINGS.zimmerei.production.recipes, ['zahnradwelle', 'raederwerk', 'verstaerkteholzplatte']);
  assert.deepEqual(BUILDINGS.feinschmiede.production.recipes, ['scharnier', 'schluessel', 'zirkel']);
  assert.deepEqual(BUILDINGS.schlosserei.production.recipes, ['gewichtstein', 'uhrwerk', 'vorhaengeschloss']);
});

test('Rezepte aus Grundteilen: 10 + 5 Stück, zwei verschiedene Zutaten, jedes Rezept anders', () => {
  const basic = ['zahnradwelle', 'raederwerk', 'verstaerkteholzplatte', 'scharnier', 'schluessel', 'gewichtstein'];
  const seen = new Set();
  for (const key of basic) {
    const r = RECIPES[key];
    assert.deepEqual(Object.values(r.inputs), [10, 5], key);
    const sig = JSON.stringify(r.inputs);
    assert.ok(!seen.has(sig), `${key}: eigenes Rezept`);
    seen.add(sig);
  }
  // Tobias' Beispiel
  assert.deepEqual(RECIPES.zahnradwelle.inputs, { holzstab: 10, steinzahnrad: 5 });
  assert.deepEqual(RECIPES.raederwerk.inputs, { steinzahnrad: 10, holzstab: 5 });
  // Gewichtstein (bis v0.12: Steinkette) aus Steinplatten – sonst bräuchte kein neues Rezept die Steinplatte
  assert.deepEqual(RECIPES.gewichtstein.inputs, { steinplatte: 10, eisenstange: 5 });
  // Jedes Grundteil wird von mindestens einem neuen Rezept gebraucht
  for (const part of ['holzplatte', 'holzstab', 'steinplatte', 'steinzahnrad', 'eisenblech', 'eisenstange']) {
    assert.ok(basic.some((key) => RECIPES[key].inputs[part]), `${part} wird gebraucht`);
  }
});

test('Werte der neuen Waren: Zutaten + 20 % (Tabelle in docs/SPIEL.md)', () => {
  const expected = {
    zahnradwelle: 324,
    raederwerk: 324,
    verstaerkteholzplatte: 648,
    scharnier: 1296,
    schluessel: 1296,
    zirkel: 1987,
    gewichtstein: 648,
    uhrwerk: 778,
    vorhaengeschloss: 1944,
  };
  for (const [type, price] of Object.entries(expected)) {
    assert.equal(ITEMS[type].price, price, type);
    const r = RECIPES[type];
    const inValue = Object.entries(r.inputs).reduce((s, [t, n]) => s + n * ITEMS[t].price, 0);
    assert.equal(price, Math.round(inValue * 1.2), `${type}: ${inValue} + 20 %`);
  }
});

// ---------- Zwei Eingänge ----------

test('Zimmerei: Holzstäbe oben, Stein-Zahnräder unten → Zahnradwellen', () => {
  const { state, machine } = comboLine('zimmerei', 'zahnradwelle', [['holzstab', 30]], [['steinzahnrad', 15]]);
  assert.equal(machine.prod.recipe, 'zahnradwelle');
  simulate(state, 200);
  assert.equal(storageCount(state, 'zahnradwelle'), 3, '30 Stäbe + 15 Zahnräder → 3 Zahnradwellen');
  assert.equal(producedCount(state, 'zahnradwelle'), 3, 'zählt fürs Level');
  assert.deepEqual(machine.prod.stock, { holzstab: 0, steinzahnrad: 0 });
  assert.equal(buildingStatus(state, machine).level, 'idle');
});

test('Jeder Eingang nimmt jede passende Zutat (auch vertauscht)', () => {
  const { state } = comboLine('zimmerei', 'raederwerk', [['steinzahnrad', 10]], [['holzstab', 5]]);
  simulate(state, 100);
  assert.equal(storageCount(state, 'raederwerk'), 1);
});

test('Schlosserei: Vorhängeschloss aus Scharnier + Räderwerk, Uhrwerk aus Zahnradwelle + Räderwerk', () => {
  const lock = comboLine('schlosserei', 'vorhaengeschloss', [['scharnier', 2]], [['raederwerk', 2]]);
  simulate(lock.state, 120);
  assert.equal(storageCount(lock.state, 'vorhaengeschloss'), 2);

  const reg = comboLine('schlosserei', 'uhrwerk', [['zahnradwelle', 1]], [['raederwerk', 1]]);
  simulate(reg.state, 60);
  assert.equal(storageCount(reg.state, 'uhrwerk'), 1);
});

test('Feinschmiede: Zirkel aus 1 Scharnier + 5 Eisenstangen', () => {
  const { state } = comboLine('feinschmiede', 'zirkel', [['eisenstange', 10]], [['scharnier', 2]]);
  simulate(state, 120);
  assert.equal(storageCount(state, 'zirkel'), 2);
});

test('Fehlt eine Zutat, zeigt die Maschine welche und wie viel – ohne Stau', () => {
  const { state, machine } = comboLine('zimmerei', 'zahnradwelle', [['holzstab', 30]], [['steinzahnrad', 2]]);
  simulate(state, 60);
  assert.deepEqual(workshopInputs(machine), [
    { type: 'holzstab', need: 10, have: 20, done: true },
    { type: 'steinzahnrad', need: 5, have: 2, done: false },
  ]);
  assert.deepEqual(missingInputs(machine), ['steinzahnrad']);
  assert.equal(inputJam(state, machine), null, 'der untere Eingang könnte noch liefern');
  const status = buildingStatus(state, machine);
  assert.equal(status.level, 'idle');
  assert.equal(status.text, 'Wartet auf Stein-Zahnrad (2 / 5).');
});

test('Gemischtes Band an einem Eingang: zu viele Holzstäbe stauen sich, es fehlen Zahnräder', () => {
  // Erst 30 Holzstäbe, dahinter 5 Zahnräder – alles über den oberen Eingang
  const { state, machine } = comboLine('zimmerei', 'zahnradwelle', [['holzstab', 30], ['steinzahnrad', 5]], null);
  simulate(state, 120);
  assert.equal(machine.prod.stock.holzstab, 20, 'mehr Stäbe nimmt sie nicht auf');
  assert.equal(machine.prod.stock.steinzahnrad ?? 0, 0, 'die Zahnräder kommen nie an');
  assert.equal(inputJam(state, machine), 'holzstab');
  const status = buildingStatus(state, machine);
  assert.equal(status.level, 'blocked');
  assert.match(status.text, /Eingang blockiert.*Holzstab.*Stein-Zahnrad/);
});

test('Falsche Ware am Eingang: Das Infofenster sagt, dass sie hier nicht gebraucht wird', () => {
  const { state, machine } = comboLine('zimmerei', 'zahnradwelle', [['holzblock', 5]], null);
  simulate(state, 30);
  assert.equal(inputJam(state, machine), 'holzblock');
  assert.deepEqual(buildingStatus(state, machine), {
    level: 'blocked',
    text: 'Eingang blockiert: Holzblock wird hier nicht gebraucht.',
  });
});

test('Umstellen: Zutaten bleiben in der Maschine und werden beim Zurückstellen wieder gebraucht (v0.10.1)', () => {
  const state = emptyGame();
  const machine = placeBuilding(state, 'zimmerei', 20, 10, 0);
  machine.prod.stock = { holzstab: 10, steinzahnrad: 3 };
  setRecipe(machine, 'raederwerk');
  assert.deepEqual(unusedStock(machine), {}, 'Räderwerk braucht beides');
  setRecipe(machine, 'verstaerkteholzplatte');
  assert.deepEqual(machine.prod.stock, { holzstab: 10, steinzahnrad: 3 }, 'nichts verschwindet');
  assert.deepEqual(unusedStock(machine), { holzstab: 10, steinzahnrad: 3 });
  assert.deepEqual(state.storage, {}, 'nichts wandert ungefragt ins Laden-Lager');
  setRecipe(machine, 'zahnradwelle');
  assert.deepEqual(unusedStock(machine), {});
  machine.prod.stock.steinzahnrad = 5;
  simulate(state, 1);
  assert.equal(machine.prod.busy, true, 'mit den alten Zutaten geht es sofort weiter');
});

test('Umstellen mitten im Durchgang: die Zutaten kommen zurück in die Maschine', () => {
  const state = emptyGame();
  const machine = placeBuilding(state, 'zimmerei', 20, 10, 0);
  machine.prod.stock = { holzstab: 10, steinzahnrad: 5 };
  simulate(state, 1);
  assert.equal(machine.prod.busy, true);
  setRecipe(machine, 'verstaerkteholzplatte');
  assert.deepEqual(machine.prod.stock, { holzstab: 10, steinzahnrad: 5 });
  assert.deepEqual(buildingContents(machine), { holzstab: 10, steinzahnrad: 5 });
});

test('Knopf „Reste ins Laden-Lager“: nur Zutaten, die die Einstellung nicht braucht', () => {
  const state = emptyGame();
  const machine = placeBuilding(state, 'zimmerei', 20, 10, 0);
  machine.prod.stock = { holzstab: 7, steinzahnrad: 3, holzplatte: 4 };
  setRecipe(machine, 'verstaerkteholzplatte');
  assert.deepEqual(returnUnusedStock(state, machine), { holzstab: 7, steinzahnrad: 3 });
  assert.deepEqual(machine.prod.stock, { holzplatte: 4 }, 'Holzplatten werden gebraucht und bleiben');
  assert.equal(storageCount(state, 'holzstab'), 7);
  assert.equal(storageCount(state, 'steinzahnrad'), 3);
});

test('Abreißen einer Kombi-Maschine gibt Zutaten und Fertiges zurück', () => {
  const { state, machine } = comboLine('zimmerei', 'zahnradwelle', [['holzstab', 30]], [['steinzahnrad', 2]]);
  simulate(state, 60);
  assert.deepEqual(buildingContents(machine), { holzstab: 20, steinzahnrad: 2 });
});

test('Anschlüsse drehen mit: gedrehte Zimmerei hat zwei Eingänge oben', () => {
  const state = emptyGame();
  const machine = placeBuilding(state, 'zimmerei', 20, 10, 1);
  const ins = buildingPorts(machine).filter((p) => p.kind === 'in');
  assert.equal(ins.length, 2);
  assert.ok(ins.every((p) => p.side === 'N'));
});

// ---------- Theken ----------

test('Theken: 2 bis Level 3, dann je Aufstieg eine mehr; alle wachsen mit: klein 20, mittel 25, groß 30 (v0.10.1)', () => {
  const state = createNewGame(1);
  assert.equal(state.counters.length, 2);
  assert.equal(counterSize(state), 20);
  state.shopLevel = 3;
  assert.equal(counterSize(state), 20, 'kleine Theken bis Level 3');
  const sizes = [];
  for (let i = 0; i < 3; i++) {
    // v0.13.0: Aufsteigen braucht Erfahrung aus den Aufträgen und Gold
    state.quest.xp = xpNeeded(state.shopLevel);
    state.gold = 10000;
    levelUp(state);
    sizes.push([state.shopLevel, state.counters.length, counterSize(state)]);
  }
  assert.deepEqual(sizes, [
    [4, 3, 25],
    [5, 4, 30],
    [6, 5, 30],
  ]);
});

test('Auf Level 6 fasst jede Theke 30 Stück – auch die erste', () => {
  const state = createNewGame(5);
  state.shopLevel = 6;
  state.counters = [0, 1, 2, 3, 4].map(() => ({ type: null, count: 0 }));
  state.storage = { holzplatte: 100, holzstab: 100 };
  setCounterItem(state, 0, 'holzplatte');
  setCounterItem(state, 4, 'holzstab');
  assert.equal(fillCounter(state, 0), 30);
  assert.equal(fillCounter(state, 4), 30);
  const before = state.gold;
  serveCustomer(state);
  assert.ok(state.gold > before);
});

test('Laden-Lager: 500 Plätze bis Level 3, ab Level 4 1.000 (v0.10.1)', () => {
  const state = createNewGame(5);
  assert.equal(storageCapacity(state), 500);
  state.shopLevel = 3;
  assert.equal(storageCapacity(state), 500);
  for (const level of [4, 5, 6]) {
    state.shopLevel = level;
    assert.equal(storageCapacity(state), 1000, `Level ${level}`);
  }
});

test('Spielstand aus v0.10.0: Was nicht mehr auf eine Theke passt, kommt ins Laden-Lager', () => {
  const state = createNewGame(6);
  state.shopLevel = 6;
  state.counters = [0, 1, 2, 3, 4].map(() => ({ type: null, count: 0 }));
  state.counters[3] = { type: 'raederwerk', count: 30 };
  state.counters[4] = { type: 'zahnradwelle', count: 35 };
  state.storage = {};
  const loaded = deserializeGame(serializeGame(state));
  assert.deepEqual(loaded.state.counters[3], { type: 'raederwerk', count: 30 });
  assert.deepEqual(loaded.state.counters[4], { type: 'zahnradwelle', count: 30 });
  assert.equal(loaded.state.storage.zahnradwelle, 5, 'nichts geht verloren');
  assert.match(loaded.counterNote, /30 Stück – 5 Waren/);
  assert.equal(deserializeGame(serializeGame(loaded.state)).counterNote, undefined, 'nur einmal');
});

test('Menge einstellen: genau 8 Stück auf die Theke, zu viel kommt zurück ins Lager', () => {
  const state = createNewGame(3);
  state.storage = { holzplatte: 50 };
  setCounterItem(state, 0, 'holzplatte');
  assert.equal(counterMaxFor(state, 0, 'holzplatte'), 20);
  assert.equal(setCounterAmount(state, 0, 8), 8);
  assert.equal(storageCount(state, 'holzplatte'), 42);
  assert.equal(setCounterAmount(state, 0, 3), 3);
  assert.equal(storageCount(state, 'holzplatte'), 47);
  assert.equal(setCounterAmount(state, 0, 100), 20, 'höchstens so viel, wie auf die Theke passt');
  assert.equal(storageCount(state, 'holzplatte'), 30);
  assert.equal(setCounterAmount(state, 0, 0), 0);
  assert.deepEqual(state.counters[0], { type: 'holzplatte', count: 0 }, 'Ware bleibt eingestellt');
  assert.equal(storageCount(state, 'holzplatte'), 50, 'nichts geht verloren');

  // Wenig im Lager: höchstens, was da ist
  state.storage = { holzstab: 6 };
  assert.equal(counterMaxFor(state, 1, 'holzstab'), 6);
  setCounterItem(state, 1, 'holzstab');
  assert.equal(setCounterAmount(state, 1, 10), 6);
  assert.equal(counterMaxFor(state, 1, 'holzstab'), 6, 'Theke + Lager');
});

test('Spielstand: Level 4 mit nur 2 Theken bekommt die dritte beim Laden dazu', () => {
  const state = createNewGame(4);
  state.shopLevel = 4;
  assert.equal(state.counters.length, 2);
  const loaded = deserializeGame(serializeGame(state));
  assert.equal(loaded.state.counters.length, 3);
  assert.deepEqual(loaded.state.counters[2], { type: null, count: 0 });
});
