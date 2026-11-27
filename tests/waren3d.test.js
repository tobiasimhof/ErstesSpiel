// v0.46.0: Waren auf dem Band mit eigenem Aussehen (Tobias, Chat 27: „damit
// man auch besser unterscheiden kann, was auf dem band liegt“). Die Formen
// stehen als Daten in src/view3d/itemForms.js (ohne three.js); hier wird
// geprüft, dass jede Ware eine eigene Form hat und die Formen klein bleiben.
// Größe und Dreiecke im echten 3D prüft der Browser-Test (3d-11c-waren).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ITEMS } from '../src/core/data/items.js';
import { ITEM_FORMS, formParts, itemForm } from '../src/view3d/itemForms.js';

const goods = Object.keys(ITEMS).filter((t) => !ITEMS[t].raw && ITEMS[t].price);
const KINDS = { box: 3, cyl: 4, ball: 3, ring: 5 };

test('Jede Ware, die auf ein Band kann, hat eine eigene 3D-Form – keine Kugel mehr', () => {
  assert.equal(goods.length, 55, '55 Waren (ohne Rohstoffe, Samen und Pflanzen; v0.55.0 mit dem Traumtrank, v0.57.0 mit Heilpuder und Heiltrank, v0.58.0 mit Linse, Kristallsand und Fernrohr, v0.59.0 mit Farnwedel, Lebenstrank und Manatrank, v0.60.0 mit Astrolabium, Messtisch, Lupe, Heilertasche, Schatztruhe und Laterne)');
  for (const type of goods) assert.ok(ITEM_FORMS[type], `${type} hat eine Form`);
  for (const type of Object.keys(ITEM_FORMS)) assert.ok(goods.includes(type), `${type} ist eine Ware`);
  for (const type of goods) {
    const parts = formParts(itemForm(type));
    const onlyBall = parts.length === 1 && parts[0].k === 'ball';
    assert.ok(!onlyBall, `${type}: nicht nur eine Kugel`);
  }
});

test('Keine zwei Waren sehen gleich aus', () => {
  const seen = new Map();
  for (const type of goods) {
    const key = JSON.stringify(ITEM_FORMS[type]);
    assert.ok(!seen.has(key), `${type} sieht aus wie ${seen.get(key)}`);
    seen.set(key, type);
  }
});

test('Formen bestehen aus bekannten Grundkörpern mit Farbe und Größe, höchstens 40 je Ware', () => {
  for (const type of goods) {
    const parts = formParts(ITEM_FORMS[type]);
    assert.ok(parts.length >= 1 && parts.length <= 40, `${type}: ${parts.length} Grundkörper`);
    for (const part of parts) {
      assert.ok(KINDS[part.k], `${type}: Grundkörper ${part.k}`);
      assert.match(part.c, /^#[0-9a-f]{6}$/i, `${type}: Farbe ${part.c}`);
      assert.ok(part.s.length >= Math.min(3, KINDS[part.k]) && part.s.every((v) => typeof v === 'number' && v > 0), `${type}: Größe ${part.s}`);
      for (const v of [...(part.p ?? []), ...(part.r ?? [])]) assert.ok(Number.isFinite(v), `${type}: Lage ${v}`);
    }
  }
});

test('Die Grundwaren behalten ihre Formen; das Stein-Zahnrad bekommt Zähne', () => {
  assert.deepEqual(ITEM_FORMS.holzblock, [{ k: 'box', c: '#cf9a5f', s: [0.22, 0.22, 0.22], p: [0, 0.11, 0], r: undefined }]);
  assert.deepEqual(ITEM_FORMS.holzplatte[0].s, [0.36, 0.06, 0.28]);
  assert.deepEqual(ITEM_FORMS.eisenstange[0].s, [0.42, 0.06, 0.06]);
  assert.ok(formParts(ITEM_FORMS.steinzahnrad).length > 10, 'Scheibe, Zähne und Nabe');
});

test('Familien haben Erkennungszeichen: Verbände als Rollen mit Streifen, Blüten in ihren Farben', () => {
  const colors = (type) => new Set(formParts(ITEM_FORMS[type]).map((p) => p.c.toLowerCase()));
  assert.ok(!colors('verband').has('#f59f00'), 'Verband: nur weiß');
  assert.ok(colors('heilverband').has('#f59f00'), 'Heilverband: oranger Streifen');
  assert.ok(colors('wundverband').has('#f59f00') && colors('wundverband').has('#f8f5ea'), 'Wundverband: orange und weiß');
  assert.ok(colors('ringelbluete').has('#f08c00'), 'Ringelblüte: orange');
  assert.ok(colors('kamillenbluete').has('#f2b705'), 'Kamillenblüte: gelbe Mitte');
  assert.ok(colors('tinktur').has('#7a4a24') && colors('moerser').has('#a7adb5'));
});
