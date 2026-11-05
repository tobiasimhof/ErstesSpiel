// Eingabe per Touch, Stift und Maus (Pointer Events).
//
// Meldet Gesten an den Controller, der je nach Modus entscheidet, was sie tun:
// - onTap(x, y):              kurzes Antippen ohne Bewegung
// - onDragStart(x0, y0):      ein Finger / linke Maustaste beginnt zu ziehen
// - onDragMove(x, y, dx, dy): ... zieht weiter (dx/dy seit dem letzten Aufruf)
// - onDragEnd(x, y):          ... lässt los
// - onDragCancel():           ... abgebrochen (z. B. zweiter Finger kommt dazu)
// - onPan(dx, dy):            Karte verschieben (zwei Finger, rechte/mittlere Maustaste)
// - onZoom(x, y, factor):     zoomen (zwei Finger, Mausrad)
// - onInteract():             irgendeine Berührung (z. B. um Hinweise auszublenden)
// Alle Koordinaten sind CSS-Pixel relativ zum Element.

const TAP_MAX_MOVE = 10; // Pixel, die ein Tippen höchstens wackeln darf
const TAP_MAX_MS = 600;

export function attachInput(element, handlers) {
  const h = handlers;
  const pointers = new Map(); // pointerId -> { x, y }
  let gesture = null; // { startX, startY, startTime, dragging, multi, panOnly }
  let pinch = null; // { dist, midX, midY }

  function localPos(event) {
    const rect = element.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function pinchInfo() {
    const [a, b] = [...pointers.values()];
    return { dist: Math.hypot(b.x - a.x, b.y - a.y), midX: (a.x + b.x) / 2, midY: (a.y + b.y) / 2 };
  }

  element.addEventListener('pointerdown', (event) => {
    element.setPointerCapture?.(event.pointerId);
    const pos = localPos(event);
    pointers.set(event.pointerId, pos);
    h.onInteract?.();

    if (pointers.size === 1) {
      gesture = {
        startX: pos.x,
        startY: pos.y,
        startTime: performance.now(),
        dragging: false,
        multi: false,
        // Rechte oder mittlere Maustaste verschiebt immer nur die Karte.
        panOnly: event.pointerType === 'mouse' && event.button !== 0,
      };
      pinch = null;
    } else {
      if (gesture && gesture.dragging && !gesture.multi && !gesture.panOnly) h.onDragCancel?.();
      if (gesture) gesture.multi = true;
      pinch = pointers.size >= 2 ? pinchInfo() : null;
    }
  });

  element.addEventListener('pointermove', (event) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return; // Maus bewegt sich ohne gedrückte Taste
    const pos = localPos(event);
    pointers.set(event.pointerId, pos);

    if (pointers.size >= 2) {
      const now = pinchInfo();
      if (pinch && pinch.dist > 0 && now.dist > 0) {
        h.onZoom(now.midX, now.midY, now.dist / pinch.dist);
        h.onPan(now.midX - pinch.midX, now.midY - pinch.midY);
      }
      pinch = now;
      return;
    }
    if (!gesture) return;

    // Nach dem Zoomen bleibt ein Finger liegen: dann nur noch verschieben.
    if (gesture.multi || gesture.panOnly) {
      if (gesture.panOnly && !gesture.dragging) {
        if (Math.hypot(pos.x - gesture.startX, pos.y - gesture.startY) <= TAP_MAX_MOVE) return;
        gesture.dragging = true;
        h.onPan(pos.x - gesture.startX, pos.y - gesture.startY);
        return;
      }
      h.onPan(pos.x - previous.x, pos.y - previous.y);
      return;
    }

    if (!gesture.dragging) {
      if (Math.hypot(pos.x - gesture.startX, pos.y - gesture.startY) <= TAP_MAX_MOVE) return;
      gesture.dragging = true;
      h.onDragStart(gesture.startX, gesture.startY);
      h.onDragMove(pos.x, pos.y, pos.x - gesture.startX, pos.y - gesture.startY);
      return;
    }
    h.onDragMove(pos.x, pos.y, pos.x - previous.x, pos.y - previous.y);
  });

  function endPointer(event, cancelled) {
    if (!pointers.has(event.pointerId)) return;
    const pos = localPos(event);
    const single = pointers.size === 1;
    const g = gesture;
    pointers.delete(event.pointerId);

    if (g && single && !g.multi && !g.panOnly) {
      if (g.dragging) {
        if (cancelled) h.onDragCancel?.();
        else h.onDragEnd(pos.x, pos.y);
      } else if (!cancelled && performance.now() - g.startTime <= TAP_MAX_MS) {
        h.onTap(pos.x, pos.y);
      }
    }
    pinch = pointers.size >= 2 ? pinchInfo() : null;
    if (pointers.size === 0) gesture = null;
  }

  element.addEventListener('pointerup', (event) => endPointer(event, false));
  element.addEventListener('pointercancel', (event) => endPointer(event, true));
  element.addEventListener('contextmenu', (event) => event.preventDefault());

  element.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      h.onInteract?.();
      const pos = localPos(event);
      h.onZoom(pos.x, pos.y, Math.exp(-event.deltaY * 0.0015));
    },
    { passive: false },
  );
}
