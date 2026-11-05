// Steuerung: entscheidet je nach Modus, was Antippen und Ziehen bewirken,
// und ruft dafür die Spielregeln aus src/core auf.
//
// Modi:
//   normal – Karte ansehen, Gebäude und Bänder antippen
//   menu   – Bauleiste ist offen
//   place  – Gebäude platzieren oder verschieben (Vorschau)
//   belt   – Förderbänder ziehen
//   erase  – Abreißen

import { BUILDINGS } from '../core/data/buildings.js';
import { DIR_NAMES } from '../core/dirs.js';
import { footprintSize } from '../core/geometry.js';
import {
  canPlaceBuilding,
  findFreeSpot,
  moveBuilding,
  placeBuilding,
  removeBuilding,
  rotateBuilding,
} from '../core/buildings.js';
import {
  applyBeltPath,
  buildBeltPath,
  extendTrace,
  interpolateTiles,
  removeBelt,
  rotateBelt,
} from '../core/belts.js';
import { beltAt, buildingAt, findBuilding, isInWorld, isOwned } from '../core/state.js';
import { TILE, panBy, screenToWorld } from './camera.js';

const TEXT = {
  place: (name) => `${name}: Vorschau mit dem Finger an die gewünschte Stelle schieben.`,
  move: (name) => `${name} verschieben: Vorschau an die neue Stelle schieben.`,
  belt: 'Förderband: mit einem Finger ziehen. Von einem Band aus ziehen teilt es auf, auf ein Band ziehen führt zusammen. Antippen dreht.',
  erase: 'Abreißen: über Förderbänder wischen oder ein Gebäude antippen.',
};

