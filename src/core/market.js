// Handel (v0.7.0): Händler, Verkaufstheken, Kunden, Pleiteschutz, Testpaket.
// Kennt keine Grafik.
//
// - Händler: verkauft Rohstoffe gegen Gold, sie landen im Laden-Lager.
// - Theken: werden von Hand aus dem Laden-Lager bestückt, je eine Sorte.
// - Kunden: kommen in zufälligen Abständen und kaufen zufällig 1–3 Stück von
//   den Theken zum festen Wert der Ware. Der Zufall steckt im Spielstand
//   (market.rng), damit sich Abläufe in Tests wiederholen lassen.
// - Pleiteschutz: Wer gar nicht mehr weiterkommt, bekommt einen Holzstamm.
// - Auffüllen (v0.14.0): Holzfällerlager & Co. bis zum Rand füllen – erst aus
//   dem Laden-Lager, was fehlt, direkt beim Händler gekauft.

import { ITEMS } from './data/items.js';
import { BAILOUT_ITEM, CUSTOMERS, SALES_LOG_SIZE, SHOP_LEVELS, TEST_PACK } from './data/shop.js';
import { isItemUnlocked, itemLevel } from './levels.js';
import { addRawToSource, buildingContents, loadInput, productionOf, sourceRoom } from './production.js';
import {
  addToStorage,
  counterCountFor,
  counterSizeFor,
  emptyCounter,
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

function customerInterval(market) {
  return CUSTOMERS.minInterval + nextRandom(market) * (CUSTOMERS.maxInterval - CUSTOMERS.minInterval);
}

export function createMarket(seed = (Math.random() * 4294967296) >>> 0) {
  const market = { rng: seed >>> 0, timer: 0, sales: [], nextSaleId: 1, gifts: 0 };
  market.timer = customerInterval(market);
  return market;
}

export function shopLevelData(state) {
  return SHOP_LEVELS[state.shopLevel] ?? SHOP_LEVELS[1];
}

export function createCounters(level = 1) {
  return Array.from({ length: counterCountFor(level) }, emptyCounter);
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
  const def = ITEMS[p.input];
  const room = sourceRoom(building);
  const fromStorage = Math.min(room, storageCount(state, p.input));
  const canBuy = isItemUnlocked(state, p.input) && def.buyPrice > 0 ? Math.floor(state.gold / def.buyPrice) : 0;
  const buy = Math.min(room - fromStorage, canBuy);
  return { input: p.input, room, fromStorage, buy, cost: buy * def.buyPrice, short: room - fromStorage - buy };
}

// Füllt das Gebäude so weit wie möglich auf. Gekaufte Rohstoffe gehen direkt
// hinein (sie brauchen keinen Platz im Laden-Lager). Gibt den Plan zurück,
// so wie er ausgeführt wurde.
export function refillSource(state, building) {
  const plan = refillPlan(state, building);
  if (!plan) return null;
  for (let i = 0; i < plan.fromStorage; i++) loadInput(state, building);
  for (let i = 0; i < plan.buy; i++) {
    state.gold -= ITEMS[plan.input].buyPrice;
    addRawToSource(building);
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

// ---------- Kunden ----------

// Ein Kunde kauft 1–3 Stück, jedes Stück von einer zufälligen nicht leeren
// Theke. Gibt den Verkauf zurück (oder null, wenn die Theken leer sind).
export function serveCustomer(state) {
  const market = state.market;
  const wants = randomInt(market, CUSTOMERS.minItems, CUSTOMERS.maxItems);
  const items = {};
  let gold = 0;
  for (let i = 0; i < wants; i++) {
    const stocked = state.counters.filter((c) => c.type && c.count > 0);
    if (stocked.length === 0) break;
    const counter = stocked[Math.floor(nextRandom(market) * stocked.length)];
    counter.count--;
    items[counter.type] = (items[counter.type] ?? 0) + 1;
    gold += ITEMS[counter.type].price;
  }
  if (gold === 0) return null;
  state.gold += gold;
  const sale = { id: market.nextSaleId++, items, gold };
  market.sales.unshift(sale);
  market.sales.length = Math.min(market.sales.length, SALES_LOG_SIZE);
  return sale;
}

// Wird in jedem Takt der Simulation aufgerufen.
export function updateMarket(state, dt) {
  const market = state.market;
  market.timer -= dt;
  while (market.timer <= 0) {
    market.timer += customerInterval(market);
    serveCustomer(state);
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

function cheapestRaw() {
  return Math.min(...Object.values(ITEMS).filter((d) => d.raw).map((d) => d.buyPrice));
}

// Pleite: zu wenig Gold für den billigsten Rohstoff, kein Rohstoff im Lager
// oder in Arbeit, und alle Waren zusammen bringen auch nicht genug.
export function isBroke(state) {
  const price = cheapestRaw();
  if (state.gold >= price) return false;
  if (Object.keys(state.storage).some((type) => ITEMS[type]?.raw && state.storage[type] > 0)) return false;
  if (state.buildings.some((b) => productionOf(b.type)?.kind === 'source' && b.prod.loaded)) return false;
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
