// v0.34.0: 3D-Test (Tobias, Chat 24) – die Fabrik als 3D-Welt mit Kenneys
// Modellen. Liest nur den Spielzustand (src/core) und was die Steuerung
// gerade zeigt (ui: Auswahl, Vorschau beim Bauen, Band-Vorschau), ändert
// beides nie.
//
// Stil wie Tobias in der Grafik-Probe gewählt hat: Mittelalter mit den
// Farben des Spiels, eigene Häuser je Gebäude (kenney3d.js), das
// Versandportal als Torbogen mit Schimmer. Über jedem Gebäude schwebt ein
// Schild wie auf der 2D-Karte (Warenbild, Fortschrittsring, Statuslicht);
// Ein- und Ausgänge zeigen Pfeile (blau hinein, orange hinaus).
//
// Die Welt wird nicht in jedem Bild neu gebaut: Gebäude, Bänder, Boden und
// Schilder werden nur ersetzt, wenn sich an ihnen etwas geändert hat.

import * as THREE from 'three';

import { BUILDINGS } from '../core/data/buildings.js';
import { ITEMS } from '../core/data/items.js';
import { DELTA } from '../core/dirs.js';
import { buildingPorts, footprintSize } from '../core/geometry.js';
import { selectionTiles } from '../core/area.js';
import { beltLine, pathDirections } from '../core/belts.js';
import { landOffer, landOffers } from '../core/land.js';
import { buildingStatus, gardenCrop, growth, productionOf } from '../core/production.js';
import { BELT_SPEED, TICK } from '../core/sim.js';
import { beltAt, parseTileKey } from '../core/state.js';
import { buildingFace } from '../ui/buildingFace.js';
import { drawItem } from '../ui/itemArt.js';
import { BELT_TOP, animateShimmer, buildBeltTile, buildKenneyBuilding } from './kenney3d.js';
import { beltPieces, FACE } from './kenneyParts.js';
import { disposeMerged, flatRects, mergeMeshes, mergeStatic } from './merge.js';

const COLORS = 'spiel';

const COLOR = {
  sky: '#a9d6f2',
  outer: '#5f8a43',
  locked: '#6d8f50',
  plot: '#7fae55',
  gridA: '#6c9a47',
  portIn: '#74c0fc',
  portOut: '#ffa94d',
  ok: '#51cf66',
  bad: '#ff6b6b',
  select: '#ffd43b',
  preview: '#ffe066',
  work: '#51cf66',
  idle: '#fcc419',
  blocked: '#ff6b6b',
};

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra });
}

function flatMat(color, extra = {}) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, ...extra });
}

// Ein flaches Rechteck auf dem Boden (Mitte x, z; Größe w × d), Höhe y
function groundRect(w, d, material, { x = 0, y = 0.02, z = 0 } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y, z);
  m.renderOrder = 1;
  return m;
}

// Ein Rahmen aus vier flachen Leisten um ein Rechteck (x0, z0, w, d)
function frame(x0, z0, w, d, material, { y = 0.03, width = 0.08 } = {}) {
  const g = new THREE.Group();
  const bar = (bx, bz, bw, bd) => g.add(groundRect(bw, bd, material, { x: bx, y, z: bz }));
  bar(x0 + w / 2, z0 + width / 2, w, width);
  bar(x0 + w / 2, z0 + d - width / 2, w, width);
  bar(x0 + width / 2, z0 + d / 2, width, d);
  bar(x0 + w - width / 2, z0 + d / 2, width, d);
  return g;
}

// v0.40.0: die vier Leisten eines Rahmens als Rechtecke für flatRects
function frameRects(x0, z0, w, d, { y = 0.03, width = 0.08 } = {}) {
  return [
    { x: x0 + w / 2, z: z0 + width / 2, w, d: width, y },
    { x: x0 + w / 2, z: z0 + d - width / 2, w, d: width, y },
    { x: x0 + width / 2, z: z0 + d / 2, w: width, d, y },
    { x: x0 + w - width / 2, z: z0 + d / 2, w: width, d, y },
  ];
}

// ---------- Pfeile (Anschlüsse, Band-Vorschau) ----------

// Ein flacher Pfeil, Spitze in +x (wird mit FACE gedreht)
const arrowShape = new THREE.Shape();
arrowShape.moveTo(0.16, 0);
arrowShape.lineTo(-0.1, 0.16);
arrowShape.lineTo(-0.1, -0.16);
arrowShape.closePath();
const ARROW_GEO = new THREE.ShapeGeometry(arrowShape);
ARROW_GEO.rotateX(-Math.PI / 2); // liegt flach, Spitze in +x
const ARROW_EDGE = new THREE.EdgesGeometry(ARROW_GEO);

// v0.40.0: gleiche Farbe = dasselbe Material (lässt sich zusammenfügen)
const arrowFills = new Map();
const arrowFill = (color) => {
  if (!arrowFills.has(color)) arrowFills.set(color, flatMat(color, { opacity: 0.95 }));
  return arrowFills.get(color);
};
const ARROW_EDGE_MAT = new THREE.LineBasicMaterial({ color: '#2a2018', transparent: true, opacity: 0.7 });

function flatArrow(color, dir, { x, y, z, scale = 1 }) {
  const g = new THREE.Group();
  const fill = new THREE.Mesh(ARROW_GEO, arrowFill(color));
  fill.renderOrder = 3;
  const edge = new THREE.LineSegments(ARROW_EDGE, ARROW_EDGE_MAT);
  edge.renderOrder = 3;
  g.add(fill, edge);
  g.rotation.y = FACE[dir];
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  return g;
}

const OPPOSITE = { N: 'S', S: 'N', E: 'W', W: 'E' };

// Pfeile an den Anschlüssen eines Gebäudes (Feldkoordinaten der Welt)
function portArrows(building) {
  const g = new THREE.Group();
  for (const port of buildingPorts(building)) {
    const d = DELTA[port.side];
    const x = port.tile.x + 0.5 + d.x * 0.5;
    const z = port.tile.y + 0.5 + d.y * 0.5;
    const dir = port.kind === 'out' ? port.side : OPPOSITE[port.side];
    g.add(flatArrow(port.kind === 'out' ? COLOR.portOut : COLOR.portIn, dir, { x, y: BELT_TOP + 0.03, z, scale: 1.05 }));
  }
  mergeStatic(g); // v0.40.0: alle Pfeile eines Gebäudes als ein Teil je Farbe
  return g;
}

// ---------- Waren ----------

