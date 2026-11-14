import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  FLOOR_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE,
  clampCamera,
  createCamera,
  fitRect,
  minZoom,
  panBy,
  screenToWorld,
  setViewSize,
  worldToScreen,
  zoomAt,
} from '../src/view/camera.js';

const BIG_WORLD = { x: -100000, y: -100000, width: 200000, height: 200000 };

function makeCamera(width = 1000, height = 600) {
  const cam = createCamera();
  setViewSize(cam, width, height);
  return cam;
}

const close = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

test('screenToWorld und worldToScreen heben sich auf', () => {
  const cam = makeCamera();
  cam.x = 123;
  cam.y = -45;
  cam.zoom = 1.7;
  const world = screenToWorld(cam, 300, 200);
  const back = worldToScreen(cam, world.x, world.y);
  assert.ok(close(back.x, 300) && close(back.y, 200));
});

test('Zoomen hält den Punkt unter dem Finger fest', () => {
  const cam = makeCamera();
  const before = screenToWorld(cam, 400, 250);
  zoomAt(cam, 400, 250, 1.8, BIG_WORLD);
  const after = screenToWorld(cam, 400, 250);
  assert.ok(close(before.x, after.x) && close(before.y, after.y));
  assert.ok(close(cam.zoom, 1.8));
});

test('Zoom bleibt in seinen Grenzen', () => {
  const cam = makeCamera();
  zoomAt(cam, 0, 0, 1000, BIG_WORLD);
  assert.equal(cam.zoom, MAX_ZOOM);
  zoomAt(cam, 0, 0, 0.00001, BIG_WORLD);
  assert.equal(cam.zoom, FLOOR_ZOOM, 'eine riesige Welt: nie weiter als FLOOR_ZOOM');
});

test('v0.27.0: Man kann so weit herauszoomen, dass die ganze Fläche ins Bild passt', () => {
  // Tablet im Browser ohne Vollbild (Karte etwa 1280 × 540), Handy quer (844 × 340)
  for (const [w, h] of [
    [1280, 540],
    [1280, 750],
    [844, 340],
  ]) {
    for (const [cols, rows] of [
      [38, 30],
      [46, 38],
    ]) {
      const cam = makeCamera(w, h);
      const world = { x: 0, y: 0, width: cols * TILE, height: rows * TILE };
      zoomAt(cam, w / 2, h / 2, 0.00001, world);
      const topLeft = worldToScreen(cam, world.x, world.y);
      const bottomRight = worldToScreen(cam, world.x + world.width, world.y + world.height);
      assert.ok(topLeft.x >= 0 && topLeft.y >= 0 && bottomRight.x <= w && bottomRight.y <= h, `${cols} × ${rows} passt nicht auf ${w} × ${h}`);
      assert.ok(cam.zoom <= MIN_ZOOM && cam.zoom >= FLOOR_ZOOM);
    }
  }
  // Eine kleine Welt braucht nicht mehr als MIN_ZOOM
  const cam = makeCamera(1280, 750);
  assert.equal(minZoom(cam, { x: 0, y: 0, width: 10 * TILE, height: 10 * TILE }), MIN_ZOOM);
});

test('Verschieben bewegt die Karte mit dem Finger', () => {
  const cam = makeCamera();
  cam.zoom = 2;
  const before = screenToWorld(cam, 500, 300);
  panBy(cam, 100, 50, BIG_WORLD);
  // Der Weltpunkt, der vorher unter (500, 300) lag, liegt jetzt unter (600, 350).
  const moved = worldToScreen(cam, before.x, before.y);
  assert.ok(close(moved.x, 600) && close(moved.y, 350));
});

test('Man kann nicht über den Weltrand hinaus schieben', () => {
  const cam = makeCamera(400, 300);
  const world = { x: 0, y: 0, width: 1000, height: 1000 };
  panBy(cam, 100000, 100000, world);
  assert.equal(cam.x, 0);
  assert.equal(cam.y, 0);
  panBy(cam, -100000, -100000, world);
  assert.equal(cam.x, 1000 - 400);
  assert.equal(cam.y, 1000 - 300);
});

test('v0.27.0: Rechts lässt sich die Karte unter dem Infofenster hervorschieben (padRight)', () => {
  const cam = makeCamera(1000, 600);
  const world = { x: 0, y: 0, width: 2000, height: 2000, padRight: 340 };
  panBy(cam, -100000, 0, world);
  assert.equal(cam.x, 2000 + 340 - 1000, 'große Welt: 340 Pixel über den rechten Rand');
  const right = worldToScreen(cam, world.width, 0);
  assert.equal(right.x, 1000 - 340, 'der rechte Rand liegt links vom Infofenster');
  panBy(cam, 100000, 0, world);
  assert.equal(cam.x, 0, 'links bleibt es beim Rand');
  // Eine kleine Welt steht mittig und lässt sich so weit nach links schieben,
  // bis ihr rechter Rand frei liegt
  const small = { x: 0, y: 0, width: 800, height: 400, padRight: 340 };
  cam.x = -100000;
  clampCamera(cam, small);
  assert.ok(close(worldToScreen(cam, 400, 0).x, 500), 'mittig');
  panBy(cam, -100000, 0, small);
  assert.ok(close(worldToScreen(cam, 800, 0).x, 1000 - 340), 'rechter Rand frei');
  panBy(cam, 100000, 0, small);
  assert.ok(close(worldToScreen(cam, 400, 0).x, 500), 'zurück nur bis zur Mitte');
});

test('Eine kleine Welt wird mittig angezeigt', () => {
  const cam = makeCamera(1000, 600);
  const world = { x: 0, y: 0, width: 200, height: 100 };
  clampCamera(cam, world);
  const center = screenToWorld(cam, 500, 300);
  assert.ok(close(center.x, 100) && close(center.y, 50));
});

test('fitRect zeigt das ganze Rechteck mittig an', () => {
  for (const [w, h] of [
    [1280, 756],
    [844, 350],
    [2000, 1200],
  ]) {
    const cam = makeCamera(w, h);
    const rect = { x: 384, y: 240, width: 768, height: 480 };
    fitRect(cam, rect, 24, BIG_WORLD);
    const topLeft = worldToScreen(cam, rect.x, rect.y);
    const bottomRight = worldToScreen(cam, rect.x + rect.width, rect.y + rect.height);
    assert.ok(topLeft.x >= 0 && topLeft.y >= 0, `links/oben abgeschnitten bei ${w}×${h}`);
    assert.ok(bottomRight.x <= w && bottomRight.y <= h, `rechts/unten abgeschnitten bei ${w}×${h}`);
    assert.ok(close(topLeft.x, w - bottomRight.x, 1e-3), `nicht waagerecht mittig bei ${w}×${h}`);
  }
});
