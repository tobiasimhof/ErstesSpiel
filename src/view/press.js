// Knöpfe reagieren auf das Loslassen des Fingers (pointerup) statt auf "click".
// Grund: Chrome verschluckt den Klick, wenn man direkt nach einer schnellen
// Wischbewegung tippt (z. B. Band ziehen und sofort „Fertig“ tippen).
// Tastatur (Enter/Leertaste) löst weiterhin über "click" aus.

export function onPress(element, handler) {
  let pressedId = null;
  element.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pressedId = event.pointerId;
  });
  element.addEventListener('pointercancel', () => {
    pressedId = null;
  });
  element.addEventListener('pointerup', (event) => {
    if (event.pointerId !== pressedId) return;
    pressedId = null;
    if (element.disabled) return;
    const r = element.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) return;
    handler(event);
  });
  element.addEventListener('click', (event) => {
    // detail === 0: Klick per Tastatur
    if (event.detail === 0 && !element.disabled) handler(event);
  });
}

// Antippen des Hintergrunds selbst (nicht seiner Inhalte), z. B. um ein
// Fenster zu schließen.
export function onBackdropPress(element, handler) {
  let downOnBackdrop = false;
  element.addEventListener('pointerdown', (event) => {
    downOnBackdrop = event.target === element;
  });
  element.addEventListener('pointerup', (event) => {
    if (downOnBackdrop && event.target === element) handler(event);
    downOnBackdrop = false;
  });
}
