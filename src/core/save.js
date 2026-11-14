// Spielstand in Text umwandeln und zurück, mit Prüfung auf Beschädigung.
// Steigt SAVE_VERSION, wandelt migrate() alte Spielstände um, damit keine
// Fabrik verloren geht.
//
// Versionen:
//   1 (v0.4.x): Gebäude, Förderbänder
//   2 (v0.5.0): + Laden-Lager, Zustand der Gebäude, Waren auf Bändern
//   3 (v0.6.0): Techbaum – Sägewerk und Steinmetz 2 × 2, Holzwinkel → Holzplatte,
//               Splitt → Stein-Zahnrad, Eisen-Kette
//   4 (v0.6.1): größeres Grundstück (22 × 14) und größere Welt (40 × 26)
//   5 (v0.7.0): Handel – Verkaufstheken, Kunden (market), bezahlte Baukosten
//               an Gebäuden (paid) und Bändern (paid: true)
//   6 (v0.8.0): Eisenstange statt Eisennägel (je 5 Nägel → 1 Stange, aufgerundet)
//   7 (v0.9.0): Laden-Level mit Freischalten, Zähler hergestellter Waren
//               (produced), gekaufte Fläche (landBought). Bestehende Fabriken
//               bekommen Level 3, damit nichts gesperrt wird.
//   8 (v0.9.1): Startkapital – bestehende Spielstände bekommen START_GOLD
//               einmalig nachgezahlt (Format sonst unverändert).
//   9 (v0.10.2): Die Welt hat eine eigene Ecke (world.x, world.y) und reicht
//               auf jeder Seite 8 Felder über das Startgrundstück hinaus
//               (2 Flächenkäufe à 4). Gebäude, Bänder und Grundstück behalten
//               ihre Felder; schon gekaufte Fläche bleibt.
//  10 (v0.12.0): Lagerhäuser merken sich ihren Nachschub aus dem Laden-Lager
//               (prod.supply: { type, keep } oder null). Bestehende Lagerhäuser
//               bekommen null – sie laufen weiter wie bisher.
//  11 (v0.13.0): Neue Namen für 8 Waren (z. B. Mechanischer Schalter →
//               Räderwerk), überall im Spielstand. Aufträge mit Erfahrung
//               (quest, xpTotal); das Level bleibt, die Aufträge des aktuellen
//               Levels beginnen von vorn.
//  12 (v0.14.0): Rohstoff-Vorrat – Holzfällerlager, Steinbruch und
//               Schmelzhütte merken sich wartende Rohstoffe (prod.queued).
//               Den Nachschub der Lagerhäuser gibt es nicht mehr (prod.supply
//               fällt weg; was im Lagerhaus liegt, bleibt).
//  13 (v0.16.0): Kräuter-Kapitel, Level 7 – Beete (prod.crop, prod.timer),
//               neue Waren und Gebäude. Bestehende Spielstände bleiben
//               unverändert.
//  14 (v0.17.0): Level 8 – die Erntebank (bisher Flachsbreche) verarbeitet
//               mehrere Pflanzen. Rohstoff-Gebäude merken sich, welcher
//               Rohstoff läuft (prod.input) und welche warten (prod.queue);
//               bestehende bekommen ihren bisherigen Rohstoff eingetragen.
//  15 (v0.20.0): Versandportale merken sich, welche Waren zuletzt ankamen
//               (prod.recent, fürs Infofenster). Bestehende beginnen mit einer
//               leeren Liste; sonst bleibt alles gleich.
//  16 (v0.23.0): Alle Preise durch 3 (Tobias, Chat 18). Gold und die Beträge
//               der „Letzten Verkäufe“ werden durch 3 geteilt (gerundet), damit
//               das Gleichgewicht bleibt. Waren, Gebäude und Erfahrung bleiben.
//  17 (v0.24.0): Theken kaufen, jede Theke hat ihre eigenen Kunden
//               (market.timers statt market.timer; Verkäufe merken sich ihre
//               Theke). Alle Läden beginnen mit 2 Theken: Was auf den übrigen
//               stand, kommt ins Laden-Lager (auch über die Grenze).

