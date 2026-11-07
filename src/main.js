// Einstiegspunkt: lädt den Spielstand und verbindet Spielregeln, Kamera,
// Eingabe, Anzeige und Speichern.

import { VERSION } from './version.js';
import { createNewGame } from './core/state.js';
import { TICK, simulate, tick } from './core/sim.js';
import { TILE, createCamera, setViewSize, zoomAt, panBy, fitRect, clampCamera } from './view/camera.js';
import { createRenderer } from './view/renderer.js';
import { attachInput } from './view/input.js';
import { createHud } from './view/hud.js';
import { createPanels } from './view/panels.js';
import { createBuildBar } from './view/buildbar.js';
import { createController } from './view/controller.js';
import { createShopView } from './view/shop.js';
import { createWarehouseView } from './view/warehouse.js';
import { applyTestPack } from './core/market.js';
import { START_GOLD } from './core/data/shop.js';
import { LAND } from './core/data/land.js';
import { canLevelUp } from './core/levels.js';
import { canDeliver, currentQuest, xpNeeded } from './core/quests.js';
import { createLevelView, unlockText } from './view/levels.js';
import { costText, numberFormat } from './view/format.js';
import { redrawItemIcons } from './view/itemArt.js';
import { clearGame, loadGame, loadSettings, saveGame, saveSettings } from './view/storage.js';

const loaded = loadGame();
const state = loaded.status === 'ok' ? loaded.state : createNewGame();

const canvas = document.getElementById('game');
const ui = { mode: 'normal', selected: null, ghost: null, beltPreview: null, simAlpha: 0 };
const settings = loadSettings();
const TEST_SPEED = 10;
const camera = createCamera();
const renderer = createRenderer(canvas);
const panels = createPanels();

let needsDraw = true;
const requestDraw = () => {
  needsDraw = true;
};

// ---------- Speichern ----------

let saveTimer = null;
let resetting = false;
function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  if (!resetting) saveGame(state);
}
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 400);
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveNow();
});
window.addEventListener('pagehide', saveNow);
// Die Fabrik läuft ständig, deshalb zusätzlich regelmäßig speichern.
setInterval(saveNow, 10000);

function onChange() {
  hud.update(state);
  requestDraw();
  scheduleSave();
}

async function newGame() {
  const ok = await panels.confirm({
    title: 'Neues Spiel starten?',
    text: 'Deine Fabrik wird gelöscht und du beginnst von vorn.',
    okLabel: 'Neues Spiel',
    danger: true,
  });
  if (!ok) return;
  resetting = true;
  clearTimeout(saveTimer);
  clearGame();
  location.reload();
}

// ---------- Oberfläche ----------

function toggleTestMode() {
  settings.testMode = !settings.testMode;
  saveSettings(settings);
  hud.setTestMode(settings.testMode, TEST_SPEED);
  panels.toast(settings.testMode ? `Testmodus an: Zeit läuft ${TEST_SPEED}-mal schneller.` : 'Testmodus aus: normale Zeit.');
}

function testPack() {
  applyTestPack(state);
  onChange();
  controller.refresh();
  panels.toast('Testpaket: 1.000 Gold und von jeder freigeschalteten Ware 50 Stück (Kombi-Teile je 5) ins Laden-Lager gelegt.');
}

// ---------- Laden-Level (v0.9.0) ----------

let levelReady = canLevelUp(state);
function onLevelUp({ level, gift }) {
  levelReady = false;
  onChange();
  buildBar.updateCosts(state);
  panels.toast(`Laden-Level ${level}! Neu: ${unlockText(level)}. Gratis im Laden-Lager: ${costText(gift)}.`, 6000);
}
// v0.13.0: Auftrag abgegeben
function onQuestDone({ gold, xp }) {
  onChange();
  panels.toast(`Auftrag erledigt: +${numberFormat.format(xp)} Erfahrung, +${numberFormat.format(gold)} Gold.`, 3000);
}
const levelView = createLevelView({ state, panels, onLevelUp, onQuestDone });
function openLevel() {
  controller.closeInfo();
  levelView.open();
}

