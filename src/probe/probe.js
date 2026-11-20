// v0.32.0: Grafik-Probe – die Seite grafik-probe.html. Verbindet die kleine
// Fabrik (factory.js, echte Spielregeln) mit der 3D-Welt (world3d.js) und der
// Bedienung: verschieben, zoomen, in der freien Kamera drehen, Gebäude
// antippen; Schalter für Kamera, Stil, Effekte und Tag/Abend.
//
// Tobias (Chat 22): „In erster linie geht es mir darum, dass ich einfach mal
// sehen kann, was alles möglich ist.“
//
// v0.33.0 (Teil 2): lädt zuerst Kenneys Modelle (models.js, mit Anzeige
// „Lädt …“); neuer Schalter „Farben: Kenney ↔ Spiel“.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { BUILDINGS } from '../core/data/buildings.js';
import { tick, TICK } from '../core/sim.js';
import { VERSION } from '../version.js';
import { onPress } from '../view/press.js';
import { createProbeFactory, keepRunning, PROBE_AREA } from './factory.js';
import { loadModels } from './models.js';
import { createWorld } from './world3d.js';

const canvas = document.getElementById('probe-canvas');
const labelBox = document.getElementById('probe-label');
const fpsBox = document.getElementById('probe-fps');
const loadingBox = document.getElementById('probe-loading');
document.getElementById('probe-version').textContent = `v${VERSION}`;

// ---------- Modelle laden ----------

let lib;
try {
  lib = await loadModels((done, total) => {
    loadingBox.textContent = `⏳ Lädt die Modelle … ${done} / ${total}`;
  });
} catch (err) {
  loadingBox.textContent = '⚠️ Die Modelle konnten nicht geladen werden. Bitte die Seite neu laden.';
  throw err;
}
loadingBox.hidden = true;

// ---------- Fabrik und Welt ----------

const { state, origin } = createProbeFactory();
const area = PROBE_AREA;
const world = createWorld({ state, origin, area, lib });
// etwas nach hinten, weil die obere Leiste den oberen Rand verdeckt
const center = new THREE.Vector3(area.width / 2 - 0.25, 0, area.height / 2 - 0.75);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
world.applyEffects(renderer);

// ---------- Kameras ----------

// Schräg wie Clash of Clans: feste Blickrichtung von schräg oben, ohne
// Fluchtpunkt (parallele Linien bleiben parallel). Frei: mit Perspektive,
// mit zwei Fingern drehen.
const VIEW_HEIGHT = 10.5; // so viele Felder passen bei Zoom 1 senkrecht ins Bild
const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
const persp = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
const ISO_DIR = new THREE.Vector3(Math.SQRT1_2, 0.82, Math.SQRT1_2).normalize();
let camera = ortho;
let controls = null;

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  const aspect = w / Math.max(1, h);
  // Auf dem Handy quer nimmt die obere Leiste mehr Platz ein – dort etwas mehr Welt zeigen
  const view = h < 500 ? VIEW_HEIGHT * 1.1 : VIEW_HEIGHT;
  ortho.left = (-view * aspect) / 2;
  ortho.right = (view * aspect) / 2;
  ortho.top = view / 2;
  ortho.bottom = -view / 2;
  ortho.updateProjectionMatrix();
  persp.aspect = aspect;
  persp.updateProjectionMatrix();
}

function useCamera(mode) {
  const target = controls ? controls.target.clone() : center.clone();
  controls?.dispose();
  if (mode === 'schraeg') {
    camera = ortho;
    ortho.position.copy(target).addScaledVector(ISO_DIR, 40);
    ortho.lookAt(target);
  } else {
    camera = persp;
    const dir = new THREE.Vector3(0.45, 0.62, 0.65).normalize();
    persp.position.copy(target).addScaledVector(dir, 19);
    persp.lookAt(target);
  }
  controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.screenSpacePanning = false; // verschieben über den Boden
  controls.enableDamping = world.settings.effects;
  controls.dampingFactor = 0.12;
  if (mode === 'schraeg') {
    controls.enableRotate = false;
    controls.minZoom = 0.55;
    controls.maxZoom = 3;
    controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };
    controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  } else {
    controls.enableRotate = true;
    controls.minDistance = 5;
    controls.maxDistance = 34;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = 1.32; // nicht unter den Boden
    controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
    controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
  }
  controls.update();
  settings.camera = mode;
}