import { BUILDINGS } from './data/buildings.js';
import { ITEMS } from './data/items.js';
import { RECIPES } from './data/recipes.js';
import { MAX_LEVEL } from './data/levels.js';
import { COUNTERS, SALES_LOG_SIZE, START_STORAGE } from './data/shop.js';
import { canPlaceBuilding, findFreeSpot } from './buildings.js';
import { isDir, sortDirs } from './dirs.js';
import { footprintSize, rotateLocal } from './geometry.js';
import { buildingContents, createProductionState, productionOf, sourceInputTypes, sourceInputs } from './production.js';
import { createCounters, createMarket, syncCustomerTimers } from './market.js';
import { createQuestState } from './quests.js';
import { addAllToStorage, counterSizeFor, fitCounters } from './shop.js';
import { fitWorldToLevel } from './land.js';
import { START_PLOT, WORLD, parseTileKey } from './state.js';

export const SAVE_VERSION = 17;

// v0.13.0 (Tobias): Namen, die zu den Zutaten passen. Rezepte und Werte bleiben.
const RENAMED_V11 = {
  minieisenplatte: 'eisenblech',
  handkurbel: 'zahnradwelle',
  schalter: 'raederwerk',
  eisenfeder: 'schluessel',
  kugellager: 'zirkel',
  steinkette: 'gewichtstein',
  regler: 'uhrwerk',
  minischloss: 'vorhaengeschloss',
};
// v0.6.0: Waren und Rezepte, die es nicht mehr gibt, und was aus ihnen wird.
const RENAMED_ITEMS = { holzwinkel: 'holzplatte', splitt: 'steinzahnrad' };
const RENAMED_RECIPES = { holzwinkel: 'holzplatte', splitt: 'steinzahnrad' };
// v0.6.0: Diese Maschinen waren vorher 2 × 1 und sind jetzt 2 × 2.
const GROWN_MACHINES = { saegewerk: [2, 1], steinmetz: [2, 1] };
// v0.6.0: Startvorrat an Eisenerz für bestehende Spielstände.
const IRON_GIFT = 2;
// v0.8.0: So viele Eisennägel ergeben eine Eisenstange (wie das Rezept: 5 Barren → 1 Stange).
const NAILS_PER_BAR = 5;
// v0.9.0: Bestehende Fabriken haben schon Holz, Stein und Eisen – sie bekommen
// dieses Level, damit nichts gesperrt wird.
const EXISTING_FACTORY_LEVEL = 3;
// v0.9.1: So viel Startkapital gab es damals (vor den Preisen durch 3,
// die danach auch dieses Gold teilen).
const V8_START_GOLD = 500;
// v0.23.0: Alle Preise sind durch diese Zahl geteilt.
const PRICE_DIVISOR = 3;
// v0.6.1: So groß wurde die Welt damals (ab Feld 0, 0).
const V4_WORLD = { width: 40, height: 26 };

export function serializeGame(state, now = Date.now()) {
  return JSON.stringify({ saveVersion: SAVE_VERSION, savedAt: now, state });
}

// Gibt { state, savedAt, migratedFrom?, notes? } zurück oder null, wenn der
// Text kein gültiger Spielstand ist. notes: Hinweise zur Umwandlung (Texte).
export function deserializeGame(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object' || !data.state || typeof data.state !== 'object') return null;
  const from = data.saveVersion;
  if (!Number.isInteger(from) || from < 1 || from > SAVE_VERSION) return null;
  const migrationNotes = [];
  const state = migrate(data.state, from, migrationNotes);
  if (!isValidState(state)) return null;
  for (const belt of Object.values(state.belts)) belt.outs = sortDirs(belt.outs);
  // v0.27.0: Die Welt reicht so weit, wie das Level Fläche erlaubt (ab Level 10
  // ein Streifen mehr je Seite) – kein neues Format, nur nachgezogen.
  fitWorldToLevel(state);
  // v0.10.1: Was nicht mehr auf eine Theke passt, kommt ins Laden-Lager.
  const trimmed = fitCounters(state);
  // v0.24.0: Jede Theke hat ihren Kunden-Takt.
  syncCustomerTimers(state);
  const result = { state, savedAt: Number(data.savedAt) || 0 };
  if (from < SAVE_VERSION) {
    result.migratedFrom = from;
    result.notes = [...migrationNotes, ...(from < 3 ? growMachines(state) : [])];
  }
  if (Object.keys(trimmed).length > 0) {
    const n = Object.values(trimmed).reduce((a, b) => a + b, 0);
    result.counterNote = `Die Theken fassen jetzt ${counterSizeFor(state.shopLevel)} Stück – ${n} Waren liegen wieder im Laden-Lager.`;
  }
  return result;
}

