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
import { COUNTERS, TEST_PACK } from './core/data/shop.js';
import { ITEMS } from './core/data/items.js';
import { LAND } from './core/data/land.js';
import { canLevelUp } from './core/levels.js';
import { canDeliver, currentQuest, xpNeeded } from './core/quests.js';
import { storageCapacity } from './core/shop.js';
import { isRipe, productionOf } from './core/production.js';
import { createLevelView, unlockText } from './view/levels.js';
import { costText, numberFormat } from './view/format.js';
import { redrawItemIcons } from './view/itemArt.js';
import {
  TEST_3D_SLOT,
  clearGame,
  loadGame,
  loadSettings,
  rememberLoadedFile,
  replaceGame,
  saveGame,
  saveSettings,
  takeLoadedFile,
  useSaveSlot,
} from './view/storage.js';
import { createBackup } from './view/backup.js';
import { OFFLINE } from './core/data/offline.js';
import { catchUpProgress, extendCatchUp, offlineReport, runCatchUp, startCatchUp } from './core/offline.js';
import { createOfflineView } from './view/offline.js';
import { onPress } from './view/press.js';

// v0.34.0: 3D-Test (Tobias, Chat 24) – index.html?ansicht=3d zeigt das Spiel
// in 3D mit einem eigenen Spielstand ab Level 1; die echte Fabrik (2D) bleibt
// unberührt. Spielregeln, Steuerung und Fenster sind dieselben.
const VIEW_3D = new URLSearchParams(location.search).get('ansicht') === '3d';
if (VIEW_3D) useSaveSlot(TEST_3D_SLOT);

const loaded = loadGame();
const state = loaded.status === 'ok' ? loaded.state : createNewGame();

const canvas = document.getElementById('game');
const ui = { mode: 'normal', selected: null, ghost: null, beltPreview: null, simAlpha: 0 };
const settings = loadSettings();
const TEST_SPEED = 10;
const camera = createCamera();
const view3d = VIEW_3D ? await start3d() : null;
const renderer = view3d ?? createRenderer(canvas);
const panels = createPanels();

// v0.34.0: Lädt three.js und Kenneys Modelle (nur im 3D-Test) und zeigt so
// lange „Lädt die 3D-Ansicht …“. Klappt das nicht, bleibt eine Meldung mit
// dem Weg zurück zur echten Fabrik stehen.
async function start3d() {
  window.__loading3d = true;
  const box = document.getElementById('catchup');
  const text = document.getElementById('catchup-text');
  const fill = document.getElementById('catchup-fill');
  box.querySelector('.catchup-icon').textContent = '🧊';
  text.textContent = '3D-Test: Lädt die Modelle …';
  fill.style.width = '0%';
  box.hidden = false;
  try {
    const { createView3d } = await import('./view3d/view3d.js');
    const view = await createView3d({
      canvas,
      onProgress(done, total) {
        text.textContent = `3D-Test: Lädt die Modelle … ${done} / ${total}`;
        fill.style.width = `${Math.round((done / total) * 100)}%`;
      },
    });
    box.hidden = true;
    box.querySelector('.catchup-icon').textContent = '⏩';
    return view;
  } catch (err) {
    text.textContent = '⚠️ Die 3D-Ansicht konnte nicht laden. Bitte neu laden – oder über index.html zurück zur echten Fabrik.';
    throw err;
  } finally {
    window.__loading3d = false;
  }
}

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

// v0.22.0: Vor dem Neuanfang fragen, ob die Fabrik erst gesichert werden soll.
async function newGame() {
  const choice = await panels.confirm({
    title: 'Neues Spiel starten?',
    text: 'Deine Fabrik wird gelöscht und du beginnst von vorn. Willst du sie behalten, sichere sie vorher als Datei.',
    okLabel: 'Neues Spiel',
    danger: true,
    altLabel: '💾 Erst sichern',
  });
  if (choice === 'alt') {
    if (!(await backup.save())) return;
    const ok = await panels.confirm({
      title: 'Gesichert – jetzt neues Spiel starten?',
      text: 'Deine Fabrik liegt jetzt als Datei vor. Mit „📂 Spielstand laden“ im Menü holst du sie zurück.',
      okLabel: 'Neues Spiel',
      danger: true,
    });
    if (!ok) return;
  } else if (choice !== true) return;
  resetting = true;
  clearTimeout(saveTimer);
  clearGame();
  location.reload();
}

