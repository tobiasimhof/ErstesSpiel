// Spielstand im Browser speichern (localStorage). Klappt das nicht (z. B. im
// privaten Modus), läuft das Spiel trotzdem, nur ohne Speichern.

import { deserializeGame, serializeGame } from '../core/save.js';

const KEY = 'erstesspiel-spielstand';

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
  return loaded ? { status: 'ok', ...loaded } : { status: 'invalid' };
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
