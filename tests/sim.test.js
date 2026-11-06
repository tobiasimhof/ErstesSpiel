import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyBeltPath, buildBeltPath, extendTrace, removeBelt } from '../src/core/belts.js';
import { placeBuilding, removeBuilding } from '../src/core/buildings.js';
import { ITEMS } from '../src/core/data/items.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { buildingPorts } from '../src/core/geometry.js';
import { buildingContents, buildingStatus, loadInput, setRecipe } from '../src/core/production.js';
import { storageCount } from '../src/core/shop.js';
import { simulate } from '../src/core/sim.js';
import { beltAt, createNewGame } from '../src/core/state.js';

function emptyGame() {
  const state = createNewGame();
  state.buildings = [];
  state.storage = { holzstamm: 5, felsbrocken: 5, eisenerz: 2 };
  return state;
}

function drag(state, points) {
  let trace = [];
  for (const [x, y] of points) trace = extendTrace(trace, { x, y });
  applyBeltPath(state, buildBeltPath(state, trace));
}

const beltItems = (state) => Object.values(state.belts).filter((b) => b.item).length;

// Holzfäller (10,6)-(11,7), Ausgang bei (12,6) → Band nach rechts → Ziel ab x=end+1
function woodLine(state, end = 16) {
  const wood = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  drag(state, [
    [12, 6],
    [end, 6],
  ]);
  return wood;
}

test('Holzfällerlager braucht einen Holzstamm und nimmt nur einen auf einmal', () => {
  const state = emptyGame();
  const wood = woodLine(state);
  assert.equal(buildingStatus(state, wood).level, 'idle');
  assert.ok(loadInput(state, wood));
  assert.equal(storageCount(state, 'holzstamm'), 4);
  assert.equal(loadInput(state, wood), false, 'zweiter Stamm passt nicht');
  assert.equal(storageCount(state, 'holzstamm'), 4);
  state.storage = {};
  const other = placeBuilding(state, 'holzfaeller', 10, 9, 0);
  assert.equal(loadInput(state, other), false, 'ohne Vorrat geht nichts');
});

test('Holzblöcke laufen über das Band ins Versandportal und landen im Laden-Lager', () => {
  const state = emptyGame();
  const wood = woodLine(state, 16);
  placeBuilding(state, 'versandportal', 17, 6, 0); // Eingang links bei (17,6) ← Band (16,6)
  loadInput(state, wood);
  simulate(state, 90);
  const shipped = storageCount(state, 'holzblock');
  // 90 s / 4,5 s = 20 Blöcke hergestellt, ein paar sind noch unterwegs
  assert.ok(shipped >= 15 && shipped <= 20, `im Laden: ${shipped}`);
  assert.equal(wood.prod.remaining, 200 - shipped - beltItems(state) - (wood.prod.out ? 1 : 0));
});

test('Ein Holzstamm ergibt genau 200 Holzblöcke', () => {
  const state = emptyGame();
  const wood = woodLine(state, 16);
  placeBuilding(state, 'versandportal', 17, 6, 0);
  loadInput(state, wood);
  simulate(state, 1000);
  assert.equal(storageCount(state, 'holzblock'), 200);
  assert.equal(wood.prod.loaded, false);
  assert.equal(buildingStatus(state, wood).level, 'idle');
});

test('Stau: Endet das Band im Nichts, steht die Produktion still', () => {
  const state = emptyGame();
  const wood = woodLine(state, 15); // 4 Felder, kein Ziel
  loadInput(state, wood);
  simulate(state, 300);
  assert.equal(beltItems(state), 4, 'alle Felder voll');
  assert.ok(wood.prod.out, 'eine fertige Ware wartet im Gebäude');
  assert.equal(buildingStatus(state, wood).level, 'blocked');
  const remaining = wood.prod.remaining;
  simulate(state, 300);
  assert.equal(wood.prod.remaining, remaining, 'kein weiterer Verbrauch');
});

