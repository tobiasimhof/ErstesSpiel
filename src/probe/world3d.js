// v0.32.0: Grafik-Probe – die 3D-Welt mit three.js: Boden, Bäume, Gebäude,
// Bänder, Waren, Licht und Effekte. Liest nur den Spielzustand (src/core),
// ändert ihn nicht.
//
// Die Gebäude sind vorläufige Platzhalter aus einfachen Formen (Kasten, Dach,
// Schornstein …) in zwei Stilen – Kenneys Modelle kommen dazu, sobald sie
// geladen werden können (kenney.nl ist in Claudes Arbeitsumgebung gesperrt).
//
// Koordinaten: 1 Feld = 1 Einheit, x nach rechts (Osten), z nach unten
// (Süden), y nach oben. Feld (lx, ly) hat seine Mitte bei (lx + 0.5, ly + 0.5).

import * as THREE from 'three';

import { BUILDINGS } from '../core/data/buildings.js';
import { ITEMS } from '../core/data/items.js';
import { RECIPES } from '../core/data/recipes.js';
import { DELTA } from '../core/dirs.js';
import { footprintSize } from '../core/geometry.js';
import { productionOf, sourceInputs } from '../core/production.js';
import { BELT_SPEED, TICK } from '../core/sim.js';
import { parseTileKey } from '../core/state.js';

const DIR_ANGLE = { N: 0, E: -Math.PI / 2, S: Math.PI, W: Math.PI / 2 };

// ---------- kleine Helfer ----------

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra });
}

function mesh(geometry, material, { x = 0, y = 0, z = 0, shadow = true } = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

// Pyramidendach über einer Grundfläche w × d
function roof(w, d, height, material) {
  const geo = new THREE.ConeGeometry(Math.SQRT1_2, height, 4, 1);
  geo.rotateY(Math.PI / 4);
  const m = mesh(geo, material);
  m.scale.set(w, 1, d);
  return m;
}

// Lauf-Pfeile für die Bänder (eine Textur für alle, sie wandert mit)
function beltTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#4a4440';
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = '#2e2a27';
  g.lineWidth = 3;
  for (let y = 0; y <= 64; y += 16) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(64, y);
    g.stroke();
  }
  g.strokeStyle = '#e0b84f';
  g.lineWidth = 6;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(18, 40);
  g.lineTo(32, 24);
  g.lineTo(46, 40);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ---------- Waren ----------

function itemTemplate(type) {
  const def = ITEMS[type] ?? { color: '#cccccc' };
  const color = def.color;
  const g = new THREE.Group();
  switch (type) {
    case 'holzblock':
      g.add(mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), mat(color), { y: 0.11 }));
      break;
    case 'holzplatte':
      g.add(mesh(new THREE.BoxGeometry(0.36, 0.06, 0.28), mat(color), { y: 0.03 }));
      break;
    case 'glas':
      g.add(
        mesh(new THREE.IcosahedronGeometry(0.13, 0), mat(color, { roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.75 }), {
          y: 0.12,
        }),
      );
      break;
    case 'flaeschchen': {
      const glass = mat(color, { roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.8 });
      g.add(mesh(new THREE.SphereGeometry(0.11, 14, 10), glass, { y: 0.11 }));
      g.add(mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.12, 10), glass, { y: 0.25 }));
      g.add(mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.06, 10), mat('#b07a45'), { y: 0.33 }));
      break;
    }
    default:
      g.add(mesh(new THREE.SphereGeometry(0.1, 12, 8), mat(color), { y: 0.1 }));
  }
  return g;
}

// ---------- Gebäude (Platzhalter) ----------

const STYLE = {
  mittelalter: { wall: '#e3d3b0', base: '#8d8a82', timber: '#6b4a2b', door: '#5a3a20' },
  modern: { wall: '#a9aeb3', base: '#6d7378', timber: '#55606b', door: '#3d454d' },
};

