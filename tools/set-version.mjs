// Setzt die Versionsnummer überall, wo der Browser sie braucht:
//   - src/version.js (Anzeige im Spiel)
//   - index.html: alle ?v= Angaben und die Import-Map
//
// Die Import-Map hängt an JEDE Programmdatei ?v=<Version>. Ohne sie lädt der
// Browser nach einem Update nur main.js neu und nimmt die übrigen Dateien bis zu
// 10 Minuten aus dem Zwischenspeicher – alte und neue Dateien passen dann nicht
// zusammen und das Spiel startet nicht (so passiert bei v0.7.0).
//
// Aufruf: node tools/set-version.mjs 0.7.1
//         node tools/set-version.mjs        (nur Import-Map neu schreiben)

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const write = (p, text) => writeFileSync(join(ROOT, p), text);

function replaceOnce(text, pattern, replacement, what) {
  const matches = text.match(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`));
  if (!matches || matches.length !== 1) throw new Error(`${what}: erwartet genau 1 Treffer, gefunden ${matches?.length ?? 0}`);
  return text.replace(pattern, replacement);
}

export function sourceFiles(dir = join(ROOT, 'src')) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...sourceFiles(full));
    else if (name.endsWith('.js')) files.push(`./${relative(ROOT, full).split(sep).join('/')}`);
  }
  return files.sort();
}

export function importMapJson(version) {
  const imports = {};
  for (const file of sourceFiles()) imports[file] = `${file}?v=${version}`;
  return JSON.stringify({ imports }, null, 2);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  let version = process.argv[2];
  if (version) {
    if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Version muss A.B.C sein, nicht „${version}“`);
    write('src/version.js', replaceOnce(read('src/version.js'), /VERSION = '[^']+'/, `VERSION = '${version}'`, 'src/version.js'));
  } else {
    version = read('src/version.js').match(/VERSION = '([^']+)'/)[1];
  }
  let html = read('index.html');
  html = html.replace(/\?v=[\d.]+/g, `?v=${version}`);
  const indent = '    ';
  const map = importMapJson(version)
    .split('\n')
    .map((line) => `${indent}${line}`)
    .join('\n');
  html = replaceOnce(
    html,
    /<script type="importmap">[\s\S]*?<\/script>/,
    `<script type="importmap">\n${map}\n${indent}</script>`,
    'Import-Map in index.html',
  );
  write('index.html', html);
  console.log(`Version ${version}: src/version.js und index.html (${sourceFiles().length} Dateien in der Import-Map) aktualisiert.`);
}
