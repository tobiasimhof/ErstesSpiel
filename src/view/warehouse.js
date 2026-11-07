// Lagerhaus-Fenster (v0.12.0): Ware aus dem Laden-Lager wählen, dann
// - Befüllen: wie viele Stück ins Lagerhaus kommen (wie die Menge der Theke),
// - Nachschub: wie viele Stück immer im Laden-Lager bleiben sollen.
//
// Das Fenster wird regelmäßig aktualisiert (die Fabrik läuft weiter). Knöpfe
// werden dabei nicht neu erzeugt, nur ihre Beschriftung geändert – sonst ginge
// ein Tippen verloren. Neu aufgebaut wird nur, wenn sich die Knöpfe ändern.

import { ITEMS } from '../core/data/items.js';
import { storageCapacity, storageCount } from '../core/shop.js';
import { findBuilding } from '../core/state.js';
import { canStoreItem, fillMax, fillWarehouse, setSupply, warehouseCount, warehouseRoom } from '../core/warehouse.js';
import { createItemIcon } from './itemArt.js';
import { itemCount, numberFormat } from './format.js';

const TITLES = { fill: '📥 Lagerhaus befüllen', supply: '🔁 Nachschub einrichten' };

export function createWarehouseView({ state, panels, onChange }) {
  let open = false;
  // { id, kind: 'fill' | 'supply', type (gewählte Ware oder null), draft }
  let view = null;
  let refs = null; // { body, helpers }
  let section = null; // { sig, update }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const store = () => findBuilding(state, view.id);

  // Waren im Laden-Lager, die ins Lagerhaus dürfen (keine Rohstoffe)
  function storedTypes() {
    return Object.keys(ITEMS).filter((type) => canStoreItem(type) && storageCount(state, type) > 0);
  }

  function sig() {
    return view.type ? `amount|${view.kind}|${view.type}` : `pick|${view.kind}|${storedTypes().join(',')}`;
  }

  function close() {
    open = false;
    view = null;
    panels.hideModal();
  }

  function done(message) {
    onChange();
    close();
    panels.toast(message, 3500);
  }

  // ---------- Ware wählen ----------

  function buildPicker(body, { makeButton }) {
    const b = store();
    body.append(
      el(
        'p',
        null,
        view.kind === 'fill'
          ? 'Welche Ware aus dem Laden-Lager soll ins Lagerhaus? Sie läuft am orangen Pfeil aufs Band.'
          : 'Welche Ware soll das Lagerhaus immer wieder aus dem Laden-Lager holen? Danach stellst du ein, wie viele im Laden-Lager bleiben – zum Beispiel zum Bauen.',
      ),
    );
    const types = storedTypes();
    const rows = new Map();
    if (types.length === 0) {
      body.append(el('p', 'empty-note', 'Im Laden-Lager liegt nichts, was ins Lagerhaus kann (Rohstoffe legt man direkt in Gebäude ein).'));
    } else {
      const list = el('div', 'item-list');
      for (const type of types) {
        const def = ITEMS[type];
        const button = makeButton({
          label: '',
          onClick: () => {
            view.type = type;
            view.draft = view.kind === 'fill' ? fillMax(state, store(), type) : 0;
            render();
          },
        });
        button.classList.add('item-row', 'pick-row');
        const note = el('span', 'item-note');
        const count = el('span', 'item-count');
        rows.set(type, { button, note, count });
        button.append(createItemIcon(type, 30), el('span', 'item-name', def.name), note, count);
        list.append(button);
      }
      body.append(list);
    }
    const actions = el('div', 'panel-actions');
    actions.append(makeButton({ label: '✕ Abbrechen', onClick: close }));
    body.append(actions);
    return () => {
      for (const [type, row] of rows) {
        const room = warehouseRoom(b, type);
        row.count.textContent = `${numberFormat.format(storageCount(state, type))}×`;
        row.note.textContent = room > 0 ? 'im Laden-Lager' : 'Kein Platz mehr im Lagerhaus';
        row.button.disabled = room <= 0;
      }
    };
  }

  // ---------- Menge (Befüllen) bzw. Rest (Nachschub) ----------

  function buildAmount(body, { makeButton }) {
    const { kind, type } = view;
    const def = ITEMS[type];
    const fill = kind === 'fill';
    const max = () => (fill ? fillMax(state, store(), type) : storageCapacity(state));
    body.append(
      el('h3', null, fill ? `Wie viele ${def.plural} ins Lagerhaus?` : `Wie viele ${def.plural} sollen im Laden-Lager bleiben?`),
    );
    const ware = el('div', 'counter-ware');
    const text = el('div', 'counter-text');
    const wareNote = el('span', 'item-note');
    text.append(el('span', 'item-name', def.name), wareNote);
    ware.append(createItemIcon(type, 34), text);
    const number = el('div', 'amount-number');
    const sub = el('div', 'amount-worth');
    const display = el('div', 'amount-display');
    display.append(number, sub);
    const step = (n) => () => {
      view.draft = Math.max(0, Math.min(max(), view.draft + n));
      update();
    };
    const none = makeButton({
      label: '0',
      onClick: () => {
        view.draft = 0;
        update();
      },
    });
    const minus5 = makeButton({ label: '−5', onClick: step(-5) });
    const minus1 = makeButton({ label: '−1', onClick: step(-1) });
    const plus1 = makeButton({ label: '+1', onClick: step(1) });
    const plus5 = makeButton({ label: '+5', onClick: step(5) });
    // Befüllen: „Alle“ wie bei der Theke; Nachschub: größere Schritte für den Rest
    const last = fill
      ? makeButton({
          label: '',
          onClick: () => {
            view.draft = max();
            update();
          },
        })
      : makeButton({ label: '+20', onClick: step(20) });
    const stepper = el('div', 'amount-stepper');
    stepper.append(none, minus5, minus1, display, plus1, plus5, last);
    const meta = el('p', 'modal-meta');
    const ok = makeButton({
      label: fill ? '✓ Ins Lagerhaus' : '✓ Nachschub starten',
      primary: true,
      onClick: () => {
        const b = store();
        if (!b) return close();
        if (fill) {
          const n = fillWarehouse(state, b, type, view.draft);
          done(n > 0 ? `Lagerhaus: ${itemCount(type, n)} eingelagert. Sie laufen am orangen Pfeil aufs Band.` : 'Nichts eingelagert.');
        } else {
          setSupply(b, type, view.draft);
          const keep = view.draft > 0 ? ` ${itemCount(type, view.draft)} bleiben dort.` : '';
          done(`Nachschub: Das Lagerhaus holt ${def.plural} aus dem Laden-Lager.${keep}`);
        }
      },
    });
    ok.classList.add('amount-ok');
    const back = makeButton({
      label: '← Andere Ware',
      onClick: () => {
        view.type = null;
        render();
      },
    });
    const actions = el('div', 'panel-actions');
    actions.append(back, ok);
    body.append(ware, stepper, meta, actions);

    function update() {
      const b = store();
      if (!b) return close();
      view.draft = Math.min(view.draft, max());
      const n = view.draft;
      const inShop = storageCount(state, type);
      number.textContent = String(n);
      minus5.disabled = minus1.disabled = none.disabled = n <= 0;
      plus5.disabled = plus1.disabled = last.disabled = n >= max();
      if (fill) {
        last.textContent = `Alle (${max()})`;
        sub.textContent = `${numberFormat.format(n * def.price)} 🪙`;
        wareNote.textContent = `Platz im Lagerhaus: ${warehouseRoom(b, type)}`;
        meta.textContent = `Im Laden-Lager: ${numberFormat.format(inShop)} · im Lagerhaus: ${warehouseCount(b, type)}.`;
      } else {
        sub.textContent = 'bleiben';
        wareNote.textContent = `je ${numberFormat.format(def.price)} 🪙`;
        const now = Math.max(0, inShop - n);
        meta.textContent = `Im Laden-Lager: ${numberFormat.format(inShop)}. Das Lagerhaus holt ${def.plural}, solange dort mehr als ${n} liegen – gerade also ${numberFormat.format(now)}.`;
      }
    }
    return update;
  }

  // ---------- Aufbau ----------

  function render(force = false) {
    const s = sig();
    if (force || !section || section.sig !== s) {
      refs.body.replaceChildren();
      const build = view.type ? buildAmount : buildPicker;
      section = { sig: s, update: build(refs.body, refs.helpers) };
    }
    section.update();
  }

  return {
    // kind: 'fill' (Befüllen) oder 'supply' (Nachschub)
    open(buildingId, kind) {
      view = { id: buildingId, kind, type: null, draft: 0 };
      section = null;
      panels.showModal((box, helpers) => {
        const body = el('div', 'tab-body');
        box.append(el('h2', null, TITLES[kind]), body);
        refs = { body, helpers };
      });
      open = true;
      render(true);
    },
    refresh() {
      if (!open) return;
      if (!panels.isModalOpen() || !refs.body.isConnected || !store()) {
        open = false;
        return;
      }
      render();
    },
    isOpen: () => open,
  };
}
