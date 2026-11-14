// Kamera: welcher Ausschnitt der Welt auf dem Bildschirm zu sehen ist.
// Reine Rechnungen ohne Browser, damit sie automatisch testbar sind.
//
// Weltkoordinaten sind in "Einheiten"; ein Feld ist TILE Einheiten groß.
// Bildschirmkoordinaten sind CSS-Pixel relativ zur Zeichenfläche.
// Umrechnung: bildschirm = (welt - kamera) * zoom

export const TILE = 48;
export const MIN_ZOOM = 0.35;
export const MAX_ZOOM = 3;
// v0.27.0 (Tobias, Chat 20): „Ja, weiter rauszoomen soll gehen.“ Man darf
// immer so weit herauszoomen, dass die ganze Welt mit etwas Rand ins Bild
// passt (auf dem Tablet ohne Vollbild reichte MIN_ZOOM schon für 38 × 30
// kaum) – aber nie weiter als FLOOR_ZOOM.
export const FLOOR_ZOOM = 0.12;
const FIT_MARGIN = 36;

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

// v0.21.0 (Belastungstest): sichtbarer Ausschnitt der Welt, um margin
// Welteinheiten vergrößert. Der Renderer zeichnet nur, was hineinragt.
export function visibleRect(cam, margin = 0) {
  return {
    x0: cam.x - margin,
    y0: cam.y - margin,
    x1: cam.x + cam.viewWidth / cam.zoom + margin,
    y1: cam.y + cam.viewHeight / cam.zoom + margin,
  };
}

// Ragt das Rechteck (Welteinheiten) in den Ausschnitt?
export function intersects(view, x, y, width, height) {
  return x < view.x1 && x + width > view.x0 && y < view.y1 && y + height > view.y0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Kleinster erlaubter Zoom für diese Welt (bounds in Welteinheiten):
// MIN_ZOOM, oder weniger, wenn die Welt sonst nicht ganz ins Bild passt.
export function minZoom(cam, bounds) {
  if (!bounds || !(cam.viewWidth > 0) || !(cam.viewHeight > 0)) return MIN_ZOOM;
  const w = Math.max(1, cam.viewWidth - 2 * FIT_MARGIN) / bounds.width;
  const h = Math.max(1, cam.viewHeight - 2 * FIT_MARGIN) / bounds.height;
  return clamp(Math.min(w, h), FLOOR_ZOOM, MIN_ZOOM);
}

// Hält eine Achse innerhalb der Weltgrenzen. Ist die Welt kleiner als der
// sichtbare Bereich, wird sie mittig angezeigt.
function clampAxis(pos, start, size, visible) {
  if (size <= visible) return start + size / 2 - visible / 2;
  return clamp(pos, start, start + size - visible);
}

// v0.27.0: Wie clampAxis, aber am Ende (rechts) darf die Welt bis zu pad weit
// über den Rand geschoben werden. Eine kleine Welt steht mittig und lässt
// sich nur so weit nach links schieben, bis ihr rechter Rand pad frei lässt.
function clampAxisEnd(pos, start, size, visible, pad) {
  const last = start + size + pad - visible;
  if (size > visible) return clamp(pos, start, last);
  const center = start + size / 2 - visible / 2;
  return last > center ? clamp(pos, center, last) : center;
}

// bounds.padBottom (Bildschirmpixel, v0.18.0): so viel Platz bekommt die Karte
// unten zusätzlich, damit die unterste Reihe über die Bauleiste passt.
// bounds.padRight (Bildschirmpixel, v0.27.0, Tobias: das Infofenster rechts
// oben verdeckt Gebäude am Rand): so weit lässt sich die Karte rechts über den
// Rand schieben, damit nichts unter dem Infofenster verborgen bleibt.
export function clampCamera(cam, bounds) {
  cam.zoom = clamp(cam.zoom, minZoom(cam, bounds), MAX_ZOOM);
  const padBottom = (bounds.padBottom ?? 0) / cam.zoom;
  const padRight = (bounds.padRight ?? 0) / cam.zoom;
  cam.x = clampAxisEnd(cam.x, bounds.x, bounds.width, cam.viewWidth / cam.zoom, padRight);
  cam.y = clampAxis(cam.y, bounds.y, bounds.height + padBottom, cam.viewHeight / cam.zoom);
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
  cam.zoom = clamp(cam.zoom * factor, minZoom(cam, bounds), MAX_ZOOM);
  cam.x = anchor.x - sx / cam.zoom;
  cam.y = anchor.y - sy / cam.zoom;
  clampCamera(cam, bounds);
}

// Zoomt und verschiebt so, dass das Rechteck (Welteinheiten) komplett und
// mittig zu sehen ist.
export function fitRect(cam, rect, padding, bounds) {
  const availW = Math.max(1, cam.viewWidth - 2 * padding);
  const availH = Math.max(1, cam.viewHeight - 2 * padding);
  cam.zoom = clamp(Math.min(availW / rect.width, availH / rect.height), minZoom(cam, bounds), MAX_ZOOM);
  cam.x = rect.x + rect.width / 2 - cam.viewWidth / cam.zoom / 2;
  cam.y = rect.y + rect.height / 2 - cam.viewHeight / cam.zoom / 2;
  clampCamera(cam, bounds);
}
