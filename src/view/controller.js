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
  beltItems,
  beltLine,
  buildBeltPath,
  buyBeltPath,
  clearBeltLine,
  clearFeed,
  extendTrace,
  interpolateTiles,
  limitBeltPath,
  removeBelt,
  rotateBelt,
} from '../core/belts.js';
import {
  areaLosesWork,
  cleanSelection,
  isEmptySelection,
  moveArea,
  planAreaMove,
  removeArea,
  selectArea,
  selectionBounds,
} from '../core/area.js';
import { buyLand, landBuysLeft, landOffer, landSideAt } from '../core/land.js';
import { buildingLevel, isBuildingUnlocked, isItemUnlocked, itemLevel } from '../core/levels.js';
import { buyRaw, isBuyable, refillPlan, refillSource, sowPlan, sowSeed } from '../core/market.js';
import {
  buildingStatus,
  gardenCrop,
  gardenSeeds,
  growthLeft,
  harvest,
  isRipe,
  inputJam,
  loadInput,
  losesWorkOnRemove,
  productionOf,
  returnUnusedStock,
  setRecipe,
  sourceCapacity,
  sourceCount,
  sourceRoom,
  unusedStock,
  workshopInputs,
} from '../core/production.js';
import { affordableCount, canAfford, missingFor, storageCapacity, storageCount, storageTotal } from '../core/shop.js';
import { beltAt, buildingAt, findBuilding, isInWorld, isOwned } from '../core/state.js';
import { emptyWarehouse, warehouseTotal } from '../core/warehouse.js';
import { TILE, panBy, screenToWorld } from './camera.js';
import { costText, itemCount, numberFormat } from './format.js';

const TEXT = {
  place: (name, cost) => `${name} (kostet ${cost}): Vorschau mit dem Finger an die gewünschte Stelle schieben.`,
  move: (name) => `${name} verschieben: Vorschau an die neue Stelle schieben.`,
  belt: `Förderband (${costText(BELT_COST)} je Feld): mit einem Finger ziehen. Von einem Band aus ziehen teilt es auf, auf ein Band ziehen führt zusammen. Antippen dreht.`,
  erase: 'Abreißen: über Förderbänder wischen oder ein Gebäude antippen.',
  // v0.11.0: Bereich markieren und verschieben
  area: 'Bereich markieren: mit einem Finger ein Rechteck ziehen oder ein Teil antippen. Zwei Finger bewegen die Karte.',
  areaMarked: (summary) => `Markiert: ${summary}. Verschieben, abreißen oder neu markieren.`,
  areaMove: 'An die neue Stelle ziehen oder dorthin tippen. ↻ Drehen (Taste R) dreht die ganze Gruppe.',
};

// "2 Gebäude und 14 Bänder"
function areaSummary(sel) {
  const parts = [];
  if (sel.buildings.length > 0) parts.push(`${sel.buildings.length} Gebäude`);
  if (sel.belts.length > 0) parts.push(`${sel.belts.length} ${sel.belts.length === 1 ? 'Band' : 'Bänder'}`);
  return parts.join(' und ');
}

// Fläche kaufen (v0.9.0): Seiten und Streifen in Worten
const SIDE_TEXT = { N: 'oben', E: 'rechts', S: 'unten', W: 'links' };
function stripText(offer) {
  const across = offer.side === 'E' || offer.side === 'W';
  const unit = across ? (offer.depth === 1 ? 'Spalte' : 'Spalten') : offer.depth === 1 ? 'Reihe' : 'Reihen';
  return `${offer.depth} ${unit} ${SIDE_TEXT[offer.side]}`;
}

