// Untere Leisten: Grundleiste (Laden, Bauen), Bauleiste (Gebäude, Förderband,
// Abreißen) und Werkzeugleiste (während man baut).

import { BELT_COST, BUILDINGS, BUILD_MENU } from '../core/data/buildings.js';
import { buildingLevel, isBuildingUnlocked } from '../core/levels.js';
import { canAfford } from '../core/shop.js';
import { costText } from './format.js';
import { createItemIcon } from './itemArt.js';
import { onPress } from './press.js';

const EXTRA_TOOLS = [
  { tool: 'belt', icon: '➡️', name: 'Förderband', cost: BELT_COST, suffix: 'je Feld' },
  { tool: 'erase', icon: '🧹', name: 'Abreißen', meta: 'Bänder & Gebäude' },
];

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

export function createBuildBar({ onShop, onOpenMenu, onCloseMenu, onSelectTool, onConfirm, onRotate, onCancel }) {
  const bottomBar = document.getElementById('bottom-bar');
  const buildBar = document.getElementById('build-bar');
  const toolBar = document.getElementById('tool-bar');
  const items = document.getElementById('build-items');
  const toolText = document.getElementById('tool-text');
  const toolRotate = document.getElementById('tool-rotate');
  const toolCancel = document.getElementById('tool-cancel');
  const toolConfirm = document.getElementById('tool-confirm');

  onPress(document.getElementById('btn-shop'), onShop);
  onPress(document.getElementById('btn-build'), onOpenMenu);
  onPress(document.getElementById('build-close'), onCloseMenu);
  onPress(toolRotate, onRotate);
  onPress(toolCancel, onCancel);
  onPress(toolConfirm, onConfirm);

  const entries = [
    ...BUILD_MENU.map((type) => {
      const def = BUILDINGS[type];
      return { tool: type, building: true, icon: def.icon, name: def.name, cost: def.cost ?? {} };
    }),
    ...EXTRA_TOOLS,
  ];
  for (const entry of entries) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'build-item';
    button.dataset.tool = entry.tool;
    const icon = document.createElement('span');
    icon.className = 'build-icon';
    icon.textContent = entry.icon;
    const name = document.createElement('span');
    name.className = 'build-name';
    name.textContent = entry.name;
    let meta;
    if (entry.cost) {
      meta = costNode(entry.cost, entry.suffix);
    } else {
      meta = document.createElement('span');
      meta.className = 'build-meta';
      meta.textContent = entry.meta;
    }
    button.append(icon, name, meta);
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
    entry.meta = meta;
    onPress(button, () => onSelectTool(entry.tool));
    items.append(button);
  }

  // Reihenfolge: freigeschaltete Gebäude, Förderband und Abreißen, dann die
  // gesperrten Gebäude nach Level. Umgestellt wird nur, wenn sich etwas ändert.
  let order = '';
  function arrange(state) {
    const locked = (e) => e.building && !isBuildingUnlocked(state, e.tool);
    const sorted = [
      ...entries.filter((e) => e.building && !locked(e)),
      ...entries.filter((e) => !e.building),
      ...entries.filter(locked).sort((a, b) => buildingLevel(a.tool) - buildingLevel(b.tool)),
    ];
    const next = sorted.map((e) => e.tool).join(',');
    if (next === order) return;
    order = next;
    items.append(...sorted.map((e) => e.button));
  }

  return {
    // mode: normal | menu | place | belt | erase
    setMode(mode, { text = '', confirmLabel = '✓ Fertig' } = {}) {
      bottomBar.hidden = mode !== 'normal';
      buildBar.hidden = mode !== 'menu';
      const toolMode = mode === 'place' || mode === 'belt' || mode === 'erase';
      toolBar.hidden = !toolMode;
      toolText.textContent = text;
      toolRotate.hidden = mode !== 'place';
      toolCancel.hidden = mode !== 'place';
      toolConfirm.textContent = confirmLabel;
      toolConfirm.disabled = false;
    },
    setConfirmEnabled(enabled) {
      toolConfirm.disabled = !enabled;
    },
    // Graut Gebäude aus, für die die Waren im Laden-Lager nicht reichen, und
    // zeigt gesperrte Gebäude mit Schloss. Beide bleiben antippbar und sagen
    // dann, was fehlt.
    updateCosts(state) {
      arrange(state);
      for (const entry of entries) {
        const locked = Boolean(entry.building) && !isBuildingUnlocked(state, entry.tool);
        entry.button.classList.toggle('locked', locked);
        if (entry.lock) entry.lock.hidden = !locked;
        entry.meta.hidden = locked;
        if (entry.cost) entry.button.classList.toggle('short', !locked && !canAfford(state, entry.cost));
      }
    },
  };
}
