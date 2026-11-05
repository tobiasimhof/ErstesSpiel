// Eingabe per Touch, Stift und Maus (Pointer Events).
// Ein Finger / Maus ziehen: verschieben. Zwei Finger: zoomen.
// Kurzes Antippen ohne Bewegung: Tippen. Mausrad: zoomen.

const TAP_MAX_MOVE = 10; // Pixel, die ein Tippen höchstens wackeln darf
const TAP_MAX_MS = 600;

export function attachInput(element, { onPan, onZoom, onTap, onInteract }) {
  const pointers = new Map(); // pointerId -> { x, y }
  let gesture = null; // { startX, startY, startTime, moved, multi }
  let pinch = null; // { dist, midX, midY }

  function localPos(event) {
    const rect = element.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function pinchInfo() {
    const [a, b] = [...pointers.values()];
    return {
      dist: Math.hypot(b.x - a.x, b.y - a.y),
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2,
    };
  }

  element.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    element.setPointerCapture?.(event.pointerId);
    const pos = localPos(event);
    pointers.set(event.pointerId, pos);
    onInteract?.();

    if (pointers.size === 1) {
      gesture = { startX: pos.x, startY: pos.y, startTime: performance.now(), moved: false, multi: false };
      pinch = null;
    } else {
      if (gesture) gesture.multi = true;
      pinch = pointers.size >= 2 ? pinchInfo() : null;
    }
  });

  element.addEventListener('pointermove', (event) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return; // Maus bewegt sich ohne gedrückte Taste
    const pos = localPos(event);
    pointers.set(event.pointerId, pos);

    if (gesture && !gesture.moved) {
      if (Math.hypot(pos.x - gesture.startX, pos.y - gesture.startY) > TAP_MAX_MOVE) {
        gesture.moved = true;
      }
    }

    if (pointers.size === 1) {
      onPan(pos.x - previous.x, pos.y - previous.y);
    } else if (pointers.size >= 2) {
      const now = pinchInfo();
      if (pinch && pinch.dist > 0 && now.dist > 0) {
        onZoom(now.midX, now.midY, now.dist / pinch.dist);
        onPan(now.midX - pinch.midX, now.midY - pinch.midY);
      }
      pinch = now;
    }
  });

  function endPointer(event, cancelled) {
    if (!pointers.has(event.pointerId)) return;
    const isTap =
      !cancelled &&
      gesture &&
      !gesture.moved &&
      !gesture.multi &&
      pointers.size === 1 &&
      performance.now() - gesture.startTime <= TAP_MAX_MS;

    pointers.delete(event.pointerId);
    if (isTap) {
      const pos = localPos(event);
      onTap(pos.x, pos.y);
    }
    pinch = pointers.size >= 2 ? pinchInfo() : null;
    if (pointers.size === 0) gesture = null;
  }

  element.addEventListener('pointerup', (event) => endPointer(event, false));
  element.addEventListener('pointercancel', (event) => endPointer(event, true));

  element.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      onInteract?.();
      const pos = localPos(event);
      onZoom(pos.x, pos.y, Math.exp(-event.deltaY * 0.0015));
    },
    { passive: false },
  );
}
