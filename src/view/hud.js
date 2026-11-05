// Obere Leiste: Gold, Laden-Level, Vollbild, Menü und Versionsnummer.

import { onPress } from './press.js';

const numberFormat = new Intl.NumberFormat('de-DE');

export function createHud({ version, onNewGame }) {
  const gold = document.getElementById('hud-gold');
  const level = document.getElementById('hud-level');
  const menuButton = document.getElementById('btn-menu');
  const menu = document.getElementById('menu');
  const hint = document.getElementById('hint');

  document.getElementById('hud-version').textContent = `v${version}`;

  function closeMenu() {
    menu.hidden = true;
  }
  onPress(menuButton, () => {
    menu.hidden = !menu.hidden;
  });
  document.addEventListener('pointerdown', (event) => {
    if (!menu.hidden && !menu.contains(event.target) && event.target !== menuButton) closeMenu();
  });
  onPress(document.getElementById('menu-new-game'), () => {
    closeMenu();
    onNewGame();
  });

  // Vollbild (Android/PC). Ohne Vollbild-Funktion wird der Knopf ausgeblendet.
  const fullscreenButton = document.getElementById('btn-fullscreen');
  if (document.fullscreenEnabled) {
    onPress(fullscreenButton, async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
          await screen.orientation?.lock?.('landscape').catch(() => {});
        }
      } catch {
        // Vollbild wurde vom Browser abgelehnt – das Spiel läuft trotzdem weiter.
      }
    });
  } else {
    fullscreenButton.hidden = true;
  }

  return {
    update(state) {
      gold.textContent = numberFormat.format(state.gold);
      level.textContent = String(state.shopLevel);
    },
    hideHint() {
      hint.classList.add('hidden');
    },
    closeMenu,
  };
}
