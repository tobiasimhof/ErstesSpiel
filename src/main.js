// Einstiegspunkt: verbindet Spielzustand, Kamera, Eingabe und Anzeige.

import { VERSION } from './version.js';
import { BUILDINGS } from './core/data/buildings.js';
import { createNewGame, buildingAt, isInWorld, isOwned } from './core/state.js';
import { TILE, createCamera, setViewSize, screenToWorld, panBy, zoomAt, fitRect, clampCamera } from './view/camera.js';
import { createRenderer } from './view/renderer.js';
import { attachInput } from './view/input.js';
import { createHud } from './view/hud.js';

const canvas = document.getElementById('game');
const state = createNewGame();
const ui = { selectedId: null };
const camera = createCamera();
const renderer = createRenderer(canvas);
const hud = createHud({ version: VERSION, onClosePanel: () => select(null) });

let needsDraw = true;
const requestDraw = () => {
  needsDraw = true;
};

function worldBounds() {
  return { x: 0, y: 0, width: state.world.width * TILE, height: state.world.height * TILE };
}

function plotRect() {
  const p = state.plot;
  return { x: p.x * TILE, y: p.y * TILE, width: p.width * TILE, height: p.height * TILE };
}

function select(building) {
  ui.selectedId = building ? building.id : null;
  if (building) hud.showBuilding(BUILDINGS[building.type], building, state);
  else hud.hidePanel();
  requestDraw();
}

function handleTap(sx, sy) {
  const world = screenToWorld(camera, sx, sy);
  const tx = Math.floor(world.x / TILE);
  const ty = Math.floor(world.y / TILE);
  const building = isInWorld(state, tx, ty) ? buildingAt(state, tx, ty) : null;
  if (building) {
    select(building);
  } else if (isInWorld(state, tx, ty) && !isOwned(state, tx, ty)) {
    select(null);
    hud.showLocked();
  } else {
    select(null);
  }
}

function handleResize() {
  const size = renderer.resize();
  const firstLayout = camera.viewWidth === 0;
  setViewSize(camera, size.width, size.height);
  if (firstLayout) fitRect(camera, plotRect(), 24, worldBounds());
  else clampCamera(camera, worldBounds());
  requestDraw();
}

attachInput(canvas, {
  onPan(dx, dy) {
    panBy(camera, dx, dy, worldBounds());
    requestDraw();
  },
  onZoom(sx, sy, factor) {
    zoomAt(camera, sx, sy, factor, worldBounds());
    requestDraw();
  },
  onTap: handleTap,
  onInteract: () => hud.hideHint(),
});

// Vollbild (Android/PC). Auf Geräten ohne Vollbild-Funktion wird der Knopf ausgeblendet.
const fullscreenButton = document.getElementById('btn-fullscreen');
if (document.fullscreenEnabled) {
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        await screen.orientation?.lock?.('landscape').catch(() => {});
      }
    } catch {
      // Vollbild wurde vom Browser abgelehnt – das Spiel läuft trotzdem weiter.
    }
  });
} else {
  fullscreenButton.hidden = true;
}

new ResizeObserver(handleResize).observe(canvas);
handleResize();
hud.update(state);

function frame() {
  if (needsDraw) {
    needsDraw = false;
    renderer.draw(state, camera, ui);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Für automatische Browser-Tests und zur Fehlersuche.
window.__game = { VERSION, state, camera, ui, TILE };