// v0.22.0: Spielstand als Datei sichern und laden. Beim Laden ersetzt die
// Datei den Spielstand im Browser, dann startet die Seite neu und holt – wie
// beim normalen Öffnen – die Zeit seit dem Sichern nach.
const backup = createBackup({
  panels,
  getState: () => state,
  isBusy: () => Boolean(catchUpJob),
  onReplace(text, fileName) {
    saveNow(); // damit die Sicherheitskopie des jetzigen Spielstands aktuell ist
    resetting = true;
    clearTimeout(saveTimer);
    if (!replaceGame(text)) {
      resetting = false;
      panels.toast('Laden hat nicht geklappt – der Browser lässt nichts speichern.', 5000);
      return;
    }
    rememberLoadedFile(fileName);
    location.reload();
  },
});

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
  panels.toast(
    `Testpaket: ${numberFormat.format(TEST_PACK.gold)} Gold und von jeder freigeschalteten Ware ${TEST_PACK.each} Stück (Kombi-Teile je ${TEST_PACK.eachAdvanced}) ins Laden-Lager gelegt.`,
  );
}

// ---------- Laden-Level (v0.9.0) ----------

let levelReady = canLevelUp(state);
function onLevelUp({ level, gift, moreLand }) {
  levelReady = false;
  // v0.27.0: Bringt das Level mehr Fläche, zeigt die Karte die ganze Welt –
  // so sieht man die neuen Schilder „＋ Fläche kaufen“ am Rand.
  if (moreLand && view3d) view3d.cam.fitRect(state.world, { padBottom: buildBar.bottomCover() });
  else if (moreLand) fitRect(camera, worldRect(), 36, worldBounds());
  onChange();
  buildBar.updateCosts(state);
  const tip = moreLand ? ' Tippe auf die ＋-Schilder am Rand.' : '';
  // v0.28.0: Ab Level 11 gibt es kein Geschenk mehr (Tobias).
  const giftText = costText(gift) ? ` Gratis im Laden-Lager: ${costText(gift)}.` : '';
  panels.toast(`Laden-Level ${level}! Neu: ${unlockText(level)}.${giftText}${tip}`, moreLand ? 9000 : 6000);
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
  onSaveFile: () => {
    controller.closeInfo();
    backup.save();
  },
  onLoadFile: () => backup.pickFile(),
  // v0.32.0: Grafik-Probe – erst speichern, dann die eigene Seite öffnen
  onProbe: () => {
    saveNow();
    location.href = 'grafik-probe.html';
  },
  // v0.34.0: 3D-Test (eigener Spielstand) – erst speichern, dann wechseln
  is3d: VIEW_3D,
  onSwitch3d: () => {
    saveNow();
    location.href = VIEW_3D ? 'index.html' : 'index.html?ansicht=3d';
  },
});
hud.setTestMode(Boolean(settings.testMode), TEST_SPEED);

// v0.18.0: Unten bekommt die Karte so viel Platz, wie die Bauleiste samt
// Reitern hoch ist – so lässt sich auch die unterste Reihe darüber schieben.
// v0.27.0 (Tobias): rechts so viel, wie das Infofenster breit ist (wie in
// style.css: min(320px, 42vw) plus Rand) – so verdeckt es kein Gebäude am Rand.
function worldBounds() {
  const w = state.world;
  const padRight = Math.min(320, 0.42 * canvas.clientWidth) + 24;
  return { x: w.x * TILE, y: w.y * TILE, width: w.width * TILE, height: w.height * TILE, padBottom: buildBar.bottomCover(), padRight };
}

