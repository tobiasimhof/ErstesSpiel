// 3D-Test: Gebäude und Bänder aus Kenneys Modellen (models.js), Stil
// Mittelalter in den Farben des Spiels (Tobias' Wahl aus der Grafik-Probe,
// Chat 23): Häuser aus dem Fantasy Town Kit, Burgtor und Holzstücke aus dem
// Castle Kit, Bänder aus dem Factory Kit in Holz umgefärbt.
//
// Koordinaten: 1 Feld = 1 Einheit, x nach Osten, z nach Süden, y nach oben.
// Ein Gebäude wird um seine Mitte gebaut.

import * as THREE from 'three';

import { BUILDINGS, TAB_COLORS } from '../core/data/buildings.js';
import { BELT_SCALE_Y, BELT_WIDTH, FACE, beltPieces } from './kenneyParts.js';
import { mergeStatic } from './merge.js';

export { BELT_TOP } from './kenneyParts.js';

const FT = 'fantasy-town-kit';
const CK = 'castle-kit';
const FK = 'factory-kit';

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra });
}

// v0.42.0: einfache Formen (Blöcke, Steine, Balken) teilen sich ein Material;
// ihre Farbe steckt in den Ecken der Form. So fügt mergeStatic alle einfachen
// Formen eines Hauses zu einem einzigen Teil zusammen (weniger Zeichenaufrufe).
const PLAIN = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 });
function plain(geometry, color, pos = {}) {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry;
  const c = new THREE.Color(color);
  const n = geo.attributes.position.count;
  const rgb = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) rgb.set([c.r, c.g, c.b], i * 3);
  geo.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
  return simpleMesh(geo, PLAIN, pos);
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
// v0.42.0: color = Farbe des Hauses, damit der Schornstein dasselbe Material
// hat und mit dem Haus zu einem Teil zusammengefügt wird
function chimney(lib, parent, { cx, cz, scale = 1, color = null }) {
  const opts = { color };
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

// v0.42.0: ein Zahnrad (Factory Kit) senkrecht an einer Wand oder auf einer
// Bank – es liegt flach im Modell, deshalb um 90° gekippt. Ergebnis: die
// Gruppe, die sich beim Arbeiten um z dreht (parts.spin).
function gear(lib, parent, { x, y, z, scale, variant }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const cog = put(lib, g, FK, 'cog-a', { scale, variant });
  cog.rotation.x = Math.PI / 2;
  cog.position.z = 0.04 * scale; // die Scheibe liegt im Modell nicht mittig
  parent.add(g);
  return g;
}

// v0.43.0: ein Wagenrad (steht im Modell seitlich versetzt) als Gruppe, die
// sich um ihre Mitte dreht; das Rad zeigt nach Süden (zur Kamera)
function spinningWheel(lib, parent, { x, y, z, scale, color }) {
  const holder = new THREE.Group();
  holder.position.set(x, y, z);
  holder.rotation.y = Math.PI / 2;
  const spinner = new THREE.Group();
  const w = put(lib, spinner, FT, 'wheel', { x: -0.32 * scale, y: -0.24 * scale, scale, color });
  w.position.x = -0.32 * scale;
  holder.add(spinner);
  parent.add(holder);
  return spinner;
}

// v0.43.0: ein Banner, das oben aufgehängt ist und beim Arbeiten leicht
// schwingt (parts.sway). Es hängt an der Außenseite einer Wand nach side.
function hangingBanner(lib, parent, { x, z, side, top = 1, color }) {
  const pivot = new THREE.Group();
  pivot.position.set(x, top, z);
  pivot.rotation.y = FACE[side];
  const inner = new THREE.Group();
  pivot.add(inner);
  const b = put(lib, inner, FT, 'banner-green', { color });
  b.position.set(-0.36, -1, 0); // Stoff liegt im Modell bei x 0,38–0,43, oben bei y 1
  parent.add(pivot);
  return inner;
}

// Kleine Steine (Erz, Blöcke) als einfache Formen
function stones(g, color, list, size = 0.09) {
  for (const [x, y, z, s = 1] of list) {
    const m = plain(new THREE.DodecahedronGeometry(size), color, { x, y, z });
    m.scale.setScalar(s);
    m.rotation.set(x * 7, z * 5, x * 3);
    g.add(m);
  }
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
      parts.chimneyTop = chimney(lib, h, { cx: 0.5, cz: -0.5, scale: 1, color }).multiplyScalar(0.85);
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
      parts.chimneyTop = chimney(lib, h, { cx: -0.5, cz: -0.5, scale: 1, color }).multiplyScalar(0.85);
      const glowMat = mat('#ff8a2a', { emissive: '#ff6a00', emissiveIntensity: 1.2 });
      g.add(simpleMesh(new THREE.BoxGeometry(0.3, 0.2, 0.04), glowMat, { x: 0.42, y: 0.25, z: 0.87, shadow: false }));
      g.add(plain(new THREE.BoxGeometry(0.26, 0.16, 0.12), '#444a52', { x: 0.05, y: 0.08, z: 0.98 }));
      parts.glow = [glowMat];
      break;
    }
    // ---------- v0.42.0: eigene Häuser für Level 2–6 (Tobias, Chat 26) ----------
    // „Dadurch bekommt das Game nochmal mehr Aussehen und man [kann] besser
    // erkennen, welches Gebäude was gerade macht.“ Je Haus ein Teil, das sich
    // nur beim Arbeiten bewegt oder leuchtet (parts.spin, swing, glow, Rauch).
    case 'steinbruch': {
      // offene Grube mit Felsen; ein Holzkran schwenkt beim Arbeiten einen
      // Steinblock; geschnittene Blöcke am Ausgang, ein Karren mit Steinen
      g.add(plain(new THREE.BoxGeometry(1.76, 0.03, 1.76), '#a39a8b', { y: 0.015 }));
      put(lib, g, CK, 'rocks-large', { x: -0.42, z: -0.38, rot: 0.4, scale: 0.85 });
      put(lib, g, FT, 'rock-wide', { x: -0.6, z: 0.5, rot: 1.1, scale: 0.4, ...opts });
      put(lib, g, FT, 'rock-small', { x: 0.1, z: -0.72, rot: 2.0, scale: 0.32, ...opts });
      const block = '#cfc6b6';
      for (const [x, y, z] of [[0.6, 0.09, -0.66], [0.8, 0.09, -0.66], [0.7, 0.27, -0.66]]) {
        g.add(plain(new THREE.BoxGeometry(0.18, 0.18, 0.18), block, { x, y, z }));
      }
      put(lib, g, FT, 'pillar-wood', { x: 0.25, z: 0.2, scale: [1.7, 1.3, 1.7], ...opts });
      const arm = new THREE.Group();
      arm.position.set(0.25, 1.26, 0.2);
      arm.add(plain(new THREE.BoxGeometry(1.0, 0.08, 0.08), '#7a5232', { x: -0.32 }));
      arm.add(plain(new THREE.BoxGeometry(0.02, 0.5, 0.02), '#3b3127', { x: -0.74, y: -0.27 }));
      arm.add(plain(new THREE.BoxGeometry(0.22, 0.17, 0.22), block, { x: -0.74, y: -0.6 }));
      mergeStatic(arm); // der Arm schwenkt als Ganzes: ein Teil
      g.add(arm);
      parts.swing = { obj: arm, base: 0.5, amp: 0.75, speed: 1.1, t: 0 };
      put(lib, g, FT, 'cart', { x: 0.62, z: 0.62, rot: Math.PI / 2 - 0.25, scale: 0.55, ...opts });
      stones(g, block, [[0.56, 0.33, 0.6], [0.7, 0.33, 0.66], [0.63, 0.43, 0.63, 0.8]]);
      break;
    }
    case 'steinmetz': {
      // Steinhaus mit großem Rundbogen; davor eine Werkbank mit Steinplatten,
      // beim Arbeiten steigt Staub auf
      const h = house(lib, color, {
        walls: {
          N: ['wall', 'wall'],
          W: ['wall', 'wall-window-small'],
          E: ['wall-window-small', 'wall'],
          S: ['wall-doorway-round', 'wall-window-stone'],
        },
      });
      h.scale.setScalar(0.8);
      h.position.set(0, 0, -0.2);
      g.add(h);
      put(lib, g, FT, 'stall-bench', { x: 0.38, z: 0.8, rot: Math.PI / 2, scale: 1.15, ...opts });
      const slab = '#d2c9b9';
      g.add(plain(new THREE.BoxGeometry(0.24, 0.04, 0.2), slab, { x: 0.12, y: 0.28, z: 0.8 }));
      g.add(plain(new THREE.BoxGeometry(0.24, 0.04, 0.2), slab, { x: 0.14, y: 0.32, z: 0.8 }));
      g.add(plain(new THREE.BoxGeometry(0.16, 0.16, 0.16), slab, { x: 0.62, y: 0.34, z: 0.8 }));
      put(lib, g, FT, 'rock-small', { x: -0.6, z: 0.8, rot: 0.7, scale: 0.22, ...opts });
      parts.dustSpot = new THREE.Vector3(0.45, 0.42, 0.8);
      break;
    }
    case 'schmelzhuette': {
      // runder Steinturm (Castle Kit) mit Schornstein; unten glüht die
      // Öffnung, oben raucht es beim Arbeiten; davor Erz und fertige Barren
      const tx = -0.15;
      const tz = -0.1;
      const s = 1.05;
      put(lib, g, CK, 'tower-base', { x: tx, z: tz, scale: s, variant: 'tor' });
      put(lib, g, CK, 'tower-top', { x: tx, y: 1.31 * s, z: tz, scale: s, variant: 'tor' });
      const top = new THREE.Group();
      top.position.set(tx, 1.31 * s, tz);
      g.add(top);
      parts.chimneyTop = chimney(lib, top, { cx: -0.14, cz: 0, scale: 0.42, color }).add(top.position);
      const glowMat = mat('#ff8a2a', { emissive: '#ff6a00', emissiveIntensity: 1.2 });
      g.add(plain(new THREE.BoxGeometry(0.34, 0.3, 0.06), '#3d3a36', { x: tx, y: 0.2, z: tz + 0.5 }));
      g.add(simpleMesh(new THREE.BoxGeometry(0.24, 0.2, 0.06), glowMat, { x: tx, y: 0.18, z: tz + 0.52, shadow: false }));
      parts.glow = [glowMat];
      stones(g, '#5f5a66', [[-0.68, 0.07, 0.72], [-0.54, 0.07, 0.8], [-0.62, 0.17, 0.76, 0.8], [-0.42, 0.06, 0.7, 0.7]]);
      for (const [x, y, z] of [[0.62, 0.05, -0.66], [0.62, 0.05, -0.5], [0.62, 0.13, -0.58]]) {
        g.add(plain(new THREE.BoxGeometry(0.34, 0.08, 0.12), '#a3acb7', { x, y, z }));
      }
      break;
    }
    case 'zimmerei': {
      // Holzschuppen mit breitem Tor; davor Bretterstapel und eine Säge,
      // deren Blatt sich beim Arbeiten dreht
      const h = house(lib, color, {
        walls: {
          N: ['wall-wood', 'wall-wood'],
          W: ['wall-wood', 'wall-wood'],
          E: ['wall-wood-window-glass', 'wall-wood'],
          S: ['wall-wood-doorway-square-wide', 'wall-wood-window-shutters'],
        },
      });
      h.scale.setScalar(0.78);
      h.position.set(0, 0, -0.22);
      g.add(h);
      put(lib, g, FT, 'planks', { x: -0.55, y: 0.0, z: 0.76, scale: 0.45, ...opts });
      put(lib, g, FT, 'planks-half', { x: -0.62, y: 0.03, z: 0.76, rot: 0.12, scale: 0.45, ...opts });
      put(lib, g, FT, 'planks', { x: -0.55, y: 0.06, z: 0.76, rot: -0.08, scale: 0.45, ...opts });
      g.add(plain(new THREE.BoxGeometry(0.5, 0.22, 0.22), '#7a5232', { x: 0.45, y: 0.11, z: 0.8 }));
      parts.spin = [{ obj: gear(lib, g, { x: 0.45, y: 0.3, z: 0.8, scale: 0.34, variant: 'stahl' }), axis: 'z', speed: 7 }];
      break;
    }
    case 'feinschmiede': {
      // kleines Steinhaus mit Spitzdach und runden Fenstern; an der Front ein
      // Messing-Zahnrad, das sich beim Arbeiten dreht
      const h = house(lib, color, {
        walls: {
          N: ['wall', 'wall'],
          W: ['wall', 'wall-window-round'],
          E: ['wall-window-round', 'wall'],
          S: ['wall-door', 'wall'],
        },
        roof: 'roof-point',
        roofHeight: 2.3,
      });
      h.scale.setScalar(0.76);
      g.add(h);
      parts.spin = [{ obj: gear(lib, g, { x: 0.38, y: 0.5, z: 0.8, scale: 0.44, variant: 'messing' }), axis: 'z', speed: 1.3 }];
      break;
    }
    case 'schlosserei': {
      // Steinhaus mit breitem Tor, darin glüht beim Arbeiten die Esse, oben
      // raucht der Schornstein; davor ein Eisengitter (Gitter und Schlösser)
      const h = house(lib, color, {
        walls: {
          N: ['wall', 'wall'],
          W: ['wall-window-small', 'wall'],
          E: ['wall', 'wall-window-small'],
          S: ['wall-doorway-square-wide', 'wall-window-small'],
        },
      });
      h.scale.setScalar(0.85);
      g.add(h);
      parts.chimneyTop = chimney(lib, h, { cx: 0.5, cz: -0.5, scale: 1, color }).multiplyScalar(0.85);
      const glowMat = mat('#ff8a2a', { emissive: '#ff6a00', emissiveIntensity: 1.2 });
      // die Esse steht gleich hinter dem Tor, damit man die Glut sieht
      g.add(plain(new THREE.BoxGeometry(0.36, 0.26, 0.26), '#57534d', { x: -0.42, y: 0.13, z: 0.6 }));
      g.add(simpleMesh(new THREE.BoxGeometry(0.28, 0.04, 0.2), glowMat, { x: -0.42, y: 0.27, z: 0.6, shadow: false }));
      parts.glow = [glowMat];
      put(lib, g, CK, 'metal-gate', { x: 0.5, z: 0.92, rot: Math.PI / 2, scale: 0.85, variant: 'eisen' });
      break;
    }
    // ---------- v0.43.0: eigene Häuser für Level 7–12 (Tobias: „Mach gerne weiter“) ----------
    case 'flachsbreche': {
      // Erntebank: Marktstand mit Stoffdach, daneben ein Karren mit Pflanzen
      // und ein Rad in einem Holzgestell, das sich beim Arbeiten dreht; Büsche hinten
      put(lib, g, FT, 'stall-green', { x: -0.28, z: -0.2, scale: 1.3, ...opts });
      stones(g, '#4f7f3a', [[-0.85, 0.12, -0.75, 1.3], [-0.85, 0.1, 0.1], [-0.82, 0.12, 0.75, 1.2], [-0.4, 0.1, 0.82]], 0.12);
      for (const x of [0.5, 0.74]) g.add(plain(new THREE.BoxGeometry(0.05, 0.36, 0.05), '#7a5232', { x, y: 0.18, z: -0.05 }));
      put(lib, g, FT, 'cart', { x: 0.55, z: 0.58, rot: Math.PI / 2 + 0.2, scale: 0.55, ...opts });
      stones(g, '#7aa64a', [[0.48, 0.34, 0.56, 1.1], [0.62, 0.34, 0.62], [0.55, 0.44, 0.58, 0.9]], 0.1);
      stones(g, '#e2b53c', [[0.52, 0.5, 0.6, 0.5], [0.64, 0.45, 0.55, 0.45]], 0.1);
      parts.spin = [{ obj: spinningWheel(lib, g, { x: 0.62, y: 0.3, z: -0.05, scale: 1.1, color }), axis: 'x', speed: 2.4 }];
      break;
    }
    case 'webstube': {
      // Holzhaus mit Balkon; Stoffbahnen in Reiterfarbe hängen an der Front
      // und schwingen beim Arbeiten (Weben)
      const h = house(lib, color, {
        walls: {
          N: ['wall-wood', 'wall-wood'],
          W: ['wall-wood', 'wall-wood-window-shutters'],
          E: ['wall-wood-window-shutters', 'wall-wood'],
          S: ['wall-wood-door', 'balcony-wall-fence'],
        },
      });
      h.scale.setScalar(0.8);
      h.position.set(0, 0, -0.15);
      g.add(h);
      const wallZ = -0.15 + 0.8 * 1.02;
      parts.sway = [
        { obj: hangingBanner(lib, g, { x: 0.25, z: wallZ, side: 'S', top: 0.78, color }), axis: 'x', amp: 0.16, speed: 2.2, t: 0 },
        { obj: hangingBanner(lib, g, { x: 0.62, z: wallZ, side: 'S', top: 0.78, color }), axis: 'x', amp: 0.16, speed: 2.2, t: 1.3 },
      ];
      put(lib, g, FT, 'planks', { x: -0.62, z: 0.82, scale: 0.36, ...opts });
      break;
    }
    case 'kraeuterstube': {
      // Holzhaus mit hohem Dach in Reiterfarbe und Schornstein (Kräuter werden
      // gekocht, beim Arbeiten raucht es); davor ein kleiner Kräutergarten und eine Laterne
      const h = house(lib, color, {
        walls: {
          N: ['wall-wood', 'wall-wood'],
          W: ['wall-wood', 'wall-wood-window-shutters'],
          E: ['wall-wood-window-shutters', 'wall-wood'],
          S: ['wall-wood-door', 'wall-wood-window-glass'],
        },
        roof: 'roof-high-gable',
        roofHeight: 0.9,
      });
      h.scale.setScalar(0.74);
      h.position.set(0, 0, -0.26);
      g.add(h);
      parts.chimneyTop = chimney(lib, h, { cx: 0.5, cz: -0.5, scale: 1, color }).multiplyScalar(0.74).add(h.position);
      g.add(plain(new THREE.BoxGeometry(1.0, 0.06, 0.34), '#5b3f27', { x: 0.3, y: 0.03, z: 0.78 }));
      stones(g, '#4f8a3c', [[-0.1, 0.1, 0.78], [0.12, 0.1, 0.74], [0.34, 0.1, 0.8], [0.56, 0.1, 0.76], [0.74, 0.1, 0.8]], 0.08);
      stones(g, '#e8c040', [[0.02, 0.17, 0.8, 0.45], [0.46, 0.17, 0.76, 0.45], [0.66, 0.17, 0.82, 0.45]], 0.08);
      put(lib, g, FT, 'lantern', { x: -0.72, z: 0.72, scale: 0.5, ...opts });
      break;
    }
    case 'schreibstube': {
      // sechseckiger Turm mit Spitzdach und Fahne (Castle Kit); die Fenster
      // leuchten warm, solange geschrieben wird; davor ein Schreibpult und eine Laterne
      const tx = -0.12;
      const tz = -0.15;
      const s = 1.3;
      put(lib, g, CK, 'tower-hexagon-base', { x: tx, z: tz, scale: s, variant: 'turm', color });
      put(lib, g, CK, 'tower-hexagon-roof', { x: tx, y: 1.31 * s, z: tz, scale: s, variant: 'turm', color });
      put(lib, g, CK, 'flag-pennant', { x: tx, y: (1.31 + 0.8) * s, z: tz, rot: -0.6, scale: 0.8, variant: 'turm', color });
      const front = tz + 0.39 * s + 0.005;
      g.add(plain(new THREE.BoxGeometry(0.26, 0.42, 0.04), '#5a3b25', { x: tx, y: 0.21, z: front }));
      const glowMat = mat('#ffd27a', { emissive: '#ffb347', emissiveIntensity: 1.2 });
      for (const [x, y] of [[tx - 0.18, 0.95], [tx + 0.18, 0.95], [tx, 1.45]]) {
        g.add(simpleMesh(new THREE.BoxGeometry(0.11, 0.17, 0.03), glowMat, { x, y, z: front, shadow: false }));
      }
      parts.glow = [glowMat];
      g.add(plain(new THREE.BoxGeometry(0.34, 0.06, 0.24), '#7a5232', { x: 0.55, y: 0.36, z: 0.68 }));
      g.add(plain(new THREE.BoxGeometry(0.06, 0.34, 0.06), '#7a5232', { x: 0.55, y: 0.17, z: 0.68 }));
      g.add(plain(new THREE.BoxGeometry(0.2, 0.01, 0.14), '#efe6cf', { x: 0.55, y: 0.395, z: 0.68 }));
      put(lib, g, FT, 'lantern', { x: -0.62, z: 0.6, scale: 0.5, ...opts });
      break;
    }
    case 'uhrmacherei': {
      // hoher, eckiger Turm (Castle Kit) mit großem Messing-Zahnrad als „Uhr“
      // an der Front und einem kleinen daneben – beide drehen sich beim Arbeiten
      const tx = -0.1;
      const tz = -0.15;
      const s = 1.15;
      put(lib, g, CK, 'tower-square-base', { x: tx, z: tz, scale: s, variant: 'turm', color });
      put(lib, g, CK, 'tower-square-roof', { x: tx, y: 1.01 * s, z: tz, scale: s, variant: 'turm', color });
      const front = tz + 0.5 * s + 0.02;
      parts.spin = [
        { obj: gear(lib, g, { x: tx, y: 1.55, z: front, scale: 0.62, variant: 'messing' }), axis: 'z', speed: 0.5 },
        { obj: gear(lib, g, { x: tx + 0.42, y: 0.55, z: front + 0.02, scale: 0.3, variant: 'messing' }), axis: 'z', speed: -1.2 },
      ];
      g.add(plain(new THREE.BoxGeometry(0.28, 0.44, 0.04), '#5a3b25', { x: tx - 0.12, y: 0.22, z: front }));
      put(lib, g, FT, 'planks', { x: 0.62, z: 0.72, scale: 0.34, ...opts });
      break;
    }
    case 'apotheke': {
      // Steinhaus mit grünem Marktdach davor; an der Seite Glasrohre, auf dem
      // Tresen Fläschchen, die beim Arbeiten grün leuchten
      const h = house(lib, color, {
        walls: {
          N: ['wall', 'wall'],
          W: ['wall', 'wall-window-shutters'],
          E: ['wall-window-shutters', 'wall'],
          S: ['wall-door', 'wall-window-stone'],
        },
      });
      h.scale.setScalar(0.78);
      h.position.set(-0.1, 0, -0.22);
      g.add(h);
      put(lib, g, FT, 'stall-green', { x: 0.45, z: 0.62, scale: 0.75, color: TAB_COLORS.kraeuter });
      for (const [x, z] of [[0.84, 0.1], [0.84, 0.36]]) {
        const pipe = put(lib, g, FK, 'pipe-glass-large-long', { x, y: 0.52, z, scale: [0.3, 0.2, 0.2], variant: 'glas' });
        pipe.rotation.z = Math.PI / 2;
      }
      const glowMat = mat('#7fe0a0', { emissive: '#2fd070', emissiveIntensity: 1.2 });
      const flask = new THREE.CylinderGeometry(0.035, 0.045, 0.12, 10);
      for (const [x, z] of [[0.3, 0.62], [0.42, 0.66], [0.55, 0.6]]) g.add(simpleMesh(flask, glowMat, { x, y: 0.36, z, shadow: false }));
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
    // v0.42.0: Rahmen und Erde als einfache Formen (ein Teil statt zwei)
    const wood = '#8a6039';
    g.add(plain(new THREE.BoxGeometry(w * 0.86, 0.1, d * 0.86), '#5b3f27', { y: 0.05 }));
    for (const [x, z, bw, bd] of [
      [0, -d * 0.43, w * 0.9, 0.08],
      [0, d * 0.43, w * 0.9, 0.08],
      [-w * 0.43, 0, 0.08, d * 0.9],
      [w * 0.43, 0, 0.08, d * 0.9],
    ]) {
      g.add(plain(new THREE.BoxGeometry(bw, 0.16, bd), wood, { x, y: 0.08, z }));
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
  const up = new THREE.Vector3(0, 1, 0);
  view.parts.chimneyTop?.applyAxisAngle(up, angle);
  view.parts.dustSpot?.applyAxisAngle(up, angle);
  const outer = new THREE.Group();
  outer.add(view.group);
  // v0.40.0: alle Teile des Hauses zu wenigen zusammenfügen (schneller); was
  // sich bewegt (Wasserrad, Schimmer im Tor, v0.42.0 Zahnräder und Kran), bleibt für sich
  const { wheel, shimmer, spin = [], swing, sway = [] } = view.parts;
  mergeStatic(outer, [wheel, shimmer?.veil, shimmer?.sparks, ...spin.map((s) => s.obj), swing?.obj, ...sway.map((s) => s.obj)]);
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
