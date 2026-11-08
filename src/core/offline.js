// Spiel im Hintergrund (v0.14.0, Wunsch von Tobias): Ist das Spiel
// geschlossen oder die App im Hintergrund, läuft die Fabrik weiter – wie in
// Clash of Clans, nur umgekehrt: Alles läuft, bis es leer ist, dann muss man
// nachlegen. Beim Zurückkommen wird die verpasste Zeit nachgerechnet.
//
// - Die Fabrik rechnet Takt für Takt genau wie im laufenden Spiel.
// - Steht sie still (nichts bewegt sich mehr, nichts wird hergestellt), kaufen
//   nur noch Kunden an den Theken – das geht im Schnelldurchlauf.
// - Das Nachrechnen lässt sich in Stücke teilen (runCatchUp mit maxTicks),
//   damit der Bildschirm dabei nicht einfriert.
//
// Kennt keine Grafik.

import { OFFLINE } from './data/offline.js';
import { updateMarket } from './market.js';
import { isRipe, productionOf, sourceCount } from './production.js';
import { storageFree } from './shop.js';
import { TICK, tick } from './sim.js';

// Alles, was die Fabrik ausmacht. Bleibt es über einen Takt gleich, ändert es
// sich nie wieder: Die Fabrik hängt nur von sich selbst und dem freien Platz
// im Laden-Lager ab, und den können Kunden nicht vergrößern.
function factoryKey(state) {
  return JSON.stringify([state.buildings, state.belts, state.storage]);
}

const isSource = (b) => productionOf(b.type)?.kind === 'source';
const isGarden = (b) => productionOf(b.type)?.kind === 'garden';

// ---------- Nachrechnen ----------

export function startCatchUp(state, seconds) {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.min(seconds, OFFLINE.maxSeconds)) : 0;
  const ticks = Math.round(total / TICK);
  return {
    state,
    seconds: total,
    ticks,
    done: 0,
    busyLimit: Math.round(OFFLINE.maxBusySeconds / TICK),
    checkEvery: Math.max(1, Math.round(OFFLINE.checkSeconds / TICK)),
    still: false, // Fabrik steht still – ab dann nur noch Kunden
    before: offlineSnapshot(state),
  };
}

// Während nachgerechnet wird, läuft die echte Zeit weiter – sie kommt dazu.
export function extendCatchUp(job, seconds) {
  if (!(seconds > 0)) return;
  const add = Math.min(seconds, Math.max(0, OFFLINE.maxSeconds - job.seconds));
  job.seconds += add;
  job.ticks = Math.round(job.seconds / TICK);
}

// Rechnet bis zu maxTicks Takte nach. Gibt true zurück, wenn alles nachgeholt ist.
export function runCatchUp(job, maxTicks = Infinity) {
  const { state } = job;
  let budget = maxTicks;
  while (job.done < job.ticks && budget > 0) {
    if (job.still || job.done >= job.busyLimit) {
      // Schnelldurchlauf: Nur die Kunden kaufen noch ein.
      updateMarket(state, (job.ticks - job.done) * TICK);
      job.done = job.ticks;
      break;
    }
    const check = (job.done + 1) % job.checkEvery === 0;
    const key = check ? factoryKey(state) : null;
    tick(state);
    job.done++;
    budget--;
    if (check && factoryKey(state) === key) job.still = true;
  }
  return job.done >= job.ticks;
}

// Fortschritt 0..1 (für die Anzeige). Der Schnelldurchlauf dauert kaum Zeit,
// deshalb zählt nur der Teil, den die Fabrik Takt für Takt rechnet.
export function catchUpProgress(job) {
  if (job.done >= job.ticks) return 1;
  return Math.min(1, job.done / Math.max(1, Math.min(job.ticks, job.busyLimit)));
}

// Am Stück nachrechnen (Tests). Gibt den Bericht zurück.
export function catchUp(state, seconds) {
  const job = startCatchUp(state, seconds);
  runCatchUp(job);
  return offlineReport(job);
}

// ---------- Bericht „Willkommen zurück“ ----------

export function offlineSnapshot(state) {
  return {
    gold: state.gold,
    storage: { ...state.storage },
    counters: state.counters.map((c) => ({ type: c.type, count: c.count })),
    sources: Object.fromEntries(state.buildings.filter(isSource).map((b) => [b.id, sourceCount(b)])),
    ripe: state.buildings.filter((b) => isGarden(b) && isRipe(b)).length,
  };
}

// Was in der Zeit passiert ist:
// { seconds, gold, sold: { Ware: n }, stored: { Ware: n }, emptied: { Gebäudeart: n },
//   empty: Anzahl leerer Rohstoff-Gebäude, ripe: Beete, die reif geworden sind
//   (v0.16.0), storageFull, countersEmpty, running }
export function offlineReport(job) {
  const { state, before } = job;
  const sold = {};
  state.counters.forEach((c, i) => {
    const old = before.counters[i];
    if (old?.type && old.type === c.type && old.count > c.count) sold[c.type] = (sold[c.type] ?? 0) + old.count - c.count;
    // Eine Theke, die leer verkauft wurde, behält ihre Sorte (type bleibt).
  });
  const stored = {};
  for (const [type, n] of Object.entries(state.storage)) {
    const gained = n - (before.storage[type] ?? 0);
    if (gained > 0) stored[type] = gained;
  }
  const emptied = {};
  let empty = 0;
  for (const b of state.buildings) {
    if (!isSource(b) || sourceCount(b) > 0) continue;
    empty++;
    if ((before.sources[b.id] ?? 0) > 0) emptied[b.type] = (emptied[b.type] ?? 0) + 1;
  }
  // v0.16.0: Beete, die während der Pause reif geworden sind
  const ripe = Math.max(0, state.buildings.filter((b) => isGarden(b) && isRipe(b)).length - (before.ripe ?? 0));
  const hadGoods = before.counters.some((c) => c.type && c.count > 0);
  return {
    seconds: job.seconds,
    gold: Math.max(0, state.gold - before.gold),
    sold,
    stored,
    emptied,
    empty,
    ripe,
    storageFull: storageFree(state) <= 0,
    countersEmpty: hadGoods && state.counters.every((c) => !c.type || c.count === 0),
    running: !job.still && job.done < job.busyLimit,
  };
}
