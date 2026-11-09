// Was Gebäude tun: Rohstoff verarbeiten, nach Rezept herstellen, zwischenlagern,
// versenden. Jedes Gebäude hat dafür einen Zustand in building.prod.

import { BUILDINGS } from './data/buildings.js';
import { ITEMS } from './data/items.js';
import { RECIPES } from './data/recipes.js';
import { step } from './dirs.js';
import { buildingPorts } from './geometry.js';
import { countProduced } from './levels.js';
import { addToStorage, storageCount, storageFree, takeFromStorage } from './shop.js';

export function productionOf(type) {
  return BUILDINGS[type]?.production ?? null;
}

// v0.17.0: Was ein Rohstoff-Gebäude verarbeitet: { Rohstoff: Ware }.
// Holzfällerlager & Co. haben einen Rohstoff (input/output), die Erntebank
// mehrere (inputs). Die Reihenfolge ist die der Tabelle.
export function sourceInputs(p) {
  if (p?.kind !== 'source') return {};
  return p.inputs ?? { [p.input]: p.output };
}

// Rohstoffe eines Gebäudes, z. B. ['flachspflanze', 'ringelblume']
export function sourceInputTypes(type) {
  return Object.keys(sourceInputs(productionOf(type)));
}

export function createProductionState(type) {
  const p = productionOf(type);
  switch (p?.kind) {
    case 'source':
      // queued (v0.14.0): Rohstoffe, die nach dem laufenden noch warten.
      // v0.17.0: input = welcher Rohstoff gerade läuft (oder null), queue =
      // welche warten (queue.length === queued) – die Erntebank nimmt mehrere
      // Pflanzen, auch gemischt.
      return { loaded: false, input: null, remaining: 0, queued: 0, queue: [], timer: 0, out: null, blocked: false };
    case 'workshop':
      return { recipe: p.recipes[0], stock: {}, busy: false, timer: 0, out: null, blocked: false };
    case 'storage':
      return { slots: [], blocked: false };
    case 'shipping':
      return { shipped: 0, blocked: false };
    case 'garden':
      // v0.16.0: crop = gesäter Samen (oder null), timer = so lange wächst er schon
      return { crop: null, timer: 0, blocked: false };
    default:
      return { blocked: false };
  }
}

// ---------- Annehmen (vom Band oder aus einem anderen Gebäude) ----------

export function canAccept(state, building, type) {
  const p = productionOf(building.type);
  const prod = building.prod;
  switch (p?.kind) {
    case 'workshop': {
      const need = RECIPES[prod.recipe].inputs[type];
      if (!need) return false;
      return (prod.stock[type] ?? 0) < need * 2;
    }
    case 'storage':
      return prod.slots.some((s) => s.type === type && s.count < p.slotSize) || prod.slots.length < p.slots;
    case 'shipping':
      return storageFree(state) > 0;
    default:
      return false; // Rohstoffe werden eingelegt, nicht angeliefert
  }
}

export function accept(state, building, type) {
  const p = productionOf(building.type);
  const prod = building.prod;
  switch (p?.kind) {
    case 'workshop':
      prod.stock[type] = (prod.stock[type] ?? 0) + 1;
      break;
    case 'storage': {
      const slot = prod.slots.find((s) => s.type === type && s.count < p.slotSize);
      if (slot) slot.count++;
      else prod.slots.push({ type, count: 1 });
      break;
    }
    case 'shipping':
      addToStorage(state, type, 1);
      prod.shipped++;
      break;
  }
}

// ---------- Ausgeben ----------

export function peekOutput(building) {
  const p = productionOf(building.type);
  const prod = building.prod;
  if (p?.kind === 'source' || p?.kind === 'workshop') return prod.out?.type ?? null;
  if (p?.kind === 'storage') return prod.slots[0]?.type ?? null;
  return null;
}

export function takeOutput(building) {
  const p = productionOf(building.type);
  const prod = building.prod;
  if (p?.kind === 'source' || p?.kind === 'workshop') {
    if (!prod.out) return;
    prod.out.count--;
    if (prod.out.count <= 0) prod.out = null;
  } else if (p?.kind === 'storage') {
    const slot = prod.slots[0];
    if (!slot) return;
    slot.count--;
    if (slot.count <= 0) prod.slots.shift();
  }
}

// ---------- Arbeiten ----------

