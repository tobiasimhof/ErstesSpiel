// Browser-Test in Teilen gleichzeitig (v0.56.2, Tobias, Chat 32: „wie wir das
// ganze schneller live mergen können“ – Vorschlag A). Nacheinander lief der
// Test etwa 66 Minuten (Durchspielen 34, 3D 25, Einführung 7), obwohl die
// Arbeitsumgebung mehrere Prozessorkerne hat. Diese Datei startet smoke.cjs
// mehrmals, je Teil und Gerät in einem eigenen Browser, und fasst am Ende
// zusammen. Geprüft wird genau dasselbe wie mit smoke.cjs allein.
//
// Aufruf: npm run test:browser (SCREENSHOT_DIR wie bisher). Gleichzeitig laufen
// höchstens PARALLEL Teile (Standard: so viele, wie es Prozessorkerne gibt);
// die längsten starten zuerst. Jeder Teil schreibt sein Protokoll nach
// <SCREENSHOT_DIR>/protokoll-<teil>.txt; fehlgeschlagene Prüfungen erscheinen
// sofort mit dem Namen des Teils davor.

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { OUT } = require('./helpers.cjs');

// Die Teile, längste zuerst (gemessen in Chat 32, nacheinander)
const PARTS = [
  { name: 'fabrik-handy', env: { ONLY: 'fabrik', DEVICE: 'handy-quer' } }, // mit Hochformat und schmalem Handy
  { name: 'fabrik-tablet', env: { ONLY: 'fabrik', DEVICE: 'tablet-quer' } },
  { name: '3d-tablet', env: { ONLY: '3d', DEVICE: 'tablet-quer' } },
  { name: '3d-handy', env: { ONLY: '3d', DEVICE: 'handy-quer' } },
  { name: 'einfuehrung', env: { ONLY: 'einfuehrung' } },
];

const limit = Math.max(1, Number(process.env.PARALLEL) || os.cpus().length);
const minutes = (ms) => `${(ms / 60000).toFixed(1)} min`;

function runPart(part) {
  return new Promise((resolve) => {
    const started = Date.now();
    const logPath = path.join(OUT, `protokoll-${part.name}.txt`);
    const log = fs.createWriteStream(logPath);
    const child = spawn(process.execPath, [path.join(__dirname, 'smoke.cjs')], {
      env: { ...process.env, ...part.env, SCREENSHOT_DIR: OUT },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let rest = '';
    let ok = 0;
    let bad = 0;
    const onData = (chunk) => {
      log.write(chunk);
      rest += chunk.toString();
      const lines = rest.split('\n');
      rest = lines.pop();
      for (const line of lines) {
        if (line.includes('✔')) ok++;
        if (line.includes('✘')) {
          bad++;
          console.log(`[${part.name}] ${line.trim()}`);
        }
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    console.log(`▶ ${part.name} gestartet`);
    child.on('close', (code) => {
      log.end();
      const result = { ...part, code, ok, bad, ms: Date.now() - started, logPath };
      console.log(`${code === 0 ? '✔' : '✘'} ${part.name} fertig nach ${minutes(result.ms)}: ${ok} bestanden, ${bad} fehlgeschlagen${code !== 0 && bad === 0 ? ` (abgebrochen, siehe ${logPath})` : ''}`);
      resolve(result);
    });
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const started = Date.now();
  console.log(`Browser-Test in ${PARTS.length} Teilen, höchstens ${limit} gleichzeitig. Protokolle und Screenshots: ${OUT}`);
  const queue = [...PARTS];
  const results = [];
  const worker = async () => {
    while (queue.length > 0) results.push(await runPart(queue.shift()));
  };
  await Promise.all(Array.from({ length: Math.min(limit, PARTS.length) }, worker));

  const failed = results.filter((r) => r.code !== 0);
  console.log('\nZusammenfassung:');
  for (const r of PARTS.map((p) => results.find((x) => x.name === p.name))) {
    console.log(`  ${r.code === 0 ? '✔' : '✘'} ${r.name.padEnd(14)} ${minutes(r.ms).padStart(9)}  ${r.ok} bestanden, ${r.bad} fehlgeschlagen`);
  }
  console.log(`Zusammen ${minutes(Date.now() - started)}, ${results.reduce((s, r) => s + r.ok, 0)} Prüfungen bestanden.`);
  console.log(failed.length === 0 ? 'Alle Browser-Prüfungen bestanden.' : `${failed.length} Teil(e) fehlgeschlagen: ${failed.map((r) => r.name).join(', ')}`);
  process.exit(failed.length === 0 ? 0 : 1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