export function createController({
  state,
  camera,
  ui,
  panels,
  buildBar,
  shopView,
  warehouseView,
  onChange,
  requestDraw,
  worldBounds,
}) {
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
    // Die Markierung gibt es nur in den Bereich-Modi (v0.11.0).
    if (next !== 'area' && next !== 'areaMove') ui.area = null;
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

  // v0.14.0: Beschriftung von „Auffüllen“ – was der Knopf gerade tun würde
  function refillLabel(plan, input) {
    if (plan.room === 0) return '⏫ Vorrat voll';
    const n = plan.fromStorage + plan.buy;
    // v0.16.0: Flachspflanzen gibt es nicht beim Händler – dann zählt nur das Laden-Lager
    if (n === 0 && input.grown) return `⏫ Auffüllen – keine ${input.plural} im Laden-Lager`;
    if (n === 0) return `⏫ Auffüllen – kein ${input.name} im Lager, Gold reicht nicht`;
    const what = `${n} ${n === 1 ? input.name : input.plural}`;
    if (plan.buy === 0) return `⏫ Auffüllen: ${what}`;
    return `⏫ Auffüllen: ${what} · kauft ${plan.buy} für ${numberFormat.format(plan.cost)} 🪙`;
  }

  // v0.16.0: Beschriftung von „Säen“ – was der Knopf gerade tun würde
  function sowLabel(plan) {
    if (!plan.seed) return '🌱 Säen';
    const name = ITEMS[plan.seed].name;
    if (plan.result === 'locked') return `🌱 ${name} gibt es erst ab Level ${itemLevel(plan.seed)}`;
    if (plan.result === 'gold') return `🌱 Säen – kein ${name} im Lager, Gold reicht nicht`;
    if (plan.buy) return `🌱 Säen: ${name} · kauft 1 für ${numberFormat.format(plan.cost)} 🪙`;
    return `🌱 Säen: ${name}`;
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
      // v0.14.0: Vorrat von bis zu 3 Rohstoffen
      const inside = sourceCount(b);
      lines.push(`Vorrat: ${inside} / ${sourceCapacity(b)} ${inside === 1 ? input.name : input.plural}`);
      if (prod.loaded) {
        const left = prod.remaining + (prod.queued ?? 0) * p.amount;
        lines.push(`Leer in etwa ${formatDuration(left * (p.duration / p.amount))}`);
      }
      lines.push(`${input.plural} im Laden-Lager: ${storageCount(state, p.input)}`);
      const plan = refillPlan(state, b);
      const refill = info.buttons.get('refill');
      refill.textContent = refillLabel(plan, input);
      refill.disabled = plan.fromStorage + plan.buy === 0;
      const room = sourceRoom(b);
      const load = info.buttons.get('load');
      load.textContent = `➕ 1 ${input.name} einlegen`;
      load.disabled = room < 1 || storageCount(state, p.input) < 1;
      // v0.16.0: Flachspflanzen gibt es nicht beim Händler – dann fehlt der Knopf
      const buy = info.buttons.get('buy');
      if (buy) buy.disabled = state.gold < input.buyPrice || !isItemUnlocked(state, p.input);
    } else if (p?.kind === 'garden') {
      // v0.16.0 (Tobias): Beet – säen, wachsen lassen, ernten (zwei Schritte)
      for (const seed of gardenSeeds(b.type)) {
        const c = p.crops[seed];
        lines.push(`1 ${ITEMS[seed].name} → 1 ${ITEMS[c.plant].name} in ${formatDuration(c.time)}`);
      }
      const crop = gardenCrop(b);
      if (crop && !isRipe(b)) lines.push(`Reif in etwa ${formatDuration(growthLeft(b))}`);
      if (crop && isRipe(b)) lines.push(`🌾 Die ${ITEMS[crop.plant].name} ist reif. Nach dem Ernten liegt sie im Laden-Lager.`);
      const plan = sowPlan(state, b);
      if (plan.seed) lines.push(`${ITEMS[plan.seed].name} im Laden-Lager: ${storageCount(state, plan.seed)}`);
      const sow = info.buttons.get('sow');
      sow.hidden = Boolean(crop);
      sow.textContent = sowLabel(plan);
      sow.disabled = plan.result !== 'ok';
      const reap = info.buttons.get('harvest');
      reap.hidden = !crop;
      reap.disabled = !isRipe(b);
      reap.classList.toggle('primary', isRipe(b));
      reap.textContent = isRipe(b) ? `🌾 Ernten: 1 ${ITEMS[crop.plant].name}` : '🌾 Ernten – noch nicht reif';
    } else if (p?.kind === 'workshop') {
      const recipe = RECIPES[prod.recipe];
      const inputs = workshopInputs(b);
      const outName = recipe.amount === 1 ? ITEMS[recipe.output].name : ITEMS[recipe.output].plural;
      const ingredients = inputs.map((i) => itemCount(i.type, i.need)).join(' + ');
      lines.push(`Rezept: ${ingredients} → ${recipe.amount} ${outName} (${recipe.time} s)`);
      if (inputs.length === 1) {
        const [{ type, have, need }] = inputs;
        lines.push(`Am Eingang: ${have} / ${need * 2} ${ITEMS[type].plural}`);
      } else {
        // v0.10.0: jede Zutat mit Vorrat – fehlt etwas, steht es dabei
        for (const i of inputs) {
          const mark = i.done ? '✅' : '⬜';
          const lack = i.done ? '' : ` – fehlt noch ${i.need - i.have}`;
          lines.push(`${mark} ${ITEMS[i.type].name}: ${i.have} / ${i.need}${lack}`);
        }
        lines.push(`Wert: ${numberFormat.format(ITEMS[recipe.output].price)} 🪙 je ${ITEMS[recipe.output].name}`);
      }
      // v0.10.1 (Tobias): Rezepte der anderen Einstellungen ansehen, ohne umzustellen
      const others = p.recipes.filter((key) => key !== prod.recipe);
      if (others.length > 0) {
        lines.push('Andere Einstellungen:');
        for (const key of others) {
          const r = RECIPES[key];
          const out = ITEMS[r.output];
          const ins = Object.entries(r.inputs).map(([type, n]) => itemCount(type, n)).join(' + ');
          lines.push(`• ${r.label}: ${ins} · ${numberFormat.format(out.price * r.amount)} 🪙`);
        }
      }
      // Zutaten für eine andere Einstellung bleiben in der Maschine
      const rest = unusedStock(b);
      const hasRest = Object.keys(rest).length > 0;
      if (hasRest) lines.push(`Liegt noch in der Maschine: ${costText(rest)} – für eine andere Einstellung.`);
      const restButton = info.buttons.get('leftovers');
      if (restButton) restButton.hidden = !hasRest;
      // v0.12.0: Stau am Eingang – Zulauf leeren
      const feedButton = info.buttons.get('clearFeed');
      if (feedButton) feedButton.hidden = !inputJam(state, b);
      for (const key of p.recipes) info.buttons.get(`recipe:${key}`)?.classList.toggle('primary', key === prod.recipe);
    } else if (p?.kind === 'storage') {
      for (let i = 0; i < p.slots; i++) {
        const slot = prod.slots[i];
        lines.push(slot ? `Fach ${i + 1}: ${ITEMS[slot.type].name} ${slot.count} / ${p.slotSize}` : `Fach ${i + 1}: leer`);
      }
      info.buttons.get('empty').disabled = warehouseTotal(b) === 0;
    } else if (p?.kind === 'shipping') {
      lines.push(`Bisher versendet: ${numberFormat.format(prod.shipped)} Waren`);
      lines.push(`Laden-Lager: ${storageTotal(state)} / ${storageCapacity(state)}`);
    }
    info.setStatus(lines);
  }

  function updateBeltInfo(x, y) {
    const belt = beltAt(state, x, y);
    if (!belt) return select(null);
    // v0.12.0: Was liegt auf der ganzen Strecke?
    const line = beltLine(state, x, y);
    const items = beltItems(state, line);
    const empty = Object.keys(items).length === 0;
    info.buttons.get('clear').disabled = empty;
    info.setStatus([
      belt.item ? `Transportiert: ${ITEMS[belt.item.type].name}` : 'Gerade leer',
      empty
        ? `Die ganze Strecke (${line.length} ${line.length === 1 ? 'Band' : 'Bänder'}) ist leer.`
        : `Auf der ganzen Strecke (${line.length} Bänder): ${costText(items)}`,
    ]);
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
        // v0.14.0 (Tobias): bis zum Rand füllen – erst aus dem Laden-Lager,
        // was fehlt, direkt beim Händler kaufen
        actions.push({
          key: 'refill',
          label: '',
          primary: true,
          onClick: () => {
            const machine = findBuilding(state, b.id);
            if (!machine) return;
            const done = refillSource(state, machine);
            const n = done.fromStorage + done.buy;
            if (n > 0) {
              changed();
              const input = ITEMS[p.input];
              const bought = done.buy > 0 ? ` (${done.buy} gekauft für ${numberFormat.format(done.cost)} Gold)` : '';
              panels.toast(`${n} ${n === 1 ? input.name : input.plural} eingelegt${bought}.`);
            } else if (done.room === 0) panels.toast('Der Vorrat ist schon voll.');
            else if (ITEMS[p.input].grown) panels.toast(`Keine ${ITEMS[p.input].plural} im Laden-Lager – erst im Beet ernten.`);
            else panels.toast(`Kein ${ITEMS[p.input].name} im Laden-Lager, und das Gold reicht nicht zum Kaufen.`);
            infoRefresh?.();
          },
        });
        actions.push({
          key: 'load',
          label: '',
          onClick: () => {
            if (loadInput(state, b)) {
              changed();
              panels.toast(`${ITEMS[p.input].name} eingelegt.`);
            } else if (sourceRoom(b) < 1) {
              panels.toast('Der Vorrat ist voll.');
            } else {
              const input = ITEMS[p.input];
              panels.toast(input.grown ? `Keine ${input.plural} im Laden-Lager – erst im Beet ernten.` : `Kein ${input.name} im Laden-Lager.`);
            }
            infoRefresh?.();
          },
        });
        if (isBuyable(p.input)) actions.push({
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
      if (p?.kind === 'garden') {
        // v0.16.0 (Tobias): Säen und Ernten sind zwei getrennte Schritte
        actions.push({
          key: 'sow',
          label: '',
          primary: true,
          onClick: () => {
            const beet = findBuilding(state, b.id);
            if (!beet) return;
            const done = sowSeed(state, beet);
            if (done.result === 'ok') {
              changed();
              const crop = gardenCrop(beet);
              const bought = done.buy ? ` (gekauft für ${numberFormat.format(done.cost)} Gold)` : '';
              panels.toast(`${ITEMS[done.seed].name} gesät${bought}. In ${formatDuration(crop.time)} ist die ${ITEMS[crop.plant].name} reif.`, 4000);
            } else if (done.result === 'gold') panels.toast(`Kein ${ITEMS[done.seed].name} im Laden-Lager, und das Gold reicht nicht zum Kaufen.`);
            else if (done.result === 'locked') panels.toast(`${ITEMS[done.seed].name} gibt es erst ab Level ${itemLevel(done.seed)}.`);
            else if (done.result === 'busy') panels.toast('Im Beet wächst schon etwas.');
            infoRefresh?.();
          },
        });
        actions.push({
          key: 'harvest',
          label: '🌾 Ernten',
          onClick: () => {
            const beet = findBuilding(state, b.id);
            if (!beet) return;
            const crop = gardenCrop(beet);
            const result = harvest(state, beet);
            if (result === 'ok') {
              changed();
              panels.toast(`${ITEMS[crop.plant].name} geerntet – sie liegt im Laden-Lager. Jetzt das Beet neu säen.`, 4000);
            } else if (result === 'full') panels.toast('Dein Laden-Lager ist voll – erst Platz schaffen, dann ernten.');
            else if (result === 'unripe') panels.toast(`Noch nicht reif – in etwa ${formatDuration(growthLeft(beet))}.`);
            infoRefresh?.();
          },
        });
      }
      if (p?.kind === 'workshop') {
        // v0.16.0: Mit nur einer Einstellung (Webstube) gibt es nichts umzustellen.
        if (p.recipes.length > 1) for (const key of p.recipes) {
          actions.push({
            key: `recipe:${key}`,
            label: RECIPES[key].label,
            onClick: () => {
              // v0.10.1: Zutaten bleiben in der Maschine (vorher kamen sie
              // ins Laden-Lager – das sah aus, als wären sie verschwunden).
              setRecipe(b, key);
              changed();
              infoRefresh?.();
            },
          });
        }
        actions.push({
          key: 'leftovers',
          label: '↩ Reste ins Laden-Lager',
          onClick: () => {
            const returned = returnUnusedStock(state, b);
            if (Object.keys(returned).length > 0) panels.toast(`Ins Laden-Lager gelegt: ${costText(returned)}.`);
            changed();
            infoRefresh?.();
          },
        });
        // v0.12.0: Falsche Ware staut den Eingang – die Zuleitung leeren
        actions.push({
          key: 'clearFeed',
          label: '🧺 Zulauf leeren',
          onClick: () => {
            const machine = findBuilding(state, b.id);
            if (!machine) return;
            const back = clearFeed(state, machine);
            if (Object.keys(back).length > 0) {
              panels.toast(`Zulauf geleert: ${costText(back)} liegen im Laden-Lager. Kommt weiter Falsches nach, die Zuleitung umlegen.`, 4500);
            }
            changed();
            infoRefresh?.();
          },
        });
      }
      if (p?.kind === 'storage') {
        // v0.12.0 (Tobias): Das Lagerhaus als Gegenstück zum Versandportal.
        // v0.14.0 (Tobias): nur noch von Hand befüllen, kein Nachschub.
        actions.push(
          { key: 'fill', label: '📥 Befüllen', primary: true, onClick: () => warehouseView.open(b.id) },
          {
            key: 'empty',
            label: '↩ Ausräumen',
            onClick: () => {
              const store = findBuilding(state, b.id);
              if (!store) return;
              const back = emptyWarehouse(state, store);
              panels.toast(
                Object.keys(back).length > 0 ? `Lagerhaus ausgeräumt: ${costText(back)} liegen im Laden-Lager.` : 'Das Lagerhaus ist leer.',
                3500,
              );
              changed();
              infoRefresh?.();
            },
          },
        );
      }
      actions.push(
        { label: '↔ Verschieben', group: actions.length > 0, onClick: () => startPlace(b.type, b) },
        { label: '↻ Drehen', onClick: () => rotateBuildingInPlace(b) },
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
        text: 'Transportiert Waren Feld für Feld in Pfeilrichtung. Zeigt ein Band in mehrere Richtungen, verteilt es die Waren abwechselnd. Ist ein Band voll, staut sich alles davor. „Strecke leeren“ bringt alle Waren der hell markierten Strecke ins Laden-Lager.',
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
            key: 'clear',
            label: '🧺 Strecke leeren',
            onClick: () => {
              const back = clearBeltLine(state, sel.x, sel.y);
              panels.toast(
                Object.keys(back).length > 0 ? `Strecke geleert: ${costText(back)} liegen im Laden-Lager.` : 'Auf dieser Strecke liegt nichts.',
                3500,
              );
              changed();
              infoRefresh?.();
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

  // v0.10.2: Jeder Streifen kostet gleich viel; jede Seite geht 2×.
  function landInfoText(side) {
    const left = landBuysLeft(state, side);
    const more = left === 1 ? 'Das ist der letzte Kauf an dieser Seite.' : `An dieser Seite geht das noch ${left}×.`;
    return `Vergrößert dein Grundstück an dieser Seite. Gebäude und Bänder bleiben, wo sie sind. Jeder Kauf kostet gleich viel. ${more}`;
  }

  function showLandInfo(side) {
    const offer = landOffer(state, side);
    if (!offer) return select(null);
    const price = numberFormat.format(offer.price);
    info = panels.showInfo({
      icon: '🗺️',
      title: 'Fläche kaufen',
      meta: `${stripText(offer)} · ${offer.fields} Felder`,
      text: landInfoText(side),
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

  function rotateBuildingInPlace(b) {
    if (rotateBuilding(state, b.id)) {
      changed();
      infoRefresh?.();
    } else {
      panels.toast('Zum Drehen fehlt hier der Platz.');
    }
  }

  async function askRemoveBuilding(b) {
    const def = BUILDINGS[b.type];
    const refund = b.paid
      ? `Die Baukosten kommen zurück ins Laden-Lager: ${costText(b.paid)}.`
      : 'Es hat beim Bauen nichts gekostet, deshalb gibt es keine Baukosten zurück.';
    const ok = await panels.confirm({
      title: `${def.name} abreißen?`,
      text: losesWorkOnRemove(b)
        ? `${productionOf(b.type)?.kind === 'garden' ? 'Die halb gewachsene Pflanze' : 'Der angefangene Rohstoff'} geht dabei verloren. Waren im Gebäude kommen ins Laden-Lager. ${refund}`
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
    if (tool === 'area') return startArea();
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

  // ---------- Bereich markieren, verschieben, abreißen (v0.11.0) ----------
  // ui.area = { sel, rect, ghost }: sel = markierte Gebäude und Bänder,
  // rect = Rechteck, das gerade gezogen wird, ghost = Vorschau beim Verschieben
  // ({ x, y, turns, plan }).

  function startArea() {
    select(null);
    setMode('area', { text: TEXT.area });
    ui.area = { sel: { buildings: [], belts: [] }, rect: null, ghost: null };
    updateAreaBar();
  }

  function updateAreaBar() {
    if (!ui.area) return;
    ui.area.sel = cleanSelection(state, ui.area.sel);
    const empty = isEmptySelection(ui.area.sel);
    buildBar.setAreaEnabled(!empty);
    if (mode === 'area') buildBar.setText(empty ? TEXT.area : TEXT.areaMarked(areaSummary(ui.area.sel)));
    requestDraw();
  }

  function markArea(a, b) {
    ui.area.sel = selectArea(state, a, b);
    updateAreaBar();
  }

  function startAreaMove() {
    if (!ui.area) return;
    const sel = cleanSelection(state, ui.area.sel);
    const box = selectionBounds(state, sel);
    if (!box) return;
    const area = ui.area;
    setMode('areaMove', { text: TEXT.areaMove, confirmLabel: '✓ Hierhin' });
    ui.area = area;
    area.sel = sel;
    area.rect = null;
    area.ghost = { x: box.x, y: box.y, turns: 0, plan: null };
    validateAreaGhost();
  }

  function validateAreaGhost() {
    const g = ui.area?.ghost;
    if (!g) return;
    g.plan = planAreaMove(state, ui.area.sel, g.x, g.y, g.turns);
    buildBar.setConfirmEnabled(Boolean(g.plan?.valid));
    requestDraw();
  }

  // Dreht die Vorschau um 90° im Uhrzeigersinn, ungefähr um ihre Mitte.
  function rotateAreaGhost() {
    const g = ui.area?.ghost;
    if (!g?.plan) return;
    const cx = g.x + g.plan.width / 2;
    const cy = g.y + g.plan.height / 2;
    g.turns = (g.turns + 1) % 4;
    g.x = Math.round(cx - g.plan.height / 2);
    g.y = Math.round(cy - g.plan.width / 2);
    validateAreaGhost();
  }

  function areaGhostContains(tile) {
    const g = ui.area?.ghost;
    if (!g?.plan) return false;
    return tile.x >= g.x && tile.x < g.x + g.plan.width && tile.y >= g.y && tile.y < g.y + g.plan.height;
  }

  function moveAreaGhostCenterTo(tile) {
    const g = ui.area.ghost;
    g.x = tile.x - Math.floor((g.plan.width - 1) / 2);
    g.y = tile.y - Math.floor((g.plan.height - 1) / 2);
    validateAreaGhost();
  }

  function confirmAreaMove() {
    const g = ui.area?.ghost;
    if (!g?.plan?.valid) return;
    const moved = moveArea(state, ui.area.sel, g.x, g.y, g.turns);
    if (!moved) {
      validateAreaGhost();
      return panels.toast('Hier ist kein Platz.');
    }
    const area = ui.area;
    changed();
    setMode('area', { text: TEXT.area });
    ui.area = area;
    area.sel = moved;
    area.ghost = null;
    updateAreaBar();
    panels.toast(`Verschoben: ${areaSummary(moved)}.`, 2000);
  }

  function cancelAreaMove() {
    const area = ui.area;
    setMode('area', { text: TEXT.area });
    ui.area = area ?? { sel: { buildings: [], belts: [] }, rect: null, ghost: null };
    ui.area.ghost = null;
    updateAreaBar();
  }

  async function askRemoveArea() {
    if (!ui.area) return;
    const sel = cleanSelection(state, ui.area.sel);
    if (isEmptySelection(sel)) return;
    const summary = areaSummary(sel);
    const lost = areaLosesWork(state, sel) ? ' Ein angefangener Rohstoff oder eine halb gewachsene Pflanze geht dabei verloren.' : '';
    const ok = await panels.confirm({
      title: 'Bereich abreißen?',
      text: `Alles Markierte wird abgerissen: ${summary}.${lost} Waren darin und bezahlte Baukosten kommen ins Laden-Lager.`,
      okLabel: 'Abreißen',
      danger: true,
    });
    if (!ok || mode !== 'area' || !ui.area) return;
    removeArea(state, sel);
    changed();
    updateAreaBar();
    panels.toast(`Abgerissen: ${summary}.`, 2500);
  }

  // ---------- Taste R: drehen (v0.11.0) ----------
  // Dreht, was gerade dran ist: die Vorschau beim Bauen oder Verschieben, sonst
  // das ausgewählte Gebäude oder Band. true, wenn etwas gedreht wurde.
  function rotateKey() {
    if (panels.isModalOpen()) return false;
    if (mode === 'place') {
      rotateGhost();
      return true;
    }
    if (mode === 'areaMove') {
      rotateAreaGhost();
      return true;
    }
    if (mode !== 'normal' && mode !== 'menu') return false;
    const sel = ui.selected;
    if (sel?.kind === 'building') {
      const b = findBuilding(state, sel.id);
      if (!b) return false;
      rotateBuildingInPlace(b);
      return true;
    }
    if (sel?.kind === 'belt' && rotateBelt(state, sel.x, sel.y)) {
      changed();
      infoRefresh?.();
      return true;
    }
    return false;
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
    rotateKey,

    confirmTool() {
      if (mode === 'place') confirmPlace();
      else if (mode === 'areaMove') confirmAreaMove();
      else if (mode === 'belt' || mode === 'erase' || mode === 'area') setMode('menu');
    },
    rotateTool() {
      if (mode === 'place') rotateGhost();
      else if (mode === 'areaMove') rotateAreaGhost();
    },
    cancelTool() {
      if (mode === 'place') cancelPlace();
      else if (mode === 'areaMove') cancelAreaMove();
      else if (mode === 'belt' || mode === 'erase' || mode === 'area') setMode('menu');
    },
    areaMoveTool() {
      if (mode === 'area') startAreaMove();
    },
    areaEraseTool() {
      if (mode === 'area') askRemoveArea();
    },
    closeInfo() {
      select(null);
    },

    // Wird regelmäßig aufgerufen, damit offene Fenster aktuell bleiben.
    refresh() {
      infoRefresh?.();
      shopView.refresh();
      warehouseView.refresh();
      if (mode === 'menu') buildBar.updateCosts(state);
    },

    back() {
      if (panels.isModalOpen()) return panels.closeTopmost();
      if (mode === 'place') return cancelPlace();
      if (mode === 'areaMove') return cancelAreaMove();
      if (mode === 'belt' || mode === 'erase' || mode === 'area') return setMode('menu');
      if (mode === 'menu') return closeMenu();
      select(null);
    },

    onTap(sx, sy) {
      const tile = tileAtScreen(sx, sy);
      if (mode === 'normal' || mode === 'menu') {
        tapNormal(tile);
      } else if (mode === 'place') {
        if (isOwned(state, tile.x, tile.y)) moveGhostCenterTo(tile);
      } else if (mode === 'area') {
        markArea(tile, tile);
      } else if (mode === 'areaMove') {
        if (isOwned(state, tile.x, tile.y)) moveAreaGhostCenterTo(tile);
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
      } else if (mode === 'area') {
        drag = { kind: 'area', start: tile };
        ui.area.rect = { a: tile, b: tile };
        markArea(tile, tile);
      } else if (mode === 'areaMove' && areaGhostContains(tile)) {
        const g = ui.area.ghost;
        drag = { kind: 'areaGhost', offsetX: tile.x - g.x, offsetY: tile.y - g.y };
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
      } else if (drag.kind === 'area' && ui.area) {
        const r = ui.area.rect;
        if (r && (r.b.x !== tile.x || r.b.y !== tile.y)) {
          r.b = tile;
          markArea(drag.start, tile);
        }
      } else if (drag.kind === 'areaGhost' && ui.area?.ghost) {
        const g = ui.area.ghost;
        const x = tile.x - drag.offsetX;
        const y = tile.y - drag.offsetY;
        if (x !== g.x || y !== g.y) {
          g.x = x;
          g.y = y;
          validateAreaGhost();
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
      if (drag?.kind === 'area' && ui.area) ui.area.rect = null;
      drag = null;
      requestDraw();
    },

    onDragCancel() {
      ui.beltPreview = null;
      if (ui.area) ui.area.rect = null;
      drag = null;
      requestDraw();
    },
  };
}
