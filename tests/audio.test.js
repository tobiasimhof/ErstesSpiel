// v0.48.0 (Tobias, Chat 28): Klänge aus Kenneys UI Audio, gesteuert im Menü
// ☰ → „🔊 Audio“ – „Die Klänge sollen erstmal aus sein“. Die Einstellung steht
// im Browser des Geräts, nicht im Spielstand. Das Abspielen selbst prüft der
// Browser-Test (Menü, Schalter, Regler).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

import { DEFAULT_AUDIO, SOUNDS, parseAudioSettings, soundFor } from '../src/ui/sound.js';

const url = (p) => new URL(`../${p}`, import.meta.url);

test('Klänge sind beim ersten Start aus', () => {
  assert.equal(DEFAULT_AUDIO.on, false);
  assert.ok(DEFAULT_AUDIO.volume > 0 && DEFAULT_AUDIO.volume <= 1);
});

test('Gespeicherte Audio-Einstellung: gültig übernommen, Unsinn wird zu „aus“', () => {
  assert.deepEqual(parseAudioSettings('{"on":true,"volume":0.3}'), { on: true, volume: 0.3 });
  assert.deepEqual(parseAudioSettings('{"on":true,"volume":7}'), { on: true, volume: 1 }, 'Lautstärke höchstens 100 %');
  assert.deepEqual(parseAudioSettings('{"on":true,"volume":-1}'), { on: true, volume: 0 });
  assert.deepEqual(parseAudioSettings('{"on":"ja"}'), { on: false, volume: DEFAULT_AUDIO.volume }, 'nur true schaltet an');
  assert.deepEqual(parseAudioSettings('kaputt'), DEFAULT_AUDIO);
  assert.deepEqual(parseAudioSettings('null'), DEFAULT_AUDIO);
});

test('Zwei Klänge aus Kenneys UI Audio liegen im Projekt, klein, mit Lizenz', () => {
  assert.deepEqual(Object.keys(SOUNDS).sort(), ['click', 'switch']);
  for (const [name, sound] of Object.entries(SOUNDS)) {
    assert.ok(existsSync(url(sound.file)), `${name}: ${sound.file}`);
    assert.ok(statSync(url(sound.file)).size < 20000, `${name}: klein`);
    assert.ok(sound.gain > 0 && sound.gain <= 1, `${name}: Grundlautstärke`);
  }
  assert.ok(readFileSync(url('assets/kenney-ui/ui-audio/License.txt'), 'utf8').includes('Creative Commons Zero'));
});

test('Reiter klingen anders als die übrigen Knöpfe', () => {
  const fake = (selectorHit) => ({ matches: (sel) => selectorHit && sel.includes('.tab') });
  assert.equal(soundFor(fake(true)), 'switch');
  assert.equal(soundFor(fake(false)), 'click');
  assert.equal(soundFor(null), 'click');
});
