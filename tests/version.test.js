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

test('Import-Map in index.html versieht jede Programmdatei mit der aktuellen Version', async () => {
  // Ohne das mischt der Browser nach einem Update alte und neue Dateien (v0.7.0).
  const { sourceFiles } = await import('../tools/set-version.mjs');
  const html = read('index.html');
  const block = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
  assert.ok(block, 'keine Import-Map in index.html');
  const { imports } = JSON.parse(block[1]);
  const files = sourceFiles();
  assert.ok(files.length > 20);
  for (const file of files) {
    assert.equal(imports[file], `${file}?v=${VERSION}`, `${file} fehlt oder hat die falsche Version – node tools/set-version.mjs ausführen`);
  }
  assert.deepEqual(Object.keys(imports).sort(), files, 'Import-Map nennt Dateien, die es nicht gibt');
  assert.ok(html.indexOf('type="importmap"') < html.indexOf('type="module"'), 'Import-Map muss vor dem Spiel-Script stehen');
});
