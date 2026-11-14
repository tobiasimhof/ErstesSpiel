import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace } from '../src/core/belts.js';
import { placeBuilding } from '../src/core/buildings.js';
import { loadInput } from '../src/core/production.js';
import { simulate } from '../src/core/sim.js';
import { footprintSize, buildingPorts } from '../src/core/geometry.js';
import { SAVE_VERSION, deserializeGame, isValidState, serializeGame } from '../src/core/save.js';
import { landOffer } from '../src/core/land.js';
import { WORLD, createNewGame } from '../src/core/state.js';

function sampleGame() {
  const state = createNewGame();
  placeBuilding(state, 'saegewerk', 15, 8, 1);
  let trace = extendTrace([], { x: 12, y: 6 });
  trace = extendTrace(trace, { x: 14, y: 6 });
  applyBeltPath(state, buildBeltPath(state, trace));
  loadInput(state, state.buildings[0]);
  simulate(state, 30); // Waren auf dem Band und im Gebäude
  return state;
}

test('Speichern und Laden ergibt denselben Spielstand', () => {
  const state = sampleGame();
  const loaded = deserializeGame(serializeGame(state, 1234));
  assert.ok(loaded);
  assert.equal(loaded.savedAt, 1234);
  assert.deepEqual(loaded.state, state);
});

test('Waren auf Bändern und Zustand der Gebäude werden mitgespeichert', () => {
  const state = sampleGame();
  assert.ok(Object.values(state.belts).some((b) => b.item), 'Testaufbau hat Waren auf dem Band');
  const loaded = deserializeGame(serializeGame(state));
  assert.deepEqual(loaded.state.belts, state.belts);
  assert.deepEqual(loaded.state.buildings[0].prod, state.buildings[0].prod);
  assert.deepEqual(loaded.state.storage, state.storage);
});

test('Spielstand aus v0.4 (Version 1) wird umgewandelt, die Fabrik bleibt erhalten', () => {
  const v1 = {
    gold: 100,
    shopLevel: 1,
    world: { width: 32, height: 20 },
    plot: { x: 8, y: 5, width: 16, height: 10 },
    buildings: [
      { id: 1, type: 'holzfaeller', x: 10, y: 6, rot: 1 },
      { id: 3, type: 'saegewerk', x: 15, y: 11, rot: 0 },
    ],
    nextBuildingId: 4,
    belts: { '12,6': { outs: ['E'] }, '13,6': { outs: ['E', 'S'] } },
  };
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 1, savedAt: 5, state: v1 }));
  assert.ok(loaded, 'wird angenommen');
  assert.equal(loaded.migratedFrom, 1);
  assert.equal(loaded.state.buildings.length, 2);
  assert.equal(loaded.state.buildings[0].rot, 1);
  assert.deepEqual(loaded.state.belts['13,6'].outs, ['E', 'S']);
  assert.equal(loaded.state.buildings[0].prod.loaded, false);
  assert.equal(loaded.state.buildings[1].prod.recipe, 'holzplatte');
  assert.ok(loaded.state.storage.holzstamm > 0, 'Startvorrat dazu');
});

// Spielstand aus v0.5 (Version 2): Sägewerk und Steinmetz noch 2 × 1, mit Winkeln und Splitt.
function v2Game() {
  return {
    gold: 100,
    shopLevel: 1,
    world: { width: 32, height: 20 },
    plot: { x: 8, y: 5, width: 16, height: 10 },
    buildings: [
      { id: 1, type: 'holzfaeller', x: 10, y: 6, rot: 0, prod: { loaded: false, remaining: 0, timer: 0, out: null, blocked: false } },
      // 1) ungedreht, unten frei → wächst nach unten
      { id: 2, type: 'saegewerk', x: 14, y: 6, rot: 0, prod: { recipe: 'holzwinkel', stock: { holzblock: 3 }, busy: false, timer: 0, out: { type: 'holzwinkel', count: 1 }, blocked: true } },
      // 2) gedreht (Eingang oben), links frei → wächst nach links, Anschlüsse bleiben
      { id: 3, type: 'steinmetz', x: 19, y: 6, rot: 1, prod: { recipe: 'splitt', stock: {}, busy: false, timer: 0, out: null, blocked: false } },
      // 3) ungedreht, darunter ein Lagerhaus → muss rücken
      { id: 4, type: 'saegewerk', x: 14, y: 10, rot: 0, prod: { recipe: 'holzstab', stock: {}, busy: false, timer: 0, out: null, blocked: false } },
      { id: 5, type: 'lagerhaus', x: 14, y: 11, rot: 0, prod: { slots: [{ type: 'splitt', count: 7 }, { type: 'holzblock', count: 2 }], blocked: false } },
    ],
    nextBuildingId: 6,
    belts: { '13,6': { outs: ['E'], item: { type: 'holzwinkel', progress: 0.5, from: 'W' } } },
    storage: { holzstamm: 2, holzwinkel: 10, holzplatte: 1, splitt: 4 },
  };
}

