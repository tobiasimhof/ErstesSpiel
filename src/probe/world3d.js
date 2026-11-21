// v0.32.0: Grafik-Probe – die 3D-Welt mit three.js: Boden, Umgebung,
// Gebäude, Bänder, Waren, Licht und Effekte. Liest nur den Spielzustand
// (src/core), ändert ihn nicht.
//
// v0.33.0 (Teil 2): Gebäude, Bänder, Bäume und Zaun sind Kenneys Modelle
// (kenney3d.js, models.js) statt Platzhaltern. Neuer Schalter „Farben“:
// Kenneys eigene Farben oder die Farben des Spiels (Dächer bzw. Maschinen in
// der Farbe ihres Reiters, wärmerer Stein).
//
// Koordinaten: 1 Feld = 1 Einheit, x nach rechts (Osten), z nach unten
// (Süden), y nach oben. Feld (lx, ly) hat seine Mitte bei (lx + 0.5, ly + 0.5).

import * as THREE from 'three';

import { ITEMS } from '../core/data/items.js';
import { RECIPES } from '../core/data/recipes.js';
import { DELTA } from '../core/dirs.js';
import { footprintSize } from '../core/geometry.js';
import { productionOf, sourceInputs } from '../core/production.js';
import { BELT_SPEED, TICK } from '../core/sim.js';
import { parseTileKey } from '../core/state.js';
import { BELT_TOP, animateShimmer, buildBeltTile, buildKenneyBuilding, buildSurroundings } from './kenney3d.js';

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

// Lauf-Pfeile auf den Bändern (eine Textur für alle, sie wandert mit)
function arrowTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 64, 64);
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
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const DIR_ANGLE = { N: 0, E: -Math.PI / 2, S: Math.PI, W: Math.PI / 2 };

// ---------- Waren (eigene Formen – solche Waren gibt es bei Kenney nicht) ----------

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

// ---------- Welt ----------

const GROUND = {
  mittelalter: { field: '#7fae55', outer: '#5f8a43', line: '#5d8a3d', line2: '#6f9c4a' },
  modern: { field: '#a3a7ad', outer: '#5f8a43', line: '#878b91', line2: '#959a9f' },
};