// v0.34.0: Ausschnitt beim Öffnen des 3D-Tests – die Gebäude in der Mitte,
// mit Platz drumherum (mindestens 16 × 10 Felder, höchstens die Welt)
function startRect3d() {
  const p = state.plot;
  const w = state.world;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const b of state.buildings) {
    x0 = Math.min(x0, b.x);
    y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + 2);
    y1 = Math.max(y1, b.y + 2);
  }
  if (!Number.isFinite(x0)) return { ...p };
  const grow = (a, b, min, lo, hi) => {
    let from = a - 3;
    let to = b + 3;
    if (to - from < min) {
      const extra = (min - (to - from)) / 2;
      from -= extra;
      to += extra;
    }
    from = Math.max(lo, from);
    to = Math.min(hi, to);
    return [from, to];
  };
  const [rx0, rx1] = grow(x0, x1, 16, w.x, w.x + w.width);
  const [ry0, ry1] = grow(y0, y1, 10, w.y, w.y + w.height);
  return { x: rx0, y: ry0, width: rx1 - rx0, height: ry1 - ry0 };
}

function plotRect() {
  const p = state.plot;
  return { x: p.x * TILE, y: p.y * TILE, width: p.width * TILE, height: p.height * TILE };
}

function worldRect() {
  const w = state.world;
  return { x: w.x * TILE, y: w.y * TILE, width: w.width * TILE, height: w.height * TILE };
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
  // v0.18.0: Der zuletzt geöffnete Reiter bleibt gemerkt.
  initialTab: settings.buildTab,
  onTabChange(tab) {
    settings.buildTab = tab;
    saveSettings(settings);
  },
});
const shopView = createShopView({ state, panels, onChange });
const offlineView = createOfflineView({ panels });
const warehouseView = createWarehouseView({ state, panels, onChange });
controller = createController({
  state,
  camera: view3d ? view3d.cam : camera,
  ui,
  panels,
  buildBar,
  shopView,
  warehouseView,
  onChange,
  requestDraw,
  worldBounds,
  // v0.34.0: im 3D-Test fragt die Steuerung die 3D-Kamera
  ...(view3d ? { tileAt: (x, y) => view3d.cam.tileAt(x, y), panScreen: (dx, dy) => view3d.cam.panBy(dx, dy) } : {}),
});
buildBar.setMode('normal');
panels.setInfoCloseHandler(() => controller.closeInfo());

attachInput(canvas, {
  onTap: (x, y) => controller.onTap(x, y),
  onDragStart: (x, y) => controller.onDragStart(x, y),
  onDragMove: (x, y, dx, dy) => controller.onDragMove(x, y, dx, dy),
  onDragEnd: (x, y) => controller.onDragEnd(x, y),
  onDragCancel: () => controller.onDragCancel(),
  onPan(dx, dy) {
    if (view3d) view3d.cam.panBy(dx, dy);
    else panBy(camera, dx, dy, worldBounds());
    requestDraw();
  },
  onZoom(x, y, factor) {
    if (view3d) view3d.cam.zoomAt(x, y, factor);
    else zoomAt(camera, x, y, factor, worldBounds());
    requestDraw();
  },
  // v0.34.0: zwei Finger umeinander drehen die 3D-Kamera
  ...(view3d ? { onRotate: (angle) => view3d.cam.rotate(angle) } : {}),
  onInteract: () => hud.hideHint(),
});