export function updateProduction(state, building, dt) {
  const p = productionOf(building.type);
  const prod = building.prod;
  if (p?.kind === 'source') {
    // Steht still, solange die letzte Ware nicht abgegeben werden konnte.
    if (!prod.loaded || prod.out) return;
    prod.timer += dt;
    const interval = p.duration / p.amount;
    if (prod.timer >= interval) {
      prod.timer -= interval;
      const output = sourceInputs(p)[prod.input];
      prod.out = { type: output, count: 1 };
      countProduced(state, output, 1);
      prod.remaining--;
      if (prod.remaining <= 0 && prod.queued > 0) {
        // v0.14.0: der nächste Rohstoff aus dem Vorrat kommt dran
        prod.queued--;
        prod.input = prod.queue.shift();
        prod.remaining = p.amount;
      } else if (prod.remaining <= 0) {
        prod.loaded = false;
        prod.input = null;
        prod.remaining = 0;
        prod.timer = 0;
      }
    }
  } else if (p?.kind === 'workshop') {
    const recipe = RECIPES[prod.recipe];
    if (!prod.busy && !prod.out && hasInputs(prod, recipe)) {
      for (const [type, n] of Object.entries(recipe.inputs)) prod.stock[type] -= n;
      prod.busy = true;
      prod.timer = 0;
    }
    if (prod.busy) {
      prod.timer += dt;
      if (prod.timer >= recipe.time) {
        prod.busy = false;
        prod.timer = 0;
        prod.out = { type: recipe.output, count: recipe.amount };
        countProduced(state, recipe.output, recipe.amount);
      }
    }
  } else if (p?.kind === 'garden') {
    // v0.16.0: Die Pflanze wächst, bis sie reif ist – dann wartet sie aufs Ernten.
    const crop = gardenCrop(building);
    if (crop && prod.timer < crop.time) {
      prod.timer = Math.min(crop.time, prod.timer + dt);
      // Viele kleine Takte addieren sich nicht ganz genau – reif ist reif.
      if (crop.time - prod.timer < 1e-6) prod.timer = crop.time;
    }
  }
}

// ---------- Beet (v0.16.0, Tobias: 1 Samen = 1 Pflanze, säen und ernten) ----------

// Was im Beet wächst: { seed, plant, time } oder null, wenn es leer ist.
export function gardenCrop(building) {
  const p = productionOf(building.type);
  const seed = building.prod?.crop;
  if (p?.kind !== 'garden' || !seed || !p.crops[seed]) return null;
  return { seed, ...p.crops[seed] };
}

// Samen, die in diesem Beet wachsen können (in der Reihenfolge der Tabelle).
export function gardenSeeds(type) {
  const p = productionOf(type);
  return p?.kind === 'garden' ? Object.keys(p.crops) : [];
}

export function isRipe(building) {
  const crop = gardenCrop(building);
  return Boolean(crop) && building.prod.timer >= crop.time;
}

// Wachstum 0..1 (oder null, wenn nichts wächst).
export function growth(building) {
  const crop = gardenCrop(building);
  return crop ? Math.min(1, building.prod.timer / crop.time) : null;
}

// So viele Sekunden noch, bis die Pflanze reif ist.
export function growthLeft(building) {
  const crop = gardenCrop(building);
  return crop ? Math.max(0, crop.time - building.prod.timer) : 0;
}

// Sät einen Samen in ein leeres Beet, ohne ihn aus dem Laden-Lager zu nehmen
// (z. B. direkt beim Händler gekauft).
export function plantSeed(building, seed) {
  const p = productionOf(building.type);
  if (p?.kind !== 'garden' || !p.crops[seed] || building.prod.crop) return false;
  building.prod.crop = seed;
  building.prod.timer = 0;
  return true;
}

// Sät einen Samen aus dem Laden-Lager.
export function sowFromStorage(state, building, seed) {
  const p = productionOf(building.type);
  if (p?.kind !== 'garden' || !p.crops[seed] || building.prod.crop) return false;
  if (!takeFromStorage(state, seed, 1)) return false;
  return plantSeed(building, seed);
}

// Erntet die reife Pflanze ins Laden-Lager. Danach ist das Beet leer und man
// sät neu (zwei getrennte Schritte, Tobias). Ergebnis: 'ok' | 'unripe' |
// 'full' (Laden-Lager voll) | 'invalid'.
export function harvest(state, building) {
  const crop = gardenCrop(building);
  if (!crop) return 'invalid';
  if (!isRipe(building)) return 'unripe';
  if (storageFree(state) < 1) return 'full';
  addToStorage(state, crop.plant, 1);
  countProduced(state, crop.plant, 1);
  building.prod.crop = null;
  building.prod.timer = 0;
  return 'ok';
}