// Eigene kleine Formen (solche Waren gibt es bei Kenney nicht), nach der
// Form aus der Waren-Tabelle (shape) und ihrer Farbe.
function itemTemplate(type) {
  const def = ITEMS[type] ?? { color: '#cccccc' };
  const m = mat(def.color);
  const g = new THREE.Group();
  const add = (geo, y, rot = 0) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.y = y;
    mesh.rotation.y = rot;
    mesh.castShadow = true;
    g.add(mesh);
    return mesh;
  };
  switch (def.shape) {
    case 'block':
      add(new THREE.BoxGeometry(0.22, 0.22, 0.22), 0.11);
      break;
    case 'plate':
      add(new THREE.BoxGeometry(0.36, 0.06, 0.28), 0.03);
      break;
    case 'smallplate':
      add(new THREE.BoxGeometry(0.26, 0.05, 0.22), 0.025);
      break;
    case 'rod':
      add(new THREE.BoxGeometry(0.42, 0.07, 0.07), 0.035);
      add(new THREE.BoxGeometry(0.42, 0.07, 0.07), 0.105, 0.25);
      break;
    case 'bar':
      add(new THREE.BoxGeometry(0.42, 0.06, 0.06), 0.03);
      break;
    case 'ingot':
      add(new THREE.BoxGeometry(0.28, 0.1, 0.16), 0.05);
      break;
    case 'gear':
      add(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 10), 0.035);
      break;
    default:
      add(new THREE.SphereGeometry(0.11, 12, 8), 0.11);
  }
  return g;
}

// ---------- Schilder über den Gebäuden ----------

const SIGN_PX = 128;

// Zeichnet das Schild eines Gebäudes (wie die 2D-Karte: Scheibe mit Ware,
// Ring, Statuslicht, Vorrat-Punkte oder „?“). Gibt eine Kennung zurück, an der
// man erkennt, ob es neu gezeichnet werden muss.
function signKey(face, status) {
  const ring = face.ring == null ? '-' : Math.round(face.ring * 48);
  return [
    face.kind,
    face.item ?? '',
    face.faded ? 1 : 0,
    ring,
    face.ringKind ?? '',
    (face.missing ?? []).join(','),
    face.dots ? `${face.dots.filled}/${face.dots.capacity}` : '',
    (face.items ?? []).join(','),
    status.level,
  ].join('|');
}