export function createController({ state, camera, ui, panels, buildBar, onChange, requestDraw, worldBounds }) {
  let mode = 'normal';
  let drag = null;

  const changed = () => onChange();

  function tileAtScreen(sx, sy) {
    const w = screenToWorld(camera, sx, sy);
    return { x: Math.floor(w.x / TILE), y: Math.floor(w.y / TILE) };
  }

  function setMode(next, options) {
    mode = next;
    ui.mode = next;
    buildBar.setMode(next, options);
    requestDraw();
  }

  // ---------- Auswahl & Infofenster ----------

  function select(selection) {
    ui.selected = selection;
    if (selection) showSelectionInfo();
    else panels.hideInfo();
    requestDraw();
  }

  function showSelectionInfo() {
    const sel = ui.selected;
    if (!sel) return;
    if (sel.kind === 'building') {
      const b = findBuilding(state, sel.id);
      if (!b) return select(null);
      const def = BUILDINGS[b.type];
      const size = footprintSize(b.type, b.rot);
      panels.showInfo({
        icon: def.icon,
        title: def.name,
        meta: `${size.width} × ${size.height} Felder`,
        text: def.description,
        soon: def.soon,
        actions: [
          { label: '↔ Verschieben', onClick: () => startPlace(b.type, b) },
          {
            label: '↻ Drehen',
            onClick: () => {
              if (rotateBuilding(state, b.id)) {
                changed();
                showSelectionInfo();
              } else {
                panels.toast('Zum Drehen fehlt hier der Platz.');
              }
            },
          },
          { label: '🗑 Abreißen', danger: true, onClick: () => askRemoveBuilding(b) },
        ],
      });
    } else if (sel.kind === 'belt') {
      const belt = beltAt(state, sel.x, sel.y);
      if (!belt) return select(null);
      const meta =
        belt.outs.length === 1
          ? `Läuft nach ${DIR_NAMES[belt.outs[0]]}`
          : `Teilt auf nach ${belt.outs.map((d) => DIR_NAMES[d]).join(', ')}`;
      panels.showInfo({
        icon: '➡️',
        title: 'Förderband',
        meta,
        text: 'Transportiert Waren Feld für Feld in Pfeilrichtung. Zeigt ein Band in mehrere Richtungen, verteilt es die Waren abwechselnd.',
        soon: 'Ab v0.5.0 laufen hier Waren.',
        actions: [
          {
            label: '↻ Drehen',
            onClick: () => {
              rotateBelt(state, sel.x, sel.y);
              changed();
              showSelectionInfo();
            },
          },
          {
            label: '🗑 Abreißen',
            danger: true,
            onClick: () => {
              removeBelt(state, sel.x, sel.y);
              changed();
              select(null);
            },
          },
        ],
      });
    }
  }

  async function askRemoveBuilding(b) {
    const def = BUILDINGS[b.type];
    const ok = await panels.confirm({
      title: `${def.name} abreißen?`,
      text: 'Das Gebäude verschwindet. Du kannst es jederzeit über „Bauen“ neu errichten.',
      okLabel: 'Abreißen',
      danger: true,
    });
    if (!ok || !findBuilding(state, b.id)) return;
    removeBuilding(state, b.id);
    if (ui.selected?.kind === 'building' && ui.selected.id === b.id) select(null);
    changed();
    panels.toast(`${def.name} abgerissen.`);
  }

  function tapNormal(tile) {
    if (!isInWorld(state, tile.x, tile.y)) return select(null);
    const building = buildingAt(state, tile.x, tile.y);
    if (building) return select({ kind: 'building', id: building.id });
    if (beltAt(state, tile.x, tile.y)) return select({ kind: 'belt', x: tile.x, y: tile.y });
    select(null);
    if (!isOwned(state, tile.x, tile.y)) {
      panels.showInfo({
        icon: '🔒',
        title: 'Gesperrte Fläche',
        text: 'Diese Fläche gehört noch nicht zu deinem Laden. Später kannst du sie mit Gold kaufen und deine Fabrik vergrößern.',
      });
    }
  }

  // ---------- Bauleiste ----------

  function openMenu() {
    select(null);
    setMode('menu');
  }

  function closeMenu() {
    setMode('normal');
  }

  function selectTool(tool) {
    if (tool === 'belt') return setMode('belt', { text: TEXT.belt });
    if (tool === 'erase') return setMode('erase', { text: TEXT.erase });
    if (BUILDINGS[tool]) startPlace(tool, null);
  }

  // ---------- Gebäude platzieren / verschieben ----------

  function startPlace(type, existing) {
    panels.hideInfo();
    ui.selected = null;
    const rot = existing ? existing.rot : 0;
    let pos = existing ? { x: existing.x, y: existing.y } : null;
    if (!pos) {
      const center = tileAtScreen(camera.viewWidth / 2, camera.viewHeight / 2);
      pos = findFreeSpot(state, type, rot, center.x, center.y) ?? center;
    }
    ui.ghost = { type, x: pos.x, y: pos.y, rot, movingId: existing ? existing.id : null, valid: false };
    const name = BUILDINGS[type].name;
    setMode('place', {
      text: existing ? TEXT.move(name) : TEXT.place(name),
      confirmLabel: existing ? '✓ Hierhin' : '✓ Bauen',
    });
    validateGhost();
  }

  function validateGhost() {
    const g = ui.ghost;
    if (!g) return;
    g.valid = canPlaceBuilding(state, g.type, g.x, g.y, g.rot, g.movingId);
    buildBar.setConfirmEnabled(g.valid);
    requestDraw();
  }

  function ghostContains(tile) {
    const g = ui.ghost;
    if (!g) return false;
    const { width, height } = footprintSize(g.type, g.rot);
    return tile.x >= g.x && tile.x < g.x + width && tile.y >= g.y && tile.y < g.y + height;
  }

  function moveGhostCenterTo(tile) {
    const g = ui.ghost;
    const { width, height } = footprintSize(g.type, g.rot);
    g.x = tile.x - Math.floor((width - 1) / 2);
    g.y = tile.y - Math.floor((height - 1) / 2);
    validateGhost();
  }

  function confirmPlace() {
    const g = ui.ghost;
    if (!g || !g.valid) return;
    const name = BUILDINGS[g.type].name;
    if (g.movingId) {
      const id = g.movingId;
      moveBuilding(state, id, g.x, g.y, g.rot);
      ui.ghost = null;
      changed();
      setMode('normal');
      select({ kind: 'building', id });
    } else {
      placeBuilding(state, g.type, g.x, g.y, g.rot);
      ui.ghost = null;
      changed();
      setMode('menu');
      panels.toast(`${name} gebaut.`);
    }
  }

  function cancelPlace() {
    const movingId = ui.ghost?.movingId ?? null;
    ui.ghost = null;
    if (movingId) {
      setMode('normal');
      select({ kind: 'building', id: movingId });
    } else {
      setMode('menu');
    }
  }

  function rotateGhost() {
    const g = ui.ghost;
    if (!g) return;
    g.rot = (g.rot + 1) % 4;
    validateGhost();
  }

  // ---------- Abreißen ----------

  function eraseBeltAt(tile) {
    if (removeBelt(state, tile.x, tile.y)) changed();
  }

  // ---------- Laden ----------

  function openShop(hud) {
    select(null);
    hud?.closeMenu();
    const beltCount = Object.keys(state.belts).length;
    panels.showModal((box, { el }) => {
      box.append(
        el('h2', null, '⚖️ Dein Laden'),
        el('p', 'modal-meta', `Level ${state.shopLevel} · Fläche ${state.plot.width} × ${state.plot.height} Felder`),
        el(
          'p',
          null,
          'Dein ganzes Grundstück ist dein Laden. Alles, was deine Gebäude herstellen, landet in deinem Inventar und kann hier zum Verkauf angeboten werden.',
        ),
      );
      const stats = el('div', 'shop-stats');
      stats.append(
        el('div', 'stat', `🏗️ Gebäude: ${state.buildings.length}`),
        el('div', 'stat', `➡️ Förderbänder: ${beltCount}`),
        el('div', 'stat', `🪙 Gold: ${state.gold}`),
      );
      box.append(stats, el('h3', null, 'Inventar'));
      box.append(
        el(
          'p',
          'empty-note',
          'Noch keine Waren. Ab v0.5.0 stellen deine Gebäude Waren her, ab v0.6.0 kannst du sie hier verkaufen.',
        ),
      );
    });
  }

  // ---------- Eingabe ----------

  return {
    openMenu,
    closeMenu,
    selectTool,
    openShop,

    confirmTool() {
      if (mode === 'place') confirmPlace();
      else if (mode === 'belt' || mode === 'erase') setMode('menu');
    },
    rotateTool() {
      if (mode === 'place') rotateGhost();
    },
    cancelTool() {
      if (mode === 'place') cancelPlace();
      else if (mode === 'belt' || mode === 'erase') setMode('menu');
    },
    closeInfo() {
      select(null);
    },

    back() {
      if (panels.isModalOpen()) return panels.closeTopmost();
      if (mode === 'place') return cancelPlace();
      if (mode === 'belt' || mode === 'erase') return setMode('menu');
      if (mode === 'menu') return closeMenu();
      select(null);
    },

    onTap(sx, sy) {
      const tile = tileAtScreen(sx, sy);
      if (mode === 'normal' || mode === 'menu') {
        tapNormal(tile);
      } else if (mode === 'place') {
        if (isOwned(state, tile.x, tile.y)) moveGhostCenterTo(tile);
      } else if (mode === 'belt') {
        if (rotateBelt(state, tile.x, tile.y)) {
          changed();
          panels.toast('Förderband gedreht.', 1200);
        }
      } else if (mode === 'erase') {
        if (beltAt(state, tile.x, tile.y)) eraseBeltAt(tile);
        else {
          const b = buildingAt(state, tile.x, tile.y);
          if (b) askRemoveBuilding(b);
        }
      }
    },

    onDragStart(sx, sy) {
      const tile = tileAtScreen(sx, sy);
      if (mode === 'belt') {
        drag = { kind: 'belt', trace: [tile] };
        ui.beltPreview = buildBeltPath(state, drag.trace);
      } else if (mode === 'erase') {
        drag = { kind: 'erase', last: tile };
        eraseBeltAt(tile);
      } else if (mode === 'place' && ghostContains(tile)) {
        drag = { kind: 'ghost', offsetX: tile.x - ui.ghost.x, offsetY: tile.y - ui.ghost.y };
      } else {
        drag = { kind: 'pan' };
      }
      requestDraw();
    },

    onDragMove(sx, sy, dx, dy) {
      if (!drag) return;
      if (drag.kind === 'pan') {
        panBy(camera, dx, dy, worldBounds());
        requestDraw();
        return;
      }
      const tile = tileAtScreen(sx, sy);
      if (drag.kind === 'belt') {
        drag.trace = extendTrace(drag.trace, tile);
        ui.beltPreview = buildBeltPath(state, drag.trace);
      } else if (drag.kind === 'erase') {
        for (const t of interpolateTiles(drag.last, tile)) eraseBeltAt(t);
        drag.last = tile;
      } else if (drag.kind === 'ghost') {
        const g = ui.ghost;
        const x = tile.x - drag.offsetX;
        const y = tile.y - drag.offsetY;
        if (x !== g.x || y !== g.y) {
          g.x = x;
          g.y = y;
          validateGhost();
        }
      }
      requestDraw();
    },

    onDragEnd() {
      if (drag?.kind === 'belt' && ui.beltPreview) {
        const path = ui.beltPreview;
        if (path.tiles.length > 1 || path.endDir) {
          applyBeltPath(state, path);
          changed();
        }
        ui.beltPreview = null;
      }
      drag = null;
      requestDraw();
    },

    onDragCancel() {
      ui.beltPreview = null;
      drag = null;
      requestDraw();
    },
  };
}
