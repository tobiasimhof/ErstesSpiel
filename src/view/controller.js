// Steuerung: entscheidet je nach Modus, was Antippen und Ziehen bewirken,
// und ruft dafür die Spielregeln aus src/core auf.
//
// Modi:
//   normal – Karte ansehen, Gebäude und Bänder antippen
//   menu   – Bauleiste ist offen
//   place  – Gebäude platzieren oder verschieben (Vorschau)
//   belt   – Förderbänder ziehen
//   erase  – Abreißen

import { BELT_COST, BUILDINGS } from '../core/data/buildings.js';
import { ITEMS } from '../core/data/items.js';
import { RECIPES } from '../core/data/recipes.js';
import { DIR_NAMES } from '../core/dirs.js';
import { footprintSize } from '../core/geometry.js';
import {
  buyBuilding,
  canPlaceBuilding,
  findFreeSpot,
  moveBuilding,
  removeBuilding,
  rotateBuilding,
} from '../core/buildings.js';
import {
  buildBeltPath,
  buyBeltPath,
  extendTrace,
  interpolateTiles,
  limitBeltPath,
  removeBelt,
  rotateBelt,
} from '../core/belts.js';
import { buyLand, landOffer, landSideAt } from '../core/land.js';
import { buildingLevel, isBuildingUnlocked, isItemUnlocked, itemLevel } from '../core/levels.js';
import { buyRaw } from '../core/market.js';
import { buildingStatus, loadInput, losesWorkOnRemove, productionOf, setRecipe } from '../core/production.js';
import { affordableCount, canAfford, missingFor, storageCapacity, storageCount, storageTotal } from '../core/shop.js';
import { beltAt, buildingAt, findBuilding, isInWorld, isOwned } from '../core/state.js';
import { TILE, panBy, screenToWorld } from './camera.js';
import { costText, numberFormat } from './format.js';

const TEXT = {
  place: (name, cost) => `${name} (kostet ${cost}): Vorschau mit dem Finger an die gewünschte Stelle schieben.`,
  move: (name) => `${name} verschieben: Vorschau an die neue Stelle schieben.`,
  belt: `Förderband (${costText(BELT_COST)} je Feld): mit einem Finger ziehen. Von einem Band aus ziehen teilt es auf, auf ein Band ziehen führt zusammen. Antippen dreht.`,
  erase: 'Abreißen: über Förderbänder wischen oder ein Gebäude antippen.',
};

// Fläche kaufen (v0.9.0): Seiten und Streifen in Worten
const SIDE_TEXT = { N: 'oben', E: 'rechts', S: 'unten', W: 'links' };
function stripText(offer) {
  const across = offer.side === 'E' || offer.side === 'W';
  const unit = across ? (offer.depth === 1 ? 'Spalte' : 'Spalten') : offer.depth === 1 ? 'Reihe' : 'Reihen';
  return `${offer.depth} ${unit} ${SIDE_TEXT[offer.side]}`;
}