function drawSign(ctx, face, status) {
  const S = SIGN_PX;
  ctx.clearRect(0, 0, S, S);
  const cx = S / 2;
  const cy = S / 2 + 6;
  const r = 38;
  if (face.kind === 'product' || face.kind === 'storage' || face.kind === 'garden') {
    // Ring (Hintergrund und Fortschritt)
    ctx.lineWidth = 9;
    ctx.strokeStyle = 'rgba(28, 20, 12, 0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.stroke();
    if (face.ring != null && face.ring > 0) {
      ctx.strokeStyle = face.ringKind === 'supply' ? '#69db7c' : '#ffe066';
      ctx.beginPath();
      ctx.arc(cx, cy, r + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, face.ring));
      ctx.stroke();
    }
    // helle Scheibe
    ctx.fillStyle = '#fbf3dc';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (face.kind === 'product' && face.item) {
      ctx.globalAlpha = face.faded ? 0.35 : 1;
      drawItem(ctx, face.item, cx, cy, 50);
      ctx.globalAlpha = 1;
    } else if (face.kind === 'storage') {
      const items = face.items ?? [];
      if (items.length === 0) {
        ctx.font = '38px "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📦', cx, cy + 2);
      } else {
        const spots = [[[0, 0]], [[-13, 0], [13, 0]], [[-13, -11], [13, -11], [0, 13]]][items.length - 1];
        items.forEach((type, i) => drawItem(ctx, type, cx + spots[i][0], cy + spots[i][1], items.length === 1 ? 50 : 30));
      }
    } else if (face.kind === 'garden' && face.item) {
      drawItem(ctx, face.item, cx, cy, 46);
    }
  }
  // Statuslicht oben rechts
  ctx.fillStyle = COLOR[status.level] ?? COLOR.idle;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(S - 20, 22, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // oben links: Vorrat (Punkte) oder fehlende Zutaten („?“)
  if (face.missing?.length) {
    ctx.fillStyle = '#fff3bf';
    ctx.strokeStyle = '#f2b705';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(20, 22, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7a4a00';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 20, 23);
  } else if (face.dots) {
    for (let i = 0; i < face.dots.capacity; i++) {
      ctx.fillStyle = i < face.dots.filled ? '#69db7c' : 'rgba(255, 255, 255, 0.35)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(14 + i * 15, 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

// v0.35.0: Schild „＋ Preis 🪙“ zum Flächenkauf (wie auf der 2D-Karte)
const LAND_SIGN = { w: 256, h: 88 };
function drawLandSign(ctx, price, affordable) {
  const { w, h } = LAND_SIGN;
  ctx.clearRect(0, 0, w, h);
  const r = 34;
  ctx.beginPath();
  ctx.moveTo(8 + r, 8);
  ctx.arcTo(w - 8, 8, w - 8, h - 8, r);
  ctx.arcTo(w - 8, h - 8, 8, h - 8, r);
  ctx.arcTo(8, h - 8, 8, 8, r);
  ctx.arcTo(8, 8, w - 8, 8, r);
  ctx.closePath();
  ctx.fillStyle = 'rgba(36, 26, 16, 0.86)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#f3e6c4';
  ctx.stroke();
  ctx.font = '700 40px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif, "Noto Color Emoji"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = affordable ? '#ffe066' : 'rgba(243, 230, 196, 0.6)';
  ctx.fillText(`＋ ${price.toLocaleString('de-DE')} 🪙`, w / 2, h / 2 + 2);
}

// Was das Schild zeigt: wie die 2D-Karte (buildingFace), beim Beet die Pflanze
function signFace(building) {
  const face = buildingFace(building);
  if (face.kind === 'garden') {
    const crop = gardenCrop(building);
    return { ...face, item: crop?.plant ?? null, ring: crop ? growth(building) : null, ringKind: 'supply' };
  }
  return face;
}

// ---------- Welt ----------

export function createScene3d({ lib }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLOR.sky);
  scene.fog = new THREE.Fog(COLOR.sky, 90, 220);

  // Licht
  const hemi = new THREE.HemisphereLight('#e8f4ff', '#6f8f4f', 1.4);
  const sun = new THREE.DirectionalLight('#ffffff', 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(hemi, sun, sun.target);

  // Boden: draußen Wiese, die Welt etwas dunkler (noch nicht gekauft), das
  // Grundstück hell mit Raster
  const outer = groundRect(600, 600, mat(COLOR.outer), { y: -0.03 });
  outer.receiveShadow = true;
  outer.renderOrder = 0;
  scene.add(outer);
  const groundRoot = new THREE.Group();
  const envRoot = new THREE.Group();
  const beltRoot = new THREE.Group();
  const buildingRoot = new THREE.Group();
  const itemRoot = new THREE.Group();
  const overlayRoot = new THREE.Group(); // Auswahl, Vorschau
  scene.add(groundRoot, envRoot, beltRoot, buildingRoot, itemRoot, overlayRoot);

  let groundKey = '';
  function syncGround(state) {
    const w = state.world;
    const p = state.plot;
    const key = `${w.x},${w.y},${w.width},${w.height}|${p.x},${p.y},${p.width},${p.height}`;
    if (key === groundKey) return;
    groundKey = key;
    groundRoot.clear();
    const locked = groundRect(w.width, w.height, mat(COLOR.locked), { x: w.x + w.width / 2, y: -0.015, z: w.y + w.height / 2 });
    locked.receiveShadow = true;
    groundRoot.add(locked);
    const plot = groundRect(p.width, p.height, mat(COLOR.plot), { x: p.x + p.width / 2, y: -0.005, z: p.y + p.height / 2 });
    plot.receiveShadow = true;
    groundRoot.add(plot);
    // Raster über dem Grundstück
    const pts = [];
    for (let x = p.x; x <= p.x + p.width; x++) pts.push(x, 0.002, p.y, x, 0.002, p.y + p.height);
    for (let z = p.y; z <= p.y + p.height; z++) pts.push(p.x, 0.002, z, p.x + p.width, 0.002, z);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    groundRoot.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: COLOR.gridA, transparent: true, opacity: 0.55 })));
    buildEnvironment(state);
    // Schatten über der ganzen Welt
    const sc = sun.shadow.camera;
    const half = Math.max(w.width, w.height) / 2 + 4;
    sc.left = -half;
    sc.right = half;
    sc.top = half;
    sc.bottom = -half;
    sc.near = 1;
    sc.far = 140;
    sc.updateProjectionMatrix();
    const c = new THREE.Vector3(w.x + w.width / 2, 0, w.y + w.height / 2);
    sun.target.position.copy(c);
    sun.position.copy(c).add(new THREE.Vector3(-12, 26, 15));
  }

  // Zaun ums Grundstück, Bäume und Felsen rund um die Welt (fester Zufall)
  const TREES = [
    ['fantasy-town-kit', 'tree', 0.62],
    ['fantasy-town-kit', 'tree-high', 0.55],
    ['fantasy-town-kit', 'tree-crooked', 0.62],
    ['fantasy-town-kit', 'tree-high-round', 0.55],
    ['castle-kit', 'tree-large', 0.85],
    ['castle-kit', 'tree-small', 0.95],
  ];
  const ROCKS = [
    ['fantasy-town-kit', 'rock-large', 0.55],
    ['fantasy-town-kit', 'rock-small', 0.5],
    ['fantasy-town-kit', 'rock-wide', 0.5],
  ];
  function place(kit, name, { x, z, rot = 0, scale = 1 }) {
    const o = lib.place(kit, name, { variant: COLORS });
    o.position.set(x, 0, z);
    o.rotation.y = rot;
    o.scale.setScalar(scale);
    envRoot.add(o);
    return o;
  }
  let envSpots = []; // wo Bäume und Felsen stehen (für den Browser-Test)
  function buildEnvironment(state) {
    disposeMerged(envRoot);
    envRoot.clear();
    envSpots = [];
    const w = state.world;
    const p = state.plot;
    // Zaun direkt außerhalb des Grundstücks
    const fence = (x, z, side) => place('fantasy-town-kit', 'fence', { x, z, rot: FACE[side] });
    for (let x = p.x - 1; x < p.x + p.width + 1; x++) {
      fence(x + 0.5, p.y - 0.5, 'N');
      fence(x + 0.5, p.y + p.height + 0.5, 'S');
    }
    for (let z = p.y; z < p.y + p.height; z++) {
      fence(p.x - 0.5, z + 0.5, 'W');
      fence(p.x + p.width + 0.5, z + 0.5, 'E');
    }
    // Bäume rund um die Welt – v0.40.0: nur außerhalb der Welt (Tobias,
    // Chat 25: Bäume ragten aus Häusern, die auf ihnen gebaut wurden)
    let seed = 11;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const count = Math.round((w.width + w.height) * 1.3);
    const margin = 1.5;
    const inWorld = (x, z) => x > w.x - margin && x < w.x + w.width + margin && z > w.y - margin && z < w.y + w.height + margin;
    for (let i = 0, placed = 0; placed < count && i < count * 4; i++) {
      const angle = rand() * Math.PI * 2;
      const r = rand();
      const x = w.x + w.width / 2 + Math.cos(angle) * (w.width / 2 + 2 + r * 7);
      const z = w.y + w.height / 2 + Math.sin(angle) * (w.height / 2 + 2 + r * 6);
      const pick = rand();
      const rot = rand() * Math.PI * 2;
      const size = 0.85 + rand() * 0.4;
      const [kit, name, s] = pick < 0.12 ? ROCKS[Math.floor(rand() * ROCKS.length)] : TREES[Math.floor(rand() * TREES.length)];
      if (inWorld(x, z)) continue;
      place(kit, name, { x, z, rot, scale: s * size });
      envSpots.push({ x, z });
      placed++;
    }
    mergeStatic(envRoot); // v0.40.0: Zaun, Bäume und Felsen als wenige Teile
  }

  // ---------- Gebäude ----------

  const views = new Map(); // id → { key, group, house, ports, sign, building, … }
  // v0.40.0: die Pfeile aller Gebäude als wenige Teile (portRoot), neu
  // zusammengefügt nur, wenn Gebäude dazukommen, wegfallen oder verschoben werden
  const portRoot = new THREE.Group();
  scene.add(portRoot);
  let buildingsVersion = 0;

  function buildingKey(b) {
    return `${b.type}|${b.x}|${b.y}|${b.rot ?? 0}`;
  }

  function makeView(b) {
    const { width: w, height: d } = footprintSize(b.type, b.rot);
    const built = buildKenneyBuilding(lib, b);
    const group = built.group;
    group.position.set(b.x + w / 2, 0, b.y + d / 2);
    group.userData.buildingId = b.id;
    const box = new THREE.Box3().setFromObject(group);
    const top = Number.isFinite(box.max.y) ? box.max.y : 1;
    const ports = portArrows(b);
    // Schild
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIGN_PX;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false, transparent: true }));
    sign.renderOrder = 10;
    const size = b.type === 'versandportal' ? 0.6 : Math.min(1.15, 0.6 + Math.min(w, d) * 0.25);
    sign.scale.set(size, size, 1);
    sign.position.set(b.x + w / 2, top + size * 0.45, b.y + d / 2);
    sign.userData.size = size;
    sign.userData.top = top;
    buildingRoot.add(group, sign);
    buildingsVersion++;
    const view = {
      key: buildingKey(b),
      group,
      parts: built.parts,
      ports,
      sign,
      canvas,
      texture,
      signKey: '',
      wantSign: b.type !== 'versandportal',
      level: 'idle',
      building: b,
      bounce: 0,
      pop: 0,
      lastShipped: b.prod?.shipped ?? 0,
    };
    if (view.parts.wheel && view.parts.wheelAxis === 'x') view.parts.wheel.rotation.order = 'YXZ';
    return view;
  }

  function dropView(view) {
    buildingRoot.remove(view.group, view.ports, view.sign);
    disposeMerged(view.group);
    disposeMerged(view.ports);
    buildingsVersion++;
    view.texture.dispose();
    view.sign.material.dispose();
  }

  function syncBuildings(state) {
    const seen = new Set();
    for (const b of state.buildings) {
      seen.add(b.id);
      let view = views.get(b.id);
      if (view && view.key !== buildingKey(b)) {
        dropView(view);
        view = null;
      }
      if (!view) {
        view = makeView(b);
        views.set(b.id, view);
        signScale = 0; // neues Schild: Größe passend zur Entfernung setzen
      }
      view.building = b;
    }
    for (const [id, view] of views) {
      if (!seen.has(id)) {
        dropView(view);
        views.delete(id);
      }
    }
  }

  function updateSign(state, view) {
    const b = view.building;
    const status = buildingStatus(state, b);
    view.level = status.level;
    // Das Versandportal zeigt nur dann ein Schild, wenn es nichts annimmt.
    view.wantSign = b.type !== 'versandportal' || status.level === 'blocked';
    if (!view.wantSign || signsFar) return; // v0.40.0: von weitem nur das Statuslicht
    const face = signFace(b);
    const key = signKey(face, status);
    if (key === view.signKey) return;
    view.signKey = key;
    drawSign(view.canvas.getContext('2d'), face, status);
    view.texture.needsUpdate = true;
  }

  // ---------- Bänder ----------

  // v0.40.0: Jedes Band-Feld wird einzeln gebaut (und gemerkt), gezeichnet
  // werden aber alle zusammen als wenige Teile (beltRoot); neu
  // zusammengefügt nur, wenn sich Bänder ändern oder ein Bereich verschoben wird.
  const belts = new Map(); // key → { sig, group, arrow }
  let beltsVersion = 0;
  const arrowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    g.strokeStyle = 'rgba(255, 214, 120, 0.85)';
    g.lineWidth = 6;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(20, 40);
    g.lineTo(32, 26);
    g.lineTo(44, 40);
    g.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  })();
  const arrowMat = new THREE.MeshBasicMaterial({ map: arrowTex, transparent: true, depthWrite: false });
  const arrowGeo = new THREE.PlaneGeometry(0.5, 1);
  const DIR_ANGLE = { N: 0, E: -Math.PI / 2, S: Math.PI, W: Math.PI / 2 };

  let beltsKey = '';
  function syncBelts(state) {
    // Schneller Vergleich: ändert sich nichts an Bändern und Gebäuden, bleibt alles.
    let key = '';
    for (const k in state.belts) key += `${k}:${state.belts[k].outs.join('')};`;
    for (const b of state.buildings) key += `${buildingKey(b)};`;
    if (key === beltsKey) return;
    beltsKey = key;
    const seen = new Set();
    for (const k of Object.keys(state.belts)) {
      seen.add(k);
      const pieces = beltPieces(state, k);
      const sig = JSON.stringify(pieces) + state.belts[k].outs[0];
      const old = belts.get(k);
      if (old && old.sig === sig) continue;
      beltsVersion++;
      const { x, y } = parseTileKey(k);
      const group = buildBeltTile(lib, state, k);
      group.position.set(x + 0.5, 0, y + 0.5);
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.rotation.x = -Math.PI / 2;
      arrow.rotation.z = DIR_ANGLE[state.belts[k].outs[0]] ?? 0;
      arrow.position.set(x + 0.5, BELT_TOP + 0.004, y + 0.5);
      arrow.renderOrder = 1;
      belts.set(k, { sig, group, arrow });
    }
    for (const k of belts.keys()) {
      if (!seen.has(k)) {
        belts.delete(k);
        beltsVersion++;
      }
    }
  }

  let portsKey = '';
  function syncPorts(ui) {
    const movingId = ui.ghost?.movingId ?? null;
    const key = `${buildingsVersion}|${movingId}|${[...hidden.buildings].sort().join(',')}`;
    if (key === portsKey) return;
    portsKey = key;
    disposeMerged(portRoot);
    portRoot.clear();
    const sources = [];
    for (const v of views.values()) if (v.building.id !== movingId && !hidden.buildings.has(v.building.id)) sources.push(v.ports);
    for (const m of mergeMeshes(sources).meshes) portRoot.add(m);
  }

  let beltMeshKey = '';
  function syncBeltMesh() {
    const key = `${beltsVersion}|${[...hidden.belts].sort().join(';')}`;
    if (key === beltMeshKey) return;
    beltMeshKey = key;
    disposeMerged(beltRoot);
    beltRoot.clear();
    const sources = [];
    for (const [k, b] of belts) if (!hidden.belts.has(k)) sources.push(b.group, b.arrow);
    for (const m of mergeMeshes(sources).meshes) beltRoot.add(m);
  }

  // ---------- Waren auf den Bändern ----------

  // v0.40.0: Jede Warensorte ist ein Teil mit vielen Stellen (Instancing) –
  // hundert Holzblöcke kosten so so viel wie einer; Waren werfen keinen Schatten.
  const itemKinds = new Map(); // type → { geo, mat, mesh, cap }
  function itemKind(type) {
    let kind = itemKinds.get(type);
    if (!kind) {
      const merged = mergeMeshes([itemTemplate(type)]).meshes[0];
      kind = { geo: merged.geometry, mat: merged.material, mesh: null, cap: 0 };
      itemKinds.set(type, kind);
    }
    return kind;
  }
  const itemSpot = new THREE.Object3D();
  let itemCount = 0;

  function itemPosition(key, belt, alpha) {
    const { x, y } = parseTileKey(key);
    const item = belt.item;
    const prog = item.progress >= 1 ? 1 : Math.min(1, item.progress + BELT_SPEED * TICK * alpha);
    const exit = belt.outs[(belt.rr ?? 0) % belt.outs.length];
    let dx = 0;
    let dz = 0;
    if (prog < 0.5) {
      const f = prog / 0.5;
      const from = DELTA[item.from] ?? { x: 0, y: 0 };
      dx = from.x * 0.5 * (1 - f);
      dz = from.y * 0.5 * (1 - f);
    } else {
      const f = (prog - 0.5) / 0.5;
      dx = DELTA[exit].x * 0.5 * f;
      dz = DELTA[exit].y * 0.5 * f;
    }
    return { x: x + 0.5 + dx, z: y + 0.5 + dz };
  }

  function syncItems(state, alpha) {
    const spots = new Map(); // type → [x, z, Drehung, …]
    itemCount = 0;
    for (const key in state.belts) {
      const belt = state.belts[key];
      const type = belt.item?.type;
      if (!type) continue;
      itemCount++;
      if (hidden.belts.has(key)) continue;
      const pos = itemPosition(key, belt, alpha);
      const exit = belt.item.progress < 0.5 ? (belt.item.from ? OPPOSITE[belt.item.from] : belt.outs[0]) : belt.outs[(belt.rr ?? 0) % belt.outs.length];
      if (!spots.has(type)) spots.set(type, []);
      spots.get(type).push(pos.x, pos.z, FACE[exit] ?? 0);
    }
    for (const [type, kind] of itemKinds) if (kind.mesh && !spots.has(type)) kind.mesh.count = 0;
    for (const [type, list] of spots) {
      const kind = itemKind(type);
      const n = list.length / 3;
      if (n > kind.cap) {
        if (kind.mesh) itemRoot.remove(kind.mesh);
        kind.cap = Math.max(16, 2 ** Math.ceil(Math.log2(n)));
        kind.mesh = new THREE.InstancedMesh(kind.geo, kind.mat, kind.cap);
        kind.mesh.castShadow = false;
        kind.mesh.receiveShadow = true;
        kind.mesh.frustumCulled = false;
        itemRoot.add(kind.mesh);
      }
      for (let i = 0; i < n; i++) {
        itemSpot.position.set(list[i * 3], BELT_TOP, list[i * 3 + 1]);
        itemSpot.rotation.set(0, list[i * 3 + 2], 0);
        itemSpot.updateMatrix();
        kind.mesh.setMatrixAt(i, itemSpot.matrix);
      }
      kind.mesh.count = n;
      kind.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  // ---------- Auswahl und Vorschau ----------

  const selectMat = flatMat(COLOR.select, { opacity: 0.95 });
  const lineMat = flatMat(COLOR.select, { opacity: 0.3 });
  const previewMat = flatMat(COLOR.preview, { opacity: 0.4 });
  const previewArrowColor = '#fff8dc';
  let overlayKey = '';
  let ghost = null; // { key, group }
  let lastSelectedId = null;

  function ghostMaterial(valid) {
    return new THREE.MeshStandardMaterial({
      color: valid ? COLOR.ok : COLOR.bad,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      roughness: 0.8,
    });
  }

  // Die Vorschau wird um das Feld (0, 0) gebaut und nur verschoben, solange
  // sich Gebäude, Drehung und Farbe (passt / passt nicht) nicht ändern.
  const ghostMats = { true: ghostMaterial(true), false: ghostMaterial(false) };
  const ghostFlat = { true: flatMat(COLOR.ok, { opacity: 0.35 }), false: flatMat(COLOR.bad, { opacity: 0.35 }) };
  const ghostEdge = { true: flatMat(COLOR.ok, { opacity: 0.95 }), false: flatMat(COLOR.bad, { opacity: 0.95 }) };
  function syncGhost(ui) {
    const g = ui.ghost;
    const key = g ? `${g.type}|${g.rot}|${Boolean(g.valid)}` : '';
    if (!ghost || ghost.key !== key) {
      if (ghost) overlayRoot.remove(ghost.group);
      ghost = null;
      if (!g) return;
      const valid = Boolean(g.valid);
      const b = { id: -1, type: g.type, x: 0, y: 0, rot: g.rot };
      const { width: w, height: d } = footprintSize(g.type, g.rot);
      const group = new THREE.Group();
      const built = buildKenneyBuilding(lib, b);
      built.group.traverse((o) => {
        if (o.isMesh || o.isLineSegments) {
          o.material = ghostMats[valid];
          o.castShadow = false;
          o.renderOrder = 4;
        }
      });
      built.group.position.set(w / 2, 0, d / 2);
      group.add(built.group);
      group.add(groundRect(w, d, ghostFlat[valid], { x: w / 2, y: 0.015, z: d / 2 }));
      group.add(frame(0, 0, w, d, ghostEdge[valid]));
      group.add(portArrows(b));
      overlayRoot.add(group);
      ghost = { key, group };
    }
    ghost.group.position.set(g.x, 0, g.y);
  }

  const overlay = new THREE.Group();
  overlayRoot.add(overlay);
  function syncOverlay(state, ui) {
    const sel = ui.selected;
    const prev = ui.beltPreview;
    const key = JSON.stringify([
      sel,
      prev?.tiles,
      prev?.endDir,
      sel?.kind === 'building' ? buildingKey(views.get(sel.id)?.building ?? {}) : '',
      sel?.kind === 'belt' ? beltsKey.length : 0,
      sel?.kind === 'land' ? state.plot : 0,
    ]);
    if (key === overlayKey) return;
    overlayKey = key;
    disposeMerged(overlay);
    overlay.clear();
    if (sel?.kind === 'building') {
      const view = views.get(sel.id);
      if (view) {
        const b = view.building;
        const { width: w, height: d } = footprintSize(b.type, b.rot);
        overlay.add(frame(b.x - 0.04, b.y - 0.04, w + 0.08, d + 0.08, selectMat, { width: 0.1 }));
      }
    } else if (sel?.kind === 'belt') {
      const line = beltLine(state, sel.x, sel.y).map((k) => {
        const t = parseTileKey(k);
        return { x: t.x + 0.5, z: t.y + 0.5, w: 1, d: 1, y: 0.012 };
      });
      if (line.length) overlay.add(flatRects(line, lineMat));
      overlay.add(frame(sel.x + 0.04, sel.y + 0.04, 0.92, 0.92, selectMat, { y: BELT_TOP + 0.02, width: 0.07 }));
    } else if (sel?.kind === 'land') {
      // v0.35.0: der Streifen, der gekauft würde
      const offer = landOffer(state, sel.side);
      if (offer) {
        overlay.add(groundRect(offer.width, offer.height, lineMat, { x: offer.x + offer.width / 2, y: 0.012, z: offer.y + offer.height / 2 }));
        overlay.add(frame(offer.x, offer.y, offer.width, offer.height, selectMat, { width: 0.1 }));
      }
    }
    if (prev) {
      const dirs = pathDirections(prev);
      prev.tiles.forEach((t, i) => {
        overlay.add(groundRect(0.9, 0.9, previewMat, { x: t.x + 0.5, y: 0.012, z: t.y + 0.5 }));
        const dir = dirs[i];
        if (dir) {
          const onBelt = Boolean(beltAt(state, t.x, t.y));
          overlay.add(flatArrow(previewArrowColor, dir, { x: t.x + 0.5, y: onBelt ? BELT_TOP + 0.05 : 0.05, z: t.y + 0.5, scale: 1.1 }));
        }
      });
    }
  }

  // ---------- Bereich markieren und verschieben (v0.35.0) ----------
  // Wie im 2D-Spiel (v0.11.0): Beim Markieren leuchten die erfassten Gebäude
  // und Bänder gelb, beim Ziehen zeigt ein Rahmen das Rechteck. Beim
  // Verschieben verschwindet der Bereich an der alten Stelle (dort bleiben
  // blasse Felder), die Vorschau zeigt ihn an der neuen Stelle – grüne Felder
  // passen, rote sind belegt oder gehören nicht zum Grundstück.

  const areaMarks = new THREE.Group();
  const areaGhostRoot = new THREE.Group();
  const areaTiles = new THREE.Group();
  overlayRoot.add(areaMarks, areaGhostRoot, areaTiles);
  const markMat = flatMat(COLOR.select, { opacity: 0.38 });
  const rectMat = flatMat('#fff8dc', { opacity: 0.95 });
  const oldSpotMat = flatMat('#fff8dc', { opacity: 0.22 });
  const okMat = flatMat(COLOR.ok, { opacity: 0.32 });
  const badMat = flatMat(COLOR.bad, { opacity: 0.6 });
  const hidden = { buildings: new Set(), belts: new Set() };
  let marksKey = '';
  let areaGhost = null; // { key, at: { x, y } }
  let tilesKey = '';

  function syncArea(state, ui) {
    const area = ui.area ?? null;
    const marking = ui.mode === 'area' && area;
    const g = ui.mode === 'areaMove' ? area?.ghost : null;
    const plan = g?.plan ?? null;

    // markierte Gebäude und Bänder, Rahmen beim Ziehen
    const mk = marking ? JSON.stringify([area.sel, area.rect, beltsKey.length]) : '';
    if (mk !== marksKey) {
      marksKey = mk;
      disposeMerged(areaMarks);
      areaMarks.clear();
      if (marking) {
        // v0.40.0: alle Markierungen als je ein Teil
        const marks = [];
        const frames = [];
        for (const key of area.sel.belts) {
          const t = parseTileKey(key);
          marks.push({ x: t.x + 0.5, z: t.y + 0.5, w: 1, d: 1, y: BELT_TOP + 0.015 });
        }
        for (const id of area.sel.buildings) {
          const b = state.buildings.find((item) => item.id === id);
          if (!b) continue;
          const { width: w, height: d } = footprintSize(b.type, b.rot);
          marks.push({ x: b.x + w / 2, z: b.y + d / 2, w, d, y: 0.014 });
          frames.push(...frameRects(b.x + 0.03, b.y + 0.03, w - 0.06, d - 0.06, { width: 0.09 }));
        }
        if (marks.length) areaMarks.add(flatRects(marks, markMat));
        if (frames.length) areaMarks.add(flatRects(frames, selectMat));
        if (area.rect) {
          const { a, b } = area.rect;
          const x = Math.min(a.x, b.x);
          const y = Math.min(a.y, b.y);
          areaMarks.add(frame(x, y, Math.abs(a.x - b.x) + 1, Math.abs(a.y - b.y) + 1, rectMat, { y: BELT_TOP + 0.03, width: 0.07 }));
        }
      }
    }

    // was verschoben wird, ist an der alten Stelle ausgeblendet
    hidden.buildings = new Set(plan ? area.sel.buildings : []);
    hidden.belts = new Set(plan ? area.sel.belts : []);

    // Vorschau an der neuen Stelle (nur neu gebaut, wenn sich die Drehung
    // ändert – sonst nur verschoben; v0.40.0: „passt / passt nicht“ wechselt
    // nur die Farbe, und die ganze Vorschau ist zu wenigen Teilen zusammengefügt)
    const gk = plan ? `${g.turns}|${JSON.stringify(area.sel)}` : '';
    if (!areaGhost || areaGhost.key !== gk) {
      disposeMerged(areaGhostRoot);
      areaGhostRoot.clear();
      areaGhost = null;
      if (plan) {
        const m = ghostMats[plan.valid];
        const pseudo = { belts: plan.belts, buildings: plan.buildings };
        for (const b of plan.buildings) {
          const { width: w, height: d } = footprintSize(b.type, b.rot);
          const built = buildKenneyBuilding(lib, b);
          built.group.position.set(b.x + w / 2, 0, b.y + d / 2);
          areaGhostRoot.add(built.group, portArrows(b));
        }
        for (const key of Object.keys(plan.belts)) {
          const t = parseTileKey(key);
          const tile = buildBeltTile(lib, pseudo, key);
          tile.position.set(t.x + 0.5, 0, t.y + 0.5);
          areaGhostRoot.add(tile);
        }
        areaGhostRoot.traverse((o) => {
          if (o.isMesh && o.material !== m && !o.material.isMeshBasicMaterial) {
            o.material = m;
            o.castShadow = false;
            o.renderOrder = 4;
          }
        });
        mergeStatic(areaGhostRoot);
        areaGhost = { key: gk, at: { x: g.x, y: g.y }, valid: plan.valid };
      }
    }
    if (areaGhost && plan && areaGhost.valid !== plan.valid) {
      const from = ghostMats[areaGhost.valid];
      const to = ghostMats[plan.valid];
      areaGhostRoot.traverse((o) => {
        if (o.isMesh && o.material === from) o.material = to;
      });
      areaGhost.valid = plan.valid;
    }
    if (areaGhost) areaGhostRoot.position.set(g.x - areaGhost.at.x, 0, g.y - areaGhost.at.y);
    else areaGhostRoot.position.set(0, 0, 0);

    // Felder: alte Stelle blass, neue grün bzw. rot, Rahmen um die Vorschau
    const tk = plan ? JSON.stringify([g.x, g.y, g.turns, plan.valid, plan.tiles.map((t) => (t.ok ? 1 : 0)).join(''), area.sel]) : '';
    if (tk !== tilesKey) {
      tilesKey = tk;
      disposeMerged(areaTiles);
      areaTiles.clear();
      if (plan) {
        // v0.40.0: alle Felder als je ein Teil (wird bei jedem Schritt des Fingers neu gebaut)
        const old = selectionTiles(state, area.sel).map((t) => ({ x: t.x + 0.5, z: t.y + 0.5, w: 0.94, d: 0.94, y: 0.01 }));
        const ok = [];
        const bad = [];
        for (const t of plan.tiles) (t.ok ? ok : bad).push({ x: t.x + 0.5, z: t.y + 0.5, w: 0.96, d: 0.96, y: t.ok ? 0.016 : BELT_TOP + 0.06 });
        if (old.length) areaTiles.add(flatRects(old, oldSpotMat));
        if (ok.length) areaTiles.add(flatRects(ok, okMat));
        if (bad.length) areaTiles.add(flatRects(bad, badMat));
        areaTiles.add(flatRects(frameRects(g.x, g.y, plan.width, plan.height, { y: BELT_TOP + 0.04, width: 0.09 }), ghostEdge[plan.valid]));
      }
    }
  }

  // ---------- Fläche kaufen (v0.35.0) ----------
  // An jeder Seite, an der es noch Fläche gibt, schwebt ein Schild mit dem
  // Preis direkt vor dem Zaun; antippen wählt den Streifen (wie im 2D-Spiel).

  const landRoot = new THREE.Group();
  scene.add(landRoot);
  let landKey = '';
  const landSigns = [];
  function syncLand(state, ui) {
    const show = ui.mode === 'normal' || ui.mode === 'menu';
    landRoot.visible = show;
    if (!show) return;
    const offers = landOffers(state);
    const key = JSON.stringify([state.plot, offers.map((o) => [o.side, o.price, state.gold >= o.price])]);
    if (key === landKey) return;
    landKey = key;
    for (const s of landSigns) {
      s.material.map.dispose();
      s.material.dispose();
    }
    landSigns.length = 0;
    landRoot.clear();
    const p = state.plot;
    for (const offer of offers) {
      const canvas = document.createElement('canvas');
      canvas.width = LAND_SIGN.w;
      canvas.height = LAND_SIGN.h;
      drawLandSign(canvas.getContext('2d'), offer.price, state.gold >= offer.price);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false, transparent: true }));
      sign.renderOrder = 9;
      let x = offer.x + offer.width / 2;
      let z = offer.y + offer.height / 2;
      if (offer.side === 'N') z = p.y - 1.6;
      if (offer.side === 'S') z = p.y + p.height + 1.6;
      if (offer.side === 'W') x = p.x - 1.9;
      if (offer.side === 'E') x = p.x + p.width + 1.9;
      sign.position.set(x, 0.7, z);
      sign.userData = { side: offer.side, w: 1.8, h: 1.8 * (LAND_SIGN.h / LAND_SIGN.w) };
      landSigns.push(sign);
      landRoot.add(sign);
    }
    signScale = 0; // Größe passend zur Entfernung setzen
  }

  // ---------- Bewegung ----------

  // Rauch aus Schornsteinen (wenige Kugeln, die aufsteigen und verblassen)
  const smokeGeo = new THREE.SphereGeometry(0.12, 8, 6);
  const smoke = [];
  for (let i = 0; i < 24; i++) {
    const m = new THREE.Mesh(smokeGeo, new THREE.MeshBasicMaterial({ color: '#d9d6d0', transparent: true, opacity: 0.6, depthWrite: false }));
    m.visible = false;
    scene.add(m);
    smoke.push({ mesh: m, life: 0 });
  }
  let smokeTimer = 0;

  function isWorking(b) {
    const p = productionOf(b.type);
    if (p?.kind === 'source') return Boolean(b.prod.loaded);
    if (p?.kind === 'workshop') return Boolean(b.prod.busy);
    return false;
  }

  let time = 0;
  function animate(state, ui, dt) {
    time += dt;
    arrowTex.offset.y = (arrowTex.offset.y - dt * BELT_SPEED) % 1;
    // Antippen lässt das Gebäude kurz hüpfen
    const selId = ui.selected?.kind === 'building' ? ui.selected.id : null;
    if (selId !== lastSelectedId) {
      const v = views.get(selId);
      if (v) v.bounce = 1;
      lastSelectedId = selId;
    }
    const movingId = ui.ghost?.movingId ?? null;
    smokeTimer -= dt;
    for (const v of views.values()) {
      const b = v.building;
      const moving = b.id === movingId || hidden.buildings.has(b.id);
      v.group.visible = !moving;
      // v0.40.0: von weitem nur das Statuslicht (statusDots), sonst das Schild
      v.sign.visible = v.wantSign && !moving && !signsFar;
      const working = isWorking(b);
      const { wheel } = v.parts;
      if (wheel && working) {
        if (v.parts.wheelAxis === 'x') wheel.rotation.x -= dt * 2.2;
        else wheel.rotation.y += dt * 3;
      }
      const shipped = b.prod?.shipped ?? 0;
      if (shipped > v.lastShipped) v.pop = 1;
      v.lastShipped = shipped;
      if (v.pop > 0) v.pop = Math.max(0, v.pop - dt * 3);
      if (v.parts.shimmer) animateShimmer(v.parts.shimmer, time, Math.sin(v.pop * Math.PI));
      if (v.bounce > 0) v.bounce = Math.max(0, v.bounce - dt * 2.8);
      const squash = Math.sin(v.bounce * Math.PI * 2) * v.bounce * 0.18;
      v.group.scale.set(1 - squash * 0.5, 1 + squash, 1 - squash * 0.5);
      if (v.parts.glow) for (const m of v.parts.glow) m.emissiveIntensity = working ? 1.2 : 0.15;
      if (working && v.parts.chimneyTop && smokeTimer <= 0) {
        const free = smoke.find((s) => s.life <= 0);
        if (free) {
          free.life = 1;
          free.mesh.position.copy(v.parts.chimneyTop).add(v.group.position);
          free.mesh.visible = true;
        }
      }
    }
    if (smokeTimer <= 0) smokeTimer = 0.18;
    for (const s of smoke) {
      if (s.life <= 0) continue;
      s.life -= dt * 0.45;
      if (s.life <= 0) {
        s.mesh.visible = false;
        s.life = 0;
        continue;
      }
      s.mesh.position.y += dt * 0.55;
      s.mesh.position.x += dt * 0.12;
      s.mesh.scale.setScalar(0.6 + (1 - s.life) * 1.6);
      s.mesh.material.opacity = 0.55 * s.life;
    }
  }

  // ---------- Ein Bild ----------

  // Von weitem werden die Schilder größer, damit man sie noch lesen kann; ganz
  // nah etwas kleiner, damit sie die Häuser nicht verdecken.
  let signScale = 1;
  // v0.40.0 (Tobias, Chat 25: Vorschlag A): Von weitem zeigt jedes Gebäude nur
  // ein kleines Statuslicht (grün arbeitet, gelb wartet, rot blockiert) –
  // alle zusammen als ein Teil; Ware, Ring und Vorrat erst beim Heranzoomen.
  // Ab diesem Abstand gilt „von weitem“ – auf dem Tablet (800 Punkte hoch) 32;
  // auf niedrigeren Bildschirmen (Handy) später, weil dort schon die
  // Startansicht weiter weg ist (höchstens doppelt so weit).
  const SIGN_FAR = 32;
  const farDistance = (viewHeight) => SIGN_FAR * THREE.MathUtils.clamp(800 / Math.max(1, viewHeight), 1, 2);
  let signsFar = false;
  const dotTexture = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff';
    g.strokeStyle = 'rgba(40, 30, 20, 0.9)';
    g.lineWidth = 4;
    g.beginPath();
    g.arc(16, 16, 12, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const dots = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ size: 13, sizeAttenuation: false, vertexColors: true, map: dotTexture, transparent: true, alphaTest: 0.3, depthTest: false, depthWrite: false }),
  );
  dots.renderOrder = 10;
  dots.frustumCulled = false;
  dots.visible = false;
  scene.add(dots);
  let dotCount = 0;
  const dotColor = new THREE.Color();
  function syncDots(state) {
    dots.visible = signsFar;
    if (!signsFar) return;
    const pos = [];
    const col = [];
    for (const v of views.values()) {
      if (!v.wantSign || !v.group.visible) continue;
      pos.push(v.sign.position.x, v.sign.userData.top + 0.35, v.sign.position.z);
      dotColor.set(COLOR[v.level] ?? COLOR.idle);
      col.push(dotColor.r, dotColor.g, dotColor.b);
    }
    dotCount = pos.length / 3;
    dots.geometry.dispose();
    dots.geometry = new THREE.BufferGeometry();
    dots.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    dots.geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  }

  function scaleSigns(distance, viewHeight = 800) {
    const far = distance > farDistance(viewHeight);
    if (far !== signsFar) {
      signsFar = far;
      signTimer = 0; // Schilder bzw. Lichter gleich neu
      for (const v of views.values()) v.signKey = '';
    }
    const k = THREE.MathUtils.clamp(distance / 16, 0.65, 2.4);
    if (Math.abs(k - signScale) < 0.01) return;
    signScale = k;
    for (const v of views.values()) {
      const s = v.sign.userData.size * k;
      v.sign.scale.set(s, s, 1);
      v.sign.position.y = v.sign.userData.top + s * 0.45;
    }
    const kl = Math.min(k, 1.5); // Flächen-Schilder wachsen weniger mit, sie sind schon breit
    for (const sign of landSigns) sign.scale.set(sign.userData.w * kl, sign.userData.h * kl, 1);
  }

  let signTimer = 0;
  function sync(state, ui, dt, distance = 16, viewHeight = 800) {
    scaleSigns(distance, viewHeight);
    syncGround(state);
    syncBuildings(state);
    syncBelts(state);
    syncItems(state, ui.simAlpha ?? 0);
    syncGhost(ui);
    syncOverlay(state, ui);
    syncArea(state, ui);
    syncBeltMesh();
    syncPorts(ui);
    syncLand(state, ui);
    // Schilder etwa 8-mal pro Sekunde prüfen (das reicht für Ring und Licht)
    signTimer -= dt;
    if (signTimer <= 0) {
      signTimer = 0.12;
      for (const v of views.values()) updateSign(state, v);
      syncDots(state);
    }
    animate(state, ui, dt);
  }

  // Für den Browser-Test: Mitte eines Gebäudes über dem Boden
  function buildingTop(id) {
    const v = views.get(id);
    if (!v) return null;
    return { x: v.sign.position.x, y: v.sign.position.y, z: v.sign.position.z };
  }

  return {
    scene,
    sun,
    sync,
    buildingTop,
    counts: () => ({ buildings: views.size, belts: belts.size, items: itemCount }),
    // v0.40.0: von weitem nur Statuslichter statt der Schilder
    // v0.40.0: Bäume und Felsen, die auf der Welt (bebaubar oder kaufbar) stehen – soll 0 sein
    treesInWorld: (state) => envSpots.filter((p) => p.x > state.world.x && p.x < state.world.x + state.world.width && p.z > state.world.y && p.z < state.world.y + state.world.height).length,
    farSigns: () => ({ far: signsFar, dots: signsFar ? dotCount : 0, signs: [...views.values()].filter((v) => v.sign.visible).length }),
    signOf: (id) => views.get(id)?.signKey ?? null,
    shimmerOf: (id) => {
      const s = views.get(id)?.parts.shimmer;
      return s ? Math.round(s.veilMat.opacity * 1000) / 1000 : null;
    },
    wheelOf: (id) => {
      const w = views.get(id)?.parts.wheel;
      return w ? Math.round((w.rotation.x + w.rotation.y) * 1000) / 1000 : null;
    },
    hasGhost: () => Boolean(ghost),
    overlayCount: () => overlay.children.length,
    // v0.35.0: Bereich und Fläche
    areaCounts: () => ({ marks: areaMarks.children.length, ghost: areaGhostRoot.children.length, tiles: areaTiles.children.length }),
    landSigns: () => (landRoot.visible ? landSigns.map((s) => ({ side: s.userData.side, x: s.position.x, y: s.position.y, z: s.position.z })) : []),
  };
}