function migrate(state, from, notes = []) {
  if (from < 2) {
    // v0.4 → v0.5: Laden-Lager mit Startvorrat, Gebäude bekommen ihren Zustand
    state.storage = { ...START_STORAGE };
    if (Array.isArray(state.buildings)) {
      for (const b of state.buildings) if (b && BUILDINGS[b.type]) b.prod = createProductionState(b.type);
    }
  }
  if (from < 3) {
    // v0.5 → v0.6: Holzwinkel → Holzplatte, Splitt → Stein-Zahnrad, dazu Eisenerz.
    // Daten werden hier noch nicht geprüft, deshalb vorsichtig umbenennen.
    renameItems(state);
    if (from >= 2 && isObj(state.storage)) {
      state.storage.eisenerz = (isCount(state.storage.eisenerz) ? state.storage.eisenerz : 0) + IRON_GIFT;
    }
  }
  if (from < 4 && isObj(state.world) && isObj(state.plot)) {
    // v0.6.0 → v0.6.1: Grundstück und Welt wachsen nach rechts und unten.
    // Gebäude und Bänder bleiben, wo sie sind.
    const grow = (obj, key, min) => {
      if (isInt(obj[key])) obj[key] = Math.max(obj[key], min);
    };
    grow(state.world, 'width', V4_WORLD.width);
    grow(state.world, 'height', V4_WORLD.height);
    grow(state.plot, 'width', START_PLOT.width);
    grow(state.plot, 'height', START_PLOT.height);
  }
  if (from < 5) {
    // v0.6.1 → v0.7.0: Theken und Kunden kommen dazu. Gold, Gebäude und Lager
    // bleiben, wie sie sind; was schon steht, wird nicht nachträglich berechnet.
    state.counters = createCounters();
    state.market = createMarket();
  }
  if (from < 6) convertNails(state, notes);
  if (from < 7) {
    // v0.8 → v0.9: Laden-Level, Zähler hergestellter Waren, Flächenkauf.
    // Bisher Hergestelltes wurde nicht gezählt; der Zähler beginnt bei null.
    state.shopLevel = Math.max(isInt(state.shopLevel) ? state.shopLevel : 1, EXISTING_FACTORY_LEVEL);
    state.produced = {};
    state.landBought = 0;
  }
  if (from < 8 && isNum(state.gold)) {
    // v0.9.0 → v0.9.1: Das Startkapital gibt es für bestehende Spielstände einmalig dazu.
    state.gold += V8_START_GOLD;
  }
  if (from < 9) fitWorld(state);
  if (from < 10 && Array.isArray(state.buildings)) {
    // v0.11 → v0.12: Lagerhäuser ohne Nachschub
    for (const b of state.buildings) {
      if (isObj(b?.prod) && productionOf(b.type)?.kind === 'storage' && b.prod.supply === undefined) b.prod.supply = null;
    }
  }
  if (from < 11) {
    // v0.12 → v0.13: neue Warennamen, Aufträge beginnen auf dem aktuellen Level
    renameEverywhere(state, RENAMED_V11);
    state.quest = createQuestState();
    state.xpTotal = 0;
  }
  if (from < 12 && Array.isArray(state.buildings)) {
    // v0.13 → v0.14: Rohstoff-Vorrat (leer), Lagerhäuser ohne Nachschub
    let supplied = 0;
    for (const b of state.buildings) {
      if (!isObj(b?.prod)) continue;
      const kind = productionOf(b.type)?.kind;
      if (kind === 'source' && b.prod.queued === undefined) b.prod.queued = 0;
      if (kind === 'storage' && 'supply' in b.prod) {
        if (b.prod.supply) supplied++;
        delete b.prod.supply;
      }
    }
    if (supplied > 0) {
      notes.push(
        `${supplied === 1 ? '1 Lagerhaus hatte' : `${supplied} Lagerhäuser hatten`} Nachschub – den gibt es nicht mehr. Was darin liegt, läuft noch aufs Band; danach von Hand befüllen.`,
      );
    }
  }
  if (from < 14 && Array.isArray(state.buildings)) {
    // v0.16 → v0.17: Rohstoff-Gebäude merken sich, welcher Rohstoff läuft und
    // welche warten. Bisher hatte jedes nur einen Rohstoff – den ersten.
    for (const b of state.buildings) {
      if (!isObj(b?.prod) || productionOf(b.type)?.kind !== 'source') continue;
      const first = sourceInputTypes(b.type)[0];
      if (b.prod.input === undefined) b.prod.input = b.prod.loaded ? first : null;
      if (b.prod.queue === undefined) b.prod.queue = isCount(b.prod.queued) ? Array(b.prod.queued).fill(first) : [];
    }
  }
  if (from < 15 && Array.isArray(state.buildings)) {
    // v0.19 → v0.20: Versandportale merken sich die zuletzt versendeten Waren.
    for (const b of state.buildings) {
      if (isObj(b?.prod) && productionOf(b.type)?.kind === 'shipping' && b.prod.recent === undefined) b.prod.recent = [];
    }
  }
  if (from < 16) {
    // v0.22 → v0.23: Alle Preise durch 3 – Gold und die letzten Verkäufe auch.
    if (isNum(state.gold)) state.gold = Math.round(state.gold / PRICE_DIVISOR);
    for (const sale of Array.isArray(state.market?.sales) ? state.market.sales : []) {
      if (isObj(sale) && isNum(sale.gold)) sale.gold = Math.round(sale.gold / PRICE_DIVISOR);
    }
  }
  if (from < 17) shrinkCounters(state, notes);
  return state;
}

