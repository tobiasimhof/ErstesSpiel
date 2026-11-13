// Handel (v0.7.0): Händler, Verkaufstheken, Kunden, Pleiteschutz, Testpaket.
// Kennt keine Grafik.
//
// - Händler: verkauft Rohstoffe gegen Gold, sie landen im Laden-Lager.
// - Theken: werden von Hand aus dem Laden-Lager bestückt, je eine Sorte.
//   Jeder beginnt mit 2 Theken, weitere kauft man mit Gold (v0.24.0).
// - Kunden: Jede Theke hat ihre eigenen Kunden (v0.24.0). Sie kommen in
//   zufälligen Abständen (market.timers, einer je Theke) und kaufen zum festen
//   Wert der Ware; wie oft, hängt vom Level ab. Der Zufall steckt im
//   Spielstand (market.rng), damit sich Abläufe in Tests wiederholen lassen.
// - Pleiteschutz: Wer gar nicht mehr weiterkommt, bekommt einen Holzstamm.
// - Auffüllen (v0.14.0): Holzfällerlager & Co. bis zum Rand füllen – erst aus
//   dem Laden-Lager, was fehlt, direkt beim Händler gekauft.
// - Säen (v0.16.0): einen Samen ins Beet – aus dem Laden-Lager, sonst direkt
//   beim Händler gekauft.

import { ITEMS } from './data/items.js';
import { BAILOUT_ITEM, COUNTERS, CUSTOMERS, SALES_LOG_SIZE, SHOP_LEVELS, TEST_PACK } from './data/shop.js';
import { isItemUnlocked, itemLevel } from './levels.js';
import {
  addRawToSource,
  buildingContents,
  gardenCrop,
  gardenSeeds,
  loadInput,
  plantSeed,
  productionOf,
  sourceInputTypes,
  sourceRoom,
  sowFromStorage,
} from './production.js';
import {
  addToStorage,
  counterSizeFor,
  emptyCounter,
  perCounterFor,
  storageCount,
  storageFree,
  takeFromStorage,
} from './shop.js';

// ---------- Zufall ----------

