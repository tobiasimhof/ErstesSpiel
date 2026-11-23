// v0.44.0: Rechenwerkzeug für die Zahlen (tools/zahlen.mjs, Tobias, Chat 27).
// Prüft die Rechnung an Beispielen, die man im Kopf nachrechnen kann, und dass
// docs/inhalte/ZAHLEN.md zu den Datentabellen passt.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildReport, unitCost, bundleCost, rawGold, machineSeconds, bottleneck, levelFigures, plantCount, REPORT_PATH } from '../tools/zahlen.mjs';
import { xpNeeded } from '../src/core/quests.js';
import { MAX_LEVEL } from '../src/core/data/levels.js';

const close = (a, b, what) => assert.ok(Math.abs(a - b) < 1e-9, `${what}: ${a} statt ${b}`);

test('Rechenwerkzeug: eine Holzplatte = 5 Holzblöcke = 1/40 Holzstamm', () => {
  const cost = unitCost('holzplatte');
  close(cost.raws.holzstamm, 5 / 200, 'Holzstämme');
  close(machineSeconds(cost), 5 * 4.5 + 5, 'Maschinenzeit (5 × 4,5 s Holzfällerlager + 5 s Sägewerk)');
  assert.equal(bottleneck(cost).station, 'Holzfällerlager: Holzstamm');
  close(rawGold(cost), 183 / 40, 'Rohstoffkosten');
});

test('Rechenwerkzeug: Pflanzen zählen ihre Samen, das Beet zählt beim Engpass', () => {
  // Wundverband = Heilverband (1 Verband aus 5 Fasern + 5 Ringelblüten) + 5 Schafgarbenblüten
  const cost = unitCost('wundverband');
  close(cost.raws.leinsamen, 5 / 50, 'Leinsamen');
  close(cost.raws.ringelblumensamen, 5 / 50, 'Ringelblumensamen');
  close(cost.raws.schafgarbensamen, 5 / 50, 'Schafgarbensamen');
  close(plantCount(cost), 0.3, 'Pflanzen');
  assert.ok(!Object.keys(cost.stations).some((s) => s.startsWith('Beet')), 'Beet nicht in der Maschinenzeit');
  close(bottleneck(cost).seconds, 0.1 * 1800, 'Engpass: 1/10 Pflanze je Beet');
});

test('Rechenwerkzeug: Level 1 braucht 225 Holzblöcke, die Erfahrung passt zu den Aufträgen', () => {
  const f = levelFigures(1);
  close(f.cost.raws.holzstamm, 225 / 200, 'Holzstämme für Level 1');
  for (let level = 1; level <= MAX_LEVEL; level++) assert.equal(levelFigures(level).xp, xpNeeded(level), `Level ${level}`);
  close(bundleCost({ holzstab: 2, holzplatte: 1 }).raws.holzstamm, 15 / 200, 'Mischung');
});

test(`${REPORT_PATH} passt zu den Datentabellen (sonst: node tools/zahlen.mjs)`, () => {
  const saved = readFileSync(new URL(`../${REPORT_PATH}`, import.meta.url), 'utf8');
  assert.equal(saved, buildReport(), `${REPORT_PATH} ist veraltet – node tools/zahlen.mjs aufrufen`);
});
