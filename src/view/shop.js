// Laden-Fenster mit drei Reitern: Lager, Theken, Händler (v0.7.0).
// v0.24.0: Der Reiter „Theken“ zeigt immer 6 Plätze – die gekauften Theken,
// dann die nächste zum Kaufen, die späteren ausgegraut.
//
// Das Fenster wird regelmäßig aktualisiert, weil die Fabrik weiterläuft und
// Kunden kaufen. Knöpfe werden dabei nicht neu erzeugt, sondern nur ihre
// Beschriftung geändert – sonst ginge ein Tippen verloren, das gerade läuft.
// Neu aufgebaut wird ein Bereich nur, wenn sich seine Knöpfe ändern
// (z. B. eine andere Ware auf der Theke).

import { ITEMS } from '../core/data/items.js';
import { CUSTOMERS } from '../core/data/shop.js';
import {
  buyCounter,
  buyRaw,
  clearCounter,
  counterMaxFor,
  counterSize,
  counterSlots,
  customerRange,
  fillCounter,
  isSellable,
  nextCounterPrice,
  nextCustomerIn,
  setCounterAmount,
  setCounterItem,
} from '../core/market.js';
import { isItemUnlocked, itemLevel } from '../core/levels.js';
import { perCounterFor, storageCapacity, storageCount, storageFree, storageTotal } from '../core/shop.js';
import { createItemIcon } from './itemArt.js';
import { itemCount, numberFormat } from './format.js';

const TABS = [
  { key: 'lager', label: '📦 Lager' },
  { key: 'theken', label: '🛒 Theken' },
  { key: 'haendler', label: '🧺 Händler' },
];

// v0.16.0: nur was es beim Händler gibt (die Flachspflanze wächst im Beet)
const RAWS = Object.keys(ITEMS).filter((type) => ITEMS[type].raw && ITEMS[type].buyPrice > 0);