test('Spielstand aus v0.5 (Version 2) wird auf den Techbaum umgestellt', () => {
  const v2 = v2Game();
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 2, savedAt: 5, state: v2 }));
  assert.ok(loaded, 'wird angenommen');
  assert.equal(loaded.migratedFrom, 2);
  const s = loaded.state;
  const byId = (id) => s.buildings.find((b) => b.id === id);

  // Waren umbenannt, Eisenerz dazu
  assert.deepEqual(s.storage, { holzstamm: 2, holzplatte: 11, steinzahnrad: 4, eisenerz: 2 });
  assert.equal(s.belts['13,6'].item.type, 'holzplatte');
  assert.equal(byId(2).prod.recipe, 'holzplatte');
  assert.deepEqual(byId(2).prod.out, { type: 'holzplatte', count: 1 });
  assert.equal(byId(3).prod.recipe, 'steinzahnrad');
  assert.equal(byId(4).prod.recipe, 'holzstab');
  assert.deepEqual(byId(5).prod.slots[0], { type: 'steinzahnrad', count: 7 });

  // 1) wächst nach unten, Anschlüsse bleiben
  assert.deepEqual([byId(2).x, byId(2).y], [14, 6]);
  assert.deepEqual(
    buildingPorts(byId(2)).map((p) => [p.kind, p.outside.x, p.outside.y]),
    [
      ['in', 13, 6],
      ['out', 16, 6],
    ],
  );
  // 2) gedreht: Anschlüsse bleiben bei x = 19
  assert.deepEqual([byId(3).x, byId(3).y], [18, 6]);
  assert.deepEqual(
    buildingPorts(byId(3)).map((p) => [p.kind, p.outside.x, p.outside.y]),
    [
      ['in', 19, 5],
      ['out', 19, 8],
    ],
  );
  // 3) ist gerückt und überlappt nichts
  const moved = byId(4);
  assert.ok(moved, 'nicht abgerissen');
  for (const other of s.buildings) {
    if (other === moved) continue;
    const ox = [other.x, other.x + footprintSize(other.type, other.rot).width];
    const oy = [other.y, other.y + footprintSize(other.type, other.rot).height];
    const overlap = moved.x < ox[1] && moved.x + 2 > ox[0] && moved.y < oy[1] && moved.y + 2 > oy[0];
    assert.equal(overlap, false, `überlappt nicht mit ${other.type}`);
  }
  assert.equal(loaded.notes.length, 1, 'Hinweis auf das versetzte Gebäude');
  assert.ok(isValidState(s));

  // Der umgewandelte Spielstand lässt sich speichern und wieder laden
  const again = deserializeGame(serializeGame(s));
  assert.deepEqual(again.state, s);
  assert.equal(again.migratedFrom, undefined);
});

test('Passt eine gewachsene Maschine nirgends hin, kommt ihr Inhalt ins Laden-Lager', () => {
  const v2 = v2Game();
  v2.buildings = [v2.buildings[1]]; // Sägewerk 2 × 1 bei (14,6)
  v2.storage = {};
  // Alles andere auf dem (gewachsenen) Grundstück ist mit Bändern belegt.
  v2.belts = {};
  for (let y = 5; y < 5 + 14; y++) {
    for (let x = 8; x < 8 + 22; x++) if (!(y === 6 && (x === 14 || x === 15))) v2.belts[`${x},${y}`] = { outs: ['E'] };
  }
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 2, savedAt: 5, state: v2 }));
  assert.ok(loaded);
  assert.equal(loaded.state.buildings.length, 0, 'abgerissen');
  assert.deepEqual(loaded.state.storage, { eisenerz: 2, holzblock: 3, holzplatte: 1 });
  assert.equal(loaded.notes.length, 1);
});