// v0.23 → v0.24: Theken kaufen (Tobias, Chat 17: „ändere das bei mir auch
// direkt auf 2 Theken“). Die ersten beiden Theken bleiben, die Waren der
// übrigen kommen ins Laden-Lager (auch über die Grenze, damit nichts verloren
// geht). Jede Theke bekommt nach der Prüfung ihren eigenen Kunden-Takt.
// Daten werden hier noch nicht geprüft, deshalb vorsichtig.
function shrinkCounters(state, notes) {
  if (isObj(state.market)) {
    delete state.market.timer;
    state.market.timers = [];
  }
  if (!Array.isArray(state.counters) || state.counters.length <= COUNTERS.start || !isObj(state.storage)) return;
  const removed = state.counters.length - COUNTERS.start;
  let goods = 0;
  for (const c of state.counters.splice(COUNTERS.start)) {
    if (!isObj(c) || !isItem(c.type) || !isCount(c.count) || c.count === 0) continue;
    state.storage[c.type] = (isCount(state.storage[c.type]) ? state.storage[c.type] : 0) + c.count;
    goods += c.count;
  }
  const which = removed === 1 ? `Theke ${COUNTERS.start + 1} ist` : `Theken ${COUNTERS.start + 1} bis ${COUNTERS.start + removed} sind`;
  notes.push(`Deine ${which} abgebaut${goods > 0 ? ` – ${goods} Waren davon liegen wieder im Laden-Lager` : ''}.`);
}

