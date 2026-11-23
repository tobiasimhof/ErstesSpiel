// v0.46.0: baut aus den Formen der Waren (itemForms.js) je Ware ein einziges
// Teil. Die Farben stecken in den Ecken der Form, alle Waren teilen sich ein
// Material – auf dem Band bleibt es je Ware ein „Stapel“ (Instancing), die Zahl
// der Zeichenaufrufe bleibt also wie bis v0.45.0.

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ITEMS } from '../core/data/items.js';
import { itemForm } from './itemForms.js';

export const ITEM_MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, metalness: 0, flatShading: true });

function partGeometry({ k, s }) {
  switch (k) {
    case 'box':
      return new THREE.BoxGeometry(s[0], s[1], s[2]);
    case 'cyl':
      return new THREE.CylinderGeometry(s[0], s[1], s[2], s[3] ?? 12);
    case 'ball':
      return new THREE.SphereGeometry(s[0], s[1] ?? 12, s[2] ?? 8);
    case 'ring':
      return new THREE.TorusGeometry(s[0], s[1], s[2] ?? 6, s[3] ?? 16, s[4] ?? Math.PI * 2);
    default:
      throw new Error(`Unbekannter Grundkörper: ${k}`);
  }
}

const UNIT = new THREE.Vector3(1, 1, 1);

function collect(parts, parent, out) {
  for (const part of parts) {
    const local = new THREE.Matrix4().compose(
      new THREE.Vector3(...(part.p ?? [0, 0, 0])),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(part.r ?? [0, 0, 0]))),
      part.sc ? new THREE.Vector3(part.sc, part.sc, part.sc) : UNIT,
    );
    const matrix = new THREE.Matrix4().multiplyMatrices(parent, local);
    if (part.k === 'group') {
      collect(part.parts, matrix, out);
      continue;
    }
    const raw = partGeometry(part);
    const geo = raw.toNonIndexed();
    raw.dispose();
    geo.deleteAttribute('uv');
    geo.clearGroups();
    geo.applyMatrix4(matrix);
    const c = new THREE.Color(part.c);
    const n = geo.attributes.position.count;
    const rgb = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) rgb.set([c.r, c.g, c.b], i * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
    out.push(geo);
  }
}

// Eine Form (Liste von Grundkörpern) als ein Teil – v0.47.0 auch für die
// Pflanzen im Beet (plantForms.js)
export function formGeometry(parts) {
  const out = [];
  collect(parts, new THREE.Matrix4(), out);
  const geo = mergeGeometries(out);
  for (const g of out) g.dispose();
  geo.computeBoundingBox();
  return geo;
}

// Die Form einer Ware als ein Teil (Lage: auf y = 0, mitten im Feld)
export function itemGeometry(type) {
  return formGeometry(itemForm(type, ITEMS[type]?.color));
}
