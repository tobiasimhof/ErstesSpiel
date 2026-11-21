// v0.33.0: Grafik-Probe, Teil 2 – Gebäude, Bänder und Umgebung aus Kenneys
// Modellen (models.js). Mittelalter: Fantasy Town Kit und Castle Kit;
// Modern: Factory Kit. Die Bänder kommen in beiden Stilen aus dem Factory
// Kit, im Mittelalter in Holz umgefärbt (Tobias, Chat 23).
//
// Koordinaten wie in world3d.js: 1 Feld = 1 Einheit, x nach Osten, z nach
// Süden, y nach oben. Ein Gebäude wird um seine Mitte gebaut.

import * as THREE from 'three';

import { BUILDINGS } from '../core/data/buildings.js';
import { BELT_SCALE_Y, BELT_WIDTH, FACE, beltPieces } from './kenneyParts.js';

export { BELT_TOP } from './kenneyParts.js';

const FT = 'fantasy-town-kit';
const CK = 'castle-kit';
const FK = 'factory-kit';

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra });
}

function simpleMesh(geometry, material, { x = 0, y = 0, z = 0, shadow = true } = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

// Setzt ein Modell in eine Gruppe. opts: x, y, z, rot (um die Hochachse),
// scale (Zahl oder [x, y, z]) und die Farbwahl (variant, color).
function put(lib, parent, kit, name, { x = 0, y = 0, z = 0, rot = 0, scale = 1, variant = 'kenney', color = null } = {}) {
  const obj = lib.place(kit, name, { variant, color });
  obj.position.set(x, y, z);
  obj.rotation.y = rot;
  if (Array.isArray(scale)) obj.scale.set(...scale);
  else obj.scale.setScalar(scale);
  parent.add(obj);
  return obj;
}

// ---------- Mittelalter: Häuser aus Wand- und Dachteilen ----------

// Ein Haus aus 2 × 2 Wandfeldern (jedes Teil 1 × 1 × 1) mit Satteldach
// (First von West nach Ost). walls: je Seite die zwei Wandteile (von
// Nord nach Süd bzw. von West nach Ost). Ergebnis: Gruppe, Mitte unten.
function house(lib, colors, color, { walls, roof = 'roof-gable', roofHeight = 1.5 }) {
  const g = new THREE.Group();
  const opts = { variant: colors, color };
  const cells = {
    N: [[-0.5, -0.5], [0.5, -0.5]],
    S: [[-0.5, 0.5], [0.5, 0.5]],
    W: [[-0.5, -0.5], [-0.5, 0.5]],
    E: [[0.5, -0.5], [0.5, 0.5]],
  };
  for (const side of ['N', 'E', 'S', 'W']) {
    cells[side].forEach(([cx, cz], i) => put(lib, g, FT, walls[side][i], { x: cx, z: cz, rot: FACE[side], ...opts }));
  }
  put(lib, g, FT, roof, { y: 1, scale: [2, roofHeight, 2], ...opts });
  return g;
}

// Schornstein aus drei Teilen an der Ostwand des Felds (cx, cz) eines Hauses
function chimney(lib, parent, colors, { cx, cz, scale = 1 }) {
  const opts = { variant: colors };
  const g = new THREE.Group();
  put(lib, g, FT, 'chimney-base', opts);
  put(lib, g, FT, 'chimney', { y: 1, ...opts });
  put(lib, g, FT, 'chimney-top', { y: 2, ...opts });
  g.position.set(cx, 0, cz);
  g.scale.setScalar(scale);
  parent.add(g);
  // Oberkante des Schornsteins (für den Rauch), in Koordinaten der Gruppe parent
  return new THREE.Vector3(cx + 0.34 * scale, 2.63 * scale, cz);
}

function medievalBuilding(lib, building, colors) {
  const g = new THREE.Group();
  const parts = {};
  const color = BUILDINGS[building.type].color;
  const opts = { variant: colors, color };

  switch (building.type) {
    case 'holzfaeller': {
      // kleines Holzhaus hinten rechts am Band, links ein Holzstapel und Baumstümpfe
      const h = house(lib, colors, color, {
        walls: {
          N: ['wall-wood', 'wall-wood'],
          W: ['wall-wood', 'wall-wood-window-shutters'],
          E: ['wall-wood-window-shutters', 'wall-wood'],
          S: ['wall-wood-door', 'wall-wood-window-shutters'],
        },
      });
      h.scale.setScalar(0.72);
      h.position.set(0.26, 0, -0.26);
      g.add(h);
      for (const [x, y, z] of [[-0.25, 0.11, 0.8], [-0.25, 0.11, 0.6], [-0.25, 0.3, 0.7]]) {
        put(lib, g, CK, 'tree-log', { x, y, z, rot: Math.PI / 2, scale: 0.85, ...opts });
      }
      put(lib, g, CK, 'tree-trunk', { x: -0.75, z: -0.55, scale: 0.9, ...opts });
      put(lib, g, CK, 'tree-trunk', { x: -0.7, z: 0.0, rot: 1.2, scale: 0.7, ...opts });
      put(lib, g, CK, 'tree-trunk', { x: 0.62, z: 0.75, rot: 2.1, scale: 0.6, ...opts });
      break;
    }
    case 'saegewerk': {
      // Holzhaus mit hohem Dach, davor ein Wasserrad im Bach (dreht sich beim Sägen)
      const h = house(lib, colors, color, {
        walls: {
          N: ['wall-wood', 'wall-wood'],
          W: ['wall-wood', 'wall-wood'],
          E: ['wall-wood-window-glass', 'wall-wood'],
          S: ['wall-wood-door', 'wall-wood-window-glass'],
        },
        roof: 'roof-high-gable',
        roofHeight: 0.9,
      });
      h.scale.setScalar(0.78);
      h.position.set(0, 0, -0.2);
      g.add(h);
      const water = simpleMesh(new THREE.BoxGeometry(2, 0.04, 0.42), mat(colors === 'kenney' ? '#5c9fd8' : '#4f8fb3', { roughness: 0.25 }), {
        z: 0.79,
        y: 0.02,
        shadow: false,
      });
      g.add(water);
      const wheel = put(lib, g, FT, 'watermill', { x: 0.35, y: 0.47, z: 0.78, rot: Math.PI / 2, scale: 0.52, ...opts });
      parts.wheel = wheel;
      parts.wheelAxis = 'x'; // nach dem Drehen um 90° liegt die Achse des Rads in z – es dreht um seine eigene x-Achse
      put(lib, g, FT, 'planks', { x: -0.6, y: 0.04, z: 0.78, scale: 0.42, ...opts });
      put(lib, g, FT, 'planks', { x: -0.6, y: 0.07, z: 0.78, rot: 0.2, scale: 0.42, ...opts });
      break;
    }
    case 'kohlenmeiler': {
      // Steinhaus mit großem Schornstein und glühender Ofenluke
      const h = house(lib, colors, color, {
        walls: {
          N: ['wall', 'wall'],
          W: ['wall', 'wall'],
          E: ['wall', 'wall-window-stone'],
          S: ['wall-window-stone', 'wall'],
        },
      });
      h.scale.setScalar(0.85);
      g.add(h);
      parts.chimneyTop = chimney(lib, h, colors, { cx: 0.5, cz: -0.5, scale: 1 }).multiplyScalar(0.85);
      const glowMat = mat('#ff8a2a', { emissive: '#ff6a00', emissiveIntensity: 1.2 });
      g.add(simpleMesh(new THREE.BoxGeometry(0.34, 0.26, 0.04), glowMat, { x: 0.42, y: 0.22, z: 0.87, shadow: false }));
      parts.glow = [glowMat];
      break;
    }
    case 'schmiede': {
      // Steinhaus mit Vordach über der Tür, Schornstein, Esse und Amboss
      const h = house(lib, colors, color, {
        walls: {
          N: ['wall', 'wall'],
          W: ['wall-window-shutters', 'wall'],
          E: ['wall', 'wall-window-shutters'],
          S: ['wall-door', 'wall'],
        },
      });
      h.scale.setScalar(0.85);
      g.add(h);
      // das Vordach hängt außen an der Wand des Nachbarfelds – deshalb im Feld davor, zum Haus gedreht
      put(lib, h, FT, 'overhang', { x: -0.5, z: 1.5, rot: FACE.N, ...opts });
      put(lib, h, FT, 'overhang', { x: 0.5, z: 1.5, rot: FACE.N, ...opts });
      parts.chimneyTop = chimney(lib, h, colors, { cx: -0.5, cz: -0.5, scale: 1 }).multiplyScalar(0.85);
      const glowMat = mat('#ff8a2a', { emissive: '#ff6a00', emissiveIntensity: 1.2 });
      g.add(simpleMesh(new THREE.BoxGeometry(0.3, 0.2, 0.04), glowMat, { x: 0.42, y: 0.25, z: 0.87, shadow: false }));
      g.add(simpleMesh(new THREE.BoxGeometry(0.26, 0.16, 0.12), mat('#444a52', { metalness: 0.6, roughness: 0.4 }), { x: 0.05, y: 0.08, z: 0.98 }));
      parts.glow = [glowMat];
      break;
    }
    case 'lagerhaus': {
      // offener Schuppen auf vier Pfosten, darunter Bretter und ein Karren
      for (const [x, z] of [[-0.88, -0.4], [0.88, -0.4], [-0.88, 0.4], [0.88, 0.4]]) {
        put(lib, g, FT, 'pillar-wood', { x, z, scale: [1, 0.72, 1], ...opts });
      }
      put(lib, g, FT, 'roof-gable', { y: 0.72, scale: [1.95, 1.1, 1.02], ...opts });
      put(lib, g, FT, 'planks', { x: -0.45, y: 0.0, scale: 0.6, ...opts });
      put(lib, g, FT, 'planks', { x: -0.45, y: 0.04, rot: 0.15, scale: 0.6, ...opts });
      put(lib, g, FT, 'planks', { x: -0.45, y: 0.08, rot: -0.1, scale: 0.6, ...opts });
      put(lib, g, FT, 'cart', { x: 0.42, z: 0.02, rot: Math.PI / 2 + 0.15, scale: 0.6, ...opts });
      break;
    }
    case 'versandportal':
      // v0.34.0 (Tobias, Chat 24): „sehr schlicht … mehr ein Torbogen … mit
      // einem kleinem mythischen Schauer“ – das kleine Burgtor, durch das das
      // Band hineinfährt (Eingang im Westen), darin ein leichter Schimmer.
      // Kenneys Tor ist in x-Richtung offen – wie das Band, das von Westen
      // hineinfährt (v0.35.0: nicht mehr gedreht, Tobias: „das versandportal
      // [ist] falsch ausgerichtet“); es ist nicht mittig gebaut, daher x: -0.17.
      put(lib, g, CK, 'wall-narrow-gate', { x: -0.17, scale: 0.92, variant: colors === 'kenney' ? 'kenney' : 'tor' });
      portalShimmer(g, parts);
      break;
    default:
      // v0.34.0: Gebäude ohne eigenes Haus (3D-Test ab Level 2 oder aus einer
      // geladenen Datei): ein einfaches Steinhaus mit Dach in Reiterfarbe bzw.
      // ein Beet mit Holzrahmen.
      otherBuilding(lib, g, building, colors, opts);
      break;
  }
  return { group: g, parts };
}

// v0.34.0: Der Schimmer im Tor des Versandportals – eine leuchtende Fläche
// in der Öffnung und ein paar Funken, die langsam aufsteigen (bewegt in
// world3d.js bzw. scene3d.js über parts.shimmer).
let shimmerTexture = null;
function shimmerMap() {
  if (shimmerTexture) return shimmerTexture;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(32, 80, 4, 32, 72, 70);
  grad.addColorStop(0, 'rgba(236, 228, 255, 0.95)');
  grad.addColorStop(0.3, 'rgba(176, 146, 255, 0.85)');
  grad.addColorStop(0.7, 'rgba(118, 88, 222, 0.45)');
  grad.addColorStop(1, 'rgba(92, 66, 200, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 128);
  shimmerTexture = new THREE.CanvasTexture(c);
  shimmerTexture.colorSpace = THREE.SRGBColorSpace;
  return shimmerTexture;
}

function portalShimmer(g, parts) {
  const veilMat = new THREE.MeshBasicMaterial({
    map: shimmerMap(),
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.66), veilMat);
  veil.rotation.y = Math.PI / 2; // die Fläche steht quer zum Band (Band läuft in x)
  veil.position.set(0, 0.36, 0);
  veil.renderOrder = 2;
  g.add(veil);
  const sparkMat = new THREE.MeshBasicMaterial({ color: '#e6dcff', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
  const sparkGeo = new THREE.SphereGeometry(0.022, 6, 4);
  const sparks = [];
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(sparkGeo, sparkMat);
    m.userData.phase = i / 7;
    m.userData.offset = ((i * 37) % 11) / 11 - 0.5;
    g.add(m);
    sparks.push(m);
  }
  parts.shimmer = { veil, veilMat, sparks, sparkMat };
}

// Funken und Schimmer bewegen: time in Sekunden, flash 0…1 (Ware angekommen)
export function animateShimmer(shimmer, time, flash = 0) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.1);
  shimmer.veilMat.opacity = Math.min(1, 0.55 + pulse * 0.2 + flash * 0.3);
  shimmer.veil.scale.set(1 + flash * 0.12, 1 + pulse * 0.04 + flash * 0.12, 1);
  for (const m of shimmer.sparks) {
    const k = (time * 0.35 + m.userData.phase) % 1;
    m.position.set(Math.sin(time * 1.7 + m.userData.phase * 9) * 0.04, 0.06 + k * 0.7, m.userData.offset * 0.36);
    m.scale.setScalar(1 - k * 0.6);
  }
  shimmer.sparkMat.opacity = 0.75 + flash * 0.25;
}

function otherBuilding(lib, g, building, colors, opts) {
  const def = BUILDINGS[building.type];
  const [w, d] = def.size ?? [2, 2];
  if (def.production?.kind === 'garden') {
    // Beet: Holzrahmen mit Erde
    const wood = mat('#8a6039');
    const soil = mat('#5b3f27');
    g.add(simpleMesh(new THREE.BoxGeometry(w * 0.86, 0.1, d * 0.86), soil, { y: 0.05 }));
    for (const [x, z, bw, bd] of [
      [0, -d * 0.43, w * 0.9, 0.08],
      [0, d * 0.43, w * 0.9, 0.08],
      [-w * 0.43, 0, 0.08, d * 0.9],
      [w * 0.43, 0, 0.08, d * 0.9],
    ]) {
      g.add(simpleMesh(new THREE.BoxGeometry(bw, 0.16, bd), wood, { x, y: 0.08, z }));
    }
    return;
  }
  const h = house(lib, colors, opts.color, {
    walls: {
      N: ['wall', 'wall'],
      W: ['wall', 'wall-window-shutters'],
      E: ['wall-window-shutters', 'wall'],
      S: ['wall-door', 'wall-window-stone'],
    },
  });
  const s = Math.min(w, d) / 2;
  h.scale.set((w / 2) * 0.82, s * 0.82, (d / 2) * 0.82);
  g.add(h);
}

// ---------- Modern: Maschinen aus dem Factory Kit ----------

// Ein Rohr senkrecht als Schornstein (das Kenney-Rohr liegt waagerecht in
// x-Richtung, 1 lang, Mitte auf Höhe 0,5). Gibt die Oberkante zurück.
function pipeUp(lib, parent, { x, z, height, width, opts }) {
  const holder = new THREE.Group();
  const pipe = put(lib, holder, FK, 'pipe-large', opts);
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(0.5, 0.5, 0);
  holder.position.set(x, 0, z);
  holder.scale.set(width, height, width);
  parent.add(holder);
  return new THREE.Vector3(x, height + 0.05, z);
}

function modernBuilding(lib, building, colors) {
  const g = new THREE.Group();
  const parts = {};
  const color = BUILDINGS[building.type].color;
  const opts = { variant: colors, color };

  switch (building.type) {
    case 'holzfaeller': {
      // Maschine mit Trichter oben – hier fallen die Stämme hinein
      put(lib, g, FK, 'machine-connection-hole', { scale: 1.15, ...opts });
      put(lib, g, FK, 'hopper-square', { y: 1.47, scale: 0.6, ...opts });
      break;
    }
    case 'saegewerk': {
      // Maschine mit Fenster, vorne ein Zahnrad, das sich beim Sägen dreht
      put(lib, g, FK, 'machine-window', { scale: 1.15, ...opts });
      const cog = put(lib, g, FK, 'cog-a', { x: 0.45, y: 0.72, z: 0.95, scale: 0.55, ...opts });
      cog.rotation.x = Math.PI / 2;
      parts.wheel = cog;
      parts.wheelAxis = 'y'; // das liegende Zahnrad wurde aufgestellt – es dreht um seine eigene Hochachse
      break;
    }
    case 'kohlenmeiler': {
      // gepanzerte Maschine mit dickem Rohr als Schornstein
      put(lib, g, FK, 'machine-fortified', { scale: 1.1, ...opts });
      parts.chimneyTop = pipeUp(lib, g, { x: -0.72, z: -0.66, height: 2.3, width: 0.42, opts });
      const glowMat = mat('#ff8a2a', { emissive: '#ff6a00', emissiveIntensity: 1.2 });
      g.add(simpleMesh(new THREE.BoxGeometry(0.4, 0.22, 0.04), glowMat, { x: 0.15, y: 0.35, z: 0.67, shadow: false }));
      parts.glow = [glowMat];
      break;
    }
    case 'schmiede': {
      // Maschine mit Roboterarm, der beim Arbeiten schwenkt
      put(lib, g, FK, 'machine', { x: 0.2, scale: 1.05, ...opts });
      const arm = put(lib, g, FK, 'robot-arm-a', { x: -0.7, z: 0.62, scale: 0.42, ...opts });
      parts.arm = arm;
      parts.chimneyTop = null;
      const glowMat = mat('#ff8a2a', { emissive: '#ff6a00', emissiveIntensity: 1.2 });
      g.add(simpleMesh(new THREE.BoxGeometry(0.3, 0.18, 0.04), glowMat, { x: 0.2, y: 0.32, z: 0.66, shadow: false }));
      parts.glow = [glowMat];
      break;
    }
    case 'lagerhaus': {
      // gestapelte Kisten
      put(lib, g, FK, 'box-large', { x: -0.48, scale: 0.72, ...opts });
      put(lib, g, FK, 'box-small', { x: -0.5, y: 0.4, rot: 0.3, scale: 0.72, ...opts });
      put(lib, g, FK, 'box-wide', { x: 0.12, rot: 0.1, scale: 0.72, ...opts });
      put(lib, g, FK, 'box-long', { x: 0.62, z: 0.15, rot: Math.PI / 2, scale: 0.72, ...opts });
      put(lib, g, FK, 'box-small', { x: 0.62, z: -0.25, rot: -0.2, scale: 0.6, ...opts });
      break;
    }
    case 'versandportal':
      put(lib, g, FK, 'button-floor-round', { scale: [1.75, 0.8, 1.75], ...opts });
      break;
    default:
      break;
  }
  return { group: g, parts };
}

// Der leuchtende Ring des Versandportals (eigene Form, in beiden Stilen)
function portalRing(g, parts) {
  const ringMat = mat('#8a6bd1', { emissive: '#6b45c9', emissiveIntensity: 0.6, roughness: 0.4 });
  const ring = simpleMesh(new THREE.TorusGeometry(0.3, 0.07, 12, 32), ringMat, { y: 0.62 });
  g.add(ring);
  const core = simpleMesh(
    new THREE.CircleGeometry(0.24, 24),
    mat('#c9b5ff', { emissive: '#a58cff', emissiveIntensity: 0.9, side: THREE.DoubleSide }),
    { y: 0.62, shadow: false },
  );
  g.add(core);
  parts.ring = ring;
  parts.core = core;
  parts.glow = [ringMat];
}

// Baut ein Gebäude. style: 'mittelalter' | 'modern'; colors: 'kenney' | 'spiel'.
// Die Teile sind für Drehung 0 gebaut; ein gedrehtes Gebäude (rot = 1…3,
// je 90° im Uhrzeigersinn) dreht die ganze Gruppe mit.
export function buildKenneyBuilding(lib, building, style, colors) {
  const view = style === 'mittelalter' ? medievalBuilding(lib, building, colors) : modernBuilding(lib, building, colors);
  // v0.34.0: Im Mittelalter ist das Portal ein Torbogen mit Schimmer, der Ring bleibt nur im Modern-Stil.
  if (building.type === 'versandportal' && style !== 'mittelalter') portalRing(view.group, view.parts);
  const angle = (-(building.rot ?? 0) * Math.PI) / 2;
  view.group.rotation.y = angle;
  view.parts.chimneyTop?.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
  const outer = new THREE.Group();
  outer.add(view.group);
  return { group: outer, parts: view.parts };
}

// ---------- Bänder ----------

// Ein Band-Feld als Gruppe (Mitte des Felds bei 0,0)
export function buildBeltTile(lib, state, key, style) {
  const g = new THREE.Group();
  const variant = style === 'mittelalter' ? 'holz' : 'kenney';
  for (const p of beltPieces(state, key)) {
    put(lib, g, FK, p.name, { x: p.x, y: p.y, z: p.z, rot: p.rot, scale: [p.len, BELT_SCALE_Y, BELT_WIDTH], variant });
  }
  return g;
}

// ---------- Umgebung ----------

const TREES = [
  [FT, 'tree', 0.62],
  [FT, 'tree-high', 0.55],
  [FT, 'tree-crooked', 0.62],
  [FT, 'tree-high-round', 0.55],
  [CK, 'tree-large', 0.85],
  [CK, 'tree-small', 0.95],
];
const ROCKS = [
  [FT, 'rock-large', 0.55],
  [FT, 'rock-small', 0.5],
  [FT, 'rock-wide', 0.5],
];

// Bäume, Felsen und – je nach Stil – Zaun, Weg und Laternen (Mittelalter)
// bzw. Warnkegel und Bodenmarkierungen (Modern). Gibt { group, lanterns }
// zurück; lanterns = Punkte, an denen am Abend ein Licht brennt.
export function buildSurroundings(lib, area, style, colors) {
  const g = new THREE.Group();
  const lanterns = [];
  const opts = { variant: colors };
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // Bäume rund um das Grundstück (fester Zufall, außerhalb des Zauns)
  for (let i = 0; i < 46; i++) {
    const angle = rand() * Math.PI * 2;
    const r = 0.5 + rand() * 0.5;
    const x = area.width / 2 + Math.cos(angle) * (area.width / 2 + 2.5 + r * 5);
    const z = area.height / 2 + Math.sin(angle) * (area.height / 2 + 2.5 + r * 4);
    const pick = rand();
    const rot = rand() * Math.PI * 2;
    const size = 0.85 + rand() * 0.35;
    if (pick < 0.12) {
      const [kit, name, s] = ROCKS[Math.floor(rand() * ROCKS.length)];
      put(lib, g, kit, name, { x, z, rot, scale: s * size, ...opts });
    } else {
      const [kit, name, s] = TREES[Math.floor(rand() * TREES.length)];
      put(lib, g, kit, name, { x, z, rot, scale: s * size, ...opts });
    }
  }

  const x0 = -1;
  const z0 = -1;
  const x1 = area.width + 1;
  const z1 = area.height + 1;
  if (style === 'mittelalter') {
    // Zaun um das Grundstück, rechts ein Tor zum Weg in den Ort
    const gateZ = Math.floor(area.height / 2);
    for (let x = x0; x < x1; x++) {
      put(lib, g, FT, 'fence', { x: x + 0.5, z: z0 + 0.5, rot: FACE.N, ...opts });
      put(lib, g, FT, 'fence', { x: x + 0.5, z: z1 - 0.5, rot: FACE.S, ...opts });
    }
    for (let z = z0; z < z1; z++) {
      put(lib, g, FT, 'fence', { x: x0 + 0.5, z: z + 0.5, rot: FACE.W, ...opts });
      if (z === gateZ) put(lib, g, FT, 'fence-gate', { x: x1 - 0.5, z: z + 0.5, rot: FACE.E, ...opts });
      else put(lib, g, FT, 'fence', { x: x1 - 0.5, z: z + 0.5, rot: FACE.E, ...opts });
    }
    // Weg vom Tor nach Osten in den Ort, dann nach Süden
    for (let x = x1; x < x1 + 3; x++) put(lib, g, FT, 'road', { x: x + 0.5, y: 0.005, z: gateZ + 0.5, ...opts });
    for (let z = gateZ + 1; z < z1 + 4; z++) put(lib, g, FT, 'road', { x: x1 + 2.5, y: 0.005, z: z + 0.5, ...opts });
    // Laternen zwischen den Straßen und am Tor
    for (const [x, z] of [[7.5, 4.6], [12.6, 4.6], [x1 + 0.6, gateZ - 0.2]]) {
      put(lib, g, FT, 'lantern', { x, z, scale: 0.7, ...opts });
      lanterns.push(new THREE.Vector3(x, 1.0, z));
    }
  } else {
    // Bodenmarkierungen vor den Versandportalen, ein paar Warnkegel
    for (const z of [2.5, 6.5]) put(lib, g, FK, 'indicator-special-lines', { x: area.width - 0.5, y: 0.006, z, scale: 0.9, ...opts });
    for (const [x, z] of [[7.4, 4.5], [7.8, 4.7], [12.5, 4.6], [0.4, 4.4]]) put(lib, g, FK, 'cone', { x, z, scale: 0.9, ...opts });
    for (const [x, z] of [[7.6, 4.6], [12.6, 4.6]]) lanterns.push(new THREE.Vector3(x, 1.2, z));
  }
  return { group: g, lanterns };
}
