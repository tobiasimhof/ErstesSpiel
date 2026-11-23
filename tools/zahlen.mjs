// Rechenwerkzeug für die Zahlen (v0.44.0, Tobias, Chat 27: „das
// Rechenwerkzeug hat mir noch gefehlt, damit wir alles im Gleichgewicht
// behalten können“).
//
// Liest die Datentabellen des Spiels (Waren, Rezepte, Gebäude, Level, Laden)
// und schreibt daraus eine Übersicht nach docs/inhalte/ZAHLEN.md: je Level,
// was die Aufträge an Rohstoffen, Maschinenzeit und Gold bedeuten, was die
// neuen Gebäude kosten und wie lange die Theken für den Aufstieg verkaufen
// müssen; dazu je Ware Wert, Rohstoffe und Zeit. Am Spiel ändert sich nichts.
//
// Aufruf: node tools/zahlen.mjs        (schreibt docs/inhalte/ZAHLEN.md neu)
// Ein Test (tests/zahlen.test.js) prüft, dass die Seite zu den Tabellen passt.
//
// So wird gerechnet (alles je Stück, ohne Wege auf den Bändern):
// - Rohstoffe: Ein Rohstoff-Gebäude macht aus 1 Rohstoff `amount` Stück
//   (1 Holzstamm → 200 Holzblöcke), ein Rezept aus seinen Zutaten `amount`
//   Stück; eine Pflanze wächst aus 1 Samen. Rückwärts bis zu den Rohstoffen
//   beim Händler gerechnet.
// - Maschinenzeit: alle Sekunden, die Rohstoff-Gebäude und Maschinen für ein
//   Stück arbeiten (Rohstoff-Gebäude: Dauer ÷ Menge, z. B. 4,5 s je
//   Holzblock). Die Zeit im Beet zählt nicht mit, sie steht als „Pflanzen“.
// - Engpass: Steht für jeden Schritt genau ein Gebäude bereit (eine
//   Straße, je Pflanze ein Beet), bestimmt der langsamste Schritt das Tempo.
// - Theken: Jeder Kunde kauft 1 Stück; je Theke kommt im Schnitt alle
//   (min + max) ÷ 2 Sekunden einer (`customerSeconds` des Levels).

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { ITEMS } from '../src/core/data/items.js';
import { RECIPES } from '../src/core/data/recipes.js';
import { BUILDINGS } from '../src/core/data/buildings.js';
import { LEVELS, MAX_LEVEL } from '../src/core/data/levels.js';
import { SHOP_LEVELS, COUNTERS, STORAGE_UPGRADE } from '../src/core/data/shop.js';
import { LAND, LAND_MORE } from '../src/core/data/land.js';
import { questValue, questReward, xpNeeded } from '../src/core/quests.js';
import { itemLevel, recipeLevel } from '../src/core/levels.js';

export const REPORT_PATH = 'docs/inhalte/ZAHLEN.md';

// ---------- Wie wird eine Ware hergestellt? ----------

// Alle Wege, eine Ware herzustellen; genommen wird der mit dem niedrigsten Level.
function producers() {
  const list = {};
  const add = (item, way) => (list[item] ??= []).push(way);
  for (const [type, b] of Object.entries(BUILDINGS)) {
    const p = b.production;
    if (p?.kind === 'source') {
      for (const [input, output] of Object.entries(p.inputs ?? { [p.input]: p.output })) {
        add(output, {
          kind: 'source',
          input,
          per: 1 / p.amount,
          seconds: p.duration / p.amount,
          station: `${b.name}: ${ITEMS[input].name}`,
          level: Math.max(b.level ?? 1, ITEMS[input]?.level ?? 1),
        });
      }
    }
    if (p?.kind === 'garden') {
      for (const [seed, crop] of Object.entries(p.crops)) {
        add(crop.plant, {
          kind: 'garden',
          seed,
          seconds: crop.time,
          station: `${b.name}: ${ITEMS[crop.plant].name}`,
          level: Math.max(b.level ?? 1, ITEMS[seed]?.level ?? 1),
        });
      }
    }
    if (p?.kind === 'workshop') {
      for (const key of p.recipes) {
        const r = RECIPES[key];
        add(r.output, {
          kind: 'recipe',
          inputs: r.inputs,
          amount: r.amount,
          seconds: r.time / r.amount,
          station: `${b.name}: ${r.label}`,
          level: recipeLevel(key),
        });
      }
    }
  }
  for (const ways of Object.values(list)) ways.sort((a, b) => a.level - b.level);
  return list;
}

const PRODUCERS = producers();

// stations: Sekunden je Rohstoff-Gebäude und Maschine; beds: Sekunden im Beet
function emptyCost() {
  return { raws: {}, stations: {}, beds: {}, plants: {} };
}

