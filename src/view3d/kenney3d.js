// 3D-Test: Gebäude und Bänder aus Kenneys Modellen (models.js), Stil
// Mittelalter in den Farben des Spiels (Tobias' Wahl aus der Grafik-Probe,
// Chat 23): Häuser aus dem Fantasy Town Kit, Burgtor und Holzstücke aus dem
// Castle Kit, Bänder aus dem Factory Kit in Holz umgefärbt.
//
// Koordinaten: 1 Feld = 1 Einheit, x nach Osten, z nach Süden, y nach oben.
// Ein Gebäude wird um seine Mitte gebaut.

import * as THREE from 'three';

import { BUILDINGS } from '../core/data/buildings.js';
import { BELT_SCALE_Y, BELT_WIDTH, FACE, beltPieces } from './kenneyParts.js';
import { mergeStatic } from './merge.js';

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
function put(lib, parent, kit, name, { x = 0, y = 0, z = 0, rot = 0, scale = 1, variant = 'spiel', color = null } = {}) {
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
function house(lib, color, { walls, roof = 'roof-gable', roofHeight = 1.5 }) {
  const g = new THREE.Group();
  const opts = { color };
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
function chimney(lib, parent, { cx, cz, scale = 1 }) {
  const opts = {};
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

function medievalBuilding(lib, building) {
  const g = new THREE.Group();
  const parts = {};
  const color = BUILDINGS[building.type].color;
  const opts = { color };

  switch (building.type) {
    case 'holzfaeller': {
      // kleines Holzhaus hinten rechts am Band, links ein Holzstapel und Baumstümpfe
      const h = house(lib, color, {
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
      const h = house(lib, color, {
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
      const water = simpleMesh(new THREE.BoxGeometry(2, 0.04, 0.42), mat('#4f8fb3', { roughness: 0.25 }), {
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
      const h = house(lib, color, {
        walls: {
          N: ['wall', 'wall'],
          W: ['wall', 'wall'],
          E: ['wall', 'wall-window-stone'],
          S: ['wall-window-stone', 'wall'],
        },
      });
      h.scale.setScalar(0.85);
      g.add(h);
      parts.chimneyTop = chimney(lib, h, { cx: 0.5, cz: -0.5, scale: 1 }).multiplyScalar(0.85);
      const glowMat = mat('#ff8a2a', { emissive: '#ff6a00', emissiveIntensity: 1.2 });
      g.add(simpleMesh(new THREE.BoxGeometry(0.34, 0.26, 0.04), glowMat, { x: 0.42, y: 0.22, z: 0.87, shadow: false }));
      parts.glow = [glowMat];
      break;
    }
    case 'schmiede': {
      // Steinhaus mit Vordach über der Tür, Schornstein, Esse und Amboss
      const h = house(lib, color, {
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
      parts.chimneyTop = chimney(lib, h, { cx: -0.5, cz: -0.5, scale: 1 }).multiplyScalar(0.85);
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
      put(lib, g, CK, 'wall-narrow-gate', { x: -0.17, scale: 0.92, variant: 'tor' });
      portalShimmer(g, parts);
      break;
    default:
      // v0.34.0: Gebäude ohne eigenes Haus (3D-Test ab Level 2 oder aus einer
      // geladenen Datei): ein einfaches Steinhaus mit Dach in Reiterfarbe bzw.
      // ein Beet mit Holzrahmen.
      otherBuilding(lib, g, building, opts);
      break;
  }
  return { group: g, parts };
}

// v0.34.0: Der Schimmer im Tor des Versandportals – eine leuchtende Fläche
// in der Öffnung und ein paar Funken, die langsam aufsteigen (bewegt in
// scene3d.js über parts.shimmer).
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
  // v0.40.0: alle 7 Funken als ein Teil mit 7 Stellen (Instancing)
  const sparks = new THREE.InstancedMesh(SPARK_GEO, sparkMat, SPARKS);
  sparks.frustumCulled = false;
  g.add(sparks);
  parts.shimmer = { veil, veilMat, sparks, sparkMat };
  animateShimmer(parts.shimmer, 0);
}

const SPARKS = 7;
const SPARK_GEO = new THREE.SphereGeometry(0.022, 6, 4);
const sparkSpot = new THREE.Object3D();

// Funken und Schimmer bewegen: time in Sekunden, flash 0…1 (Ware angekommen)
export function animateShimmer(shimmer, time, flash = 0) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.1);
  shimmer.veilMat.opacity = Math.min(1, 0.55 + pulse * 0.2 + flash * 0.3);
  shimmer.veil.scale.set(1 + flash * 0.12, 1 + pulse * 0.04 + flash * 0.12, 1);
  for (let i = 0; i < SPARKS; i++) {
    const phase = i / SPARKS;
    const offset = ((i * 37) % 11) / 11 - 0.5;
    const k = (time * 0.35 + phase) % 1;
    sparkSpot.position.set(Math.sin(time * 1.7 + phase * 9) * 0.04, 0.06 + k * 0.7, offset * 0.36);
    sparkSpot.scale.setScalar(1 - k * 0.6);
    sparkSpot.updateMatrix();
    shimmer.sparks.setMatrixAt(i, sparkSpot.matrix);
  }
  shimmer.sparks.instanceMatrix.needsUpdate = true;
  shimmer.sparkMat.opacity = 0.75 + flash * 0.25;
}

function otherBuilding(lib, g, building, opts) {
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
  const h = house(lib, opts.color, {
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

// Baut ein Gebäude. Die Teile sind für Drehung 0 gebaut; ein gedrehtes
// Gebäude (rot = 1…3, je 90° im Uhrzeigersinn) dreht die ganze Gruppe mit.
export function buildKenneyBuilding(lib, building) {
  const view = medievalBuilding(lib, building);
  const angle = (-(building.rot ?? 0) * Math.PI) / 2;
  view.group.rotation.y = angle;
  view.parts.chimneyTop?.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
  const outer = new THREE.Group();
  outer.add(view.group);
  // v0.40.0: alle Teile des Hauses zu wenigen zusammenfügen (schneller); was
  // sich bewegt (Wasserrad, Schimmer im Tor), bleibt für sich
  const { wheel, shimmer } = view.parts;
  mergeStatic(outer, [wheel, shimmer?.veil, shimmer?.sparks]);
  return { group: outer, parts: view.parts };
}

// ---------- Bänder ----------

// Ein Band-Feld als Gruppe (Mitte des Felds bei 0,0)
export function buildBeltTile(lib, state, key) {
  const g = new THREE.Group();
  for (const p of beltPieces(state, key)) {
    put(lib, g, FK, p.name, { x: p.x, y: p.y, z: p.z, rot: p.rot, scale: [p.len, BELT_SCALE_Y, BELT_WIDTH], variant: 'holz' });
  }
  return g;
}