test('Spielstand aus v0.6.0 (Version 3): Grundstück wächst nach rechts und unten, alles bleibt an seinem Platz', () => {
  const v3 = createNewGame();
  v3.world = { width: 32, height: 20 };
  v3.plot = { x: 8, y: 5, width: 16, height: 10 };
  const before = JSON.stringify(v3.buildings);
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 3, savedAt: 5, state: v3 }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 3);
  assert.deepEqual(loaded.state.plot, { x: 8, y: 5, width: 22, height: 14 });
  assert.deepEqual(loaded.state.world, WORLD, 'seit v0.10.2 mit eigener Ecke');
  assert.equal(JSON.stringify(loaded.state.buildings), before, 'Gebäude unverändert');
  assert.deepEqual(loaded.state.storage, v3.storage, 'kein Geschenk doppelt');
  assert.deepEqual(loaded.notes, []);
});

test('Spielstand aus v0.6.1 (Version 4): Fabrik, Gold und Lager bleiben, Theken und Kunden kommen dazu', () => {
  const v4 = sampleGame();
  delete v4.counters;
  delete v4.market;
  v4.gold = 100;
  v4.storage = { holzstamm: 2, holzplatte: 37, minieisenplatte: 12 };
  const before = { buildings: JSON.stringify(v4.buildings), belts: JSON.stringify(v4.belts) };
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 4, savedAt: 5, state: v4 }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 4);
  assert.equal(loaded.state.gold, 200, 'Gold bleibt, dazu 500 Startkapital (v0.9.1), seit v0.23.0 alles durch 3');
  // v0.13.0: Mini-Eisenplatte heißt jetzt Eisenblech
  assert.deepEqual(loaded.state.storage, { holzstamm: 2, holzplatte: 37, eisenblech: 12 });
  assert.equal(JSON.stringify(loaded.state.buildings), before.buildings, 'Gebäude unverändert, nichts nachträglich berechnet');
  assert.equal(JSON.stringify(loaded.state.belts), before.belts);
  assert.equal(loaded.state.counters.length, 2);
  assert.equal(loaded.state.market.timers.length, 2, 'v0.24.0: je Theke ein Kunden-Takt');
  assert.ok(loaded.state.market.timers.every((t) => t > 0));
  assert.deepEqual(loaded.notes, []);
});

test('Spielstand aus v0.7 (Version 5): je 5 Eisennägel werden zu 1 Eisenstange, überall', () => {
  // Wie Tobias' Fabrik: Nägel im Lager, auf einer Theke, im Lagerhaus, auf Bändern und in der Schmiede
  const v5 = createNewGame(9);
  v5.storage = { holzplatte: 30, eisennagel: 140 };
  v5.counters[0] = { type: 'eisennagel', count: 0 };
  v5.counters[1] = { type: 'eisennagel', count: 7 };
  const smithy = placeBuilding(v5, 'schmiede', 16, 12, 0);
  smithy.prod.recipe = 'eisennagel';
  smithy.prod.busy = true;
  smithy.prod.out = { type: 'eisennagel', count: 5 };
  smithy.prod.stock = { eisenbarren: 3 };
  const store = placeBuilding(v5, 'lagerhaus', 20, 12, 0);
  store.prod.slots = [{ type: 'eisennagel', count: 50 }, { type: 'holzblock', count: 4 }, { type: 'eisennagel', count: 3 }];
  v5.belts['12,8'] = { outs: ['E'], item: { type: 'eisennagel', progress: 0.5, from: 'W' } };
  v5.belts['13,8'] = { outs: ['E'], item: { type: 'eisennagel', progress: 1, from: 'W' } };
  v5.belts['14,8'] = { outs: ['E'], item: { type: 'holzblock', progress: 1, from: 'W' } };
  v5.market.sales = [
    { id: 3, items: { eisennagel: 2 }, gold: 28 },
    { id: 2, items: { eisennagel: 1, steinzahnrad: 2 }, gold: 50 },
  ];
  v5.market.nextSaleId = 4;
  v5.gold = 3100;

  const loaded = deserializeGame(JSON.stringify({ saveVersion: 5, savedAt: 5, state: v5 }));
  assert.ok(loaded, 'wird angenommen');
  assert.equal(loaded.migratedFrom, 5);
  const s = loaded.state;
  // Lager 140 + Bänder 2 = 142 Nägel → 29 Stangen (aufgerundet)
  assert.deepEqual(s.storage, { holzplatte: 30, eisenstange: 29 });
  assert.deepEqual(s.counters, [
    { type: 'eisenstange', count: 0 },
    { type: 'eisenstange', count: 2 },
  ]);
  const smithyNow = s.buildings.find((b) => b.type === 'schmiede');
  assert.equal(smithyNow.prod.recipe, 'eisenstange');
  assert.deepEqual(smithyNow.prod.out, { type: 'eisenstange', count: 1 });
  assert.deepEqual(smithyNow.prod.stock, { eisenbarren: 3 });
  assert.deepEqual(s.buildings.find((b) => b.type === 'lagerhaus').prod.slots, [
    { type: 'eisenstange', count: 10 },
    { type: 'holzblock', count: 4 },
    { type: 'eisenstange', count: 1 },
  ]);
  assert.equal(s.belts['12,8'].item, null);
  assert.equal(s.belts['13,8'].item, null);
  assert.equal(s.belts['14,8'].item.type, 'holzblock');
  assert.deepEqual(s.market.sales, [{ id: 2, items: { steinzahnrad: 2 }, gold: 17 }], 'v0.23.0: 50 Gold durch 3');
  assert.equal(s.gold, 1200, 'Gold bleibt, dazu 500 Startkapital (v0.9.1), seit v0.23.0 alles durch 3');
  // 140 + 2 (Bänder) + 7 (Theke) + 5 (Schmiede) + 53 (Lagerhaus) = 207 Nägel
  assert.deepEqual(loaded.notes, ['207 Eisennägel wurden zu 43 Eisenstangen.']);
});

