// v0.48.0 (Tobias, Chat 28): Menü ☰ → „🔊 Audio“ – Klänge an/aus und
// Lautstärke. Beim ersten Start sind die Klänge aus. Die Einstellung gilt für
// das Gerät (sound.js), nicht für den Spielstand.

import { audioSettings, playSound, setAudio } from './sound.js';

export function createAudioWindow({ panels }) {
  function open() {
    panels.showModal((box, { el, makeButton }) => {
      box.append(el('h2', null, '🔊 Audio'));
      box.append(el('p', 'modal-meta', 'Klänge beim Antippen von Knöpfen und beim Wechseln von Reitern. Die Einstellung gilt für dieses Gerät.'));

      const toggle = makeButton({
        label: '',
        key: 'audio-toggle',
        size: 'wide',
        onClick: () => {
          const now = setAudio({ on: !audioSettings().on });
          refresh();
          if (now.on) playSound('click'); // gleich hören, wie es klingt
        },
      });
      toggle.id = 'audio-toggle';

      const volumeRow = el('label', 'audio-volume');
      const volumeText = el('span', 'audio-volume-text');
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.id = 'audio-volume';
      slider.min = '0';
      slider.max = '100';
      slider.step = '10';
      slider.setAttribute('aria-label', 'Lautstärke');
      slider.addEventListener('input', () => {
        setAudio({ volume: Number(slider.value) / 100 });
        refresh();
      });
      // Beim Loslassen einmal zur Probe klicken
      slider.addEventListener('change', () => playSound('click'));
      volumeRow.append(el('span', 'audio-volume-name', 'Lautstärke'), slider, volumeText);

      function refresh() {
        const { on, volume } = audioSettings();
        toggle.textContent = on ? '🔊 Klänge: an' : '🔇 Klänge: aus';
        toggle.classList.toggle('primary', on);
        slider.value = String(Math.round(volume * 100));
        volumeText.textContent = `${Math.round(volume * 100)} %`;
        volumeRow.classList.toggle('off', !on);
      }
      refresh();

      const actions = el('div', 'panel-actions');
      actions.append(toggle);
      box.append(actions, volumeRow);
    });
  }
  return { open };
}
