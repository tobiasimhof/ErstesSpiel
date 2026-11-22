// Spielstand sichern und laden (v0.22.0, Tobias): Der Spielstand wird als
// kleine Textdatei gesichert – in „Downloads“ oder über das Teilen-Menü
// (WhatsApp, E-Mail, Drive …) – und lässt sich im Menü wieder laden, auch auf
// einem anderen Gerät.
//
// Beim Laden ersetzt die Datei den Spielstand im Browser, dann startet die
// Seite neu. Wie beim normalen Öffnen holt die Fabrik dabei die Zeit seit dem
// Sichern nach (Rohstoffe, Maschinen, Kunden, Beete – bis etwas leer ist).
//
// Die Datei endet auf .txt: Chrome auf Android teilt nur bestimmte Dateiarten,
// .json gehört nicht dazu. Drin steht derselbe Text wie im Browser-Speicher.

import { SAVE_VERSION, deserializeGame, serializeGame } from '../core/save.js';
import { numberFormat } from './format.js';

// Größer ist kein Spielstand (eine volle Fabrik hat wenige hundert KB).
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

const pad = (n) => String(n).padStart(2, '0');

// „Fabrik Level 8 - 11.11.2026 21-45.txt“ (Ortszeit; ohne „:“, das Dateinamen nicht mögen)
export function backupFileName(state, date = new Date()) {
  const day = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  return `Fabrik Level ${state.shopLevel} - ${day} ${pad(date.getHours())}-${pad(date.getMinutes())}.txt`;
}

// „Level 8 · 14.623 Gold · 70 Gebäude“
export function backupSummary(state) {
  return `Level ${state.shopLevel} · ${numberFormat.format(state.gold)} Gold · ${state.buildings.length} Gebäude`;
}

// „am 11.11.2026 um 21:45 Uhr“ (oder leer, wenn die Zeit fehlt)
export function savedAtText(ms) {
  if (!(ms > 0)) return '';
  const date = new Date(ms);
  return `am ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} um ${pad(date.getHours())}:${pad(date.getMinutes())} Uhr`;
}

// Prüft den Inhalt einer Datei. Ergebnis: { ok: true, loaded } (wie
// deserializeGame) oder { ok: false, reason: 'newer' | 'invalid' }.
export function readBackup(text) {
  const loaded = typeof text === 'string' ? deserializeGame(text) : null;
  if (loaded) return { ok: true, loaded };
  try {
    const data = JSON.parse(text);
    if (Number.isInteger(data?.saveVersion) && data.saveVersion > SAVE_VERSION) return { ok: false, reason: 'newer' };
  } catch {
    // kein Spielstand
  }
  return { ok: false, reason: 'invalid' };
}

// Text der Rückfrage vor dem Laden
export function loadQuestion(fileName, loaded) {
  const when = savedAtText(loaded.savedAt);
  return [
    `„${fileName}“`,
    `${backupSummary(loaded.state)}${when ? `, gesichert ${when}` : ''}.`,
    '',
    'Dein jetziger Spielstand wird dabei ersetzt. Die Fabrik holt die Zeit seit dem Sichern nach – so, als wäre das Spiel so lange zu gewesen.',
  ].join('\n');
}

// getState: der aktuelle Spielstand; isBusy: true, solange die Fabrik Zeit
// nachholt (dann passt der Spielstand noch nicht zur Uhrzeit);
// onReplace(text, fileName): ersetzt den Spielstand und startet neu.
export function createBackup({ panels, getState, isBusy, onReplace }) {
  const input = document.getElementById('load-file');

  function download(name) {
    const blob = new Blob([serializeGame(getState())], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    panels.toast(`Gesichert: „${name}“ liegt in „Downloads“.`, 5000);
    return true;
  }

  async function share(name) {
    const file = new File([serializeGame(getState())], name, { type: 'text/plain' });
    try {
      await navigator.share({ files: [file], title: name });
      panels.toast(`Gesichert: „${name}“ geteilt.`, 4000);
      return true;
    } catch (error) {
      if (error?.name === 'AbortError') {
        panels.toast('Nicht gesichert – Teilen abgebrochen.', 3000);
        return false;
      }
      return download(name); // Teilen klappt nicht – dann eben in „Downloads“
    }
  }

  function canShare(name) {
    try {
      const probe = new File([''], name, { type: 'text/plain' });
      return typeof navigator.share === 'function' && Boolean(navigator.canShare?.({ files: [probe] }));
    } catch {
      return false;
    }
  }

  // Fragt, wohin, und sichert. Gibt true zurück, wenn gesichert wurde.
  async function save() {
    if (isBusy()) {
      panels.toast('Die Fabrik holt gerade Zeit nach – gleich noch einmal versuchen.', 3000);
      return false;
    }
    const state = getState();
    const name = backupFileName(state);
    const sharing = canShare(name);
    const choice = await panels.confirm({
      title: '💾 Spielstand sichern',
      text: `${backupSummary(state)}\n\nDeine Fabrik wird als kleine Datei gesichert:\n„${name}“\n\nZurückholen kannst du sie im Menü mit „📂\u00a0Spielstand laden“ – auch auf einem anderen Gerät.`,
      okLabel: sharing ? '📤 Teilen …' : '⬇️ In „Downloads“ speichern',
      altLabel: sharing ? '⬇️ In „Downloads“' : null,
    });
    if (choice === 'alt' || (choice === true && !sharing)) return download(name);
    if (choice === true) return share(name);
    return false;
  }

  async function loadFile(file) {
    if (file.size > MAX_BACKUP_BYTES) {
      panels.toast(`„${file.name}“ ist kein Spielstand (zu groß) – dein Spiel bleibt, wie es ist.`, 5000);
      return;
    }
    let text;
    try {
      text = await file.text();
    } catch {
      panels.toast(`„${file.name}“ ließ sich nicht lesen – dein Spiel bleibt, wie es ist.`, 5000);
      return;
    }
    const result = readBackup(text);
    if (!result.ok) {
      panels.toast(
        result.reason === 'newer'
          ? `„${file.name}“ stammt aus einer neueren Version des Spiels. Lade die Seite neu und versuche es noch einmal.`
          : `„${file.name}“ ist kein Spielstand dieses Spiels oder beschädigt – dein Spiel bleibt, wie es ist.`,
        6000,
      );
      return;
    }
    for (;;) {
      const choice = await panels.confirm({
        title: '📂 Spielstand laden?',
        text: loadQuestion(file.name, result.loaded),
        okLabel: 'Laden',
        danger: true,
        altLabel: '💾 Jetzigen erst sichern',
      });
      if (choice === 'alt') {
        await save();
        continue; // danach noch einmal fragen
      }
      if (choice === true) onReplace(text, file.name);
      return;
    }
  }

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    input.value = ''; // dieselbe Datei lässt sich gleich noch einmal wählen
    if (file) loadFile(file);
  });

  return {
    save,
    // öffnet die Dateiauswahl (muss direkt aus einem Antippen kommen)
    pickFile() {
      input.click();
    },
  };
}
