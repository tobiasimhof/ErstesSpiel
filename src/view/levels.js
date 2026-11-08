// Fenster „Laden-Level“ (v0.9.0, seit v0.13.0 mit Aufträgen):
// - Reiter „📜 Aufträge“: Geschichte des Bauabschnitts, Erfahrungsleiste, der
//   aktuelle Auftrag mit „✓ Abgeben“ und der Aufstieg (kostet Gold).
// - Reiter „🏘️ Ort & Level“: alle Bauabschnitte des Ortes und was sie
//   freischalten.
//
// Wie das Laden-Fenster wird es regelmäßig aktualisiert (die Fabrik läuft
// weiter). Knöpfe werden dabei nicht neu erzeugt, nur geändert – neu
// aufgebaut wird erst, wenn sich Level, Reiter oder Auftrag ändern.

import { BUILDINGS } from '../core/data/buildings.js';
import { ITEMS } from '../core/data/items.js';
import { LEVELS, MAX_LEVEL, levelUp, levelUpBlocker, nextLevelCost, unlocksOf } from '../core/levels.js';
import { COUNTER_SIZE_NAMES, SHOP_LEVELS } from '../core/data/shop.js';
import {
  canDeliver,
  canSkipQuest,
  currentQuest,
  deliverQuest,
  levelXp,
  questNeeds,
  questNumber,
  questReward,
  skipQuest,
  xpNeeded,
} from '../core/quests.js';
import { costText, itemCount, numberFormat } from './format.js';
import { createItemIcon } from './itemArt.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// „🪓 Holzfällerlager, 🪚 Sägewerk · Holzstamm beim Händler“
// v0.10.0/v0.10.1: dazu der Laden-Ausbau, z. B.
// „🛒 Theke 3 · mittlere Theken (25 Plätze) · 📦 Laden-Lager 1.000 Plätze“
export function unlockText(level) {
  const { buildings, raws } = unlocksOf(level);
  const parts = buildings.map((type) => `${BUILDINGS[type].icon} ${BUILDINGS[type].name}`);
  const rawText = raws.map((type) => `${ITEMS[type].name} beim Händler`);
  const shop = [];
  const now = SHOP_LEVELS[level];
  const before = SHOP_LEVELS[level - 1];
  if (now && before) {
    for (let i = before.counters; i < now.counters; i++) shop.push(`🛒 Theke ${i + 1}`);
    if (now.counterSize > before.counterSize) {
      const name = COUNTER_SIZE_NAMES[now.counterSize];
      shop.push(`${name ? `${name} Theken` : 'größere Theken'} (${now.counterSize} Plätze)`);
    }
    if (now.storage > before.storage) shop.push(`📦 Laden-Lager ${numberFormat.format(now.storage)} Plätze`);
  }
  return [parts.join(', '), ...rawText, ...shop].filter(Boolean).join(' · ');
}

// „Level 4 · Die Mühle am Fluss“
export function levelTitle(level) {
  return `Level ${level} · ${LEVELS[level]?.name ?? ''}`;
}

const TABS = [
  { key: 'quests', label: '📜 Aufträge' },
  { key: 'town', label: '🏘️ Ort & Level' },
];