function hasInputs(prod, recipe) {
  return Object.entries(recipe.inputs).every(([type, n]) => (prod.stock[type] ?? 0) >= n);
}

// ---------- Zutaten einer Werkstatt (v0.10.0) ----------

// Zutaten des eingestellten Rezepts: [{ type, need, have, done }]
export function workshopInputs(building) {
  const p = productionOf(building.type);
  if (p?.kind !== 'workshop') return [];
  const prod = building.prod;
  return Object.entries(RECIPES[prod.recipe].inputs).map(([type, need]) => {
    const have = prod.stock[type] ?? 0;
    return { type, need, have, done: have >= need };
  });
}

// Welche Zutaten fehlen gerade? Nur bei Rezepten mit zwei (oder mehr)
// Zutaten und nur, solange die Werkstatt wartet – dafür zeigt das Spielfeld
// ein kleines Bild der fehlenden Ware an der Maschine.
export function missingInputs(building) {
  const p = productionOf(building.type);
  const prod = building.prod;
  if (p?.kind !== 'workshop' || prod.busy || prod.out) return [];
  const inputs = workshopInputs(building);
  if (inputs.length < 2) return [];
  return inputs.filter((i) => !i.done).map((i) => i.type);
}

// Stau am Eingang: Die Werkstatt wartet, und an jedem angeschlossenen
// Eingang steht eine Ware, die sie gerade nicht annehmen kann (falsche Ware
// oder von dieser Zutat ist schon genug da). Dann kommt nie wieder etwas
// hinein. Ergebnis: Sorte der stauenden Ware (die erste) oder null.
export function inputJam(state, building) {
  const p = productionOf(building.type);
  const prod = building.prod;
  if (p?.kind !== 'workshop' || prod.busy || prod.out) return null;
  let jam = null;
  for (const port of buildingPorts(building)) {
    if (port.kind !== 'in') continue;
    const belt = state.belts[`${port.outside.x},${port.outside.y}`];
    if (!belt) continue;
    const feeds = belt.outs.some((dir) => {
      const t = step(port.outside, dir);
      return t.x === port.tile.x && t.y === port.tile.y;
    });
    if (!feeds) continue;
    // Ein Band mit Abzweigung kann seine Ware auch anderswo loswerden.
    if (belt.outs.length !== 1 || !belt.item || belt.item.progress < 1) return null;
    if (canAccept(state, building, belt.item.type)) return null;
    jam ??= belt.item.type;
  }
  return jam;
}

// Zutaten in der Maschine, die die aktuelle Einstellung nicht braucht (z. B.
// nach dem Umstellen): { Ware: Anzahl }. v0.10.1 (Tobias): Sie bleiben in der
// Maschine und werden wieder gebraucht, wenn man zurückstellt.
export function unusedStock(building) {
  const p = productionOf(building.type);
  if (p?.kind !== 'workshop') return {};
  const needed = RECIPES[building.prod.recipe].inputs;
  const rest = {};
  for (const [type, n] of Object.entries(building.prod.stock)) {
    if (!needed[type] && n > 0) rest[type] = n;
  }
  return rest;
}

// Knopf „Reste ins Laden-Lager“: legt die nicht gebrauchten Zutaten ins
// Laden-Lager. Gibt zurück, was zurückgelegt wurde: { Ware: Anzahl }.
export function returnUnusedStock(state, building) {
  const rest = unusedStock(building);
  for (const [type, n] of Object.entries(rest)) {
    addToStorage(state, type, n);
    delete building.prod.stock[type];
  }
  return rest;
}

// ---------- Aktionen ----------

// ---------- Rohstoff-Vorrat (v0.14.0, Tobias: bis zu 3 Rohstoffe) ----------

// So viele Rohstoffe passen in das Gebäude (der laufende mitgezählt).
export function sourceCapacity(building) {
  const p = productionOf(building.type);
  return p?.kind === 'source' ? (p.capacity ?? 1) : 0;
}

// So viele Rohstoffe stecken gerade darin (der laufende mitgezählt).
export function sourceCount(building) {
  const p = productionOf(building.type);
  if (p?.kind !== 'source') return 0;
  return (building.prod.loaded ? 1 : 0) + (building.prod.queued ?? 0);
}