function addScaled(target, cost, factor) {
  for (const part of ['raws', 'stations', 'beds', 'plants']) {
    for (const [key, n] of Object.entries(cost[part])) target[part][key] = (target[part][key] ?? 0) + n * factor;
  }
}

const COST_CACHE = new Map();

// Was in einem Stück steckt: { raws: {Rohstoff: Menge}, stations: {Schritt: Sekunden},
// beds: {Beet: Sekunden}, plants: {Pflanze: Anzahl} }
export function unitCost(item) {
  if (COST_CACHE.has(item)) return COST_CACHE.get(item);
  const cost = emptyCost();
  const def = ITEMS[item];
  if (!def) throw new Error(`Unbekannte Ware: ${item}`);
  const way = PRODUCERS[item]?.[0];
  if (def.raw && !def.grown) {
    cost.raws[item] = 1; // beim Händler
  } else if (!way) {
    throw new Error(`Keine Herstellung für ${item}`);
  } else if (way.kind === 'garden') {
    cost.raws[way.seed] = 1;
    cost.plants[item] = 1;
    cost.beds[way.station] = way.seconds;
  } else if (way.kind === 'source') {
    addScaled(cost, unitCost(way.input), way.per);
    cost.stations[way.station] = way.seconds;
  } else {
    for (const [input, n] of Object.entries(way.inputs)) addScaled(cost, unitCost(input), n / way.amount);
    cost.stations[way.station] = (cost.stations[way.station] ?? 0) + way.seconds;
  }
  COST_CACHE.set(item, cost);
  return cost;
}

// Was in einer Liste von Waren steckt ({Ware: Anzahl})
export function bundleCost(items) {
  const cost = emptyCost();
  for (const [item, n] of Object.entries(items)) addScaled(cost, unitCost(item), n);
  return cost;
}

export const rawGold = (cost) => Object.entries(cost.raws).reduce((sum, [raw, n]) => sum + n * (ITEMS[raw].buyPrice ?? 0), 0);
export const machineSeconds = (cost) => Object.values(cost.stations).reduce((a, b) => a + b, 0);
// Der langsamste Schritt, wenn jeder Schritt (auch jedes Beet) genau ein Gebäude hat
export function bottleneck(cost) {
  let best = { station: '–', seconds: 0 };
  for (const [station, seconds] of [...Object.entries(cost.stations), ...Object.entries(cost.beds)]) {
    if (seconds > best.seconds) best = { station, seconds };
  }
  return best;
}
export const goodsValue = (items) => Object.entries(items).reduce((sum, [item, n]) => sum + (ITEMS[item]?.price ?? 0) * n, 0);
export const plantCount = (cost) => Object.values(cost.plants).reduce((a, b) => a + b, 0);

// Kunden pro Stunde je Theke auf einem Level
export function customersPerHour(level) {
  const [min, max] = SHOP_LEVELS[level]?.customerSeconds ?? SHOP_LEVELS[MAX_LEVEL].customerSeconds;
  return 3600 / ((min + max) / 2);
}

// Wie viele Theken es auf einem Level höchstens geben kann
export function maxCounters(level) {
  return COUNTERS.start + COUNTERS.levels.filter((l) => l <= level).length;
}

// Die wertvollste Ware, die man auf einem Level herstellen kann
export function bestItem(level) {
  let best = null;
  for (const [type, def] of Object.entries(ITEMS)) {
    if (def.raw || !def.price || itemLevel(type) > level) continue;
    if (!best || def.price > ITEMS[best].price) best = type;
  }
  return best;
}

// Alles, was die Übersicht je Level braucht
export function levelFigures(level) {
  const quests = LEVELS[level]?.quests ?? [];
  const items = {};
  for (const q of quests) for (const [item, n] of Object.entries(q.items)) items[item] = (items[item] ?? 0) + n;
  const cost = bundleCost(items);
  const newBuildings = Object.entries(BUILDINGS)
    .filter(([, b]) => (b.level ?? 1) === level)
    .map(([type, b]) => ({ type, name: b.name, cost: b.cost, value: goodsValue(b.cost), raws: bundleCost(b.cost) }));
  const best = bestItem(level);
  const bestCost = unitCost(best);
  return {
    level,
    name: LEVELS[level]?.name ?? '',
    quests: quests.length,
    items,
    value: quests.reduce((s, q) => s + questValue(q), 0),
    gold: quests.reduce((s, q) => s + questReward(q).gold, 0),
    xp: xpNeeded(level),
    cost,
    rawGold: rawGold(cost),
    plants: plantCount(cost),
    machineSeconds: machineSeconds(cost),
    bottleneck: bottleneck(cost),
    newBuildings,
    nextCost: LEVELS[level + 1]?.cost ?? null,
    customersPerHour: customersPerHour(level),
    maxCounters: maxCounters(level),
    best,
    bestStreetPerHour: 3600 / bottleneck(bestCost).seconds,
  };
}