// Die Kamera bleibt über der Fabrik
function clampTarget() {
  const t = controls.target;
  const nx = THREE.MathUtils.clamp(t.x, -1, area.width + 1);
  const nz = THREE.MathUtils.clamp(t.z, -1, area.height + 1);
  if (nx !== t.x || nz !== t.z) {
    camera.position.x += nx - t.x;
    camera.position.z += nz - t.z;
    t.x = nx;
    t.z = nz;
  }
}

// Freie Kamera: in 45°-Schritten um die Fabrik drehen (Knöpfe ⟲ ⟳)
function turn(angle) {
  const offset = camera.position.clone().sub(controls.target);
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
  camera.position.copy(controls.target).add(offset);
  camera.lookAt(controls.target);
  controls.update();
}

// ---------- Schalter ----------

const settings = world.settings;
settings.camera = 'schraeg';

// Text in [ ] fällt auf dem Handy weg (sonst passt die Leiste nicht in eine Zeile)
const LABELS = {
  kamera: { schraeg: '📐 Schräg[ (wie Clash of Clans)]', frei: '🎥 Frei drehbar' },
  stil: { mittelalter: '🏰 Mittelalter', modern: '🏭 Modern' },
  farben: { kenney: '🎨 Farben: Kenney', spiel: '🎨 Farben: Spiel' },
  effekte: { true: '✨ Effekte an', false: '◻️ Effekte aus' },
  licht: { tag: '☀️ Tag', abend: '🌙 Abend' },
};
const buttons = {};
for (const key of Object.keys(LABELS)) buttons[key] = document.querySelector(`[data-probe="${key}"]`);
const turnButtons = [...document.querySelectorAll('[data-probe="links"], [data-probe="rechts"]')];

function setLabel(button, text) {
  const [main, long = ''] = text.split(/\[|\]/);
  const extra = document.createElement('span');
  extra.className = 'probe-long';
  extra.textContent = long.replace(/^ /, '\u00a0'); // Leerzeichen am Anfang bliebe im Knopf sonst weg
  button.replaceChildren(main, extra);
}

function refreshButtons() {
  setLabel(buttons.kamera, LABELS.kamera[settings.camera]);
  buttons.stil.textContent = LABELS.stil[settings.style];
  buttons.farben.textContent = LABELS.farben[settings.colors];
  buttons.effekte.textContent = LABELS.effekte[settings.effects];
  buttons.licht.textContent = LABELS.licht[settings.light];
  for (const b of turnButtons) b.hidden = settings.camera !== 'frei';
}

onPress(buttons.kamera, () => {
  useCamera(settings.camera === 'schraeg' ? 'frei' : 'schraeg');
  refreshButtons();
});
onPress(buttons.stil, () => {
  world.setStyle(settings.style === 'mittelalter' ? 'modern' : 'mittelalter');
  hideLabel();
  refreshButtons();
});
onPress(buttons.farben, () => {
  world.setColors(settings.colors === 'kenney' ? 'spiel' : 'kenney');
  hideLabel();
  refreshButtons();
});
onPress(buttons.effekte, () => {
  settings.effects = !settings.effects;
  world.applyEffects(renderer);
  controls.enableDamping = settings.effects;
  refreshButtons();
});
onPress(buttons.licht, () => {
  settings.light = settings.light === 'tag' ? 'abend' : 'tag';
  world.applyLight();
  refreshButtons();
});
onPress(document.querySelector('[data-probe="hinweis"]'), () => {
  document.querySelector('.probe-hint').hidden = true;
});
onPress(document.querySelector('[data-probe="links"]'), () => turn(Math.PI / 4));
onPress(document.querySelector('[data-probe="rechts"]'), () => turn(-Math.PI / 4));

// ---------- Gebäude antippen ----------

let labelFor = null;
let labelTime = 0;

function hideLabel() {
  labelBox.hidden = true;
  labelFor = null;
}

