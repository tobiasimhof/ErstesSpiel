// v0.40.0: 3D schneller (Tobias, Chat 25: „Herausgezoomt waren es 40-50 FPS
// und es war leicht ruckelig“). Fügt viele kleine Teile mit gleichem Material
// zu einem einzigen zusammen: Das Tablet zeichnet dann ein Stück statt vieler
// (weniger Zeichenaufrufe). Am Aussehen ändert sich nichts.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Teile lassen sich nur zusammenfügen, wenn sie dieselben Angaben haben
function signature(geo) {
  return `${geo.index ? 'i' : 'n'}|${Object.keys(geo.attributes).sort().join(',')}`;
}

function inside(obj, keep) {
  for (let o = obj; o; o = o.parent) if (keep.has(o)) return true;
  return false;
}

// Sammelt alle Flächen (Mesh) und Linien (LineSegments) unter den Quellen und
// fügt sie je Material zusammen. Die Lage wird eingerechnet – bezogen auf
// relativeTo (sonst auf die Welt). Teile in keep (und alles darunter) bleiben
// draußen, z. B. das Wasserrad, das sich dreht. Die Quellen bleiben unverändert.
// Ergebnis: { meshes: neue Teile, used: die zusammengefügten alten Teile }
export function mergeMeshes(sources, { relativeTo = null, keep = [] } = {}) {
  const keepSet = new Set(keep.filter(Boolean));
  const base = new THREE.Matrix4();
  if (relativeTo) {
    relativeTo.updateMatrixWorld(true);
    base.copy(relativeTo.matrixWorld).invert();
  }
  const buckets = new Map();
  const used = [];
  for (const source of sources) {
    source.updateMatrixWorld(true);
    source.traverse((o) => {
      const line = Boolean(o.isLineSegments);
      if (!(o.isMesh || line) || o.isInstancedMesh || Array.isArray(o.material) || !o.visible) return;
      if (inside(o, keepSet)) return;
      const geo = o.geometry.clone();
      geo.morphAttributes = {};
      geo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(base, o.matrixWorld));
      const key = `${line ? 'L' : 'M'}|${o.material.uuid}|${o.castShadow ? 1 : 0}|${o.receiveShadow ? 1 : 0}|${o.renderOrder}|${signature(geo)}`;
      let b = buckets.get(key);
      if (!b) {
        b = { line, material: o.material, castShadow: o.castShadow, receiveShadow: o.receiveShadow, renderOrder: o.renderOrder, geos: [] };
        buckets.set(key, b);
      }
      b.geos.push(geo);
      used.push(o);
    });
  }
  const meshes = [];
  for (const b of buckets.values()) {
    const merged = b.geos.length === 1 ? b.geos[0] : mergeGeometries(b.geos);
    // passt doch etwas nicht zusammen, bleiben die Teile einzeln (nichts geht verloren)
    for (const geo of merged ? [merged] : b.geos) {
      const m = b.line ? new THREE.LineSegments(geo, b.material) : new THREE.Mesh(geo, b.material);
      m.castShadow = b.castShadow;
      m.receiveShadow = b.receiveShadow;
      m.renderOrder = b.renderOrder;
      m.userData.merged = true;
      meshes.push(m);
    }
  }
  return { meshes, used };
}

// Fügt die Teile unter root zusammen und ersetzt sie dort durch die neuen.
export function mergeStatic(root, keep = []) {
  const { meshes, used } = mergeMeshes([root], { relativeTo: root, keep });
  for (const o of used) o.parent?.remove(o);
  for (const m of meshes) root.add(m);
  return meshes;
}

// Gibt die Formen zusammengefügter Teile wieder frei (beim Abreißen, Neubauen).
export function disposeMerged(root) {
  root.traverse((o) => {
    if (o.userData.merged) o.geometry.dispose();
  });
}

// Viele flache Rechtecke auf dem Boden als ein Teil (Markierungen, Felder).
// rects: [{ x, z, w, d, y }] mit der Mitte (x, z).
export function flatRects(rects, material, renderOrder = 1) {
  const pos = new Float32Array(rects.length * 18);
  rects.forEach((r, i) => {
    const x0 = r.x - r.w / 2;
    const x1 = r.x + r.w / 2;
    const z0 = r.z - r.d / 2;
    const z1 = r.z + r.d / 2;
    const y = r.y;
    pos.set([x0, y, z0, x0, y, z1, x1, y, z1, x0, y, z0, x1, y, z1, x1, y, z0], i * 18);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mesh = new THREE.Mesh(geo, material);
  mesh.renderOrder = renderOrder;
  mesh.userData.merged = true;
  return mesh;
}
