// v0.34.0: 3D-Test (Tobias, Chat 24) – Level 1 in der neuen Grafik mit
// eigenem Spielstand. Geprüft wird hier, was ohne Browser geht: der eigene
// Spielstand, der Menü-Eintrag, die Knöpfe zum Drehen, das neue Versandportal
// (Burgtor) und dass das 2D-Spiel three.js nicht lädt; seit v0.35.0 auch, dass
// Bereich markieren und Fläche kaufen in 3D freigegeben sind und das Tor
// richtig steht. Bedienung und Aussehen prüft der Browser-Test
// (tests/browser/smoke.cjs, run3d).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createNewGame } from '../src/core/state.js';
import { MODELS, PALETTES } from '../src/probe/kenneyParts.js';
import { TEST_3D_SLOT, clearGame, loadGame, saveGame, useSaveSlot } from '../src/view/storage.js';

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

test('3D-Test: eigener Spielstand – die echte Fabrik bleibt unberührt', () => {
  const storage = fakeStorage();
  globalThis.localStorage = storage;
  try {
    const real = createNewGame(1);
    real.gold = 4321;
    useSaveSlot(null);
    assert.ok(saveGame(real));
    const realText = storage.getItem('erstesspiel-spielstand');

    useSaveSlot(TEST_3D_SLOT);
    assert.equal(loadGame().status, 'none', 'der 3D-Test beginnt mit einem neuen Spiel');
    const test3d = createNewGame(2);
    test3d.gold = 99;
    assert.ok(saveGame(test3d));
    assert.ok(storage.getItem('erstesspiel-spielstand-3d-test'), 'eigener Schlüssel');
    assert.equal(loadGame().state.gold, 99);
    clearGame(); // „Neues Spiel“ im 3D-Test
    assert.equal(storage.getItem('erstesspiel-spielstand-3d-test'), null);
    assert.equal(storage.getItem('erstesspiel-spielstand'), realText, 'die echte Fabrik ist unverändert');

    useSaveSlot(null);
    assert.equal(loadGame().state.gold, 4321);
  } finally {
    useSaveSlot(null);
    delete globalThis.localStorage;
  }
});

test('3D-Test: Menü-Eintrag, Knöpfe ⟲ ⟳ und Wechsel mit Speichern', () => {
  const html = read('index.html');
  assert.ok(html.includes('id="menu-3d"') && html.includes('🧊 3D-Test (Level 1)'));
  assert.ok(html.includes('id="btn-turn-left"') && html.includes('id="btn-turn-right"'));
  const main = read('src/main.js');
  assert.ok(main.includes("get('ansicht') === '3d'"), 'Adresse ?ansicht=3d');
  assert.ok(main.includes('if (VIEW_3D) useSaveSlot(TEST_3D_SLOT);'), 'eigener Spielstand vor dem ersten Laden');
  assert.ok(main.indexOf('useSaveSlot(TEST_3D_SLOT)') < main.indexOf('const loaded = loadGame();'));
  assert.ok(/onSwitch3d: \(\) => \{\s*saveNow\(\);/.test(main), 'vor dem Wechsel wird gespeichert');
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
  const source = read('src/probe/kenney3d.js');
  assert.ok(source.includes("CK, 'wall-narrow-gate'") && source.includes('portalShimmer(g, parts)'));
  // der Ring bleibt nur im Modern-Stil
  assert.ok(source.includes("building.type === 'versandportal' && style !== 'mittelalter'"));
});

test('3D-Test, Teil 2 (v0.35.0): Bereich markieren und Fläche kaufen gehen auch in 3D', () => {
  const main = read('src/main.js');
  assert.ok(!main.includes('areaTool') && !main.includes('landPurchase'), 'keine Sperren mehr im 3D-Test');
  const controller = read('src/view/controller.js');
  assert.ok(controller.includes("if (side) return select({ kind: 'land', side });"));
  assert.ok(controller.includes("if (tool === 'area') return startArea();"));
  const scene = read('src/view3d/scene3d.js');
  assert.ok(scene.includes('function syncArea(state, ui)') && scene.includes('function syncLand(state, ui)'));
  assert.ok(scene.includes("import { landOffer, landOffers } from '../core/land.js';"));
});

test('Versandportal (v0.35.0): das Tor ist nicht mehr gedreht – das Band fährt durch den Bogen', () => {
  const source = read('src/probe/kenney3d.js');
  assert.ok(source.includes("put(lib, g, CK, 'wall-narrow-gate', { x: -0.17, scale: 0.92,"));
  assert.ok(!/wall-narrow-gate'[^)]*rot:/.test(source), 'keine Drehung am Tor');
});