// ---------- Darstellung ----------

const num = (n, digits = 0) => n.toLocaleString('de-DE', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
const smart = (n) => num(n, n >= 100 ? 0 : n >= 10 ? 1 : n >= 1 ? 1 : 2);
const minutes = (seconds) => (seconds >= 3600 ? `${num(seconds / 3600, 1)} h` : `${num(seconds / 60, seconds < 600 ? 1 : 0)} min`);
const hours = (h) => (h >= 1 ? `${num(h, 1)} h` : `${num(h * 60, 0)} min`);
const factor = (a, b) => (b > 0 ? `×${num(a / b, 1)}` : '–');
const itemName = (type, n) => (n === 1 ? ITEMS[type].name : ITEMS[type].plural ?? ITEMS[type].name);

function rawList(cost) {
  const order = Object.keys(ITEMS);
  return Object.entries(cost.raws)
    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([raw, n]) => `${smart(n)} ${itemName(raw, n)}`)
    .join(', ');
}

function goodsList(items) {
  return Object.entries(items)
    .map(([item, n]) => `${num(n)} ${itemName(item, n)}`)
    .join(' + ');
}

function levelTable(all) {
  const rows = [
    '| Level | Aufträge: Waren | Gold beim Abgeben | Erfahrung | Rohstoffe darin | Rohstoffe kosten | Pflanzen | Maschinenzeit | Engpass (eine Straße) | Sprung zum Level davor |',
    '|---|---|---|---|---|---|---|---|---|---|',
  ];
  all.forEach((f, i) => {
    const prev = all[i - 1];
    const jump = prev ? `Gold ${factor(f.gold, prev.gold)}, Zeit ${factor(f.machineSeconds, prev.machineSeconds)}` : '–';
    rows.push(
      `| ${f.level} ${f.name} | ${goodsList(f.items)} | ${num(f.gold)} | ${num(f.xp)} | ${rawList(f.cost)} | ${num(f.rawGold)} | ${f.plants ? smart(f.plants) : '–'} | ${minutes(f.machineSeconds)} | ${minutes(f.bottleneck.seconds)} (${f.bottleneck.station}) | ${jump} |`,
    );
  });
  return rows.join('\n');
}

function buildingTable(all) {
  const rows = ['| Level | Gebäude | Baukosten | Wert der Waren | Rohstoffe darin |', '|---|---|---|---|---|'];
  for (const f of all) {
    for (const b of f.newBuildings) {
      rows.push(`| ${f.level} | ${b.name} | ${goodsList(b.cost)} | ${num(b.value)} | ${rawList(b.raws)} (${num(rawGold(b.raws))} Gold) |`);
    }
  }
  return rows.join('\n');
}

function upgradeTable(all) {
  const rows = [
    '| Level | Aufstieg danach | Aufträge bringen | davon geht in den Aufstieg | Kunden je Theke und Stunde | wertvollste Ware | Theken verkaufen davon höchstens (2 / alle) | eine Straße dieser Ware schafft |',
    '|---|---|---|---|---|---|---|---|',
  ];
  for (const f of all) {
    const price = ITEMS[f.best].price;
    const perCounter = f.customersPerHour * price;
    const next = f.nextCost == null ? '– (letztes Level)' : num(f.nextCost);
    const share = f.nextCost == null ? '–' : `${num((f.nextCost / f.gold) * 100)} %`;
    rows.push(
      `| ${f.level} | ${next} | ${num(f.gold)} | ${share} | ${num(f.customersPerHour)} | ${ITEMS[f.best].name} (${num(price)}) | ${num(2 * perCounter)} / ${num(f.maxCounters * perCounter)} Gold/h (${f.maxCounters} Theken) | ${num(f.bestStreetPerHour, 1)} Stück/h = ${num(f.bestStreetPerHour * price)} Gold/h |`,
    );
  }
  return rows.join('\n');
}