// v0.12 → v0.13: Benennt Waren (und gleichnamige Rezepte) überall im
// Spielstand um. Daten werden hier noch nicht geprüft, deshalb vorsichtig.
function renameEverywhere(state, map) {
  const rename = (t) => map[t] ?? t;
  const renameCounts = (counts) => {
    if (!isObj(counts)) return counts;
    const out = {};
    for (const [t, n] of Object.entries(counts)) {
      const key = rename(t);
      out[key] = isCount(out[key]) && isCount(n) ? out[key] + n : n;
    }
    return out;
  };
  const renameStack = (stack) => {
    if (isObj(stack) && typeof stack.type === 'string') stack.type = rename(stack.type);
  };
  state.storage = renameCounts(state.storage);
  state.produced = renameCounts(state.produced);
  if (Array.isArray(state.counters)) state.counters.forEach(renameStack);
  if (isObj(state.belts)) for (const belt of Object.values(state.belts)) if (isObj(belt)) renameStack(belt.item);
  if (isObj(state.market) && Array.isArray(state.market.sales)) {
    for (const sale of state.market.sales) if (isObj(sale)) sale.items = renameCounts(sale.items);
  }
  if (!Array.isArray(state.buildings)) return;
  for (const b of state.buildings) {
    if (!isObj(b)) continue;
    if (b.paid !== undefined) b.paid = renameCounts(b.paid);
    const prod = b.prod;
    if (!isObj(prod)) continue;
    renameStack(prod.out);
    renameStack(prod.supply);
    if (isObj(prod.stock)) prod.stock = renameCounts(prod.stock);
    if (Array.isArray(prod.slots)) prod.slots.forEach(renameStack);
    if (typeof prod.recipe === 'string') prod.recipe = rename(prod.recipe);
  }
}

// v0.10.1 → v0.10.2: Die Welt bekommt eine eigene Ecke und ist so groß, dass
// man an jeder Seite 2 Streifen kaufen kann. Was schon gekauft ist, bleibt
// (auch wenn es weiter reicht); die Welt umfasst dann beides.
function fitWorld(state) {
  const p = state.plot;
  if (!isObj(p) || ![p.x, p.y, p.width, p.height].every(isInt)) return;
  const x = Math.min(WORLD.x, p.x);
  const y = Math.min(WORLD.y, p.y);
  const right = Math.max(WORLD.x + WORLD.width, p.x + p.width);
  const bottom = Math.max(WORLD.y + WORLD.height, p.y + p.height);
  state.world = { x, y, width: right - x, height: bottom - y };
}

// v0.7 → v0.8: Eisennägel gibt es nicht mehr. Je 5 Nägel werden zu 1 Eisenstange
// (aufgerundet) – im Lager, auf Theken, in Lagerhäusern und in der Schmiede.
// Einzelne Nägel auf Bändern kommen zusammengezählt ins Laden-Lager.
// Daten werden hier noch nicht geprüft, deshalb vorsichtig.
function convertNails(state, notes) {
  const OLD = 'eisennagel';
  const NEW = 'eisenstange';
  const bars = (n) => Math.ceil(n / NAILS_PER_BAR);
  let nails = 0;
  let made = 0;
  let loose = 0; // Nägel ohne festen Platz (Lager, Bänder) → zusammen ins Lager
  const takeLoose = (counts) => {
    if (!isObj(counts) || !isCount(counts[OLD])) return;
    loose += counts[OLD];
    delete counts[OLD];
  };
  const convertStack = (stack) => {
    if (!isObj(stack) || stack.type !== OLD || !isCount(stack.count)) return;
    nails += stack.count;
    stack.type = NEW;
    stack.count = bars(stack.count);
    made += stack.count;
  };

  takeLoose(state.storage);
  if (isObj(state.belts)) {
    for (const belt of Object.values(state.belts)) {
      if (isObj(belt) && isObj(belt.item) && belt.item.type === OLD) {
        loose++;
        belt.item = null;
      }
    }
  }
  if (Array.isArray(state.counters)) {
    for (const counter of state.counters) convertStack(counter);
  }
  if (Array.isArray(state.buildings)) {
    for (const b of state.buildings) {
      const prod = b?.prod;
      if (!isObj(prod)) continue;
      if (prod.recipe === OLD) prod.recipe = NEW;
      convertStack(prod.out);
      if (Array.isArray(prod.slots)) prod.slots.forEach(convertStack);
      takeLoose(prod.stock);
      takeLoose(b.paid);
    }
  }
  if (isObj(state.market) && Array.isArray(state.market.sales)) {
    // Alte Verkäufe von Nägeln aus der Liste „Letzte Verkäufe“ nehmen
    for (const sale of state.market.sales) if (isObj(sale)) delete sale.items?.[OLD];
    state.market.sales = state.market.sales.filter((sale) => !isObj(sale?.items) || Object.keys(sale.items).length > 0);
  }
  if (loose > 0 && isObj(state.storage)) {
    nails += loose;
    made += bars(loose);
    state.storage[NEW] = (isCount(state.storage[NEW]) ? state.storage[NEW] : 0) + bars(loose);
  }
  if (nails > 0) {
    notes.push(`${nails} Eisennägel wurden zu ${made} Eisenstange${made === 1 ? '' : 'n'}.`);
  }
}