export function createController({ state, camera, ui, panels, buildBar, shopView, onChange, requestDraw, worldBounds }) {
  let mode = 'normal';
  let drag = null;
  let info = null; // { buttons, setStatus } des offenen Infofensters
  let infoRefresh = null; // aktualisiert das offene Infofenster

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
    infoRefresh = null;
    if (selection) showSelectionInfo();
    else panels.hideInfo();
    requestDraw();
  }

  const DOT = { work: '🟢', idle: '🟡', blocked: '🔴' };

  function formatDuration(seconds) {
    const s = Math.max(0, Math.round(seconds));
    if (s < 60) return `${s} s`;
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')} min`;
  }

  // Aktualisiert Statuszeilen und Knöpfe eines Gebäude-Infofensters.
  function updateBuildingInfo(id) {
    const b = findBuilding(state, id);
    if (!b) return select(null);
    const p = productionOf(b.type);
    const prod = b.prod;
    const status = buildingStatus(state, b);
    const lines = [`${DOT[status.level]} ${status.text}`];
    if (p?.kind === 'source') {
      const input = ITEMS[p.input];
      const output = ITEMS[p.output];
      lines.push(`1 ${input.name} → ${p.amount} ${output.plural} in ${formatDuration(p.duration)}`);
      if (prod.loaded) lines.push(`Fertig in etwa ${formatDuration(prod.remaining * (p.duration / p.amount))}`);
      lines.push(`${input.plural} im Laden-Lager: ${storageCount(state, p.input)}`);
      const button = info.buttons.get('load');
      button.textContent = prod.loaded ? `${input.name} wird verarbeitet` : `➕ ${input.name} einlegen`;
      button.disabled = prod.loaded || storageCount(state, p.input) < 1;
      info.buttons.get('buy').disabled = state.gold < input.buyPrice || !isItemUnlocked(state, p.input);
    } else if (p?.kind === 'workshop') {
      const recipe = RECIPES[prod.recipe];
      const [inType, need] = Object.entries(recipe.inputs)[0];
      const outName = recipe.amount === 1 ? ITEMS[recipe.output].name : ITEMS[recipe.output].plural;
      lines.push(`Rezept: ${need} ${ITEMS[inType].plural} → ${recipe.amount} ${outName} (${recipe.time} s)`);
      lines.push(`Am Eingang: ${prod.stock[inType] ?? 0} / ${need * 2} ${ITEMS[inType].plural}`);
      for (const key of p.recipes) info.buttons.get(`recipe:${key}`)?.classList.toggle('primary', key === prod.recipe);
    } else if (p?.kind === 'storage') {
      for (let i = 0; i < p.slots; i++) {
        const slot = prod.slots[i];
        lines.push(slot ? `Fach ${i + 1}: ${ITEMS[slot.type].name} ${slot.count} / ${p.slotSize}` : `Fach ${i + 1}: leer`);
      }
    } else if (p?.kind === 'shipping') {
      lines.push(`Bisher versendet: ${numberFormat.format(prod.shipped)} Waren`);
      lines.push(`Laden-Lager: ${storageTotal(state)} / ${storageCapacity(state)}`);
    }
    info.setStatus(lines);
  }

  function updateBeltInfo(x, y) {
    const belt = beltAt(state, x, y);
    if (!belt) return select(null);
    info.setStatus([belt.item ? `Transportiert: ${ITEMS[belt.item.type].name}` : 'Gerade leer']);
  }

  function showSelectionInfo() {
    const sel = ui.selected;
    if (!sel) return;
    if (sel.kind === 'building') {
      const b = findBuilding(state, sel.id);
      if (!b) return select(null);
      const def = BUILDINGS[b.type];
      const p = productionOf(b.type);
      const size = footprintSize(b.type, b.rot);
      const actions = [];
      if (p?.kind === 'source') {
        actions.push({
          key: 'load',
          label: '',
          primary: true,
          onClick: () => {
            if (loadInput(state, b)) {
              changed();
              panels.toast(`${ITEMS[p.input].name} eingelegt.`);
            } else {
              panels.toast(`Kein ${ITEMS[p.input].name} im Laden-Lager.`);
            }
            infoRefresh?.();
          },
        });
        actions.push({
          key: 'buy',
          label: `🧺 ${ITEMS[p.input].name} kaufen · ${numberFormat.format(ITEMS[p.input].buyPrice)} 🪙`,
          onClick: () => {
            const result = buyRaw(state, p.input);
            if (result === 'ok') {
              changed();
              panels.toast(`${ITEMS[p.input].name} gekauft. Jetzt einlegen.`);
            } else if (result === 'gold') panels.toast('Dafür reicht dein Gold nicht.');
            else if (result === 'full') panels.toast('Dein Laden-Lager ist voll.');
            else if (result === 'locked') panels.toast(`${ITEMS[p.input].name} gibt es erst ab Level ${itemLevel(p.input)}.`);
            infoRefresh?.();
          },
        });
      }
      if (p?.kind === 'workshop') {
        for (const key of p.recipes) {
          actions.push({
            key: `recipe:${key}`,
            label: RECIPES[key].label,
            onClick: () => {
              setRecipe(b, key);
              changed();
              infoRefresh?.();
            },
          });
        }
      }
      actions.push(
        { label: '↔ Verschieben', group: actions.length > 0, onClick: () => startPlace(b.type, b) },
        {
          label: '↻ Drehen',
          onClick: () => {
            if (rotateBuilding(state, b.id)) {
              changed();
              infoRefresh?.();
            } else {
              panels.toast('Zum Drehen fehlt hier der Platz.');
            }
          },
        },
        { label: '🗑 Abreißen', danger: true, onClick: () => askRemoveBuilding(b) },
      );
      info = panels.showInfo({
        icon: def.icon,
        title: def.name,
        meta: `${size.width} × ${size.height} Felder`,
        text: def.description,
        actions,
      });
      infoRefresh = () => updateBuildingInfo(b.id);
      infoRefresh();
    } else if (sel.kind === 'belt') {
      const belt = beltAt(state, sel.x, sel.y);
      if (!belt) return select(null);
      const meta =
        belt.outs.length === 1
          ? `Läuft nach ${DIR_NAMES[belt.outs[0]]}`
          : `Teilt auf nach ${belt.outs.map((d) => DIR_NAMES[d]).join(', ')}`;
      info = panels.showInfo({
        icon: '➡️',
        title: 'Förderband',
        meta,
        text: 'Transportiert Waren Feld für Feld in Pfeilrichtung. Zeigt ein Band in mehrere Richtungen, verteilt es die Waren abwechselnd. Ist ein Band voll, staut sich alles davor.',
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
      infoRefresh = () => updateBeltInfo(sel.x, sel.y);
      infoRefresh();
    } else if (sel.kind === 'land') {
      showLandInfo(sel.side);
    }
  }

  // ---------- Fläche kaufen (v0.9.0) ----------

  function showLandInfo(side) {
    const offer = landOffer(state, side);
    if (!offer) return select(null);
    const price = numberFormat.format(offer.price);
    info = panels.showInfo({
      icon: '🗺️',
      title: 'Fläche kaufen',
      meta: `${stripText(offer)} · ${offer.fields} Felder`,
      text: 'Vergrößert dein Grundstück an dieser Seite. Gebäude und Bänder bleiben, wo sie sind. Jeder Kauf macht weitere Fläche teurer.',
      actions: [
        {
          key: 'buy',
          label: `Kaufen · ${price} 🪙`,
          primary: true,
          onClick: () => {
            const result = buyLand(state, side);
            if (result === 'ok') {
              select(null);
              changed();
              panels.toast(`Fläche gekauft: ${offer.fields} neue Felder ${SIDE_TEXT[side]}.`);
            } else if (result === 'gold') panels.toast('Dafür reicht dein Gold nicht.');
            else select(null);
          },
        },
      ],
    });
    infoRefresh = () => {
      const lack = offer.price - state.gold;
      info.buttons.get('buy').disabled = lack > 0;
      info.setStatus([
        `Preis: ${price} Gold (${numberFormat.format(Math.round(offer.price / offer.fields))} Gold je Feld)`,
        lack > 0 ? `Dir fehlen noch ${numberFormat.format(lack)} Gold.` : `Dein Gold: ${numberFormat.format(state.gold)}`,
      ]);
    };
    infoRefresh();
  }

  async function askRemoveBuilding(b) {
    const def = BUILDINGS[b.type];
    const refund = b.paid
      ? `Die Baukosten kommen zurück ins Laden-Lager: ${costText(b.paid)}.`
      : 'Es hat beim Bauen nichts gekostet, deshalb gibt es keine Baukosten zurück.';
    const ok = await panels.confirm({
      title: `${def.name} abreißen?`,
      text: losesWorkOnRemove(b)
        ? `Der angefangene Rohstoff geht dabei verloren. Waren im Gebäude kommen ins Laden-Lager. ${refund}`
        : `Waren im Gebäude kommen ins Laden-Lager. ${refund}`,
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
    if (isOwned(state, tile.x, tile.y)) return select(null);
    const side = landSideAt(state, tile.x, tile.y);
    if (side) return select({ kind: 'land', side });
    select(null);
    panels.showInfo({
      icon: '🔒',
      title: 'Gesperrte Fläche',
      text: 'Diese Ecke gehört noch nicht zu deinem Laden. Kaufe Fläche an den Seiten deines Grundstücks – die Ecken kommen dabei nach und nach mit dazu.',
    });
  }

  // ---------- Bauleiste ----------

  function openMenu() {
    select(null);
    buildBar.updateCosts(state);
    setMode('menu');
  }

  function closeMenu() {
    setMode('normal');
  }

  function toastLocked(type) {
    panels.toast(
      `${BUILDINGS[type].name}: gibt es ab Level ${buildingLevel(type)}. Oben auf „Laden-Level“ tippen zeigt, was dafür fehlt.`,
      3500,
    );
  }

  function toastMissing(cost) {
    panels.toast(`Dir fehlen im Laden-Lager: ${costText(missingFor(state, cost))}.`, 3000);
  }

  function selectTool(tool) {
    if (tool === 'belt') {
      if (affordableCount(state, BELT_COST) < 1) toastMissing(BELT_COST);
      return setMode('belt', { text: TEXT.belt });
    }
    if (tool === 'erase') return setMode('erase', { text: TEXT.erase });
    if (!BUILDINGS[tool]) return;
    if (!isBuildingUnlocked(state, tool)) return toastLocked(tool);
    if (!canAfford(state, BUILDINGS[tool].cost)) return toastMissing(BUILDINGS[tool].cost);
    startPlace(tool, null);
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
      text: existing ? TEXT.move(name) : TEXT.place(name, costText(BUILDINGS[type].cost)),
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
      const result = buyBuilding(state, g.type, g.x, g.y, g.rot);
      if (result === 'locked') return toastLocked(g.type);
      if (result === 'cost') return toastMissing(BUILDINGS[g.type].cost);
      if (!result) return;
      ui.ghost = null;
      changed();
      setMode('menu');
      buildBar.updateCosts(state);
      panels.toast(`${name} gebaut (−${costText(BUILDINGS[g.type].cost)}).`);
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

  // Vorschau einer Strecke: nur so weit, wie die Holzblöcke reichen.
  function beltPreview(trace) {
    return limitBeltPath(state, buildBeltPath(state, trace), affordableCount(state, BELT_COST));
  }

  // ---------- Abreißen ----------

  function eraseBeltAt(tile) {
    if (removeBelt(state, tile.x, tile.y)) changed();
  }

  // ---------- Laden ----------

  function openShop(hud) {
    select(null);
    hud?.closeMenu();
    shopView.open();
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

    // Wird regelmäßig aufgerufen, damit offene Fenster aktuell bleiben.
    refresh() {
      infoRefresh?.();
      shopView.refresh();
      if (mode === 'menu') buildBar.updateCosts(state);
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
        ui.beltPreview = beltPreview(drag.trace);
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
        ui.beltPreview = beltPreview(drag.trace);
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
        // Die volle Strecke kaufen: Reicht es nicht, kürzt buyBeltPath sie.
        const path = buildBeltPath(state, drag.trace);
        if (path.tiles.length > 1 || path.endDir) {
          const { created, cut } = buyBeltPath(state, path);
          if (cut > 0) {
            panels.toast(`Nicht genug Holzblöcke: ${cut} Feld${cut > 1 ? 'er' : ''} fehlt${cut > 1 ? 'en' : ''}. Mehr Holzblöcke ins Laden-Lager schicken.`, 3200);
          }
          if (created > 0 || path.tiles.length > 1) changed();
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
