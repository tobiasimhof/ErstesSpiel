// Laden-Fenster mit drei Reitern: Lager, Theken, Händler (v0.7.0).
//
// Das Fenster wird regelmäßig aktualisiert, weil die Fabrik weiterläuft und
// Kunden kaufen. Knöpfe werden dabei nicht neu erzeugt, sondern nur ihre
// Beschriftung geändert – sonst ginge ein Tippen verloren, das gerade läuft.
// Neu aufgebaut wird ein Bereich nur, wenn sich seine Knöpfe ändern
// (z. B. eine andere Ware auf der Theke).

import { ITEMS } from '../core/data/items.js';
import { CUSTOMERS } from '../core/data/shop.js';
import {
  buyRaw,
  clearCounter,
  counterSize,
  fillCounter,
  isSellable,
  setCounterItem,
} from '../core/market.js';
import { storageCapacity, storageCount, storageFree, storageTotal } from '../core/shop.js';
import { createItemIcon } from './itemArt.js';
import { itemCount, numberFormat } from './format.js';

const TABS = [
  { key: 'lager', label: '📦 Lager' },
  { key: 'theken', label: '🛒 Theken' },
  { key: 'haendler', label: '🧺 Händler' },
];

const RAWS = Object.keys(ITEMS).filter((type) => ITEMS[type].raw);

export function createShopView({ state, panels, onChange }) {
  let open = false;
  let tab = 'lager';
  let picking = null; // Index der Theke, für die gerade eine Ware gewählt wird
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
      const note = def.raw
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
    if (picking !== null) return `pick|${picking}|${sellableInStorage().join(',')}`;
    return `theken|${state.counters.map((c) => c.type ?? '-').join(',')}`;
  }

  function salesText(sale) {
    const items = Object.entries(sale.items).map(([type, n]) => itemCount(type, n));
    return `🧑 kaufte ${items.join(', ')} · +${numberFormat.format(sale.gold)} 🪙`;
  }

  function buildPicker(body, { makeButton }) {
    const index = picking;
    body.append(el('h3', null, `Ware für Theke ${index + 1} wählen`));
    const types = sellableInStorage();
    const counts = new Map();
    if (types.length === 0) {
      body.append(el('p', 'empty-note', 'Im Laden-Lager liegt nichts, was sich verkaufen lässt.'));
    } else {
      body.append(el('p', 'modal-meta', 'Die Theke wird gleich mit dieser Ware aufgefüllt.'));
      const list = el('div', 'item-list');
      for (const type of types) {
        const def = ITEMS[type];
        const button = makeButton({
          label: '',
          onClick: () => {
            setCounterItem(state, index, type);
            fillCounter(state, index);
            picking = null;
            changed();
          },
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

  function buildTheken(body, helpers) {
    if (picking !== null) return buildPicker(body, helpers);
    const { makeButton } = helpers;
    body.append(
      el(
        'p',
        null,
        `Kunden kommen alle ${CUSTOMERS.minInterval}–${CUSTOMERS.maxInterval} Sekunden und kaufen ${CUSTOMERS.minItems}–${CUSTOMERS.maxItems} Stück von deinen Theken.`,
      ),
    );
    const grid = el('div', 'counters');
    const cards = state.counters.map((counter, index) => {
      const card = el('div', 'counter-card');
      const head = el('div', 'counter-head', `Theke ${index + 1}`);
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
      const plus1 = makeButton({ label: '+1', onClick: fill(1) });
      const plus5 = makeButton({ label: '+5', onClick: fill(5) });
      const full = makeButton({ label: 'Auffüllen', primary: true, onClick: fill(Infinity) });
      const back = makeButton({
        label: '↩ Abräumen',
        onClick: () => {
          clearCounter(state, index);
          changed();
        },
      });
      back.title = 'Zurück ins Laden-Lager';
      if (counter.type) buttons.append(plus1, plus5, full, back);
      buttons.append(pick);
      card.append(head, ware, buttons);
      grid.append(card);
      return { amount, plus1, plus5, full, back };
    });
    const next = el('p', 'modal-meta');
    const salesBox = el('div', 'sales');
    body.append(grid, next, el('h3', null, 'Letzte Verkäufe'), salesBox);
    let salesShown = null;

    return () => {
      const size = counterSize(state);
      state.counters.forEach((counter, index) => {
        const c = cards[index];
        if (!counter.type) return;
        c.amount.textContent = `${counter.count} / ${size}`;
        const room = counter.count < size && storageCount(state, counter.type) > 0;
        c.plus1.disabled = !room;
        c.plus5.disabled = !room;
        c.full.disabled = !room;
      });
      const anything = state.counters.some((c) => c.count > 0);
      next.textContent = anything
        ? `Nächster Kunde in etwa ${Math.max(1, Math.ceil(state.market.timer))} s.`
        : 'Deine Theken sind leer – Kunden gehen ohne Kauf wieder.';
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

  // ---------- Händler ----------

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
        },
      });
      button.classList.add('item-count');
      row.append(createItemIcon(type, 30), el('span', 'item-name', def.name), note, button);
      list.append(row);
      return { type, note, button };
    });
    body.append(list);
    return () => {
      for (const { type, note, button } of rows) {
        note.textContent = `Im Laden-Lager: ${storageCount(state, type)}`;
        button.disabled = state.gold < ITEMS[type].buyPrice || storageFree(state) < 1;
      }
    };
  }

  // ---------- Gerüst ----------

  const SECTIONS = {
    lager: { sig: lagerSig, build: buildLager },
    theken: { sig: thekenSig, build: buildTheken },
    haendler: { sig: () => 'haendler', build: buildHaendler },
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