function renameItems(state) {
  const rename = (t) => RENAMED_ITEMS[t] ?? t;
  const renameStack = (stack) => {
    if (isObj(stack)) stack.type = rename(stack.type);
  };
  const renameCounts = (counts) => {
    if (!isObj(counts)) return counts;
    const out = {};
    for (const [t, n] of Object.entries(counts)) {
      const key = rename(t);
      out[key] = isCount(out[key]) && isCount(n) ? out[key] + n : n;
    }
    return out;
  };
  state.storage = renameCounts(state.storage);
  if (isObj(state.belts)) for (const belt of Object.values(state.belts)) if (isObj(belt)) renameStack(belt.item);
  if (!Array.isArray(state.buildings)) return;
  for (const b of state.buildings) {
    const prod = b?.prod;
    if (!isObj(prod)) continue;
    renameStack(prod.out);
    if (isObj(prod.stock)) prod.stock = renameCounts(prod.stock);
    if (Array.isArray(prod.slots)) prod.slots.forEach(renameStack);
    if (typeof prod.recipe === 'string') prod.recipe = RENAMED_RECIPES[prod.recipe] ?? prod.recipe;
  }
}

// v0.5 → v0.6: Sägewerk und Steinmetz wachsen von 2 × 1 auf 2 × 2. Die
// Anschlüsse bleiben an ihrem Platz, das Gebäude wächst auf der Seite gegenüber
// den Pfeilen (ungedreht: nach unten). Ist dort kein Platz, rückt es an die
// nächste freie Stelle; geht auch das nicht, wird es abgerissen und sein
// Inhalt kommt ins Laden-Lager. Läuft erst, wenn der Spielstand geprüft ist.
function growMachines(state) {
  const grown = state.buildings.filter((b) => GROWN_MACHINES[b.type]);
  if (grown.length === 0) return [];
  // Erst alle herausnehmen: Mit der neuen Größe würden sie sich sonst
  // gegenseitig im Weg stehen.
  state.buildings = state.buildings.filter((b) => !GROWN_MACHINES[b.type]);
  let moved = 0;
  let removed = 0;
  for (const b of grown) {
    const [oldW, oldH] = GROWN_MACHINES[b.type];
    const [newW, newH] = BUILDINGS[b.type].size;
    const oldCorner = rotateLocal(0, 0, oldW, oldH, b.rot);
    const newCorner = rotateLocal(0, 0, newW, newH, b.rot);
    const x = b.x + oldCorner.x - newCorner.x;
    const y = b.y + oldCorner.y - newCorner.y;
    if (canPlaceBuilding(state, b.type, x, y, b.rot)) {
      Object.assign(b, { x, y });
      state.buildings.push(b);
      continue;
    }
    const size = footprintSize(b.type, b.rot);
    const spot = findFreeSpot(state, b.type, b.rot, x + Math.floor((size.width - 1) / 2), y + Math.floor((size.height - 1) / 2));
    if (spot) {
      Object.assign(b, spot);
      state.buildings.push(b);
      moved++;
    } else {
      addAllToStorage(state, buildingContents(b));
      removed++;
    }
  }
  state.buildings.sort((a, b) => a.id - b.id);
  const notes = [];
  if (moved) notes.push(`${moved} Maschine${moved > 1 ? 'n' : ''} hatte${moved > 1 ? 'n' : ''} keinen Platz zum Wachsen und wurde${moved > 1 ? 'n' : ''} versetzt – bitte neu anschließen.`);
  if (removed) notes.push(`${removed} Maschine${removed > 1 ? 'n' : ''} passte${removed > 1 ? 'n' : ''} nicht mehr aufs Grundstück und wurde${removed > 1 ? 'n' : ''} abgerissen; der Inhalt liegt im Laden-Lager.`);
  return notes;
}