const hud = createHud({
  version: VERSION,
  onNewGame: newGame,
  onToggleTestMode: toggleTestMode,
  onTestPack: testPack,
  onLevel: () => openLevel(),
});
hud.setTestMode(Boolean(settings.testMode), TEST_SPEED);

function worldBounds() {
  const w = state.world;
  return { x: w.x * TILE, y: w.y * TILE, width: w.width * TILE, height: w.height * TILE };
}

function plotRect() {
  const p = state.plot;
  return { x: p.x * TILE, y: p.y * TILE, width: p.width * TILE, height: p.height * TILE };
}

// Die Knöpfe rufen den Controller erst beim Antippen auf, daher darf er
// danach erzeugt werden.
let controller = null;
const buildBar = createBuildBar({
  onShop: () => controller.openShop(hud),
  onOpenMenu: () => controller.openMenu(),
  onCloseMenu: () => controller.closeMenu(),
  onSelectTool: (tool) => controller.selectTool(tool),
  onConfirm: () => controller.confirmTool(),
  onRotate: () => controller.rotateTool(),
  onCancel: () => controller.cancelTool(),
  onAreaMove: () => controller.areaMoveTool(),
  onAreaErase: () => controller.areaEraseTool(),
});
const shopView = createShopView({ state, panels, onChange });
const warehouseView = createWarehouseView({ state, panels, onChange });
controller = createController({ state, camera, ui, panels, buildBar, shopView, warehouseView, onChange, requestDraw, worldBounds });
buildBar.setMode('normal');
panels.setInfoCloseHandler(() => controller.closeInfo());

attachInput(canvas, {
  onTap: (x, y) => controller.onTap(x, y),
  onDragStart: (x, y) => controller.onDragStart(x, y),
  onDragMove: (x, y, dx, dy) => controller.onDragMove(x, y, dx, dy),
  onDragEnd: (x, y) => controller.onDragEnd(x, y),
  onDragCancel: () => controller.onDragCancel(),
  onPan(dx, dy) {
    panBy(camera, dx, dy, worldBounds());
    requestDraw();
  },
  onZoom(x, y, factor) {
    zoomAt(camera, x, y, factor, worldBounds());
    requestDraw();
  },
  onInteract: () => hud.hideHint(),
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') controller.back();
  // v0.11.0 (Tobias spielt mit Tastatur am Tablet): R dreht die Vorschau beim
  // Bauen und Verschieben, sonst das ausgewählte Gebäude oder Band.
  // Strg+R (neu laden) bleibt, wie es ist.
  const typing = event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable]');
  if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.repeat && !typing) {
    if (controller.rotateKey()) event.preventDefault();
  }
});

// v0.10.2: Zurück aus dem Hintergrund (z. B. App minimiert) – der Browser kann
// die kleinen Warenbilder weggeworfen haben, also alle neu zeichnen.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') redrawItemIcons();
});
window.addEventListener('pageshow', () => redrawItemIcons());

function handleResize() {
  const size = renderer.resize();
  const firstLayout = camera.viewWidth === 0;
  setViewSize(camera, size.width, size.height);
  // Rand von 36 px: Die Schilder zum Flächenkauf über und unter dem Grundstück bleiben sichtbar.
  if (firstLayout) fitRect(camera, plotRect(), 36, worldBounds());
  else clampCamera(camera, worldBounds());
  requestDraw();
}

new ResizeObserver(handleResize).observe(canvas);
handleResize();
hud.update(state);

