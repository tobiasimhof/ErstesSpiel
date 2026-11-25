// Browser-Test v0.52.0: Einführung mit Bürgermeisterin Hilde (Tobias, Chat 29).
// Ein neues Spiel: Begrüßungsbrief, dann alle Schritte – getippt
// wird immer dorthin, wohin Hildes Pfeil und Ring zeigen. Geprüft wird, dass
// das Fenster das Ziel nicht verdeckt, dass Neuladen den Schritt behält, der
// Abschlussbrief, „🎓 Einführung ansehen“, Wegklappen, „Weiter ›“ und
// „Beenden“.

const path = require('node:path');
const { OUT, check, sleep, game, waitForGame, readLetter, setDevice, tilePos } = require('./helpers.cjs');

// Fenster, Ring und Pfeil auf dem Bildschirm
const look = (page) =>
  page.evaluate(() => {
    const rect = (id) => {
      const node = document.getElementById(id);
      if (!node || node.hidden) return null;
      const r = node.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    };
    const ring = rect('hilde-ring');
    let covered = null;
    if (ring) {
      const hit = document.elementFromPoint((ring.left + ring.right) / 2, (ring.top + ring.bottom) / 2);
      covered = Boolean(hit?.closest('#hilde, #hilde-mini'));
    }
    return {
      box: rect('hilde'),
      mini: rect('hilde-mini'),
      ring,
      arrow: rect('hilde-arrow'),
      covered,
      step: document.getElementById('hilde-step').textContent,
      text: document.getElementById('hilde-text').textContent,
      target: document.getElementById('hilde').dataset.target,
      tutorial: window.__game.tutorial(),
    };
  });

const overlaps = (a, b) => Boolean(a && b) && Math.min(a.right, b.right) > Math.max(a.left, b.left) + 0.5 && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top) + 0.5;
const center = (r) => ({ x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 });