export function createLevelView({ state, panels, onLevelUp, onQuestDone }) {
  let open = false;
  let tab = 'quests';
  let refs = null;
  let section = null; // { sig, update } des sichtbaren Reiters
  let lastResult = null; // letzter Aufstieg – wird oben im Fenster gefeiert
  let lastDelivery = null; // zuletzt abgegebener Auftrag – kurze Bestätigung

  // ---------- Reiter „Aufträge“ ----------

  function buildQuests(body, { makeButton }) {
    const level = state.shopLevel;
    const next = LEVELS[level + 1] ? level + 1 : null;
    body.append(el('p', 'level-story', LEVELS[level].story));

    // Erfahrungsleiste
    const xpBox = el('div', 'xp-box');
    const xpLabel = el('div', 'xp-label');
    const xpTitle = el('span', null, next ? `Erfahrung für Level ${next}` : 'Erfahrung in diesem Bauabschnitt');
    const xpCount = el('span', 'xp-count');
    xpLabel.append(xpTitle, xpCount);
    const xpBar = el('div', 'xp-bar');
    const xpFill = el('div', 'xp-fill');
    xpBar.append(xpFill);
    xpBox.append(xpLabel, xpBar);
    body.append(xpBox);

    if (lastDelivery) {
      body.append(
        el(
          'div',
          'level-banner',
          lastDelivery.skipped
            ? `🧪 Auftrag als erledigt gewertet (Test): +${numberFormat.format(lastDelivery.xp)} Erfahrung, kein Gold.`
            : `✅ Auftrag erledigt: +${numberFormat.format(lastDelivery.xp)} Erfahrung, +${numberFormat.format(lastDelivery.gold)} Gold.`,
        ),
      );
    }

    // Der aktuelle Auftrag
    const quest = currentQuest(state);
    const rows = [];
    let deliver = null;
    if (quest) {
      const { number, total } = questNumber(state);
      const reward = questReward(quest);
      const card = el('div', 'quest-card');
      const head = el('div', 'quest-head');
      head.append(el('span', 'quest-from', `🧑 ${quest.from}`), el('span', 'quest-number', `Auftrag ${number} von ${total}`));
      card.append(head, el('p', 'quest-text', `„${quest.text}“`));
      const list = el('div', 'goal-list');
      for (const [type, need] of Object.entries(quest.items)) {
        const row = el('div', 'goal-row');
        const mark = el('span', 'goal-mark');
        const count = el('span', 'goal-count');
        row.append(mark, createItemIcon(type, 26), el('span', 'goal-name', itemCount(type, need)), count);
        list.append(row);
        rows.push({ type, row, mark, count });
      }
      const foot = el('div', 'quest-foot');
      foot.append(
        el('span', 'quest-reward', `Belohnung: +${numberFormat.format(reward.xp)} Erfahrung · +${numberFormat.format(reward.gold)} 🪙`),
      );
      deliver = makeButton({
        label: '✓ Abgeben',
        primary: true,
        onClick: () => {
          const result = deliverQuest(state);
          if (result) {
            lastDelivery = result;
            onQuestDone(result);
          }
          refresh();
        },
      });
      deliver.classList.add('quest-deliver');
      foot.append(deliver);
      card.append(list, foot, el('p', 'modal-meta quest-note', 'Die Waren kommen aus dem Laden-Lager. Stehen sie auf einer Theke, räum sie vorher ab.'));
      body.append(card);
      // v0.15.0: Test-Knopf für den Prototyp (Tobias) – Erfahrung ohne Waren
      // und ohne Gold, damit man die Spielmechanik testen kann.
      if (canSkipQuest(state)) {
        const testBox = el('div', 'quest-test');
        const skip = makeButton({
          label: '🧪 Test: Auftrag erledigen',
          onClick: () => {
            const result = skipQuest(state);
            if (result) {
              lastDelivery = result;
              onQuestDone(result);
            }
            refresh();
          },
        });
        skip.classList.add('quest-skip');
        testBox.append(
          skip,
          el('span', 'quest-test-note', `Nur zum Testen: +${numberFormat.format(reward.xp)} Erfahrung, ohne Waren und ohne Gold.`),
        );
        body.append(testBox);
      }
    } else {
      body.append(
        el(
          'p',
          'empty-note',
          next
            ? `✅ Alle Aufträge dieses Bauabschnitts sind erledigt. Jetzt kannst du auf Level ${next} aufsteigen.`
            : '✅ Alle Aufträge dieses Bauabschnitts sind erledigt.',
        ),
      );
    }
    if (!next) {
      body.append(
        el(
          'p',
          'level-reward',
          `Du hast das höchste Level (${MAX_LEVEL}) erreicht. Level ${MAX_LEVEL + 1} kommt mit dem nächsten Techbaum; deine Erfahrung sammelt sich bis dahin.`,
        ),
      );
    }

    // Aufstieg
    let button = null;
    let hint = null;
    if (next) {
      const box = el('div', 'level-reward');
      const gift = costText(LEVELS[next].gift);
      box.append(
        el('div', 'level-next', `Nächstes Level: ${levelTitle(next)}`),
        el('div', null, `Neu: ${unlockText(next)}`),
        gift ? el('div', null, `🎁 Gratis: ${gift}`) : '',
      );
      button = makeButton({
        label: `⬆ Aufsteigen auf Level ${next} · ${numberFormat.format(nextLevelCost(state))} 🪙`,
        primary: true,
        onClick: () => {
          const result = levelUp(state);
          if (result) {
            lastResult = result;
            lastDelivery = null;
            onLevelUp(result);
          }
          refresh();
        },
      });
      button.classList.add('level-up');
      hint = el('p', 'modal-meta level-hint');
      const actions = el('div', 'panel-actions');
      actions.append(button);
      box.append(actions, hint);
      body.append(box);
    }

    return () => {
      const need = xpNeeded(level);
      const have = levelXp(state);
      xpCount.textContent = `${numberFormat.format(Math.min(have, need))} / ${numberFormat.format(need)}`;
      xpFill.style.width = `${Math.min(100, (have / Math.max(1, need)) * 100)}%`;
      const needs = quest ? questNeeds(state, quest) : [];
      for (const r of rows) {
        const n = needs.find((item) => item.type === r.type);
        if (!n) continue;
        r.mark.textContent = n.done ? '✅' : '⬜';
        r.count.textContent = `im Laden-Lager ${n.have} / ${n.need}`;
        r.row.classList.toggle('done', n.done);
      }
      if (deliver) deliver.disabled = !canDeliver(state);
      if (button) {
        const blocker = levelUpBlocker(state);
        button.disabled = blocker !== null;
        hint.textContent =
          blocker === 'xp'
            ? `Noch ${numberFormat.format(need - have)} Erfahrung – gib die Aufträge der Bewohner ab.`
            : blocker === 'gold'
              ? `Genug Erfahrung! Dir fehlen noch ${numberFormat.format(nextLevelCost(state) - state.gold)} Gold für den Aufstieg.`
              : 'Genug Erfahrung und Gold – du kannst aufsteigen.';
      }
    };
  }

  // ---------- Reiter „Ort & Level“ ----------

  function buildTown(body) {
    body.append(
      el(
        'p',
        'modal-meta',
        'Dein Laden liegt in einem kleinen Ort am Fluss, der wächst. Jedes Level ist ein Bauabschnitt: Die Bewohner geben Aufträge, die Erfahrung daraus schaltet das nächste Level frei, und kaufen musst du es mit Gold. Jedes Level bringt neue Gebäude oder mehr Platz im Laden – und zu Beginn einen Rohstoff gratis.',
      ),
    );
    const list = el('div', 'level-list');
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const row = el('div', 'level-row');
      const status = level < state.shopLevel ? '✅' : level === state.shopLevel ? '▶' : '🔒';
      row.classList.toggle('current', level === state.shopLevel);
      row.classList.toggle('future', level > state.shopLevel);
      const text = el('div', 'level-text');
      text.append(el('div', 'level-badge', `${status} ${levelTitle(level)}`), el('div', null, unlockText(level)));
      row.append(text);
      list.append(row);
    }
    list.append(el('div', 'level-row future', `🔒 Level ${MAX_LEVEL + 1} und weiter: kommen mit dem nächsten Techbaum`));
    body.append(list);
    return () => {};
  }

  // ---------- Aufbau ----------

  function sig() {
    return `${tab}|${state.shopLevel}|${state.quest?.index ?? 0}`;
  }

  function renderSection(force = false) {
    const s = sig();
    if (force || !section || section.sig !== s) {
      refs.body.replaceChildren();
      const build = tab === 'quests' ? buildQuests : buildTown;
      section = { sig: s, update: build(refs.body, refs.helpers) };
    }
    section.update();
  }

  function updateHeader() {
    refs.title.textContent = `⚖️ Laden-Level ${state.shopLevel} · ${LEVELS[state.shopLevel].name}`;
    refs.banner.hidden = lastResult?.level !== state.shopLevel;
    if (!refs.banner.hidden) {
      const gift = costText(lastResult.gift);
      refs.banner.textContent = `🎉 Level ${state.shopLevel} erreicht!${gift ? ` Gratis im Laden-Lager: ${gift}.` : ''}`;
    }
    for (const [key, button] of refs.tabs) button.classList.toggle('active', key === tab);
  }

  function showTab(key) {
    tab = key;
    updateHeader();
    renderSection(true);
  }

  function show() {
    section = null;
    panels.showModal((container, helpers) => {
      const box = el('div', 'level-view');
      const banner = el('div', 'level-banner');
      const title = el('h2');
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
      box.append(banner, title, tabsRow, body);
      container.append(box);
      refs = { box, banner, title, tabs, body, helpers };
    });
    open = true;
    updateHeader();
    renderSection(true);
  }

  function refresh() {
    if (!open) return;
    if (!panels.isModalOpen() || !refs?.box?.isConnected) {
      open = false;
      return;
    }
    updateHeader();
    renderSection();
  }

  return {
    open(startTab = 'quests') {
      tab = startTab;
      lastResult = null;
      lastDelivery = null;
      show();
    },
    refresh,
    isOpen: () => open,
  };
}
