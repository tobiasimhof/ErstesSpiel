// Spielstand im Browser speichern (localStorage). Klappt das nicht (z. B. im
// privaten Modus), läuft das Spiel trotzdem, nur ohne Speichern.

import { deserializeGame, serializeGame } from '../core/save.js';

const KEY = 'erstesspiel-spielstand';
const SETTINGS_KEY = 'erstesspiel-einstellungen';

// Ergebnis: { status: 'none' | 'ok' | 'invalid', state?, savedAt? }
export function loadGame() {
  let text = null;
  try {
    text = localStorage.getItem(KEY);
  } catch {
    return { status: 'none' };
  }
  if (!text) return { status: 'none' };
  const loaded = deserializeGame(text);
  if (loaded) return { status: 'ok', ...loaded };
  // Beschädigten Spielstand aufheben, bevor er überschrieben wird – so ließe er
  // sich notfalls von Hand retten.
  try {
    localStorage.setItem(`${KEY}-defekt`, text);
  } catch {
    // nichts zu tun
  }
  return { status: 'invalid' };
}

// Einstellungen (z. B. Testmodus) getrennt vom Spielstand.
export function loadSettings() {
  try {
    const data = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // nichts zu tun
  }
}

export function saveGame(state) {
  try {
    localStorage.setItem(KEY, serializeGame(state));
    return true;
  } catch {
    return false;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nichts zu tun
  }
}
