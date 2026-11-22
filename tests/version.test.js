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

// v0.18.1: Diese Dateien liest Claude zu Beginn jedes Chats bzw. beim
// Programmieren – sie sollen kurz bleiben. Seit v0.37.0 (Tobias, Chat 25:
// „damit … du nicht so viel lesen musst“) deutlich strenger; Einzelheiten
// gehören nach docs/inhalte/, Verlauf und Zitate ins Archiv (docs/archiv/).
test('Doku: STAND.md, SPIEL.md und TECHNIK.md bleiben kurz, Inhalte und Archiv sind vollständig da', () => {
  const size = (path) => Buffer.byteLength(read(path), 'utf8');
  const limits = { 'docs/STAND.md': 10000, 'docs/SPIEL.md': 12000, 'docs/TECHNIK.md': 16000, 'CLAUDE.md': 9000 };
  for (const [path, limit] of Object.entries(limits)) {
    assert.ok(size(path) < limit, `${path} ist ${size(path)} Byte groß (Grenze ${limit}) – Einzelheiten nach docs/inhalte/ oder ins Archiv`);
  }
  for (const file of ['LEVEL', 'GEBAEUDE', 'WAREN', 'BEDIENUNG', 'AUSBLICK']) {
    assert.ok(size(`docs/inhalte/${file}.md`) > 1000, `docs/inhalte/${file}.md fehlt oder ist leer`);
  }
  for (const file of ['ENTSCHEIDUNGEN', 'VERSIONEN', 'GESPRAECHE', 'PLAENE', 'KONZEPT-VERLAUF', 'STAND-LANGFASSUNG', 'SPIEL-LANGFASSUNG', 'TECHNIK-LANGFASSUNG']) {
    assert.ok(size(`docs/archiv/${file}.md`) > 1000, `docs/archiv/${file}.md fehlt oder ist leer`);
  }
  const stand = read('docs/STAND.md');
  const steps = stand.split('## Die letzten 3 Arbeitsschritte')[1] ?? '';
  assert.ok((steps.match(/^### v/gm) ?? []).length <= 3, 'STAND.md: höchstens 3 Arbeitsschritte');
});

test('Import-Map in index.html versieht jede Programmdatei mit der aktuellen Version', async () => {
  // Ohne das mischt der Browser nach einem Update alte und neue Dateien (v0.7.0).
  const { THREE_IMPORTS, sourceFiles } = await import('../tools/set-version.mjs');
  const html = read('index.html');
  const block = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
  assert.ok(block, 'keine Import-Map in index.html');
  const { imports } = JSON.parse(block[1]);
  const files = sourceFiles();
  assert.ok(files.length > 20);
  for (const file of files) {
    assert.equal(imports[file], `${file}?v=${VERSION}`, `${file} fehlt oder hat die falsche Version – node tools/set-version.mjs ausführen`);
  }
  // v0.34.0: dazu three.js für den 3D-Test (ohne ?v=, die Version steht im Ordnernamen)
  for (const [name, path] of Object.entries(THREE_IMPORTS)) assert.equal(imports[name], path, `${name} für den 3D-Test`);
  const own = Object.keys(imports).filter((key) => !(key in THREE_IMPORTS));
  assert.deepEqual(own.sort(), files, 'Import-Map nennt Dateien, die es nicht gibt');
  assert.ok(html.indexOf('type="importmap"') < html.indexOf('type="module"'), 'Import-Map muss vor dem Spiel-Script stehen');
});
