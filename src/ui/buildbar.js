// Untere Leisten: Grundleiste (Laden, Bauen), Bauleiste und Werkzeugleiste
// (während man baut).
//
// Bauleiste (seit v0.18.0, Tobias): links immer sichtbar, was man oft braucht
// (Förderband, Lagerhaus, Versandportal, Verschieben, Abreißen), rechts die
// Gebäude des gewählten Reiters (Holz, Stein, Eisen, Kräuter). Die Reiter
// ragen oben aus der Leiste heraus.

import { BELT_COST, BUILDINGS, BUILD_ALWAYS, BUILD_TABS } from '../core/data/buildings.js';
import { buildingLevel, isBuildingUnlocked } from '../core/levels.js';
import { canAfford } from '../core/shop.js';
import { costText } from './format.js';
import { createItemIcon, redrawItemIcons } from './itemArt.js';
import { onPress } from './press.js';

// Kurze Namen für die schmalen Knöpfe links.
const SHORT_NAMES = { versandportal: 'Portal' };

const TOOLS_BEFORE = [{ tool: 'belt', icon: '➡️', name: 'Förderband', cost: BELT_COST, suffix: 'je Feld' }];
const TOOLS_AFTER = [
  // v0.11.0: Bereich markieren und verschieben, drehen oder abreißen
  { tool: 'area', icon: '✥', name: 'Verschieben', meta: 'Bereich markieren' },
  { tool: 'erase', icon: '🧹', name: 'Abreißen', meta: 'Bänder & Gebäude' },
];

const TOOL_MODES = ['place', 'belt', 'erase', 'area', 'areaMove'];

function buildingEntry(type, extra = {}) {
  const def = BUILDINGS[type];
  return { tool: type, building: true, icon: def.icon, name: def.name, cost: def.cost ?? {}, ...extra };
}

// Baukosten als kleine Warenbilder mit Anzahl, z. B. „40 ▣“.
function costNode(cost, suffix) {
  const node = document.createElement('span');
  node.className = 'build-meta build-cost';
  node.title = costText(cost);
  for (const [type, n] of Object.entries(cost)) {
    const part = document.createElement('span');
    part.className = 'cost-part';
    part.append(String(n), createItemIcon(type, 15));
    node.append(part);
  }
  if (suffix) node.append(suffix);
  return node;
}

function entryButton(entry) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'build-item';
  button.dataset.tool = entry.tool;
  if (entry.tab) button.dataset.tab = entry.tab;
  const icon = document.createElement('span');
  icon.className = 'build-icon';
  icon.textContent = entry.icon;
  const name = document.createElement('span');
  name.className = 'build-name';
  name.textContent = entry.shortName ?? entry.name;
  if (entry.shortName) button.title = entry.name;
  let meta;
  if (entry.cost) {
    meta = costNode(entry.cost, entry.suffix);
  } else {
    meta = document.createElement('span');
    meta.className = 'build-meta build-note'; // auf dem Handy ausgeblendet (zu schmal)
    meta.textContent = entry.meta;
  }
  button.append(icon, name, meta);
  entry.metaNode = meta;
  if (entry.building) {
    // Gesperrt (v0.9.0): statt der Kosten steht dort, ab welchem Level es das Gebäude gibt.
    const lock = document.createElement('span');
    lock.className = 'build-meta build-lock';
    lock.textContent = `🔒 Level ${buildingLevel(entry.tool)}`;
    lock.hidden = true;
    button.append(lock);
    entry.lock = lock;
  }
  entry.button = button;
  return button;
}

