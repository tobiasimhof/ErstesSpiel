// v0.10.0: Kombi-Maschinen mit zwei Eingängen (Techbaum, Teil 2) und
// mitwachsende Verkaufstheken mit einstellbarer Menge.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { COUNTER_SIZES } from '../src/core/data/shop.js';
import { buildingPorts } from '../src/core/geometry.js';
import { levelUp, producedCount } from '../src/core/levels.js';
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
  workshopInputs,
} from '../src/core/production.js';
import { deserializeGame, serializeGame } from '../src/core/save.js';
import { storageCount } from '../src/core/shop.js';
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
  assert.deepEqual(BUILDINGS.zimmerei.production.recipes, ['handkurbel', 'schalter', 'verstaerkteholzplatte']);
  assert.deepEqual(BUILDINGS.feinschmiede.production.recipes, ['scharnier', 'eisenfeder', 'kugellager']);
  assert.deepEqual(BUILDINGS.schlosserei.production.recipes, ['steinkette', 'regler', 'minischloss']);
});

test('Rezepte aus Grundteilen: 10 + 5 Stück, zwei verschiedene Zutaten, jedes Rezept anders', () => {
  const basic = ['handkurbel', 'schalter', 'verstaerkteholzplatte', 'scharnier', 'eisenfeder', 'steinkette'];
  const seen = new Set();
  for (const key of basic) {
    const r = RECIPES[key];
    assert.deepEqual(Object.values(r.inputs), [10, 5], key);
    const sig = JSON.stringify(r.inputs);
    assert.ok(!seen.has(sig), `${key}: eigenes Rezept`);
    seen.add(sig);
  }
  // Tobias' Beispiel
  assert.deepEqual(RECIPES.handkurbel.inputs, { holzstab: 10, steinzahnrad: 5 });
  assert.deepEqual(RECIPES.schalter.inputs, { steinzahnrad: 10, holzstab: 5 });
  // Steinkette aus Steinplatten – sonst bräuchte kein neues Rezept die Steinplatte
  assert.deepEqual(RECIPES.steinkette.inputs, { steinplatte: 10, eisenstange: 5 });
  // Jedes Grundteil wird von mindestens einem neuen Rezept gebraucht
  for (const part of ['holzplatte', 'holzstab', 'steinplatte', 'steinzahnrad', 'minieisenplatte', 'eisenstange']) {
    assert.ok(basic.some((key) => RECIPES[key].inputs[part]), `${part} wird gebraucht`);
  }
});

test('Werte der neuen Waren: Zutaten + 20 % (Tabelle in der README)', () => {
  const expected = {
    handkurbel: 324,
    schalter: 324,
    verstaerkteholzplatte: 648,
    scharnier: 1296,
    eisenfeder: 1296,
    kugellager: 1987,
    steinkette: 648,
    regler: 778,
    minischloss: 1944,
  };
  for (const [type, price] of Object.entries(expected)) {
    assert.equal(ITEMS[type].price, price, type);
    const r = RECIPES[type];
    const inValue = Object.entries(r.inputs).reduce((s, [t, n]) => s + n * ITEMS[t].price, 0);
    assert.equal(price, Math.round(inValue * 1.2), `${type}: ${inValue} + 20 %`);
  }
});

// ---------- Zwei Eingänge ----------

test('Zimmerei: Holzstäbe oben, Stein-Zahnräder unten → Handkurbeln', () => {
  const { state, machine } = comboLine('zimmerei', 'handkurbel', [['holzstab', 30]], [['steinzahnrad', 15]]);
  assert.equal(machine.prod.recipe, 'handkurbel');
  simulate(state, 200);
  assert.equal(storageCount(state, 'handkurbel'), 3, '30 Stäbe + 15 Zahnräder → 3 Handkurbeln');
  assert.equal(producedCount(state, 'handkurbel'), 3, 'zählt fürs Level');
  assert.deepEqual(machine.prod.stock, { holzstab: 0, steinzahnrad: 0 });
  assert.equal(buildingStatus(state, machine).level, 'idle');
});

test('Jeder Eingang nimmt jede passende Zutat (auch vertauscht)', () => {
  const { state } = comboLine('zimmerei', 'schalter', [['steinzahnrad', 10]], [['holzstab', 5]]);
  simulate(state, 100);
  assert.equal(storageCount(state, 'schalter'), 1);
});