test('Spielstand ohne Nägel: keine Umwandlungs-Meldung', () => {
  const v5 = createNewGame(4);
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 5, savedAt: 5, state: v5 }));
  assert.ok(loaded);
  assert.deepEqual(loaded.notes, []);
  assert.deepEqual(loaded.state.storage, v5.storage);
});

test('Spielstand aus v0.8 (Version 6): bestehende Fabrik bekommt Level 3, nichts wird gesperrt', () => {
  // Wie Tobias' Fabrik: Holz, Stein und Eisen stehen schon
  const v6 = createNewGame(6);
  placeBuilding(v6, 'steinbruch', 10, 12, 0);
  placeBuilding(v6, 'schmelzhuette', 16, 12, 0);
  placeBuilding(v6, 'schmiede', 20, 12, 0);
  v6.gold = 2978;
  v6.storage = { holzplatte: 30, eisenstange: 28, felsbrocken: 1 };
  delete v6.produced;
  delete v6.landBought;
  const before = { buildings: JSON.stringify(v6.buildings), belts: JSON.stringify(v6.belts), plot: { ...v6.plot } };
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 6, savedAt: 5, state: v6 }));
  assert.ok(loaded, 'wird angenommen');
  assert.equal(loaded.migratedFrom, 6);
  const s = loaded.state;
  assert.equal(s.shopLevel, 3);
  assert.deepEqual(s.produced, {});
  assert.equal(s.landBought, 0);
  assert.equal(s.gold, 1159, 'Gold bleibt, dazu 500 Startkapital (v0.9.1), seit v0.23.0 alles durch 3 (3.478 / 3)');
  assert.deepEqual(s.storage, { holzplatte: 30, eisenstange: 28, felsbrocken: 1 }, 'kein Geschenk, nichts weg');
  assert.equal(JSON.stringify(s.buildings), before.buildings);
  assert.equal(JSON.stringify(s.belts), before.belts);
  assert.deepEqual(s.plot, before.plot);
  assert.deepEqual(loaded.notes, []);
});

test('Spielstand aus v0.9.0 (Version 7): 500 Gold Startkapital werden einmalig nachgezahlt', () => {
  // Wie Tobias' Testspiel: Level 2, 372 Gold, Felsbrocken im Lager
  const v7 = createNewGame(7);
  v7.gold = 372;
  v7.shopLevel = 2;
  v7.produced = { holzblock: 200, holzplatte: 12, holzstab: 11 };
  v7.storage = { felsbrocken: 1 };
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 7, savedAt: 5, state: v7 }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 7);
  assert.equal(loaded.state.gold, 291, '372 + 500, seit v0.23.0 durch 3');
  assert.equal(loaded.state.shopLevel, 2, 'Level bleibt');
  assert.deepEqual(loaded.state.produced, v7.produced, 'Zähler bleiben');
  assert.deepEqual(loaded.state.storage, { felsbrocken: 1 });
  assert.deepEqual(loaded.notes, []);
  // Nur einmal: erneut speichern und laden gibt nichts mehr dazu
  const again = deserializeGame(serializeGame(loaded.state));
  assert.equal(again.state.gold, 291);
  assert.equal(again.migratedFrom, undefined);
});