// v0.34.0: 3D-Test – Knöpfe ⟲ ⟳ (oben links) und Tasten Q/E drehen um 45°.
if (view3d) {
  document.body.classList.add('view-3d');
  document.getElementById('turn-buttons').hidden = false;
  onPress(document.getElementById('btn-turn-left'), () => view3d.turn(-1));
  onPress(document.getElementById('btn-turn-right'), () => view3d.turn(1));
  document.getElementById('hint').textContent = 'Ziehen: verschieben · Zwei Finger: zoomen und drehen · Gebäude antippen';
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') controller.back();
  // v0.11.0 (Tobias spielt mit Tastatur am Tablet): R dreht die Vorschau beim
  // Bauen und Verschieben, sonst das ausgewählte Gebäude oder Band.
  // Strg+R (neu laden) bleibt, wie es ist.
  const typing = event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable]');
  if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.repeat && !typing) {
    if (controller.rotateKey()) event.preventDefault();
  }
  // v0.34.0: Q/E drehen die 3D-Kamera
  const key = event.key.toLowerCase();
  if (view3d && (key === 'q' || key === 'e') && !event.ctrlKey && !event.metaKey && !event.altKey && !typing) {
    view3d.turn(key === 'q' ? -1 : 1);
    event.preventDefault();
  }
});

// v0.10.2: Zurück aus dem Hintergrund (z. B. App minimiert) – der Browser kann
// die kleinen Warenbilder weggeworfen haben, also alle neu zeichnen.
// v0.21.0: ebenso die zwischengespeicherten Warenbilder auf der Karte.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    redrawItemIcons();
    renderer.clearCache();
  }
});
window.addEventListener('pageshow', () => {
  redrawItemIcons();
  renderer.clearCache();
});

function handleResize() {
  const size = renderer.resize();
  buildBar.resize();
  if (view3d) {
    // v0.34.0: Beim ersten Mal die Gebäude mit etwas Platz drumherum ins Bild
    // holen (mindestens 16 × 10 Felder, höchstens das Grundstück)
    if (!view3d.fitted && size.width > 0) {
      view3d.fitted = true;
      view3d.cam.setBounds(state.world);
      view3d.cam.fitRect(startRect3d(), { padding: 16, padBottom: buildBar.bottomCover() });
    }
    requestDraw();
    return;
  }
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

// v0.22.0: Spielstand gerade aus einer Datei geladen? Dann sagt das
// Nachrechnen „Seit dem Sichern …“ statt „Du warst … weg“.
const loadedFile = loaded.status === 'ok' ? takeLoadedFile() : null;
let catchUpFromFile = Boolean(loadedFile);

if (loaded.status === 'ok' && loaded.migratedFrom) {
  const from = loaded.migratedFrom;
  const notes = [
    'Spielstand übernommen.',
    from < 5 ? 'Neu: Handel! Im Laden gibt es jetzt Theken und den Händler; Bauen kostet Waren aus dem Laden-Lager.' : '',
    from === 5 ? 'Neu: Die Schmiede macht Eisenstangen statt Nägel.' : '',
    from < 7 ? 'Neu: Fläche kaufen – tippe auf die ＋-Schilder am Rand. Deine Fabrik hat Laden-Level 3, alles bleibt freigeschaltet.' : '',
    from < 8 ? 'Neu: Startkapital – du bekommst es einmalig nachgezahlt.' : '',
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
    from < 16
      ? `Neu: Alle Preise sind durch 3 geteilt – ein Holzblock kostet ${ITEMS.holzblock.price} Gold, ein Zirkel ${numberFormat.format(ITEMS.zirkel.price)}. Dein Gold ist mit umgerechnet und genauso viel wert wie vorher.`
      : '',
    from < 17
      ? `Neu: Jede Theke hat ihre eigenen Kunden, und ab Level 4 kaufen sie langsamer. Jeder Laden beginnt mit ${COUNTERS.start} Theken – weitere kaufst du mit Gold im Laden, Reiter „Theken“ (die ${COUNTERS.start + 1}. für ${numberFormat.format(COUNTERS.prices[0])} Gold).`
      : '',
    ...(loaded.notes ?? []),
    loaded.counterNote ?? '',
  ].filter(Boolean);
  const text = [loadedFile ? `Spielstand „${loadedFile}“ geladen.` : '', ...notes].filter(Boolean).join(' ');
  // v0.24.0: Lange Hinweise bleiben länger stehen (etwa 20 Zeichen pro Sekunde).
  panels.toast(text, Math.max(9000, text.length * 50));
} else if (loadedFile) panels.toast(`Spielstand „${loadedFile}“ geladen.${loaded.counterNote ? ` ${loaded.counterNote}` : ''}`, 5000);
else if (loaded.status === 'ok' && loaded.counterNote) panels.toast(`Spielstand geladen. ${loaded.counterNote}`, 6000);
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
    offlineView.showProgress(catchUpJob.seconds, catchUpProgress(catchUpJob), catchUpFromFile);
    return false;
  }
  const report = offlineReport(catchUpJob);
  catchUpJob = null;
  lastRipe = ripeCount(); // reife Beete nennt schon der Bericht
  offlineView.hideProgress();
  if (report.seconds >= OFFLINE.toastSeconds) {
    controller.closeInfo();
    offlineView.report(report, catchUpFromFile);
  }
  catchUpFromFile = false;
  onChange();
  saveNow();
  return true;
}