// Kleiner Zufallsgenerator (mulberry32). Der Zustand ist eine ganze Zahl im Spielstand.
export function nextRandom(market) {
  market.rng = (market.rng + 0x6d2b79f5) >>> 0;
  let t = market.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function randomInt(market, min, max) {
  return min + Math.floor(nextRandom(market) * (max - min + 1));
}

// v0.24.0: Im Schnitt so viele Sekunden zwischen zwei Kunden einer Theke –
// so oft, dass sie perCounter Stück pro Minute verkauft.
export function customerSeconds(level) {
  const items = (CUSTOMERS.minItems + CUSTOMERS.maxItems) / 2;
  return (items * 60) / perCounterFor(level);
}

// Kürzester und längster Abstand zwischen zwei Kunden einer Theke (für Texte).
export function customerRange(level) {
  const avg = customerSeconds(level);
  return { min: avg * (1 - CUSTOMERS.spread), max: avg * (1 + CUSTOMERS.spread) };
}

function customerInterval(market, level) {
  const { min, max } = customerRange(level);
  return min + nextRandom(market) * (max - min);
}

// counters: so viele Theken bekommen gleich ihren ersten Kunden.
export function createMarket(seed = (Math.random() * 4294967296) >>> 0, counters = COUNTERS.start, level = 1) {
  const market = { rng: seed >>> 0, timers: [], sales: [], nextSaleId: 1, gifts: 0 };
  while (market.timers.length < counters) market.timers.push(customerInterval(market, level));
  return market;
}

// v0.24.0: Jede Theke hat genau einen Kunden-Takt. Fehlt einer (neue Theke,
// alter Spielstand), bekommt sie einen; überzählige fallen weg.
export function syncCustomerTimers(state) {
  const timers = state.market.timers;
  while (timers.length < state.counters.length) timers.push(customerInterval(state.market, state.shopLevel));
  if (timers.length > state.counters.length) timers.length = state.counters.length;
}

export function shopLevelData(state) {
  return SHOP_LEVELS[state.shopLevel] ?? SHOP_LEVELS[1];
}

export function createCounters() {
  return Array.from({ length: COUNTERS.start }, emptyCounter);
}

// Darf eine Ware auf die Theke? (Rohstoffe haben keinen Verkaufswert.)
export function isSellable(type) {
  return Boolean(ITEMS[type]) && !ITEMS[type].raw && ITEMS[type].price > 0;
}

// ---------- Händler ----------

// Ergebnis: 'ok' | 'gold' (zu wenig Gold) | 'full' (Laden-Lager voll) |
// 'locked' (erst ab einem höheren Laden-Level, v0.9.0) | 'invalid'
export function buyRaw(state, type) {
  const def = ITEMS[type];
  if (!def?.raw || !(def.buyPrice > 0)) return 'invalid';
  if (!isItemUnlocked(state, type)) return 'locked';
  if (state.gold < def.buyPrice) return 'gold';
  if (storageFree(state) < 1) return 'full';
  state.gold -= def.buyPrice;
  addToStorage(state, type, 1);
  return 'ok';
}

// ---------- Auffüllen (v0.14.0) ----------

// Was „Auffüllen“ gerade tun würde: { input, room, fromStorage, buy, cost,
// short } – short: so viele passen noch hinein, aber dafür reicht weder das
// Laden-Lager noch das Gold. Gibt null zurück, wenn es kein Rohstoff-Gebäude ist.
export function refillPlan(state, building) {
  const p = productionOf(building.type);
  if (p?.kind !== 'source') return null;
  const input = refillInput(state, building);
  const def = ITEMS[input];
  const room = sourceRoom(building);
  const fromStorage = Math.min(room, storageCount(state, input));
  const canBuy = isItemUnlocked(state, input) && def.buyPrice > 0 ? Math.floor(state.gold / def.buyPrice) : 0;
  const buy = Math.min(room - fromStorage, canBuy);
  return { input, room, fromStorage, buy, cost: buy * (def.buyPrice ?? 0), short: room - fromStorage - buy };
}

// v0.17.0: Womit „Auffüllen“ füllt. Holzfällerlager & Co.: ihr Rohstoff.
// Erntebank: die Pflanze, die gerade verarbeitet wird; ist sie leer, die
// Pflanze, von der am meisten im Laden-Lager liegt.
export function refillInput(state, building) {
  const types = sourceInputTypes(building.type);
  if (types.length <= 1) return types[0];
  if (building.prod.loaded && building.prod.input) return building.prod.input;
  return types.reduce((best, type) => (storageCount(state, type) > storageCount(state, best) ? type : best), types[0]);
}

// Füllt das Gebäude so weit wie möglich auf. Gekaufte Rohstoffe gehen direkt
// hinein (sie brauchen keinen Platz im Laden-Lager). Gibt den Plan zurück,
// so wie er ausgeführt wurde.
export function refillSource(state, building) {
  const plan = refillPlan(state, building);
  if (!plan) return null;
  for (let i = 0; i < plan.fromStorage; i++) loadInput(state, building, plan.input);
  for (let i = 0; i < plan.buy; i++) {
    state.gold -= ITEMS[plan.input].buyPrice;
    addRawToSource(building, plan.input);
  }
  return plan;
}

// ---------- Säen (v0.16.0) ----------

// Gibt es den Rohstoff beim Händler? (Die Flachspflanze z. B. wächst nur im Beet.)
export function isBuyable(type) {
  return Boolean(ITEMS[type]?.raw) && ITEMS[type].buyPrice > 0;
}

// Welchen Samen „Säen“ nimmt, wenn man keinen auswählt: den ersten, der
// freigeschaltet ist (auf Level 7 gibt es nur Leinsamen).
export function defaultSeed(state, building) {
  return gardenSeeds(building.type).find((seed) => isItemUnlocked(state, seed)) ?? null;
}

// Was „Säen“ gerade tun würde: { seed, fromStorage, buy, cost, result }.
// result: 'ok' | 'busy' (es wächst schon etwas) | 'gold' | 'locked' | 'invalid'
export function sowPlan(state, building, seed = defaultSeed(state, building)) {
  const plan = { seed, fromStorage: false, buy: false, cost: 0, result: 'invalid' };
  if (!seed || !gardenSeeds(building.type).includes(seed)) return plan;
  if (gardenCrop(building)) return { ...plan, result: 'busy' };
  if (!isItemUnlocked(state, seed)) return { ...plan, result: 'locked' };
  if (storageCount(state, seed) > 0) return { ...plan, fromStorage: true, result: 'ok' };
  const price = ITEMS[seed].buyPrice;
  if (!(price > 0)) return plan;
  if (state.gold < price) return { ...plan, cost: price, result: 'gold' };
  return { ...plan, buy: true, cost: price, result: 'ok' };
}

// Knopf „🌱 Säen“: aus dem Laden-Lager, sonst direkt gekauft (braucht keinen
// Platz im Laden-Lager). Gibt den Plan zurück, so wie er ausgeführt wurde.
export function sowSeed(state, building, seed) {
  const plan = sowPlan(state, building, seed);
  if (plan.result !== 'ok') return plan;
  if (plan.fromStorage) sowFromStorage(state, building, plan.seed);
  else {
    state.gold -= plan.cost;
    plantSeed(building, plan.seed);
  }
  return plan;
}

// ---------- Theken ----------

// Plätze auf einer Theke (v0.10.1: alle Theken gleich groß, wachsen mit dem Level).
export function counterSize(state) {
  return counterSizeFor(state.shopLevel);
}

// Stellt eine Sorte auf die Theke. Liegt dort eine andere, kommt sie ins Lager zurück.
export function setCounterItem(state, index, type) {
  const counter = state.counters[index];
  if (!counter || !isSellable(type)) return false;
  if (counter.type === type) return true;
  clearCounter(state, index);
  counter.type = type;
  return true;
}

// Legt bis zu n Stück aus dem Laden-Lager nach. Gibt die Anzahl zurück.
export function fillCounter(state, index, n = Infinity) {
  const counter = state.counters[index];
  if (!counter?.type) return 0;
  const moved = Math.max(0, Math.min(n, counterSize(state) - counter.count, storageCount(state, counter.type)));
  if (moved > 0) {
    takeFromStorage(state, counter.type, moved);
    counter.count += moved;
  }
  return moved;
}

// Höchstens so viele Stück dieser Ware passen gerade auf die Theke
// (was schon dort liegt plus Vorrat im Laden-Lager, begrenzt durch die Größe).
export function counterMaxFor(state, index, type) {
  const counter = state.counters[index];
  if (!counter || !isSellable(type)) return 0;
  const onCounter = counter.type === type ? counter.count : 0;
  return Math.min(counterSize(state), onCounter + storageCount(state, type));
}

// Stellt genau target Stück auf die Theke (v0.10.0, Tobias: „nur 8 davon
// verkaufen“). Mehr wird aus dem Laden-Lager nachgelegt, zu viel kommt zurück.
// Gibt die Anzahl danach zurück.
export function setCounterAmount(state, index, target) {
  const counter = state.counters[index];
  if (!counter?.type) return 0;
  const want = Math.max(0, Math.min(Math.floor(target), counterSize(state)));
  if (want > counter.count) fillCounter(state, index, want - counter.count);
  else if (want < counter.count) {
    addToStorage(state, counter.type, counter.count - want);
    counter.count = want;
  }
  return counter.count;
}

// Räumt die Theke ab: Die Waren kommen zurück ins Laden-Lager.
export function clearCounter(state, index) {
  const counter = state.counters[index];
  if (!counter) return false;
  if (counter.type && counter.count > 0) addToStorage(state, counter.type, counter.count);
  counter.type = null;
  counter.count = 0;
  return true;
}

// ---------- Theken kaufen (v0.24.0) ----------

// Preis der nächsten Theke – null, wenn es (noch) keine weitere zu kaufen gibt.
export function nextCounterPrice(state) {
  if (state.counters.length >= COUNTERS.max) return null;
  return COUNTERS.prices[state.counters.length - COUNTERS.start] ?? null;
}

// Alle Plätze der Theken-Ansicht (COUNTERS.max): { index, status, price }.
// status: 'owned' (gekauft) | 'next' (als Nächste zu kaufen) | 'later' (erst
// die davor kaufen) | 'locked' (Preis noch offen, kommt später im Spiel)
export function counterSlots(state) {
  return Array.from({ length: Math.max(COUNTERS.max, state.counters.length) }, (_, index) => {
    if (index < state.counters.length) return { index, status: 'owned', price: null };
    const price = COUNTERS.prices[index - COUNTERS.start] ?? null;
    if (price === null) return { index, status: 'locked', price };
    return { index, status: index === state.counters.length ? 'next' : 'later', price };
  });
}

// Kauft die nächste Theke (nur Gold, kein Mindest-Level).
// Ergebnis: 'ok' | 'gold' (zu wenig Gold) | 'later' (gibt es noch nicht)
export function buyCounter(state) {
  const price = nextCounterPrice(state);
  if (price === null) return 'later';
  if (state.gold < price) return 'gold';
  state.gold -= price;
  state.counters.push(emptyCounter());
  syncCustomerTimers(state);
  return 'ok';
}

// ---------- Kunden ----------

// Ein Kunde kommt an Theke index und kauft minItems–maxItems Stück, so viele
// dort liegen. Gibt den Verkauf zurück (oder null, wenn die Theke leer ist –
// dann geht er ohne Kauf).
export function serveCustomer(state, index) {
  const market = state.market;
  const wants = randomInt(market, CUSTOMERS.minItems, CUSTOMERS.maxItems);
  const counter = state.counters[index];
  if (!counter?.type || counter.count <= 0) return null;
  const n = Math.min(wants, counter.count);
  counter.count -= n;
  const gold = n * ITEMS[counter.type].price;
  state.gold += gold;
  const sale = { id: market.nextSaleId++, counter: index, items: { [counter.type]: n }, gold };
  market.sales.unshift(sale);
  market.sales.length = Math.min(market.sales.length, SALES_LOG_SIZE);
  return sale;
}

// Sekunden, bis der nächste Kunde an Theke index kommt.
export function nextCustomerIn(state, index) {
  return state.market.timers[index] ?? 0;
}

// Wird in jedem Takt der Simulation aufgerufen. v0.24.0: Jede Theke hat
// ihren eigenen Kunden-Takt.
export function updateMarket(state, dt) {
  const market = state.market;
  syncCustomerTimers(state);
  for (let i = 0; i < state.counters.length; i++) {
    market.timers[i] -= dt;
    while (market.timers[i] <= 0) {
      market.timers[i] += customerInterval(market, state.shopLevel);
      serveCustomer(state, i);
    }
  }
  checkBailout(state);
}

// ---------- Pleiteschutz ----------

// Gesamtwert aller Waren (ohne Rohstoffe) in Lager, Theken, Gebäuden und auf Bändern.
export function goodsValue(state) {
  const worth = (type, n) => (ITEMS[type]?.raw ? 0 : (ITEMS[type]?.price ?? 0) * n);
  let total = 0;
  for (const [type, n] of Object.entries(state.storage)) total += worth(type, n);
  for (const c of state.counters) if (c.type) total += worth(c.type, c.count);
  for (const belt of Object.values(state.belts)) if (belt.item) total += worth(belt.item.type, 1);
  for (const b of state.buildings) {
    for (const [type, n] of Object.entries(buildingContents(b))) total += worth(type, n);
  }
  return total;
}

// v0.16.0: Nur was es beim Händler gibt (die Flachspflanze nicht).
function cheapestRaw() {
  return Math.min(...Object.values(ITEMS).filter((d) => d.raw && d.buyPrice > 0).map((d) => d.buyPrice));
}

// Pleite: zu wenig Gold für den billigsten Rohstoff, kein Rohstoff im Lager
// oder in Arbeit, und alle Waren zusammen bringen auch nicht genug.
export function isBroke(state) {
  const price = cheapestRaw();
  if (state.gold >= price) return false;
  if (Object.keys(state.storage).some((type) => ITEMS[type]?.raw && state.storage[type] > 0)) return false;
  if (state.buildings.some((b) => productionOf(b.type)?.kind === 'source' && b.prod.loaded)) return false;
  if (state.buildings.some((b) => gardenCrop(b))) return false; // v0.16.0: im Beet wächst etwas
  return state.gold + goodsValue(state) < price;
}

export function checkBailout(state) {
  // Erst die schnelle Prüfung, dann die gründliche.
  if (state.gold >= cheapestRaw() || !isBroke(state)) return false;
  addToStorage(state, BAILOUT_ITEM, 1);
  state.market.gifts++;
  return true;
}

// ---------- Testpaket (nur im Testmodus) ----------

// Gold und von jeder freigeschalteten Ware (ohne Rohstoffe) TEST_PACK.each Stück.
export function applyTestPack(state) {
  state.gold += TEST_PACK.gold;
  for (const type of Object.keys(ITEMS)) {
    if (ITEMS[type].raw || !isItemUnlocked(state, type)) continue;
    addToStorage(state, type, itemLevel(type) >= TEST_PACK.advancedLevel ? TEST_PACK.eachAdvanced : TEST_PACK.each);
  }
}
