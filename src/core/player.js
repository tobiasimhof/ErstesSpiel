// v0.50.0 (Tobias, Chat 29): Der Name des Spielers – „wenn man sich das erste
// mal registriert kurz ein Startbildschirm, gib deinen Namen ein und dann
// gehts schon los“. Ein Spielerkonto gibt es erst mit dem Online-Teil (M5);
// bis dahin steht der Name im Spielstand (state.playerName, Format 19).
// Ein leerer Name heißt: noch nicht gefragt – der Ladebildschirm fragt danach.

// So lang darf ein Name sein (passt in Fenstertitel und Dateinamen).
export const PLAYER_NAME_MAX = 16;

// Bereinigt eine Eingabe: ohne Steuerzeichen, ohne doppelte Leerzeichen,
// vorn und hinten gekürzt, höchstens PLAYER_NAME_MAX Zeichen (ganze Zeichen,
// auch bei Emojis). Ergebnis kann leer sein.
export function cleanPlayerName(text) {
  if (typeof text !== 'string') return '';
  const flat = text
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(flat).slice(0, PLAYER_NAME_MAX).join('').trim();
}

export function isValidPlayerName(name) {
  return typeof name === 'string' && name === cleanPlayerName(name);
}

// Setzt den Namen; gibt false zurück (und ändert nichts), wenn er leer wäre.
export function setPlayerName(state, text) {
  const name = cleanPlayerName(text);
  if (!name) return false;
  state.playerName = name;
  return true;
}

export const hasPlayerName = (state) => typeof state.playerName === 'string' && state.playerName.length > 0;
