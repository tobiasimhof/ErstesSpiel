// Obere Leiste: Gold, Laden-Level, Vollbild, Menü und Versionsnummer.

import { canLevelUp } from '../core/levels.js';
import { canDeliver, levelXp, xpNeeded } from '../core/quests.js';
import { onPress } from './press.js';

const numberFormat = new Intl.NumberFormat('de-DE');

export function createHud({ version, onNewGame, onToggleTestMode, onTestPack, onLevel, onSaveFile, onLoadFile, onSwitch3d, onStressTest, onAudio, is3d = false, stressTest = false }) {
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

  document.getElementById('hud-version').textContent = is3d ? `v${version} · 3D-Test` : `v${version}`;

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
  // v0.39.0: Belastungstest (nur im Testmodus des 3D-Spiels) – mit Hinweis und „Beenden“
  const stressButton = document.getElementById('menu-stress');
  onPress(stressButton, () => {
    closeMenu();
    onStressTest();
  });
  document.getElementById('stress-banner').hidden = !stressTest;
  onPress(document.getElementById('stress-exit'), () => {
    location.href = 'index.html';
  });
  // v0.48.0: Klänge an/aus und Lautstärke (Tobias: „dass wir auch einen
  // Menüpunkt mit Audio haben, um das ganze zu steuern“)
  onPress(document.getElementById('menu-audio'), () => {
    closeMenu();
    onAudio?.();
  });
  // v0.22.0: Spielstand als Datei sichern und laden
  onPress(document.getElementById('menu-save-file'), () => {
    closeMenu();
    onSaveFile();
  });
  onPress(document.getElementById('menu-load-file'), () => {
    closeMenu();
    onLoadFile();
  });
  onPress(document.getElementById('menu-new-game'), () => {
    closeMenu();
    onNewGame();
  });
  // v0.34.0: 3D-Test mit eigenem Spielstand (Tobias, Chat 24) – und zurück;
  // seit v0.38.0 ist der 3D-Test der Start, die echte Fabrik hinten angestellt
  const switch3d = document.getElementById('menu-3d');
  if (is3d) switch3d.textContent = '🗺️ Zur echten Fabrik (2D)';
  onPress(switch3d, () => {
    closeMenu();
    onSwitch3d();
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
      fpsBadge.hidden = !on && !is3d; // v0.36.0: im 3D-Test immer sichtbar
      testPackButton.hidden = !on;
      stressButton.hidden = !on || !is3d || stressTest;
    },
    // v0.21.0 (Belastungstest): Bilder pro Sekunde, nur im Testmodus zu sehen
    setFps(fps) {
      fpsBadge.textContent = `🎞️ ${Math.round(fps)} Bilder/s`;
    },
    closeMenu,
  };
}