// Spielstand aus v0.10.1 mit gekaufter Fläche: rechts 2 + 4 Spalten, oben 5 Reihen
// (bis an den damaligen Rand bei y = 0), Welt 40 × 26 ohne eigene Ecke.
function v8Game() {
  const v8 = createNewGame(8);
  v8.shopLevel = 4;
  v8.gold = 1234;
  v8.world = { width: 40, height: 26 };
  v8.plot = { x: 8, y: 0, width: 28, height: 19 };
  v8.landBought = 5;
  return v8;
}

test('Spielstand aus v0.10.1 (Version 8): Welt bekommt eine Ecke, gekaufte Fläche und Fabrik bleiben', () => {
  const v8 = v8Game();
  const before = JSON.stringify({ buildings: v8.buildings, belts: v8.belts });
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 8, savedAt: 5, state: v8 }));
  assert.ok(loaded);
  assert.equal(loaded.migratedFrom, 8);
  const s = loaded.state;
  assert.deepEqual(s.world, { x: 0, y: -3, width: 38, height: 30 });
  assert.deepEqual(s.plot, v8.plot, 'Grundstück unverändert');
  assert.equal(JSON.stringify({ buildings: s.buildings, belts: s.belts }), before, 'Gebäude und Bänder unverändert');
  assert.deepEqual([s.gold, s.shopLevel, s.landBought], [411, 4, 5], 'kein Startkapital doppelt (1.234 / 3), Level bleibt');
  assert.deepEqual(loaded.notes, []);
  // Was schon gekauft ist, zählt mit: rechts noch 2 Spalten (Rest, 90 Gold),
  // oben noch 3 Reihen (130 Gold), links und unten je 2 volle Streifen (170).
  assert.deepEqual([landOffer(s, 'E').depth, landOffer(s, 'E').price], [2, 90]);
  assert.deepEqual([landOffer(s, 'N').depth, landOffer(s, 'N').price], [3, 130]);
  assert.deepEqual([landOffer(s, 'W').depth, landOffer(s, 'W').price], [4, 170]);
  assert.deepEqual([landOffer(s, 'S').depth, landOffer(s, 'S').price], [4, 170]);
});

test('Spielstand aus v0.10.1, der schon weiter reicht: die Welt wächst mit, nichts geht verloren', () => {
  const v8 = v8Game();
  v8.plot = { x: 8, y: 5, width: 32, height: 21 }; // rechts bis x = 40, unten bis y = 26
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 8, savedAt: 5, state: v8 }));
  assert.ok(loaded);
  assert.deepEqual(loaded.state.world, { x: 0, y: -3, width: 40, height: 30 });
  assert.deepEqual(loaded.state.plot, v8.plot);
  assert.equal(landOffer(loaded.state, 'E'), null, 'rechts ist nichts mehr zu kaufen');
  // unten reicht die Welt jetzt bis y = 27 (Start 19 + 8): noch 1 Reihe für 40 Gold
  assert.deepEqual([landOffer(loaded.state, 'S').depth, landOffer(loaded.state, 'S').price], [1, 40]);
});

test('Ungültiges Level, Zähler oder Flächenkäufe werden erkannt', () => {
  const bad = (change) => {
    const s = createNewGame();
    change(s);
    return isValidState(s);
  };
  assert.equal(bad(() => {}), true);
  assert.equal(bad((s) => (s.shopLevel = 9)), true);
  assert.equal(bad((s) => (s.shopLevel = 10)), false);
  assert.equal(bad((s) => (s.shopLevel = 0)), false);
  assert.equal(bad((s) => (s.produced = { holzblock: -1 })), false);
  assert.equal(bad((s) => (s.produced = { unbekannt: 1 })), false);
  assert.equal(bad((s) => delete s.produced), false);
  assert.equal(bad((s) => (s.landBought = 1.5)), false);
  assert.equal(bad((s) => delete s.landBought), false);
  assert.equal(bad((s) => delete s.world.y), false, 'Welt ohne Ecke');
  assert.equal(bad((s) => (s.plot.y = -4)), false, 'Grundstück ragt oben aus der Welt');
  assert.equal(bad((s) => (s.plot.width = 31)), false, 'Grundstück ragt rechts aus der Welt');
  assert.equal(bad((s) => (s.plot = { ...s.world })), true, 'ganze Welt gekauft');
});