const isInt = (n) => Number.isInteger(n);
const isCount = (n) => isInt(n) && n >= 0;
const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
const isItem = (t) => typeof t === 'string' && Boolean(ITEMS[t]);
const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);

function isValidStack(stack) {
  return stack === null || (isObj(stack) && isItem(stack.type) && isInt(stack.count) && stack.count > 0);
}

function isValidProduction(b) {
  const p = productionOf(b.type);
  const prod = b.prod;
  if (!isObj(prod)) return false;
  switch (p?.kind) {
    case 'source':
      return (
        typeof prod.loaded === 'boolean' &&
        isCount(prod.remaining) &&
        isNum(prod.timer) &&
        isValidStack(prod.out) &&
        // v0.14.0: wartende Rohstoffe – nur, wenn einer läuft, und höchstens bis zum Rand
        isCount(prod.queued) &&
        (prod.loaded || prod.queued === 0) &&
        (prod.loaded ? 1 : 0) + prod.queued <= (p.capacity ?? 1) &&
        // v0.17.0: welcher Rohstoff läuft und welche warten
        (prod.loaded ? Boolean(sourceInputs(p)[prod.input]) : prod.input === null) &&
        Array.isArray(prod.queue) &&
        prod.queue.length === prod.queued &&
        prod.queue.every((t) => Boolean(sourceInputs(p)[t]))
      );
    case 'workshop':
      return (
        p.recipes.includes(prod.recipe) &&
        Boolean(RECIPES[prod.recipe]) &&
        isObj(prod.stock) &&
        Object.entries(prod.stock).every(([t, n]) => isItem(t) && isCount(n)) &&
        typeof prod.busy === 'boolean' &&
        isNum(prod.timer) &&
        isValidStack(prod.out)
      );
    case 'storage':
      return (
        Array.isArray(prod.slots) &&
        prod.slots.length <= p.slots &&
        prod.slots.every((s) => isObj(s) && isItem(s.type) && isInt(s.count) && s.count > 0 && s.count <= p.slotSize)
      );
    case 'shipping':
      // v0.20.0: zuletzt versendete Waren, jede höchstens einmal
      return (
        isCount(prod.shipped) &&
        Array.isArray(prod.recent) &&
        prod.recent.length <= (p.recent ?? 3) &&
        prod.recent.every(isItem) &&
        new Set(prod.recent).size === prod.recent.length
      );
    case 'garden':
      // v0.16.0: leer (crop null, timer 0) oder ein Samen, der wächst
      if (prod.crop === null) return prod.timer === 0;
      return typeof prod.crop === 'string' && Boolean(p.crops[prod.crop]) && isNum(prod.timer) && prod.timer >= 0 && prod.timer <= p.crops[prod.crop].time;
    default:
      return true;
  }
}

function isValidCost(cost) {
  return isObj(cost) && Object.entries(cost).every(([t, n]) => isItem(t) && isCount(n));
}

