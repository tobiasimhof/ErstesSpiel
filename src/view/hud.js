// Obere Leiste: Gold, Laden-Level, Vollbild, Menü und Versionsnummer.

import { canLevelUp } from '../core/levels.js';
import { canDeliver, levelXp, xpNeeded } from '../core/quests.js';
import { onPress } from './press.js';

const numberFormat = new Intl.NumberFormat('de-DE');

export function createHud({ version, onNewGame, onToggleTestMode, onTestPack, onLevel }) {
  const gold = document.getElementById('hud-gold');
  const goldGain = document.getElementById('hud-gold-gain');
  const testPackButton = document.getElementById('menu-test-pack');
  let lastSaleId = null;
  const level = document.getElementById('hud-level');
  const levelButton = document.getElementById('btn-level');
  const levelReady = document.getElementById('hud-level-ready');
  const questReady = document.getElementById('hud-quest-ready');
  const xpFill = document.getElementById('hud-xp-fill');
  const menuButton = document.getElementById('btn-menu');
  const menu = document.getElementById('menu');
  const hint = document.getElementById('hint');
  const speedBadge = document.getElementById('hud-speed');
  const fpsBadge = document.getElementById('hud-fps');
  const testModeButton = document.getElementById('menu-test-mode');

  document.getElementById('hud-version').textContent = `v${version}`;

  function closeMenu() {
    menu.hidden = true;
  }
  // Laden-Level antippen öffnet das Level-Fenster (v0.9.0)
  onPress(levelButton, () => {
    closeMenu();
    onLevel();
  });
  onPress(menuButton, () => {
    menu.hidden = !menu.hidden;
  });
  document.addEventListener('pointerdown', (event) => {
    if (!menu.hidden && !menu.contains(event.target) && event.target !== menuButton) closeMenu();
  });
  onPress(testModeButton, () => {
    closeMenu();
    onToggleTestMode();
  });
  onPress(testPackButton, () => {
    closeMenu();
    onTestPack();
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
      // Genug Erfahrung und Gold: ⬆ zeigt, dass man aufsteigen kann
      const ready = canLevelUp(state);
      levelReady.hidden = !ready;
      levelButton.classList.toggle('ready', ready);
      // v0.13.0: ❗ – der aktuelle Auftrag lässt sich abgeben; dazu eine
      // kleine Erfahrungsleiste unten im Knopf
      questReady.hidden = ready || !canDeliver(state);
      const need = xpNeeded(state.shopLevel);
      xpFill.style.width = `${need > 0 ? Math.min(100, (levelXp(state) / need) * 100) : 100}%`;
      // Neuer Verkauf an einen Kunden: kurz „+36“ neben dem Gold zeigen.
      const sale = state.market.sales[0];
      const id = sale?.id ?? 0;
      if (lastSaleId !== null && id > lastSaleId) {
        goldGain.textContent = `+${numberFormat.format(sale.gold)}`;
        goldGain.classList.remove('show');
        void goldGain.offsetWidth; // Animation neu starten
        goldGain.classList.add('show');
      }
      lastSaleId = id;
    },
    hideHint() {
      hint.classList.add('hidden');
    },
    setTestMode(on, factor) {
      testModeButton.textContent = `⏩ Testmodus: ${on ? 'an' : 'aus'} (Zeit ×${factor})`;
      speedBadge.textContent = `⏩ ×${factor}`;
      speedBadge.hidden = !on;
      fpsBadge.hidden = !on;
      testPackButton.hidden = !on;
    },
    // v0.21.0 (Belastungstest): Bilder pro Sekunde, nur im Testmodus zu sehen
    setFps(fps) {
      fpsBadge.textContent = `🎞️ ${Math.round(fps)} Bilder/s`;
    },
    closeMenu,
  };
}