test('Neues Spiel startet mit 22 × 14 Feldern', () => {
  const s = createNewGame();
  assert.deepEqual([s.plot.width, s.plot.height], [22, 14]);
  const w = s.world;
  assert.ok(s.plot.x > w.x && s.plot.y > w.y, 'gesperrte Fläche links und oben');
  assert.ok(s.plot.x + s.plot.width < w.x + w.width && s.plot.y + s.plot.height < w.y + w.height, 'gesperrte Fläche rechts und unten');
});

test('Kaputte oder fremde Daten werden abgelehnt', () => {
  assert.equal(deserializeGame('kein json'), null);
  assert.equal(deserializeGame('null'), null);
  assert.equal(deserializeGame(JSON.stringify({ saveVersion: SAVE_VERSION + 1, state: createNewGame() })), null);
  assert.equal(deserializeGame(JSON.stringify({ saveVersion: SAVE_VERSION })), null);
});

test('Spielstand aus v0.22 (Version 15): Preise durch 3 – Gold und letzte Verkäufe auch, sonst bleibt alles', () => {
  // Wie Tobias' Fabrik (Chat 17): Level 8, 43.870 Gold, Aufträge über den Test-Knopf
  const v15 = createNewGame(15);
  v15.shopLevel = 8;
  v15.gold = 43870;
  v15.storage = { zirkel: 10, scharnier: 5, holzplatte: 40 };
  v15.quest = { index: 4, xp: 1400 };
  v15.xpTotal = 8000;
  v15.market.sales = [
    { id: 2, items: { zirkel: 2 }, gold: 3974 },
    { id: 1, items: { holzplatte: 1 }, gold: 18 },
  ];
  v15.market.nextSaleId = 3;
  const loaded = deserializeGame(JSON.stringify({ saveVersion: 15, savedAt: 1, state: v15 }));
  assert.ok(loaded, 'Spielstand gültig');
  assert.equal(loaded.migratedFrom, 15);
  const s = loaded.state;
  assert.equal(s.gold, 14623, '43.870 / 3, gerundet');
  assert.deepEqual(
    s.market.sales.map((sale) => sale.gold),
    [1325, 6],
  );
  assert.deepEqual(s.storage, v15.storage, 'Waren bleiben');
  assert.deepEqual([s.shopLevel, s.quest, s.xpTotal], [8, { index: 4, xp: 1400 }, 8000], 'Level und Erfahrung bleiben');
  assert.deepEqual(loaded.notes, []);
  // Nur einmal: erneut speichern und laden teilt nicht noch einmal
  const again = deserializeGame(serializeGame(s));
  assert.equal(again.migratedFrom, undefined);
  assert.equal(again.state.gold, 14623);
});

test('Ungültige Inhalte im Spielstand werden erkannt', () => {
  const cases = {
    'unbekanntes Gebäude': (s) => (s.buildings[0].type = 'raumschiff'),
    'doppelte ID': (s) => (s.buildings[1].id = s.buildings[0].id),
    'Drehung ungültig': (s) => (s.buildings[0].rot = 7),
    'Band ohne Ausgang': (s) => (s.belts['12,6'].outs = []),
    'Band-Richtung ungültig': (s) => (s.belts['12,6'].outs = ['X']),
    'Band-Schlüssel ungültig': (s) => (s.belts['a,b'] = { outs: ['E'] }),
    'Gold fehlt': (s) => delete s.gold,
    'Grundstück außerhalb der Welt': (s) => (s.plot.width = 999),
    'nextBuildingId zu klein': (s) => (s.nextBuildingId = 1),
    'Laden-Lager fehlt': (s) => delete s.storage,
    'unbekannte Ware im Lager': (s) => (s.storage.gold = 5),
    'Ware auf Band ungültig': (s) => (s.belts['12,6'].item = { type: 'holzblock', progress: 2, from: 'W' }),
    'Gebäudezustand fehlt': (s) => delete s.buildings[0].prod,
    'Rezept passt nicht zum Gebäude': (s) => (s.buildings.find((b) => b.type === 'saegewerk').prod.recipe = 'steinplatte'),
    'alte Ware in aktuellem Spielstand': (s) => (s.storage.holzwinkel = 3),
  };
  for (const [name, breakIt] of Object.entries(cases)) {
    const state = sampleGame();
    breakIt(state);
    assert.equal(deserializeGame(serializeGame(state)), null, name);
  }
});
