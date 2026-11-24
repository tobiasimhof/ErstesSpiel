// v0.48.0 (Tobias, Chat 28): Klänge aus Kenneys UI Audio (CC0) – „Die Klänge
// sollen erstmal aus sein und du kannst die Klänge gerne aussuchen“; gesteuert
// im Menü ☰ → „🔊 Audio“ („dass wir auch einen Menüpunkt mit Audio haben, um das
// ganze zu steuern“).
//
// Zwei Klänge: ein kurzes, warmes Klicken beim Antippen von Knöpfen und ein
// weicher Schalter beim Wechseln von Reitern. Die Einstellung (an/aus,
// Lautstärke) gilt für das Gerät: Sie steht im Browser, nicht im Spielstand –
// das Spielstand-Format bleibt gleich.
//
// Ohne Browser (Tests in node) und ohne Ton-Unterstützung passiert einfach nichts.

export const AUDIO_KEY = 'erstesspiel-audio';
export const DEFAULT_AUDIO = { on: false, volume: 0.6 };

// Kenneys Dateien als MP3 (läuft in allen Browsern), je Klang eine eigene
// Grundlautstärke, damit beide gleich laut wirken
export const SOUNDS = {
  click: { file: 'assets/kenney-ui/ui-audio/click2.mp3', gain: 0.35 },
  switch: { file: 'assets/kenney-ui/ui-audio/switch20.mp3', gain: 1 },
};

// Knöpfe, die einen Reiter wechseln (Laden, Level-Fenster, Bauleiste)
const SWITCH_SELECTOR = '.tab, .build-tab';

// Gespeicherte Einstellung lesen; Unsinn wird zur Grundeinstellung (aus).
export function parseAudioSettings(text) {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object') return { ...DEFAULT_AUDIO };
    const volume = Number(data.volume);
    return {
      on: data.on === true,
      volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULT_AUDIO.volume,
    };
  } catch {
    return { ...DEFAULT_AUDIO };
  }
}

function readSettings() {
  try {
    const text = globalThis.localStorage?.getItem(AUDIO_KEY);
    return text ? parseAudioSettings(text) : { ...DEFAULT_AUDIO };
  } catch {
    return { ...DEFAULT_AUDIO };
  }
}

let settings = null;
let context = null;
const buffers = new Map(); // Name → AudioBuffer (oder Promise beim Laden)

export function audioSettings() {
  if (!settings) settings = readSettings();
  return { ...settings };
}

// Einstellung ändern (Teile genügen, z. B. { on: true }) und auf dem Gerät merken
export function setAudio(change) {
  settings = parseAudioSettings(JSON.stringify({ ...audioSettings(), ...change }));
  try {
    globalThis.localStorage?.setItem(AUDIO_KEY, JSON.stringify(settings));
  } catch {
    // Ohne Speicher (privates Fenster) gilt die Einstellung bis zum Schließen.
  }
  if (settings.on) preload();
  return audioSettings();
}

// Der Browser erlaubt Ton erst nach einem Antippen – deshalb wird der
// AudioContext erst beim ersten Klang angelegt.
function audioContext() {
  if (context) return context;
  const Ctx = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!Ctx) return null;
  try {
    context = new Ctx();
  } catch {
    context = null;
  }
  return context;
}

function load(name) {
  const ctx = audioContext();
  if (!ctx || !SOUNDS[name] || typeof fetch !== 'function') return null;
  if (!buffers.has(name)) {
    const loading = fetch(SOUNDS[name].file)
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        buffers.set(name, buffer);
        return buffer;
      })
      .catch(() => {
        buffers.delete(name);
        return null;
      });
    buffers.set(name, loading);
  }
  return buffers.get(name);
}

function preload() {
  for (const name of Object.keys(SOUNDS)) load(name);
}

// Einen Klang abspielen (nur, wenn die Klänge an sind)
export function playSound(name) {
  const { on, volume } = audioSettings();
  if (!on || volume <= 0 || !SOUNDS[name]) return;
  const ctx = audioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const start = (buffer) => {
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = volume * SOUNDS[name].gain;
    source.connect(gain).connect(ctx.destination);
    source.start();
  };
  const loaded = load(name);
  if (loaded instanceof Promise) loaded.then(start);
  else start(loaded);
}

// Welcher Klang zu einem Knopf gehört: Reiter „switch“, sonst „click“
export function soundFor(element) {
  return element?.matches?.(SWITCH_SELECTOR) ? 'switch' : 'click';
}

// Wird von onPress (press.js) bei jedem Antippen eines Knopfs gerufen.
export function pressSound(element) {
  playSound(soundFor(element));
}