test('Schlosserei: Mini-Schloss aus Scharnier + Schalter, Regler aus Handkurbel + Schalter', () => {
  const lock = comboLine('schlosserei', 'minischloss', [['scharnier', 2]], [['schalter', 2]]);
  simulate(lock.state, 120);
  assert.equal(storageCount(lock.state, 'minischloss'), 2);

  const reg = comboLine('schlosserei', 'regler', [['handkurbel', 1]], [['schalter', 1]]);
  simulate(reg.state, 60);
  assert.equal(storageCount(reg.state, 'regler'), 1);
});

test('Feinschmiede: Kugellager aus 1 Scharnier + 5 Eisenstangen', () => {
  const { state } = comboLine('feinschmiede', 'kugellager', [['eisenstange', 10]], [['scharnier', 2]]);
  simulate(state, 120);
  assert.equal(storageCount(state, 'kugellager'), 2);
});

test('Fehlt eine Zutat, zeigt die Maschine welche und wie viel – ohne Stau', () => {
  const { state, machine } = comboLine('zimmerei', 'handkurbel', [['holzstab', 30]], [['steinzahnrad', 2]]);
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
  const { state, machine } = comboLine('zimmerei', 'handkurbel', [['holzstab', 30], ['steinzahnrad', 5]], null);
  simulate(state, 120);
  assert.equal(machine.prod.stock.holzstab, 20, 'mehr Stäbe nimmt sie nicht auf');
  assert.equal(machine.prod.stock.steinzahnrad ?? 0, 0, 'die Zahnräder kommen nie an');
  assert.equal(inputJam(state, machine), 'holzstab');
  const status = buildingStatus(state, machine);
  assert.equal(status.level, 'blocked');
  assert.match(status.text, /Eingang blockiert.*Holzstab.*Stein-Zahnrad/);
});

test('Falsche Ware am Eingang: Das Infofenster sagt, dass sie hier nicht gebraucht wird', () => {
  const { state, machine } = comboLine('zimmerei', 'handkurbel', [['holzblock', 5]], null);
  simulate(state, 30);
  assert.equal(inputJam(state, machine), 'holzblock');
  assert.deepEqual(buildingStatus(state, machine), {
    level: 'blocked',
    text: 'Eingang blockiert: Holzblock wird hier nicht gebraucht.',
  });
});

test('Umstellen: Zutaten, die das neue Rezept nicht braucht, kommen ins Laden-Lager', () => {
  const state = emptyGame();
  const machine = placeBuilding(state, 'zimmerei', 20, 10, 0);
  machine.prod.stock = { holzstab: 7, steinzahnrad: 3 };
  setRecipe(machine, 'schalter');
  assert.deepEqual(returnUnusedStock(state, machine), {}, 'Schalter braucht beides');
  setRecipe(machine, 'verstaerkteholzplatte');
  assert.deepEqual(returnUnusedStock(state, machine), { holzstab: 7, steinzahnrad: 3 });
  assert.deepEqual(machine.prod.stock, {});
  assert.equal(storageCount(state, 'holzstab'), 7);
  assert.equal(storageCount(state, 'steinzahnrad'), 3);
});

test('Abreißen einer Kombi-Maschine gibt Zutaten und Fertiges zurück', () => {
  const { state, machine } = comboLine('zimmerei', 'handkurbel', [['holzstab', 30]], [['steinzahnrad', 2]]);
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

test('Theken: 2 bis Level 3, dann je Aufstieg eine mehr – auf Level 6 sind es 5', () => {
  const state = createNewGame(1);
  assert.equal(state.counters.length, 2);
  state.shopLevel = 3;
  state.produced = { minieisenplatte: 1, eisenstange: 1, handkurbel: 1, schalter: 1, scharnier: 1, eisenfeder: 1 };
  levelUp(state);
  assert.equal(state.counters.length, 3);
  levelUp(state);
  levelUp(state);
  assert.equal(state.shopLevel, 6);
  assert.equal(state.counters.length, 5);
  assert.deepEqual(
    state.counters.map((_, i) => counterSize(state, i)),
    [20, 20, 25, 30, 35],
    'jede neue Theke fasst 5 mehr',
  );
  assert.deepEqual(COUNTER_SIZES, [20, 20, 25, 30, 35]);
});

test('Theke 5 fasst 35 Stück, Kunden kaufen auch dort', () => {
  const state = createNewGame(5);
  state.shopLevel = 6;
  state.counters = [0, 1, 2, 3, 4].map(() => ({ type: null, count: 0 }));
  state.storage = { holzplatte: 100 };
  setCounterItem(state, 4, 'holzplatte');
  assert.equal(fillCounter(state, 4), 35);
  const before = state.gold;
  serveCustomer(state);
  assert.ok(state.gold > before);
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