// Baut ein Gebäude als Gruppe. parts: Teile, die sich bewegen (Säge, Ring …).
function buildBuilding(building, style) {
  const def = BUILDINGS[building.type];
  const { width: w, height: d } = footprintSize(building.type, building.rot);
  const s = STYLE[style];
  const g = new THREE.Group();
  const parts = {};
  const accent = def.color;
  const windows = [];

  if (building.type === 'versandportal') {
    // Portal: ein schwebender, leuchtender Ring über einem Sockel
    g.add(mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.12, 24), mat(s.base), { y: 0.06 }));
    const ringMat = mat('#8a6bd1', { emissive: '#6b45c9', emissiveIntensity: 0.6, roughness: 0.4 });
    const ring = mesh(new THREE.TorusGeometry(0.3, 0.07, 12, 32), ringMat, { y: 0.55 });
    g.add(ring);
    const core = mesh(new THREE.CircleGeometry(0.24, 24), mat('#c9b5ff', { emissive: '#a58cff', emissiveIntensity: 0.9, side: THREE.DoubleSide }), {
      y: 0.55,
      shadow: false,
    });
    g.add(core);
    parts.ring = ring;
    parts.core = core;
    parts.glow = [ringMat];
    return { group: g, parts, windows };
  }

  if (building.type === 'lagerhaus') {
    // offener Schuppen bzw. Container mit Kisten
    const roofY = style === 'mittelalter' ? 0.75 : 0.7;
    for (const [px, pz] of [[-w / 2 + 0.12, -d / 2 + 0.12], [w / 2 - 0.12, -d / 2 + 0.12], [-w / 2 + 0.12, d / 2 - 0.12], [w / 2 - 0.12, d / 2 - 0.12]]) {
      g.add(mesh(new THREE.BoxGeometry(0.1, roofY, 0.1), mat(s.timber), { x: px, y: roofY / 2, z: pz }));
    }
    const top = style === 'mittelalter' ? roof(w * 1.05, d * 1.15, 0.35, mat(accent)) : mesh(new THREE.BoxGeometry(w * 0.98, 0.08, d * 0.98), mat(s.base));
    top.position.y = style === 'mittelalter' ? roofY + 0.17 : roofY + 0.04;
    g.add(top);
    const crate = mat(style === 'mittelalter' ? '#a8784a' : '#c08a3e');
    for (const [px, pz, sz] of [[-0.45, 0, 0.32], [0, 0.05, 0.28], [0.42, -0.02, 0.34], [0.2, 0.0, 0.2]]) {
      g.add(mesh(new THREE.BoxGeometry(sz, sz, sz), crate, { x: px, y: sz / 2 + (sz === 0.2 ? 0.28 : 0), z: pz }));
    }
    return { group: g, parts, windows };
  }

  // Werkstatt / Rohstoff-Gebäude: Haus mit Dach
  const wallH = 0.7;
  const bw = w * 0.84;
  const bd = d * 0.84;
  g.add(mesh(new THREE.BoxGeometry(bw + 0.08, 0.12, bd + 0.08), mat(s.base), { y: 0.06 }));
  g.add(mesh(new THREE.BoxGeometry(bw, wallH, bd), mat(s.wall), { y: 0.12 + wallH / 2 }));
  if (style === 'mittelalter') {
    // Fachwerk-Balken an den Ecken
    for (const [px, pz] of [[-bw / 2, -bd / 2], [bw / 2, -bd / 2], [-bw / 2, bd / 2], [bw / 2, bd / 2]]) {
      g.add(mesh(new THREE.BoxGeometry(0.09, wallH, 0.09), mat(s.timber), { x: px, y: 0.12 + wallH / 2, z: pz }));
    }
    g.add(mesh(new THREE.BoxGeometry(bw + 0.02, 0.07, bd + 0.02), mat(s.timber), { y: 0.12 + wallH * 0.55 }));
    const r = roof(bw * 1.12, bd * 1.12, 0.75, mat(accent));
    r.position.y = 0.12 + wallH + 0.375;
    g.add(r);
  } else {
    g.add(mesh(new THREE.BoxGeometry(bw + 0.1, 0.1, bd + 0.1), mat(s.base), { y: 0.12 + wallH + 0.05 }));
    g.add(mesh(new THREE.BoxGeometry(bw + 0.01, 0.12, bd + 0.01), mat(accent), { y: 0.12 + wallH * 0.82 }));
  }
  // Tür nach Süden, Fenster an den Seiten (leuchten am Abend)
  g.add(mesh(new THREE.BoxGeometry(0.28, 0.42, 0.04), mat(s.door), { y: 0.12 + 0.21, z: bd / 2 + 0.01 }));
  const winMat = mat('#3a3020', { emissive: '#ffcf6b', emissiveIntensity: 0 });
  for (const px of [-bw / 4 - 0.1, bw / 4 + 0.1]) {
    const win = mesh(new THREE.BoxGeometry(0.18, 0.16, 0.03), winMat, { x: px, y: 0.12 + wallH * 0.62, z: bd / 2 + 0.01, shadow: false });
    g.add(win);
  }
  windows.push(winMat);

  const top = 0.12 + wallH;
  switch (building.type) {
    case 'holzfaeller': {
      // Holzstapel neben dem Haus
      const log = mat('#8a5a2b');
      for (const [px, py] of [[-0.12, 0.09], [0.12, 0.09], [0, 0.25]]) {
        const l = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 10), log, { x: w / 2 - 0.25 + px, y: py, z: d / 2 - 0.08 });
        l.rotation.z = Math.PI / 2;
        l.rotation.y = Math.PI / 2;
        g.add(l);
      }
      break;
    }
    case 'saegewerk': {
      // Kreissäge vor dem Haus
      const blade = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 20), mat('#c9d1d8', { metalness: 0.7, roughness: 0.3 }), {
        x: w / 2 - 0.05,
        y: 0.42,
        z: 0,
      });
      blade.rotation.z = Math.PI / 2;
      g.add(blade);
      g.add(mesh(new THREE.BoxGeometry(0.2, 0.3, 0.5), mat(s.timber), { x: w / 2 - 0.05, y: 0.15, z: 0 }));
      parts.saw = blade;
      break;
    }
    case 'kohlenmeiler':
    case 'schmiede': {
      // Schornstein mit Rauch, glühende Öffnung
      const chimney = mesh(new THREE.BoxGeometry(0.22, 0.7, 0.22), mat(style === 'mittelalter' ? '#9a8d80' : '#7a8085'), {
        x: bw / 4,
        y: top + 0.5,
        z: -bd / 4,
      });
      g.add(chimney);
      const glowMat = mat('#ff8a2a', { emissive: '#ff6a00', emissiveIntensity: 1.2 });
      g.add(mesh(new THREE.BoxGeometry(0.3, 0.22, 0.03), glowMat, { x: 0, y: 0.12 + 0.13, z: bd / 2 + 0.02, shadow: false }));
      parts.chimneyTop = new THREE.Vector3(bw / 4, top + 0.85, -bd / 4);
      parts.glow = [glowMat];
      if (building.type === 'schmiede') {
        g.add(mesh(new THREE.BoxGeometry(0.26, 0.16, 0.12), mat('#444a52', { metalness: 0.6, roughness: 0.4 }), { x: -w / 2 + 0.2, y: 0.2, z: d / 2 - 0.1 }));
      }
      break;
    }
    default:
      break;
  }
  return { group: g, parts, windows };
}

