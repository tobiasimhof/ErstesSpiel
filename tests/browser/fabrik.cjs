// Browser-Test „Fabrik“: spielt in Tablet- und Handygröße per Touch die
// Bauleiste, Bauen, Bänder, Fläche, Bereiche, Speichern, Laden, Theken,
// Aufträge und Aufstiege bis Level 14, dazu Hochformat und ein schmales Handy.
// Gestartet von smoke.cjs (ONLY=fabrik: nur dieser Teil). Bis v0.53.0 lief er
// in der 2D-Welt; seit v0.54.0 im 3D-Spiel – Felder, die verdeckt oder nicht
// im Bild sind, holt tapTile vorher in die Mitte (helpers.cjs).

const {
  fs,
  path,
  ROOT,
  OUT,
  startServer,
  DEVICES,
  check,
  sleep,
  tilePos,
  tilesFree,
  showTiles,
  centerOn,
  tapTile,
  touchDragTiles,
  game,
  tapBuild,
  infoButton,
  recipeOption,
  infoText,
  infoCard,
  storeSlots,
  shipCard,
  infoFits,
  beltOuts,
  mode,
  waitForGame,
  readLetter,
  setDevice,
} = require('./helpers.cjs');

async function runDevice(browser, baseUrl, device, expectedVersion) {
  console.log(`\n${device.name} (${device.viewport.width}×${device.viewport.height})`);
  setDevice(device.name);
  const context = await browser.newContext({
    viewport: device.viewport,
    // v0.54.0: in 3D einfache Pixeldichte – ohne Grafikkarte rechnet der Browser
    // jedes Bild selbst, in doppelter Auflösung wäre das Durchspielen stundenlang
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const shot = (name) => page.screenshot({ path: path.join(OUT, `${device.name}-${name}.png`) });

  await page.goto(baseUrl);
  await waitForGame(page);

  // ---------- Start ----------
  check((await page.textContent('#menu-version')) === `Version ${expectedVersion}`, `Versionsnummer ${expectedVersion} im Menü`); // v0.53.0: aus der Leiste ins Menü
  check(!(await page.isVisible('#rotate-overlay')), 'Kein Dreh-Hinweis im Querformat');
  check(!(await page.isVisible('#boot-error')), 'Keine Meldung „Spiel konnte nicht starten“');
  const versioned = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((e) => e.name.includes('/src/') && e.name.endsWith('.js') === false && e.name.includes('.js'))
      .every((e) => e.name.includes(`?v=${window.__game.VERSION}`)),
  );
  const unversioned = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((e) => e.name)
      .filter((n) => n.includes('/src/') && /\.js$/.test(n)),
  );
  check(versioned && unversioned.length === 0, `Alle Programmdateien werden mit Versionsnummer geladen${unversioned.length ? ': ohne ' + unversioned.join(', ') : ''}`);
  const types = await game(page, () => window.__game.state.buildings.map((b) => b.type).sort());
  check(JSON.stringify(types) === '["holzfaeller","versandportal"]', 'Start nur mit Holz: Holzfällerlager und Versandportal');
  check((await page.textContent('#btn-level')).includes('Laden-Level 1'), 'Oben steht „Laden-Level 1“');
  check(!(await page.isVisible('#hud-level-ready')), 'Noch kein Aufstieg möglich (kein ⬆)');
  check((await page.textContent('#hud-gold')) === '500', 'Start mit 500 Gold Startkapital (v0.36.0)');
  check(await page.isVisible('#btn-shop'), 'Knopf „Laden“ sichtbar');
  check(await page.isVisible('#btn-build'), 'Knopf „Bauen“ sichtbar');

  const plot = await game(page, () => {
    const p = window.__game.state.plot;
    return { px: p.x, py: p.y, width: p.width, height: p.height };
  });
  // v0.54.0: In 3D zeigt der Start die Gebäude mit Platz drumherum (nicht das ganze Grundstück)
  check(
    await tilesFree(
      page,
      [
        [10, 6],
        [11, 7],
      ],
      0,
    ),
    'Holzfällerlager beim Start frei im Bild',
  );
  await shot('1-start');

  // ---------- Gebäude antippen, drehen ----------
  await tapTile(page, 10, 6);
  check((await page.textContent('#info-title')) === 'Holzfällerlager', 'Antippen zeigt Infofenster „Holzfällerlager“');
  const actionKeys = await page.locator('#info-panel button[data-key]').evaluateAll((list) => list.map((b) => b.dataset.key));
  check(
    ['refill', 'load:holzstamm', 'buy:holzstamm', 'move', 'rotate', 'remove'].every((k) => actionKeys.includes(k)),
    `Infofenster hat Auffüllen, Einlegen, Kaufen, Verschieben, Drehen, Abreißen (${actionKeys.join(', ')})`,
  );
  check(
    (await page.locator('#info-tools button').allTextContents()).join(',') === '↔ Verschieben,↻ Drehen,🗑 Abreißen',
    'v0.19.0: Verschieben, Drehen, Abreißen klein in einer Zeile unten',
  );
  check((await page.textContent('#info-meta')).includes('Leer – Rohstoff nachlegen'), 'Status steht unter dem Namen');
  const startCard = await infoCard(page);
  check(
    startCard?.caption === 'Stellt her' && startCard.inputs.join() === 'holzstamm 1' && startCard.outputs.join().startsWith('holzblock 200 Holzblöcke'),
    `Grüner Kasten: 1 Holzstamm → 200 Holzblöcke (${JSON.stringify(startCard)})`,
  );
  const startText = await infoText(page);
  check(startText.includes('Im Laden-Lager: 1 Holzstamm'), 'Infofenster zeigt Vorrat im Laden-Lager');
  check(startText.includes('Vorrat 0 / 3'), 'Infofenster zeigt den Vorrat im Gebäude (0 / 3)');
  check(
    (await page.locator('#info-body .source-slots .item-icon.empty').count()) === 3,
    'Vorrat als 3 Bilder, alle blass (leer)',
  );
  check(!(await page.isVisible('#info-text')) && (await page.textContent('#info-hint')).includes('orangen Pfeil'), 'Kurzer Tipp ganz unten statt langer Beschreibung');
  const startFit = await infoFits(page);
  check(startFit.length === 0, `Alle Knöpfe passen ins Infofenster (${startFit.join(' | ')})`);
  check(
    (await page.locator('#info-actions button', { hasText: 'Auffüllen' }).textContent()) === '⏫ Auffüllen: 3 Holzstämme · kauft 2 für 366 🪙',
    'Auffüllen nimmt den Holzstamm aus dem Laden-Lager und kauft 2 dazu (500 Gold Startkapital)',
  );
  check(!(await infoButton(page, 'buy:holzstamm').isDisabled()), 'Mit 500 Gold reicht es für Holzstämme (183)');
  await page.locator('#info-tools button', { hasText: 'Drehen' }).tap();
  await sleep(80);
  check((await game(page, () => window.__game.state.buildings[0].rot)) === 1, 'Drehen dreht das Gebäude');
  await shot('2-info');
  await page.tap('#info-close');
  check(!(await page.isVisible('#info-panel')), 'Schließen-Knopf schließt Infofenster');

  // ---------- Laden ----------
  await page.tap('#btn-shop');
  await sleep(80);
  const shopText = await page.textContent('#modal-content');
  check(shopText.includes('Testers Laden') && shopText.includes('Holzstamm') && shopText.includes('Holzblock'), 'Laden-Fenster zeigt Laden-Lager mit Startvorrat');
  check((await page.locator('#modal-content .tab').count()) === 3, 'Laden-Fenster hat drei Reiter');
  // v0.30.0: Laden-Lager vergrößern erst ab Level 7
  const upgrade1 = await page.textContent('#modal-content .storage-upgrade');
  check(
    upgrade1.includes('Laden-Lager: 500 Plätze') && upgrade1.includes('Ab Level 7') && (await page.locator('[data-storage-action="vergroessern"]').count()) === 0,
    `Lager auf Level 1: 500 Plätze, vergrößern erst ab Level 7, kein Knopf („${upgrade1}“)`,
  );
  await shot('3-laden');
  await page.tap('#modal-content .tab[data-tab="haendler"]');
  await sleep(80);
  const rockRow = page.locator('#modal-content .trade-row', { hasText: 'Felsbrocken' });
  check((await rockRow.textContent()).includes('ab Level 2') && (await rockRow.locator('button').isDisabled()), 'Händler: Felsbrocken gesperrt bis Level 2');
  await shot('3-haendler-gesperrt');
  await page.tap('#modal-close');
  check(!(await page.isVisible('#modal')), 'Laden-Fenster schließt');

  // ---------- Testpaket ----------
  // Ohne Waren lässt sich nichts bauen. Das Testpaket gibt es nur im Testmodus.
  check(!(await page.isVisible('#menu-test-pack')), 'Testpaket ist ohne Testmodus versteckt');
  await page.tap('#btn-menu');
  await page.tap('#menu-test-mode');
  await page.tap('#btn-menu');
  check(await page.isVisible('#menu-test-pack'), 'Testpaket im Testmodus sichtbar');
  await page.tap('#menu-test-pack');
  await sleep(80);
  const pack = await game(page, () => ({ gold: window.__game.state.gold, blocks: window.__game.state.storage.holzblock }));
  check(pack.gold >= 330 && pack.blocks >= 70, `Testpaket gibt Gold und Waren (${pack.gold} Gold, ${pack.blocks} Holzblöcke)`);
  await page.tap('#btn-menu');
  await page.tap('#menu-test-mode');
  check(!(await page.isVisible('#hud-speed')), 'Testmodus wieder aus');

  // ---------- Bauen: Sägewerk ----------
  await page.tap('#btn-build');
  await sleep(80);
  check(await page.isVisible('#build-bar'), 'Bauleiste öffnet sich');
  check(!(await page.isVisible('#bottom-bar')), 'Grundleiste ist währenddessen ausgeblendet');

  // v0.10.2: Die Warenbilder der Baukosten sind gezeichnet – auch nachdem der
  // Browser sie weggeworfen hat (Tobias: nach dem Minimieren nur noch Zahlen).
  const costIcons = () =>
    page.evaluate(() => {
      const icons = [...document.querySelectorAll('#build-bar .cost-part canvas.item-icon')];
      const painted = icons.filter((c) => {
        const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
        return false;
      });
      return { total: icons.length, painted: painted.length };
    });
  const wipeIcons = () =>
    page.evaluate(() => {
      for (const c of document.querySelectorAll('canvas.item-icon')) c.width = c.width; // leert die Zeichnung
    });
  let icons = await costIcons();
  check(icons.total >= 8 && icons.painted === icons.total, `Bauleiste zeigt die Warenbilder der Baukosten (${icons.painted}/${icons.total})`);
  await wipeIcons();
  check((await costIcons()).painted === 0, 'Warenbilder absichtlich gelöscht (wie beim Minimieren)');
  await page.tap('#build-close');
  await sleep(80);
  await page.tap('#btn-build');
  await sleep(80);
  icons = await costIcons();
  check(icons.painted === icons.total, `Bauleiste neu geöffnet: Warenbilder wieder da (${icons.painted}/${icons.total})`);
  await wipeIcons();
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  icons = await costIcons();
  check(icons.painted === icons.total, `Zurück ins Spiel: Warenbilder wieder da (${icons.painted}/${icons.total})`);
  const quarryItem = page.locator('.build-item[data-tool="steinbruch"]');
  check(
    (await quarryItem.evaluate((b) => b.classList.contains('locked'))) && (await quarryItem.textContent()).includes('Level 2'),
    'Steinbruch in der Bauleiste gesperrt (🔒 Level 2)',
  );
  await shot('4-bauleiste');

  // ---------- v0.18.0: Reiter, Werkzeuge immer sichtbar, Platz unter der Karte ----------
  const shownTools = () =>
    page.evaluate(() => [...document.querySelectorAll('#build-bar .build-item')].filter((b) => b.offsetParent !== null).map((b) => b.dataset.tool));
  const tabActive = (tab) => page.locator(`.build-tab[data-tab="${tab}"]`).evaluate((b) => b.classList.contains('active'));
  const tabNames = await page.locator('.build-tab').allTextContents();
  // v0.26.0: dazu „Werkstatt“ (ab Level 9)
  check(
    tabNames.length === 5 && ['Holz', 'Stein', 'Eisen', 'Erde', 'Werkstatt'].every((n, i) => tabNames[i].includes(n)),
    `Bauleiste hat die Reiter Holz, Stein, Eisen, Erde, Werkstatt (${tabNames.join(', ')})`,
  );
  check(await tabActive('holz'), 'Reiter „Holz“ ist zu Beginn offen');
  let shown = await shownTools();
  check(
    shown.join(',') === 'belt,lagerhaus,versandportal,area,erase,holzfaeller,saegewerk,zimmerei,kohlenmeiler',
    `Links immer Förderband, Lagerhaus, Portal, Verschieben, Abreißen; rechts die Holz-Gebäude (${shown.join(', ')})`,
  );
  check(
    (await page.locator('.build-tab[data-tab="stein"]').evaluate((b) => b.classList.contains('locked'))) &&
      !(await page.locator('.build-tab[data-tab="holz"]').evaluate((b) => b.classList.contains('locked'))),
    'Reiter „Stein“ trägt auf Level 1 ein Schloss, „Holz“ nicht',
  );
  await page.tap('.build-tab[data-tab="eisen"]');
  await sleep(80);
  shown = await shownTools();
  check(
    shown.join(',') === 'belt,lagerhaus,versandportal,area,erase,schmelzhuette,schmiede,feinschmiede,schlosserei',
    `Reiter „Eisen“: Schmelzhütte, Schmiede, Feinschmiede, Schlosserei – die Werkzeuge bleiben (${shown.join(', ')})`,
  );
  const fits = await page.evaluate(() =>
    [...document.querySelectorAll('#build-bar button')]
      .filter((b) => b.offsetParent !== null)
      .filter((b) => {
        const r = b.getBoundingClientRect();
        return r.left < 0 || r.right > window.innerWidth + 0.5 || b.scrollWidth > b.clientWidth + 1;
      })
      .map((b) => b.dataset.tool ?? b.dataset.tab ?? b.id),
  );
  check(fits.length === 0, `Alle Knöpfe und Reiter passen auf den Bildschirm, kein Name ragt heraus${fits.length ? ': ' + fits.join(', ') : ''}`);
  const itemsScroll = await page.evaluate(() => {
    const el = document.getElementById('build-items');
    return el.scrollWidth - el.clientWidth;
  });
  check(itemsScroll <= 1, `Die 4 Eisen-Gebäude passen nebeneinander (Überstand ${itemsScroll} px)`);
  await shot('4b-reiter-eisen');
  await page.tap('#build-close');
  await sleep(80);
  await page.tap('#btn-build');
  await sleep(80);
  check(await tabActive('eisen'), 'Bauleiste merkt sich den zuletzt geöffneten Reiter');
  check(
    await page.evaluate(() => getComputedStyle(document.getElementById('hint')).opacity === '0'),
    'Hinweis „Ziehen: verschieben …“ liegt nicht über der Bauleiste',
  );
  // Ganz nach unten schieben: Die unterste Reihe der Welt liegt über Leiste und Reitern.
  const stageBox = await page.locator('#game').boundingBox();
  for (let i = 0; i < 8; i++) {
    const x = stageBox.x + stageBox.width / 2;
    const y0 = stageBox.y + stageBox.height * 0.5;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0, id: 3 }] });
    for (let st = 1; st <= 6; st++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - st * 20, id: 3 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  await sleep(80);
  // v0.54.0: in 3D – die Mitte der untersten Reihe liegt über den Reitern
  const edge = await page.evaluate(() => {
    const { state, view3d } = window.__game;
    const w = state.world;
    return {
      worldBottom: view3d.tile(Math.floor(w.x + w.width / 2), w.y + w.height - 1).y,
      tabsTop: document.getElementById('build-tabs').getBoundingClientRect().top,
    };
  });
  check(
    edge.worldBottom <= edge.tabsTop,
    `Ganz nach unten geschoben: Die unterste Reihe liegt über der Bauleiste samt Reitern (Reihe ${Math.round(edge.worldBottom)}, Reiter ${Math.round(edge.tabsTop)})`,
  );
  await shot('4c-ganz-unten');
  await showTiles(page, [
    [plot.px, plot.py],
    [plot.px + plot.width - 1, plot.py + plot.height - 1],
  ], 0);

  await tapBuild(page, 'steinbruch');
  await sleep(80);
  check((await mode(page)) === 'menu' && (await page.textContent('#toast')).includes('ab Level 2'), 'Gesperrtes Gebäude antippen sagt, ab welchem Level');
  const toastAbove = await page.evaluate(
    () => document.getElementById('toast').getBoundingClientRect().bottom <= document.getElementById('build-tabs').getBoundingClientRect().top,
  );
  check(toastAbove, 'Die Meldung erscheint über der Bauleiste samt Reitern (nicht darauf)');
  await tapBuild(page, 'saegewerk');
  await sleep(80);
  check((await mode(page)) === 'place', 'Sägewerk wählen startet die Vorschau');
  check(await game(page, () => window.__game.ui.ghost?.valid === true), 'Vorschau steht auf freier Fläche (grün)');
  // Vorschau mit dem Finger nach rechts unten an eine bekannte Stelle schieben
  const ghost = await game(page, () => ({ ...window.__game.ui.ghost }));
  await touchDragTiles(page, cdp, [
    [ghost.x, ghost.y],
    [20, 12],
  ]);
  const moved = await game(page, () => ({ ...window.__game.ui.ghost }));
  check(moved.x === 20 && moved.y === 12, `Vorschau lässt sich verschieben (jetzt ${moved.x},${moved.y})`);
  await page.tap('#tool-rotate');
  check((await game(page, () => window.__game.ui.ghost.rot)) === 1, 'Vorschau lässt sich drehen');
  await page.tap('#tool-rotate');
  await page.tap('#tool-rotate');
  await page.tap('#tool-rotate');
  await shot('5-vorschau');
  await page.tap('#tool-confirm');
  await sleep(80);
  const saw = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'saegewerk'));
  check(saw && saw.x === 20 && saw.y === 12, 'Sägewerk wurde gebaut');
  const blocksAfterSaw = await game(page, () => window.__game.state.storage.holzblock);
  check(blocksAfterSaw === pack.blocks - 40, `Sägewerk kostet 40 Holzblöcke (${pack.blocks} → ${blocksAfterSaw})`);
  check((await mode(page)) === 'menu', 'Nach dem Bauen ist die Bauleiste wieder offen');

  // ---------- Förderbänder ----------
  await page.tap('.build-item[data-tool="belt"]');
  await sleep(80);
  check((await mode(page)) === 'belt', 'Förderband-Modus aktiv');
  await touchDragTiles(page, cdp, [
    [13, 6],
    [21, 6],
  ]);
  const line = [];
  for (let x = 13; x <= 21; x++) line.push(JSON.stringify(await beltOuts(page, x, 6)));
  check(line.every((o) => o === '["E"]'), 'Gerade Strecke nach rechts gelegt');
  check((await game(page, () => window.__game.state.storage.holzblock)) === blocksAfterSaw - 9, '9 Felder Förderband kosten 9 Holzblöcke');

  await touchDragTiles(page, cdp, [
    [15, 6],
    [15, 9],
  ]);
  check(JSON.stringify(await beltOuts(page, 15, 6)) === '["E","S"]', 'Von einem Band aus ziehen teilt es auf');

  await touchDragTiles(page, cdp, [
    [18, 9],
    [18, 6],
  ]);
  check(JSON.stringify(await beltOuts(page, 18, 8)) === '["N"]', 'Zulauf von unten liegt');
  check(JSON.stringify(await beltOuts(page, 18, 6)) === '["E"]', 'Auf ein Band ziehen führt zusammen (Band bleibt gleich)');

  // Strecke in das Sägewerk (Eingang links bei 19,12)
  await touchDragTiles(page, cdp, [
    [15, 9],
    [15, 12],
    [21, 12],
  ]);
  check(JSON.stringify(await beltOuts(page, 19, 12)) === '["E"]', 'Strecke endet am Eingang des Sägewerks');
  check((await beltOuts(page, 20, 12)) === null, 'Kein Band im Sägewerk');

  await tapTile(page, 21, 6);
  check(JSON.stringify(await beltOuts(page, 21, 6)) === '["S"]', 'Antippen dreht ein Band');
  await shot('6-foerderbaender');

  // ---------- Abreißen ----------
  await page.tap('#tool-confirm'); // Fertig → Bauleiste
  await page.tap('.build-item[data-tool="erase"]');
  await sleep(80);
  check((await mode(page)) === 'erase', 'Abreiß-Modus aktiv');
  await touchDragTiles(page, cdp, [
    [20, 6],
    [21, 6],
  ]);
  check((await beltOuts(page, 20, 6)) === null && (await beltOuts(page, 21, 6)) === null, 'Wischen entfernt Bänder');
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  check((await mode(page)) === 'normal' && (await page.isVisible('#bottom-bar')), 'Bauleiste schließt, Grundleiste wieder da');

  // ---------- Band antippen ----------
  await tapTile(page, 13, 6);
  check((await page.textContent('#info-title')) === 'Förderband', 'Antippen eines Bandes zeigt Infofenster');
  await tapTile(page, 16, 13);
  check(!(await page.isVisible('#info-panel')), 'Antippen freier Fläche schließt Infofenster');

  // ---------- Fläche kaufen ----------
  // (die Felder außerhalb holt tapTile ins Bild)
  await tapTile(page, plot.px - 1, plot.py - 1);
  check((await page.textContent('#info-title')) === 'Gesperrte Fläche', 'Ecke der gesperrten Fläche zeigt Hinweis');
  await tapTile(page, plot.px - 1, plot.py + 4);
  check((await page.textContent('#info-title')) === 'Fläche kaufen', 'Gesperrte Fläche links antippen bietet Fläche an');
  check((await page.textContent('#info-meta')).includes('4 Spalten links · 56 Felder'), 'Angebot: 4 Spalten links, 56 Felder (schon auf Level 1)');
  check((await page.textContent('#info-text')).includes('noch 2×'), 'Infofenster: an dieser Seite noch 2 Käufe');
  const landButton = page.locator('#info-actions button', { hasText: 'Kaufen' });
  check((await landButton.textContent()).includes('170'), 'Streifen kostet 170 Gold');
  await shot('6b-flaeche-angebot');
  const goldBeforeLand = await game(page, () => window.__game.state.gold);
  await landButton.tap();
  await sleep(120);
  const land = await game(page, () => ({ plot: { ...window.__game.state.plot }, gold: window.__game.state.gold }));
  check(land.plot.x === plot.px - 4 && land.plot.width === 26 && land.gold === goldBeforeLand - 170, `Fläche gekauft (Grundstück ${land.plot.width} × ${land.plot.height}, Gold ${goldBeforeLand} → ${land.gold})`);
  check(!(await page.isVisible('#info-panel')), 'Nach dem Kauf schließt das Fenster');
  await shot('6c-flaeche-gekauft');

  // ---------- Zoomen & Verschieben ----------
  // v0.54.0: in 3D – Zoomen ändert den Abstand der Kamera, Verschieben ihr Ziel
  const canvasBox = await page.locator('#game').boundingBox();
  const cx = canvasBox.x + canvasBox.width / 2;
  const cy = canvasBox.y + canvasBox.height / 2;
  await showTiles(page, [
    [plot.px, plot.py],
    [plot.px + plot.width - 1, plot.py + plot.height - 1],
  ], 0);
  const zoomBefore = await game(page, () => window.__game.camera.distance);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: cx - 40, y: cy, id: 1 },
      { x: cx + 40, y: cy, id: 2 },
    ],
  });
  for (let s = 1; s <= 8; s++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: cx - 40 - s * 10, y: cy, id: 1 },
        { x: cx + 40 + s * 10, y: cy, id: 2 },
      ],
    });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(80);
  const zoomAfter = await game(page, () => window.__game.camera.distance);
  check(zoomAfter < zoomBefore * 0.8, `Zwei-Finger-Zoom holt heran (Abstand ${zoomBefore.toFixed(1)} → ${zoomAfter.toFixed(1)})`);

  const camTarget = () => game(page, () => window.__game.view3d.target());
  const camBefore = await camTarget();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 3 }] });
  for (let s = 1; s <= 8; s++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - s * 15, y: cy, id: 3 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(80);
  const camMoved = await camTarget();
  check(Math.hypot(camMoved[0] - camBefore[0], camMoved[1] - camBefore[1]) > 0.5, `Ein-Finger-Ziehen verschiebt die Karte (${camBefore.map((v) => v.toFixed(1))} → ${camMoved.map((v) => v.toFixed(1))})`);
  const beltCountBefore = await game(page, () => Object.keys(window.__game.state.belts).length);
  await page.mouse.move(cx, cy);
  await page.mouse.wheel(0, 300);
  await sleep(80);
  check((await game(page, () => window.__game.camera.distance)) > zoomAfter, 'Mausrad zoomt heraus');

  // ---------- Speichern & Laden ----------
  await game(page, () => window.__game.saveNow());
  await page.reload();
  await waitForGame(page);
  const after = await game(page, () => ({
    buildings: window.__game.state.buildings.length,
    belts: Object.keys(window.__game.state.belts).length,
    rot: window.__game.state.buildings.find((b) => b.type === 'holzfaeller').rot,
    plotWidth: window.__game.state.plot.width,
  }));
  check(after.buildings === 3 && after.belts === beltCountBefore && after.rot === 1 && after.plotWidth === 26, 'Nach dem Neuladen ist alles noch da (auch die gekaufte Fläche)');
  check((await page.textContent('#toast')).includes('Spielstand geladen'), 'Meldung „Spielstand geladen“');

  // ---------- Gebäude abreißen ----------
  await tapTile(page, 14, 9);
  await page.locator('#info-tools button', { hasText: 'Abreißen' }).tap();
  await sleep(80);
  check(await page.isVisible('#dialog'), 'Abreißen fragt nach');
  check((await page.textContent('#dialog-text')).includes('nichts gekostet'), 'Startgebäude: keine Baukosten zurück (Hinweis)');
  await shot('7-abreissen-frage');
  await page.tap('#dialog-ok');
  await sleep(80);
  check(!(await game(page, () => window.__game.state.buildings.some((b) => b.type === 'versandportal'))), 'Versandportal abgerissen');

  // ---------- Bereich markieren, verschieben, drehen, abreißen (v0.11.0) ----------
  // Sägewerk (20,12) mit seiner Zuleitung (15,11)–(19,12) als Gruppe umsetzen
  const area = () =>
    game(page, () => {
      const a = window.__game.ui.area;
      const g = a?.ghost;
      return a
        ? {
            buildings: a.sel.buildings.length,
            belts: a.sel.belts.length,
            ghost: g ? { x: g.x, y: g.y, turns: g.turns, valid: g.plan?.valid, w: g.plan?.width, h: g.plan?.height } : null,
          }
        : null;
    });
  const sawNow = () => game(page, () => ({ ...window.__game.state.buildings.find((b) => b.type === 'saegewerk') }));
  const beltTotal = () => game(page, () => Object.keys(window.__game.state.belts).length);
  const sawBefore = await sawNow();
  const beltsBefore = await beltTotal();
  await page.tap('#btn-build');
  await sleep(80);
  await page.tap('.build-item[data-tool="area"]');
  await sleep(80);
  check((await mode(page)) === 'area', 'Werkzeug „Verschieben“: Bereich markieren');
  check(await page.locator('#tool-area-move').isDisabled(), 'Verschieben erst, wenn etwas markiert ist');
  await touchDragTiles(page, cdp, [
    [15, 11],
    [21, 13],
  ]);
  let marked = await area();
  check(marked.buildings === 1 && marked.belts === 6, `Rechteck ziehen markiert Sägewerk und Zuleitung (${marked.buildings} Gebäude, ${marked.belts} Bänder)`);
  check((await page.textContent('#tool-text')).includes('1 Gebäude und 6 Bänder'), 'Unten steht, was markiert ist');
  await shot('18-bereich-markiert');
  await page.tap('#tool-area-move');
  await sleep(80);
  marked = await area();
  check((await mode(page)) === 'areaMove' && marked.ghost.valid && marked.ghost.w === 7 && marked.ghost.h === 3, 'Verschieben: Vorschau 7 × 3 an der alten Stelle');
  await page.keyboard.press('r');
  await sleep(60);
  marked = await area();
  check(marked.ghost.turns === 1 && marked.ghost.w === 3 && marked.ghost.h === 7, 'Taste R dreht die ganze Gruppe (jetzt 3 × 7)');
  await touchDragTiles(page, cdp, [
    [marked.ghost.x + 1, marked.ghost.y + 3],
    [24, 14],
  ]);
  marked = await area();
  check(marked.ghost.x === 23 && marked.ghost.y === 11 && marked.ghost.valid, `Gruppe mit dem Finger verschoben (${marked.ghost.x},${marked.ghost.y}, grün)`);
  await shot('19-bereich-verschieben');
  await page.tap('#tool-confirm');
  await sleep(80);
  const sawMoved = await sawNow();
  check(
    sawMoved.x === 23 && sawMoved.y === 16 && sawMoved.rot === (sawBefore.rot + 1) % 4 && sawMoved.id === sawBefore.id,
    `Sägewerk gedreht und umgesetzt (${sawBefore.x},${sawBefore.y} → ${sawMoved.x},${sawMoved.y})`,
  );
  check((await beltTotal()) === beltsBefore, 'Alle Bänder sind mitgekommen');
  check(
    (await game(page, () => window.__game.state.belts['24,15']?.outs.join(''))) === 'S',
    'Zuleitung zeigt nach dem Drehen nach unten in den Eingang des Sägewerks',
  );
  check((await mode(page)) === 'area' && (await area()).buildings === 1, 'Danach bleibt die Gruppe markiert');
  // v0.41.0: Bereich kopieren – Vorschau mit Kosten; fehlen Waren, wird nichts gebaut
  const sawCount = () => game(page, () => window.__game.state.buildings.filter((b) => b.type === 'saegewerk').length);
  const sawsBeforeCopy = await sawCount();
  const savedBlocks = await game(page, () => {
    const n = window.__game.state.storage.holzblock ?? 0;
    window.__game.state.storage.holzblock = 5;
    return n;
  });
  await page.tap('#tool-area-copy');
  await sleep(80);
  marked = await area();
  check((await mode(page)) === 'areaCopy' && marked.ghost.valid, `Kopieren: Vorschau neben dem Original (${marked.ghost.x},${marked.ghost.y})`);
  const copyText2d = await page.textContent('#tool-text');
  check(copyText2d.includes('46 Holzblöcke') && copyText2d.includes('Es fehlen: 41 Holzblöcke'), `Kosten und was fehlt stehen unten („${copyText2d}“)`);
  await shot('19b-bereich-kopieren');
  await page.tap('#tool-confirm');
  await sleep(80);
  check((await sawCount()) === sawsBeforeCopy && (await page.textContent('#toast')).includes('Nichts gebaut'), 'Zu wenig Holzblöcke: nichts gebaut, Meldung');
  await page.tap('#tool-cancel');
  await sleep(80);
  await game(page, (n) => {
    window.__game.state.storage.holzblock = n;
  }, savedBlocks);
  check((await mode(page)) === 'area' && (await area()).buildings === 1, '„✕ Fertig“: zurück, die Gruppe bleibt markiert');
  // Bereich abreißen
  const blocksBeforeErase = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  await page.tap('#tool-area-erase');
  await sleep(80);
  check(
    (await page.isVisible('#dialog')) && (await page.textContent('#dialog-text')).includes('1 Gebäude und 6 Bänder'),
    'Bereich abreißen fragt nach',
  );
  await page.tap('#dialog-ok');
  await sleep(80);
  const blocksAfterErase = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  check(
    !(await game(page, () => window.__game.state.buildings.some((b) => b.type === 'saegewerk'))) && (await beltTotal()) === beltsBefore - 6,
    'Bereich abgerissen: Sägewerk und 6 Bänder weg',
  );
  check(blocksAfterErase - blocksBeforeErase >= 46, `Baukosten zurück ins Laden-Lager (+${blocksAfterErase - blocksBeforeErase} Holzblöcke)`);
  check(await page.locator('#tool-area-move').isDisabled(), 'Danach ist nichts mehr markiert');
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  // Taste R dreht auch ein ausgewähltes Gebäude
  const rotBefore = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'holzfaeller').rot);
  await tapTile(page, 10, 6);
  await page.keyboard.press('R');
  await sleep(60);
  const rotAfter = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'holzfaeller').rot);
  check(rotAfter === (rotBefore + 1) % 4, `Taste R dreht das ausgewählte Gebäude (${rotBefore} → ${rotAfter})`);
  await page.tap('#info-close');

  // ---------- Neues Spiel ----------
  await page.tap('#btn-menu');
  await page.tap('#menu-new-game');
  await sleep(80);
  check(await page.isVisible('#dialog'), '„Neues Spiel“ fragt nach');
  // v0.22.0: … und bietet an, die Fabrik erst zu sichern
  check(
    (await page.isVisible('#dialog-alt')) && (await page.textContent('#dialog-alt')) === '💾 Erst sichern',
    '„Neues Spiel“ bietet „💾 Erst sichern“ an',
  );
  await Promise.all([page.waitForNavigation(), page.tap('#dialog-ok')]);
  await waitForGame(page);
  const fresh = await game(page, () => ({
    buildings: window.__game.state.buildings.length,
    belts: Object.keys(window.__game.state.belts).length,
  }));
  check(fresh.buildings === 2 && fresh.belts === 0, 'Neues Spiel startet frisch');

  // ---------- Einstieg mit Startkapital ----------
  await page.tap('#btn-build');
  await sleep(80);
  check(
    await page.locator('.build-item[data-tool="saegewerk"]').evaluate((b) => b.classList.contains('short')),
    'Sägewerk ausgegraut (zu wenig Holzblöcke)',
  );
  await tapBuild(page, 'saegewerk');
  await sleep(80);
  check((await mode(page)) === 'menu' && (await page.textContent('#toast')).includes('fehlen'), 'Sägewerk antippen sagt, was fehlt');
  await shot('8-bauleiste-kosten');
  // Holzfäller (10,6) gibt rechts bei (12,6) aus → (13,6) → hinunter bis (13,9) → Versandportal (14,9)
  await page.tap('.build-item[data-tool="belt"]');
  await touchDragTiles(page, cdp, [
    [12, 6],
    [13, 6],
    [13, 9],
    [14, 9],
  ]);
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  check(JSON.stringify(await beltOuts(page, 13, 9)) === '["E"]', 'Band führt ins Start-Versandportal');
  check((await game(page, () => window.__game.state.storage.holzblock)) === 15, '5 Felder Band kosten 5 der 20 Start-Holzblöcke');

  await tapTile(page, 10, 6);
  await infoButton(page, 'load:holzstamm').tap();
  await sleep(80);
  const afterLoad = await game(page, () => ({
    logs: window.__game.state.storage.holzstamm ?? 0,
    loaded: window.__game.state.buildings.find((b) => b.type === 'holzfaeller').prod.loaded,
  }));
  check(afterLoad.loaded && afterLoad.logs === 0, 'Gratis-Holzstamm eingelegt');
  await sleep(450);
  check((await infoText(page)).includes('Vorrat 1 / 3'), 'Vorrat 1 / 3');
  check(
    (await page.locator('#info-body .source-slots .item-icon:not(.empty)').count()) === 1 &&
      (await page.locator('#info-body .source-slots .item-icon.empty').count()) === 2,
    'Vorrat als Bilder: 1 voll, 2 blass',
  );
  check((await infoCard(page))?.caption === 'Stellt gerade her', 'Läuft: „Stellt gerade her“');
  check(
    await infoButton(page, 'load:holzstamm').isDisabled(),
    'Ohne Holzstamm im Laden-Lager lässt sich keiner mehr einlegen',
  );
  await page.tap('#info-close');

  // v0.54.0: über die 14 Sekunden nachsehen statt nur am Ende – ein Block kommt
  // etwa alle 4,5 s, ob gerade einer auf dem Band liegt, hängt davon ab, wie viel
  // echte Zeit vorher verging (in 3D auf dem Handy mehr)
  const onBelt = await game(page, () => {
    let most = 0;
    for (let i = 0; i < 28; i++) {
      window.__game.simulate(0.5);
      most = Math.max(most, Object.values(window.__game.state.belts).filter((b) => b.item).length);
    }
    return most;
  });
  await sleep(120);
  check(onBelt >= 1, `Waren laufen über das Band (bis zu ${onBelt} gleichzeitig unterwegs)`);
  await shot('8-produktion');

  await game(page, () => window.__game.simulate(90));
  const blocks = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  check(blocks >= 30, `Holzblöcke kommen im Laden-Lager an (${blocks})`);

  // ---------- Theken & Kunden ----------
  await page.tap('#btn-shop');
  await sleep(80);
  await page.tap('#modal-content .tab[data-tab="theken"]');
  await sleep(80);
  check((await page.textContent('#modal-content')).includes('Theke 1'), 'Reiter „Theken“ zeigt die Theken');
  await page.locator('#modal-content button', { hasText: 'Ware wählen' }).first().tap();
  await sleep(80);
  await page.locator('#modal-content .pick-row', { hasText: 'Holzblock' }).tap();
  await sleep(80);
  // v0.10.0: Danach wählt man die Menge (vorgeschlagen: so viele wie passen)
  check((await page.textContent('#modal-content .amount-number')) === '20', 'Mengenwahl schlägt 20 vor (Theke voll)');
  await page.locator('#modal-content .amount-stepper button', { hasText: '−5' }).tap();
  await page.locator('#modal-content .amount-stepper button', { hasText: '−5' }).tap();
  await page.locator('#modal-content .amount-stepper button', { hasText: '−1' }).tap();
  await page.locator('#modal-content .amount-stepper button', { hasText: '−1' }).tap();
  check((await page.textContent('#modal-content .amount-number')) === '8', 'Menge auf 8 gestellt');
  await shot('9a-menge');
  const blocksBefore = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  // Kunden kaufen in Echtzeit weiter: Was sie seitdem von der Theke gekauft
  // haben, zählt mit (sonst schwankt die Prüfung, wenn genau jetzt jemand kauft).
  const saleIdBefore = await game(page, () => window.__game.state.market.nextSaleId);
  await page.locator('#modal-content button', { hasText: 'Auf die Theke' }).tap();
  await sleep(80);
  const counter8 = await game(
    page,
    (since) => {
      const s = window.__game.state;
      const sold = s.market.sales.filter((sale) => sale.id >= since).reduce((n, sale) => n + (sale.items.holzblock ?? 0), 0);
      return { ...s.counters[0], sold, store: s.storage.holzblock ?? 0 };
    },
    saleIdBefore,
  );
  check(
    counter8.type === 'holzblock' && counter8.count + counter8.sold === 8 && counter8.store >= blocksBefore - 8,
    `Theke 1 mit genau 8 Holzblöcken bestückt (${JSON.stringify(counter8)})`,
  );
  // Über „Menge“ lässt sich die Anzahl später ändern
  await page.locator('#modal-content .counter-buttons button', { hasText: 'Menge' }).first().tap();
  await sleep(80);
  const counterNow = await game(page, () => window.__game.state.counters[0].count);
  check((await page.textContent('#modal-content .amount-number')) === String(counterNow), `Menge öffnet mit der aktuellen Anzahl (${counterNow})`);
  await page.locator('#modal-content .amount-stepper button', { hasText: 'Alle' }).tap();
  // Auch hier: Was ein Kunde genau jetzt kauft, zählt mit.
  const saleIdAll = await game(page, () => window.__game.state.market.nextSaleId);
  await page.locator('#modal-content button', { hasText: 'Auf die Theke' }).tap();
  await sleep(80);
  const counter = await game(
    page,
    (since) => {
      const s = window.__game.state;
      const sold = s.market.sales.filter((sale) => sale.id >= since).reduce((n, sale) => n + (sale.items.holzblock ?? 0), 0);
      return { ...s.counters[0], sold };
    },
    saleIdAll,
  );
  check(counter.type === 'holzblock' && counter.count + counter.sold === 20, `„Alle“ füllt Theke 1 auf 20 Holzblöcke (${JSON.stringify(counter)})`);
  await shot('9-theken');
  const goldBeforeSales = await game(page, () => window.__game.state.gold);
  await game(page, () => window.__game.simulate(90));
  await sleep(500);
  const sold = await game(page, () => ({ gold: window.__game.state.gold, sales: window.__game.state.market.sales.length }));
  check(sold.gold > goldBeforeSales && sold.sales > 0, `Kunden kaufen und zahlen (${sold.gold} Gold, ${sold.sales} Verkäufe)`);
  // Kunden kaufen live weiter; die Leiste zieht spätestens nach 0,4 s nach.
  const hudSynced = await page
    .waitForFunction(() => document.getElementById('hud-gold').textContent === new Intl.NumberFormat('de-DE').format(window.__game.state.gold), null, { timeout: 3000 })
    .then(() => true, () => false);
  check(hudSynced, 'Gold oben aktualisiert sich');
  check((await page.textContent('#modal-content')).includes('kaufte'), 'Letzte Verkäufe werden angezeigt');
  // v0.54.0: Kunden kaufen live weiter – Verkäufe nach dem Antippen mitzählen
  const saleIdRefill = await game(page, () => window.__game.state.market.nextSaleId);
  await page.locator('#modal-content .counter-buttons button', { hasText: 'Auffüllen' }).first().tap();
  await sleep(80);
  const counterRefilled = await game(
    page,
    (since) => {
      const s = window.__game.state;
      const sold = s.market.sales.filter((sale) => sale.id >= since).reduce((n, sale) => n + (sale.items.holzblock ?? 0), 0);
      return { count: s.counters[0].count, sold };
    },
    saleIdRefill,
  );
  // v0.56.2: Ein Kunde kann auch kurz vor dem Auffüllen kaufen (bei paralleler Last
  // öfter) – dann zählt er mit, ändert aber nichts: höchstens 20 liegen danach auf
  // der Theke, mit den Verkäufen danach sind es mindestens 20
  check(
    counterRefilled.count <= 20 && counterRefilled.count + counterRefilled.sold >= 20,
    `Auffüllen füllt die Theke wieder auf 20 (${JSON.stringify(counterRefilled)})`,
  );
  await shot('10-verkauf');

  await page.tap('#modal-close');

  // ---------- Laden-Level und Aufträge (v0.13.0) ----------
  // Aufträge der Bewohner per Touch abgeben (Waren aus dem Laden-Lager), dann
  // mit allen Aufträgen und Gold aufsteigen. Weitere Level: Aufträge direkt als
  // abgegeben setzen (v0.56.0: „1 von 4“ statt Erfahrung).
  const quest1 = await game(page, () => window.__game.currentQuest());
  check(quest1.from === 'Zimmermann Jakob' && quest1.items.holzplatte === 5, `Erster Auftrag: Jakob will 5 Holzplatten (${JSON.stringify(quest1.items)})`);
  check(await page.isVisible('#btn-level .hud-xp'), 'Auftragsleiste oben im Knopf „Laden-Level“');
  await game(page, () => {
    const s = window.__game.state.storage;
    s.holzplatte = (s.holzplatte ?? 0) + 15;
    s.holzstab = (s.holzstab ?? 0) + 30;
  });
  const questShown = await page
    .waitForFunction(() => !document.getElementById('hud-quest-ready').hidden, null, { timeout: 3000 })
    .then(() => true, () => false);
  check(questShown, 'Auftrag lässt sich abgeben: oben erscheint ❗');
  await page.tap('#btn-level');
  await sleep(150);
  const levelText = await page.textContent('#modal-content');
  check(
    levelText.includes('Laden-Level 1 · Die ersten Hütten') && levelText.includes('Zimmermann Jakob') && levelText.includes('Auftrag 1 von 3'),
    'Level-Fenster zeigt Bauabschnitt und den ersten Auftrag',
  );
  check(
    levelText.includes('Aufträge für Level 2') && levelText.includes('0 von 3') && levelText.includes('Belohnung: +30') && !levelText.includes('Erfahrung'),
    'Leiste „Aufträge für Level 2 · 0 von 3“, Belohnung nur Gold (v0.56.0: keine Erfahrung mehr zu sehen)',
  );
  check((await page.locator('#modal-content .goal-row.done').count()) === 1, 'Ware liegt im Laden-Lager (abgehakt)');
  check(
    await page.locator('#modal-content button.quest-skip', { hasText: '🧪 Test: Auftrag erledigen' }).isVisible(),
    'Test-Knopf „Auftrag erledigen“ ist zu sehen (v0.15.0, ohne Testmodus)',
  );
  check(await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 2' }).isDisabled(), 'Aufsteigen noch gesperrt (noch nicht alle Aufträge)');
  await shot('10b-auftrag');
  const before1 = await game(page, () => ({ plates: window.__game.state.storage.holzplatte, gold: window.__game.state.gold }));
  await page.locator('#modal-content button', { hasText: 'Abgeben' }).tap();
  await sleep(200);
  const after1 = await game(page, () => ({ plates: window.__game.state.storage.holzplatte, gold: window.__game.state.gold, quest: window.__game.state.quest }));
  check(
    after1.plates === before1.plates - 5 && after1.gold >= before1.gold + 30 && after1.quest.index === 1 && after1.quest.xp === 9,
    `Abgeben: 5 Holzplatten weg, +30 Gold, +9 Erfahrung im Hintergrund (${JSON.stringify(after1)})`,
  );
  const text2 = await page.textContent('#modal-content');
  check(text2.includes('Auftrag erledigt') && text2.includes('Auftrag 2 von 3') && text2.includes('1 von 3'), 'Nächster Auftrag rückt nach, Leiste wächst');
  await page.locator('#modal-content button', { hasText: 'Abgeben' }).tap();
  await sleep(200);
  await page.locator('#modal-content button', { hasText: 'Abgeben' }).tap();
  await sleep(450);
  const done1 = await page.textContent('#modal-content');
  check(done1.includes('Alle Aufträge dieses Bauabschnitts sind erledigt') && done1.includes('3 von 3'), 'Alle drei Aufträge erledigt, Leiste voll');
  check(done1.includes('Alle Aufträge erledigt und genug Gold – du kannst aufsteigen'), 'Alle Aufträge und genug Gold');
  await shot('10c-level-bereit');
  const goldBeforeUp = await game(page, () => window.__game.state.gold);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 2 · 30' }).tap();
  await sleep(150);
  // v0.51.0 (Tobias, Chat 29): Der Aufstieg kommt als Schriftrolle von Hilde – ohne Zeit, bis „✓ Gelesen“
  await page.waitForFunction(() => document.getElementById('letter')?.classList.contains('open'), null, { timeout: 5000 });
  await sleep(1500);
  const letter2 = await page.evaluate(() => ({
    open: document.getElementById('letter').classList.contains('open'),
    banner: document.getElementById('letter-banner').textContent,
    text: document.getElementById('letter').textContent,
    ok: document.getElementById('letter-ok').textContent,
    box: document.querySelector('#letter .letter-scroll').getBoundingClientRect().toJSON(),
    okBottom: document.getElementById('letter-ok').getBoundingClientRect().bottom,
  }));
  check(
    letter2.open && letter2.banner === 'Laden-Level 2!' && letter2.text.includes('Bürgermeisterin Hilde') && letter2.text.includes('1 Felsbrocken liegt im Laden-Lager') && letter2.text.includes('Steinmetzin Berta') && letter2.ok === '✓ Gelesen',
    `Aufstieg: Schriftrolle „Laden-Level 2!“ von Hilde mit Geschenk und erstem Auftrag, bleibt offen (${letter2.text.slice(0, 160)})`,
  );
  const vp2 = device.viewport;
  check(
    letter2.box.top >= 0 && letter2.box.bottom <= vp2.height && letter2.box.left >= 0 && letter2.box.right <= vp2.width && letter2.okBottom <= letter2.box.bottom - 20,
    `Schriftrolle passt auf den Bildschirm, „✓ Gelesen“ zu sehen (${Math.round(letter2.box.top)}–${Math.round(letter2.box.bottom)} von ${vp2.height}, Knopf bis ${Math.round(letter2.okBottom)})`,
  );
  await shot('10d-schriftrolle');
  await page.tap('#letter-ok');
  await sleep(700);
  check(!(await page.isVisible('#letter')), '„✓ Gelesen“ rollt die Schriftrolle zu');
  const lvl2 = await game(page, () => ({ level: window.__game.state.shopLevel, rocks: window.__game.state.storage.felsbrocken ?? 0, gold: window.__game.state.gold }));
  check(lvl2.level === 2 && lvl2.rocks === 1, `Aufgestiegen auf Level 2, Gratis-Felsbrocken im Lager (${JSON.stringify(lvl2)})`);
  check(lvl2.gold >= goldBeforeUp - 30 && lvl2.gold <= goldBeforeUp - 30 + 70, `Der Aufstieg kostet 30 Gold (${goldBeforeUp} → ${lvl2.gold})`);
  const text3 = await page.textContent('#modal-content');
  check(text3.includes('Level 2 erreicht') && text3.includes('Wege und Brunnen') && text3.includes('Steinmetzin Berta'), 'Level-Fenster gratuliert, Aufträge von Level 2');
  check((await page.textContent('#hud-level')) === '2', 'Oben steht Level 2');
  await shot('10d-level-2');
  const upButton3 = page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 3' });
  check(await upButton3.isDisabled(), 'Level 3 noch gesperrt (noch nicht alle Aufträge)');
  await game(page, () => (window.__game.state.quest.index = window.__game.questCount()));
  const enabled3 = await page
    .waitForFunction(() => [...document.querySelectorAll('#modal-content button')].some((b) => b.textContent.includes('Level 3') && !b.disabled), null, { timeout: 3000 })
    .then(() => true, () => false);
  check(enabled3, 'Level-Fenster aktualisiert sich: Aufstieg auf Level 3 möglich');
  await upButton3.tap();
  await sleep(150);
  await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  const lvl3 = await game(page, () => ({ level: window.__game.state.shopLevel, ore: window.__game.state.storage.eisenerz ?? 0 }));
  check(lvl3.level === 3 && lvl3.ore === 1, `Aufgestiegen auf Level 3, Gratis-Eisenerz im Lager (${JSON.stringify(lvl3)})`);
  const next4 = await page.textContent('#modal-content');
  check(next4.includes('Nächstes Level: Level 4 · Die Mühle am Fluss'), 'Nach Level 3 kommt Level 4 (Die Mühle am Fluss)');
  check(
    !next4.includes('Theke 3') && next4.includes('mittlere Theken (25 Plätze)') && next4.includes('Laden-Lager 1.000 Plätze'),
    'Level 4 kündigt mittlere Theken und 1.000 Lagerplätze an – keine Theke mehr (v0.24.0)',
  );
  await shot('10e-level-3');
  await page.tap('#modal-content .tab[data-tab="town"]');
  await sleep(120);
  const town = await page.textContent('#modal-content');
  check(
    town.includes('✅ Level 2 · Wege und Brunnen') && town.includes('▶ Level 3 · Die Dorfschmiede') && town.includes('🔒 Level 6 · Das Stadttor'),
    'Reiter „Ort & Level“ zeigt die Bauabschnitte des Ortes',
  );
  await shot('10f-ort');
  await page.tap('#modal-close');

  // ---------- Händler ----------
  // Für den Rest des Tests genau die nötigen Waren und Gold geben (das
  // Testpaket mehrfach würde das Laden-Lager füllen).
  await game(page, () => {
    const s = window.__game.state.storage;
    window.__game.state.gold += 3000;
    s.holzblock = (s.holzblock ?? 0) + 45;
    s.holzplatte = (s.holzplatte ?? 0) + 10;
    s.steinplatte = (s.steinplatte ?? 0) + 30;
    s.eisenbarren = (s.eisenbarren ?? 0) + 30;
  });
  await page.tap('#btn-shop');
  await sleep(80);
  await page.tap('#modal-content .tab[data-tab="haendler"]');
  await sleep(80);
  const goldBeforeBuy = await game(page, () => window.__game.state.gold);
  await page.locator('#modal-content .trade-row', { hasText: 'Eisenerz' }).locator('button').tap();
  await sleep(80);
  const bought = await game(page, () => ({ gold: window.__game.state.gold, ore: window.__game.state.storage.eisenerz ?? 0 }));
  // Kunden kaufen währenddessen weiter (Holzblöcke à 1 Gold) – das Gold darf
  // deshalb etwas über „vorher − 732“ liegen.
  const paid = goldBeforeBuy - bought.gold;
  check(bought.ore === 2 && paid <= 732 && paid > 732 - 20, `Händler: Eisenerz für 732 Gold gekauft (${goldBeforeBuy} → ${bought.gold}, jetzt ${bought.ore} Eisenerz)`);
  await shot('11-haendler');
  await page.tap('#modal-close');

  // Sägewerk zum Umstellen des Rezepts
  await page.tap('#btn-build');
  await tapBuild(page, 'saegewerk');
  await sleep(80);
  const sawGhost = await game(page, () => ({ ...window.__game.ui.ghost }));
  await touchDragTiles(page, cdp, [
    [sawGhost.x, sawGhost.y],
    [14, 10],
  ]);
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  const placed = await game(page, () => window.__game.state.buildings.map((b) => `${b.type}@${b.x},${b.y}`).sort());
  check(placed.includes('saegewerk@14,10'), `Sägewerk gebaut (${placed.join(' ')})`);

  await tapTile(page, 14, 10);
  check((await page.textContent('#info-title')) === 'Sägewerk', 'Sägewerk antippen zeigt Infofenster');
  const sawCard = await infoCard(page);
  check(
    sawCard?.inputs.join() === 'holzblock 0 / 5' && sawCard.outputs.join() === 'holzplatte Holzplatte' && sawCard.lack.join() === 'holzblock',
    `Grüner Kasten: 0 / 5 Holzblöcke (rot) → Holzplatte (${JSON.stringify(sawCard)})`,
  );
  check((await recipeOption(page, 'holzstab').getAttribute('aria-label')) === 'Umstellen auf Holzstab: 5 Holzblöcke', 'Umstellen auf: Holzstab aus 5 Holzblöcken');
  await recipeOption(page, 'holzstab').tap();
  await sleep(450);
  check((await game(page, () => window.__game.state.buildings.find((b) => b.type === 'saegewerk').prod.recipe)) === 'holzstab', 'Rezept auf Stäbe umgestellt');
  check(
    (await infoCard(page))?.outputs.join() === 'holzstab Holzstab' &&
      (await recipeOption(page, 'holzplatte').count()) === 1 &&
      (await recipeOption(page, 'holzstab').count()) === 0,
    'Gewähltes Rezept steht oben im grünen Kasten, das andere darunter zum Umstellen',
  );
  await shot('12-saegewerk');
  await page.tap('#info-close');

  // ---------- Eisen-Kette ----------
  // Schmelzhütte (18,9)-(19,10) gibt rechts bei (20,9) aus → Band bis (21,9) → Schmiede (22,9)-(23,10)
  async function buildAt(type, x, y) {
    await tapBuild(page, type);
    await sleep(80);
    const g = await game(page, () => ({ ...window.__game.ui.ghost }));
    await touchDragTiles(page, cdp, [
      [g.x, g.y],
      [x, y],
    ]);
    await page.tap('#tool-confirm');
    await sleep(80);
  }
  await page.tap('#btn-build');
  await buildAt('schmelzhuette', 18, 9);
  await buildAt('schmiede', 22, 9);
  await page.tap('.build-item[data-tool="belt"]');
  await touchDragTiles(page, cdp, [
    [20, 9],
    [21, 9],
  ]);
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  const iron = await game(page, () => window.__game.state.buildings.map((b) => `${b.type}@${b.x},${b.y}`));
  check(iron.includes('schmelzhuette@18,9') && iron.includes('schmiede@22,9'), `Schmelzhütte und Schmiede gebaut (${iron.join(' ')})`);
  await tapTile(page, 18, 9);
  check((await page.textContent('#info-title')) === 'Schmelzhütte', 'Schmelzhütte antippen zeigt Infofenster');
  await infoButton(page, 'load:eisenerz').tap();
  await sleep(80);
  check((await game(page, () => window.__game.state.storage.eisenerz ?? 0)) === 1, 'Eisenerz eingelegt (eins bleibt im Lager)');
  await page.tap('#info-close');
  await game(page, () => window.__game.simulate(40));
  const smithy = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'schmiede');
    return { stock: b.prod.stock.eisenbarren ?? 0, busy: b.prod.busy, out: b.prod.out };
  });
  check(smithy.stock > 0 || smithy.busy || smithy.out, `Eisenbarren kommen in der Schmiede an (${JSON.stringify(smithy)})`);
  await tapTile(page, 22, 9);
  check((await page.textContent('#info-title')) === 'Schmiede', 'Schmiede antippen zeigt Infofenster');
  await recipeOption(page, 'eisenstange').tap();
  await sleep(450);
  check((await game(page, () => window.__game.state.buildings.find((b) => b.type === 'schmiede').prod.recipe)) === 'eisenstange', 'Schmiede auf Stangen umgestellt');
  const smithCard = await infoCard(page);
  check(
    /^eisenbarren \d+ \/ 5/.test(smithCard?.inputs.join() ?? '') && smithCard.outputs.join() === 'eisenstange Eisenstange',
    `Grüner Kasten: Eisenbarren (… / 5) → Eisenstange (${JSON.stringify(smithCard)})`,
  );
  await shot('13-eisen');
  await page.tap('#info-close');

  // ---------- Level 4: Zimmerei mit zwei Eingängen (v0.10.0) ----------
  await game(page, () => (window.__game.state.quest.index = window.__game.questCount()));
  await page.tap('#btn-level');
  await sleep(120);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 4' }).tap();
  await sleep(150);
  await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  const lvl4 = await game(page, () => ({ level: window.__game.state.shopLevel, counters: window.__game.state.counters.length }));
  check(lvl4.level === 4 && lvl4.counters === 2, `Level 4: keine neue Theke – die kauft man mit Gold (${JSON.stringify(lvl4)})`);
  await page.tap('#modal-close');
  await game(page, () => {
    const s = window.__game.state.storage;
    s.holzplatte = (s.holzplatte ?? 0) + 20;
    s.eisenstange = (s.eisenstange ?? 0) + 10;
  });
  await page.tap('#btn-build');
  check(
    !(await page.locator('.build-item[data-tool="zimmerei"]').evaluate((b) => b.classList.contains('locked'))),
    'Zimmerei in der Bauleiste freigeschaltet',
  );
  check(
    await page.locator('.build-item[data-tool="feinschmiede"]').evaluate((b) => b.classList.contains('locked')),
    'Feinschmiede noch gesperrt (Level 5)',
  );
  await buildAt('zimmerei', 26, 13);
  await page.tap('#build-close');
  await sleep(80);
  const zim = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'zimmerei'));
  check(Boolean(zim) && zim.x === 26 && zim.y === 13, `Zimmerei gebaut (${zim ? `${zim.x},${zim.y}` : 'fehlt'})`);
  // Holzstäbe liegen schon drin, Zahnräder fehlen → kleines Bild an der Maschine
  await game(page, () => {
    window.__game.state.buildings.find((b) => b.type === 'zimmerei').prod.stock = { holzstab: 10, steinzahnrad: 2 };
  });
  await tapTile(page, 26, 13);
  check((await page.textContent('#info-title')) === 'Zimmerei', 'Zimmerei antippen zeigt Infofenster');
  const zimCard = await infoCard(page);
  check(
    zimCard?.caption === 'Stellt gerade her' &&
      zimCard.inputs.join() === 'holzstab 10 / 10 ✓,steinzahnrad 2 / 5' &&
      zimCard.outputs.join() === 'zahnradwelle Zahnradwelle' &&
      zimCard.lack.join() === 'steinzahnrad' &&
      zimCard.sub.includes('Fehlt noch: 3 Stein-Zahnräder') &&
      zimCard.sub.includes('20 s je Stück') &&
      zimCard.sub.includes('Wert 108'),
    `Grüner Kasten: 10/10 Holzstäbe + 2/5 Stein-Zahnräder (rot) → Zahnradwelle, fehlt noch 3 (${JSON.stringify(zimCard)})`,
  );
  check((await page.textContent('#info-meta')).includes('Wartet auf Stein-Zahnrad (2 / 5)'), 'Status unter dem Namen nennt die fehlende Zutat');
  const zimOptions = await page.locator('#info-body .recipe-option').evaluateAll((list) => list.map((b) => b.getAttribute('aria-label')));
  check(
    zimOptions.join(' | ') ===
      'Umstellen auf Räderwerk: 10 Stein-Zahnräder + 5 Holzstäbe | Umstellen auf Verstärkte Holzplatte: 10 Holzplatten + 5 Eisenstangen',
    `Umstellen auf: die beiden anderen Rezepte (${zimOptions.join(' | ')})`,
  );
  check(
    (await recipeOption(page, 'raederwerk').textContent()).includes('108 🪙'),
    'Jedes andere Rezept zeigt seinen Wert',
  );
  const zimFit = await infoFits(page);
  check(zimFit.length === 0, `Alle Knöpfe passen ins Infofenster (${zimFit.join(' | ')})`);
  check(!(await page.locator('#info-actions button', { hasText: 'Reste' }).isVisible()), 'Ohne Reste kein Knopf „Reste ins Laden-Lager“');
  await shot('14-zimmerei');
  // v0.10.1: Umstellen lässt die Teile in der Maschine (vorher: ins Laden-Lager)
  const sticksBefore = await game(page, () => window.__game.state.storage.holzstab ?? 0);
  await recipeOption(page, 'verstaerkteholzplatte').tap();
  await sleep(450);
  const zimStock = () =>
    game(page, () => {
      const b = window.__game.state.buildings.find((x) => x.type === 'zimmerei');
      return { recipe: b.prod.recipe, stock: b.prod.stock, sticks: window.__game.state.storage.holzstab ?? 0 };
    });
  const switched = await zimStock();
  check(
    switched.recipe === 'verstaerkteholzplatte' && switched.stock.holzstab === 10 && switched.stock.steinzahnrad === 2 && switched.sticks === sticksBefore,
    `Umstellen: die Teile bleiben in der Maschine (${JSON.stringify(switched)})`,
  );
  check(
    (await infoText(page)).includes('Liegt noch in der Maschine: 10 Holzstäbe + 2 Stein-Zahnräder'),
    'Infofenster zeigt, was noch in der Maschine liegt',
  );
  await shot('14b-zimmerei-umgestellt');
  await recipeOption(page, 'zahnradwelle').tap();
  await sleep(450);
  const back = await zimStock();
  check(back.recipe === 'zahnradwelle' && back.stock.holzstab === 10, `Zurückgestellt: die Holzstäbe sind noch da (${JSON.stringify(back)})`);
  await recipeOption(page, 'verstaerkteholzplatte').tap();
  await sleep(450);
  await page.locator('#info-actions button', { hasText: 'Reste ins Laden-Lager' }).tap();
  await sleep(150);
  const cleared = await zimStock();
  check(
    cleared.sticks === sticksBefore + 10 && !cleared.stock.holzstab,
    `Knopf „Reste ins Laden-Lager“ legt die Teile ins Laden-Lager (${JSON.stringify(cleared)})`,
  );
  await page.tap('#info-close');

  // ---------- Bänder leeren (v0.12.0) ----------
  // Zuleitung (23,13)–(25,13) in den oberen Eingang der Zimmerei (26,13), darauf
  // Holzblöcke – die braucht die Zimmerei nicht, der Eingang staut sich.
  await page.tap('#btn-build');
  await page.tap('.build-item[data-tool="belt"]');
  await touchDragTiles(page, cdp, [
    [23, 13],
    [26, 13],
  ]);
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  const feedLine = ['23,13', '24,13', '25,13'];
  check(
    (await game(page, (keys) => keys.map((k) => window.__game.state.belts[k]?.outs.join('') ?? '-').join(' '), feedLine)) === 'E E E',
    'Zuleitung zur Zimmerei gelegt',
  );
  const jamFeed = () =>
    game(page, (keys) => {
      for (const k of keys) window.__game.state.belts[k].item = { type: 'holzblock', progress: 1, from: 'W' };
    }, feedLine);
  await jamFeed();
  await tapTile(page, 24, 13);
  check((await page.textContent('#info-title')) === 'Förderband', 'Band antippen zeigt Infofenster');
  check(
    (await page.textContent('#info-status')).includes('Auf der ganzen Strecke (3 Bänder): 3 Holzblöcke'),
    `Infofenster nennt, was auf der ganzen Strecke liegt (${await page.textContent('#info-status')})`,
  );
  await shot('14c-strecke');
  // Der Holzfäller schickt währenddessen weiter Holzblöcke ins Laden-Lager –
  // deshalb „mindestens“ (und höchstens ein paar mehr).
  const blocksBeforeLine = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  const blocksAbout = (n, want) => n >= blocksBeforeLine + want && n <= blocksBeforeLine + want + 3;
  await page.locator('#info-actions button', { hasText: 'Strecke leeren' }).tap();
  await sleep(450);
  const lineCleared = await game(page, (keys) => ({
    onBelts: keys.filter((k) => window.__game.state.belts[k].item).length,
    blocks: window.__game.state.storage.holzblock ?? 0,
  }), feedLine);
  check(
    lineCleared.onBelts === 0 && blocksAbout(lineCleared.blocks, 3),
    `„Strecke leeren“: 3 Holzblöcke im Laden-Lager, Bänder bleiben (${JSON.stringify(lineCleared)})`,
  );
  check(
    await page.locator('#info-actions button', { hasText: 'Strecke leeren' }).isDisabled(),
    'Leere Strecke: Knopf gesperrt',
  );
  await page.tap('#info-close');
  await jamFeed();
  await tapTile(page, 26, 13);
  check(
    (await page.textContent('#info-meta')).includes('Eingang blockiert: Holzblock wird hier nicht gebraucht'),
    'Zimmerei zeigt den Stau',
  );
  const feedButton = page.locator('#info-actions button', { hasText: 'Zulauf leeren' });
  check(await feedButton.isVisible(), 'Knopf „Zulauf leeren“ bei rotem Licht');
  await shot('14d-zulauf');
  await feedButton.tap();
  await sleep(450);
  const feedCleared = await game(page, (keys) => ({
    onBelts: keys.filter((k) => window.__game.state.belts[k].item).length,
    blocks: window.__game.state.storage.holzblock ?? 0,
  }), feedLine);
  check(
    feedCleared.onBelts === 0 && blocksAbout(feedCleared.blocks, 6),
    `„Zulauf leeren“ bringt die Holzblöcke ins Laden-Lager (${JSON.stringify(feedCleared)})`,
  );
  check(!(await feedButton.isVisible()), 'Ohne Stau kein Knopf „Zulauf leeren“');
  await page.tap('#info-close');

  // ---------- Lagerhaus: befüllen, ausräumen (v0.12.0; ohne Nachschub seit v0.14.0) ----------
  // Lagerhaus (10,14)-(11,14) gibt unten rechts aus → Band (11,15),(11,16)…(14,16)
  // → Versandportal (15,16). Was hineinkommt, läuft zurück ins Laden-Lager.
  await game(page, () => {
    const s = window.__game.state.storage;
    s.holzplatte = 40 + 8; // 8 kostet das Lagerhaus
    s.holzblock = (s.holzblock ?? 0) + 20;
    s.eisenbarren = 120;
  });
  await page.tap('#btn-build');
  await buildAt('versandportal', 15, 16);
  await buildAt('lagerhaus', 10, 14);
  await page.tap('.build-item[data-tool="belt"]');
  await touchDragTiles(page, cdp, [
    [11, 15],
    [11, 16],
    [15, 16],
  ]);
  await page.tap('#tool-confirm');
  await page.tap('#build-close');
  await sleep(80);
  const storeLine = await game(page, () => {
    const st = window.__game.state;
    return {
      built: st.buildings.filter((b) => (b.type === 'lagerhaus' && b.x === 10 && b.y === 14) || (b.type === 'versandportal' && b.x === 15 && b.y === 16)).length,
      belts: ['11,15', '11,16', '12,16', '13,16', '14,16'].map((k) => st.belts[k]?.outs.join('') ?? '-').join(' '),
      free: 1000 - Object.values(st.storage).reduce((a, b) => a + b, 0),
    };
  });
  check(storeLine.built === 2 && storeLine.belts === 'S E E E E', `Lagerhaus mit Band zum Versandportal gebaut (${JSON.stringify(storeLine)})`);
  await tapTile(page, 10, 14);
  check((await page.textContent('#info-title')) === 'Lagerhaus', 'Lagerhaus antippen zeigt Infofenster');
  const storeButtons = await page.locator('#info-actions button').allTextContents();
  check(
    ['Befüllen', 'Ausräumen'].every((t) => storeButtons.some((b) => b.includes(t))) && !storeButtons.some((b) => b.includes('Nachschub')),
    `Knöpfe Befüllen und Ausräumen, kein Nachschub (${storeButtons.join(', ')})`,
  );
  check(await page.locator('#info-actions button', { hasText: 'Ausräumen' }).isDisabled(), 'Leeres Lagerhaus: Ausräumen gesperrt');
  // Befüllen: Ware wählen, Menge einstellen
  await page.locator('#info-actions button', { hasText: 'Befüllen' }).tap();
  await sleep(120);
  check((await page.textContent('#modal-content h2')) === '📥 Lagerhaus befüllen', 'Fenster „Lagerhaus befüllen“');
  check(
    !(await page.textContent('#modal-content')).includes('Holzstamm'),
    'Rohstoffe stehen nicht zur Wahl',
  );
  await shot('14e-befuellen-ware');
  await page.locator('#modal-content .pick-row', { hasText: 'Eisenbarren' }).tap();
  await sleep(120);
  check((await page.textContent('#modal-content h3')) === 'Wie viele Eisenbarren ins Lagerhaus?', 'Mengenwahl fürs Lagerhaus');
  check((await page.textContent('#modal-content .amount-number')) === '120', 'Vorgeschlagen: alle 120 Eisenbarren');
  await page.locator('#modal-content button', { hasText: '−5' }).tap();
  await sleep(60);
  check((await page.textContent('#modal-content .amount-number')) === '115', '−5 → 115');
  await page.locator('#modal-content button', { hasText: 'Alle (120)' }).tap();
  await sleep(60);
  await shot('14f-befuellen-menge');
  await page.locator('#modal-content button', { hasText: 'Ins Lagerhaus' }).tap();
  await sleep(450);
  const ironCount = () =>
    game(page, () => {
      const st = window.__game.state;
      const store = st.buildings.find((b) => b.type === 'lagerhaus' && b.x === 10);
      const inStore = store.prod.slots.reduce((a, s) => a + (s.type === 'eisenbarren' ? s.count : 0), 0);
      // Nur die Bänder dieser Strecke – die Eisen-Linie von vorhin läuft noch
      const line = ['11,15', '11,16', '12,16', '13,16', '14,16'];
      const onBelts = line.filter((k) => st.belts[k]?.item?.type === 'eisenbarren').length;
      return { inStore, onBelts, inShop: st.storage.eisenbarren ?? 0 };
    });
  const filled = await ironCount();
  check(
    filled.inStore >= 100 && filled.inStore + filled.onBelts + filled.inShop === 120,
    `120 Eisenbarren im Lagerhaus, sie laufen aufs Band (${JSON.stringify(filled)})`,
  );
  check(!(await page.isVisible('#modal')), 'Fenster schließt sich nach dem Befüllen');
  // v0.20.0: die Fächer als Bilder mit Menge und Füllbalken, der Reihe nach
  const slots14 = await storeSlots(page);
  check(
    slots14.slots[0]?.startsWith('eisenbarren ') && slots14.slots.length === 3 && /^\d+ \/ 150$/.test(slots14.total),
    `Infofenster zeigt die 3 Fächer mit Bild und Menge (${JSON.stringify(slots14)})`,
  );
  check((await infoFits(page)).length === 0, `Lagerhaus: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  await shot('14g-lagerhaus-befuellt');
  await game(page, () => window.__game.simulate(90));
  const shipped = await ironCount();
  check(shipped.inShop === 120 && shipped.inStore === 0, `Über Band und Versandportal zurück im Laden-Lager (${JSON.stringify(shipped)})`);
  // v0.20.0: Versandportal – was zuletzt ankam, wie voll das Laden-Lager ist
  await tapTile(page, 15, 16);
  check((await page.textContent('#info-title')) === 'Versandportal', 'Versandportal antippen zeigt Infofenster');
  await sleep(450);
  const portal14 = await shipCard(page);
  const storeUse = await game(page, () => {
    const st = window.__game.state;
    return `${Object.values(st.storage).reduce((a, b) => a + b, 0)} / ${window.__game.storageCapacity()}`;
  });
  check(
    portal14.caption === 'Schickt ins Laden-Lager' && portal14.recent.join() === 'eisenbarren' && portal14.sub === 'Zuletzt: Eisenbarren · bisher 120 Waren' && !portal14.bad && portal14.warn === '',
    `Versandportal: Eisenbarren → Laden-Lager, bisher 120 Waren (${JSON.stringify(portal14)})`,
  );
  // Die Fabrik läuft weiter – die Zahl darf sich in der Zwischenzeit um ein paar Waren ändern
  const [shownUse, shownCap] = portal14.store.replace(/\./g, '').split(' / ').map(Number);
  const [realUse, realCap] = storeUse.split(' / ').map(Number);
  check(shownCap === realCap && Math.abs(shownUse - realUse) <= 10, `Versandportal zeigt das Laden-Lager (${portal14.store}, im Spiel ${storeUse})`);
  check((await infoFits(page)).length === 0, `Versandportal: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  await shot('14h-versandportal');
  // Laden-Lager voll: roter Balken, das Portal nimmt nichts an
  const filler = await game(page, () => {
    const st = window.__game.state;
    const free = window.__game.storageCapacity() - Object.values(st.storage).reduce((a, b) => a + b, 0);
    st.storage.steinblock = (st.storage.steinblock ?? 0) + free;
    return free;
  });
  await sleep(450);
  const portalFull = await shipCard(page);
  check(
    portalFull.bad && portalFull.warn.includes('Erst verkaufen oder verbauen') && (await page.textContent('#info-meta')).includes('Laden-Lager voll'),
    `Laden-Lager voll: roter Balken und Hinweis (${JSON.stringify(portalFull)})`,
  );
  await shot('14i-versandportal-voll');
  await game(page, (n) => (window.__game.state.storage.steinblock -= n), filler);
  await tapTile(page, 10, 14);
  check((await page.textContent('#info-title')) === 'Lagerhaus', 'Zurück zum Lagerhaus');
  // v0.14.0: Leer bleibt leer – das Lagerhaus holt nichts von selbst aus dem Laden-Lager
  const plates = () =>
    game(page, () => {
      const st = window.__game.state;
      const store = st.buildings.find((b) => b.type === 'lagerhaus' && b.x === 10);
      return {
        inStore: store.prod.slots.reduce((a, s) => a + (s.type === 'holzplatte' ? s.count : 0), 0),
        onBelts: Object.values(st.belts).filter((b) => b.item?.type === 'holzplatte').length,
        inShop: st.storage.holzplatte ?? 0,
      };
    });
  await game(page, () => window.__game.simulate(30));
  const stillEmpty = await plates();
  check(stillEmpty.inStore === 0 && stillEmpty.inShop === 40, `Leeres Lagerhaus bleibt leer, die Holzplatten bleiben im Laden-Lager (${JSON.stringify(stillEmpty)})`);
  await sleep(450);
  check((await page.textContent('#info-meta')).includes('Leer.'), 'Infofenster: Lagerhaus leer');
  const emptySlots = await storeSlots(page);
  check(
    emptySlots.slots.join() === 'frei,frei,frei' && emptySlots.total === '0 / 150' && emptySlots.sub.includes('Leer'),
    `Leeres Lagerhaus: drei freie Fächer, 0 / 150 (${JSON.stringify(emptySlots)})`,
  );
  // Gemischt (wie bei Tobias: Zahnräder und Stäbe): je Fach eine Ware, ein volles Fach orange.
  // Fach 1 geht zuerst hinaus – das volle Fach steht deshalb an zweiter Stelle.
  const mixBefore = await game(page, () => {
    const st = window.__game.state;
    st.buildings.find((b) => b.type === 'lagerhaus' && b.x === 10).prod.slots = [
      { type: 'holzstab', count: 42 },
      { type: 'steinzahnrad', count: 50 },
    ];
    return { steinzahnrad: st.storage.steinzahnrad ?? 0, holzstab: st.storage.holzstab ?? 0 };
  });
  await sleep(450); // das Infofenster aktualisiert sich in festen Abständen
  const mixed = await storeSlots(page);
  check(
    /^holzstab \d+ \/ 50$/.test(mixed.slots[0]) && mixed.slots[1] === 'steinzahnrad 50 / 50 voll' && mixed.slots[2] === 'frei',
    `Gemischtes Lagerhaus: Holzstäbe, Stein-Zahnräder (voll), ein Fach frei (${JSON.stringify(mixed)})`,
  );
  await shot('14j-lagerhaus-gemischt');
  // Ausräumen: alles zurück ins Laden-Lager (die gemischten Waren von eben wieder weg)
  await game(page, (before) => {
    const st = window.__game.state;
    st.buildings.find((b) => b.type === 'lagerhaus' && b.x === 10).prod.slots = [{ type: 'holzplatte', count: 7 }];
    st.storage.holzplatte = 33;
    Object.assign(st.storage, before);
    for (const b of Object.values(st.belts)) if (['holzplatte', 'steinzahnrad', 'holzstab'].includes(b.item?.type)) b.item = null;
  }, mixBefore);
  await sleep(450);
  await page.locator('#info-actions button', { hasText: 'Ausräumen' }).tap();
  await sleep(450);
  const emptied = await plates();
  check(emptied.inStore === 0 && emptied.inShop + emptied.onBelts === 40, `„Ausräumen“ legt alles ins Laden-Lager (${JSON.stringify(emptied)})`);
  await page.tap('#info-close');

  // ---------- Level 5 und 6 (seit v0.24.0 ohne neue Theken) ----------
  const levelUpWithXp = async (level) => {
    await game(page, () => {
      window.__game.state.quest.index = window.__game.questCount();
      window.__game.state.gold += 3000;
    });
    await sleep(450);
    await page.locator('#modal-content button', { hasText: `Aufsteigen auf Level ${level}` }).tap();
    await sleep(150);
    await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  };
  await page.tap('#btn-level');
  await sleep(120);
  await levelUpWithXp(5);
  await levelUpWithXp(6);
  const lvl6 = await game(page, () => ({ level: window.__game.state.shopLevel, counters: window.__game.state.counters.length }));
  check(lvl6.level === 6 && lvl6.counters === 2, `Level 6 mit weiter 2 Verkaufstheken (${JSON.stringify(lvl6)})`);
  const lvl6Text = await page.textContent('#modal-content');
  check(
    lvl6Text.includes('Torwächter Ulrich') && lvl6Text.includes('Gewichtsteine') && lvl6Text.includes('Nächstes Level: Level 7 · Die Heilstube'),
    'Level 6: Aufträge fürs Stadttor, danach kommt Level 7 „Die Heilstube“',
  );
  await shot('15-level-6');
  // v0.15.0: Test-Knopf – zählt als abgegeben, ohne Waren und ohne Gold
  const before6 = await game(page, () => {
    const st = window.__game.state;
    return { gold: st.gold, sale: st.market.sales[0]?.id ?? 0, storage: { ...st.storage }, quest: { ...st.quest } };
  });
  await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
  await sleep(200);
  const after6 = await game(page, (since) => {
    const st = window.__game.state;
    const sold = st.market.sales.filter((x) => x.id > since).reduce((sum, x) => sum + x.gold, 0);
    return { gold: st.gold, sold, storage: { ...st.storage }, quest: { ...st.quest } };
  }, before6.sale);
  check(
    after6.quest.index === before6.quest.index + 1 && after6.quest.xp === before6.quest.xp + 259,
    `Test-Knopf: Auftrag 1 als erledigt gewertet, +259 Erfahrung (${JSON.stringify(after6.quest)})`,
  );
  check(after6.gold === before6.gold + after6.sold, `Test-Knopf gibt kein Gold (${before6.gold} → ${after6.gold}, Kunden ${after6.sold})`);
  check((after6.storage.gewichtstein ?? 0) === (before6.storage.gewichtstein ?? 0), 'Test-Knopf nimmt keine Waren');
  const skipText = await page.textContent('#modal-content');
  check(skipText.includes('Auftrag als erledigt gewertet (Test)') && skipText.includes('Auftrag 2 von 4'), 'Bestätigung und nächster Auftrag');
  await shot('15b-test-knopf');
  for (let i = 0; i < 3; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const allSkipped = await page.textContent('#modal-content');
  check(
    allSkipped.includes('Alle Aufträge dieses Bauabschnitts sind erledigt') && allSkipped.includes('4 von 4'),
    'Alle 4 Aufträge vom Stadttor per Test-Knopf erledigt, Leiste voll',
  );
  check((await page.locator('#modal-content button.quest-skip').count()) === 0, 'Ohne Auftrag kein Test-Knopf mehr');
  // v0.16.0: Aufsteigen auf Level 7 „Die Heilstube“ (1.000 Gold; das Gold
  // kommt hier dazu, damit der weitere Ablauf gleich bleibt)
  check(
    allSkipped.includes('Beet') && allSkipped.includes('Erntebank') && allSkipped.includes('Webstube') &&
      allSkipped.includes('Leinsamen beim Händler') && !allSkipped.includes('Flachspflanze beim Händler'),
    'Level 7 kündigt Beet, Erntebank, Webstube und Leinsamen beim Händler an',
  );
  await game(page, () => (window.__game.state.gold += 1000));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 7 · 1.000' }).tap();
  await sleep(150);
  await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  const lvl7 = await game(page, () => ({
    level: window.__game.state.shopLevel,
    seeds: window.__game.state.storage.leinsamen ?? 0,
    counters: window.__game.state.counters.length,
  }));
  check(lvl7.level === 7 && lvl7.seeds === 1 && lvl7.counters === 2, `Level 7: 1 Leinsamen gratis, Laden bleibt bei 2 Theken (${JSON.stringify(lvl7)})`);
  const lvl7Text = await page.textContent('#modal-content');
  check(
    lvl7Text.includes('Level 7 erreicht') && lvl7Text.includes('Die Heilstube') && lvl7Text.includes('Heilerin Agnes') && lvl7Text.includes('5 Verbände'),
    'Level-Fenster: Heilerin Agnes möchte 5 Verbände',
  );
  check(lvl7Text.includes('Aufträge für Level 8') && lvl7Text.includes('0 von 4'), 'Aufträge für Level 8: 0 von 4');
  await shot('15c-level-7');
  await page.tap('#modal-close');
  await page.tap('#btn-shop');
  await sleep(80);
  await page.tap('#modal-content .tab[data-tab="theken"]');
  await sleep(80);
  // v0.24.0: 2 große Theken, dazu Plätze zum Kaufen – immer 6 Karten
  const heads = await page.locator('#modal-content .counter-card:not(.counter-slot) .counter-head').allTextContents();
  check(
    heads.length === 2 && heads.every((h) => h.includes('30 Plätze')),
    `Zwei große Theken mit je 30 Plätzen (${heads.join(' | ')})`,
  );
  check((await page.textContent('#modal-content .modal-meta')).includes('/ 1.000'), 'Laden-Lager fasst 1.000 Waren');
  const slots = await page.locator('#modal-content .counter-card').evaluateAll((cards) =>
    cards.map((c) => (c.classList.contains('counter-slot') ? [...c.classList].find((k) => k.startsWith('counter-slot-')).slice(13) : 'owned')),
  );
  check(
    JSON.stringify(slots) === JSON.stringify(['owned', 'owned', 'next', 'later', 'later', 'locked']),
    `Theken-Ansicht zeigt 6 Plätze: 2 Theken, Theke 3 zum Kaufen, 4 und 5 später, 6 erst ab Level 13 (${slots})`,
  );
  const thekenText = await page.textContent('#modal-content');
  check(
    thekenText.includes('Jede Theke hat ihre eigenen Kunden: Auf Level 7 kommt etwa alle 45–60 Sekunden einer und kauft 1 Stück') &&
      thekenText.includes('eigene Kunden: alle 45–60 Sekunden einer'),
    'Theken-Reiter erklärt das Tempo auf Level 7',
  );
  check(
    thekenText.includes('Kaufen · 15.000') && thekenText.includes('35.000') && thekenText.includes('70.000') && thekenText.includes('🔒 Ab Level 13 · 150.000'),
    'Preise der Theken: 15.000, 35.000, 70.000, die 6. ab Level 13 für 150.000 (v0.31.0)',
  );
  // Zu wenig Gold: Knopf gesperrt, es steht da, wie viel fehlt
  await game(page, () => (window.__game.state.gold = 14000));
  await sleep(1200);
  const buyButton = page.locator('#modal-content [data-counter-action="kaufen"]');
  check(await buyButton.isDisabled(), 'Mit 14.000 Gold ist „Kaufen“ gesperrt');
  // Die Kunden kaufen weiter ein – das Gold kann inzwischen etwas gestiegen sein.
  const missingText = await page.textContent('#modal-content .counter-missing');
  const missingGold = Number((missingText.match(/Dir fehlen noch ([\d.]+)/)?.[1] ?? '').replace(/\./g, ''));
  const goldNow = await game(page, () => window.__game.state.gold);
  check(missingGold >= 15000 - goldNow && missingGold <= 1000 && missingGold > 900, `Es steht da, wie viel Gold fehlt („${missingText}“)`);
  await shot('16-theken-kaufen');
  await game(page, () => (window.__game.state.gold = 20000));
  await sleep(1200);
  check(!(await buyButton.isDisabled()), 'Mit 20.000 Gold lässt sich Theke 3 kaufen');
  await buyButton.tap();
  await sleep(150);
  check(
    (await page.isVisible('#dialog')) && (await page.textContent('#dialog')).includes('Theke 3 kaufen?'),
    'Vor dem Kauf kommt eine Rückfrage',
  );
  await shot('16b-theke-kaufen-frage');
  await page.tap('#dialog-ok');
  await sleep(200);
  const counterBought = await game(page, () => ({
    gold: window.__game.state.gold,
    counters: window.__game.state.counters.length,
    timers: window.__game.state.market.timers.length,
  }));
  check(counterBought.gold < 10000 && counterBought.counters === 3 && counterBought.timers === 3, `Theke 3 gekauft für 15.000 Gold (${JSON.stringify(counterBought)})`);
  const heads3 = await page.locator('#modal-content .counter-card:not(.counter-slot) .counter-head').allTextContents();
  check(heads3.length === 3 && heads3[2].includes('Theke 3 · 30 Plätze'), `Theke 3 steht jetzt im Laden (${heads3.join(' | ')})`);
  check((await page.textContent('#modal-content')).includes('Kaufen · 35.000'), 'Als Nächstes lässt sich Theke 4 kaufen');
  await shot('16c-drei-theken');
  await page.tap('#modal-close');
  // v0.10.2: jede Seite geht 2×; v0.42.0: der 1. Streifen kostet 170, der 2. 500 Gold
  const plotNow = await game(page, () => ({ ...window.__game.state.plot }));
  await tapTile(page, plotNow.x + plotNow.width, plotNow.y + 3);
  check((await page.textContent('#info-title')) === 'Fläche kaufen', 'Fläche rechts antippen bietet Fläche an');
  check(
    (await page.textContent('#info-meta')).includes(`4 Spalten rechts · ${4 * plotNow.height} Felder`),
    `Angebot: 4 Spalten (${await page.textContent('#info-meta')})`,
  );
  await shot('16b-flaeche-level6');
  // 670 Gold dazu, damit die beiden Käufe den weiteren Ablauf nicht arm machen
  const goldRight = await game(page, () => (window.__game.state.gold += 670));
  await page.locator('#info-actions button', { hasText: 'Kaufen · 170' }).tap();
  await sleep(120);
  // (den nächsten Streifen rechts holt tapTile ins Bild)
  await tapTile(page, plotNow.x + plotNow.width + 4, plotNow.y + 3);
  check((await page.textContent('#info-text')).includes('letzte Kauf'), `Zweiter Streifen rechts ist der letzte an dieser Seite (Gold ${goldRight})`);
  await page.locator('#info-actions button', { hasText: 'Kaufen · 500' }).tap();
  await sleep(120);
  const right = await game(page, () => ({
    plot: { ...window.__game.state.plot },
    world: { ...window.__game.state.world },
    gold: window.__game.state.gold,
  }));
  check(
    right.plot.x + right.plot.width === right.world.x + right.world.width && right.plot.width === plotNow.width + 8,
    `Rechts 2× gekauft: Grundstück reicht bis an den Rand der Welt (${right.plot.width} × ${right.plot.height})`,
  );
  // Kunden können währenddessen kaufen, deshalb höchstens etwas mehr Gold
  check(right.gold <= goldRight - 670 + 70 && right.gold >= goldRight - 670, `Die Streifen kosten 170 und 500 Gold (${goldRight} → ${right.gold})`);
  await shot('16c-flaeche-rechts-fertig');

  // ---------- Level 7: Beet, Flachsbreche, Webstube (v0.16.0) ----------
  // Auf der neu gekauften Fläche rechts: säen, reif werden lassen, ernten
  // (zwei Schritte), Pflanze in die Flachsbreche einlegen.
  const bx = plotNow.x + plotNow.width + 1;
  const by = plotNow.y + 1;
  await centerOn(page, bx + 3, by + 2, 4);
  await game(page, () => {
    const s = window.__game.state.storage;
    s.holzplatte = (s.holzplatte ?? 0) + 20;
    s.steinplatte = (s.steinplatte ?? 0) + 10;
    s.zahnradwelle = (s.zahnradwelle ?? 0) + 2;
    s.holzstab = (s.holzstab ?? 0) + 20;
    s.raederwerk = (s.raederwerk ?? 0) + 2;
  });
  await page.tap('#btn-build');
  check(
    !(await page.locator('.build-item[data-tool="beet"]').evaluate((b) => b.classList.contains('locked'))),
    'Beet in der Bauleiste freigeschaltet (Level 7)',
  );
  await buildAt('beet', bx, by);
  await buildAt('flachsbreche', bx + 4, by);
  await buildAt('webstube', bx + 4, by + 3);
  await page.tap('#build-close');
  await sleep(80);
  const herbs = await game(page, () =>
    window.__game.state.buildings.filter((b) => ['beet', 'flachsbreche', 'webstube'].includes(b.type)).map((b) => `${b.type}@${b.x},${b.y}`),
  );
  check(
    herbs.join(' ') === `beet@${bx},${by} flachsbreche@${bx + 4},${by} webstube@${bx + 4},${by + 3}`,
    `Beet, Flachsbreche und Webstube per Touch gebaut (${herbs.join(', ')})`,
  );
  const beetState = () =>
    game(page, () => {
      const b = window.__game.state.buildings.find((x) => x.type === 'beet');
      const st = window.__game.state;
      return { crop: b.prod.crop, timer: b.prod.timer, seeds: st.storage.leinsamen ?? 0, plants: st.storage.flachspflanze ?? 0, gold: st.gold };
    });
  await tapTile(page, bx, by);
  check((await page.textContent('#info-title')) === 'Beet', 'Beet antippen zeigt Infofenster');
  await sleep(450);
  // v0.20.0: Säen-Knopf mit dem Bild des Samens, Kasten „Wächst hier“
  const sowButton = infoButton(page, 'sow:leinsamen');
  check(
    (await sowButton.textContent()).trim() === 'Säen: Leinsamen' && (await sowButton.isEnabled()) && (await sowButton.locator('canvas[data-item="leinsamen"]').count()) === 1,
    `Leeres Beet: „Säen: Leinsamen“ mit Bild des Samens, aus dem Laden-Lager (${await sowButton.textContent()})`,
  );
  check(!(await page.locator('#info-actions button', { hasText: 'Ernten' }).isVisible()), 'Leeres Beet: kein Ernten-Knopf');
  const beetEmpty = await infoCard(page);
  check(
    beetEmpty?.caption === 'Wächst hier' && beetEmpty.inputs.join() === 'leinsamen 1' && beetEmpty.outputs.join() === 'flachspflanze Flachspflanze' && beetEmpty.sub.includes('in 30:00 min'),
    `Leeres Beet: 1 Leinsamen → Flachspflanze in 30 Minuten (${JSON.stringify(beetEmpty)})`,
  );
  check((await page.textContent('#info-body')).includes('Im Laden-Lager: 1 Leinsamen'), 'Leeres Beet: Leinsamen im Laden-Lager');
  check((await infoFits(page)).length === 0, `Beet: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  await shot('18-beet-leer');
  await sowButton.tap();
  await sleep(450);
  const sown = await beetState();
  check(sown.crop === 'leinsamen' && sown.seeds === 0, `Gesät: der Leinsamen aus dem Laden-Lager (${JSON.stringify(sown)})`);
  const growingText = await infoText(page);
  check(growingText.includes('Flachspflanze wächst') && growingText.includes('Reif in etwa'), `Infofenster: wächst, reif in etwa … (${growingText.slice(0, 120)})`);
  check(
    (await infoCard(page))?.caption === 'Wächst gerade' && (await page.locator('#info-body .info-card .fill-bar').count()) === 1,
    'Während es wächst: Kasten „Wächst gerade“ mit Balken',
  );
  const reapButton = page.locator('#info-actions button', { hasText: 'Ernten' });
  check((await reapButton.isVisible()) && (await reapButton.isDisabled()), 'Während es wächst: „🌾 Ernten“ gesperrt');
  check(!(await sowButton.isVisible()), 'Während es wächst: kein Säen-Knopf');
  // 30 Minuten vorspulen (nur dieses Beet, damit der Rest der Fabrik gleich bleibt)
  await game(page, () => {
    window.__game.state.buildings.find((x) => x.type === 'beet').prod.timer = 1799.5;
    window.__game.simulate(1);
  });
  await sleep(500);
  const ripeText = await infoText(page);
  check(ripeText.includes('Reif – Flachspflanze ernten'), `Nach 30 Minuten reif (${ripeText.slice(0, 80)})`);
  // v0.51.0 (Tobias, Chat 29): keine Erinnerung mehr, wenn ein Beet reif ist
  check(!(await page.locator('#toast', { hasText: 'Beet ist reif' }).isVisible()), `Keine Meldung „Ein Beet ist reif“ mehr (${(await page.textContent('#toast')) ?? ''})`);
  check(await reapButton.isEnabled(), 'Reif: „🌾 Ernten: 1 Flachspflanze“');
  const ripeCard = await infoCard(page);
  check(
    ripeCard?.caption === 'Reif zum Ernten' && ripeCard.sub.includes('Ernten legt sie ins Laden-Lager') &&
      (await page.locator('#info-body .fill-bar .fill').evaluate((n) => n.style.width)) === '100%',
    `Reif: Kasten „Reif zum Ernten“, Balken voll (${JSON.stringify(ripeCard)})`,
  );
  await shot('18b-beet-reif');
  await reapButton.tap();
  await sleep(450);
  const reaped = await beetState();
  check(reaped.crop === null && reaped.plants === 1, `Geerntet: Flachspflanze im Laden-Lager, Beet leer (${JSON.stringify(reaped)})`);
  check(
    (await sowButton.isVisible()) && (await sowButton.textContent()).includes('kauft 1 für 320'),
    'Danach neu säen – ohne Leinsamen im Lager kauft der Knopf einen für 320 Gold',
  );
  check((await infoFits(page)).length === 0, `Beet mit Kaufen-Knopf: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  // Flachsbreche: Pflanze einlegen wie einen Holzstamm; kaufen kann man Pflanzen nicht
  await tapTile(page, bx + 4, by);
  check((await page.textContent('#info-title')) === 'Erntebank', 'Erntebank (bisher Flachsbreche) antippen zeigt Infofenster');
  await sleep(450);
  const refillButton = page.locator('#info-actions button', { hasText: 'Auffüllen' });
  check((await refillButton.textContent()) === '⏫ Auffüllen: 1 Flachspflanze', `Auffüllen aus dem Laden-Lager (${await refillButton.textContent()})`);
  check((await page.locator('#info-panel button[data-key^="buy:"]').count()) === 0, 'Kein Kaufen-Knopf: Flachspflanzen gibt es nicht beim Händler');
  const bankCard7 = await infoCard(page);
  check(
    bankCard7?.inputs.join() === 'flachspflanze 1' && bankCard7.outputs.join() === 'flachsfaser 50 Flachsfasern' && bankCard7.sub.includes('in 10:00 min'),
    `Grüner Kasten: 1 Flachspflanze → 50 Flachsfasern in 10 Minuten, keine Ringelblume auf Level 7 (${JSON.stringify(bankCard7)})`,
  );
  await refillButton.tap();
  await sleep(450);
  const breche = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'flachsbreche');
    return { loaded: b.prod.loaded, plants: window.__game.state.storage.flachspflanze ?? 0 };
  });
  check(breche.loaded && breche.plants === 0, `Flachspflanze eingelegt (${JSON.stringify(breche)})`);
  check(
    (await refillButton.textContent()) === '⏫ Auffüllen – keine Flachspflanzen im Laden-Lager',
    `Ohne Pflanzen im Lager: „keine Flachspflanzen im Laden-Lager“ (${await refillButton.textContent()})`,
  );
  await shot('18c-flachsbreche');
  // Webstube: nur eine Einstellung, nichts umzustellen
  await tapTile(page, bx + 4, by + 3);
  check((await page.textContent('#info-title')) === 'Webstube', 'Webstube antippen zeigt Infofenster');
  await sleep(450);
  const webCard = await infoCard(page);
  check(
    /^flachsfaser \d+ \/ 5/.test(webCard?.inputs.join() ?? '') && webCard.outputs.join() === 'verband Verband' && (await page.textContent('#info-meta')).includes('Wartet auf Flachsfasern'),
    `Webstube: Flachsfasern (… / 5) → Verband (${JSON.stringify(webCard)})`,
  );
  check((await page.locator('#info-body .recipe-option').count()) === 0, 'Webstube: kein Umstellen (nur Verbände)');
  // Neu säen (kauft einen Leinsamen) – das Beet wächst nachher im Hintergrund weiter
  await tapTile(page, bx, by);
  await sleep(450);
  const goldSow = await game(page, () => (window.__game.state.gold += 320));
  await sowButton.tap();
  await sleep(200);
  const resown = await beetState();
  check(
    resown.crop === 'leinsamen' && resown.gold >= goldSow - 320 && resown.gold <= goldSow - 320 + 70,
    `Neu gesät, Leinsamen für 320 Gold gekauft (${goldSow} → ${resown.gold})`,
  );
  await page.tap('#info-close');
  // Händler: Leinsamen ja, Flachspflanze nein
  await page.tap('#btn-shop');
  await sleep(80);
  await page.tap('#modal-content .tab[data-tab="haendler"]');
  await sleep(120);
  const traderText = await page.textContent('#modal-content');
  check(traderText.includes('Leinsamen') && !traderText.includes('Flachspflanze'), 'Händler verkauft Leinsamen, aber keine Flachspflanzen');
  await page.tap('#modal-close');

  // ---------- Level 8: Ringelblume, Erntebank, Kräuterstube (v0.17.0) ----------
  // Aufträge von Level 7 mit dem Test-Knopf, dann aufsteigen (1.330 Gold kommen dazu)
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l7done = await page.textContent('#modal-content');
  check(
    l7done.includes('4 von 4') && l7done.includes('Nächstes Level: Level 8 · Der Kräutergarten') && l7done.includes('Kräuterstube') &&
      l7done.includes('Ringelblumensamen beim Händler'),
    'Level 7 erledigt; Level 8 kündigt Kräuterstube und Ringelblumensamen an',
  );
  await game(page, () => (window.__game.state.gold += 1330));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 8 · 1.330' }).tap();
  await sleep(150);
  await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  const lvl8 = await game(page, () => ({ level: window.__game.state.shopLevel, seeds: window.__game.state.storage.ringelblumensamen ?? 0 }));
  check(lvl8.level === 8 && lvl8.seeds === 1, `Level 8: 1 Ringelblumensamen gratis (${JSON.stringify(lvl8)})`);
  const lvl8Text = await page.textContent('#modal-content');
  check(lvl8Text.includes('Der Kräutergarten') && lvl8Text.includes('50 Ringelblüten') && lvl8Text.includes('0 von 4'), 'Level 8: Agnes möchte 50 Ringelblüten, Aufträge 0 von 4');
  await shot('19-level-8');
  await page.tap('#modal-close');
  await centerOn(page, bx + 3, by + 4, 4);
  await game(page, () => {
    const s = window.__game.state.storage;
    s.holzplatte = (s.holzplatte ?? 0) + 20;
    s.steinplatte = (s.steinplatte ?? 0) + 10;
    s.eisenblech = (s.eisenblech ?? 0) + 5;
    s.zahnradwelle = (s.zahnradwelle ?? 0) + 2;
  });
  await page.tap('#btn-build');
  await buildAt('beet', bx, by + 3);
  await buildAt('kraeuterstube', bx, by + 6);
  await page.tap('#build-close');
  await sleep(80);
  const herbs8 = await game(page, () =>
    window.__game.state.buildings.filter((b) => ['beet', 'kraeuterstube'].includes(b.type)).map((b) => `${b.type}@${b.x},${b.y}`),
  );
  check(
    herbs8.includes(`beet@${bx},${by + 3}`) && herbs8.includes(`kraeuterstube@${bx},${by + 6}`),
    `Zweites Beet und Kräuterstube per Touch gebaut (${herbs8.join(', ')})`,
  );
  // Ringelblume säen, reif werden lassen, ernten
  await tapTile(page, bx, by + 3);
  await sleep(450);
  const sowRing = infoButton(page, 'sow:ringelblumensamen');
  const sowLein = infoButton(page, 'sow:leinsamen');
  check((await sowRing.isVisible()) && (await sowLein.isVisible()), 'Leeres Beet auf Level 8: zwei Knöpfe – Leinsamen und Ringelblumensamen');
  const beet8 = await infoCard(page);
  check(
    beet8?.inputs.join() === 'leinsamen 1,ringelblumensamen 1' && beet8.outputs.join() === 'flachspflanze Flachspflanze,ringelblume Ringelblume',
    `Leeres Beet auf Level 8: beide Pflanzen im Kasten (${JSON.stringify(beet8)})`,
  );
  check((await infoFits(page)).length === 0, `Beet auf Level 8: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  await shot('19a-beet-zwei-samen');
  await sowRing.tap();
  await sleep(450);
  const beet2 = () =>
    game(page, ([x, y]) => {
      const b = window.__game.state.buildings.find((g) => g.type === 'beet' && g.x === x && g.y === y);
      return { crop: b.prod.crop, seeds: window.__game.state.storage.ringelblumensamen ?? 0, plants: window.__game.state.storage.ringelblume ?? 0 };
    }, [bx, by + 3]);
  const sownRing = await beet2();
  check(sownRing.crop === 'ringelblumensamen' && sownRing.seeds === 0, `Ringelblumensamen gesät (${JSON.stringify(sownRing)})`);
  check(!(await sowRing.isVisible()) && !(await sowLein.isVisible()), 'Während es wächst: keine Säen-Knöpfe');
  check((await infoText(page)).includes('Ringelblume wächst'), 'Infofenster: Ringelblume wächst');
  await game(page, ([x, y]) => {
    window.__game.state.buildings.find((g) => g.type === 'beet' && g.x === x && g.y === y).prod.timer = 1799.5;
    window.__game.simulate(1);
  }, [bx, by + 3]);
  await sleep(500);
  await shot('19b-ringelblume-reif');
  await page.locator('#info-actions button', { hasText: 'Ernten: 1 Ringelblume' }).tap();
  await sleep(450);
  const reapedRing = await beet2();
  check(reapedRing.crop === null && reapedRing.plants === 1, `Ringelblume geerntet (${JSON.stringify(reapedRing)})`);
  // Erntebank: Ringelblume zur laufenden Flachspflanze dazulegen (gemischter Vorrat)
  await tapTile(page, bx + 4, by);
  check((await page.textContent('#info-title')) === 'Erntebank', 'Erntebank antippen zeigt Infofenster');
  await sleep(450);
  const loadRing = infoButton(page, 'load:ringelblume');
  check(await loadRing.isEnabled(), 'Erntebank: Knopf „➕ 1 Ringelblume einlegen“');
  await loadRing.tap();
  await sleep(450);
  const bankText = await infoText(page);
  const bankSlots = await page.locator('#info-body .source-slots .item-icon').evaluateAll((list) =>
    list.map((c) => `${c.dataset.item}${c.classList.contains('empty') ? '(leer)' : ''}`),
  );
  check(
    bankText.includes('Vorrat 2 / 3') && bankSlots.join() === 'flachspflanze,ringelblume,flachspflanze(leer)',
    `Erntebank: gemischter Vorrat als Bilder (${bankSlots.join()} – ${bankText.slice(0, 120)})`,
  );
  check((await infoCard(page))?.outputs.join() === 'flachsfaser 50 Flachsfasern', 'Erntebank: der Kasten zeigt, was gerade läuft (Flachs)');
  const bankFit = await infoFits(page);
  check(bankFit.length === 0, `Alle Knöpfe passen ins Infofenster der Erntebank (${bankFit.join(' | ')})`);
  const bankState = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'flachsbreche');
    return { input: b.prod.input, queue: b.prod.queue };
  });
  check(bankState.input === 'flachspflanze' && bankState.queue.join() === 'ringelblume', `Erst die Flachspflanze, dann die Ringelblume (${JSON.stringify(bankState)})`);
  await shot('19c-erntebank');
  // Kräuterstube: zwei Einstellungen
  await tapTile(page, bx, by + 6);
  check((await page.textContent('#info-title')) === 'Kräuterstube', 'Kräuterstube antippen zeigt Infofenster');
  await sleep(450);
  const stubeCard = await infoCard(page);
  check(
    /^verband \d+ \/ 1( ✓)?,ringelbluete \d+ \/ 5/.test(stubeCard?.inputs.join() ?? '') && stubeCard.outputs.join() === 'heilverband Heilverband',
    `Kräuterstube: Verband + Ringelblüten → Heilverband (${JSON.stringify(stubeCard)})`,
  );
  check(
    (await recipeOption(page, 'kraeuterkompresse').getAttribute('aria-label')) === 'Umstellen auf Kräuterkompresse: 10 Flachsfasern + 5 Ringelblüten',
    'Umstellen auf: Kräuterkompresse aus 10 Flachsfasern + 5 Ringelblüten',
  );
  await recipeOption(page, 'kraeuterkompresse').tap();
  await sleep(450);
  const kompCard = await infoCard(page);
  check(
    /^flachsfaser \d+ \/ 10( ✓)?,ringelbluete \d+ \/ 5/.test(kompCard?.inputs.join() ?? '') && kompCard.outputs.join() === 'kraeuterkompresse Kräuterkompresse',
    `Umgestellt: Flachsfasern + Ringelblüten → Kräuterkompresse (${JSON.stringify(kompCard)})`,
  );
  check((await recipeOption(page, 'heilverband').count()) === 1, 'Heilverband steht jetzt unter „Umstellen auf“');
  check((await recipeOption(page, 'wundverband').count()) === 0, 'Den Wundverband bietet die Kräuterstube erst ab Level 10 an');
  const kompFit = await infoFits(page);
  check(kompFit.length === 0, `Langer Name „Kräuterkompresse“ passt in den grünen Kasten (${kompFit.join(' | ')})`);
  await shot('19d-kraeuterstube');
  await page.tap('#info-close');

  // ---------- Level 9: Ofen (bis v0.30 Kohlenmeiler), Schreibstube, Reiter „Werkstatt“ (v0.26.0) ----------
  // Aufträge von Level 8 mit dem Test-Knopf, dann aufsteigen (1.670 Gold kommen dazu)
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l8done = await page.textContent('#modal-content');
  check(
    l8done.includes('4 von 4') && l8done.includes('Nächstes Level: Level 9 · Die Schreibstube') && l8done.includes('♨️ Ofen') &&
      l8done.includes('Schreibstube') && l8done.includes('Holzstamm') && !l8done.includes('Kohlenmeiler'),
    'Level 8 erledigt; Level 9 kündigt Ofen und Schreibstube an, 1 Holzstamm gratis',
  );
  const logsBefore9 = await game(page, () => window.__game.state.storage.holzstamm ?? 0);
  await game(page, () => (window.__game.state.gold += 1670));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 9 · 1.670' }).tap();
  await sleep(150);
  await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  const lvl9 = await game(page, () => ({ level: window.__game.state.shopLevel, logs: window.__game.state.storage.holzstamm ?? 0 }));
  check(lvl9.level === 9 && lvl9.logs === logsBefore9 + 1, `Level 9: 1 Holzstamm gratis (${JSON.stringify(lvl9)})`);
  const lvl9Text = await page.textContent('#modal-content');
  check(
    lvl9Text.includes('Die Schreibstube') && lvl9Text.includes('Schmied Konrad') && lvl9Text.includes('50 Holzkohle') && lvl9Text.includes('0 von 4'),
    'Level 9: Konrad möchte 50 Holzkohle, Aufträge 0 von 4',
  );
  await shot('19e-level-9');
  await page.tap('#modal-close');
  // Zwei freie 2 × 2-Plätze auf dem Grundstück suchen (rechts der Kräuter-Gebäude)
  const spots9 = await game(page, ([x0, y0]) => {
    const { state } = window.__game;
    const used = new Set(Object.keys(state.belts));
    for (const b of state.buildings) {
      const [w0, h0] = b.type === 'lagerhaus' ? [2, 1] : b.type === 'versandportal' ? [1, 1] : [2, 2];
      const [w, h] = b.rot % 2 ? [h0, w0] : [w0, h0];
      for (let dx = -1; dx <= w; dx++) for (let dy = -1; dy <= h; dy++) used.add(`${b.x + dx},${b.y + dy}`);
    }
    const p = state.plot;
    const found = [];
    for (let y = Math.max(p.y, y0 - 2); y < p.y + p.height - 1 && found.length < 2; y++) {
      for (let x = Math.max(p.x, x0 - 4); x < p.x + p.width - 1 && found.length < 2; x++) {
        const cells = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1], [x + 2, y], [x + 2, y + 1]];
        if (cells.every(([cx, cy]) => !used.has(`${cx},${cy}`))) {
          found.push([x, y]);
          for (let dx = -1; dx <= 3; dx++) for (let dy = -1; dy <= 2; dy++) used.add(`${x + dx},${y + dy}`);
        }
      }
    }
    return found;
  }, [bx + 3, by + 3]);
  check(spots9.length === 2, `Zwei freie Plätze für Level 9 gefunden (${JSON.stringify(spots9)})`);
  const [[mx, my], [sx, sy]] = spots9;
  await centerOn(page, Math.round((mx + sx) / 2), Math.round((my + sy) / 2), 4);
  await game(page, () => {
    const s = window.__game.state.storage;
    s.steinplatte = (s.steinplatte ?? 0) + 20;
    s.verstaerkteholzplatte = (s.verstaerkteholzplatte ?? 0) + 3;
    s.zirkel = (s.zirkel ?? 0) + 1;
  });
  await page.tap('#btn-build');
  await buildAt('kohlenmeiler', mx, my);
  check(await tabActive('holz'), 'Ofen steht im Reiter „Holz“');
  await tapBuild(page, 'schreibstube');
  await sleep(80);
  check(await tabActive('werkstatt'), 'Schreibstube öffnet den neuen Reiter „Werkstatt“');
  const barFits9 = await page.evaluate(() =>
    [...document.querySelectorAll('.build-tab, .build-item')]
      .filter((e) => e.offsetParent)
      .every((e) => e.getBoundingClientRect().right <= innerWidth + 1),
  );
  check(barFits9, 'Fünf Reiter und ihre Gebäude passen auf den Bildschirm');
  await shot('19f-reiter-werkstatt');
  const g9 = await game(page, () => ({ ...window.__game.ui.ghost }));
  await touchDragTiles(page, cdp, [
    [g9.x, g9.y],
    [sx, sy],
  ]);
  await page.tap('#tool-confirm');
  await sleep(80);
  await page.tap('#build-close');
  await sleep(80);
  const built9 = await game(page, () =>
    window.__game.state.buildings.filter((b) => ['kohlenmeiler', 'schreibstube'].includes(b.type)).map((b) => `${b.type}@${b.x},${b.y}`),
  );
  check(
    built9.includes(`kohlenmeiler@${mx},${my}`) && built9.includes(`schreibstube@${sx},${sy}`),
    `Ofen und Schreibstube per Touch gebaut (${built9.join(', ')})`,
  );
  // Ofen (v0.31.0, bisher Kohlenmeiler): den geschenkten Holzstamm einlegen
  await tapTile(page, mx, my);
  check((await page.textContent('#info-title')) === 'Ofen', 'Ofen antippen zeigt Infofenster');
  check(
    !(await infoButton(page, 'load:sand').isVisible()) && (await infoButton(page, 'buy:sand').count()) === 0,
    'Auf Level 9 noch kein Sand im Ofen (kein Knopf zum Einlegen oder Kaufen)',
  );
  await sleep(450);
  await infoButton(page, 'load:holzstamm').tap();
  await sleep(450);
  const meilerCard = await infoCard(page);
  check(meilerCard?.outputs.join() === 'holzkohle 100 Holzkohle', `Ofen: 1 Holzstamm → 100 Holzkohle (${JSON.stringify(meilerCard)})`);
  const meiler9 = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'kohlenmeiler');
    return { loaded: b.prod.loaded, logs: window.__game.state.storage.holzstamm ?? 0 };
  });
  check(meiler9.loaded && meiler9.logs === logsBefore9, `Holzstamm liegt im Ofen (${JSON.stringify(meiler9)})`);
  await shot('19g-ofen');
  // Schreibstube: Zeichenbrett, umstellen auf Reißzeug
  await tapTile(page, sx, sy);
  check((await page.textContent('#info-title')) === 'Schreibstube', 'Schreibstube antippen zeigt Infofenster');
  await sleep(450);
  const stube9 = await infoCard(page);
  check(
    /^verstaerkteholzplatte \d+ \/ 1( ✓)?,flachsfaser \d+ \/ 10/.test(stube9?.inputs.join() ?? '') && stube9.outputs.join() === 'zeichenbrett Zeichenbrett',
    `Schreibstube: Verstärkte Holzplatte + Flachsfasern → Zeichenbrett (${JSON.stringify(stube9)})`,
  );
  check(
    (await recipeOption(page, 'reisszeug').getAttribute('aria-label')) === 'Umstellen auf Reißzeug: 1 Zirkel + 10 Holzkohle',
    'Umstellen auf: Reißzeug aus 1 Zirkel + 10 Holzkohle',
  );
  await recipeOption(page, 'reisszeug').tap();
  await sleep(450);
  const reiss9 = await infoCard(page);
  check(reiss9?.outputs.join() === 'reisszeug Reißzeug', `Umgestellt auf Reißzeug (${JSON.stringify(reiss9)})`);
  const stubeFit9 = await infoFits(page);
  check(stubeFit9.length === 0, `Infofenster der Schreibstube: nichts ragt heraus (${stubeFit9.join(' | ')})`);
  await shot('19h-schreibstube');
  await page.tap('#info-close');

  // ---------- Level 10: Das Spital, mehr Fläche, weiter herauszoomen (v0.27.0) ----------
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l9done = await page.textContent('#modal-content');
  check(
    l9done.includes('4 von 4') && l9done.includes('Nächstes Level: Level 10 · Das Spital') && l9done.includes('Kräuterstube: Wundverband') &&
      l9done.includes('Schafgarbensamen beim Händler') && l9done.includes('Mehr Fläche: jede Seite noch einmal erweitern (je 2.000 Gold)'),
    'Level 9 erledigt; Level 10 kündigt Wundverband, Schafgarbensamen und mehr Fläche an',
  );
  const before10 = await game(page, () => ({ world: { ...window.__game.state.world }, plot: { ...window.__game.state.plot } }));
  await game(page, () => (window.__game.state.gold += 2000 + 2000 + 400));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 10 · 2.000' }).tap();
  await sleep(150);
  const letter10 = await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  const lvl10 = await game(page, () => ({
    level: window.__game.state.shopLevel,
    seeds: window.__game.state.storage.schafgarbensamen ?? 0,
    world: { ...window.__game.state.world },
  }));
  const w0 = before10.world;
  const w1 = lvl10.world;
  check(lvl10.level === 10 && lvl10.seeds === 1, `Level 10: 1 Schafgarbensamen gratis (${JSON.stringify({ level: lvl10.level, seeds: lvl10.seeds })})`);
  check(
    w1.x === w0.x - 4 && w1.y === w0.y - 4 && w1.width === w0.width + 8 && w1.height === w0.height + 8,
    `Die Welt reicht an jeder Seite 4 Felder weiter (${JSON.stringify(w0)} → ${JSON.stringify(w1)})`,
  );
  const lvl10Text = await page.textContent('#modal-content');
  check(lvl10Text.includes('Das Spital') && lvl10Text.includes('Heilerin Agnes') && lvl10Text.includes('50 Schafgarbenblüten') && lvl10Text.includes('0 von 4'), 'Level 10: Agnes möchte 50 Schafgarbenblüten, Aufträge 0 von 4');
  await shot('19i-level-10');
  await page.tap('#modal-close');
  await sleep(150);
  check(letter10.includes('Mehr Fläche') && letter10.includes('Tippe auf die ＋-Schilder am Rand'), 'Schriftrolle nach dem Aufstieg: neue Fläche an den Schildern');
  // Nach dem Aufstieg zoomt die Karte heraus, damit man die neuen Schilder
  // „＋ Fläche“ am Rand sieht. v0.54.0: in 3D – alle Schilder liegen im Bild;
  // die ganze Welt (46 × 38) passt in 3D nicht ganz (oben fehlt ein schmaler
  // Rand, offene Frage an Tobias) – die Ecken stehen nur in der Meldung.
  const fitsWorld = () =>
    game(page, () => {
      const { camera, state } = window.__game;
      const w = state.world;
      const corners = [
        [w.x, w.y],
        [w.x + w.width, w.y],
        [w.x, w.y + w.height],
        [w.x + w.width, w.y + w.height],
      ].map(([x, z]) => camera.screenOf(x, 0, z));
      return {
        ok: corners.every((p) => p.visible && p.x >= -1 && p.y >= -1 && p.x <= camera.viewWidth + 1 && p.y <= camera.viewHeight + 1),
        distance: Math.round(camera.distance * 10) / 10,
        box: corners.map((p) => `${Math.round(p.x)}/${Math.round(p.y)}`).join(' '),
        view: `${camera.viewWidth} × ${camera.viewHeight}`,
      };
    });
  const fit10 = await fitsWorld();
  const signs10 = await game(page, () => {
    const g = window.__game.view3d;
    const r = document.getElementById('game').getBoundingClientRect();
    return g.landSigns().map((sign) => {
      const p = g.landSign(sign.side);
      return { side: sign.side, inside: p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom };
    });
  });
  check(
    signs10.length >= 3 && signs10.every((sign) => sign.inside),
    `Nach dem Aufstieg sind alle Schilder „＋ Fläche“ im Bild (${signs10.map((sign) => `${sign.side}${sign.inside ? ' ✓' : ' ✗'}`).join(', ')}; Abstand ${fit10.distance}, Ecken der Welt ${fit10.box} auf ${fit10.view})`,
  );
  await shot('19j-mehr-flaeche');
  // Ganz hineinzoomen und wieder ganz heraus (Mausrad): die ganze Welt passt aufs Bild
  const box = await page.locator('#game').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -400);
  await sleep(100);
  const zoomedIn = await game(page, () => window.__game.camera.distance);
  for (let i = 0; i < 20; i++) await page.mouse.wheel(0, 400);
  await sleep(150);
  const fitOut = await fitsWorld();
  check(
    fitOut.distance > 2 * zoomedIn && fitOut.distance >= fit10.distance,
    `Ganz herausgezoomt: mindestens so weit wie nach dem Aufstieg (Abstand ${zoomedIn.toFixed(1)} → ${fitOut.distance}, Ecken der Welt ${fitOut.box} auf ${fitOut.view}${fitOut.ok ? ', ganze Welt im Bild' : ''})`,
  );
  await shot('19k-ganz-herausgezoomt');
  // Der 3. Streifen rechts kostet 2.000 Gold
  const plot10 = await game(page, () => ({ ...window.__game.state.plot }));
  await tapTile(page, plot10.x + plot10.width, plot10.y + 3);
  check((await page.textContent('#info-title')) === 'Fläche kaufen', 'Neue Fläche rechts antippen bietet Fläche an');
  const landText10 = await page.textContent('#info-text');
  check(
    landText10.includes('ab Level 10 der 3. je 2.000 Gold') && landText10.includes('letzte Kauf'),
    `Infofenster nennt die Preise (${landText10})`,
  );
  const gold10 = await game(page, () => window.__game.state.gold);
  await page.locator('#info-actions button', { hasText: 'Kaufen · 2.000' }).tap();
  await sleep(150);
  const bought10 = await game(page, () => ({ plot: { ...window.__game.state.plot }, gold: window.__game.state.gold }));
  check(
    bought10.plot.width === plot10.width + 4 && bought10.gold >= gold10 - 2000 && bought10.gold <= gold10 - 2000 + 70,
    `3. Streifen rechts für 2.000 Gold gekauft (${plot10.width} → ${bought10.plot.width} Spalten, Gold ${gold10} → ${bought10.gold})`,
  );
  await shot('19l-flaeche-level10');
  // Schafgarbe säen, reif werden lassen, ernten; Erntebank; Kräuterstube: Wundverband
  await centerOn(page, bx + 1, by + 3, 4);
  await sleep(100);
  await tapTile(page, bx, by + 3);
  await sleep(450);
  const sowYarrow = infoButton(page, 'sow:schafgarbensamen');
  check(await sowYarrow.isVisible(), 'Leeres Beet auf Level 10: Knopf „Säen: Schafgarbensamen“');
  const beet10 = await infoCard(page);
  check(
    beet10?.inputs.join() === 'leinsamen 1,ringelblumensamen 1,schafgarbensamen 1' &&
      beet10.outputs.join() === 'flachspflanze Flachspflanze,ringelblume Ringelblume,schafgarbe Schafgarbe',
    `Leeres Beet auf Level 10: drei Pflanzen im Kasten (${JSON.stringify(beet10)})`,
  );
  check((await infoFits(page)).length === 0, `Beet auf Level 10: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  await shot('19m-beet-drei-samen');
  await sowYarrow.tap();
  await sleep(450);
  await game(page, ([x, y]) => {
    window.__game.state.buildings.find((g) => g.type === 'beet' && g.x === x && g.y === y).prod.timer = 1799.5;
    window.__game.simulate(1);
  }, [bx, by + 3]);
  await sleep(500);
  await shot('19n-schafgarbe-reif');
  await page.locator('#info-actions button', { hasText: 'Ernten: 1 Schafgarbe' }).tap();
  await sleep(450);
  check((await game(page, () => window.__game.state.storage.schafgarbe ?? 0)) === 1, 'Schafgarbe geerntet');
  await tapTile(page, bx + 4, by);
  await sleep(450);
  check(await infoButton(page, 'load:schafgarbe').isVisible(), 'Erntebank: Knopf „➕ 1 Schafgarbe einlegen“');
  await page.tap('#info-close');
  await tapTile(page, bx, by + 6);
  check((await page.textContent('#info-title')) === 'Kräuterstube', 'Kräuterstube antippen zeigt Infofenster');
  await sleep(450);
  check(
    (await recipeOption(page, 'wundverband').getAttribute('aria-label')) === 'Umstellen auf Wundverband: 1 Heilverband + 5 Schafgarbenblüten',
    'Ab Level 10: Umstellen auf Wundverband aus 1 Heilverband + 5 Schafgarbenblüten',
  );
  await recipeOption(page, 'wundverband').tap();
  await sleep(450);
  const wund = await infoCard(page);
  check(
    /^heilverband \d+ \/ 1( ✓)?,schafgarbenbluete \d+ \/ 5/.test(wund?.inputs.join() ?? '') && wund.outputs.join() === 'wundverband Wundverband',
    `Umgestellt: Heilverband + Schafgarbenblüten → Wundverband (${JSON.stringify(wund)})`,
  );
  check((await infoFits(page)).length === 0, `Infofenster der Kräuterstube mit 3 Einstellungen: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
  await shot('19o-wundverband');
  // v0.27.0 (Tobias): Die Karte lässt sich rechts unter dem Infofenster hervorschieben
  const box2 = await page.locator('#game').boundingBox();
  for (let i = 0; i < 4; i++) {
    // v0.47.0: links vom (breiteren) Infofenster anfangen – auf dem Handy reicht
    // es jetzt bis 58 % der Breite
    await page.mouse.move(box2.x + box2.width * 0.5, box2.y + box2.height * 0.5);
    // rechte Maustaste verschiebt immer nur die Karte
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(box2.x + box2.width * 0.02, box2.y + box2.height * 0.5, { steps: 6 });
    await page.mouse.up({ button: 'right' });
    await sleep(60);
  }
  // v0.54.0: in 3D – der rechte Rand der Welt in der Reihe, auf die die Kamera blickt
  const infoEdge = await game(page, () => {
    const { camera, state } = window.__game;
    const w = state.world;
    const rect = document.getElementById('game').getBoundingClientRect();
    const z = Math.min(w.y + w.height, Math.max(w.y, camera.target.z));
    const right = rect.left + camera.screenOf(w.x + w.width, 0, z).x;
    return { right: Math.round(right), panel: Math.round(document.getElementById('info-panel').getBoundingClientRect().left) };
  });
  check(
    (await page.isVisible('#info-panel')) && infoEdge.right <= infoEdge.panel,
    `Rechter Rand der Fläche lässt sich links neben das Infofenster schieben (Rand ${infoEdge.right}, Fenster ab ${infoEdge.panel})`,
  );
  await shot('19p-rand-neben-infofenster');
  await page.tap('#info-close');

  // ---------- Level 11: Die Uhrmacherei (v0.28.0) ----------
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l10done = await page.textContent('#modal-content');
  check(
    l10done.includes('4 von 4') && l10done.includes('Nächstes Level: Level 11 · Die Uhrmacherei') && l10done.includes('Uhrmacherei') && !l10done.includes('🎁'),
    'Level 10 erledigt; Level 11 kündigt die Uhrmacherei an, ohne Geschenk',
  );
  // Rohstoffe im Laden-Lager (die Fabrik läuft weiter und schickt Waren, Rohstoffe aber nicht)
  const raws11 = () =>
    game(page, () => {
      const st = window.__game.state.storage;
      return ['holzstamm', 'felsbrocken', 'eisenerz', 'leinsamen', 'ringelblumensamen', 'schafgarbensamen'].map((t) => `${t}:${st[t] ?? 0}`).join();
    });
  const storageBefore11 = await raws11();
  await game(page, () => (window.__game.state.gold += 5000));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 11 · 5.000' }).tap();
  await sleep(150);
  const letter11 = await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  const lvl11 = { level: await game(page, () => window.__game.state.shopLevel), storage: await raws11() };
  check(lvl11.level === 11, `Aufstieg auf Level 11 für 5.000 Gold (${lvl11.level})`);
  check(lvl11.storage === storageBefore11, `Kein Geschenk mehr: kein Rohstoff dazu (${lvl11.storage})`);
  const lvl11Text = await page.textContent('#modal-content');
  check(
    lvl11Text.includes('Level 11 erreicht!') && !lvl11Text.includes('Gratis im Laden-Lager') && lvl11Text.includes('Die Uhrmacherei') && lvl11Text.includes('2 Räderuhren') && lvl11Text.includes('0 von 4'),
    'Level 11: Hilde möchte 2 Räderuhren, Aufträge 0 von 4, kein „Gratis“',
  );
  await shot('19q-level-11');
  await page.tap('#modal-close');
  await sleep(120);
  check(letter11.includes('Laden-Level 11!') && letter11.includes('Uhrmacherei') && !letter11.includes('Geschenk'), `Schriftrolle nach dem Aufstieg ohne Geschenk (${letter11.slice(0, 200)})`);
  // Uhrmacherei auf einem freien Platz bauen (Reiter „Werkstatt“)
  const spot11 = await game(page, ([x0, y0]) => {
    const { state } = window.__game;
    const used = new Set(Object.keys(state.belts));
    for (const b of state.buildings) {
      const [w0, h0] = b.type === 'lagerhaus' ? [2, 1] : b.type === 'versandportal' ? [1, 1] : [2, 2];
      const [w, h] = b.rot % 2 ? [h0, w0] : [w0, h0];
      for (let dx = -1; dx <= w; dx++) for (let dy = -1; dy <= h; dy++) used.add(`${b.x + dx},${b.y + dy}`);
    }
    const p = state.plot;
    let best = null;
    for (let y = p.y; y < p.y + p.height - 1; y++) {
      for (let x = p.x; x < p.x + p.width - 2; x++) {
        const cells = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1], [x + 2, y], [x + 2, y + 1]];
        if (!cells.every(([cx, cy]) => !used.has(`${cx},${cy}`))) continue;
        const d = Math.abs(x - x0) + Math.abs(y - y0);
        if (!best || d < best.d) best = { x, y, d };
      }
    }
    return best && [best.x, best.y];
  }, [bx + 3, by + 6]);
  check(Boolean(spot11), `Freier Platz für die Uhrmacherei (${JSON.stringify(spot11)})`);
  const [ux, uy] = spot11;
  await centerOn(page, ux, uy, 4);
  await game(page, () => {
    const s = window.__game.state.storage;
    s.zirkel = (s.zirkel ?? 0) + 1;
    s.uhrwerk = (s.uhrwerk ?? 0) + 1;
  });
  await page.tap('#btn-build');
  await sleep(80);
  await page.tap('.build-tab[data-tab="werkstatt"]');
  await sleep(80);
  const werkstatt11 = await shownTools();
  // v0.29.0: dahinter die Apotheke, auf Level 11 noch mit Schloss
  const apoLocked11 = await page.locator('.build-item[data-tool="apotheke"]').evaluate((b) => b.classList.contains('locked') && b.textContent.includes('Level 12'));
  check(
    werkstatt11.slice(-3).join() === 'schreibstube,uhrmacherei,apotheke' && apoLocked11,
    `Reiter „Werkstatt“: Schreibstube und Uhrmacherei, dahinter die Apotheke mit „🔒 Level 12“ (${werkstatt11.join(', ')})`,
  );
  const barFits11 = await page.evaluate(() =>
    [...document.querySelectorAll('.build-tab, .build-item')]
      .filter((e) => e.offsetParent)
      .every((e) => e.getBoundingClientRect().right <= innerWidth + 1),
  );
  check(barFits11, 'Reiter „Werkstatt“ mit zwei Gebäuden passt auf den Bildschirm');
  await shot('19r-werkstatt-uhrmacherei');
  await tapBuild(page, 'uhrmacherei');
  await sleep(80);
  check(await tabActive('werkstatt'), 'Uhrmacherei steht im Reiter „Werkstatt“');
  const g11 = await game(page, () => ({ ...window.__game.ui.ghost }));
  await touchDragTiles(page, cdp, [
    [g11.x, g11.y],
    [ux, uy],
  ]);
  await page.tap('#tool-confirm');
  await sleep(80);
  await page.tap('#build-close');
  await sleep(80);
  const built11 = await game(page, () => window.__game.state.buildings.filter((b) => b.type === 'uhrmacherei').map((b) => `${b.x},${b.y}`));
  check(built11.includes(`${ux},${uy}`), `Uhrmacherei per Touch gebaut (${built11.join(' | ')})`);
  await tapTile(page, ux, uy);
  check((await page.textContent('#info-title')) === 'Uhrmacherei', 'Uhrmacherei antippen zeigt Infofenster');
  await sleep(450);
  const uhr11 = await infoCard(page);
  check(
    /^uhrwerk \d+ \/ 1( ✓)?,gewichtstein \d+ \/ 1/.test(uhr11?.inputs.join() ?? '') && uhr11.outputs.join() === 'raederuhr Räderuhr',
    `Uhrmacherei: Uhrwerk + Gewichtstein → Räderuhr (${JSON.stringify(uhr11)})`,
  );
  check((await infoText(page)).includes('60 s je Stück'), 'Räderuhr: 60 s je Stück');
  check(
    (await recipeOption(page, 'kastenschloss').getAttribute('aria-label')) === 'Umstellen auf Kastenschloss: 1 Vorhängeschloss + 1 Schlüssel' &&
      (await recipeOption(page, 'sternenuhr').getAttribute('aria-label')) === 'Umstellen auf Sternenuhr: 1 Uhrwerk + 1 Zirkel',
    'Umstellen auf: Kastenschloss (Vorhängeschloss + Schlüssel), Sternenuhr (Uhrwerk + Zirkel)',
  );
  await recipeOption(page, 'sternenuhr').tap();
  await sleep(450);
  const stern11 = await infoCard(page);
  check(stern11?.outputs.join() === 'sternenuhr Sternenuhr', `Umgestellt auf Sternenuhr (${JSON.stringify(stern11)})`);
  check((await infoFits(page)).length === 0, `Infofenster der Uhrmacherei: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
  await shot('19s-uhrmacherei');
  await page.tap('#info-close');

  // ---------- Level 12: Die Apotheke (v0.29.0) ----------
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l11done = await page.textContent('#modal-content');
  check(
    l11done.includes('4 von 4') && l11done.includes('Nächstes Level: Level 12 · Die Apotheke') && l11done.includes('Apotheke') && !l11done.includes('🎁'),
    'Level 11 erledigt; Level 12 kündigt die Apotheke an, ohne Geschenk',
  );
  const storageBefore12 = await raws11();
  await game(page, () => (window.__game.state.gold += 7500));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 12 · 7.500' }).tap();
  await sleep(150);
  const letter12 = await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  const lvl12 = { level: await game(page, () => window.__game.state.shopLevel), storage: await raws11() };
  check(lvl12.level === 12, `Aufstieg auf Level 12 für 7.500 Gold (${lvl12.level})`);
  check(lvl12.storage === storageBefore12, `Kein Geschenk: kein Rohstoff dazu (${lvl12.storage})`);
  const lvl12Text = await page.textContent('#modal-content');
  check(
    lvl12Text.includes('Level 12 erreicht!') && !lvl12Text.includes('Gratis im Laden-Lager') && lvl12Text.includes('Die Apotheke') && lvl12Text.includes('50 Kamillenblüten') && lvl12Text.includes('0 von 4'),
    'Level 12: Klara möchte 50 Kamillenblüten, Aufträge 0 von 4, kein „Gratis“',
  );
  await shot('19t-level-12');
  await page.tap('#modal-close');
  await sleep(120);
  check(
    letter12.includes('Laden-Level 12!') && letter12.includes('Apotheke') && letter12.includes('Kamillensamen') && letter12.includes('Reißbrett') && !letter12.includes('Geschenk'),
    `Schriftrolle nach dem Aufstieg: Apotheke, Kamillensamen, Reißbrett (${letter12.slice(0, 200)})`,
  );
  // Apotheke auf einem freien Platz bauen (Reiter „Werkstatt“)
  const spot12 = await game(page, ([x0, y0]) => {
    const { state } = window.__game;
    const used = new Set(Object.keys(state.belts));
    for (const b of state.buildings) {
      const [w0, h0] = b.type === 'lagerhaus' ? [2, 1] : b.type === 'versandportal' ? [1, 1] : [2, 2];
      const [w, h] = b.rot % 2 ? [h0, w0] : [w0, h0];
      for (let dx = -1; dx <= w; dx++) for (let dy = -1; dy <= h; dy++) used.add(`${b.x + dx},${b.y + dy}`);
    }
    const p = state.plot;
    let best = null;
    for (let y = p.y; y < p.y + p.height - 1; y++) {
      for (let x = p.x; x < p.x + p.width - 2; x++) {
        const cells = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1], [x + 2, y], [x + 2, y + 1]];
        if (!cells.every(([cx, cy]) => !used.has(`${cx},${cy}`))) continue;
        const d = Math.abs(x - x0) + Math.abs(y - y0);
        if (!best || d < best.d) best = { x, y, d };
      }
    }
    return best && [best.x, best.y];
  }, [ux + 3, uy]);
  check(Boolean(spot12), `Freier Platz für die Apotheke (${JSON.stringify(spot12)})`);
  const [ax, ay] = spot12;
  await centerOn(page, ax, ay, 4);
  await game(page, () => {
    const s = window.__game.state.storage;
    s.verstaerkteholzplatte = (s.verstaerkteholzplatte ?? 0) + 1;
    s.gewichtstein = (s.gewichtstein ?? 0) + 1;
  });
  await page.tap('#btn-build');
  await sleep(80);
  await page.tap('.build-tab[data-tab="werkstatt"]');
  await sleep(80);
  const werkstatt12 = await shownTools();
  check(werkstatt12.slice(-3).join() === 'schreibstube,uhrmacherei,apotheke', `Reiter „Werkstatt“: Schreibstube, Uhrmacherei, Apotheke (${werkstatt12.join(', ')})`);
  const barFits12 = await page.evaluate(() =>
    [...document.querySelectorAll('.build-tab, .build-item')]
      .filter((e) => e.offsetParent)
      .every((e) => e.getBoundingClientRect().right <= innerWidth + 1),
  );
  check(barFits12, 'Reiter „Werkstatt“ mit drei Gebäuden passt auf den Bildschirm');
  await shot('19u-werkstatt-apotheke');
  await tapBuild(page, 'apotheke');
  await sleep(80);
  check(await tabActive('werkstatt'), 'Apotheke steht im Reiter „Werkstatt“');
  const g12 = await game(page, () => ({ ...window.__game.ui.ghost }));
  await touchDragTiles(page, cdp, [
    [g12.x, g12.y],
    [ax, ay],
  ]);
  await page.tap('#tool-confirm');
  await sleep(80);
  await page.tap('#build-close');
  await sleep(80);
  const built12 = await game(page, () => window.__game.state.buildings.filter((b) => b.type === 'apotheke').map((b) => `${b.x},${b.y}`));
  check(built12.includes(`${ax},${ay}`), `Apotheke per Touch gebaut (${built12.join(' | ')})`);
  await tapTile(page, ax, ay);
  check((await page.textContent('#info-title')) === 'Apotheke', 'Apotheke antippen zeigt Infofenster');
  await sleep(450);
  const apo12 = await infoCard(page);
  check(
    /^schafgarbenbluete \d+ \/ 5( ✓)?,kamillenbluete \d+ \/ 5/.test(apo12?.inputs.join() ?? '') && apo12.outputs.join() === 'kraeutermischung Kräutermischung',
    `Apotheke: Schafgarbenblüten + Kamillenblüten → Kräutermischung (${JSON.stringify(apo12)})`,
  );
  check((await infoText(page)).includes('20 s je Stück'), 'Kräutermischung: 20 s je Stück');
  check(
    (await recipeOption(page, 'kamillenkissen').getAttribute('aria-label')) === 'Umstellen auf Kamillenkissen: 10 Flachsfasern + 5 Kamillenblüten' &&
      (await recipeOption(page, 'heilpaeckchen').getAttribute('aria-label')) === 'Umstellen auf Heilpäckchen: 1 Wundverband + 1 Kräuterkompresse',
    'Umstellen auf: Kamillenkissen (Flachsfasern + Kamillenblüten), Heilpäckchen (Wundverband + Kräuterkompresse)',
  );
  await recipeOption(page, 'heilpaeckchen').tap();
  await sleep(450);
  const paeck12 = await infoCard(page);
  check(paeck12?.outputs.join() === 'heilpaeckchen Heilpäckchen', `Umgestellt auf Heilpäckchen (${JSON.stringify(paeck12)})`);
  check((await infoText(page)).includes('30 s je Stück'), 'Heilpäckchen: 30 s je Stück');
  check((await infoFits(page)).length === 0, `Infofenster der Apotheke: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
  await shot('19v-apotheke');
  await page.tap('#info-close');
  // Schreibstube: ab Level 12 die 3. Einstellung Reißbrett (60 s)
  const stube12 = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'schreibstube');
    return [b.x, b.y];
  });
  await centerOn(page, stube12[0], stube12[1], 4);
  await sleep(100);
  await tapTile(page, stube12[0], stube12[1]);
  check((await page.textContent('#info-title')) === 'Schreibstube', 'Schreibstube antippen zeigt Infofenster');
  await sleep(450);
  check(
    (await recipeOption(page, 'reissbrett').getAttribute('aria-label')) === 'Umstellen auf Reißbrett: 1 Zeichenbrett + 1 Reißzeug',
    'Ab Level 12: Umstellen auf Reißbrett aus 1 Zeichenbrett + 1 Reißzeug',
  );
  await recipeOption(page, 'reissbrett').tap();
  await sleep(450);
  const brett12 = await infoCard(page);
  check(
    /^zeichenbrett \d+ \/ 1( ✓)?,reisszeug \d+ \/ 1/.test(brett12?.inputs.join() ?? '') && brett12.outputs.join() === 'reissbrett Reißbrett',
    `Umgestellt: Zeichenbrett + Reißzeug → Reißbrett (${JSON.stringify(brett12)})`,
  );
  check((await infoText(page)).includes('60 s je Stück'), 'Reißbrett: 60 s je Stück');
  check((await infoFits(page)).length === 0, `Infofenster der Schreibstube mit 3 Einstellungen: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
  await shot('19w-reissbrett');
  await page.tap('#info-close');
  // Beet: vier Samen, Kamille säen; Erntebank nimmt Kamille
  await centerOn(page, bx + 1, by + 3, 4);
  await sleep(100);
  await game(page, () => {
    const s = window.__game.state.storage;
    s.kamillensamen = (s.kamillensamen ?? 0) + 1;
  });
  await tapTile(page, bx, by + 3);
  await sleep(450);
  const beet12 = await infoCard(page);
  check(
    beet12?.inputs.join() === 'leinsamen 1,ringelblumensamen 1,schafgarbensamen 1,kamillensamen 1' &&
      beet12.outputs.join() === 'flachspflanze Flachspflanze,ringelblume Ringelblume,schafgarbe Schafgarbe,kamille Kamille',
    `Leeres Beet auf Level 12: vier Pflanzen im Kasten (${JSON.stringify(beet12)})`,
  );
  check((await infoFits(page)).length === 0, `Beet auf Level 12: nichts ragt aus dem Fenster (${(await infoFits(page)).join(', ')})`);
  await shot('19x-beet-vier-samen');
  await infoButton(page, 'sow:kamillensamen').tap();
  await sleep(450);
  await game(page, ([x, y]) => {
    window.__game.state.buildings.find((g) => g.type === 'beet' && g.x === x && g.y === y).prod.timer = 1799.5;
    window.__game.simulate(1);
  }, [bx, by + 3]);
  await sleep(500);
  await page.locator('#info-actions button', { hasText: 'Ernten: 1 Kamille' }).tap();
  await sleep(450);
  check((await game(page, () => window.__game.state.storage.kamille ?? 0)) === 1, 'Kamille geerntet');
  await tapTile(page, bx + 4, by);
  await sleep(450);
  check(await infoButton(page, 'load:kamille').isVisible(), 'Erntebank: Knopf „➕ 1 Kamille einlegen“');
  await page.tap('#info-close');

  // ---------- v0.30.0: Laden-Lager vergrößern ----------
  await game(page, () => (window.__game.state.gold = 1000));
  await page.tap('#btn-shop');
  await sleep(150);
  await page.tap('#modal-content .tab[data-tab="lager"]');
  await sleep(150);
  const upgradeButton = page.locator('[data-storage-action="vergroessern"]');
  const upgradePoor = await page.textContent('#modal-content .storage-upgrade');
  check(
    upgradePoor.includes('Laden-Lager: 1.000 Plätze') &&
      upgradePoor.includes('Ausbau 1 von 10: +100 Plätze (1.000 → 1.100)') &&
      upgradePoor.includes('Dir fehlen noch 4.000') &&
      (await upgradeButton.isDisabled()),
    `Lager auf Level 12: Ausbau 1 von 10 für 5.000, mit 1.000 Gold gesperrt („${upgradePoor}“)`,
  );
  await game(page, () => (window.__game.state.gold = 8000));
  await sleep(1200); // das Laden-Fenster aktualisiert sich von selbst
  check(!(await upgradeButton.isDisabled()), 'Mit 8.000 Gold lässt sich das Lager vergrößern');
  check((await upgradeButton.textContent()).includes('Vergrößern · 5.000'), `Knopf nennt den Preis („${await upgradeButton.textContent()}“)`);
  await shot('23a-lager-vergroessern');
  await upgradeButton.tap();
  await sleep(150);
  const upgradeAsk = await page.textContent('#dialog');
  check(
    // v0.50.0: Die Fabrik läuft weiter – kauft gerade ein Kunde, sind es ein paar Gold mehr als 3.000
    upgradeAsk.includes('Laden-Lager vergrößern?') && upgradeAsk.includes('1.000 → 1.100') && /Danach hast du noch 3\.0\d\d Gold/.test(upgradeAsk),
    `Rückfrage vor dem Ausbau („${upgradeAsk}“)`,
  );
  await shot('23b-lager-frage');
  await page.tap('#dialog-ok');
  await sleep(200);
  const upgraded = await game(page, () => ({ gold: window.__game.state.gold, up: window.__game.state.storageUpgrades, cap: window.__game.storageCapacity() }));
  check(upgraded.up === 1 && upgraded.cap === 1100 && upgraded.gold <= 3000 + 2000, `Ausbau gekauft: 1.100 Plätze (${JSON.stringify(upgraded)})`);
  const upgradeAfter = await page.textContent('#modal-content');
  check(
    upgradeAfter.includes('Laden-Lager: 1.100 Plätze') && upgradeAfter.includes('Ausbau 2 von 10') && upgradeAfter.includes('Vergrößern · 7.500') && /Lager [\d.]+ \/ 1\.100/.test(upgradeAfter),
    'Danach: 1.100 Plätze, der nächste Ausbau kostet 7.500, oben „Lager … / 1.100“',
  );
  check((await page.textContent('#toast')).includes('jetzt 1.100 Plätze'), 'Meldung: Laden-Lager vergrößert');
  await shot('23c-lager-1100');
  await page.tap('#modal-close');
  await sleep(100);

  // ---------- Level 13: Die Glashütte (v0.31.0) ----------
  // Vor dem Aufstieg: die 6. Theke ist gesperrt („🔒 Ab Level 13 · 150.000“)
  await page.tap('#btn-shop');
  await sleep(150);
  await page.tap('#modal-content .tab[data-tab="theken"]');
  await sleep(150);
  check(
    (await page.textContent('#modal-content [data-counter="5"]')).includes('🔒 Ab Level 13 · 150.000'),
    `Level 12: Theke 6 „🔒 Ab Level 13 · 150.000 🪙“ (${await page.textContent('#modal-content [data-counter="5"]')})`,
  );
  await page.tap('#modal-close');
  await sleep(100);
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l12done = await page.textContent('#modal-content');
  check(
    l12done.includes('4 von 4') &&
      l12done.includes('Nächstes Level: Level 13 · Die Glashütte') &&
      l12done.includes('Schmiede: Fläschchen') &&
      l12done.includes('Ofen: Glas aus Sand') &&
      l12done.includes('Sand beim Händler') &&
      l12done.includes('Theke 6 kaufen (150.000 Gold)') &&
      !l12done.includes('🎁'),
    'Level 12 erledigt; Level 13 kündigt Fläschchen, Glas aus Sand, Sand und Theke 6 an, ohne Geschenk',
  );
  await game(page, () => (window.__game.state.gold += 10000));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 13 · 10.000' }).tap();
  await sleep(150);
  const letter13 = await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  check((await game(page, () => window.__game.state.shopLevel)) === 13, 'Aufstieg auf Level 13 für 10.000 Gold');
  const lvl13Text = await page.textContent('#modal-content');
  check(
    lvl13Text.includes('Level 13 erreicht!') && lvl13Text.includes('Die Glashütte') && lvl13Text.includes('50 Glas') && lvl13Text.includes('0 von 4') && !lvl13Text.includes('Gratis im Laden-Lager'),
    'Level 13: Konrad möchte 50 Glas, Aufträge 0 von 4, kein „Gratis“',
  );
  await shot('24a-level-13');
  await page.tap('#modal-close');
  await sleep(120);
  check(
    letter13.includes('Laden-Level 13!') && letter13.includes('Ofen: Glas aus Sand') && letter13.includes('Fläschchen') && letter13.includes('Theke 6'),
    `Schriftrolle nach dem Aufstieg: Glas aus Sand, Fläschchen, Theke 6 (${letter13.slice(0, 200)})`,
  );
  // Ofen: jetzt mit Sand – leer zeigt er beide Rohstoffe
  const ofen13 = await game(page, () => {
    const { state } = window.__game;
    const b = state.buildings.find((x) => x.type === 'kohlenmeiler');
    Object.assign(b.prod, { loaded: false, input: null, remaining: 0, queued: 0, queue: [], timer: 0, out: null, blocked: false });
    state.storage.sand = 1;
    return [b.x, b.y];
  });
  await centerOn(page, ofen13[0], ofen13[1], 4);
  await sleep(150);
  await tapTile(page, ofen13[0], ofen13[1]);
  check((await page.textContent('#info-title')) === 'Ofen', 'Ofen antippen zeigt Infofenster');
  await sleep(450);
  const ofenEmpty = await infoCard(page);
  check(
    ofenEmpty?.inputs.join() === 'holzstamm 1,sand 1' && ofenEmpty.outputs.join() === 'holzkohle 100 Holzkohle,glas 100 Glas',
    `Leerer Ofen auf Level 13: Holzstamm → 100 Holzkohle, Sand → 100 Glas (${JSON.stringify(ofenEmpty)})`,
  );
  check(!ofenEmpty.sub.includes('je Pflanze'), `Ofen: kein „je Pflanze“ (${ofenEmpty.sub})`);
  check(
    (await infoButton(page, 'load:sand').isVisible()) && (await infoButton(page, 'buy:sand').isVisible()) && (await infoButton(page, 'buy:sand').textContent()).includes('1.100'),
    'Ofen: Knöpfe „➕ 1 Sand einlegen“ und „🧺 Sand kaufen · 1.100“',
  );
  check((await infoFits(page)).length === 0, `Infofenster des Ofens mit zwei Rohstoffen: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
  await shot('24b-ofen-leer');
  await infoButton(page, 'load:sand').tap();
  await sleep(450);
  const ofenSand = await infoCard(page);
  check(ofenSand?.outputs.join() === 'glas 100 Glas', `Ofen mit Sand: → 100 Glas (${JSON.stringify(ofenSand)})`);
  check((await page.textContent('#info-meta')).includes('Arbeitet Sand'), `Status: „Arbeitet Sand …“ (${await page.textContent('#info-meta')})`);
  await game(page, () => window.__game.simulate(120));
  await sleep(450);
  await shot('24c-ofen-sand');
  await page.tap('#info-close');
  // Schmiede: 3. Einstellung Fläschchen (30 s)
  const schmiede13 = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'schmiede');
    return { x: b.x, y: b.y, recipe: b.prod.recipe };
  });
  await centerOn(page, schmiede13.x, schmiede13.y, 4);
  await sleep(150);
  await tapTile(page, schmiede13.x, schmiede13.y);
  check((await page.textContent('#info-title')) === 'Schmiede', 'Schmiede antippen zeigt Infofenster');
  await sleep(450);
  check(
    (await recipeOption(page, 'flaeschchen').getAttribute('aria-label')) === 'Umstellen auf Fläschchen: 5 Glas',
    'Ab Level 13: Umstellen auf Fläschchen aus 5 Glas',
  );
  await recipeOption(page, 'flaeschchen').tap();
  await sleep(450);
  const flask13 = await infoCard(page);
  check(
    /^glas \d+ \/ 5( ✓)?$/.test(flask13?.inputs.join() ?? '') && flask13.outputs.join() === 'flaeschchen Fläschchen',
    `Umgestellt: 5 Glas → Fläschchen (${JSON.stringify(flask13)})`,
  );
  check((await infoText(page)).includes('30 s je Stück'), 'Fläschchen: 30 s je Stück');
  check((await infoFits(page)).length === 0, `Infofenster der Schmiede mit 3 Einstellungen: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
  await shot('24d-schmiede-flaeschchen');
  await recipeOption(page, schmiede13.recipe).tap();
  await sleep(300);
  check((await game(page, () => window.__game.state.buildings.find((x) => x.type === 'schmiede').prod.recipe)) === schmiede13.recipe, 'Schmiede wieder zurückgestellt');
  await page.tap('#info-close');
  // Händler: Sand für 1.100; Theken: die 6. lässt sich jetzt kaufen (nach der 5.)
  await page.tap('#btn-shop');
  await sleep(150);
  await page.tap('#modal-content .tab[data-tab="haendler"]');
  await sleep(150);
  const haendler13 = await page.textContent('#modal-content');
  check(haendler13.includes('Sand') && haendler13.includes('1.100'), 'Händler: Sand für 1.100 Gold');
  await page.tap('#modal-content .tab[data-tab="theken"]');
  await sleep(150);
  const theke6 = await page.textContent('#modal-content [data-counter="5"]');
  check(!theke6.includes('🔒') && theke6.includes('150.000'), `Level 13: Theke 6 nicht mehr gesperrt (${theke6})`);
  await page.locator('#modal-content [data-counter="5"]').scrollIntoViewIfNeeded();
  await sleep(100);
  await shot('24e-theken-level-13');
  await page.tap('#modal-close');
  await sleep(100);

  // ---------- Level 14: Die Tinktur (v0.45.0) ----------
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l13done = await page.textContent('#modal-content');
  check(
    l13done.includes('4 von 4') &&
      l13done.includes('Nächstes Level: Level 14 · Die Tinktur') &&
      l13done.includes('Zimmerei: Mörser') &&
      l13done.includes('Apotheke: Tinktur') &&
      !l13done.includes('🎁'),
    'Level 13 erledigt; Level 14 kündigt Mörser (Zimmerei) und Tinktur (Apotheke) an, ohne Geschenk',
  );
  await game(page, () => (window.__game.state.gold += 12500));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 14 · 12.500' }).tap();
  await sleep(150);
  const letter14 = await readLetter(page); // v0.51.0: Schriftrolle zum Aufstieg
  check((await game(page, () => window.__game.state.shopLevel)) === 14, 'Aufstieg auf Level 14 für 12.500 Gold');
  const lvl14Text = await page.textContent('#modal-content');
  check(
    lvl14Text.includes('Level 14 erreicht!') && lvl14Text.includes('Die Tinktur') && lvl14Text.includes('15 Mörser') && lvl14Text.includes('0 von 4'),
    'Level 14: Klara möchte 15 Mörser, Aufträge 0 von 4',
  );
  await shot('25a-level-14');
  await page.tap('#modal-close');
  await sleep(120);
  check(letter14.includes('Laden-Level 14!') && letter14.includes('Mörser') && letter14.includes('Tinktur'), `Schriftrolle nach dem Aufstieg: Mörser und Tinktur (${letter14.slice(0, 200)})`);
  // Zimmerei und Apotheke haben jetzt 4 Einstellungen – die Liste passt ins Infofenster
  for (const [type, title, recipe, label] of [
    ['zimmerei', 'Zimmerei', 'moerser', 'Umstellen auf Mörser: 1 Steinplatte + 5 Holzstäbe'],
    ['apotheke', 'Apotheke', 'tinktur', 'Umstellen auf Tinktur: 1 Fläschchen + 1 Kräutermischung'],
  ]) {
    const pos = await game(
      page,
      (t) => {
        const b = window.__game.state.buildings.find((x) => x.type === t);
        return { x: b.x, y: b.y, recipe: b.prod.recipe };
      },
      type,
    );
    await sleep(150);
    await tapTile(page, pos.x, pos.y);
    check((await page.textContent('#info-title')) === title, `${title} antippen zeigt Infofenster`);
    await sleep(450);
    check((await recipeOption(page, recipe).getAttribute('aria-label')) === label, `Ab Level 14: ${label}`);
    check((await page.locator('#info-body .recipe-option').count()) === 3, `${title}: 3 andere Einstellungen zur Auswahl`);
    check((await infoFits(page)).length === 0, `Infofenster der ${title} mit 4 Einstellungen: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
    await recipeOption(page, recipe).tap();
    await sleep(450);
    const card = await infoCard(page);
    check(card?.outputs.join() === `${recipe} ${recipe === 'moerser' ? 'Mörser' : 'Tinktur'}`, `${title} umgestellt (${JSON.stringify(card)})`);
    check((await infoFits(page)).length === 0, `${title} nach dem Umstellen: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
    await shot(`25b-${type}-${recipe}`);
    await recipeOption(page, pos.recipe).tap();
    await sleep(300);
    await page.tap('#info-close');
  }
  // ---------- Level 15: Der alte Magier (v0.55.0) ----------
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l14done = await page.textContent('#modal-content');
  check(
    l14done.includes('4 von 4') && l14done.includes('Nächstes Level: Level 15 · Der alte Magier') && l14done.includes('Zauberkessel') && !l14done.includes('🎁'),
    'Level 14 erledigt; Level 15 kündigt den Zauberkessel an, ohne Geschenk',
  );
  await game(page, () => (window.__game.state.gold += 15000));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 15 · 15.000' }).tap();
  await sleep(150);
  const letter15 = await readLetter(page);
  const lvl15 = await game(page, () => ({ level: window.__game.state.shopLevel, world: { ...window.__game.state.world } }));
  check(lvl15.level === 15 && lvl15.world.width === 54 && lvl15.world.height === 46, `Aufstieg auf Level 15 für 15.000 Gold, die Welt wächst auf 54 × 46 (${lvl15.world.width} × ${lvl15.world.height})`);
  // v0.55.0 (Tobias: „Die ganze Welt sollte auch aufs Tablet passen“): nach dem Aufstieg die ganze Welt im Bild
  await sleep(300);
  const fit15 = await fitsWorld();
  check(
    fit15.ok || device.viewport.width < 1000,
    `Nach dem Aufstieg auf Level 15: ganze Welt ${fit15.ok ? 'im Bild' : 'fast im Bild (Handy)'} (Abstand ${fit15.distance}, Ecken ${fit15.box} auf ${fit15.view})`,
  );
  const lvl15Text = await page.textContent('#modal-content');
  check(
    lvl15Text.includes('Level 15 erreicht!') && lvl15Text.includes('Der alte Magier') && lvl15Text.includes('300 Holzkohle') && lvl15Text.includes('0 von 4'),
    'Level 15: Ambrosius möchte 300 Holzkohle, Aufträge 0 von 4',
  );
  check(letter15.includes('Laden-Level 15!') && letter15.includes('Zauberkessel') && letter15.includes('Ambrosius'), `Schriftrolle: Ambrosius und der Zauberkessel (${letter15.slice(0, 200)})`);
  await shot('26a-level-15');
  await page.tap('#modal-close');
  await sleep(120);
  // Zauberkessel bauen: aus der Bauleiste (Reiter „Stein“), Vorschau dort lassen, wo sie Platz hat
  await game(page, () => {
    const st = window.__game.state.storage;
    st.steinplatte = (st.steinplatte ?? 0) + 30;
    st.eisenblech = (st.eisenblech ?? 0) + 10;
  });
  await page.tap('#btn-build');
  await sleep(120);
  await tapBuild(page, 'zauberkessel');
  await sleep(150);
  // Liegt die Mitte des Bilds außerhalb des Grundstücks (Handy, ganz herausgezoomt),
  // steht die Vorschau auf gesperrter Fläche – dann wie ein Spieler auf freie Fläche ziehen
  if (!(await game(page, () => window.__game.ui.ghost?.valid === true))) {
    const spot = await game(page, () => {
      const g = window.__game;
      const p = g.state.plot;
      for (let y = p.y; y < p.y + p.height - 1; y++) {
        for (let x = p.x; x < p.x + p.width - 1; x++) {
          if ([0, 1].every((dx) => [0, 1].every((dy) => g.isFree(x + dx, y + dy)))) return [x, y];
        }
      }
      return null;
    });
    const ghostAt = await game(page, () => ({ ...window.__game.ui.ghost }));
    if (spot) {
      await showTiles(page, [[ghostAt.x, ghostAt.y], spot], 2);
      await touchDragTiles(page, cdp, [[ghostAt.x, ghostAt.y], spot]);
      await sleep(150);
    }
  }
  check((await mode(page)) === 'place' && (await game(page, () => window.__game.ui.ghost?.valid === true)), 'Zauberkessel wählen: Vorschau auf freier Fläche');
  await page.tap('#tool-confirm');
  await sleep(150);
  await page.tap('#build-close').catch(() => {});
  await sleep(100);
  const kessel = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'zauberkessel'));
  check(Boolean(kessel) && kessel.prod.fuel === 0, 'Zauberkessel gebaut, das Feuer ist kalt');
  await tapTile(page, kessel.x, kessel.y);
  await sleep(450);
  check((await page.textContent('#info-title')) === 'Zauberkessel', 'Zauberkessel antippen zeigt Infofenster');
  const coldText = await infoText(page);
  check(coldText.includes('Feuer aus') && coldText.includes('0 / 100'), `Infofenster: Feuer aus, 0 / 100 Holzkohle (${coldText.slice(0, 160)})`);
  check((await infoButton(page, 'refuel').textContent()) === '🔥 Keine Holzkohle im Laden-Lager' && (await infoButton(page, 'refuel').isDisabled()), 'Ohne Holzkohle im Laden-Lager: „🔥 Keine Holzkohle im Laden-Lager“');
  await game(page, () => (window.__game.state.storage.holzkohle = 130));
  await sleep(500);
  check((await infoButton(page, 'refuel').textContent()) === '🔥 Auffüllen: 100 Holzkohle', `„🔥 Auffüllen: 100 Holzkohle“ (${await infoButton(page, 'refuel').textContent()})`);
  await shot('26b-zauberkessel-kalt');
  await infoButton(page, 'refuel').tap();
  await sleep(450);
  const fired = await game(page, () => ({
    fuel: window.__game.state.buildings.find((b) => b.type === 'zauberkessel').prod.fuel,
    coal: window.__game.state.storage.holzkohle ?? 0,
  }));
  check(fired.fuel === 100 && fired.coal === 30, `Auffüllen legt 100 Holzkohle aus dem Laden-Lager ins Feuer (${JSON.stringify(fired)})`);
  check((await infoText(page)).includes('reicht für 20 Traumtränke'), 'Infofenster: 5 Holzkohle je Traumtrank, reicht für 20');
  check((await infoFits(page)).length === 0, `Infofenster des Zauberkessels: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
  // Brauen: Zutaten in den Kessel, nach 60 s ist der Traumtrank fertig
  await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'zauberkessel');
    b.prod.stock = { tinktur: 1, kamillenbluete: 5 };
    window.__game.simulate(1);
  });
  await sleep(450);
  check((await page.textContent('#info-meta')).includes('Arbeitet') && (await game(page, () => window.__game.state.buildings.find((b) => b.type === 'zauberkessel').prod.fuel)) === 95, 'Der Kessel braut, 5 Holzkohle verbrannt');
  await shot('26c-zauberkessel-braut');
  await game(page, () => window.__game.simulate(60));
  const brewed = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'zauberkessel').prod.out);
  check(brewed?.type === 'traumtrank', `Nach 60 s ist ein Traumtrank fertig (${JSON.stringify(brewed)})`);
  await page.tap('#info-close');
  await sleep(100);

  // ---------- Level 16: Die Kräutermühle (v0.57.0) ----------
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l15done = await page.textContent('#modal-content');
  check(
    l15done.includes('4 von 4') &&
      l15done.includes('Nächstes Level: Level 16 · Die Kräutermühle') &&
      l15done.includes('Kräutermühle') &&
      l15done.includes('Zauberkessel: Heiltrank') &&
      !l15done.includes('🎁'),
    'Level 15 erledigt; Level 16 kündigt Kräutermühle und Heiltrank an, ohne Geschenk',
  );
  const world15 = await game(page, () => ({ ...window.__game.state.world }));
  await game(page, () => (window.__game.state.gold += 17500));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 16 · 17.500' }).tap();
  await sleep(150);
  const letter16 = await readLetter(page);
  const lvl16 = await game(page, () => ({ level: window.__game.state.shopLevel, world: { ...window.__game.state.world } }));
  check(lvl16.level === 16 && JSON.stringify(lvl16.world) === JSON.stringify(world15), `Aufstieg auf Level 16 für 17.500 Gold, keine neue Fläche (${JSON.stringify(lvl16)})`);
  const lvl16Text = await page.textContent('#modal-content');
  check(
    lvl16Text.includes('Level 16 erreicht!') && lvl16Text.includes('Die Kräutermühle') && lvl16Text.includes('50 Heilpuder') && lvl16Text.includes('0 von 4'),
    'Level 16: Grete möchte 50 Heilpuder, Aufträge 0 von 4',
  );
  check(letter16.includes('Laden-Level 16!') && letter16.includes('Kräutermühle') && letter16.includes('Grete'), `Schriftrolle: Grete und die Kräutermühle (${letter16.slice(0, 200)})`);
  await shot('27a-level-16');
  await page.tap('#modal-close');
  await sleep(120);
  // Kräutermühle bauen: aus der Bauleiste (Reiter „Stein“, jetzt 4 Gebäude)
  await game(page, () => {
    const st = window.__game.state.storage;
    st.moerser = (st.moerser ?? 0) + 10;
    st.raederwerk = (st.raederwerk ?? 0) + 4;
  });
  await page.tap('#btn-build');
  await sleep(120);
  await tapBuild(page, 'kraeutermuehle');
  await sleep(150);
  if (!(await game(page, () => window.__game.ui.ghost?.valid === true))) {
    const spot = await game(page, () => {
      const g = window.__game;
      const p = g.state.plot;
      for (let y = p.y; y < p.y + p.height - 1; y++) {
        for (let x = p.x; x < p.x + p.width - 1; x++) {
          if ([0, 1].every((dx) => [0, 1].every((dy) => g.isFree(x + dx, y + dy)))) return [x, y];
        }
      }
      return null;
    });
    const ghostAt = await game(page, () => ({ ...window.__game.ui.ghost }));
    if (spot) {
      await showTiles(page, [[ghostAt.x, ghostAt.y], spot], 2);
      await touchDragTiles(page, cdp, [[ghostAt.x, ghostAt.y], spot]);
      await sleep(150);
    }
  }
  check((await mode(page)) === 'place' && (await game(page, () => window.__game.ui.ghost?.valid === true)), 'Kräutermühle wählen: Vorschau auf freier Fläche');
  await page.tap('#tool-confirm');
  await sleep(150);
  await page.tap('#build-close').catch(() => {});
  await sleep(100);
  const muehle = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'kraeutermuehle');
    return b && { x: b.x, y: b.y, paid: b.paid, recipe: b.prod.recipe, moerser: window.__game.state.storage.moerser ?? 0 };
  });
  check(Boolean(muehle) && muehle.recipe === 'heilpuder' && muehle.paid?.moerser === 10 && muehle.paid?.raederwerk === 4, `Kräutermühle gebaut für 10 Mörser + 4 Räderwerke (${JSON.stringify(muehle)})`);
  await tapTile(page, muehle.x, muehle.y);
  await sleep(450);
  check((await page.textContent('#info-title')) === 'Kräutermühle', 'Kräutermühle antippen zeigt Infofenster');
  check((await infoFits(page)).length === 0, `Infofenster der Kräutermühle: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
  await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'kraeutermuehle');
    b.prod.stock = { ringelbluete: 5 };
    window.__game.simulate(1);
  });
  await sleep(450);
  check((await page.textContent('#info-meta')).includes('Arbeitet'), 'Die Mühle mahlt');
  await shot('27b-kraeutermuehle');
  await game(page, () => window.__game.simulate(15));
  const ground = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'kraeutermuehle').prod.out);
  check(ground?.type === 'heilpuder', `Nach 15 s ist ein Heilpuder fertig (${JSON.stringify(ground)})`);
  await page.tap('#info-close');
  await sleep(100);
  // Den Kessel per Touch auf Heiltrank umstellen und brauen
  const kessel16 = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'zauberkessel');
    b.prod.out = null;
    return { x: b.x, y: b.y };
  });
  await tapTile(page, kessel16.x, kessel16.y);
  await sleep(450);
  check((await page.textContent('#info-title')) === 'Zauberkessel', 'Zauberkessel antippen zeigt Infofenster');
  check((await recipeOption(page, 'heiltrank').getAttribute('aria-label')) === 'Umstellen auf Heiltrank: 1 Tinktur + 2 Heilpuder', 'Ab Level 16: Umstellen auf Heiltrank');
  await recipeOption(page, 'heiltrank').tap();
  await sleep(450);
  check((await infoFits(page)).length === 0, `Zauberkessel auf Heiltrank: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
  await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'zauberkessel');
    b.prod.stock = { tinktur: 1, heilpuder: 2 };
    window.__game.simulate(61);
  });
  const healed = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'zauberkessel').prod.out);
  check(healed?.type === 'heiltrank', `Nach 60 s ist ein Heiltrank fertig (${JSON.stringify(healed)})`);
  await shot('27c-heiltrank');
  await page.tap('#info-close');
  await sleep(100);

  // ---------- Level 17: Die Sternwarte (v0.58.0) ----------
  await page.tap('#btn-level');
  await sleep(150);
  for (let i = 0; i < 4; i++) {
    await page.locator('#modal-content button', { hasText: '🧪 Test: Auftrag erledigen' }).tap();
    await sleep(200);
  }
  const l16done = await page.textContent('#modal-content');
  check(
    l16done.includes('4 von 4') &&
      l16done.includes('Nächstes Level: Level 17 · Die Sternwarte') &&
      l16done.includes('Steinmetz: Linse') &&
      l16done.includes('Steinmetz: Kristallsand') &&
      l16done.includes('Uhrmacherei: Fernrohr') &&
      !l16done.includes('🎁'),
    'Level 16 erledigt; Level 17 kündigt Linse, Kristallsand (Steinmetz) und Fernrohr (Uhrmacherei) an, ohne Geschenk',
  );
  await game(page, () => (window.__game.state.gold += 20000));
  await sleep(450);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 17 · 20.000' }).tap();
  await sleep(150);
  const letter17 = await readLetter(page);
  check((await game(page, () => window.__game.state.shopLevel)) === 17, 'Aufstieg auf Level 17 für 20.000 Gold');
  const lvl17Text = await page.textContent('#modal-content');
  check(
    lvl17Text.includes('Level 17 erreicht!') && lvl17Text.includes('Die Sternwarte') && lvl17Text.includes('20 Linsen') && lvl17Text.includes('0 von 4'),
    'Level 17: Berta möchte 20 Linsen, Aufträge 0 von 4',
  );
  check(letter17.includes('Laden-Level 17!') && letter17.includes('Sternwarte') && letter17.includes('Berta'), `Schriftrolle: Sternwarte und Berta (${letter17.slice(0, 200)})`);
  await shot('28a-level-17');
  await page.tap('#modal-close');
  await sleep(120);
  // Steinmetz und Uhrmacherei haben jetzt 4 Einstellungen (Tobias: höchstens 4) – per Touch umstellen
  for (const [type, title, recipe, label, name] of [
    ['steinmetz', 'Steinmetz', 'linse', 'Umstellen auf Linse: 10 Glas', 'Linse'],
    ['uhrmacherei', 'Uhrmacherei', 'fernrohr', 'Umstellen auf Fernrohr: 2 Linsen + 10 Eisenbleche', 'Fernrohr'],
  ]) {
    const pos = await game(
      page,
      (t) => {
        const b = window.__game.state.buildings.find((x) => x.type === t);
        return { x: b.x, y: b.y, recipe: b.prod.recipe };
      },
      type,
    );
    await sleep(150);
    await tapTile(page, pos.x, pos.y);
    check((await page.textContent('#info-title')) === title, `${title} antippen zeigt Infofenster`);
    await sleep(450);
    check((await recipeOption(page, recipe).getAttribute('aria-label')) === label, `Ab Level 17: ${label}`);
    check((await page.locator('#info-body .recipe-option').count()) === 3, `${title}: 3 andere Einstellungen zur Auswahl`);
    check((await infoFits(page)).length === 0, `Infofenster ${title} mit 4 Einstellungen: nichts ragt heraus (${(await infoFits(page)).join(' | ')})`);
    await recipeOption(page, recipe).tap();
    await sleep(450);
    const card = await infoCard(page);
    check(card?.outputs.join() === `${recipe} ${name}`, `${title} umgestellt auf ${name} (${JSON.stringify(card)})`);
    await shot(`28b-${type}-${recipe}`);
    await recipeOption(page, pos.recipe).tap();
    await sleep(300);
    await page.tap('#info-close');
  }
  // Kristallsand: ein Steinmetz mahlt 5 Glas in 10 s
  // (gezählt über „hergestellt“ – die Ware kann schon auf dem Band liegen)
  const ground17 = await game(page, () => {
    const g = window.__game;
    const b = g.state.buildings.find((x) => x.type === 'steinmetz');
    const before = { recipe: b.prod.recipe, stock: { ...b.prod.stock } };
    const made = g.state.produced?.kristallsand ?? 0;
    Object.assign(b.prod, { recipe: 'kristallsand', stock: { glas: 5 }, out: null, busy: false, timer: 0 });
    g.simulate(11);
    const result = (g.state.produced?.kristallsand ?? 0) - made;
    Object.assign(b.prod, before, { busy: false, timer: 0 });
    return result;
  });
  check(ground17 === 1, `Steinmetz mahlt 5 Glas zu Kristallsand (${ground17} hergestellt)`);

  await tapTile(page, 3, 3); // Auswahl aufheben (gesperrte Fläche, kein Angebot)
  await page.tap('#info-close').catch(() => {});
  await shot('17-fabrik');

  // v0.21.0: Maschinen zeigen auf der Karte, was sie herstellen – nah und weit
  const zimNah = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'zimmerei'));
  await centerOn(page, zimNah.x, zimNah.y, 2);
  await sleep(150);
  await shot('21-karte-nah');
  const plotAll = await game(page, () => ({ ...window.__game.state.plot }));
  await showTiles(page, [
    [plotAll.x, plotAll.y],
    [plotAll.x + plotAll.width - 1, plotAll.y + plotAll.height - 1],
  ], 0);
  await sleep(150);
  await shot('21-karte-weit');

  // v0.54.0: Der Test dauert in 3D länger, das Holzfällerlager kann bis hier
  // leer gelaufen sein – dann einen Holzstamm kaufen und einlegen (wie im
  // 2D-Ablauf arbeitet es danach mit einem Stamm; weiter unten wird aufgefüllt)
  const hfTest = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'holzfaeller');
    return { x: b.x, y: b.y, inside: (b.prod.loaded ? 1 : 0) + b.prod.queued };
  });
  if (hfTest.inside === 0) {
    await tapTile(page, hfTest.x, hfTest.y);
    await sleep(300);
    await infoButton(page, 'buy:holzstamm').tap();
    await sleep(150);
    await infoButton(page, 'load:holzstamm').tap();
    await sleep(150);
    await page.tap('#info-close').catch(() => {});
  }
  await page.tap('#btn-menu');
  await page.tap('#menu-test-mode');
  await sleep(80);
  check(await page.isVisible('#hud-speed'), 'Testmodus zeigt ⏩ ×10');
  const hfProd = () =>
    game(page, () => {
      const b = window.__game.state.buildings.find((x) => x.type === 'holzfaeller');
      return { remaining: b.prod.remaining, queued: b.prod.queued, blocked: b.prod.blocked };
    });
  const tBefore = await hfProd();
  // Bei ×10 entstehen in 3 s etwa 6–7 Holzblöcke, bei normaler Zeit unter 1.
  await sleep(3000);
  const tAfter = await hfProd();
  check(
    tBefore.remaining - tAfter.remaining >= 3,
    `Im Testmodus läuft die Zeit schneller (${tBefore.remaining - tAfter.remaining} Blöcke in 3 s; vorher ${JSON.stringify(tBefore)}, nachher ${JSON.stringify(tAfter)})`,
  );
  // v0.21.0: Bilder pro Sekunde im Testmodus
  const fpsText = (await page.isVisible('#hud-fps')) ? await page.textContent('#hud-fps') : '';
  const fpsValue = Number(/(\d+) Bilder\/s/.exec(fpsText)?.[1] ?? 0);
  check(fpsValue > 0, `Testmodus zeigt Bilder pro Sekunde („${fpsText}“)`);
  const hudFits = await page.evaluate(() => {
    const hud = document.getElementById('hud').getBoundingClientRect();
    return [...document.querySelectorAll('#hud > *:not(.menu)')].every((el) => {
      const r = el.getBoundingClientRect();
      return el.hidden || (r.left >= hud.left - 1 && r.right <= hud.right + 1);
    });
  });
  check(hudFits, 'Obere Leiste mit Testmodus-Anzeigen passt auf den Bildschirm');
  await shot('17a-testmodus-bilder');
  await page.tap('#btn-menu');
  await page.tap('#menu-test-mode');
  check(!(await page.isVisible('#hud-speed')), 'Testmodus nach dem Zeittest aus');
  check(!(await page.isVisible('#hud-fps')), 'Bilder pro Sekunde nur im Testmodus');

  // Holzstamm direkt im Infofenster kaufen
  await tapTile(page, 10, 6);
  const goldBeforeLog = await game(page, () => window.__game.state.gold);
  await infoButton(page, 'buy:holzstamm').tap();
  await sleep(80);
  const logBought = await game(page, () => ({ gold: window.__game.state.gold, logs: window.__game.state.storage.holzstamm ?? 0 }));
  check(logBought.logs === 1 && logBought.gold <= goldBeforeLog - 183 + 70, `Holzstamm im Infofenster gekauft (${goldBeforeLog} → ${logBought.gold})`);
  // v0.14.0: Auffüllen – erst der Holzstamm aus dem Laden-Lager, der Rest wird gekauft
  await game(page, () => (window.__game.state.gold += 700));
  await sleep(450);
  const refillText = await page.locator('#info-actions button', { hasText: 'Auffüllen' }).textContent();
  const beforeRefill = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'holzfaeller');
    return { inside: (b.prod.loaded ? 1 : 0) + b.prod.queued, gold: window.__game.state.gold };
  });
  const toBuy = 3 - beforeRefill.inside - 1;
  check(
    refillText === `⏫ Auffüllen: ${3 - beforeRefill.inside} Holzstämme${toBuy > 0 ? ` · kauft ${toBuy} für ${(toBuy * 183).toLocaleString('de-DE')} 🪙` : ''}`,
    `Knopf sagt, was Auffüllen tut („${refillText}“)`,
  );
  await page.locator('#info-actions button', { hasText: 'Auffüllen' }).tap();
  await sleep(450);
  const refilled = await game(page, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'holzfaeller');
    return { inside: (b.prod.loaded ? 1 : 0) + b.prod.queued, logs: window.__game.state.storage.holzstamm ?? 0, gold: window.__game.state.gold };
  });
  check(
    refilled.inside === 3 && refilled.logs === 0 && refilled.gold <= beforeRefill.gold - toBuy * 183 + 70,
    `Auffüllen: 3 / 3 Holzstämme im Holzfällerlager (${JSON.stringify(beforeRefill)} → ${JSON.stringify(refilled)})`,
  );
  check((await infoText(page)).includes('Vorrat 3 / 3'), 'Infofenster: Vorrat 3 / 3');
  check((await page.locator('#info-body .source-slots .item-icon.empty').count()) === 0, 'Vorrat voll: alle 3 Bilder voll');
  check(
    (await page.locator('#info-actions button', { hasText: 'Vorrat voll' }).isDisabled()) &&
      (await infoButton(page, 'load:holzstamm').isDisabled()),
    'Bei vollem Vorrat: „Vorrat voll“, Einlegen gesperrt',
  );
  await shot('17b-vorrat-voll');
  await page.tap('#info-close');

  // ---------- Spiel im Hintergrund (v0.14.0) ----------
  // a) 20 Minuten weg (App im Hintergrund): Die Fabrik und die Kunden laufen weiter
  await game(page, () => {
    const st = window.__game.state;
    st.counters.forEach((c, i) => Object.assign(c, i === 0 ? { type: 'holzplatte', count: 10 } : { type: null, count: 0 }));
  });
  const awayBefore = await game(page, () => ({
    gold: window.__game.state.gold,
    remaining: window.__game.state.buildings.find((b) => b.type === 'holzfaeller').prod.remaining,
  }));
  await game(page, () => window.__game.away(20 * 60));
  await page.waitForFunction(() => !window.__game.isCatchingUp(), null, { timeout: 15000 });
  await sleep(150);
  check((await page.textContent('#modal-content h2')) === '👋 Willkommen zurück, Tester!', 'Nach 20 Minuten: Fenster „Willkommen zurück, Tester!“ (v0.50.0: mit Namen)');
  const awayText = await page.textContent('#modal-content');
  check(awayText.includes('Du warst 20 Min. weg') && awayText.includes('Kunden haben'), `Bericht nennt Zeit und Verkäufe (${awayText.slice(0, 160)})`);
  const awayAfter = await game(page, () => ({
    gold: window.__game.state.gold,
    counter: window.__game.state.counters[0].count,
    inside: (() => {
      const b = window.__game.state.buildings.find((x) => x.type === 'holzfaeller');
      return (b.prod.loaded ? 1 : 0) + b.prod.queued;
    })(),
  }));
  check(awayAfter.counter === 0 && awayAfter.gold >= awayBefore.gold + 60, `Kunden haben die Theke leer gekauft (${JSON.stringify(awayAfter)})`);
  check(awayAfter.inside >= 1 && awayAfter.inside <= 2, `Nach 20 Minuten ist mindestens ein Holzstamm verarbeitet (${awayAfter.inside} im Vorrat)`);
  await shot('17c-willkommen-zurueck');
  await page.locator('#modal-content button', { hasText: 'Weiter' }).tap();
  await sleep(120);
  check(!(await page.isVisible('#modal')), '„Weiter“ schließt das Fenster');

  // Die Fabrik läuft beim Neuladen weiter; beim Verlassen wird der neueste Stand
  // gespeichert. Deshalb: nichts darf verloren gehen (eher kommt etwas dazu).
  const snapshot = () =>
    game(page, () => ({
      logs: window.__game.state.storage.holzstamm ?? 0,
      blocks: window.__game.state.storage.holzblock ?? 0,
    }));
  const beforeReload = await snapshot();
  await page.reload();
  await waitForGame(page);
  const afterReload = await snapshot();
  check(
    afterReload.logs === beforeReload.logs && afterReload.blocks >= beforeReload.blocks,
    `Laden-Lager bleibt nach dem Neuladen erhalten (Holzstämme ${beforeReload.logs} → ${afterReload.logs}, Holzblöcke ${beforeReload.blocks} → ${afterReload.blocks})`,
  );

  // b) Spiel 2 Stunden zu: Beim Öffnen wird nachgerechnet. Den Spielstand
  // dafür auf einer anderen Seite derselben Adresse zurückdatieren – das Spiel
  // selbst speichert beim Schließen den neuesten Stand.
  await page.close();
  const page2 = await context.newPage();
  page2.on('pageerror', (e) => errors.push(e.message));
  page2.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page2.goto(`${baseUrl}manifest.webmanifest`);
  const backdated = await page2.evaluate(() => {
    const key = 'erstesspiel-spielstand-3d-test'; // v0.54.0: der Platz des einen Spiels
    const data = JSON.parse(localStorage.getItem(key));
    data.savedAt -= 2 * 3600 * 1000;
    // v0.54.0: In 3D dauert der Test länger – das Beet wäre schon vorher reif.
    // Frisch gesät wird es sicher erst in den 2 Stunden reif.
    const beet = data.state.buildings.find((b) => b.type === 'beet' && b.prod.crop === 'leinsamen');
    if (beet) beet.prod.timer = 0;
    localStorage.setItem(key, JSON.stringify(data));
    return data.saveVersion;
  });
  check(backdated === 21, `Spielstand-Version 21 (${backdated})`); // v0.55.0: Feuerfach
  await page2.goto(baseUrl);
  await waitForGame(page2);
  await page2.waitForFunction(() => !window.__game.isCatchingUp(), null, { timeout: 20000 });
  await sleep(200);
  const loadText = await page2.textContent('#modal-content');
  check(
    (await page2.textContent('#modal-content h2')) === '👋 Willkommen zurück, Tester!' && loadText.includes('Du warst 2 Std. weg') && loadText.includes('Leer gelaufen: 1× Holzfällerlager'),
    `Nach 2 Stunden: Bericht beim Öffnen, Holzfällerlager leer gelaufen (${loadText.slice(0, 200)})`,
  );
  const woodAfter = await game(page2, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'holzfaeller');
    return (b.prod.loaded ? 1 : 0) + b.prod.queued;
  });
  check(woodAfter === 0, 'Nach über 45 Minuten sind alle 3 Holzstämme verarbeitet');
  // v0.16.0: Das Beet ist im Hintergrund reif geworden
  check(loadText.includes('Reif zum Ernten: 1× Beet'), 'Bericht: Reif zum Ernten: 1× Beet');
  const beetAfter = await game(page2, () => {
    const b = window.__game.state.buildings.find((x) => x.type === 'beet');
    return { crop: b.prod.crop, timer: b.prod.timer };
  });
  check(beetAfter.crop === 'leinsamen' && beetAfter.timer === 1800, `Beet im Hintergrund gewachsen (${JSON.stringify(beetAfter)})`);
  await page2.screenshot({ path: path.join(OUT, `${device.name}-17d-willkommen-nach-2-std.png`) });
  await page2.locator('#modal-content button', { hasText: 'Weiter' }).tap();
  await sleep(120);

  // ---------- Spielstand sichern und laden (v0.22.0) ----------
  const shot2 = (name) => page2.screenshot({ path: path.join(OUT, `${device.name}-${name}.png`) });
  const toastText = () => page2.textContent('#toast');
  const factory = () =>
    game(page2, () => ({
      level: window.__game.state.shopLevel,
      buildings: window.__game.state.buildings.length,
      belts: Object.keys(window.__game.state.belts).length,
    }));
  await page2.tap('#btn-menu');
  await sleep(80);
  check(
    (await page2.isVisible('#menu-save-file')) && (await page2.isVisible('#menu-load-file')),
    'Menü: „💾 Spielstand sichern“ und „📂 Spielstand laden“',
  );
  const menuBox = await page2.locator('#menu').boundingBox();
  const viewport = page2.viewportSize();
  check(menuBox.y + menuBox.height <= viewport.height && menuBox.x >= 0, 'Menü passt auf den Bildschirm');
  await shot2('22-menue');
  await page2.tap('#menu-save-file');
  await sleep(80);
  const saveDialog = await page2.textContent('#dialog-text');
  check(
    (await page2.textContent('#dialog-title')) === '💾 Spielstand sichern' && /Level \d+ · [\d.]+ Gold · \d+ Gebäude/.test(saveDialog) && saveDialog.includes('.txt“'),
    `Sichern: Rückfrage mit Level, Gold, Gebäuden und Dateiname (${saveDialog.slice(0, 120)})`,
  );
  check(
    !(await page2.isVisible('#dialog-alt')) && (await page2.textContent('#dialog-ok')) === '⬇️ In „Downloads“ speichern',
    'Ohne Teilen-Menü: nur „In Downloads speichern“',
  );
  await shot2('22b-sichern');
  const saved = await factory();
  const [download] = await Promise.all([page2.waitForEvent('download'), page2.tap('#dialog-ok')]);
  const backupName = download.suggestedFilename();
  check(/^Tester - Fabrik Level \d+ - \d\d\.\d\d\.\d{4} \d\d-\d\d\.txt$/.test(backupName), `Dateiname mit Namen „${backupName}“`);
  const backupPath = path.join(OUT, `${device.name}-sicherung.txt`);
  await download.saveAs(backupPath);
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  check(
    backupData.saveVersion === 21 && backupData.state.buildings.length === saved.buildings && Math.abs(Date.now() - backupData.savedAt) < 60000,
    `Datei enthält den Spielstand (Format ${backupData.saveVersion}, ${backupData.state.buildings.length} Gebäude)`,
  );
  await sleep(100);
  check((await toastText()).includes('Gesichert') && (await toastText()).includes('Downloads'), 'Meldung: Gesichert, liegt in „Downloads“');

  // Teilen-Menü (wie auf dem Tablet): hier nachgebildet
  await game(page2, () => {
    window.__shared = [];
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data) => {
        window.__shared.push(...data.files.map((f) => f.name));
      },
    });
  });
  await page2.tap('#btn-menu');
  await page2.tap('#menu-save-file');
  await sleep(80);
  check(
    (await page2.textContent('#dialog-ok')) === '📤 Teilen …' && (await page2.textContent('#dialog-alt')) === '⬇️ In „Downloads“',
    'Mit Teilen-Menü: „📤 Teilen …“ und „⬇️ In Downloads“',
  );
  await shot2('22c-sichern-teilen');
  await page2.tap('#dialog-ok');
  await sleep(150);
  const shared = await game(page2, () => window.__shared);
  check(shared.length === 1 && shared[0].endsWith('.txt'), `Teilen: Datei übergeben (${shared.join(', ')})`);

  // Neues Spiel mit „Erst sichern“
  await page2.tap('#btn-menu');
  await page2.tap('#menu-new-game');
  await sleep(80);
  await shot2('22d-neues-spiel-erst-sichern');
  await page2.tap('#dialog-alt');
  await sleep(80);
  check((await page2.textContent('#dialog-title')) === '💾 Spielstand sichern', '„Erst sichern“ öffnet das Sichern');
  await page2.tap('#dialog-ok');
  await sleep(150);
  check(
    (await game(page2, () => window.__shared.length)) === 2 && (await page2.textContent('#dialog-title')).startsWith('Gesichert'),
    'Nach dem Sichern: „Gesichert – jetzt neues Spiel starten?“',
  );
  await Promise.all([page2.waitForNavigation(), page2.tap('#dialog-ok')]);
  await waitForGame(page2);
  const freshGame = await factory();
  check(freshGame.buildings === 2 && freshGame.belts === 0 && freshGame.level === 1, `Neues Spiel nach dem Sichern (${JSON.stringify(freshGame)})`);

  // Laden: Datei 2 Stunden alt machen – die Fabrik holt die Zeit nach
  backupData.savedAt -= 2 * 3600 * 1000;
  fs.writeFileSync(backupPath, JSON.stringify(backupData));
  await page2.tap('#btn-menu');
  const [chooser] = await Promise.all([page2.waitForEvent('filechooser'), page2.tap('#menu-load-file')]);
  await chooser.setFiles(backupPath);
  await page2.waitForSelector('#dialog:not([hidden])');
  const loadDialog = await page2.textContent('#dialog-text');
  check(
    (await page2.textContent('#dialog-title')) === '📂 Spielstand laden?' &&
      loadDialog.includes(`-sicherung.txt“`) &&
      loadDialog.includes(`Level ${saved.level} ·`) &&
      loadDialog.includes(`${saved.buildings} Gebäude, gesichert am`) &&
      loadDialog.includes('ersetzt'),
    `Laden: Vorschau mit Level, Gebäuden und Datum (${loadDialog.slice(0, 160)})`,
  );
  check((await page2.textContent('#dialog-alt')) === '💾 Jetzigen erst sichern', 'Laden bietet „Jetzigen erst sichern“ an');
  await shot2('22e-laden-frage');
  await Promise.all([page2.waitForNavigation(), page2.tap('#dialog-ok')]);
  await waitForGame(page2);
  await page2.waitForFunction(() => !window.__game.isCatchingUp(), null, { timeout: 20000 });
  await sleep(200);
  const restored = await factory();
  check(
    restored.level === saved.level && restored.buildings === saved.buildings && restored.belts === saved.belts,
    `Fabrik geladen (${JSON.stringify(saved)} → ${JSON.stringify(restored)})`,
  );
  check((await toastText()).includes('-sicherung.txt“ geladen'), `Meldung: Spielstand geladen (${await toastText()})`);
  check(
    (await page2.textContent('#modal-content h2')) === '📂 Spielstand geladen' &&
      // zwischen Sichern und Laden kann gut eine Minute vergehen („2 Std. 1 Min.“)
      (await page2.textContent('#modal-content')).includes('Seit dem Sichern sind 2 Std.'),
    'Nach dem Laden holt die Fabrik die 2 Stunden seit dem Sichern nach („Seit dem Sichern sind 2 Std. vergangen“)',
  );
  const keptCopy = await game(page2, () => JSON.parse(localStorage.getItem('erstesspiel-spielstand-3d-test-vor-dem-laden')).state.buildings.length);
  check(keptCopy === 2, 'Der vorige Spielstand bleibt als Sicherheitskopie im Browser');
  await shot2('22f-geladen');
  await page2.locator('#modal-content button', { hasText: 'Weiter' }).tap();
  await sleep(120);

  // Falsche Datei: wird abgelehnt, nichts ändert sich
  const wrongPath = path.join(OUT, `${device.name}-keine-sicherung.txt`);
  fs.writeFileSync(wrongPath, 'Einkaufsliste: Brot, Milch');
  await page2.tap('#btn-menu');
  const [chooser2] = await Promise.all([page2.waitForEvent('filechooser'), page2.tap('#menu-load-file')]);
  await chooser2.setFiles(wrongPath);
  await sleep(200);
  check(
    !(await page2.isVisible('#dialog')) && (await toastText()).includes('ist kein Spielstand'),
    `Falsche Datei: Hinweis statt Rückfrage (${await toastText()})`,
  );
  check((await factory()).buildings === saved.buildings, 'Falsche Datei: Fabrik bleibt, wie sie ist');
  await shot2('22g-falsche-datei');

  check(errors.length === 0, `Keine Fehler in der Konsole${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await context.close();
}

async function runPortrait(browser, baseUrl) {
  console.log('\nhandy-hoch (390×844)');
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(baseUrl);
  await page.waitForFunction(() => window.__game);
  check(await page.isVisible('#rotate-overlay'), 'Hochformat zeigt „Bitte drehen“');
  await page.screenshot({ path: path.join(OUT, 'handy-hoch.png') });
  await context.close();
}

// v0.29.0: Schmales Handy quer (740 × 360): Auf so einem Bildschirm ragte der
// Reiter „Werkstatt“ über den Rand. Geprüft werden nur die Reiter – auf
// Level 1 (vier gesperrt) und Level 12 (alle offen, jeder einmal geöffnet).
async function runNarrowPhone(browser, baseUrl) {
  setDevice('handy-schmal');
  console.log('\nhandy-schmal (740×360)');
  const context = await browser.newContext({
    viewport: { width: 740, height: 360 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(baseUrl);
  await waitForGame(page);
  const tabsFit = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('.build-tab')]
        .filter((b) => {
          const r = b.getBoundingClientRect();
          return r.left < 0 || r.right > innerWidth + 0.5 || b.scrollWidth > b.clientWidth + 1;
        })
        .map((b) => b.dataset.tab),
    );
  await page.tap('#btn-build');
  await sleep(150);
  let outside = await tabsFit();
  check(outside.length === 0, `Level 1: alle 5 Reiter passen auf den Bildschirm${outside.length ? ' – ragt heraus: ' + outside.join(', ') : ''}`);
  const names1 = await page.evaluate(() => [...document.querySelectorAll('.build-tab-name')].filter((n) => n.offsetParent).map((n) => n.textContent));
  check(names1.join() === 'Holz', `Nur der geöffnete Reiter zeigt seinen Namen (${names1.join(', ')})`);
  await page.screenshot({ path: path.join(OUT, 'handy-schmal-level1.png') });
  await page.evaluate(() => {
    window.__game.state.shopLevel = 12;
    window.__game.saveNow();
  });
  await page.reload();
  await waitForGame(page);
  await page.tap('#btn-build');
  await sleep(150);
  for (const tab of ['holz', 'stein', 'eisen', 'kraeuter', 'werkstatt']) {
    await page.tap(`.build-tab[data-tab="${tab}"]`);
    await sleep(80);
    outside = await tabsFit();
    check(outside.length === 0, `Level 12, Reiter „${tab}“ offen: alle Reiter passen${outside.length ? ' – ragt heraus: ' + outside.join(', ') : ''}`);
  }
  await page.screenshot({ path: path.join(OUT, 'handy-schmal-level12-werkstatt.png') });
  await context.close();
}

module.exports = { runDevice, runPortrait, runNarrowPhone };
