// v0.34.0: 3D-Test (Tobias, Chat 24) – die Kamera der 3D-Ansicht.
//
// Frei drehbar (Tobias' Wahl aus der Grafik-Probe: „weil man dadurch
// vermutlich besser bauen und auch sieht, wenn man ein zulauf verstopft ist“).
// Die Kamera schaut von schräg oben auf einen Punkt am Boden (target). Sie
// lässt sich verschieben, zoomen und um diesen Punkt drehen; die Neigung
// stellt sich mit dem Zoom ein (weit weg steiler – gute Übersicht zum Bauen,
// nah flacher – schöner Blick auf die Häuser).
//
// Koordinaten wie im Spiel: 1 Feld = 1 Einheit, x nach Osten, z = Feld-y
// nach Süden, y nach oben. Feld (x, y) liegt zwischen x … x+1 und z = y … y+1.
//
// Liefert für die Steuerung (controller.js) dasselbe wie die 2D-Kamera:
// welches Feld unter einem Bildschirmpunkt liegt (tileAt), Verschieben in
// Bildschirm-Pixeln (panBy) und die Größe der Ansicht (viewWidth, viewHeight).

import * as THREE from 'three';

export const MIN_DISTANCE = 6;
export const MAX_DISTANCE = 70;
const NEAR_PITCH = 0.74; // Neigung ganz nah (etwa 42°)
const FAR_PITCH = 1.08; // ganz weit weg (etwa 62°)
export const TURN_STEP = Math.PI / 4; // Knöpfe ⟲ ⟳ und Tasten Q/E: je 45°

