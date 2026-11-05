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

const hud = createHud({ version: VERSION, onNewGame: newGame, onToggleTestMode: toggleTestMode });
hud.setTestMode(Boolean(settings.testMode), TEST_SPEED);

function worldBounds() {
  return { x: 0, y: 0, width: state.world.width * TILE, height: state.world.height * TILE };
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
});
controller = createController({ state, camera, ui, panels, buildBar, onChange, requestDraw, worldBounds });
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
});

function handleResize() {
  const size = renderer.resize();
  const firstLayout = camera.viewWidth === 0;
  setViewSize(camera, size.width, size.height);
  if (firstLayout) fitRect(camera, plotRect(), 24, worldBounds());
  else clampCamera(camera, worldBounds());
  requestDraw();
}

new ResizeObserver(handleResize).observe(canvas);
handleResize();
hud.update(state);

if (loaded.status === 'ok' && loaded.migratedFrom) {
  panels.toast('Spielstand übernommen. Neu: 3 Holzstämme und 3 Felsbrocken im Laden-Lager.', 4000);
} else if (loaded.status === 'ok') panels.toast('Spielstand geladen.', 1600);
else if (loaded.status === 'invalid') panels.toast('Spielstand war beschädigt – neues Spiel gestartet.', 3500);

// ---------- Takt ----------
// Die Simulation läuft in festen Takten (TICK). Pro Bild werden so viele Takte
// gerechnet, wie Zeit vergangen ist. Ist das Spiel im Hintergrund, ruht es
// (Offline-Produktion folgt in v0.7.0).

let lastTime = performance.now();
let accumulator = 0;
let lastRefresh = 0;

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
  simulate(seconds) {
    simulate(state, seconds);
    controller.refresh();
    requestDraw();
  },
};