test('Aufteilen verteilt abwechselnd auf beide Strecken', () => {
  const state = emptyGame();
  const wood = woodLine(state, 16);
  placeBuilding(state, 'versandportal', 17, 6, 0);
  // Abzweig bei (14,6) nach unten in ein zweites Portal bei (14,9), einmal
  // gedreht: sein Eingang zeigt nach oben zum Band (14,8)
  drag(state, [
    [14, 6],
    [14, 8],
  ]);
  placeBuilding(state, 'versandportal', 14, 9, 1);
  loadInput(state, wood);
  simulate(state, 400);
  const portals = state.buildings.filter((b) => b.type === 'versandportal');
  const [a, b] = portals.map((p) => p.prod.shipped);
  assert.ok(a + b > 60, `versendet: ${a} + ${b}`);
  assert.ok(Math.abs(a - b) <= 2, `ungleich verteilt: ${a} / ${b}`);
});

test('Ist eine Strecke voll, läuft alles über die andere weiter', () => {
  const state = emptyGame();
  const wood = woodLine(state, 16);
  placeBuilding(state, 'versandportal', 17, 6, 0);
  drag(state, [
    [14, 6],
    [14, 8],
  ]); // Abzweig endet im Nichts
  loadInput(state, wood);
  simulate(state, 400);
  assert.equal(beltAt(state, 14, 7).item?.type, 'holzblock', 'Abzweig hat sich gefüllt');
  assert.ok(storageCount(state, 'holzblock') > 70, `Hauptstrecke läuft weiter: ${storageCount(state, 'holzblock')}`);
});

test('Zusammenführen nimmt abwechselnd von beiden Seiten', () => {
  const state = emptyGame();
  const w1 = placeBuilding(state, 'holzfaeller', 10, 6, 0); // Ausgang (12,6)
  const w2 = placeBuilding(state, 'holzfaeller', 10, 9, 0); // Ausgang (12,9)
  drag(state, [
    [12, 6],
    [16, 6],
  ]);
  drag(state, [
    [12, 9],
    [14, 9],
    [14, 7],
    [14, 6],
  ]); // läuft von unten in (14,6)
  // Ziel am Ende der Hauptstrecke ist zu klein → Stau; prüfen, dass beide Quellen etwas loswerden
  placeBuilding(state, 'versandportal', 17, 6, 0);
  loadInput(state, w1);
  loadInput(state, w2);
  simulate(state, 450);
  const used1 = 200 - w1.prod.remaining;
  const used2 = 200 - w2.prod.remaining;
  assert.ok(used1 > 50 && used2 > 50, `beide liefern: ${used1} / ${used2}`);
  assert.ok(Math.abs(used1 - used2) <= 3, `abwechselnd: ${used1} / ${used2}`);
});

test('Sägewerk macht aus 5 Holzblöcken eine Holzplatte oder einen Stab', () => {
  const state = emptyGame();
  const wood = woodLine(state, 13); // Band (12,6),(13,6)
  const saw = placeBuilding(state, 'saegewerk', 14, 6, 0); // 2 × 2: Eingang W bei (14,6), Ausgang E bei (15,6)→(16,6)
  drag(state, [
    [16, 6],
    [17, 6],
  ]);
  placeBuilding(state, 'versandportal', 18, 6, 0);
  loadInput(state, wood);
  simulate(state, 1000);
  assert.equal(storageCount(state, 'holzplatte'), 40, '200 Blöcke → 40 Holzplatten');
  assert.equal(storageCount(state, 'holzblock'), 0);

  setRecipe(saw, 'holzstab');
  assert.equal(saw.prod.recipe, 'holzstab');
  loadInput(state, wood);
  simulate(state, 1000);
  assert.equal(storageCount(state, 'holzstab'), 40);
});

test('Steinmetz macht Platten oder Stein-Zahnräder aus Steinblöcken', () => {
  const state = emptyGame();
  const stone = placeBuilding(state, 'steinbruch', 10, 6, 0);
  drag(state, [
    [12, 6],
    [13, 6],
  ]);
  const mason = placeBuilding(state, 'steinmetz', 14, 6, 0);
  setRecipe(mason, 'steinzahnrad');
  drag(state, [
    [16, 6],
    [17, 6],
  ]);
  placeBuilding(state, 'versandportal', 18, 6, 0);
  loadInput(state, stone);
  simulate(state, 1000);
  assert.equal(storageCount(state, 'steinzahnrad'), 40);
});