export function createWorld({ state, origin, area, lib }) {
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
  sun.shadow.normalBias = 0.02;
  sun.target.position.set(area.width / 2, 0, area.height / 2);
  scene.add(sun, sun.target);
  const lights = [];

  // Boden: Wiese (Mittelalter) bzw. Betonboden (Modern) mit Raster über dem
  // Grundstück, außen dunkleres Gras
  const outerMat = mat(GROUND.mittelalter.outer);
  const outer = mesh(new THREE.PlaneGeometry(80, 80), outerMat, { x: area.width / 2, y: -0.02, z: area.height / 2, shadow: false });
  outer.rotation.x = -Math.PI / 2;
  root.add(outer);
  const fieldMat = mat(GROUND.mittelalter.field);
  const field = mesh(new THREE.PlaneGeometry(area.width + 2, area.height + 2), fieldMat, {
    x: area.width / 2,
    y: 0,
    z: area.height / 2,
    shadow: false,
  });
  field.rotation.x = -Math.PI / 2;
  root.add(field);
  let grid = null;

  function applyGround(style) {
    const c = GROUND[style];
    fieldMat.color.set(c.field);
    outerMat.color.set(c.outer);
    if (grid) root.remove(grid);
    grid = new THREE.GridHelper(area.width + 2, area.width + 2, c.line, c.line2);
    grid.position.set(area.width / 2, 0.005, area.height / 2);
    grid.scale.z = (area.height + 2) / (area.width + 2);
    grid.material.transparent = true;
    grid.material.opacity = 0.45;
    root.add(grid);
  }

  // Gruppen, die beim Umschalten von Stil oder Farben neu gebaut werden
  const envRoot = new THREE.Group();
  const beltRoot = new THREE.Group();
  const buildingRoot = new THREE.Group();
  root.add(envRoot, beltRoot, buildingRoot);

  // Pfeile auf den Bändern (Effekt „laufende Bänder“)
  const arrowTex = arrowTexture();
  const arrowMat = new THREE.MeshBasicMaterial({ map: arrowTex, transparent: true, depthWrite: false });
  const arrowGeo = new THREE.PlaneGeometry(0.5, 1);

  // Waren: je Band-Feld ein Platz
  const templates = new Map();
  const template = (type) => {
    if (!templates.has(type)) templates.set(type, itemTemplate(type));
    return templates.get(type);
  };
  const itemSlots = new Map(); // key → { type, obj }
  const beltKeys = Object.keys(state.belts);

  let buildingViews = [];
  let lanternPoints = [];
  const settings = { style: 'mittelalter', colors: 'kenney', effects: true, light: 'tag' };

  function buildBuildings() {
    buildingRoot.clear();
    buildingViews = state.buildings.map((b) => {
      const { width: w, height: d } = footprintSize(b.type, b.rot);
      const p = local(b.x, b.y);
      const view = buildKenneyBuilding(lib, b, settings.style, settings.colors);
      view.group.position.set(p.x + w / 2, 0, p.z + d / 2);
      view.group.userData.buildingId = b.id;
      view.building = b;
      view.bounce = 0;
      view.pop = 0;
      view.lastShipped = b.prod.shipped ?? 0;
      if (view.parts.wheel && view.parts.wheelAxis === 'x') view.parts.wheel.rotation.order = 'YXZ';
      buildingRoot.add(view.group);
      return view;
    });
  }

  function buildBelts() {
    beltRoot.clear();
    for (const key of beltKeys) {
      const { x, y } = parseTileKey(key);
      const p = local(x, y);
      const tile = buildBeltTile(lib, state, key, settings.style);
      tile.position.set(p.x + 0.5, 0, p.z + 0.5);
      beltRoot.add(tile);
      // Pfeil in Laufrichtung
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.rotation.x = -Math.PI / 2;
      arrow.rotation.z = DIR_ANGLE[state.belts[key].outs[0]] ?? 0;
      arrow.position.set(p.x + 0.5, BELT_TOP + 0.004, p.z + 0.5);
      arrow.renderOrder = 1;
      beltRoot.add(arrow);
    }
  }

  function buildEnvironment() {
    envRoot.clear();
    const env = buildSurroundings(lib, area, settings.style, settings.colors);
    envRoot.add(env.group);
    lanternPoints = env.lanterns;
  }

  // Lichter am Abend: Laternen, Versandportale, Ofen
  function buildLights() {
    for (const l of lights) scene.remove(l);
    lights.length = 0;
    const add = (pos, color) => {
      const light = new THREE.PointLight(color, 0, 4, 1.6);
      light.position.copy(pos);
      scene.add(light);
      lights.push(light);
    };
    for (const p of lanternPoints) add(p, '#ffc070');
    for (const v of buildingViews) {
      if (v.building.type === 'versandportal') add(v.group.position.clone().add(new THREE.Vector3(0, 0.9, 0.4)), '#b89cff');
      if (v.building.type === 'kohlenmeiler') add(v.group.position.clone().add(new THREE.Vector3(0.4, 0.5, 1.1)), '#ffb060');
    }
  }

  function rebuild() {
    applyGround(settings.style);
    buildBuildings();
    buildBelts();
    buildEnvironment();
    buildLights();
    applyLight();
  }

  // Rauch: wenige Kugeln, die aufsteigen und verblassen
  const smokeMat = new THREE.MeshBasicMaterial({ color: '#d9d6d0', transparent: true, opacity: 0.6, depthWrite: false });
  const smokeGeo = new THREE.SphereGeometry(0.12, 8, 6);
  const smoke = [];
  for (let i = 0; i < 24; i++) {
    const m = new THREE.Mesh(smokeGeo, smokeMat.clone());
    m.visible = false;
    root.add(m);
    smoke.push({ mesh: m, life: 0 });
  }
  let smokeTimer = 0;

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
    lib.setGlow(evening ? 1.6 : 0);
    for (const l of lights) l.intensity = evening ? 6 : 0;
  }

  function applyEffects(renderer) {
    renderer.shadowMap.enabled = settings.effects;
    sun.castShadow = settings.effects;
    for (const s of smoke) s.mesh.visible = false;
    arrowMat.visible = settings.effects;
    // Materialien neu übersetzen, damit Schatten an- oder ausgehen
    scene.traverse((o) => {
      if (o.material) o.material.needsUpdate = true;
    });
  }

  function setStyle(style) {
    settings.style = style;
    rebuild();
  }

  function setColors(colors) {
    settings.colors = colors;
    rebuild();
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

  let time = 0;
  function update(dt, alpha) {
    const fx = settings.effects;
    time += dt;
    // Bänder: die Pfeile laufen mit
    if (fx) arrowTex.offset.y = (arrowTex.offset.y - dt * BELT_SPEED) % 1;

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
      slot.obj.position.set(pos.x, BELT_TOP, pos.z);
    }

    // Gebäude: Wasserrad bzw. Zahnrad, Roboterarm, Portal, Hüpfen, Rauch
    smokeTimer -= dt;
    for (const v of buildingViews) {
      const b = v.building;
      const working = isWorking(b);
      const { wheel, arm } = v.parts;
      if (wheel && fx && working) {
        if (v.parts.wheelAxis === 'x') wheel.rotation.x -= dt * 2.2;
        else wheel.rotation.y += dt * 3;
      }
      if (arm && fx) {
        const k = working ? 1 : 0.15;
        const a = arm.getObjectByName('element-a');
        const c = arm.getObjectByName('element-c');
        const e = arm.getObjectByName('element-e');
        if (a) a.rotation.y = Math.sin(time * 1.3) * 1.1 * k;
        if (c) c.rotation.z = (0.35 + Math.sin(time * 2.6) * 0.35) * k;
        if (e) e.rotation.z = (0.5 + Math.sin(time * 2.6 + 1) * 0.4) * k;
      }
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
      // v0.34.0: Das Tor des Portals bleibt stehen – dafür leuchtet sein Schimmer auf.
      const pop = v.parts.shimmer ? 0 : Math.sin(v.pop * Math.PI) * 0.25;
      if (v.parts.shimmer) animateShimmer(v.parts.shimmer, time, fx ? Math.sin(v.pop * Math.PI) : 0);
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

  rebuild();

  return {
    scene,
    settings,
    update,
    pick,
    setStyle,
    setColors,
    applyLight,
    applyEffects,
    productOf,
    views: () => buildingViews,
    itemCount: () => itemSlots.size,
  };
}