export function createBuildBar({
  onShop,
  onOpenMenu,
  onCloseMenu,
  onSelectTool,
  onConfirm,
  onRotate,
  onCancel,
  onAreaMove,
  onAreaErase,
  initialTab,
  onTabChange,
}) {
  const stage = document.getElementById('stage');
  const bottomBar = document.getElementById('bottom-bar');
  const buildBar = document.getElementById('build-bar');
  const toolBar = document.getElementById('tool-bar');
  const toolsBox = document.getElementById('build-tools');
  const tabsBox = document.getElementById('build-tabs');
  const items = document.getElementById('build-items');
  const toolText = document.getElementById('tool-text');
  const toolRotate = document.getElementById('tool-rotate');
  const toolCancel = document.getElementById('tool-cancel');
  const toolConfirm = document.getElementById('tool-confirm');
  const toolAreaMove = document.getElementById('tool-area-move');
  const toolAreaErase = document.getElementById('tool-area-erase');

  onPress(document.getElementById('btn-shop'), onShop);
  onPress(document.getElementById('btn-build'), onOpenMenu);
  onPress(document.getElementById('build-close'), onCloseMenu);
  onPress(toolRotate, onRotate);
  onPress(toolCancel, onCancel);
  onPress(toolConfirm, onConfirm);
  onPress(toolAreaMove, onAreaMove);
  onPress(toolAreaErase, onAreaErase);

  // Links: immer sichtbar
  const toolEntries = [
    ...TOOLS_BEFORE,
    ...BUILD_ALWAYS.map((type) => buildingEntry(type, { shortName: SHORT_NAMES[type] })),
    ...TOOLS_AFTER,
  ];
  for (const entry of toolEntries) toolsBox.append(entryButton(entry));

  // Rechts: die Gebäude der Reiter
  const tabEntries = BUILD_TABS.flatMap((tab) => tab.buildings.map((type) => buildingEntry(type, { tab: tab.id })));
  for (const entry of tabEntries) items.append(entryButton(entry));

  const entries = [...toolEntries, ...tabEntries];
  for (const entry of entries) onPress(entry.button, () => onSelectTool(entry.tool));

  // Reiter
  const tabs = BUILD_TABS.map((tab) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'build-tab';
    button.dataset.tab = tab.id;
    button.setAttribute('role', 'tab');
    const name = document.createElement('span');
    name.className = 'build-tab-name';
    name.textContent = tab.name;
    const lock = document.createElement('span');
    lock.className = 'build-tab-lock';
    lock.textContent = '🔒';
    lock.hidden = true;
    button.append(createItemIcon(tab.item, 26), name, lock);
    onPress(button, () => showTab(tab.id));
    tabsBox.append(button);
    return { ...tab, button, lock };
  });

  let activeTab = BUILD_TABS.some((t) => t.id === initialTab) ? initialTab : BUILD_TABS[0].id;
  function showTab(id) {
    if (!BUILD_TABS.some((t) => t.id === id)) return;
    const changedTab = id !== activeTab;
    activeTab = id;
    for (const tab of tabs) {
      const on = tab.id === id;
      tab.button.classList.toggle('active', on);
      tab.button.setAttribute('aria-selected', String(on));
    }
    for (const entry of tabEntries) entry.button.hidden = entry.tab !== id;
    items.scrollLeft = 0;
    if (changedTab) onTabChange?.(id);
  }
  showTab(activeTab);

  // Reihenfolge im Reiter: freigeschaltete Gebäude, dann die gesperrten nach
  // Level. Umgestellt wird nur, wenn sich etwas ändert.
  let order = '';
  function arrange(state) {
    const locked = (e) => !isBuildingUnlocked(state, e.tool);
    const sorted = [
      ...tabEntries.filter((e) => !locked(e)),
      ...tabEntries.filter(locked).sort((a, b) => buildingLevel(a.tool) - buildingLevel(b.tool)),
    ];
    const next = sorted.map((e) => e.tool).join(',');
    if (next === order) return;
    order = next;
    items.append(...sorted.map((e) => e.button));
  }

  // Wie hoch die Leisten von unten über die Karte ragen (Bildschirmpixel).
  // Die Bauleiste samt Reitern ist die höchste; um so viel lässt sich die
  // Karte nach oben schieben (v0.18.0), damit nichts dauerhaft verdeckt ist.
  function coverOf(el) {
    const bottom = stage.getBoundingClientRect().bottom;
    let top = el.getBoundingClientRect().top;
    if (el === buildBar) top = Math.min(top, tabsBox.getBoundingClientRect().top);
    return Math.max(0, Math.round(bottom - top));
  }
  let buildCover = 0;
  function measure() {
    const wasHidden = buildBar.hidden;
    if (wasHidden) {
      buildBar.style.visibility = 'hidden';
      buildBar.hidden = false;
    }
    buildCover = coverOf(buildBar);
    if (wasHidden) {
      buildBar.hidden = true;
      buildBar.style.visibility = '';
    }
  }
  measure();

  let currentMode = 'normal';
  // Meldungen erscheinen über der gerade sichtbaren Leiste (CSS-Variable).
  function placeOverlays() {
    let cover = coverOf(bottomBar);
    if (currentMode === 'menu') cover = buildCover;
    else if (TOOL_MODES.includes(currentMode)) cover = coverOf(toolBar);
    stage.style.setProperty('--bottom-ui', `${cover}px`);
  }

  return {
    // mode: normal | menu | place | belt | erase | area | areaMove
    setMode(mode, { text = '', confirmLabel = '✓ Fertig' } = {}) {
      currentMode = mode;
      stage.dataset.mode = mode;
      bottomBar.hidden = mode !== 'normal';
      // v0.10.2: Warenbilder bei jedem Öffnen neu zeichnen – der Browser darf
      // sie wegwerfen, wenn die App im Hintergrund war.
      if (mode === 'menu' && buildBar.hidden) redrawItemIcons(buildBar);
      buildBar.hidden = mode !== 'menu';
      if (mode === 'menu') buildCover = coverOf(buildBar);
      toolBar.hidden = !TOOL_MODES.includes(mode);
      toolText.textContent = text;
      const moving = mode === 'place' || mode === 'areaMove';
      toolRotate.hidden = !moving;
      toolCancel.hidden = !moving;
      toolAreaMove.hidden = mode !== 'area';
      toolAreaErase.hidden = mode !== 'area';
      toolConfirm.textContent = confirmLabel;
      toolConfirm.disabled = false;
      placeOverlays();
    },
    setConfirmEnabled(enabled) {
      toolConfirm.disabled = !enabled;
    },
    setText(text) {
      toolText.textContent = text;
    },
    // Bereich (v0.11.0): Verschieben und Abreißen erst, wenn etwas markiert ist.
    setAreaEnabled(enabled) {
      toolAreaMove.disabled = !enabled;
      toolAreaErase.disabled = !enabled;
    },
    // Neu messen, wenn sich die Bildschirmgröße ändert.
    resize() {
      measure();
      placeOverlays();
    },
    // Platz, den die Karte unten zusätzlich bekommt (Bildschirmpixel), mit
    // etwas Luft, damit der Rand des Grundstücks nicht an den Reitern klebt.
    bottomCover() {
      return buildCover + 8;
    },
    activeTab() {
      return activeTab;
    },
    showTab,
    // Graut Gebäude aus, für die die Waren im Laden-Lager nicht reichen, und
    // zeigt gesperrte Gebäude mit Schloss. Beide bleiben antippbar und sagen
    // dann, was fehlt. Ein Reiter, in dem noch alles gesperrt ist, bekommt
    // ebenfalls ein Schloss.
    updateCosts(state) {
      arrange(state);
      for (const entry of entries) {
        const locked = Boolean(entry.building) && !isBuildingUnlocked(state, entry.tool);
        entry.button.classList.toggle('locked', locked);
        if (entry.lock) entry.lock.hidden = !locked;
        entry.metaNode.hidden = locked;
        if (entry.cost) entry.button.classList.toggle('short', !locked && !canAfford(state, entry.cost));
      }
      for (const tab of tabs) {
        const allLocked = tab.buildings.every((type) => !isBuildingUnlocked(state, type));
        tab.button.classList.toggle('locked', allLocked);
        tab.lock.hidden = !allLocked;
      }
    },
  };
}
