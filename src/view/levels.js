// Fenster „Laden-Level“ (v0.9.0): was freigeschaltet ist, was zum nächsten
// Level noch fehlt, und der Knopf „Aufsteigen“.
//
// Wie das Laden-Fenster wird es regelmäßig aktualisiert (die Fabrik läuft
// weiter). Knöpfe werden dabei nicht neu erzeugt, nur geändert – neu
// aufgebaut wird erst, wenn sich das Level ändert.

import { BUILDINGS } from '../core/data/buildings.js';
import { ITEMS } from '../core/data/items.js';
import { LEVELS, MAX_LEVEL, canLevelUp, levelUp, nextLevelGoal, unlocksOf } from '../core/levels.js';
import { counterCountFor, counterSizeAt } from '../core/shop.js';
import { itemCount } from './format.js';
import { createItemIcon } from './itemArt.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// „🪓 Holzfällerlager, 🪚 Sägewerk · Holzstamm beim Händler“
// v0.10.0: dazu neue Verkaufstheken, z. B. „🛒 Theke 3 (25 Plätze)“
export function unlockText(level) {
  const { buildings, raws } = unlocksOf(level);
  const parts = buildings.map((type) => `${BUILDINGS[type].icon} ${BUILDINGS[type].name}`);
  const rawText = raws.map((type) => `${ITEMS[type].name} beim Händler`);
  const counters = [];
  const before = level > 1 ? counterCountFor(level - 1) : 0;
  if (level > 1) {
    for (let i = before; i < counterCountFor(level); i++) counters.push(`🛒 Theke ${i + 1} (${counterSizeAt(i)} Plätze)`);
  }
  return [parts.join(', '), ...rawText, ...counters].filter(Boolean).join(' · ');
}

export function levelTitle(level) {
  return `Level ${level} · ${LEVELS[level]?.name ?? ''}`;
}

export function createLevelView({ state, panels, onLevelUp }) {
  let open = false;
  let refs = null;
  let shownLevel = null;
  let lastResult = null; // letzter Aufstieg – wird oben im Fenster gefeiert

  // container ist das (bleibende) Fenster; box ein eigener Bereich darin, an
  // dem sich erkennen lässt, ob inzwischen ein anderes Fenster offen ist.
  function build(container, { makeButton }) {
    shownLevel = state.shopLevel;
    const box = el('div', 'level-view');
    container.append(box);
    if (lastResult?.level === state.shopLevel) {
      const gift = Object.entries(lastResult.gift).map(([type, n]) => itemCount(type, n)).join(', ');
      box.append(el('div', 'level-banner', `🎉 Level ${state.shopLevel} erreicht!${gift ? ` Gratis im Laden-Lager: ${gift}.` : ''}`));
    }
    box.append(
      el('h2', null, `⚖️ Laden-Level ${state.shopLevel}`),
      el('p', 'modal-meta', 'Jedes Level schaltet Neues frei – Gebäude, Rohstoffe und ab Level 4 eine weitere Verkaufstheke. Zu Beginn jedes Levels gibt es einen Rohstoff gratis.'),
      el('h3', null, 'Freigeschaltet'),
    );
    const unlocked = el('div', 'level-list');
    for (let level = 1; level <= state.shopLevel; level++) {
      const row = el('div', 'level-row');
      row.append(el('span', 'level-badge', levelTitle(level)), el('span', 'level-text', unlockText(level)));
      unlocked.append(row);
    }
    box.append(unlocked);

    const goal = nextLevelGoal(state);
    if (!goal) {
      box.append(
        el('p', 'empty-note', `Du hast das höchste Level (${MAX_LEVEL}) erreicht. Weitere Level kommen bald.`),
      );
      refs = { box, rows: [], button: null };
      return;
    }

    const next = state.shopLevel + 1;
    box.append(el('h3', null, `Nächstes Ziel: ${levelTitle(next)}`), el('p', null, 'Stelle in deiner Fabrik her:'));
    const list = el('div', 'goal-list');
    const rows = goal.map((g) => {
      const row = el('div', 'goal-row');
      const mark = el('span', 'goal-mark');
      const count = el('span', 'goal-count');
      row.append(mark, createItemIcon(g.type, 26), el('span', 'goal-name', itemCount(g.type, g.need)), count);
      list.append(row);
      return { type: g.type, row, mark, count };
    });
    const gift = Object.entries(LEVELS[next].gift ?? {}).map(([type, n]) => itemCount(type, n)).join(', ');
    const reward = el('div', 'level-reward');
    reward.append(
      el('div', null, `Neu ab Level ${next}: ${unlockText(next)}`),
      gift ? el('div', null, `🎁 Gratis: ${gift}`) : '',
    );
    const button = makeButton({
      label: `⬆ Aufsteigen auf Level ${next}`,
      primary: true,
      onClick: () => {
        const result = levelUp(state);
        if (result) {
          lastResult = result;
          onLevelUp(result);
        }
        refresh();
      },
    });
    button.classList.add('level-up');
    const actions = el('div', 'panel-actions');
    actions.append(button);
    box.append(list, reward, actions);
    refs = { box, rows, button };
  }

  function update() {
    const goal = nextLevelGoal(state) ?? [];
    for (const r of refs.rows) {
      const g = goal.find((item) => item.type === r.type);
      if (!g) continue;
      r.mark.textContent = g.done ? '✅' : '⬜';
      r.count.textContent = `${g.have} / ${g.need}`;
      r.row.classList.toggle('done', g.done);
    }
    if (refs.button) refs.button.disabled = !canLevelUp(state);
  }

  function show() {
    panels.showModal((container, helpers) => build(container, helpers));
    open = true;
    update();
  }

  function refresh() {
    if (!open) return;
    if (!panels.isModalOpen() || !refs?.box?.isConnected) {
      open = false;
      return;
    }
    if (shownLevel !== state.shopLevel) return show();
    update();
  }

  return {
    open() {
      lastResult = null;
      show();
    },
    refresh,
    isOpen: () => open,
  };
}