// So viele Rohstoffe passen noch hinein.
export function sourceRoom(building) {
  return Math.max(0, sourceCapacity(building) - sourceCount(building));
}

// Legt einen Rohstoff ins Gebäude, ohne ihn aus dem Laden-Lager zu nehmen
// (z. B. direkt beim Händler gekauft). Ist es leer, beginnt die Arbeit sofort,
// sonst wartet er im Vorrat. v0.17.0: type = welcher Rohstoff (ohne Angabe
// der erste des Gebäudes).
export function addRawToSource(building, type = sourceInputTypes(building.type)[0]) {
  const p = productionOf(building.type);
  if (p?.kind !== 'source' || sourceRoom(building) < 1 || !sourceInputs(p)[type]) return false;
  const prod = building.prod;
  if (prod.loaded) {
    prod.queue.push(type);
    prod.queued = prod.queue.length;
  } else Object.assign(prod, { loaded: true, input: type, remaining: p.amount, queued: 0, queue: [], timer: 0 });
  return true;
}

// Legt einen Rohstoff aus dem Laden-Lager ein (seit v0.14.0 bis zu capacity).
export function loadInput(state, building, type = sourceInputTypes(building.type)[0]) {
  const p = productionOf(building.type);
  if (p?.kind !== 'source' || sourceRoom(building) < 1 || !sourceInputs(p)[type]) return false;
  if (!takeFromStorage(state, type, 1)) return false;
  return addRawToSource(building, type);
}

// v0.17.0: Was im Vorrat steckt (der laufende mitgezählt): { Rohstoff: Anzahl }
export function sourceStock(building) {
  const prod = building.prod;
  const stock = {};
  if (prod?.loaded && prod.input) stock[prod.input] = 1;
  for (const type of prod?.queue ?? []) stock[type] = (stock[type] ?? 0) + 1;
  return stock;
}

// v0.19.0: Der Vorrat der Reihe nach (der laufende Rohstoff zuerst), z. B.
// ['holzstamm', 'holzstamm'] – für die Bilder im Infofenster.
export function sourceSlots(building) {
  const prod = building.prod;
  if (productionOf(building.type)?.kind !== 'source' || !prod?.loaded || !prod.input) return [];
  return [prod.input, ...(prod.queue ?? [])];
}

export function setRecipe(building, recipeKey) {
  const p = productionOf(building.type);
  if (p?.kind !== 'workshop' || !p.recipes.includes(recipeKey)) return false;
  const prod = building.prod;
  if (prod.recipe === recipeKey) return true;
  // Ein angefangener Durchgang wird abgebrochen, die Zutaten kommen zurück.
  if (prod.busy) {
    for (const [type, n] of Object.entries(RECIPES[prod.recipe].inputs)) prod.stock[type] = (prod.stock[type] ?? 0) + n;
    prod.busy = false;
    prod.timer = 0;
  }
  prod.recipe = recipeKey;
  return true;
}

// Waren, die beim Abreißen ins Laden-Lager zurückkommen. Ein angefangener
// Holzstamm geht verloren; ein noch unberührter kommt zurück.
export function buildingContents(building) {
  const p = productionOf(building.type);
  const prod = building.prod;
  const contents = {};
  const add = (type, n) => {
    if (n > 0) contents[type] = (contents[type] ?? 0) + n;
  };
  if (p?.kind === 'source') {
    if (prod.out) add(prod.out.type, prod.out.count);
    if (prod.loaded && prod.remaining === p.amount) add(prod.input, 1);
    for (const type of prod.queue ?? []) add(type, 1); // v0.14.0: wartende Rohstoffe sind unberührt
  } else if (p?.kind === 'workshop') {
    for (const [type, n] of Object.entries(prod.stock)) add(type, n);
    if (prod.out) add(prod.out.type, prod.out.count);
    if (prod.busy) for (const [type, n] of Object.entries(RECIPES[prod.recipe].inputs)) add(type, n);
  } else if (p?.kind === 'storage') {
    for (const slot of prod.slots) add(slot.type, slot.count);
  } else if (p?.kind === 'garden') {
    // v0.16.0: Eine reife Pflanze kommt mit, ein gerade gesäter Samen auch;
    // eine halb gewachsene Pflanze geht verloren (wie ein angefangener Holzstamm).
    const crop = gardenCrop(building);
    if (crop && isRipe(building)) add(crop.plant, 1);
    else if (crop && prod.timer === 0) add(crop.seed, 1);
  }
  return contents;
}

