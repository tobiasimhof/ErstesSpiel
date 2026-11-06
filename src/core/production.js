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

export function createProductionState(type) {
  const p = productionOf(type);
  switch (p?.kind) {
    case 'source':
      return { loaded: false, remaining: 0, timer: 0, out: null, blocked: false };
    case 'workshop':
      return { recipe: p.recipes[0], stock: {}, busy: false, timer: 0, out: null, blocked: false };
    case 'storage':
      return { slots: [], blocked: false };
    case 'shipping':
      return { shipped: 0, blocked: false };
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
      prod.out = { type: p.output, count: 1 };
      countProduced(state, p.output, 1);
      prod.remaining--;
      if (prod.remaining <= 0) {
        prod.loaded = false;
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
  }
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

// Nach dem Umstellen: Zutaten, die das neue Rezept nicht braucht, kommen ins
// Laden-Lager (sonst lägen sie unsichtbar in der Maschine fest). Gibt zurück,
// was zurückgelegt wurde: { Ware: Anzahl }.
export function returnUnusedStock(state, building) {
  const p = productionOf(building.type);
  if (p?.kind !== 'workshop') return {};
  const prod = building.prod;
  const needed = RECIPES[prod.recipe].inputs;
  const returned = {};
  for (const [type, n] of Object.entries(prod.stock)) {
    if (needed[type] || n <= 0) continue;
    addToStorage(state, type, n);
    returned[type] = n;
    delete prod.stock[type];
  }
  return returned;
}

// ---------- Aktionen ----------

// Legt einen Rohstoff aus dem Laden-Lager ein (nur einer auf einmal).
export function loadInput(state, building) {
  const p = productionOf(building.type);
  if (p?.kind !== 'source' || building.prod.loaded) return false;
  if (!takeFromStorage(state, p.input, 1)) return false;
  Object.assign(building.prod, { loaded: true, remaining: p.amount, timer: 0 });
  return true;
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
    if (prod.loaded && prod.remaining === p.amount) add(p.input, 1);
  } else if (p?.kind === 'workshop') {
    for (const [type, n] of Object.entries(prod.stock)) add(type, n);
    if (prod.out) add(prod.out.type, prod.out.count);
    if (prod.busy) for (const [type, n] of Object.entries(RECIPES[prod.recipe].inputs)) add(type, n);
  } else if (p?.kind === 'storage') {
    for (const slot of prod.slots) add(slot.type, slot.count);
  }
  return contents;
}

export function losesWorkOnRemove(building) {
  const p = productionOf(building.type);
  return p?.kind === 'source' && building.prod.loaded && building.prod.remaining < p.amount;
}

// ---------- Anzeige ----------

// Ergebnis: { level: 'work' | 'idle' | 'blocked', text }
export function buildingStatus(state, building) {
  const p = productionOf(building.type);
  const prod = building.prod;
  if (p?.kind === 'source') {
    if (prod.out && prod.blocked) return { level: 'blocked', text: 'Ausgang voll – das Band nimmt nichts mehr an.' };
    if (prod.loaded) return { level: 'work', text: `Arbeitet: noch ${prod.remaining} von ${p.amount}.` };
    return { level: 'idle', text: 'Leer – Rohstoff einlegen.' };
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
      return { level: 'idle', text: `Wartet auf Nachschub (${have} / ${need}).` };
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
  return { level: 'idle', text: '' };
}

// Fortschritt 0..1 für die kleine Leiste am Gebäude (oder null).
export function buildingProgress(building) {
  const p = productionOf(building.type);
  const prod = building.prod;
  if (p?.kind === 'source' && prod.loaded) return prod.remaining / p.amount;
  if (p?.kind === 'workshop' && prod.busy) return Math.min(1, prod.timer / RECIPES[prod.recipe].time);
  return null;
}

export { storageCount };