export function createCamera3d() {
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 500);
  const target = new THREE.Vector3(0, 0, 0);
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  let bounds = null; // { x, y, width, height } in Feldern – so weit darf der Blickpunkt
  let maxDistance = MAX_DISTANCE;

  const rig = {
    camera,
    target,
    yaw: 0.4, // leicht von rechts unten – noch fast wie die Karte (Norden oben)
    distance: 24,
    viewWidth: 0,
    viewHeight: 0,
  };

  function pitch() {
    const t = THREE.MathUtils.clamp((rig.distance - MIN_DISTANCE) / (30 - MIN_DISTANCE), 0, 1);
    return NEAR_PITCH + (FAR_PITCH - NEAR_PITCH) * t;
  }

  function update() {
    const el = pitch();
    const horizontal = Math.cos(el) * rig.distance;
    camera.position.set(target.x + Math.sin(rig.yaw) * horizontal, Math.sin(el) * rig.distance, target.z + Math.cos(rig.yaw) * horizontal);
    camera.lookAt(target);
    camera.updateMatrixWorld();
  }

  // Punkt am Boden unter einem Bildschirmpunkt (CSS-Pixel), oder null
  function groundAt(sx, sy, out = new THREE.Vector3()) {
    if (!(rig.viewWidth > 0 && rig.viewHeight > 0)) return null;
    ndc.set((sx / rig.viewWidth) * 2 - 1, -(sy / rig.viewHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.ray.intersectPlane(ground, out);
  }

  function tileAt(sx, sy) {
    const p = groundAt(sx, sy, hit);
    if (!p) return { x: -99999, y: -99999 };
    return { x: Math.floor(p.x), y: Math.floor(p.z) };
  }

  // Bildschirmpunkt (CSS-Pixel) eines Punkts in der Welt
  function screenOf(x, y, z) {
    const v = new THREE.Vector3(x, y, z).project(camera);
    return { x: ((v.x + 1) / 2) * rig.viewWidth, y: ((1 - v.y) / 2) * rig.viewHeight, visible: v.z < 1 };
  }

  function clamp() {
    if (bounds) {
      target.x = THREE.MathUtils.clamp(target.x, bounds.x - 2, bounds.x + bounds.width + 2);
      target.z = THREE.MathUtils.clamp(target.z, bounds.y - 2, bounds.y + bounds.height + 2);
    }
    rig.distance = THREE.MathUtils.clamp(rig.distance, MIN_DISTANCE, maxDistance);
    update();
  }

  // Der Boden folgt dem Finger: was unter der Mitte lag, liegt danach um
  // (dx, dy) Pixel verschoben.
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  function panBy(dx, dy) {
    const cx = rig.viewWidth / 2;
    const cy = rig.viewHeight / 2;
    if (!groundAt(cx, cy, a) || !groundAt(cx + dx, cy + dy, b)) return;
    target.add(a.sub(b));
    clamp();
  }

  // Zoomen um einen Bildschirmpunkt: der Boden darunter bleibt stehen.
  function zoomAt(sx, sy, factor) {
    if (!(factor > 0)) return;
    const before = groundAt(sx, sy, a)?.clone();
    rig.distance = THREE.MathUtils.clamp(rig.distance / factor, MIN_DISTANCE, maxDistance);
    update();
    const after = groundAt(sx, sy, b);
    if (before && after) target.add(before.sub(after));
    clamp();
  }

  // Drehen um den Blickpunkt (Bogenmaß; positiv = gegen den Uhrzeigersinn von oben)
  function rotate(angle) {
    rig.yaw = (rig.yaw + angle) % (Math.PI * 2);
    update();
  }

  function resize(width, height) {
    rig.viewWidth = width;
    rig.viewHeight = height;
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    update();
  }

  // Wie weit der Blickpunkt wandern darf (Welt in Feldern); weiter weg als
  // nötig, um die ganze Welt zu sehen, geht es nicht.
  function setBounds(world) {
    bounds = { ...world };
    maxDistance = Math.min(MAX_DISTANCE, Math.max(30, Math.max(world.width, world.height) * 1.35));
    clamp();
  }

  // Ein Rechteck (in Feldern) ins Bild holen: Mitte anpeilen, dann so weit
  // zurück, dass alle Ecken mit Rand (Pixel) im Bild liegen. padBottom: Platz
  // für die Leiste unten.
  // Wegen der Perspektive erscheint die nahe Kante größer als die ferne –
  // deshalb wird für jede Entfernung zuerst die Mitte des Bilds auf die Mitte
  // des Rechtecks auf dem Bildschirm geschoben, dann geprüft, ob es passt.
  function fitRect(rect, { padding = 24, padBottom = 0 } = {}) {
    const corners = [
      [rect.x, rect.y],
      [rect.x + rect.width, rect.y],
      [rect.x, rect.y + rect.height],
      [rect.x + rect.width, rect.y + rect.height],
    ];
    const box = () => {
      const pts = corners.map(([x, z]) => screenOf(x, 0, z));
      return {
        x0: Math.min(...pts.map((p) => p.x)),
        x1: Math.max(...pts.map((p) => p.x)),
        y0: Math.min(...pts.map((p) => p.y)),
        y1: Math.max(...pts.map((p) => p.y)),
      };
    };
    const place = (distance) => {
      rig.distance = distance;
      target.set(rect.x + rect.width / 2, 0, rect.y + rect.height / 2);
      update();
      for (let k = 0; k < 3; k++) {
        const b = box();
        const dx = rig.viewWidth / 2 - (b.x0 + b.x1) / 2;
        const dy = (rig.viewHeight - padBottom) / 2 - (b.y0 + b.y1) / 2;
        if (!groundAt(rig.viewWidth / 2, rig.viewHeight / 2, a) || !groundAt(rig.viewWidth / 2 + dx, rig.viewHeight / 2 + dy, b2)) break;
        target.add(a.sub(b2));
        update();
      }
      const b = box();
      return b.x0 >= padding && b.x1 <= rig.viewWidth - padding && b.y0 >= padding && b.y1 <= rig.viewHeight - padding - padBottom;
    };
    let lo = MIN_DISTANCE;
    let hi = maxDistance;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (place(mid)) hi = mid;
      else lo = mid;
    }
    place(hi);
    clamp();
  }
  const b2 = new THREE.Vector3();

  update();
  return Object.assign(rig, { update, groundAt, tileAt, screenOf, panBy, zoomAt, rotate, resize, setBounds, fitRect, clamp });
}
