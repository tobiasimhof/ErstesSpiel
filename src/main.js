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
import { isRipe, productionOf } from './core/production.js';
import { createLevelView, unlockText } from './view/levels.js';
import { costText, numberFormat } from './view/format.js';
import { redrawItemIcons } from './view/itemArt.js';
import { clearGame, loadGame, loadSettings, saveGame, saveSettings } from './view/storage.js';
import { OFFLINE } from './core/data/offline.js';
import { catchUpProgress, extendCatchUp, offlineReport, runCatchUp, startCatchUp } from './core/offline.js';
import { createOfflineView } from './view/offline.js';

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
// v0.14.0: Läuft das Nachrechnen der verpassten Zeit, wird nicht gespeichert –
// sonst stünde im Spielstand eine neue Uhrzeit zu einer alten Fabrik. Der
// alte Spielstand bleibt; beim nächsten Öffnen wird von dort nachgerechnet.
let catchUpJob = null;
// v0.16.0: einmal Bescheid sagen, wenn ein Beet reif wird
const ripeCount = () => state.buildings.filter((b) => productionOf(b.type)?.kind === 'garden' && isRipe(b)).length;
let lastRipe = ripeCount();
function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  if (!resetting && !catchUpJob) saveGame(state);
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
// v0.15.0: oder mit dem Test-Knopf als erledigt gewertet (skipped)
function onQuestDone({ gold, xp, skipped }) {
  onChange();
  panels.toast(
    skipped
      ? `Test: Auftrag als erledigt gewertet – +${numberFormat.format(xp)} Erfahrung, keine Waren, kein Gold.`
      : `Auftrag erledigt: +${numberFormat.format(xp)} Erfahrung, +${numberFormat.format(gold)} Gold.`,
    3000,
  );
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
const offlineView = createOfflineView({ panels });
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
    from < 10 ? 'Neu: Lagerhäuser lassen sich aus dem Laden-Lager befüllen, Bänder lassen sich leeren.' : '',
    from < 11 ? 'Neu: Aufträge der Bewohner – tippe oben auf „Laden-Level“. Einige Waren heißen jetzt anders, z. B. Mechanischer Schalter → Räderwerk, Mini-Schloss → Vorhängeschloss.' : '',
    from < 12
      ? 'Neu: Deine Fabrik läuft weiter, wenn das Spiel zu ist – bis Rohstoffe, Zutaten oder Theken leer sind. In Holzfällerlager, Steinbruch und Schmelzhütte passen jetzt 3 Rohstoffe („⏫ Auffüllen“). Lagerhäuser befüllst du von Hand.'
      : '',
    from < 13 ? 'Neu: Level 7 „Die Heilstube“ – Beet, Erntebank und Webstube. Aus Leinsamen wachsen Flachspflanzen, daraus werden Fasern und Verbände.' : '',
    from < 14
      ? 'Neu: Level 8 „Der Kräutergarten“ – Ringelblumen im Beet und die Kräuterstube für Heilverbände und Kräuterkompressen. Die Flachsbreche heißt jetzt Erntebank und verarbeitet alle Pflanzen.'
      : '',
    ...(loaded.notes ?? []),
    loaded.counterNote ?? '',
  ].filter(Boolean);
  panels.toast(notes.join(' '), 9000);
} else if (loaded.status === 'ok' && loaded.counterNote) panels.toast(`Spielstand geladen. ${loaded.counterNote}`, 6000);
else if (loaded.status === 'ok') panels.toast('Spielstand geladen.', 1600);
else if (loaded.status === 'invalid') panels.toast('Spielstand war beschädigt – neues Spiel gestartet.', 3500);

// ---------- Spiel im Hintergrund (v0.14.0) ----------
// War das Spiel zu oder die App im Hintergrund, wird die verpasste Zeit
// nachgerechnet – in Portionen, damit der Bildschirm nicht einfriert. Dauert
// es länger als ein Bild, erscheint ein Hinweis mit Fortschritt.

const CATCH_UP_MS = 30; // so lange je Bild nachrechnen

function beginCatchUp(seconds) {
  if (!(seconds > 0)) return;
  if (catchUpJob) extendCatchUp(catchUpJob, seconds);
  else catchUpJob = startCatchUp(state, seconds);
}

// Rechnet eine Portion; gibt true zurück, wenn alles nachgeholt ist.
function continueCatchUp() {
  const start = performance.now();
  let finished = false;
  do finished = runCatchUp(catchUpJob, 200);
  while (!finished && performance.now() - start < CATCH_UP_MS);
  if (!finished) {
    offlineView.showProgress(catchUpJob.seconds, catchUpProgress(catchUpJob));
    return false;
  }
  const report = offlineReport(catchUpJob);
  catchUpJob = null;
  lastRipe = ripeCount(); // reife Beete nennt schon der Bericht
  offlineView.hideProgress();
  if (report.seconds >= OFFLINE.toastSeconds) {
    controller.closeInfo();
    offlineView.report(report);
  }
  onChange();
  saveNow();
  return true;
}

// Beim Öffnen: Zeit seit dem letzten Speichern nachrechnen
if (loaded.status === 'ok' && loaded.savedAt > 0) beginCatchUp((Date.now() - loaded.savedAt) / 1000);

// ---------- Takt ----------
// Die Simulation läuft in festen Takten (TICK). Pro Bild werden so viele Takte
// gerechnet, wie Zeit vergangen ist. Ist das Spiel im Hintergrund, ruht es;
// beim Zurückkommen wird die verpasste Zeit nachgerechnet (siehe oben).

let lastTime = performance.now();
let lastWall = Date.now(); // Uhrzeit des letzten Bildes – erkennt Pausen im Hintergrund
let accumulator = 0;
let lastRefresh = 0;
let lastGifts = state.market.gifts;
// v0.13.0: einmal Bescheid sagen, wenn der aktuelle Auftrag abgegeben werden kann
const questKey = () => `${state.shopLevel}|${state.quest.index}`;
let questReadyKey = canDeliver(state) ? questKey() : null;

function frame(now) {
  const realDt = Math.min(0.25, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;
  // v0.14.0: Lange kein Bild (App im Hintergrund, Gerät im Standby) – die
  // Zeit dazwischen wird nachgerechnet, in normaler Geschwindigkeit.
  const wall = Date.now();
  const gap = (wall - lastWall) / 1000;
  lastWall = wall;
  if (gap > OFFLINE.gapSeconds || (catchUpJob && gap > 0)) beginCatchUp(gap);
  if (catchUpJob) {
    accumulator = 0;
    continueCatchUp();
  } else {
    accumulator += realDt * (settings.testMode ? TEST_SPEED : 1);
    let steps = 0;
    while (accumulator >= TICK && steps < 200) {
      tick(state);
      accumulator -= TICK;
      steps++;
    }
    if (steps === 200) accumulator = 0;
  }
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
    const ripe = ripeCount();
    if (ripe > lastRipe) {
      panels.toast(`🌾 ${ripe === 1 ? 'Ein Beet ist reif – tippe es' : `${ripe} Beete sind reif – tippe sie`} an und ernte, dann neu säen.`, 5000);
    }
    lastRipe = ripe;
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
  // v0.14.0: so tun, als wäre das Spiel so lange zu gewesen
  away(seconds) {
    beginCatchUp(seconds);
  },
  isCatchingUp: () => Boolean(catchUpJob),
  // v0.13.0: für den Browser-Test – Erfahrung, die das aktuelle Level zum Aufstieg braucht
  xpNeeded: () => xpNeeded(state.shopLevel),
  currentQuest: () => currentQuest(state),
};
