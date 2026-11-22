// 3D-Test: Kenneys 3D-Modelle (CC0, www.kenney.nl). Tobias hat die Pakete
// heruntergeladen und hochgeladen (Chat 23); im Projekt liegen nur die
// Modelle, die der 3D-Test braucht (assets/kenney/).
//
// Lädt die Modelle und Farbtafeln und setzt jedem Modell ein gemeinsames
// Material je Paket und Farbwahl. Welche Modelle und wie umgefärbt wird,
// steht in kenneyParts.js.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { KENNEY_DIR, MODELS, PALETTES, recolorPixels } from './kenneyParts.js';

// ---------- Laden ----------

function canvasTexture(image, paint) {
  const c = document.createElement('canvas');
  c.width = image.width;
  c.height = image.height;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(image, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height);
  paint(img.data, c.width, c.height);
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false; // wie die Texturen in glTF-Dateien
  return tex;
}

// Lädt alle Modelle und Farbtafeln. onProgress(geladen, gesamt).
// Ergebnis: Bibliothek mit place(kit, name, { variant, color }).
export async function loadModels(onProgress = () => {}) {
  const loader = new GLTFLoader();
  const imageLoader = new THREE.ImageLoader();
  const kits = Object.keys(MODELS);
  const total = kits.reduce((n, kit) => n + MODELS[kit].length + 1, 0);
  let done = 0;
  const step = () => onProgress(++done, total);

  // Die Texturen der Modelle selbst werden nicht gebraucht (wir setzen eigene
  // Materialien) – der Zwischenspeicher lädt die Farbtafel trotzdem nur einmal.
  const wasCaching = THREE.Cache.enabled;
  THREE.Cache.enabled = true;
  const images = {};
  const scenes = {};
  try {
    await Promise.all(
      kits.flatMap((kit) => [
        imageLoader.loadAsync(`${KENNEY_DIR}/${kit}/Textures/colormap.png`).then((img) => {
          images[kit] = img;
          step();
        }),
        ...MODELS[kit].map((name) =>
          loader.loadAsync(`${KENNEY_DIR}/${kit}/${name}.glb`).then((gltf) => {
            scenes[`${kit}/${name}`] = gltf.scene;
            step();
          }),
        ),
      ]),
    );
  } finally {
    THREE.Cache.enabled = wasCaching;
  }
  // Die mitgeladenen Texturen der Modelle wegwerfen
  for (const scene of Object.values(scenes)) {
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.material.map?.dispose();
      o.material.dispose();
    });
  }
  return createLibrary(images, scenes);
}

function createLibrary(images, scenes) {
  const materials = new Map(); // "kit|variant|farbe" → Material

  function material(kit, variant, color) {
    const rules = variant === 'kenney' ? null : PALETTES[kit]?.[variant];
    const key = rules ? `${kit}|${variant}|${color ?? ''}` : `${kit}|kenney`;
    if (materials.has(key)) return materials.get(key);
    const map = canvasTexture(images[kit], (data, w, h) => {
      if (rules) recolorPixels(data, w, h, rules, color);
    });
    const m = new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0 });
    materials.set(key, m);
    return m;
  }

  // Ein Modell als neue Gruppe (teilt die Formen mit dem Original).
  // variant: 'kenney' (Originalfarben), 'spiel' (mit color = Farbe des Reiters)
  // oder eine andere Farbtafel des Pakets (z. B. 'holz' für die Bänder).
  function place(kit, name, { variant = 'kenney', color = null, shadow = true } = {}) {
    const source = scenes[`${kit}/${name}`];
    if (!source) throw new Error(`Modell fehlt: ${kit}/${name}`);
    const obj = source.clone(true);
    const mat = material(kit, variant, color);
    obj.traverse((o) => {
      if (!o.isMesh) return;
      o.material = mat;
      o.castShadow = shadow;
      o.receiveShadow = true;
    });
    return obj;
  }

  return {
    place,
    count: () => Object.keys(scenes).length,
  };
}
