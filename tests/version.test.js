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

test('docs/STAND.md nennt die aktuelle Version in der Status-Tabelle', () => {
  const stand = read('docs/STAND.md');
  assert.ok(stand.includes(`| **Aktuelle Version** | v${VERSION}`), `STAND.md zeigt nicht v${VERSION}`);
});

// v0.18.1: Diese Dateien liest Claude zu Beginn jedes Chats – sie sollen kurz
// bleiben. Ausführliches gehört ins Archiv (docs/archiv/).
test('Doku: STAND.md und SPIEL.md bleiben kurz, das Archiv ist vollständig da', () => {
  const size = (path) => Buffer.byteLength(read(path), 'utf8');
  assert.ok(size('docs/STAND.md') < 20000, `docs/STAND.md ist ${size('docs/STAND.md')} Byte groß (Grenze 20.000)`);
  assert.ok(size('docs/SPIEL.md') < 40000, `docs/SPIEL.md ist ${size('docs/SPIEL.md')} Byte groß (Grenze 40.000)`);
  assert.ok(size('CLAUDE.md') < 12000, `CLAUDE.md ist ${size('CLAUDE.md')} Byte groß (Grenze 12.000)`);
  for (const file of ['ENTSCHEIDUNGEN', 'VERSIONEN', 'GESPRAECHE', 'PLAENE', 'KONZEPT-VERLAUF']) {
    assert.ok(size(`docs/archiv/${file}.md`) > 1000, `docs/archiv/${file}.md fehlt oder ist leer`);
  }
  const stand = read('docs/STAND.md');
  const steps = stand.split('## Die letzten 3 Arbeitsschritte')[1] ?? '';
  assert.ok((steps.match(/^### v/gm) ?? []).length <= 3, 'STAND.md: höchstens 3 Arbeitsschritte');
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
