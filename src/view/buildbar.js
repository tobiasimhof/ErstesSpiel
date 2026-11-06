// Untere Leisten: Grundleiste (Laden, Bauen), Bauleiste (Gebäude, Förderband,
// Abreißen) und Werkzeugleiste (während man baut).

import { BELT_COST, BUILDINGS, BUILD_MENU } from '../core/data/buildings.js';
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
      return { tool: type, icon: def.icon, name: def.name, cost: def.cost ?? {} };
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
    onPress(button, () => onSelectTool(entry.tool));
    items.append(button);
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
    // Graut Gebäude aus, für die die Waren im Laden-Lager nicht reichen.
    // Sie bleiben antippbar und sagen dann, was fehlt.
    updateCosts(state) {
      for (const entry of entries) {
        if (!entry.cost) continue;
        const button = items.querySelector(`[data-tool="${entry.tool}"]`);
        button?.classList.toggle('short', !canAfford(state, entry.cost));
      }
    },
  };
}