export function createShopView({ state, panels, onChange }) {
  let open = false;
  let tab = 'lager';
  let picking = null; // Index der Theke, für die gerade eine Ware gewählt wird
  // v0.10.0: Menge wählen – { index, type, draft } (draft = eingestellte Anzahl)
  let amountFor = null;
  let refs = null;
  let section = null; // { sig, update } des sichtbaren Reiters

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function changed() {
    onChange();
    refresh();
  }

  // ---------- Lager ----------

  function lagerSig() {
    return `lager|${JSON.stringify(state.storage)}`;
  }

  function buildLager(body) {
    body.append(
      el('p', null, 'Hier landet alles aus deinen Versandportalen. Daraus baust du neue Gebäude oder stellst es auf die Theken.'),
    );
    const entries = Object.keys(ITEMS).filter((type) => storageCount(state, type) > 0);
    if (entries.length === 0) {
      body.append(el('p', 'empty-note', 'Leer. Lass Waren in ein Versandportal laufen.'));
      return () => {};
    }
    const list = el('div', 'item-list');
    let total = 0;
    for (const type of entries) {
      const def = ITEMS[type];
      const count = storageCount(state, type);
      const note = def.grown
        ? 'Wächst im Beet · in die Erntebank einlegen'
        : def.raw
          ? `Rohstoff · beim Händler ${numberFormat.format(def.buyPrice)} 🪙`
          : `Wert ${numberFormat.format(def.price)} 🪙 je Stück`;
      if (!def.raw) total += count * def.price;
      const row = el('div', 'item-row');
      row.append(createItemIcon(type, 30), el('span', 'item-name', def.name), el('span', 'item-note', note), el('span', 'item-count', `${numberFormat.format(count)}×`));
      list.append(row);
    }
    body.append(list);
    if (total > 0) body.append(el('p', 'modal-meta', `Wert aller Waren (ohne Rohstoffe): ${numberFormat.format(total)} 🪙`));
    return () => {};
  }

  // ---------- Theken ----------

  function sellableInStorage() {
    return Object.keys(ITEMS).filter((type) => isSellable(type) && storageCount(state, type) > 0);
  }

  function thekenSig() {
    if (amountFor) return `amount|${amountFor.index}|${amountFor.type}`;
    if (picking !== null) return `pick|${picking}|${sellableInStorage().join(',')}`;
    return `theken|${state.shopLevel}|${state.counters.length}|${state.counters.map((c) => c.type ?? '-').join(',')}`;
  }

  // Öffnet die Mengenwahl. draft: vorgeschlagene Anzahl (null = so viele wie möglich).
  function startAmount(index, type, draft = null) {
    const max = counterMaxFor(state, index, type);
    amountFor = { index, type, draft: draft === null ? max : Math.min(draft, max) };
    picking = null;
    refresh();
  }

  function salesText(sale) {
    const items = Object.entries(sale.items).map(([type, n]) => itemCount(type, n));
    const where = Number.isInteger(sale.counter) ? `Theke ${sale.counter + 1}: ` : '';
    return `🧑 ${where}kaufte ${items.join(', ')} · +${numberFormat.format(sale.gold)} 🪙`;
  }

  // v0.24.0: „Jede Theke hat ihre eigenen Kunden: Auf Level 8 kommt etwa alle
  // 60–100 Sekunden einer und kauft 1 Stück.“
  function customersText() {
    const { min, max } = customerRange(state.shopLevel);
    const items =
      CUSTOMERS.minItems === CUSTOMERS.maxItems ? `${CUSTOMERS.minItems} Stück` : `${CUSTOMERS.minItems}–${CUSTOMERS.maxItems} Stück`;
    return `Jede Theke hat ihre eigenen Kunden: Auf Level ${state.shopLevel} kommt etwa alle ${Math.round(min)}–${Math.round(max)} Sekunden einer und kauft ${items}. Mehr Theken verkaufen mehr.`;
  }

  // v0.24.0: Theke kaufen – mit Rückfrage, weil es viel Gold kostet.
  async function askBuyCounter() {
    const price = nextCounterPrice(state);
    if (price === null) return;
    const number = state.counters.length + 1;
    const ok = await panels.confirm({
      title: `Theke ${number} kaufen?`,
      text: `Für ${numberFormat.format(price)} Gold bekommst du eine weitere Theke mit eigenen Kunden – auf Level ${state.shopLevel} verkauft sie etwa ${numberFormat.format(perCounterFor(state.shopLevel))} Stück pro Minute.\nDanach hast du noch ${numberFormat.format(Math.max(0, state.gold - price))} Gold.`,
      okLabel: `🛒 Kaufen · ${numberFormat.format(price)} 🪙`,
    });
    if (!ok) return;
    const result = buyCounter(state);
    if (result === 'ok') {
      changed();
      panels.toast(`Theke ${number} gekauft – stell eine Ware darauf.`);
    } else if (result === 'gold') panels.toast('Dafür reicht dein Gold nicht.');
    refresh();
  }

  function buildPicker(body, { makeButton }) {
    const index = picking;
    body.append(el('h3', null, `Ware für Theke ${index + 1} wählen`));
    const types = sellableInStorage();
    const counts = new Map();
    if (types.length === 0) {
      body.append(el('p', 'empty-note', 'Im Laden-Lager liegt nichts, was sich verkaufen lässt.'));
    } else {
      body.append(el('p', 'modal-meta', 'Danach wählst du, wie viele Stück auf die Theke kommen.'));
      const list = el('div', 'item-list');
      for (const type of types) {
        const def = ITEMS[type];
        const button = makeButton({
          label: '',
          onClick: () => startAmount(index, type),
        });
        button.classList.add('item-row', 'pick-row');
        const count = el('span', 'item-count');
        counts.set(type, count);
        button.append(createItemIcon(type, 30), el('span', 'item-name', def.name), el('span', 'item-note', `je ${numberFormat.format(def.price)} 🪙`), count);
        list.append(button);
      }
      body.append(list);
    }
    const actions = el('div', 'panel-actions');
    actions.append(
      makeButton({
        label: '✕ Abbrechen',
        onClick: () => {
          picking = null;
          refresh();
        },
      }),
    );
    body.append(actions);
    return () => {
      for (const [type, node] of counts) node.textContent = `${numberFormat.format(storageCount(state, type))}×`;
    };
  }

  // v0.10.0: Wie viele Stück sollen auf die Theke? (Tobias: „nur 8 davon verkaufen“)
  function buildAmount(body, { makeButton }) {
    const { index, type } = amountFor;
    const def = ITEMS[type];
    const size = counterSize(state);
    body.append(el('h3', null, `Theke ${index + 1}: Wie viele ${def.plural}?`));
    const ware = el('div', 'counter-ware');
    const text = el('div', 'counter-text');
    text.append(el('span', 'item-name', def.name), el('span', 'item-note', `je ${numberFormat.format(def.price)} 🪙 · Theke fasst ${size}`));
    ware.append(createItemIcon(type, 34), text);
    const number = el('div', 'amount-number');
    const worth = el('div', 'amount-worth');
    const display = el('div', 'amount-display');
    display.append(number, worth);
    const step = (n) => () => {
      const max = counterMaxFor(state, index, type);
      amountFor.draft = Math.max(0, Math.min(max, amountFor.draft + n));
      update();
    };
    const minus5 = makeButton({ label: '−5', onClick: step(-5) });
    const minus1 = makeButton({ label: '−1', onClick: step(-1) });
    const plus1 = makeButton({ label: '+1', onClick: step(1) });
    const plus5 = makeButton({ label: '+5', onClick: step(5) });
    const none = makeButton({
      label: '0',
      onClick: () => {
        amountFor.draft = 0;
        update();
      },
    });
    const all = makeButton({
      label: '',
      onClick: () => {
        amountFor.draft = counterMaxFor(state, index, type);
        update();
      },
    });
    const stepper = el('div', 'amount-stepper');
    stepper.append(none, minus5, minus1, display, plus1, plus5, all);
    const meta = el('p', 'modal-meta');
    const ok = makeButton({
      label: '✓ Auf die Theke',
      primary: true,
      onClick: () => {
        const counter = state.counters[index];
        if (counter.type !== type) setCounterItem(state, index, type);
        const n = setCounterAmount(state, index, amountFor.draft);
        amountFor = null;
        changed();
        panels.toast(`Theke ${index + 1}: ${itemCount(type, n)}.`);
      },
    });
    ok.classList.add('amount-ok');
    const cancel = makeButton({
      label: '✕ Abbrechen',
      onClick: () => {
        amountFor = null;
        refresh();
      },
    });
    const actions = el('div', 'panel-actions');
    actions.append(cancel, ok);
    body.append(ware, stepper, meta, actions);

    function update() {
      const counter = state.counters[index];
      const max = counterMaxFor(state, index, type);
      amountFor.draft = Math.min(amountFor.draft, max);
      const n = amountFor.draft;
      number.textContent = String(n);
      worth.textContent = `${numberFormat.format(n * def.price)} 🪙`;
      all.textContent = `Alle (${max})`;
      minus5.disabled = minus1.disabled = none.disabled = n <= 0;
      plus5.disabled = plus1.disabled = all.disabled = n >= max;
      const onCounter = counter.type === type ? counter.count : 0;
      meta.textContent = `Auf der Theke: ${onCounter} · im Laden-Lager: ${storageCount(state, type)}. Was du weniger einstellst, kommt zurück ins Laden-Lager.`;
    }
    return update;
  }

  function buildTheken(body, helpers) {
    if (amountFor) return buildAmount(body, helpers);
    if (picking !== null) return buildPicker(body, helpers);
    const { makeButton } = helpers;
    const intro = el('p', null);
    const grid = el('div', 'counters');
    const updates = [];
    for (const slot of counterSlots(state)) {
      if (slot.status === 'owned') updates.push(ownedCard(grid, slot.index, makeButton));
      else updates.push(buyCard(grid, slot, makeButton));
    }
    const next = el('p', 'modal-meta');
    const salesBox = el('div', 'sales');
    body.append(intro, grid, next, el('h3', null, 'Letzte Verkäufe'), salesBox);
    let salesShown = null;

    return () => {
      intro.textContent = customersText();
      for (const update of updates) update();
      const anything = state.counters.some((c) => c.count > 0);
      next.textContent = anything ? '' : 'Deine Theken sind leer – Kunden gehen ohne Kauf wieder.';
      next.hidden = anything;
      const latest = state.market.sales[0]?.id ?? 0;
      if (latest !== salesShown) {
        salesShown = latest;
        if (state.market.sales.length === 0) {
          salesBox.replaceChildren(el('p', 'empty-note', 'Noch nichts verkauft.'));
        } else {
          salesBox.replaceChildren(...state.market.sales.map((sale) => el('div', 'sale-line', salesText(sale))));
        }
      }
    };
  }

  // Eine gekaufte Theke: Ware, Menge, Knöpfe, nächster Kunde.
  function ownedCard(grid, index, makeButton) {
    const counter = state.counters[index];
    const card = el('div', 'counter-card');
    card.dataset.counter = String(index);
    const head = el('div', 'counter-head', `Theke ${index + 1} · ${counterSize(state)} Plätze`);
    const ware = el('div', 'counter-ware');
    const amount = el('span', 'counter-amount');
    if (counter.type) {
      const def = ITEMS[counter.type];
      const text = el('div', 'counter-text');
      text.append(el('span', 'item-name', def.name), el('span', 'item-note', `je ${numberFormat.format(def.price)} 🪙`));
      ware.append(createItemIcon(counter.type, 34), text, amount);
    } else {
      ware.append(el('span', 'counter-empty', 'Leer'));
    }
    // v0.24.0: Wann der nächste Kunde dieser Theke kommt
    const customer = el('div', 'counter-next');
    const pick = makeButton({
      label: counter.type ? '🔄 Ware' : '➕ Ware wählen',
      primary: !counter.type,
      onClick: () => {
        picking = index;
        refresh();
      },
    });
    const fill = (n) => () => {
      if (fillCounter(state, index, n) > 0) changed();
      else panels.toast(`Kein ${ITEMS[counter.type].name} mehr im Laden-Lager.`);
    };
    const buttons = el('div', 'counter-buttons');
    // v0.10.0: „Menge“ statt +1/+5 – stellt genau die gewünschte Anzahl ein
    const amountButton = makeButton({
      label: '🔢 Menge',
      onClick: () => startAmount(index, counter.type, counter.count),
    });
    amountButton.dataset.counterAction = 'menge';
    const full = makeButton({ label: 'Auffüllen', primary: true, onClick: fill(Infinity) });
    const back = makeButton({
      label: '↩ Abräumen',
      onClick: () => {
        clearCounter(state, index);
        changed();
      },
    });
    back.title = 'Zurück ins Laden-Lager';
    if (counter.type) buttons.append(amountButton, full, back);
    buttons.append(pick);
    card.append(head, ware, customer, buttons);
    grid.append(card);
    return () => {
      const size = counterSize(state);
      customer.hidden = !counter.type;
      if (!counter.type) return;
      amount.textContent = `${counter.count} / ${size}`;
      full.disabled = !(counter.count < size && storageCount(state, counter.type) > 0);
      customer.textContent =
        counter.count > 0
          ? `🧑 Nächster Kunde in etwa ${Math.max(1, Math.ceil(nextCustomerIn(state, index)))} s`
          : 'Leer verkauft – Kunden gehen ohne Kauf.';
    };
  }

  // v0.24.0: Ein Platz für eine Theke, die man noch kaufen kann (oder später).
  function buyCard(grid, slot, makeButton) {
    const card = el('div', `counter-card counter-slot counter-slot-${slot.status}`);
    card.dataset.counter = String(slot.index);
    card.append(el('div', 'counter-head', `Theke ${slot.index + 1}`));
    grid.append(card);
    if (slot.status === 'locked') {
      card.append(el('div', 'counter-empty', '🔒 Kommt später im Spiel'));
      return () => {};
    }
    const price = `${numberFormat.format(slot.price)} 🪙`;
    if (slot.status === 'later') {
      card.append(el('div', 'counter-empty', `${price} · erst Theke ${slot.index} kaufen`));
      return () => {};
    }
    const text = el('div', 'counter-next');
    const missing = el('div', 'counter-missing');
    const button = makeButton({ label: `🛒 Kaufen · ${price}`, primary: true, onClick: askBuyCounter });
    button.dataset.counterAction = 'kaufen';
    const buttons = el('div', 'counter-buttons');
    buttons.append(button);
    card.append(text, missing, buttons);
    return () => {
      text.textContent = `Noch nicht gekauft · eigene Kunden: +${numberFormat.format(perCounterFor(state.shopLevel))} Stück pro Minute`;
      const lack = slot.price - state.gold;
      button.disabled = lack > 0;
      missing.textContent = lack > 0 ? `Dir fehlen noch ${numberFormat.format(Math.ceil(lack))} 🪙` : '';
      missing.hidden = lack <= 0;
    };
  }

  // ---------- Händler ----------

  // Neu aufbauen, wenn sich das Level ändert (gesperrte Rohstoffe, v0.9.0).
  function haendlerSig() {
    return `haendler|${state.shopLevel}`;
  }

  function buildHaendler(body, { makeButton }) {
    body.append(el('p', null, 'Der Händler verkauft Rohstoffe. Was du kaufst, liegt danach im Laden-Lager – von dort legst du es in dein Gebäude ein.'));
    const list = el('div', 'item-list');
    const rows = RAWS.map((type) => {
      const def = ITEMS[type];
      const row = el('div', 'item-row trade-row');
      const note = el('span', 'item-note');
      const button = makeButton({
        label: `Kaufen · ${numberFormat.format(def.buyPrice)} 🪙`,
        primary: true,
        onClick: () => {
          const result = buyRaw(state, type);
          if (result === 'ok') {
            changed();
            panels.toast(`${def.name} gekauft. Er liegt im Laden-Lager.`);
          } else if (result === 'gold') panels.toast('Dafür reicht dein Gold nicht.');
          else if (result === 'full') panels.toast('Dein Laden-Lager ist voll.');
          else if (result === 'locked') panels.toast(`${def.name} gibt es erst ab Level ${itemLevel(type)}.`);
        },
      });
      button.classList.add('item-count');
      if (!isItemUnlocked(state, type)) {
        button.textContent = `🔒 ab Level ${itemLevel(type)}`;
        button.classList.remove('primary');
        row.classList.add('locked');
      }
      row.append(createItemIcon(type, 30), el('span', 'item-name', def.name), note, button);
      list.append(row);
      return { type, note, button };
    });
    body.append(list);
    return () => {
      for (const { type, note, button } of rows) {
        note.textContent = `Im Laden-Lager: ${storageCount(state, type)}`;
        button.disabled = !isItemUnlocked(state, type) || state.gold < ITEMS[type].buyPrice || storageFree(state) < 1;
      }
    };
  }

  // ---------- Gerüst ----------

  const SECTIONS = {
    lager: { sig: lagerSig, build: buildLager },
    theken: { sig: thekenSig, build: buildTheken },
    haendler: { sig: haendlerSig, build: buildHaendler },
  };

  function renderSection(force = false) {
    const def = SECTIONS[tab];
    const sig = def.sig();
    if (force || !section || section.sig !== sig) {
      refs.body.replaceChildren();
      section = { sig, update: def.build(refs.body, refs.helpers) };
    }
    section.update();
  }

  function updateHeader() {
    refs.meta.textContent = `Level ${state.shopLevel} · 🪙 ${numberFormat.format(state.gold)} Gold · Lager ${numberFormat.format(storageTotal(state))} / ${numberFormat.format(storageCapacity(state))}`;
    for (const [key, button] of refs.tabs) button.classList.toggle('active', key === tab);
  }

  function showTab(key) {
    tab = key;
    picking = null;
    amountFor = null;
    updateHeader();
    renderSection(true);
  }

  function refresh() {
    if (!open) return;
    if (!panels.isModalOpen() || !refs.body.isConnected) {
      open = false;
      return;
    }
    updateHeader();
    renderSection();
  }

  return {
    open(startTab) {
      if (startTab) tab = startTab;
      picking = null;
      amountFor = null;
      section = null;
      panels.showModal((box, helpers) => {
        const meta = el('p', 'modal-meta');
        const tabsRow = el('div', 'tabs');
        const tabs = new Map();
        for (const t of TABS) {
          const button = helpers.makeButton({ label: t.label, onClick: () => showTab(t.key) });
          button.classList.add('tab');
          button.dataset.tab = t.key;
          tabs.set(t.key, button);
          tabsRow.append(button);
        }
        const body = el('div', 'tab-body');
        box.append(el('h2', null, '⚖️ Dein Laden'), meta, tabsRow, body);
        refs = { box, meta, tabs, body, helpers };
      });
      open = true;
      updateHeader();
      renderSection(true);
    },
    refresh,
    isOpen: () => open,
  };
}
