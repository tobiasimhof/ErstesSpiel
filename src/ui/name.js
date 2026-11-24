// v0.50.0 (Tobias, Chat 29): Namen eingeben – „gib deinen Namen ein und dann
// gehts schon los“. Beim ersten Start auf dem Ladebildschirm (loading.js),
// später zum Ändern im Laden („✏️“ neben „Tobias' Laden“). Ein Feld und ein
// Knopf; Enter bestätigt; der Knopf ist aus, solange kein Name dasteht.

import { PLAYER_NAME_MAX, cleanPlayerName } from '../core/player.js';
import { onPress } from './press.js';

export function createNameForm({ initial = '', okLabel, onSubmit }) {
  const form = document.createElement('div');
  form.className = 'name-form';
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'name-input';
  input.maxLength = PLAYER_NAME_MAX;
  input.autocomplete = 'nickname';
  input.spellcheck = false;
  input.enterKeyHint = 'done';
  input.placeholder = 'Dein Name';
  input.setAttribute('aria-label', 'Dein Name');
  input.value = initial;
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'name-ok';
  button.className = 'primary';
  button.textContent = okLabel;
  const update = () => {
    button.disabled = !cleanPlayerName(input.value);
  };
  const submit = () => {
    const name = cleanPlayerName(input.value);
    if (name) onSubmit(name);
  };
  input.addEventListener('input', update);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  });
  onPress(button, submit);
  update();
  form.append(input, button);
  return {
    form,
    // Mit Tastatur (Tobias' Tablet) gleich lostippen; auf dem Handy öffnet das
    // Antippen des Felds die Bildschirmtastatur.
    focus() {
      try {
        input.focus({ preventScroll: true });
      } catch {
        // nichts zu tun
      }
    },
  };
}

// Fenster „✏️ Name ändern“ (aus dem Laden). onDone(name) nach dem Speichern.
export function openNameWindow({ panels, initial, onDone }) {
  panels.showModal((box, { el }) => {
    box.append(el('h2', null, '✏️ Name ändern'));
    box.append(el('p', 'modal-meta', 'So heißt dein Laden, so begrüßen dich die Bewohner, und so heißt die Datei beim Sichern.'));
    const { form, focus } = createNameForm({ initial, okLabel: '✓ Speichern', onSubmit: onDone });
    box.append(form);
    requestAnimationFrame(focus);
  });
}
