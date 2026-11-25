// v0.34.0: 3D-Test (Tobias, Chat 24) – Level 1 in der neuen Grafik mit
// eigenem Spielstand; seit v0.54.0 das einzige Spiel (die 2D-Welt ist weg).
// Geprüft wird hier, was ohne Browser geht: der Spielstand auf dem alten Platz
// des 3D-Tests, die Knöpfe zum Drehen und das neue Versandportal (Burgtor);
// seit v0.35.0 auch, dass Bereich markieren und Fläche kaufen in 3D
// freigegeben sind und das Tor richtig steht. Bedienung und Aussehen prüft der Browser-Test
// (tests/browser/smoke.cjs, run3d).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createNewGame } from '../src/core/state.js';
import { MODELS, PALETTES } from '../src/view3d/kenneyParts.js';
import { GAME_SLOT, clearGame, loadGame, saveGame, useSaveSlot } from '../src/ui/storage.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

// Ein einfacher Browser-Speicher für node
function fakeStorage() {
  const data = new Map();
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
}

// v0.54.0: Der Spielstand bleibt auf dem Platz des früheren 3D-Tests (Tobias'
// Fabrik bleibt); der Spielstand der früheren 2D-Welt wird nicht angerührt.
test('Ein Spiel: Spielstand auf dem Platz des früheren 3D-Tests, die alte 2D-Fabrik bleibt unberührt', () => {
  assert.equal(GAME_SLOT, '3d-test', 'der Schlüssel heißt weiter erstesspiel-spielstand-3d-test');
  const storage = fakeStorage();
  globalThis.localStorage = storage;
  try {
    const real = createNewGame(1);
    real.gold = 4321;
    useSaveSlot(null);
    assert.ok(saveGame(real));
    const realText = storage.getItem('erstesspiel-spielstand');

    useSaveSlot(GAME_SLOT);
    assert.equal(loadGame().status, 'none', 'die alte 2D-Fabrik wird nicht geladen');
    const test3d = createNewGame(2);
    test3d.gold = 99;
    assert.ok(saveGame(test3d));
    assert.ok(storage.getItem('erstesspiel-spielstand-3d-test'), 'eigener Schlüssel');
    assert.equal(loadGame().state.gold, 99);
    clearGame(); // „Neues Spiel“
    assert.equal(storage.getItem('erstesspiel-spielstand-3d-test'), null);
    assert.equal(storage.getItem('erstesspiel-spielstand'), realText, 'die alte 2D-Fabrik ist unverändert');

    useSaveSlot(null);
    assert.equal(loadGame().state.gold, 4321);
  } finally {
    useSaveSlot(null);
    delete globalThis.localStorage;
  }
});

// v0.54.0: ohne 2D-Welt – kein Wechsel, kein ?ansicht=2d, die Knöpfe ⟲ ⟳ immer
test('Ein Spiel: kein Wechsel zur 2D-Welt, Knöpfe ⟲ ⟳ immer da, Spielstand vor dem ersten Laden', () => {
  const html = read('index.html');
  assert.ok(!html.includes('id="menu-3d"') && !html.includes('3D-Test') && !html.includes('view2d'), 'kein Menüpunkt, keine 2D-Dateien');
  assert.ok(html.includes('id="btn-turn-left"') && html.includes('id="btn-turn-right"'));
  assert.ok(/<div id="turn-buttons" class="turn-buttons">/.test(html), 'Dreh-Knöpfe ohne hidden');
  const main = read('src/main.js');
  assert.ok(!main.includes("get('ansicht')") && !main.includes('VIEW_3D') && !main.includes('view2d'), 'keine 2D-Ansicht mehr');
  assert.ok(main.includes('useSaveSlot(GAME_SLOT);'));
  assert.ok(main.indexOf('useSaveSlot(GAME_SLOT)') < main.indexOf('const loaded = '), 'Spielstand-Platz vor dem ersten Laden');
  const hud = read('src/ui/hud.js');
  assert.ok(!hud.includes('echten Fabrik') && !hud.includes('menu-3d'));
});

test('Versandportal im Mittelalter: Burgtor aus dem Castle Kit in warmem Steingrau', () => {
  assert.ok(MODELS['castle-kit'].includes('wall-narrow-gate'));
  assert.ok(!MODELS['fantasy-town-kit'].includes('fountain-round'), 'das alte Becken wird nicht mehr gebraucht');
  const tor = PALETTES['castle-kit'].tor;
  assert.deepEqual(
    tor.map((r) => [r.band, r.cols, r.color]),
    [
      [3, [13], '#bdb3a3'],
      [3, [15], '#8f877b'],
    ],
  );
  const source = read('src/view3d/kenney3d.js');
  assert.ok(source.includes("CK, 'wall-narrow-gate'") && source.includes('portalShimmer(g, parts)'));
  // v0.37.0: den Leuchtring des Modern-Stils gibt es mit der Grafik-Probe nicht mehr
  assert.ok(!source.includes('portalRing'));
});

test('3D-Test, Teil 2 (v0.35.0): Bereich markieren und Fläche kaufen gehen auch in 3D', () => {
  const main = read('src/main.js');
  assert.ok(!main.includes('areaTool') && !main.includes('landPurchase'), 'keine Sperren mehr im 3D-Test');
  const controller = read('src/ui/controller.js');
  assert.ok(controller.includes("if (side) return select({ kind: 'land', side });"));
  assert.ok(controller.includes("if (tool === 'area') return startArea();"));
  const scene = read('src/view3d/scene3d.js');
  assert.ok(scene.includes('function syncArea(state, ui)') && scene.includes('function syncLand(state, ui)'));
  assert.ok(scene.includes("import { landOffer, landOffers } from '../core/land.js';"));
});

test('Versandportal (v0.35.0): das Tor ist nicht mehr gedreht – das Band fährt durch den Bogen', () => {
  const source = read('src/view3d/kenney3d.js');
  assert.ok(source.includes("put(lib, g, CK, 'wall-narrow-gate', { x: -0.17, scale: 0.92,"));
  assert.ok(!/wall-narrow-gate'[^)]*rot:/.test(source), 'keine Drehung am Tor');
});