function isValidMarket(m) {
  if (!isObj(m)) return false;
  // v0.24.0: ein Kunden-Takt je Theke (fehlende ergänzt syncCustomerTimers)
  if (!isCount(m.rng) || m.rng > 0xffffffff || !Array.isArray(m.timers) || !m.timers.every(isNum)) return false;
  if (!isInt(m.nextSaleId) || m.nextSaleId < 1 || !isCount(m.gifts)) return false;
  if (!Array.isArray(m.sales) || m.sales.length > SALES_LOG_SIZE) return false;
  return m.sales.every(
    (sale) =>
      isObj(sale) &&
      isInt(sale.id) &&
      sale.id < m.nextSaleId &&
      isCount(sale.gold) &&
      isValidCost(sale.items) &&
      (sale.counter === undefined || isCount(sale.counter)),
  );
}

function isValidCounter(c) {
  if (!isObj(c) || !isCount(c.count)) return false;
  if (c.type === null) return c.count === 0;
  return isItem(c.type) && !ITEMS[c.type].raw;
}

export function isValidState(s) {
  if (!isObj(s)) return false;
  if (!isNum(s.gold)) return false;
  if (!isInt(s.shopLevel) || s.shopLevel < 1 || s.shopLevel > MAX_LEVEL) return false;
  if (!isObj(s.produced) || !Object.entries(s.produced).every(([t, n]) => isItem(t) && isCount(n))) return false;
  if (!isCount(s.landBought)) return false;
  // v0.13.0: Aufträge
  if (!isObj(s.quest) || !isCount(s.quest.index) || !isCount(s.quest.xp) || !isCount(s.xpTotal)) return false;

  const w = s.world;
  if (!w || ![w.x, w.y, w.width, w.height].every(isInt) || w.width <= 0 || w.height <= 0) return false;
  const p = s.plot;
  if (!p || ![p.x, p.y, p.width, p.height].every(isInt)) return false;
  if (p.x < w.x || p.y < w.y || p.width <= 0 || p.height <= 0) return false;
  if (p.x + p.width > w.x + w.width || p.y + p.height > w.y + w.height) return false;

  if (!Array.isArray(s.buildings) || !isInt(s.nextBuildingId)) return false;
  const ids = new Set();
  for (const b of s.buildings) {
    if (!b || !isInt(b.id) || ids.has(b.id) || !BUILDINGS[b.type]) return false;
    if (!isInt(b.x) || !isInt(b.y) || !isInt(b.rot) || b.rot < 0 || b.rot > 3) return false;
    if (b.id >= s.nextBuildingId) return false;
    if (b.paid !== undefined && !isValidCost(b.paid)) return false;
    if (!isValidProduction(b)) return false;
    ids.add(b.id);
  }

  if (!isObj(s.belts)) return false;
  for (const [key, belt] of Object.entries(s.belts)) {
    const { x, y } = parseTileKey(key);
    if (!isInt(x) || !isInt(y) || key !== `${x},${y}`) return false;
    if (!isObj(belt) || !Array.isArray(belt.outs) || belt.outs.length === 0 || belt.outs.length > 4) return false;
    if (!belt.outs.every(isDir) || new Set(belt.outs).size !== belt.outs.length) return false;
    if (belt.rr !== undefined && !isCount(belt.rr)) return false;
    if (belt.paid !== undefined && belt.paid !== true) return false;
    if (belt.lastFrom !== undefined && belt.lastFrom !== null && !isDir(belt.lastFrom)) return false;
    if (belt.item !== undefined && belt.item !== null) {
      const it = belt.item;
      if (!isObj(it) || !isItem(it.type) || !isNum(it.progress) || it.progress < 0 || it.progress > 1) return false;
      if (!isDir(it.from)) return false;
    }
  }

  if (!isObj(s.storage)) return false;
  if (!Object.entries(s.storage).every(([t, n]) => isItem(t) && isCount(n))) return false;

  if (!Array.isArray(s.counters) || s.counters.length === 0 || !s.counters.every(isValidCounter)) return false;
  if (!isValidMarket(s.market)) return false;
  return true;
}
