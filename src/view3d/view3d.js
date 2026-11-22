// v0.34.0: 3D-Test (Tobias, Chat 24) – verbindet die 3D-Welt (scene3d.js),
// die Kamera (camera3d.js) und three.js mit dem Spiel (main.js).
//
// Wird nur im 3D-Test geladen (seit v0.38.0 der Start; die echte Fabrik
// unter index.html?ansicht=2d lädt weder diese Datei noch three.js). Die Spielregeln, die
// Steuerung und alle Fenster bleiben dieselben – nur gezeichnet wird anders.

import * as THREE from 'three';

import { loadModels } from './models.js';
import { createCamera3d, TURN_STEP } from './camera3d.js';
import { createScene3d } from './scene3d.js';

export { TURN_STEP };

// Lädt Kenneys Modelle (onProgress(geladen, gesamt)) und baut die Ansicht.
export async function createView3d({ canvas, onProgress = () => {} }) {
  const lib = await loadModels(onProgress);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const world = createScene3d({ lib });
  const cam = createCamera3d();

  let last = performance.now();
  let worldKey = '';
  let turning = 0; // noch zu drehender Winkel (Knöpfe ⟲ ⟳, Tasten Q/E – weich in ein paar Bildern)
  let viewHeight = 800; // v0.40.0: für „Schilder von weitem“

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    viewHeight = height;
    cam.resize(width, height);
    return { width, height };
  }

  // Ein Bild: Kamera weich weiterdrehen, Welt abgleichen, zeichnen.
  // (gleiche Form wie der 2D-Zeichner: draw(state, camera, ui))
  function draw(state, _camera, ui) {
    const now = performance.now();
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    const w = state.world;
    const key = `${w.x},${w.y},${w.width},${w.height}`;
    if (key !== worldKey) {
      worldKey = key;
      cam.setBounds(w);
    }
    if (turning !== 0) {
      const step = Math.sign(turning) * Math.min(Math.abs(turning), dt * 4.5);
      cam.rotate(step);
      turning -= step;
      if (Math.abs(turning) < 1e-4) turning = 0;
    }
    world.sync(state, ui, dt, cam.distance, viewHeight);
    renderer.render(world.scene, cam.camera);
  }

  // Um 45° drehen (direction = +1 links herum, -1 rechts herum)
  function turn(direction) {
    turning += direction * TURN_STEP;
  }

  return {
    cam,
    world,
    resize,
    draw,
    turn,
    isTurning: () => turning !== 0,
    clearCache() {},
    models: () => lib.count(),
    // v0.40.0: Zeichenaufrufe des letzten Bildes (Schatten mitgezählt)
    drawCalls: () => renderer.info.render.calls,
  };
}
