// Inhalt des Infofensters mit Warenbildern (v0.19.0, Tobias: „Ich würde gerne
// ganz oben stehen haben, was man aktuell produziert und was man dafür
// braucht, und unten drunter, was die anderen Dinge kosten würden.“)
//
// - Maschinen: grüner Kasten „Stellt gerade her“ (Zutaten mit hat / braucht
//   → Ergebnis), darunter „Umstellen auf“ mit jedem anderen Rezept als Knopf.
// - Rohstoff-Gebäude und Erntebank: „Stellt gerade her“ (Rohstoff → Waren),
//   darunter der Vorrat als Bilder und was im Laden-Lager liegt.
//
// Die Bilder sind dieselben wie auf dem Band. Alles wird einmal gebaut und
// danach nur aktualisiert (update), damit kein Tippen verloren geht; nur wenn
// sich der Aufbau ändert (anderes Rezept, anderer Rohstoff), wird neu gebaut.

import { ITEMS } from '../core/data/items.js';
import { RECIPES } from '../core/data/recipes.js';
import { isItemUnlocked } from '../core/levels.js';
import {
  productionOf,
  sourceCapacity,
  sourceCount,
  sourceInputs,
  sourceSlots,
  unusedStock,
  workshopInputs,
} from '../core/production.js';
import { storageCount } from '../core/shop.js';
import { costText, formatDuration, itemCount, numberFormat } from './format.js';
import { createItemIcon } from './itemArt.js';
import { onPress } from './press.js';