// Schmelzhütte (10,6) → Band (12,6),(13,6) → Schmiede (14,6)-(15,7) → Band (16,6),(17,6) → Versandportal (18,6)
function ironLine(state) {
  const smelter = placeBuilding(state, 'schmelzhuette', 10, 6, 0);
  drag(state, [
    [12, 6],
    [13, 6],
  ]);
  const smithy = placeBuilding(state, 'schmiede', 14, 6, 0);
  drag(state, [
    [16, 6],
    [17, 6],
  ]);
  placeBuilding(state, 'versandportal', 18, 6, 0);
  return { smelter, smithy };
}

test('Eisen-Kette: Schmelzhütte macht 200 Eisenbarren, Schmiede 40 Mini-Eisenplatten', () => {
  const state = emptyGame();
  const { smelter, smithy } = ironLine(state);
  assert.equal(smithy.prod.recipe, 'minieisenplatte', 'Schmiede startet mit Platten');
  assert.ok(loadInput(state, smelter));
  assert.equal(loadInput(state, smelter), false, 'nur ein Eisenerz auf einmal');
  assert.equal(storageCount(state, 'eisenerz'), 1);
  simulate(state, 1000);
  assert.equal(storageCount(state, 'minieisenplatte'), 40, '200 Barren → 40 Mini-Eisenplatten');
  assert.equal(storageCount(state, 'eisenbarren'), 0);
});

test('Schmiede macht aus 5 Eisenbarren 5 Eisennägel', () => {
  const state = emptyGame();
  const { smelter, smithy } = ironLine(state);
  setRecipe(smithy, 'eisennagel');
  loadInput(state, smelter);
  simulate(state, 1000);
  assert.equal(storageCount(state, 'eisennagel'), 200, '200 Barren → 200 Nägel');
  assert.equal(storageCount(state, 'eisenerz'), 1);
});

test('Falsche Ware kommt nicht in die Werkstatt – das Band staut sich', () => {
  const state = emptyGame();
  const stone = placeBuilding(state, 'steinbruch', 10, 6, 0);
  drag(state, [
    [12, 6],
    [13, 6],
  ]);
  const saw = placeBuilding(state, 'saegewerk', 14, 6, 0);
  loadInput(state, stone);
  simulate(state, 60);
  assert.deepEqual(saw.prod.stock, {}, 'Sägewerk nimmt keine Steinblöcke');
  assert.equal(beltItems(state), 2);
  assert.equal(buildingStatus(state, stone).level, 'blocked');
});

// Holzfäller (10,6) → Band (12,6),(13,6) → von oben ins Lagerhaus (13,7)-(14,7);
// Ausgang unten rechts bei (14,7) → Feld (14,8)
function woodIntoStore(state) {
  const wood = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  const store = placeBuilding(state, 'lagerhaus', 13, 7, 0);
  drag(state, [
    [12, 6],
    [13, 6],
    [13, 7],
  ]);
  return { wood, store };
}

test('Lagerhaus ist 2 × 1: Eingang oben links, Ausgang unten rechts', () => {
  const store = { id: 1, type: 'lagerhaus', x: 13, y: 7, rot: 0 };
  const ports = buildingPorts(store).map((p) => [p.kind, p.side, p.outside.x, p.outside.y]);
  assert.deepEqual(ports, [
    ['in', 'N', 13, 6],
    ['out', 'S', 14, 8],
  ]);
});

test('Versandportal hat genau einen Eingang, der mitdreht', () => {
  const portal = { id: 1, type: 'versandportal', x: 14, y: 9, rot: 0 };
  assert.deepEqual(buildingPorts(portal).map((p) => [p.kind, p.side]), [['in', 'W']]);
  portal.rot = 1;
  assert.deepEqual(buildingPorts(portal).map((p) => [p.kind, p.side]), [['in', 'N']]);
});

test('Lagerhaus puffert bis 3 × 50 und gibt weiter, sobald Platz ist', () => {
  const state = emptyGame();
  const { wood, store } = woodIntoStore(state);
  loadInput(state, wood);
  simulate(state, 1000); // Ausgang ohne Band → alles bleibt im Lager
  const total = store.prod.slots.reduce((s, x) => s + x.count, 0);
  assert.equal(total, 150, 'drei Fächer zu je 50');
  assert.deepEqual(store.prod.slots.map((s) => s.count), [50, 50, 50]);
  assert.equal(buildingStatus(state, store).level, 'blocked');

  // Jetzt ein Band zum Portal anschließen → das Lager leert sich
  drag(state, [
    [14, 8],
    [14, 9],
  ]);
  placeBuilding(state, 'versandportal', 14, 10, 1); // Eingang oben
  simulate(state, 600);
  assert.ok(storageCount(state, 'holzblock') >= 190, `im Laden: ${storageCount(state, 'holzblock')}`);
});