// ---------- Welt ----------

export function createWorld({ state, origin, area }) {
  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);
  const local = (tx, ty) => ({ x: tx - origin.x, z: ty - origin.y });

  // Licht
  const hemi = new THREE.HemisphereLight('#e8f4ff', '#6f8f4f', 1.4);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffffff', 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -14;
  sc.right = 14;
  sc.top = 14;
  sc.bottom = -14;
  sc.near = 1;
  sc.far = 60;
  sun.shadow.bias = -0.0005;
  sun.target.position.set(area.width / 2, 0, area.height / 2);
  scene.add(sun, sun.target);
  const lanterns = [];

  // Boden: Wiese mit Raster über dem Grundstück, außen dunkleres Gras
  const outer = mesh(new THREE.PlaneGeometry(80, 80), mat('#5f8a43'), { x: area.width / 2, y: -0.02, z: area.height / 2, shadow: false });
  outer.rotation.x = -Math.PI / 2;
  root.add(outer);
  const field = mesh(new THREE.PlaneGeometry(area.width + 2, area.height + 2), mat('#7fae55'), {
    x: area.width / 2,
    y: 0,
    z: area.height / 2,
    shadow: false,
  });
  field.rotation.x = -Math.PI / 2;
  root.add(field);
  const grid = new THREE.GridHelper(area.width + 2, area.width + 2, '#5d8a3d', '#6f9c4a');
  grid.position.set(area.width / 2, 0.005, area.height / 2);
  grid.scale.z = (area.height + 2) / (area.width + 2);
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  root.add(grid);

  // Bäume und ein paar Steine rund um das Grundstück (fester Zufall)
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const trunk = mat('#6b4a2b');
  const leafA = mat('#3f7a3a');
  const leafB = mat('#4e8c3f');
  for (let i = 0; i < 46; i++) {
    const angle = rand() * Math.PI * 2;
    const r = 0.5 + rand() * 0.5;
    const x = area.width / 2 + Math.cos(angle) * (area.width / 2 + 2.5 + r * 5);
    const z = area.height / 2 + Math.sin(angle) * (area.height / 2 + 2.5 + r * 4);
    const h = 0.8 + rand() * 0.7;
    const tree = new THREE.Group();
    tree.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, h * 0.5, 6), trunk, { y: h * 0.25 }));
    tree.add(mesh(new THREE.ConeGeometry(0.45, h, 7), rand() < 0.5 ? leafA : leafB, { y: h * 0.5 + h / 2 - 0.1 }));
    tree.position.set(x, 0, z);
    root.add(tree);
  }

  // Bänder: Sockel + laufende Pfeile
  const beltTex = beltTexture();
  const beltTop = new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.9 });
  const beltBase = mat('#2e2a27');
  const beltGeo = new THREE.BoxGeometry(0.92, 0.08, 0.92);
  const beltTopGeo = new THREE.PlaneGeometry(0.72, 1);
  const beltKeys = Object.keys(state.belts);
  for (const key of beltKeys) {
    const { x, y } = parseTileKey(key);
    const p = local(x, y);
    const b = state.belts[key];
    const tile = new THREE.Group();
    tile.position.set(p.x + 0.5, 0, p.z + 0.5);
    tile.add(mesh(beltGeo, beltBase, { y: 0.04 }));
    const top = mesh(beltTopGeo, beltTop, { y: 0.081, shadow: false });
    top.rotation.x = -Math.PI / 2;
    tile.add(top);
    tile.rotation.y = DIR_ANGLE[b.outs[0]] ?? 0;
    root.add(tile);
  }

  // Waren: je Band-Feld ein Platz
  const templates = new Map();
  const template = (type) => {
    if (!templates.has(type)) templates.set(type, itemTemplate(type));
    return templates.get(type);
  };
  const itemSlots = new Map(); // key → { type, obj }

  // Gebäude
  let buildingViews = [];
  const buildingRoot = new THREE.Group();
  root.add(buildingRoot);

  function buildAll(style) {
    buildingRoot.clear();
    buildingViews = state.buildings.map((b) => {
      const { width: w, height: d } = footprintSize(b.type, b.rot);
      const p = local(b.x, b.y);
      const view = buildBuilding(b, style);
      view.group.position.set(p.x + w / 2, 0, p.z + d / 2);
      view.group.userData.buildingId = b.id;
      view.building = b;
      view.bounce = 0;
      view.pop = 0;
      view.lastShipped = b.prod.shipped ?? 0;
      buildingRoot.add(view.group);
      return view;
    });
    for (const l of lanterns) scene.remove(l);
    lanterns.length = 0;
    for (const v of buildingViews) {
      if (v.building.type !== 'versandportal' && v.building.type !== 'kohlenmeiler') continue;
      const light = new THREE.PointLight(v.building.type === 'versandportal' ? '#b89cff' : '#ffb060', 0, 4, 1.6);
      light.position.copy(v.group.position).add(new THREE.Vector3(0, 0.9, 0.4));
      scene.add(light);
      lanterns.push(light);
    }
  }

  // Rauch: wenige Kugeln, die aufsteigen und verblassen
  const smokeMat = new THREE.MeshBasicMaterial({ color: '#d9d6d0', transparent: true, opacity: 0.6, depthWrite: false });
  const smokeGeo = new THREE.SphereGeometry(0.12, 8, 6);
  const smoke = [];
  for (let i = 0; i < 24; i++) {
    const m = new THREE.Mesh(smokeGeo, smokeMat.clone());
    m.visible = false;
    root.add(m);
    smoke.push({ mesh: m, life: 0, source: null });
  }
  let smokeTimer = 0;

  const settings = { style: 'mittelalter', effects: true, light: 'tag' };

  function isWorking(b) {
    const p = productionOf(b.type);
    if (p?.kind === 'source') return Boolean(b.prod.loaded);
    if (p?.kind === 'workshop') return Boolean(b.prod.busy);
    return false;
  }

  // Was ein Gebäude gerade herstellt (für das Schild beim Antippen)
  function productOf(b) {
    const p = productionOf(b.type);
    if (p?.kind === 'workshop') return ITEMS[RECIPES[b.prod.recipe].output]?.name;
    if (p?.kind === 'source') {
      const out = sourceInputs(p)[b.prod.input] ?? Object.values(sourceInputs(p))[0];
      return ITEMS[out]?.name;
    }
    if (p?.kind === 'storage') return 'Holzblöcke für das Band';
    if (p?.kind === 'shipping') return 'schickt Waren ins Laden-Lager';
    return '';
  }

  function applyLight() {
    const evening = settings.light === 'abend';
    scene.background = new THREE.Color(evening ? '#1f2440' : '#a9d6f2');
    scene.fog = new THREE.Fog(evening ? '#1f2440' : '#a9d6f2', 30, 70);
    hemi.color.set(evening ? '#6a76b8' : '#e8f4ff');
    hemi.groundColor.set(evening ? '#2a3326' : '#6f8f4f');
    hemi.intensity = evening ? 0.8 : 1.4;
    sun.color.set(evening ? '#ff9a55' : '#ffffff');
    sun.intensity = evening ? 0.9 : 2.4;
    const c = new THREE.Vector3(area.width / 2, 0, area.height / 2);
    sun.position.copy(c).add(evening ? new THREE.Vector3(-16, 5, 6) : new THREE.Vector3(-8, 18, 10));
    for (const v of buildingViews) for (const m of v.windows) m.emissiveIntensity = evening ? 1.4 : 0;
    for (const l of lanterns) l.intensity = evening ? 6 : 0;
  }

  function applyEffects(renderer) {
    renderer.shadowMap.enabled = settings.effects;
    sun.castShadow = settings.effects;
    for (const s of smoke) s.mesh.visible = false;
    // Materialien neu übersetzen, damit Schatten an- oder ausgehen
    scene.traverse((o) => {
      if (o.material) o.material.needsUpdate = true;
    });
  }

  function setStyle(style) {
    settings.style = style;
    buildAll(style);
    applyLight();
  }

  // Position einer Ware auf dem Band (wie im 2D-Spiel: vom Eingang zur
  // Feldmitte, dann zum Ausgang), alpha schiebt sie zwischen zwei Takten weich weiter.
  function itemPosition(key, belt, alpha) {
    const { x, y } = parseTileKey(key);
    const p = local(x, y);
    const item = belt.item;
    const prog = item.progress >= 1 ? 1 : Math.min(1, item.progress + BELT_SPEED * TICK * alpha);
    const exit = belt.outs[(belt.rr ?? 0) % belt.outs.length];
    let dx = 0;
    let dz = 0;
    if (prog < 0.5) {
      const f = prog / 0.5;
      dx = DELTA[item.from].x * 0.5 * (1 - f);
      dz = DELTA[item.from].y * 0.5 * (1 - f);
    } else {
      const f = (prog - 0.5) / 0.5;
      dx = DELTA[exit].x * 0.5 * f;
      dz = DELTA[exit].y * 0.5 * f;
    }
    return { x: p.x + 0.5 + dx, z: p.z + 0.5 + dz };
  }

  function update(dt, alpha) {
    const fx = settings.effects;
    // Bänder: die Pfeile laufen mit
    if (fx) beltTex.offset.y = (beltTex.offset.y - dt * BELT_SPEED) % 1;

    // Waren
    for (const key of beltKeys) {
      const belt = state.belts[key];
      let slot = itemSlots.get(key);
      const type = belt.item?.type ?? null;
      if (slot && slot.type !== type) {
        root.remove(slot.obj);
        itemSlots.delete(key);
        slot = null;
      }
      if (!type) continue;
      if (!slot) {
        slot = { type, obj: template(type).clone() };
        itemSlots.set(key, slot);
        root.add(slot.obj);
      }
      const pos = itemPosition(key, belt, alpha);
      slot.obj.position.set(pos.x, 0.08, pos.z);
    }

    // Gebäude: Säge, Portal, Hüpfen, Rauch
    smokeTimer -= dt;
    for (const v of buildingViews) {
      const b = v.building;
      const working = isWorking(b);
      if (v.parts.saw && fx && working) v.parts.saw.rotation.x += dt * 14;
      if (v.parts.ring && fx) {
        v.parts.ring.rotation.y += dt * 1.2;
        v.parts.ring.rotation.x = Math.sin(performance.now() / 900) * 0.25;
      }
      const shipped = b.prod.shipped ?? 0;
      if (shipped > v.lastShipped) {
        if (fx) v.pop = 1;
        v.lastShipped = shipped;
      }
      if (v.pop > 0) v.pop = Math.max(0, v.pop - dt * 3);
      if (v.bounce > 0) v.bounce = Math.max(0, v.bounce - dt * 2.8);
      const squash = Math.sin(v.bounce * Math.PI * 2) * v.bounce * 0.18;
      const pop = Math.sin(v.pop * Math.PI) * 0.25;
      v.group.scale.set(1 - squash * 0.5 + pop, 1 + squash + pop, 1 - squash * 0.5 + pop);
      if (v.parts.glow) for (const m of v.parts.glow) m.emissiveIntensity = (working || b.type === 'versandportal' ? 1.2 : 0.15) * (settings.light === 'abend' ? 1.6 : 1);
      if (fx && working && v.parts.chimneyTop && smokeTimer <= 0) {
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
      if (s.life <= 0 || !fx) {
        s.mesh.visible = false;
        s.life = 0;
        continue;
      }
      s.mesh.position.y += dt * 0.55;
      s.mesh.position.x += dt * 0.12;
      const k = 1 - s.life;
      s.mesh.scale.setScalar(0.6 + k * 1.6);
      s.mesh.material.opacity = 0.55 * s.life;
    }
  }

  // Antippen: Gebäude unter dem Finger finden
  const raycaster = new THREE.Raycaster();
  function pick(camera, ndc) {
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(buildingRoot.children, true);
    for (const hit of hits) {
      let o = hit.object;
      while (o && o.userData.buildingId === undefined) o = o.parent;
      if (o) return buildingViews.find((v) => v.group === o) ?? null;
    }
    return null;
  }

  buildAll(settings.style);
  applyLight();

  return {
    scene,
    settings,
    update,
    pick,
    setStyle,
    applyLight,
    applyEffects,
    productOf,
    views: () => buildingViews,
    itemCount: () => itemSlots.size,
  };
}