// Größen der Warenbilder (CSS-Pixel); auf dem Handy etwas kleiner.
function sizes() {
  const phone = window.matchMedia('(max-height: 420px)').matches;
  return phone ? { input: 26, output: 32, chip: 18, option: 24, slot: 24 } : { input: 30, output: 38, chip: 20, option: 26, slot: 28 };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const gold = (n) => `${numberFormat.format(n)} 🪙`;
const op = (text) => el('span', 'flow-op', text);

// Ware mit Zahl darunter (im grünen Kasten)
function stackedItem(type, size, label, className = '') {
  const box = el('span', `flow-item ${className}`.trim());
  box.dataset.item = type;
  const count = el('span', 'flow-count', label);
  box.append(createItemIcon(type, size), count);
  return { box, count };
}

// Ergebnis: großes Bild mit Namen
function outputItem(type, amount, size, label) {
  const box = el('span', 'flow-out');
  box.dataset.item = type;
  const name = label ?? (amount === 1 ? ITEMS[type].name : itemCount(type, amount));
  box.append(createItemIcon(type, size), el('span', 'flow-name', name));
  return box;
}

// Kleine Zutat „10 ▭“ (in den Knöpfen „Umstellen auf“)
function chip(type, n, size) {
  const node = el('span', 'flow-chip', numberFormat.format(n));
  node.append(createItemIcon(type, size));
  return node;
}

function card(caption) {
  const node = el('div', 'info-card');
  const cap = el('div', 'info-cap', caption);
  node.append(cap);
  return { node, cap };
}

// ---------- Maschinen ----------

function workshopBody(state, building, { onRecipe }) {
  const root = el('div', 'building-body');
  let builtRecipe = null;
  let parts = null;

  function render(b) {
    const p = productionOf(b.type);
    const recipe = RECIPES[b.prod.recipe];
    const s = sizes();
    builtRecipe = b.prod.recipe;
    const main = card('Stellt gerade her');
    const flow = el('div', 'recipe-flow');
    const counts = new Map();
    Object.keys(recipe.inputs).forEach((type, i) => {
      if (i > 0) flow.append(op('+'));
      const item = stackedItem(type, s.input, '');
      counts.set(type, item);
      flow.append(item.box);
    });
    flow.append(op('→'), outputItem(recipe.output, recipe.amount, s.output));
    const sub = el('div', 'info-sub');
    main.node.append(flow, sub);
    root.replaceChildren(main.node);
    // Die anderen Einstellungen, je ein Knopf: Antippen stellt um.
    const others = p.recipes.filter((key) => key !== b.prod.recipe);
    if (others.length > 0) {
      root.append(el('div', 'info-cap', 'Umstellen auf'));
      for (const key of others) {
        const r = RECIPES[key];
        const out = ITEMS[r.output];
        const button = el('button', 'recipe-option');
        button.type = 'button';
        button.dataset.recipe = key;
        const ins = Object.entries(r.inputs);
        ins.forEach(([type, n], i) => {
          if (i > 0) button.append(op('+'));
          button.append(chip(type, n, s.chip));
        });
        button.append(op('→'), createItemIcon(r.output, s.option));
        button.append(el('span', 'option-name', r.amount === 1 ? out.name : itemCount(r.output, r.amount)));
        button.append(el('span', 'option-price', gold(out.price * r.amount)));
        const title = `Umstellen auf ${out.name}: ${ins.map(([type, n]) => itemCount(type, n)).join(' + ')}`;
        button.title = title;
        button.setAttribute('aria-label', title);
        onPress(button, () => onRecipe(key));
        root.append(button);
      }
    }
    // Zutaten für eine andere Einstellung bleiben in der Maschine.
    const note = el('div', 'info-note');
    root.append(note);
    parts = { counts, sub, note };
  }

  function update(b) {
    if (b.prod.recipe !== builtRecipe) render(b);
    const recipe = RECIPES[b.prod.recipe];
    const inputs = workshopInputs(b);
    for (const i of inputs) {
      const item = parts.counts.get(i.type);
      if (!item) continue;
      item.count.textContent = i.done ? `${i.have} / ${i.need} ✓` : `${i.have} / ${i.need}`;
      item.box.classList.toggle('lack', !i.done);
      item.box.classList.toggle('done', i.done);
    }
    const missing = b.prod.busy ? [] : inputs.filter((i) => !i.done);
    const facts = [`${recipe.time} s je Stück`, `Wert ${gold(ITEMS[recipe.output].price * recipe.amount)}`];
    if (missing.length > 0) facts.unshift(`Fehlt noch: ${missing.map((i) => itemCount(i.type, i.need - i.have)).join(' + ')}`);
    parts.sub.textContent = facts.join(' · ');
    const rest = unusedStock(b);
    const hasRest = Object.keys(rest).length > 0;
    parts.note.textContent = hasRest ? `Liegt noch in der Maschine: ${costText(rest)} – für eine andere Einstellung.` : '';
    parts.note.hidden = !hasRest;
  }

  render(building);
  update(building);
  return { node: root, update };
}

// ---------- Rohstoff-Gebäude und Erntebank ----------

function sourceBody(state, building) {
  const root = el('div', 'building-body');
  let layout = null;
  let parts = null;

  // Was der Kasten zeigt: läuft etwas, nur diesen Rohstoff; sonst alle, die
  // auf diesem Level schon freigeschaltet sind.
  function shownInputs(b) {
    const p = productionOf(b.type);
    const all = Object.keys(sourceInputs(p));
    if (b.prod.loaded && b.prod.input) return [b.prod.input];
    const open = all.filter((t) => isItemUnlocked(state, t));
    return open.length > 0 ? open : all.slice(0, 1);
  }

  function layoutKey(b) {
    return `${b.prod.loaded ? 1 : 0}|${shownInputs(b).join(',')}|${sourceSlots(b).join(',')}`;
  }

  function render(b) {
    const p = productionOf(b.type);
    const inputs = sourceInputs(p);
    const s = sizes();
    layout = layoutKey(b);
    const main = card(b.prod.loaded ? 'Stellt gerade her' : 'Stellt her');
    for (const type of shownInputs(b)) {
      const flow = el('div', 'recipe-flow');
      flow.dataset.input = type;
      flow.append(stackedItem(type, s.input, '1').box, op('→'), outputItem(inputs[type], p.amount, s.output));
      main.node.append(flow);
    }
    const sub = el('div', 'info-sub');
    main.node.append(sub);
    // Vorrat: so viele Plätze, wie hineinpassen; leere Plätze blass
    const stockCap = el('div', 'info-cap');
    const slots = el('div', 'source-slots');
    const filled = sourceSlots(b);
    const empty = shownInputs(b)[0];
    for (let i = 0; i < sourceCapacity(b); i++) {
      const type = filled[i] ?? empty;
      const icon = createItemIcon(type, s.slot);
      icon.classList.add('slot');
      if (!filled[i]) icon.classList.add('empty');
      slots.append(icon);
    }
    const store = el('div', 'info-sub store-line');
    root.replaceChildren(main.node, stockCap, slots, store);
    parts = { sub, stockCap, store };
  }

  function update(b) {
    if (layoutKey(b) !== layout) render(b);
    const p = productionOf(b.type);
    const prod = b.prod;
    const facts = [`in ${formatDuration(p.duration)}${Object.keys(sourceInputs(p)).length > 1 ? ' je Pflanze' : ''}`];
    if (prod.loaded) {
      const left = prod.remaining + (prod.queued ?? 0) * p.amount;
      facts.push(`leer in etwa ${formatDuration(left * (p.duration / p.amount))}`);
    }
    parts.sub.textContent = facts.join(' · ');
    parts.stockCap.textContent = `Vorrat ${sourceCount(b)} / ${sourceCapacity(b)}`;
    const open = Object.keys(sourceInputs(p)).filter((t) => isItemUnlocked(state, t));
    parts.store.textContent = `Im Laden-Lager: ${open.map((t) => itemCount(t, storageCount(state, t))).join(' · ')}`;
  }

  render(building);
  update(building);
  return { node: root, update };
}

// Inhalt fürs Infofenster eines Gebäudes, oder null (Beet, Lagerhaus,
// Versandportal zeigen weiter Textzeilen).
export function createBuildingBody(state, building, handlers) {
  const kind = productionOf(building.type)?.kind;
  if (kind === 'workshop') return workshopBody(state, building, handlers);
  if (kind === 'source') return sourceBody(state, building);
  return null;
}