export function losesWorkOnRemove(building) {
  const p = productionOf(building.type);
  if (p?.kind === 'garden') return Boolean(gardenCrop(building)) && building.prod.timer > 0 && !isRipe(building);
  return p?.kind === 'source' && building.prod.loaded && building.prod.remaining < p.amount;
}

// ---------- Anzeige ----------

// Ergebnis: { level: 'work' | 'idle' | 'blocked', text }
export function buildingStatus(state, building) {
  const p = productionOf(building.type);
  const prod = building.prod;
  if (p?.kind === 'source') {
    if (prod.out && prod.blocked) return { level: 'blocked', text: 'Ausgang voll – das Band nimmt nichts mehr an.' };
    if (prod.loaded) {
      const queue = {};
      for (const type of prod.queue ?? []) queue[type] = (queue[type] ?? 0) + 1;
      const parts = Object.entries(queue).map(([type, n]) => itemCountText(type, n));
      const waiting = parts.length > 0 ? ` Danach noch ${parts.join(' und ')}.` : '';
      // v0.17.0: Bei mehreren Rohstoffen steht dabei, welcher gerade läuft
      const what = Object.keys(sourceInputs(p)).length > 1 ? ` ${ITEMS[prod.input].name}` : '';
      return { level: 'work', text: `Arbeitet${what}: noch ${prod.remaining} von ${p.amount}.${waiting}` };
    }
    return { level: 'idle', text: 'Leer – Rohstoff nachlegen.' };
  }
  if (p?.kind === 'workshop') {
    if (prod.out && prod.blocked) return { level: 'blocked', text: 'Ausgang voll – das Band nimmt nichts mehr an.' };
    if (prod.busy) return { level: 'work', text: 'Arbeitet.' };
    const inputs = workshopInputs(building);
    const jam = inputJam(state, building);
    if (jam) {
      const missing = inputs.filter((i) => !i.done).map((i) => ITEMS[i.type].name);
      const known = inputs.some((i) => i.type === jam);
      return {
        level: 'blocked',
        text: known
          ? `Eingang blockiert: Am Band staut sich ${ITEMS[jam].name}, es fehlt ${missing.join(' und ')}.`
          : `Eingang blockiert: ${ITEMS[jam].name} wird hier nicht gebraucht.`,
      };
    }
    if (inputs.length === 1) {
      const [{ have, need }] = inputs;
      return { level: 'idle', text: `Wartet auf ${ITEMS[inputs[0].type].plural} (${have} / ${need}).` };
    }
    const missing = inputs.filter((i) => !i.done).map((i) => `${ITEMS[i.type].name} (${i.have} / ${i.need})`);
    return { level: 'idle', text: `Wartet auf ${missing.join(' und ')}.` };
  }
  if (p?.kind === 'storage') {
    const total = prod.slots.reduce((sum, s) => sum + s.count, 0);
    const full = prod.slots.length >= p.slots && prod.slots.every((s) => s.count >= p.slotSize);
    if (full) return { level: 'blocked', text: 'Lager voll.' };
    return total > 0 ? { level: 'work', text: `${total} Waren gelagert.` } : { level: 'idle', text: 'Leer.' };
  }
  if (p?.kind === 'shipping') {
    if (storageFree(state) <= 0) return { level: 'blocked', text: 'Laden-Lager voll.' };
    return { level: 'work', text: 'Bereit zum Versenden.' };
  }
  if (p?.kind === 'garden') {
    const crop = gardenCrop(building);
    if (!crop) return { level: 'idle', text: 'Leer – Samen säen.' };
    if (isRipe(building)) return { level: 'idle', text: `Reif – ${ITEMS[crop.plant].name} ernten.` };
    return { level: 'work', text: `${ITEMS[crop.plant].name} wächst.` };
  }
  return { level: 'idle', text: '' };
}

// „2 Holzstämme“, „1 Eisenerz“
function itemCountText(type, n) {
  return `${n} ${n === 1 ? ITEMS[type].name : ITEMS[type].plural}`;
}

// Fortschritt 0..1 für die kleine Leiste am Gebäude (oder null).
export function buildingProgress(building) {
  const p = productionOf(building.type);
  const prod = building.prod;
  if (p?.kind === 'source' && prod.loaded) return prod.remaining / p.amount;
  if (p?.kind === 'workshop' && prod.busy) return Math.min(1, prod.timer / RECIPES[prod.recipe].time);
  if (p?.kind === 'garden') return growth(building);
  return null;
}

export { storageCount };