// Beim Öffnen: Zeit seit dem letzten Speichern nachrechnen
if (loaded.status === 'ok' && loaded.savedAt > 0) beginCatchUp((Date.now() - loaded.savedAt) / 1000);
if (!catchUpJob) catchUpFromFile = false; // nichts nachzuholen (Datei gerade erst gesichert)

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

// v0.21.0 (Belastungstest): Bilder pro Sekunde zählen – im Testmodus oben zu sehen,
// damit Tobias auf dem Tablet selbst sieht, wie flüssig es läuft.
const fps = { frames: 0, since: performance.now(), value: 0 };

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
  fps.frames++;
  if (now - fps.since >= 1000) {
    fps.value = (fps.frames * 1000) / (now - fps.since);
    fps.frames = 0;
    fps.since = now;
    if (settings.testMode) hud.setFps(fps.value);
  }

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
  camera: view3d ? view3d.cam : camera,
  ui,
  // v0.34.0: für den Browser-Test des 3D-Tests
  view3d: view3d
    ? {
        // Bildschirmpunkt (Seite) der Mitte eines Felds am Boden bzw. über einem Gebäude
        tile(x, y) {
          const r = canvas.getBoundingClientRect();
          const p = view3d.cam.screenOf(x + 0.5, 0, y + 0.5);
          return { x: r.left + p.x, y: r.top + p.y };
        },
        building(id, height = 0.4) {
          const b = state.buildings.find((item) => item.id === id);
          if (!b) return null;
          const r = canvas.getBoundingClientRect();
          const c = view3d.world.buildingTop(id);
          const p = view3d.cam.screenOf(c.x, height, c.z);
          return { x: r.left + p.x, y: r.top + p.y };
        },
        // v0.35.0: Bildschirmpunkt (Seite) eines Schilds „＋ Fläche“
        landSign(side) {
          const sign = view3d.world.landSigns().find((item) => item.side === side);
          if (!sign) return null;
          const r = canvas.getBoundingClientRect();
          const p = view3d.cam.screenOf(sign.x, sign.y, sign.z);
          return { x: r.left + p.x, y: r.top + p.y };
        },
        landSigns: () => view3d.world.landSigns(),
        areaCounts: () => view3d.world.areaCounts(),
        tileAt: (x, y) => view3d.cam.tileAt(x, y),
        yaw: () => view3d.cam.yaw,
        distance: () => view3d.cam.distance,
        target: () => [view3d.cam.target.x, view3d.cam.target.z],
        isTurning: () => view3d.isTurning(),
        counts: () => view3d.world.counts(),
        sign: (id) => view3d.world.signOf(id),
        shimmer: (id) => view3d.world.shimmerOf(id),
        wheel: (id) => view3d.world.wheelOf(id),
        hasGhost: () => view3d.world.hasGhost(),
        overlayCount: () => view3d.world.overlayCount(),
        models: () => view3d.models(),
      }
    : null,
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
  // v0.20.0: für den Browser-Test – Plätze im Laden-Lager
  storageCapacity: () => storageCapacity(state),
  // v0.21.0: für den Browser-Test – zuletzt gemessene Bilder pro Sekunde
  fps: () => fps.value,
};
