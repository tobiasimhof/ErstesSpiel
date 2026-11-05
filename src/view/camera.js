// Kamera: welcher Ausschnitt der Welt auf dem Bildschirm zu sehen ist.
// Reine Rechnungen ohne Browser, damit sie automatisch testbar sind.
//
// Weltkoordinaten sind in "Einheiten"; ein Feld ist TILE Einheiten groß.
// Bildschirmkoordinaten sind CSS-Pixel relativ zur Zeichenfläche.
// Umrechnung: bildschirm = (welt - kamera) * zoom

export const TILE = 48;
export const MIN_ZOOM = 0.35;
export const MAX_ZOOM = 3;

export function createCamera() {
  return { x: 0, y: 0, zoom: 1, viewWidth: 0, viewHeight: 0 };
}

export function setViewSize(cam, width, height) {
  cam.viewWidth = width;
  cam.viewHeight = height;
}

export function screenToWorld(cam, sx, sy) {
  return { x: sx / cam.zoom + cam.x, y: sy / cam.zoom + cam.y };
}

export function worldToScreen(cam, wx, wy) {
  return { x: (wx - cam.x) * cam.zoom, y: (wy - cam.y) * cam.zoom };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Hält eine Achse innerhalb der Weltgrenzen. Ist die Welt kleiner als der
// sichtbare Bereich, wird sie mittig angezeigt.
function clampAxis(pos, start, size, visible) {
  if (size <= visible) return start + size / 2 - visible / 2;
  return clamp(pos, start, start + size - visible);
}

export function clampCamera(cam, bounds) {
  cam.zoom = clamp(cam.zoom, MIN_ZOOM, MAX_ZOOM);
  cam.x = clampAxis(cam.x, bounds.x, bounds.width, cam.viewWidth / cam.zoom);
  cam.y = clampAxis(cam.y, bounds.y, bounds.height, cam.viewHeight / cam.zoom);
}

// Verschiebt die Karte um eine Strecke in Bildschirmpixeln (Finger-Bewegung).
export function panBy(cam, dxScreen, dyScreen, bounds) {
  cam.x -= dxScreen / cam.zoom;
  cam.y -= dyScreen / cam.zoom;
  clampCamera(cam, bounds);
}

// Zoomt so, dass der Weltpunkt unter (sx, sy) an derselben Stelle bleibt.
export function zoomAt(cam, sx, sy, factor, bounds) {
  const anchor = screenToWorld(cam, sx, sy);
  cam.zoom = clamp(cam.zoom * factor, MIN_ZOOM, MAX_ZOOM);
  cam.x = anchor.x - sx / cam.zoom;
  cam.y = anchor.y - sy / cam.zoom;
  clampCamera(cam, bounds);
}

// Zoomt und verschiebt so, dass das Rechteck (Welteinheiten) komplett und
// mittig zu sehen ist.
export function fitRect(cam, rect, padding, bounds) {
  const availW = Math.max(1, cam.viewWidth - 2 * padding);
  const availH = Math.max(1, cam.viewHeight - 2 * padding);
  cam.zoom = clamp(Math.min(availW / rect.width, availH / rect.height), MIN_ZOOM, MAX_ZOOM);
  cam.x = rect.x + rect.width / 2 - cam.viewWidth / cam.zoom / 2;
  cam.y = rect.y + rect.height / 2 - cam.viewHeight / cam.zoom / 2;
  clampCamera(cam, bounds);
}