test('Abreißen gibt Waren ins Laden-Lager zurück, ein angefangener Stamm geht verloren', () => {
  const state = emptyGame();
  const { wood, store } = woodIntoStore(state);
  loadInput(state, wood);
  simulate(state, 120);
  const inStore = store.prod.slots.reduce((s, x) => s + x.count, 0);
  const onBelt = beltItems(state);
  const before = storageCount(state, 'holzblock');
  removeBuilding(state, store.id);
  assert.equal(storageCount(state, 'holzblock'), before + inStore);
  removeBelt(state, 12, 6);
  removeBelt(state, 13, 6);
  assert.equal(storageCount(state, 'holzblock'), before + inStore + onBelt);
  const logs = storageCount(state, 'holzstamm');
  assert.deepEqual(Object.keys(buildingContents(wood)).includes('holzstamm'), false);
  removeBuilding(state, wood.id);
  assert.equal(storageCount(state, 'holzstamm'), logs, 'angefangener Stamm kommt nicht zurück');

  const fresh = placeBuilding(state, 'holzfaeller', 10, 6, 0);
  loadInput(state, fresh);
  removeBuilding(state, fresh.id);
  assert.equal(storageCount(state, 'holzstamm'), logs, 'unberührter Stamm kommt zurück');
});

test('Wirtschaft: Jede Stufe bringt mehr als ihre Zutaten (Preistabelle)', () => {
  // Rohstoff → Blöcke: knapp mehr als der Kaufpreis
  for (const [type, def] of Object.entries(BUILDINGS)) {
    const p = def.production;
    if (p?.kind !== 'source') continue;
    const cost = ITEMS[p.input].buyPrice;
    const value = p.amount * ITEMS[p.output].price;
    assert.ok(value > cost, `${type}: ${value} > ${cost}`);
    assert.ok(value < cost * 1.25, `${type}: aber nur knapp`);
  }
  // Jedes Rezept: mehr als die Zutaten, aber nicht übertrieben
  for (const [key, r] of Object.entries(RECIPES)) {
    const inValue = Object.entries(r.inputs).reduce((s, [t, n]) => s + n * ITEMS[t].price, 0);
    const outValue = r.amount * ITEMS[r.output].price;
    assert.ok(outValue > inValue, `${key} lohnt sich (${outValue} > ${inValue})`);
    assert.ok(outValue <= inValue * 1.3, `${key} nicht übertrieben (${outValue})`);
  }
  // Werte aus der Tabelle (README 4.2)
  assert.equal(ITEMS.eisenerz.buyPrice, 4 * ITEMS.holzstamm.buyPrice, 'Eisen kostet viermal so viel');
  assert.equal(200 * ITEMS.holzblock.price, 600);
  assert.equal(40 * ITEMS.holzplatte.price, 720);
  assert.equal(200 * ITEMS.eisenbarren.price, 2400);
  assert.equal(40 * ITEMS.minieisenplatte.price, 2880);
  assert.equal(200 * ITEMS.eisennagel.price, 2800);
});

test('Datentabellen passen zusammen: Rezepte, Werkstätten, Waren', () => {
  for (const [key, r] of Object.entries(RECIPES)) {
    assert.ok(BUILDINGS[r.building].production.recipes.includes(key), `${key} steht bei ${r.building}`);
    assert.ok(ITEMS[r.output], `${key}: Ware ${r.output}`);
    for (const t of Object.keys(r.inputs)) assert.ok(ITEMS[t] && !ITEMS[t].raw, `${key}: Zutat ${t}`);
  }
  for (const [type, def] of Object.entries(BUILDINGS)) {
    const p = def.production;
    if (p?.kind === 'workshop') for (const k of p.recipes) assert.equal(RECIPES[k]?.building, type, `${type}: ${k}`);
    if (p?.kind === 'source') assert.ok(ITEMS[p.input].raw && ITEMS[p.output] && !ITEMS[p.output].raw, type);
  }
  assert.equal(ITEMS.holzwinkel, undefined, 'Holzwinkel entfällt');
  assert.equal(ITEMS.splitt, undefined, 'Splitt entfällt');
});