if (loaded.status === 'ok' && loaded.migratedFrom) {
  const from = loaded.migratedFrom;
  const notes = [
    'Spielstand übernommen.',
    from < 5 ? 'Neu: Handel! Im Laden gibt es jetzt Theken und den Händler; Bauen kostet Waren aus dem Laden-Lager.' : '',
    from === 5 ? 'Neu: Die Schmiede macht Eisenstangen statt Nägel.' : '',
    from < 7 ? 'Neu: Fläche kaufen – tippe auf die ＋-Schilder am Rand. Deine Fabrik hat Laden-Level 3, alles bleibt freigeschaltet.' : '',
    from < 8 ? `Neu: ${START_GOLD} Gold Startkapital – du bekommst es einmalig nachgezahlt.` : '',
    from < 9 ? `Neu: Fläche kostet jetzt immer ${numberFormat.format(LAND.price)} Gold für ${LAND.depth} Reihen; jede Seite lässt sich ${LAND.perSide}× erweitern.` : '',
    from < 10 ? 'Neu: Lagerhäuser lassen sich aus dem Laden-Lager befüllen und holen mit Nachschub Waren von dort aufs Band. Bänder lassen sich leeren.' : '',
    from < 11 ? 'Neu: Aufträge der Bewohner – tippe oben auf „Laden-Level“. Einige Waren heißen jetzt anders, z. B. Mechanischer Schalter → Räderwerk, Mini-Schloss → Vorhängeschloss.' : '',
    ...(loaded.notes ?? []),
    loaded.counterNote ?? '',
  ].filter(Boolean);
  panels.toast(notes.join(' '), 9000);
} else if (loaded.status === 'ok' && loaded.counterNote) panels.toast(`Spielstand geladen. ${loaded.counterNote}`, 6000);
else if (loaded.status === 'ok') panels.toast('Spielstand geladen.', 1600);
else if (loaded.status === 'invalid') panels.toast('Spielstand war beschädigt – neues Spiel gestartet.', 3500);

// ---------- Takt ----------
// Die Simulation läuft in festen Takten (TICK). Pro Bild werden so viele Takte
// gerechnet, wie Zeit vergangen ist. Ist das Spiel im Hintergrund, ruht es
// (Offline-Produktion folgt in v0.14.0).

let lastTime = performance.now();
let accumulator = 0;
let lastRefresh = 0;
let lastGifts = state.market.gifts;
// v0.13.0: einmal Bescheid sagen, wenn der aktuelle Auftrag abgegeben werden kann
const questKey = () => `${state.shopLevel}|${state.quest.index}`;
let questReadyKey = canDeliver(state) ? questKey() : null;

function frame(now) {
  const realDt = Math.min(0.25, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;
  accumulator += realDt * (settings.testMode ? TEST_SPEED : 1);
  let steps = 0;
  while (accumulator >= TICK && steps < 200) {
    tick(state);
    accumulator -= TICK;
    steps++;
  }
  if (steps === 200) accumulator = 0;
  ui.simAlpha = accumulator / TICK;

  renderer.draw(state, camera, ui);
  needsDraw = false;

  if (now - lastRefresh > 400) {
    lastRefresh = now;
    controller.refresh();
    levelView.refresh();
    hud.update(state); // Gold ändert sich, wenn Kunden kaufen
    // Genug Erfahrung und Gold fürs nächste Level: einmal Bescheid sagen
    const ready = canLevelUp(state);
    if (ready && !levelReady) {
      panels.toast(`Genug Erfahrung und Gold! Tippe oben auf „Laden-Level“, um auf Level ${state.shopLevel + 1} aufzusteigen.`, 5000);
    }
    levelReady = ready;
    if (canDeliver(state)) {
      if (questReadyKey !== questKey() && !levelView.isOpen()) {
        panels.toast(`Auftrag bereit: ${currentQuest(state).from} wartet. Tippe oben auf „Laden-Level“, um abzugeben.`, 5000);
      }
      questReadyKey = questKey();
    }
    if (state.market.gifts !== lastGifts) {
      if (state.market.gifts > lastGifts) {
        panels.toast('Der Händler hat Mitleid: Du bekommst einen Holzstamm geschenkt. Er liegt im Laden-Lager.', 5000);
        scheduleSave();
      }
      lastGifts = state.market.gifts;
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Für automatische Browser-Tests und zur Fehlersuche.
window.__game = {
  VERSION,
  state,
  camera,
  ui,
  TILE,
  saveNow,
  openLevel,
  simulate(seconds) {
    simulate(state, seconds);
    controller.refresh();
    requestDraw();
  },
  // v0.13.0: für den Browser-Test – Erfahrung, die das aktuelle Level zum Aufstieg braucht
  xpNeeded: () => xpNeeded(state.shopLevel),
  currentQuest: () => currentQuest(state),
};