// Wofür man Gold ausgibt (außer Rohstoffen und Aufstiegen)
function spendTable() {
  const storage = Array.from({ length: STORAGE_UPGRADE.max }, (_, i) => STORAGE_UPGRADE.firstPrice + i * STORAGE_UPGRADE.priceStep);
  const sides = 4;
  const land = LAND.prices.map((p) => p * sides);
  const more = LAND_MORE.map((m) => ({ ...m, total: m.price * m.strips * sides }));
  const rows = ['| Wofür | ab Level | Preise | zusammen |', '|---|---|---|---|'];
  rows.push(`| Theken ${COUNTERS.start + 1}–${COUNTERS.max} | ${[...new Set(COUNTERS.levels)].join(', ')} | ${COUNTERS.prices.map((p) => num(p)).join(' / ')} | ${num(COUNTERS.prices.reduce((a, b) => a + b, 0))} |`);
  rows.push(`| Laden-Lager vergrößern (${STORAGE_UPGRADE.max} × ${STORAGE_UPGRADE.size} Plätze) | ${STORAGE_UPGRADE.level} | ${num(storage[0])} bis ${num(storage.at(-1))} | ${num(storage.reduce((a, b) => a + b, 0))} |`);
  rows.push(`| Fläche (je Seite ${LAND.prices.length} Streifen, ${sides} Seiten) | 1 | ${LAND.prices.map((p) => num(p)).join(' / ')} je Streifen | ${num(land.reduce((a, b) => a + b, 0))} |`);
  for (const m of more) rows.push(`| mehr Fläche (je Seite ${m.strips} Streifen) | ${m.level} | ${num(m.price)} je Streifen | ${num(m.total)} |`);
  return rows.join('\n');
}

function itemTable() {
  const rows = [
    '| Ware | ab Level | Wert | Rohstoffe darin | Rohstoffe kosten | Aufschlag | Maschinenzeit je Stück | Engpass je Stück | eine Straße: Gold/h |',
    '|---|---|---|---|---|---|---|---|---|',
  ];
  const types = Object.keys(ITEMS).filter((t) => !ITEMS[t].raw && ITEMS[t].price);
  types.sort((a, b) => itemLevel(a) - itemLevel(b) || ITEMS[a].price - ITEMS[b].price);
  for (const type of types) {
    const def = ITEMS[type];
    const cost = unitCost(type);
    const raw = rawGold(cost);
    const neck = bottleneck(cost);
    rows.push(
      `| ${def.name} | ${itemLevel(type)} | ${num(def.price)} | ${rawList(cost)} | ${smart(raw)} | ${raw ? `+${num((def.price / raw - 1) * 100)} %` : '–'} | ${num(machineSeconds(cost), 1)} s | ${num(neck.seconds, 1)} s | ${num((3600 / neck.seconds) * def.price)} |`,
    );
  }
  return rows.join('\n');
}

export function buildReport() {
  const all = [];
  for (let level = 1; level <= MAX_LEVEL; level++) all.push(levelFigures(level));
  return `# Zahlen

> **Automatisch erzeugt** mit \`node tools/zahlen.mjs\` aus den Datentabellen (\`src/core/data/\`) – nicht von Hand ändern. Ein Test prüft, dass diese Seite zu den Tabellen passt. Gehört zu \`docs/inhalte/\`; nur lesen, wenn wir Zahlen festlegen (neue Level, Preise, Mengen, Baukosten).

**So wird gerechnet:** alles je Stück und ohne Wege auf den Bändern. *Rohstoffe darin:* rückwärts bis zu dem, was man beim Händler kauft (Samen für Pflanzen). *Maschinenzeit:* alle Sekunden, die Rohstoff-Gebäude und Maschinen arbeiten (die Zeit im Beet zählt nicht, sie steht unter *Pflanzen*: je 30 Minuten). *Engpass:* Steht für jeden Schritt genau ein Gebäude bereit (eine Straße, je Pflanze ein Beet), bestimmt der langsamste Schritt das Tempo – mehr Gebäude für diesen Schritt machen die Straße schneller. *Theken:* Jeder Kunde kauft 1 Stück.

## Je Level: die Aufträge

${levelTable(all)}

## Aufstieg und Theken

*Davon geht in den Aufstieg:* welcher Teil des Golds aus den Aufträgen des Levels für den nächsten Aufstieg gebraucht wird (unter 100 % bezahlen die Aufträge ihn allein). *Theken verkaufen höchstens:* so viel Gold pro Stunde bringen 2 bzw. alle möglichen Theken, wenn sie nur die wertvollste Ware verkaufen und sie nie ausgeht. *Eine Straße:* so viele Stück schafft je ein Gebäude pro Schritt in einer Stunde.

${upgradeTable(all)}

## Wofür man Gold ausgibt

Neben Rohstoffen und Aufstiegen (Preise aus \`data/shop.js\` und \`data/land.js\`):

${spendTable()}

## Neue Gebäude je Level

${buildingTable(all)}

## Je Ware

*Aufschlag:* wie viel mehr die Ware bringt, als ihre Rohstoffe beim Händler kosten.

${itemTable()}
`;
}

// Direkt aufgerufen: Seite schreiben
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  writeFileSync(`${root}${REPORT_PATH}`, buildReport());
  console.log(`${REPORT_PATH} geschrieben.`);
}
