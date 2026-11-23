// v0.47.0 (Tobias, Chat 28: „diese Kräuter sehen alle gleich aus unterscheiden
// sich nur in der Farbe“): Jede Pflanze hat eine eigene Wuchsform (bloom), jede
// Samentüte zeigt ihre Pflanze (grows), und im Beet wachsen die Pflanzen in vier
// Stufen sichtbar (src/view3d/plantForms.js, nur Daten ohne three.js).
// Das Aussehen im Browser prüft der Browser-Test (3d-11d-beete, 3d-11e-erntebank).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ITEMS } from '../src/core/data/items.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { formParts } from '../src/view3d/itemForms.js';
import { PLANT_STAGES, bedForm, plantForm, plantStage } from '../src/view3d/plantForms.js';

const plants = Object.keys(ITEMS).filter((t) => ITEMS[t].grown);
const seeds = Object.keys(ITEMS).filter((t) => ITEMS[t].shape === 'seeds');
const KINDS = { box: 3, cyl: 4, ball: 3 };

test('Jede Pflanze hat eine eigene Wuchsform, nicht nur eine andere Farbe', () => {
  assert.deepEqual(plants, ['flachspflanze', 'ringelblume', 'schafgarbe', 'kamille']);
  const blooms = plants.map((t) => ITEMS[t].bloom);
  assert.deepEqual(blooms, ['stars', 'disc', 'umbel', 'daisies']);
  assert.equal(new Set(blooms).size, plants.length, 'keine zwei gleich');
});

test('Jede Samentüte zeigt die Pflanze, die im Beet daraus wächst', () => {
  const crops = BUILDINGS.beet.production.crops;
  assert.equal(seeds.length, 4);
  for (const seed of seeds) {
    assert.ok(ITEMS[ITEMS[seed].grows]?.grown, `${seed}: Bild einer Pflanze`);
    assert.equal(ITEMS[seed].grows, crops[seed].plant, `${seed}: wächst im Beet zu ${crops[seed].plant}`);
  }
});

test('Wachstum im Beet: Keimling, kleine Pflanze, Knospen ab 60 %, reif', () => {
  assert.equal(PLANT_STAGES, 4);
  assert.equal(plantStage(0, false), 0);
  assert.equal(plantStage(0.19, false), 0);
  assert.equal(plantStage(0.2, false), 1);
  assert.equal(plantStage(0.59, false), 1);
  assert.equal(plantStage(0.6, false), 2);
  assert.equal(plantStage(1, false), 2);
  assert.equal(plantStage(1, true), 3);
});

test('Pflanzenformen: bekannte Grundkörper, je Stufe größer, alle vier reif verschieden', () => {
  // Höhe = längster Stängel (die Stängel sind die senkrechten Zylinder)
  const height = (parts) => Math.max(...formParts(parts).filter((p) => p.k === 'cyl').map((p) => p.s[2]));
  const ripe = new Set();
  for (const type of plants) {
    let last = -1;
    for (let stage = 0; stage < PLANT_STAGES; stage++) {
      const parts = formParts(plantForm(type, stage));
      assert.ok(parts.length >= 2 && parts.length <= 60, `${type} Stufe ${stage}: ${parts.length} Grundkörper`);
      for (const part of parts) {
        assert.ok(KINDS[part.k], `${type}: Grundkörper ${part.k}`);
        assert.equal(part.s.length >= KINDS[part.k], true, `${type}: Größe von ${part.k}`);
        assert.match(part.c, /^#[0-9a-f]{6}$/i, `${type}: Farbe`);
      }
      const h = height(plantForm(type, stage));
      assert.ok(h > last, `${type}: Stufe ${stage} höher als die vorige (${h} > ${last})`);
      last = h;
    }
    // reif: die Blüte in der Farbe der Pflanze ist zu sehen
    const colors = formParts(plantForm(type, 3)).map((p) => p.c.toLowerCase());
    assert.ok(colors.includes(ITEMS[type].flower.toLowerCase()), `${type}: Blüten in ${ITEMS[type].flower}`);
    ripe.add(JSON.stringify(plantForm(type, 3)));
  }
  assert.equal(ripe.size, plants.length);
});

test('Ein Beet: 3 × 3 Pflanzen auf der Erde, innerhalb des Holzrahmens, nicht zu schwer', () => {
  for (const type of plants) {
    const bed = bedForm(type, 3);
    assert.equal(bed.length, 9);
    for (const plant of bed) {
      assert.equal(plant.p[1], 0.1, 'steht auf der Erde');
      assert.ok(Math.abs(plant.p[0]) < 0.8 && Math.abs(plant.p[2]) < 0.8, 'im Rahmen des 2 × 2-Beets');
    }
    const parts = formParts(bed).length;
    assert.ok(parts <= 9 * 60, `${type}: ${parts} Grundkörper im Beet`);
  }
});
