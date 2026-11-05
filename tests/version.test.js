import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { VERSION } from '../src/version.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Versionsnummer hat das Format A.B.C', () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
});

test('index.html lädt Dateien mit der aktuellen Versionsnummer', () => {
  const html = read('index.html');
  const found = [...html.matchAll(/\?v=([\d.]+)/g)].map((m) => m[1]);
  assert.ok(found.length >= 2, 'keine ?v= Angaben in index.html gefunden');
  for (const v of found) assert.equal(v, VERSION, `index.html nutzt ?v=${v}, erwartet ${VERSION}`);
});

test('README nennt die aktuelle Version in der Status-Tabelle', () => {
  const readme = read('README.md');
  assert.ok(readme.includes(`| **Aktuelle Version** | v${VERSION}`), `README-Status zeigt nicht v${VERSION}`);
});
