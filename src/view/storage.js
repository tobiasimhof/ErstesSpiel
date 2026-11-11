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

// v0.22.0: Spielstand aus einer Datei übernehmen (der Text wurde vorher mit
// readBackup geprüft). Der bisherige Spielstand bleibt zur Sicherheit unter
// einem eigenen Schlüssel liegen – so ließe er sich notfalls von Hand retten.
// Gibt false zurück, wenn der Browser nichts speichern lässt.
export function replaceGame(text) {
  try {
    const previous = localStorage.getItem(KEY);
    if (previous) localStorage.setItem(`${KEY}-vor-dem-laden`, previous);
  } catch {
    // dann eben ohne Sicherheitskopie
  }
  try {
    localStorage.setItem(KEY, text);
    return true;
  } catch {
    return false;
  }
}

// v0.22.0: Nach dem Laden einer Datei startet die Seite neu – der Dateiname
// wird so lange gemerkt, damit das Spiel danach Bescheid sagen kann.
const LOADED_KEY = 'erstesspiel-geladen-aus-datei';
export function rememberLoadedFile(name) {
  try {
    sessionStorage.setItem(LOADED_KEY, name);
  } catch {
    // nichts zu tun
  }
}
export function takeLoadedFile() {
  try {
    const name = sessionStorage.getItem(LOADED_KEY);
    sessionStorage.removeItem(LOADED_KEY);
    return name;
  } catch {
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // nichts zu tun
  }
}