async function runTutorial(browser, baseUrl, device) {
  setDevice(`${device.name}-einfuehrung`);
  console.log(`\n${device.name} – Einführung mit Hilde`);
  const context = await browser.newContext({ viewport: device.viewport, deviceScaleFactor: device.deviceScaleFactor, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const shot = (name) => page.screenshot({ path: path.join(OUT, `${device.name}-einf-${name}.png`) });
  const vp = device.viewport;
  const inView = (r) => r && r.left >= -0.5 && r.top >= -0.5 && r.right <= vp.width + 0.5 && r.bottom <= vp.height + 0.5;

  // Wartet, bis Hilde auf target zeigt (und das Fenster an seinem Platz ist), prüft die Lage
  async function expectHint(target, label) {
    try {
      await page.waitForFunction(
        (t) => {
          const box = document.getElementById('hilde');
          return box.dataset.target === t && !box.hidden;
        },
        target,
        { timeout: 6000 },
      );
    } catch {
      // unten als Fehler gemeldet
    }
    await sleep(450); // das Fenster gleitet in seine Ecke
    const l = await look(page);
    const pointer = !target || (l.ring && l.arrow);
    check(
      l.target === target && pointer && inView(l.box) && !overlaps(l.box, l.ring) && !overlaps(l.box, l.arrow) && l.covered !== true,
      `${label}: ${l.step} – „${l.text}“ (zeigt auf ${l.target}; Fenster frei vom Ziel und im Bild)`,
    );
    return l;
  }

  async function tapRing() {
    const l = await look(page);
    const c = center(l.ring);
    await page.touchscreen.tap(c.x, c.y);
    await sleep(250);
  }

  const ids = async () => game(page, () => Object.fromEntries(window.__game.state.buildings.map((b) => [b.type, b.id])));
  const tapBuilding = async (id) => {
    const p = await game(page, (i) => window.__game.view3d.building(i), id);
    await page.touchscreen.tap(p.x, p.y);
    await sleep(250);
  };
  const tile = (x, y) => game(page, ([a, b]) => window.__game.view3d.tile(a, b), [x, y]);

  await page.goto(baseUrl);
  await waitForGame(page, { name: 'Tobias', tutorial: 'keep', timeout: 60000 });

  // 1 Begrüßungsbrief
  await page.waitForFunction(() => document.getElementById('letter')?.classList.contains('open'), null, { timeout: 5000 });
  await sleep(700);
  const hello = await page.evaluate(() => ({
    banner: document.getElementById('letter-banner').textContent,
    ok: document.getElementById('letter-ok').textContent,
    hilde: !document.getElementById('hilde').hidden,
    tutorial: window.__game.tutorial(),
  }));
  check(
    hello.banner === 'Willkommen, Tobias!' && hello.ok.includes('Los geht') && !hello.hilde && hello.tutorial?.step === 0,
    `Neues Spiel: Hildes Begrüßungsbrief mit Namen und „${hello.ok}“, ihr kleines Fenster wartet`,
  );
  await shot('1-brief');
  await readLetter(page);

  // 2 Holzstamm einlegen
  let at = await ids();
  let l = await expectHint('building:holzfaeller', 'Schritt 2');
  check(l.step === 'Schritt 2 von 8' && l.text.includes('200 Holzblöcke'), `Nach „▶ Los geht’s“ Schritt 2 mit Pfeil und Ring am Holzfällerlager`);
  const house = await game(page, (i) => window.__game.view3d.building(i), at.holzfaeller);
  check(house.x > l.ring.left && house.x < l.ring.right && house.y > l.ring.top && house.y < l.ring.bottom, 'Der Ring liegt um das Holzfällerlager');
  await shot('2-holzfaeller');
  await tapBuilding(at.holzfaeller);
  l = await expectHint('info:load:holzstamm', 'Schritt 2, Infofenster offen');
  const loadBox = await page.locator('#info-panel button[data-key="load:holzstamm"]').boundingBox();
  check(loadBox && l.ring.left <= loadBox.x && l.ring.right >= loadBox.x + loadBox.width, 'Der Ring liegt um „➕ 1 einlegen“');
  await shot('2b-einlegen');
  await tapRing();

  // 3 Versandportal verschieben
  l = await expectHint('building:versandportal', 'Schritt 3');
  check(
    (await game(page, (i) => window.__game.state.buildings.find((b) => b.id === i).prod.loaded, at.holzfaeller)) && l.step === 'Schritt 3 von 8',
    'Eingelegt → Hilde springt von selbst zu Schritt 3',
  );
  await tapBuilding(at.versandportal);
  await expectHint('info:move', 'Schritt 3, Infofenster des Portals');
  await tapRing();
  l = await expectHint('#tool-confirm', 'Schritt 3, Portal wird verschoben');
  await shot('3-verschieben');
  const hf = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'holzfaeller'));
  const spot = await tile(hf.x + 5, hf.y);
  await page.touchscreen.tap(spot.x, spot.y);
  await sleep(200);
  const ghost = await game(page, () => window.__game.ui.ghost);
  check(ghost && ghost.x === hf.x + 5 && ghost.y === hf.y && ghost.valid, `Antippen setzt die Vorschau 2 Felder Platz neben das Holzfällerlager (${ghost?.x}, ${ghost?.y})`);
  await tapRing();
  l = await expectHint('#btn-build', 'Schritt 4');
  const portal = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'versandportal'));
  check(portal.x === hf.x + 5 && l.step === 'Schritt 4 von 8', `„✓ Hierhin“ → Portal verschoben, Schritt 4`);

  // Neu laden: die Einführung macht dort weiter (ohne Brief)
  await game(page, () => window.__game.saveNow());
  await page.reload();
  await waitForGame(page, { tutorial: 'keep', timeout: 60000 });
  await sleep(600);
  const again = await page.evaluate(() => ({ letter: !document.getElementById('letter').hidden, tutorial: window.__game.tutorial() }));
  check(!again.letter && again.tutorial?.id === 'band', `Neu laden: kein Brief, Hilde macht bei Schritt 4 weiter (${again.tutorial?.id})`);

  // 4 Förderband
  await expectHint('#btn-build', 'Schritt 4 nach dem Neuladen');
  await tapRing();
  await expectHint('tool:belt', 'Schritt 4, Bauleiste offen');
  await shot('4-bauleiste');
  await tapRing();
  l = await expectHint('port:holzfaeller:out', 'Schritt 4, Band ziehen');
  const pts = [await tile(hf.x + 2, hf.y), await tile(hf.x + 4, hf.y)];
  check(pts[0].x > l.ring.left && pts[0].x < l.ring.right && pts[0].y > l.ring.top && pts[0].y < l.ring.bottom, 'Der Ring liegt um das Feld vor dem orangen Ausgang – dort beginnt das Band');
  await shot('4b-band-ziehen');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...pts[0], id: 7 }] });
  for (let s = 1; s <= 8; s++) {
    const t = s / 8;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pts[0].x + (pts[1].x - pts[0].x) * t, y: pts[0].y + (pts[1].y - pts[0].y) * t, id: 7 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
  check((await game(page, () => Object.keys(window.__game.state.belts).length)) === 3, 'Band mit 3 Feldern vom Holzfällerlager zum Portal gezogen');
  check((await game(page, () => window.__game.tutorial().id)) === 'band', 'Noch nichts angekommen – Schritt 4 wartet');
  await game(page, () => window.__game.simulate(30));

  // 5 Laden-Lager
  await expectHint('#tool-confirm', 'Schritt 5, noch im Bandmodus');
  await tapRing();
  await expectHint('#build-close', 'Schritt 5, Bauleiste noch offen');
  await tapRing();
  l = await expectHint('#btn-shop', 'Schritt 5');
  check(l.text.includes('Laden-Lager'), 'Die ersten Holzblöcke sind da → Hilde erklärt das Laden-Lager');
  await shot('5-laden');
  await tapRing();

  // 6 Theke
  l = await expectHint('tab:theken', 'Schritt 6, Laden offen (Lager)');
  await shot('6-lager');
  await tapRing();
  await expectHint('counter:ware', 'Schritt 6, Theken');
  await tapRing();
  await expectHint('pick:holzblock', 'Schritt 6, Ware wählen');
  await tapRing();
  await expectHint('amount:ok', 'Schritt 6, Menge');
  await shot('6b-menge');
  await tapRing();
  l = await expectHint('counter:stocked', 'Schritt 6, Holzblöcke liegen auf der Theke');
  check((await game(page, () => window.__game.state.counters[0].count)) > 0, 'Holzblöcke liegen auf Theke 1');
  // v0.53.0: Der erste Kunde kommt genau 5 Sekunden nach dem Hinlegen, Hilde und die Theke zählen
  // herunter. Die Fabrik läuft im Browser weiter – deshalb Zeit, Text und Verkäufe in einem Zug lesen.
  const readWait = (advance) =>
    page.evaluate(async (sec) => {
      if (sec > 0) window.__game.simulate(sec);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return {
        left: window.__game.state.market.timers[0],
        sales: window.__game.state.market.nextSaleId - 1,
        hilde: document.getElementById('hilde-text').textContent,
        counter: document.querySelector('#modal-content .counter-card[data-counter="0"] .counter-next')?.textContent ?? '',
      };
    }, advance);
  const shownSeconds = (text) => Number(/kommt in (\d+)\ss/.exec(text)?.[1] ?? 0);
  const w1 = await readWait(0);
  check(
    w1.sales === 0 && w1.left > 1.5 && w1.left <= 5 && shownSeconds(w1.hilde) === Math.max(1, Math.ceil(w1.left)) && /Nächster Kunde in etwa [1-5] s/.test(w1.counter),
    `Erster Kunde in 5 s: Hilde „${w1.hilde}“, Theke „${w1.counter}“ (noch ${w1.left.toFixed(2)} s)`,
  );
  const w2 = await readWait(1);
  check(w2.sales === 0 && shownSeconds(w2.hilde) < shownSeconds(w1.hilde), `Hilde zählt herunter, noch kein Verkauf („${w2.hilde}“, noch ${w2.left.toFixed(2)} s)`);
  await shot('6c-warten');
  await game(page, () => window.__game.simulate(5));

  // 7 Händler
  l = await expectHint('tab:haendler', 'Schritt 7');
  check(l.text.includes('Dein erstes Gold'), 'Der erste Kunde hat gekauft → Schritt 7');
  await tapRing();
  await expectHint('buy:holzstamm', 'Schritt 7, Händler');
  await shot('7-haendler');
  const logs = await game(page, () => window.__game.state.storage.holzstamm ?? 0);
  await tapRing();
  check((await game(page, () => window.__game.state.storage.holzstamm ?? 0)) === logs + 1, 'Einen Holzstamm gekauft');

  // 8 Aufträge
  await expectHint('#modal-close', 'Schritt 8, Laden noch offen');
  await tapRing();
  await expectHint('#btn-level', 'Schritt 8');
  await shot('8-level');
  await tapRing();
  await page.waitForFunction(() => document.getElementById('letter')?.classList.contains('open'), null, { timeout: 5000 });
  await sleep(700);
  const bye = await page.evaluate(() => ({ text: document.getElementById('letter').textContent, ok: document.getElementById('letter-ok').textContent }));
  check(
    bye.text.includes('Jetzt bist du dran!') && bye.text.includes('Zimmermann Jakob') && bye.text.includes('Sägewerk') && bye.text.includes('Ort & Level'),
    `Abschlussbrief: erster Auftrag, Tipp zum Sägewerk, wo man die Einführung wiederfindet („${bye.ok}“)`,
  );
  await shot('9-abschluss');
  await readLetter(page);
  const done = await page.evaluate(() => ({
    tutorial: window.__game.tutorial(),
    hilde: !document.getElementById('hilde').hidden || !document.getElementById('hilde-ring').hidden,
    level: !document.getElementById('modal').hidden,
  }));
  await game(page, () => window.__game.saveNow());
  const stored = await game(page, () => JSON.parse(localStorage.getItem('erstesspiel-spielstand-3d-test')).state.tutorial);
  check(done.tutorial === null && stored === null && !done.hilde && done.level, 'Danach ist die Einführung fertig (auch im Spielstand), das Level-Fenster mit den Aufträgen ist offen');

  // „🎓 Einführung ansehen“, Wegklappen, „Weiter ›“, „Beenden“
  await page.tap('#modal-content .tab[data-tab="town"]');
  await sleep(200);
  check(await page.isVisible('#level-tutorial'), 'Level-Fenster, Reiter „Ort & Level“: „🎓 Einführung ansehen“');
  await shot('10-ansehen');
  await page.tap('#level-tutorial');
  await readLetter(page);
  l = await expectHint('building:holzfaeller', 'Ansehen: Schritt 2');
  check(l.tutorial?.review === true && (await page.isHidden('#modal')), 'Ansehen beginnt von vorn (Fabrik liefert schon: Lieferungen zählen nicht), das Level-Fenster ist zu');
  await page.tap('#hilde-close');
  await sleep(200);
  l = await look(page);
  check(!l.box && l.mini && l.ring && l.arrow && inView(l.mini), '✕ klappt Hilde weg: sie wartet klein am Rand, Pfeil und Ring bleiben');
  await shot('11-weggeklappt');
  await page.tap('#hilde-mini');
  await sleep(300);
  l = await look(page);
  check(l.box && !l.mini, 'Antippen holt Hildes Fenster zurück');
  await page.tap('#hilde-next');
  l = await expectHint('building:versandportal', 'Weiter ›');
  check(l.step === 'Schritt 3 von 8', '„Weiter ›“ überspringt Schritt 2');
  await page.tap('#hilde-end');
  await page.waitForSelector('#dialog:not([hidden])');
  await sleep(150);
  const dialog = await page.evaluate(() => {
    const d = document.querySelector('#dialog .dialog-box').getBoundingClientRect();
    const h = document.getElementById('hilde').getBoundingClientRect();
    return { title: document.getElementById('dialog-title').textContent, top: document.elementFromPoint(d.left + d.width / 2, d.top + 20)?.closest('#dialog') !== null, hilde: h };
  });
  check(dialog.title === 'Einführung beenden?' && dialog.top, `„Beenden“ fragt nach („${dialog.title}“), die Frage liegt über Hildes Fenster`);
  await shot('12-beenden');
  await page.tap('#dialog-ok');
  await sleep(250);
  l = await look(page);
  check(l.tutorial === null && !l.box && !l.mini && !l.ring && !l.arrow, 'Einführung beendet: Fenster, Pfeil und Ring sind weg');

  check(errors.length === 0, `Keine Fehler im Browser${errors.length ? `: ${errors.join(' | ')}` : ''}`);

  await context.close();
}

module.exports = { runTutorial };