function showLabel(view) {
  const def = BUILDINGS[view.building.type];
  const product = world.productOf(view.building);
  labelBox.replaceChildren();
  const title = document.createElement('strong');
  title.textContent = `${def.icon} ${def.name}`;
  labelBox.append(title);
  if (product) {
    const sub = document.createElement('span');
    sub.textContent = product;
    labelBox.append(sub);
  }
  labelBox.hidden = false;
  labelFor = view;
  labelTime = 3;
  if (settings.effects) view.bounce = 1;
  placeLabel();
}

function screenOf(view, height = 1.5) {
  const p = view.group.position.clone();
  p.y += height;
  p.project(camera);
  return { x: ((p.x + 1) / 2) * canvas.clientWidth, y: ((1 - p.y) / 2) * canvas.clientHeight };
}

function placeLabel() {
  if (!labelFor) return;
  const { x, y } = screenOf(labelFor);
  labelBox.style.left = `${x}px`;
  labelBox.style.top = `${y}px`;
}

let down = null;
canvas.addEventListener('pointerdown', (e) => {
  down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, multi: down !== null };
});
canvas.addEventListener('pointerup', (e) => {
  if (!down || down.id !== e.pointerId) {
    down = null;
    return;
  }
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  const quick = performance.now() - down.t < 450;
  const wasMulti = down.multi;
  down = null;
  if (moved > 10 || !quick || wasMulti) return;
  const r = canvas.getBoundingClientRect();
  const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  const view = world.pick(camera, ndc);
  if (view) showLabel(view);
  else hideLabel();
});
canvas.addEventListener('pointercancel', () => {
  down = null;
});

// ---------- Schleife ----------

let acc = 0;
let refillTimer = 0;
let last = performance.now();
let frames = 0;
let fpsTime = 0;
let fps = 0;

function frame(now) {
  const dt = Math.min(0.25, (now - last) / 1000);
  last = now;
  acc += dt;
  while (acc >= TICK) {
    tick(state, TICK);
    acc -= TICK;
  }
  refillTimer -= dt;
  if (refillTimer <= 0) {
    keepRunning(state);
    refillTimer = 5;
  }
  world.update(dt, acc / TICK);
  controls.update();
  clampTarget();
  if (labelFor) {
    labelTime -= dt;
    if (labelTime <= 0) hideLabel();
    else placeLabel();
  }
  renderer.render(world.scene, camera);
  frames++;
  fpsTime += dt;
  if (fpsTime >= 1) {
    fps = Math.round(frames / fpsTime);
    fpsBox.textContent = `🎞️ ${fps} Bilder/s`;
    frames = 0;
    fpsTime = 0;
  }
  requestAnimationFrame(frame);
}

resize();
useCamera('schraeg');
refreshButtons();
window.addEventListener('resize', resize);
requestAnimationFrame(frame);

// Für den Browser-Test (tests/browser/smoke.cjs)
window.__probe = {
  ready: true,
  state,
  settings,
  fps: () => fps,
  items: () => world.itemCount(),
  models: () => lib.count(),
  // bewegte Teile eines Gebäudes (Wasserrad bzw. Zahnrad, Roboterarm): Drehwinkel
  motion(type) {
    const view = world.views().find((v) => v.building.type === type);
    if (!view) return null;
    const { wheel, arm } = view.parts;
    const r = (v) => Math.round(v * 1000) / 1000;
    return {
      wheel: wheel ? r(wheel.rotation.x + wheel.rotation.y) : null,
      arm: arm ? r(arm.getObjectByName('element-a').rotation.y + arm.getObjectByName('element-c').rotation.z) : null,
    };
  },
  label: () => (labelBox.hidden ? null : labelBox.textContent),
  // wohin die Kamera schaut (Punkt auf dem Boden) und wie weit gezoomt ist
  target: () => controls.target.toArray().map((v) => Math.round(v * 100) / 100),
  zoom: () => (camera === ortho ? ortho.zoom : persp.position.distanceTo(controls.target)),
  // Bildschirm-Punkt (CSS-Pixel) über der Mitte eines Gebäudes
  screenOf(type) {
    const view = world.views().find((v) => v.building.type === type);
    if (!view) return null;
    const r = canvas.getBoundingClientRect();
    const p = screenOf(view, 0.5);
    return { x: r.left + p.x, y: r.top + p.y };
  },
};
