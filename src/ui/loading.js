// v0.50.0 (Tobias, Chat 29): Ladebildschirm bei jedem Start – „Der
// Startbildschirm soll immer kommen, ähnlich wie bei ClashofClans, damit man
// immer quasi einen "ladescreen" hat“; „Immerhin ist es auch Mobile-Game,
// deswegen sollte man quasi direkt starten können“ – danach geht es also von
// selbst weiter, ohne Antippen.
//
// Der Bildschirm steht schon in index.html (#loading), damit er sofort da ist,
// bevor die Programmdateien geladen sind. Hier: der Ladebalken (erst die
// Modelle, dann das Nachholen der verpassten Zeit), ein wechselnder Tipp, beim
// ersten Start „Wie heißt du?“ und am Ende das Ausblenden. Er bleibt
// mindestens LOADING_MIN_MS seit dem Öffnen der Seite, damit man den Titel sieht.

import { createNameForm } from './name.js';

export const LOADING_MIN_MS = 2000;
const TIP_MS = 4000;

// Kurze Tipps, einer nach dem anderen (Start an zufälliger Stelle)
export const TIPS = [
  'Pfeile am Gebäude: blau ist der Eingang, orange der Ausgang.',
  'Deine Fabrik läuft weiter, wenn das Spiel zu ist – bis etwas leer ist.',
  'Verschieben und Drehen kosten nichts. Abreißen gibt dir die Baukosten zurück.',
  'Mit „✥ Verschieben“ bewegst oder kopierst du einen ganzen Bereich auf einmal.',
  'Eine eigene Straße je Ware hält deine Fabrik steuerbar.',
  'Ein Lagerhaus puffert eine Straße, wenn eine Maschine mal langsamer ist.',
  '„⏫ Auffüllen“ legt bis zu 3 Rohstoffe auf Vorrat ins Gebäude.',
  'Teurere Waren bringen mehr Gold – jede Stufe rund 20 % mehr als ihre Zutaten.',
  'Tippe oben auf „Laden-Level“: Dort warten die Aufträge der Bewohner.',
  'Alles, was ins Versandportal läuft, landet in deinem Laden-Lager.',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createLoadingScreen() {
  const root = document.getElementById('loading');
  const fill = document.getElementById('loading-fill');
  const text = document.getElementById('loading-text');
  const tip = document.getElementById('loading-tip');
  const progressBox = document.getElementById('loading-progress');
  const nameBox = document.getElementById('loading-name');
  let open = !root.hidden;
  let shown = 0; // der Balken läuft nur vorwärts

  let tipIndex = Math.floor(Math.random() * TIPS.length);
  const showTip = () => {
    tip.textContent = `💡 ${TIPS[tipIndex]}`;
  };
  showTip();
  const tipTimer = setInterval(() => {
    tipIndex = (tipIndex + 1) % TIPS.length;
    showTip();
  }, TIP_MS);

  function setProgress(fraction, label) {
    shown = Math.max(shown, Math.min(1, fraction));
    fill.style.width = `${Math.round(shown * 100)}%`;
    if (label) text.textContent = label;
  }

  // Beim ersten Start (oder einem alten Spielstand ohne Namen): statt des
  // Balkens das Fenster „Willkommen! Wie heißt du?“. Gibt den Namen zurück.
  function askName({ initial = '' } = {}) {
    return new Promise((resolve) => {
      const title = document.createElement('h2');
      title.textContent = '👋 Willkommen!';
      const question = document.createElement('p');
      question.textContent = 'Wie heißt du?';
      const { form, focus } = createNameForm({
        initial,
        okLabel: '▶ Los geht’s',
        onSubmit(name) {
          nameBox.hidden = true;
          nameBox.replaceChildren();
          progressBox.hidden = false;
          resolve(name);
        },
      });
      nameBox.replaceChildren(title, question, form);
      progressBox.hidden = true;
      nameBox.hidden = false;
      requestAnimationFrame(focus);
    });
  }

  async function finish() {
    setProgress(1, 'Los geht’s!');
    const wait = LOADING_MIN_MS - performance.now();
    if (wait > 0) await sleep(wait);
    clearInterval(tipTimer);
    root.classList.add('done');
    await sleep(350);
    root.hidden = true;
    open = false;
  }

  return { setProgress, askName, finish, isOpen: () => open };
}
