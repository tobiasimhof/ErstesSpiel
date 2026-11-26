// Browser-Test, 3D-Teil: Start, Ladebildschirm, Modelle, Kamera, Häuser, Waren,
// Beete, Oberfläche, Belastungstest. Gestartet von smoke.cjs; ONLY=3d prüft nur
// diesen Teil (das Durchspielen bis Level 14 steht in fabrik.cjs).

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
  skipTutorial,
  readLetter,
  setDevice,
} = require('./helpers.cjs');

// v0.34.0: 3D-Test (Tobias, Chat 24) – Level 1 in der neuen Grafik; seit
// v0.54.0 das einzige Spiel. Spielt per Touch: Holzstamm einlegen, Band ziehen,
// Sägewerk bauen, antippen, Kamera drehen und zoomen, abreißen; seit v0.35.0
// auch Bereich markieren, verschieben, drehen und Fläche kaufen.
async function run3d(browser, baseUrl, device, expectedVersion) {
  setDevice(`${device.name}-3d`);
  console.log(`\n${device.name} – 3D-Ansicht`);
  const context = await browser.newContext({
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const shot = (name) => page.screenshot({ path: path.join(OUT, `${device.name}-${name}.png`) });
  const vp = device.viewport;

  // v0.54.0: Die 2D-Welt ist weg. Ein Spielstand der früheren 2D-Welt (unter
  // „erstesspiel-spielstand“, hier mit 4321 Gold) bleibt unberührt und wird
  // nicht geladen. Erst ein Spiel anlegen (der Name „Tester“ bleibt auf dem
  // Gerät gemerkt), dann seinen Spielstand als alte 2D-Fabrik ablegen und neu
  // beginnen.
  await page.goto(baseUrl);
  await waitForGame(page);
  await game(page, () => {
    window.__game.state.gold = 4321;
    window.__game.saveNow();
  });
  await page.tap('#btn-menu');
  await sleep(100);
  const menuBox = await page.locator('#menu').boundingBox();
  check(
    !(await page.isVisible('#menu-3d')) && !(await page.textContent('#menu')).includes('2D') && menuBox.y + menuBox.height <= vp.height,
    `Menü ☰ ohne Wechsel zur 2D-Welt, passt auf den Bildschirm (${Math.round(menuBox.y + menuBox.height)} ≤ ${vp.height})`,
  );
  // Die Spielstände auf einer Seite ohne Spiel tauschen (das Spiel speichert beim Verlassen)
  await page.goto(`${baseUrl}manifest.webmanifest`);
  const real = await page.evaluate(() => {
    localStorage.setItem('erstesspiel-spielstand', localStorage.getItem('erstesspiel-spielstand-3d-test'));
    localStorage.removeItem('erstesspiel-spielstand-3d-test');
    return localStorage.getItem('erstesspiel-spielstand');
  });
  check(JSON.parse(real).state.gold === 4321, 'Alter 2D-Spielstand mit 4321 Gold angelegt');
  // Ein alter Link auf die 2D-Welt öffnet einfach das Spiel – hier ohne Spielstand
  await page.goto(`${baseUrl}?ansicht=2d`);
  // v0.50.0 (Tobias, Chat 29): Ladebildschirm bei jedem Start – „ähnlich wie bei
  // ClashofClans“. Noch kein Spielstand: erster Start, also „Wie heißt du?“;
  // der Name vom Gerät steht schon im Feld.
  const firstLook = await page.evaluate(() => ({
    shown: !document.getElementById('loading').hidden,
    title: document.getElementById('loading-title').textContent,
    image: getComputedStyle(document.getElementById('loading')).backgroundImage,
  }));
  check(firstLook.shown && firstLook.title === 'Factory' && firstLook.image.includes('ladebild.jpg'), `Ladebildschirm beim Start: Titel und Bild aus der 3D-Welt (${firstLook.title})`);
  await page.waitForSelector('#loading-name:not([hidden])', { timeout: 30000 });
  await sleep(200);
  const askLook = await page.evaluate(() => ({
    title: document.querySelector('#loading-name h2').textContent,
    value: document.getElementById('name-input').value,
    bar: !document.getElementById('loading-progress').hidden,
    input: document.getElementById('name-input').getBoundingClientRect().bottom,
  }));
  check(
    askLook.title === '👋 Willkommen!' && askLook.value === 'Tester' && !askLook.bar && askLook.input < vp.height * 0.7,
    `Erster Start: „Willkommen! Wie heißt du?“ oben (Feld endet bei ${Math.round(askLook.input)} von ${vp.height}), der Name vom Gerät steht schon drin (${askLook.value})`,
  );
  await shot('3d-0a-name');
  await page.fill('#name-input', '   ');
  check(await page.isDisabled('#name-ok'), 'Ohne Namen geht es nicht los (Knopf aus)');
  await page.fill('#name-input', 'Tobias');
  check(!(await page.isDisabled('#name-ok')), 'Mit Namen ist der Knopf „▶ Los geht\'s“ an');
  await page.tap('#name-ok');
  await page.waitForFunction(() => document.getElementById('loading').hidden, null, { timeout: 10000 });
  // v0.52.0: Hildes Einführung prüft tests/browser/einfuehrung.cjs – hier gleich beenden
  await skipTutorial(page);
  const named = await game(page, () => ({ name: window.__game.state.playerName, stored: JSON.parse(localStorage.getItem('erstesspiel-spielstand-3d-test')).state.playerName }));
  check(named.name === 'Tobias' && named.stored === 'Tobias', `Der Name steht im Spielstand (${JSON.stringify(named)})`);
  await sleep(1500);
  const start = await game(page, () => ({
    level: window.__game.state.shopLevel,
    gold: window.__game.state.gold,
    types: window.__game.state.buildings.map((b) => b.type).sort(),
    counts: window.__game.view3d.counts(),
    models: window.__game.view3d.models(),
    loading: !document.getElementById('catchup').hidden,
    version: document.getElementById('menu-version').textContent,
    turn: !document.getElementById('turn-buttons').hidden,
    fps: !document.getElementById('hud-fps').hidden,
  }));
  check(
    start.level === 1 && start.gold === 500 && JSON.stringify(start.types) === '["holzfaeller","versandportal"]',
    `Eigener Spielstand ab Level 1: 500 Gold, Holzfällerlager und Versandportal (${JSON.stringify(start)})`,
  );
  // v0.37.0: 33 Modelle (die nur von der Grafik-Probe gebrauchten sind entfernt)
  // v0.40.0: keine Bäume mehr auf der Welt (sie ragten aus Häusern, Tobias, Chat 25)
  check((await game(page, () => window.__game.view3d.treesInWorld())) === 0, 'Bäume und Felsen stehen nur außerhalb der Welt');
  check(start.models >= 30 && !start.loading && start.counts.buildings === 2, `Kenneys Modelle geladen (${start.models}), beide Gebäude in 3D`);
  check(start.version === `Version ${expectedVersion}` && start.turn, `Versionsnummer im Menü, Dreh-Knöpfe ⟲ ⟳ sichtbar (${start.version})`);
  // v0.53.0: Leiste oben aufgeräumt – Bilder/s nur im Testmodus, Vollbild und Version im Menü
  const top = await game(page, () => [...document.querySelectorAll('#hud > *:not(.menu)')].filter((el) => !el.hidden).map((el) => el.id || el.className));
  check(
    !start.fps && !(await page.isVisible('#hud-speed')) && JSON.stringify(top) === '["hud-item","btn-level","hud-spacer","btn-menu"]',
    `Oben nur Gold, Laden-Level und ☰ – ohne Bilder/s, Version und Vollbild (${JSON.stringify(top)})`,
  );
  await shot('3d-1-start');

  // Holzstamm einlegen (Holzfällerlager antippen)
  const ids = await game(page, () => Object.fromEntries(window.__game.state.buildings.map((b) => [b.type, b.id])));
  const at = (id) => game(page, (i) => window.__game.view3d.building(i), id);
  let pos = await at(ids.holzfaeller);
  await page.touchscreen.tap(pos.x, pos.y);
  await sleep(250);
  check((await page.textContent('#info-title')).includes('Holzfällerlager'), 'Holzfällerlager antippen öffnet sein Infofenster');
  await infoButton(page, 'refill').tap();
  await sleep(150);
  check(await game(page, (id) => window.__game.state.buildings.find((b) => b.id === id).prod.loaded, ids.holzfaeller), 'Auffüllen legt einen Holzstamm ein');
  await page.tap('#info-close');

  // Band ziehen: vom Ausgang des Holzfällerlagers zum Versandportal
  const tile = (x, y) => game(page, ([a, b]) => window.__game.view3d.tile(a, b), [x, y]);
  const hf = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'holzfaeller'));
  const portal = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'versandportal'));
  const route = [
    [hf.x + 2, hf.y],
    [hf.x + 2, portal.y],
    [portal.x - 1, portal.y],
  ];
  await page.tap('#btn-build');
  await sleep(150);
  await page.locator('.build-item[data-tool="belt"]').tap();
  await sleep(150);
  const pts = [];
  for (const [x, y] of route) pts.push(await tile(x, y));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...pts[0], id: 7 }] });
  let previewSeen = 0;
  for (let i = 1; i < pts.length; i++) {
    for (let st = 1; st <= 8; st++) {
      const t = st / 8;
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t, id: 7 }],
      });
    }
    await sleep(60);
    previewSeen = Math.max(previewSeen, await game(page, () => window.__game.view3d.overlayCount()));
  }
  await shot('3d-2-band-vorschau');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(150);
  const beltCount = await game(page, () => Object.keys(window.__game.state.belts).length);
  const expected = Math.abs(portal.y - hf.y) + (portal.x - 1 - (hf.x + 2)) + 1;
  check(previewSeen > 0, `Beim Ziehen zeigt die Vorschau Felder und Pfeile (${previewSeen} Teile)`);
  check(beltCount === expected, `Mit einem Finger ein Band zum Portal gezogen (${beltCount} von ${expected} Feldern)`);
  await page.tap('#tool-confirm');
  await sleep(100);
  const before = await game(page, () => window.__game.state.storage.holzblock ?? 0);
  await game(page, () => window.__game.simulate(60));
  await sleep(400);
  const after3d = await game(page, () => ({ blocks: window.__game.state.storage.holzblock ?? 0, counts: window.__game.view3d.counts() }));
  check(after3d.blocks > before && after3d.counts.belts === beltCount, `Holzblöcke fahren übers Band durchs Tor ins Laden-Lager (${before} → ${after3d.blocks}), ${after3d.counts.belts} Bänder in 3D`);
  const sh1 = await game(page, (id) => window.__game.view3d.shimmer(id), ids.versandportal);
  await sleep(500);
  const sh2 = await game(page, (id) => window.__game.view3d.shimmer(id), ids.versandportal);
  check(sh1 !== null && sh1 !== sh2, `Das Tor des Versandportals schimmert (${sh1} → ${sh2})`);
  await shot('3d-3-band-laeuft');

  // Sägewerk bauen: Vorschau als halbdurchsichtiges Haus
  await game(page, () => {
    window.__game.state.storage.holzblock = 120;
  });
  if (await page.isVisible('#btn-build')) await page.tap('#btn-build');
  await sleep(150);
  await tapBuild(page, 'saegewerk');
  await sleep(250);
  const ghost = await game(page, () => ({ ui: window.__game.ui.ghost, shown: window.__game.view3d.hasGhost() }));
  check(ghost.ui && ghost.shown && ghost.ui.valid, `Vorschau des Sägewerks steht auf einem freien Platz (${JSON.stringify(ghost.ui)})`);
  await shot('3d-4-vorschau');
  // Vorschau mit dem Finger verschieben
  const g0 = await tile(ghost.ui.x + 1, ghost.ui.y + 1);
  const g1 = await tile(ghost.ui.x - 1, ghost.ui.y + 1);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...g0, id: 8 }] });
  for (let st = 1; st <= 6; st++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: g0.x + ((g1.x - g0.x) * st) / 6, y: g0.y + ((g1.y - g0.y) * st) / 6, id: 8 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(150);
  const moved = await game(page, () => window.__game.ui.ghost);
  check(moved.x === ghost.ui.x - 2 && moved.y === ghost.ui.y, `Vorschau folgt dem Finger (${ghost.ui.x},${ghost.ui.y} → ${moved.x},${moved.y})`);
  await page.tap('#tool-confirm');
  await sleep(200);
  if (await page.isVisible('#build-close')) await page.tap('#build-close');
  const saw = await game(page, () => window.__game.state.buildings.find((b) => b.type === 'saegewerk'));
  check(Boolean(saw), 'Sägewerk gebaut');
  await sleep(300);
  pos = await at(saw.id);
  await page.touchscreen.tap(pos.x, pos.y);
  await sleep(300);
  const sel = await game(page, () => ({ sel: window.__game.ui.selected, overlay: window.__game.view3d.overlayCount() }));
  check(
    (await page.textContent('#info-title')).includes('Sägewerk') && sel.sel?.id === saw.id && sel.overlay > 0,
    'Sägewerk antippen: Infofenster und gelber Rahmen am Boden',
  );
  check((await game(page, (id) => window.__game.view3d.sign(id), saw.id))?.includes('holzplatte'), 'Schild über dem Sägewerk zeigt die Holzplatte');
  await shot('3d-5-infofenster');
  await page.tap('#info-close');

  // Kamera: Knöpfe ⟲ ⟳, Tasten Q/E, zwei Finger drehen und zoomen, ein Finger verschiebt
  const yaw0 = await game(page, () => window.__game.view3d.yaw());
  await page.tap('#btn-turn-right');
  await page.waitForFunction(() => !window.__game.view3d.isTurning(), null, { timeout: 3000 }).catch(() => {});
  const yaw1 = await game(page, () => window.__game.view3d.yaw());
  check(Math.abs(yaw1 - yaw0 - Math.PI / 4) < 0.01, `⟳ dreht die Kamera um 45° (${yaw0.toFixed(2)} → ${yaw1.toFixed(2)})`);
  await shot('3d-6-gedreht');
  await page.keyboard.press('q');
  await page.waitForFunction(() => !window.__game.view3d.isTurning(), null, { timeout: 3000 }).catch(() => {});
  const yaw2 = await game(page, () => window.__game.view3d.yaw());
  check(Math.abs(yaw2 - yaw0) < 0.01, `Taste Q dreht zurück (${yaw2.toFixed(2)})`);
  const cx = vp.width * 0.45;
  const cy = vp.height * 0.5;
  const twoFinger = async (from, to) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from[0], id: 1 }, { ...from[1], id: 2 }] });
    for (let st = 1; st <= 8; st++) {
      const t = st / 8;
      const lerp = (a, b) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ ...lerp(from[0], to[0]), id: 1 }, { ...lerp(from[1], to[1]), id: 2 }],
      });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(150);
  };
  const r = 80;
  await twoFinger(
    [{ x: cx - r, y: cy }, { x: cx + r, y: cy }],
    [{ x: cx - r * Math.cos(0.5), y: cy - r * Math.sin(0.5) }, { x: cx + r * Math.cos(0.5), y: cy + r * Math.sin(0.5) }],
  );
  const yaw3 = await game(page, () => window.__game.view3d.yaw());
  check(Math.abs(yaw3 - yaw2 - 0.5) < 0.05, `Zwei Finger umeinander drehen die Kamera mit (${yaw2.toFixed(2)} → ${yaw3.toFixed(2)})`);
  const d0 = await game(page, () => window.__game.view3d.distance());
  await twoFinger(
    [{ x: cx - 40, y: cy }, { x: cx + 40, y: cy }],
    [{ x: cx - 120, y: cy }, { x: cx + 120, y: cy }],
  );
  const d1 = await game(page, () => window.__game.view3d.distance());
  check(d1 < d0 * 0.6, `Zwei Finger auseinander zoomen heran (Abstand ${d0.toFixed(1)} → ${d1.toFixed(1)})`);
  await shot('3d-7-nah');
  const t0 = await game(page, () => window.__game.view3d.target());
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 3 }] });
  for (let st = 1; st <= 8; st++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - st * 12, y: cy - st * 5, id: 3 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(150);
  const t1 = await game(page, () => window.__game.view3d.target());
  check(JSON.stringify(t0) !== JSON.stringify(t1), `Ein Finger verschiebt die Karte (${t0.map((v) => v.toFixed(1))} → ${t1.map((v) => v.toFixed(1))})`);
  // wieder weiter weg, damit der Rest im Bild ist
  await twoFinger(
    [{ x: cx - 120, y: cy }, { x: cx + 120, y: cy }],
    [{ x: cx - 40, y: cy }, { x: cx + 40, y: cy }],
  );

  // Abreißen: ein Band-Feld antippen
  await page.tap('#btn-build');
  await sleep(150);
  await page.locator('.build-item[data-tool="erase"]').tap();
  await sleep(150);
  const [ex, ey] = route[2];
  const ep = await tile(ex, ey);
  await page.touchscreen.tap(ep.x, ep.y);
  await sleep(200);
  check(!(await game(page, (k) => Boolean(window.__game.state.belts[k]), `${ex},${ey}`)), 'Abreißen: ein Band-Feld antippen entfernt es');
  await page.tap('#tool-confirm');
  await sleep(150);

  // v0.41.0 (Tobias): Wischen lässt die Bauleiste offen, Antippen der Karte schließt sie
  check(await page.isVisible('#build-bar'), 'Nach „✓ Fertig“ ist die Bauleiste wieder offen');
  const freeTile = await game(page, () => {
    const s = window.__game.state;
    const [tx, tz] = window.__game.view3d.target();
    for (let r = 0; r < 8; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const x = Math.round(tx) + dx;
          const y = Math.round(tz) + dy;
          const owned = x >= s.plot.x && x < s.plot.x + s.plot.width && y >= s.plot.y && y < s.plot.y + s.plot.height;
          const used = s.belts[`${x},${y}`] || s.buildings.some((b) => x >= b.x && x < b.x + 2 && y >= b.y && y < b.y + 2);
          if (owned && !used) return { x, y };
        }
      }
    }
    return null;
  });
  const fp = await tile(freeTile.x, freeTile.y);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...fp, id: 8 }] });
  for (let st = 1; st <= 6; st++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: fp.x + st * 10, y: fp.y, id: 8 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(150);
  check((await game(page, () => window.__game.ui.mode)) === 'menu' && (await page.isVisible('#build-bar')), 'Wischen über die Karte lässt die Bauleiste offen');
  const fp2 = await tile(freeTile.x, freeTile.y);
  await page.touchscreen.tap(fp2.x, fp2.y);
  await sleep(200);
  check(
    (await game(page, () => window.__game.ui.mode)) === 'normal' && !(await page.isVisible('#build-bar')) && (await page.isVisible('#btn-build')),
    'Antippen der Karte schließt die Bauleiste (unten wieder „Laden“ und „Bauen“)',
  );

  // v0.35.0: Bereich markieren, verschieben und drehen – wie im 2D-Spiel
  const areaInfo = () =>
    game(page, () => {
      const a = window.__game.ui.area;
      const g = a?.ghost;
      return {
        mode: window.__game.ui.mode,
        buildings: a?.sel.buildings.length ?? 0,
        belts: a?.sel.belts.length ?? 0,
        ghost: g ? { x: g.x, y: g.y, turns: g.turns, valid: g.plan?.valid, w: g.plan?.width, h: g.plan?.height } : null,
        counts: window.__game.view3d.areaCounts(),
      };
    });
  const sawNow = () => game(page, () => ({ ...window.__game.state.buildings.find((b) => b.type === 'saegewerk') }));
  const saw0 = await sawNow();
  await game(page, (b) => {
    const c = window.__game.camera;
    c.distance = 18;
    c.target.set(b.x + 1, 0, b.y + 2.5);
    c.update();
  }, saw0);
  await sleep(200);
  if (await page.isVisible('#btn-build')) await page.tap('#btn-build');
  await sleep(150);
  await page.locator('.build-item[data-tool="area"]').tap();
  await sleep(150);
  check((await areaInfo()).mode === 'area', 'Werkzeug „Verschieben“ öffnet „Bereich markieren“');
  const ra = await tile(saw0.x, saw0.y);
  const rb = await tile(saw0.x + 1, saw0.y + 1);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...ra, id: 9 }] });
  for (let st = 1; st <= 6; st++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: ra.x + ((rb.x - ra.x) * st) / 6, y: ra.y + ((rb.y - ra.y) * st) / 6, id: 9 }] });
  }
  await sleep(80);
  const dragging = await areaInfo();
  await shot('3d-8-bereich-markieren');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(150);
  let ai = await areaInfo();
  check(ai.buildings === 1 && dragging.counts.marks > 0 && ai.counts.marks > 0, `Rechteck ziehen markiert das Sägewerk, es leuchtet gelb (${ai.buildings} Gebäude, ${ai.counts.marks} Markierungen)`);
  await page.tap('#tool-area-move');
  await sleep(200);
  ai = await areaInfo();
  check(ai.mode === 'areaMove' && ai.ghost?.valid && ai.counts.ghost > 0 && ai.counts.tiles > 0, `Verschieben: Vorschau mit grünen Feldern (${JSON.stringify(ai.counts)})`);
  await page.keyboard.press('r');
  await sleep(150);
  ai = await areaInfo();
  check(ai.ghost.turns === 1, 'Taste R dreht den Bereich');
  const ga = await tile(ai.ghost.x, ai.ghost.y);
  const gb = await tile(ai.ghost.x, ai.ghost.y + 3);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...ga, id: 10 }] });
  for (let st = 1; st <= 6; st++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: ga.x + ((gb.x - ga.x) * st) / 6, y: ga.y + ((gb.y - ga.y) * st) / 6, id: 10 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(200);
  const moved3d = await areaInfo();
  check(moved3d.ghost.y === ai.ghost.y + 3 && moved3d.ghost.valid, `Vorschau mit dem Finger verschoben (${ai.ghost.x},${ai.ghost.y} → ${moved3d.ghost.x},${moved3d.ghost.y})`);
  await shot('3d-9-bereich-verschieben');
  await page.tap('#tool-confirm');
  await sleep(200);
  const saw1 = await sawNow();
  check(
    saw1.id === saw0.id && saw1.y === saw0.y + 3 && saw1.rot === (saw0.rot + 1) % 4,
    `Sägewerk gedreht und umgesetzt (${saw0.x},${saw0.y} → ${saw1.x},${saw1.y})`,
  );

  // v0.41.0: Bereich kopieren – Stempel, alles oder nichts
  const saws = () => game(page, () => window.__game.state.buildings.filter((b) => b.type === 'saegewerk').length);
  const saws0 = await saws();
  await game(page, () => {
    window.__game.state.storage.holzblock = 100;
  });
  check(await page.isVisible('#tool-area-copy'), 'Markiert: Knopf „📋 Kopieren“ ist da');
  await page.tap('#tool-area-copy');
  await sleep(250);
  let ci = await areaInfo();
  const copyText = await page.textContent('#tool-text');
  check(
    ci.mode === 'areaCopy' && ci.ghost?.valid && ci.counts.ghost > 0 && ci.counts.marks > 0 && (await page.textContent('#tool-cancel')).includes('Fertig'),
    `Kopieren: Vorschau neben dem Original, das markiert stehen bleibt (${JSON.stringify(ci.counts)})`,
  );
  check(copyText.includes('40 Holzblöcke'), `Kopieren zeigt die Kosten („${copyText}“)`);
  check(await game(page, (id) => window.__game.view3d.buildingVisible(id), saw0.id), 'Das Original bleibt beim Kopieren zu sehen');
  await shot('3d-9b-bereich-kopieren');
  const firstSpot = ci.ghost;
  // erst mit zu wenig Holzblöcken: nichts wird gebaut, eine Meldung sagt, was fehlt
  await game(page, () => {
    window.__game.state.storage.holzblock = 10;
  });
  await page.tap('#tool-confirm');
  await sleep(250);
  const toastText = (await page.textContent('#toast')) ?? '';
  check((await saws()) === saws0 && toastText.includes('fehlen') && toastText.includes('30 Holzblöcke'), `Zu wenig Waren: nichts gebaut, Meldung („${toastText}“)`);
  check((await page.textContent('#tool-text')).includes('Es fehlen'), 'Die Leiste sagt, was fehlt');
  await game(page, () => {
    window.__game.state.storage.holzblock = 100;
  });
  await page.tap('#tool-confirm');
  await sleep(250);
  ci = await areaInfo();
  check((await saws()) === saws0 + 1 && ci.mode === 'areaCopy', `„✓ Hier bauen“ baut die Kopie (${saws0} → ${await saws()} Sägewerke)`);
  check(
    ci.ghost.x - firstSpot.x === firstSpot.x - saw1.x && ci.ghost.y - firstSpot.y === firstSpot.y - saw1.y,
    `Stempel: die nächste Kopie wartet einen Schritt weiter (${firstSpot.x},${firstSpot.y} → ${ci.ghost.x},${ci.ghost.y})`,
  );
  await page.tap('#tool-cancel');
  await sleep(200);
  check((await areaInfo()).mode === 'area', '„✕ Fertig“ beendet das Kopieren, der Bereich bleibt markiert');
  await page.tap('#tool-confirm');
  await sleep(150);
  if (await page.isVisible('#build-close')) await page.tap('#build-close');
  await sleep(150);

  // v0.35.0: Fläche kaufen – Schilder an den Seiten, antippen, kaufen
  await game(page, () => {
    window.__game.state.gold = 500;
    const c = window.__game.camera;
    const p = window.__game.state.plot;
    c.distance = 34;
    c.target.set(p.x + p.width / 2, 0, p.y + p.height / 2);
    c.update();
  });
  await sleep(300);
  const signs = await game(page, () => window.__game.view3d.landSigns());
  check(signs.length === 4, `An allen vier Seiten ein Schild „＋ 170 🪙“ (${signs.map((x) => x.side).join(', ')})`);
  await shot('3d-10-flaeche-schilder');
  const plot0 = await game(page, () => ({ ...window.__game.state.plot }));
  const sp = await game(page, () => window.__game.view3d.landSign('W'));
  await page.touchscreen.tap(sp.x, sp.y);
  await sleep(250);
  check((await page.textContent('#info-title')) === 'Fläche kaufen', 'Schild links antippen bietet Fläche an');
  check((await game(page, () => window.__game.view3d.overlayCount())) > 0, 'Der Streifen leuchtet gelb');
  await shot('3d-11-flaeche-gewaehlt');
  await page.locator('#info-actions button', { hasText: 'Kaufen' }).tap();
  await sleep(300);
  const plot1 = await game(page, () => ({ plot: { ...window.__game.state.plot }, gold: window.__game.state.gold }));
  check(plot1.plot.x === plot0.x - 4 && plot1.plot.width === plot0.width + 4 && plot1.gold === 330, `Fläche gekauft (${plot0.width} → ${plot1.plot.width} Felder breit, 500 → ${plot1.gold} Gold)`);
  if (await page.isVisible('#info-close')) await page.tap('#info-close');

  // v0.42.0/v0.43.0: eigene Häuser für Level 2–12 (Tobias, Chat 26: Möglichkeit B) – im neuen
  // Streifen links (4 × 14 Felder), je Haus ein Teil, das sich beim Arbeiten bewegt oder leuchtet
  const houseTypes = ['steinbruch', 'steinmetz', 'schmelzhuette', 'zimmerei', 'feinschmiede', 'schlosserei', 'flachsbreche', 'webstube', 'kraeuterstube', 'schreibstube', 'uhrmacherei', 'apotheke'];
  const houseIds = await game(page, (types) => {
    const p = window.__game.state.plot;
    return types.map((type, i) => window.__game.place(type, p.x + (i % 2) * 2, p.y + (i < 6 ? 0 : 7) + Math.floor((i % 6) / 2) * 2, 0));
  }, houseTypes);
  check(houseIds.every((id) => id !== null), `Zwölf eigene Häuser gesetzt (${houseIds.join(', ')})`);
  await game(page, (ids) => {
    const raw = { steinbruch: 'felsbrocken', schmelzhuette: 'eisenerz', flachsbreche: 'flachspflanze' };
    for (const id of ids) {
      const b = window.__game.state.buildings.find((item) => item.id === id);
      if (raw[b.type]) Object.assign(b.prod, { loaded: true, input: raw[b.type], remaining: 200, timer: 0 });
      else Object.assign(b.prod, { busy: true, timer: 0 });
    }
    const c = window.__game.camera;
    const p = window.__game.state.plot;
    c.distance = 17;
    c.target.set(p.x + 2, 0, p.y + 6.5);
    c.update();
  }, houseIds);
  await sleep(1500);
  const motions = await game(page, (ids) => ids.map((id) => window.__game.view3d.motion(id)), houseIds);
  const want = {
    steinbruch: ['swing'],
    steinmetz: ['dustSpot'],
    schmelzhuette: ['chimneyTop', 'glow'],
    zimmerei: ['spin'],
    feinschmiede: ['spin'],
    schlosserei: ['chimneyTop', 'glow'],
    flachsbreche: ['spin'],
    webstube: ['sway'],
    kraeuterstube: ['chimneyTop'],
    schreibstube: ['glow'],
    uhrmacherei: ['spin'],
    apotheke: ['glow'],
  };
  houseTypes.forEach((type, i) => {
    const m = motions[i];
    const moving = ['spin', 'swing', 'sway'].some((k) => want[type].includes(k)) ? m.sum > 0 : true;
    check(Boolean(m) && want[type].every((k) => m.kinds.includes(k)) && moving, `${type}: eigenes Haus, beim Arbeiten ${want[type].join(' + ')} (${JSON.stringify(m)})`);
  });
  await shot('3d-11b-neue-haeuser');

  // v0.55.0: Zauberkessel (Level 15) – Turm, Herd und Eisenkessel; beim Brauen
  // glühen Feuer und Trank, Dampf steigt auf
  const kesselId = await game(page, () => {
    const g = window.__game;
    const p = g.state.plot;
    for (let y = p.y; y < p.y + p.height - 1; y++) {
      for (let x = p.x + 4; x < p.x + p.width - 1; x++) {
        if (![0, 1].every((dx) => [0, 1].every((dy) => g.isFree(x + dx, y + dy)))) continue;
        const id = g.place('zauberkessel', x, y, 0);
        if (id === null) continue;
        const b = g.state.buildings.find((item) => item.id === id);
        Object.assign(b.prod, { busy: true, timer: 0, fuel: 50 });
        g.camera.distance = 9;
        g.camera.target.set(x + 1, 0, y + 1);
        g.camera.update();
        return id;
      }
    }
    return null;
  });
  await sleep(1200);
  const kesselMotion = kesselId === null ? null : await game(page, (id) => window.__game.view3d.motion(id), kesselId);
  check(
    Boolean(kesselMotion) && ['chimneyTop', 'glow'].every((k) => kesselMotion.kinds.includes(k)),
    `Zauberkessel: eigenes Haus, beim Brauen Dampf + Glühen (${JSON.stringify(kesselMotion)})`,
  );
  await shot('3d-11c-zauberkessel');

  // v0.57.0: Kräutermühle (Level 16) – Steinhaus und Kollergang; beim Mahlen
  // läuft der Mahlstein im Kreis und Staub steigt auf
  const muehleId = await game(page, () => {
    const g = window.__game;
    const p = g.state.plot;
    for (let y = p.y; y < p.y + p.height - 1; y++) {
      for (let x = p.x + 4; x < p.x + p.width - 1; x++) {
        if (![0, 1].every((dx) => [0, 1].every((dy) => g.isFree(x + dx, y + dy)))) continue;
        const id = g.place('kraeutermuehle', x, y, 0);
        if (id === null) continue;
        const b = g.state.buildings.find((item) => item.id === id);
        Object.assign(b.prod, { busy: true, timer: 0 });
        g.camera.distance = 9;
        g.camera.target.set(x + 1, 0, y + 1);
        g.camera.update();
        return id;
      }
    }
    return null;
  });
  await sleep(1200);
  const muehleMotion = muehleId === null ? null : await game(page, (id) => window.__game.view3d.motion(id), muehleId);
  check(
    Boolean(muehleMotion) && ['spin', 'dustSpot'].every((k) => muehleMotion.kinds.includes(k)) && muehleMotion.sum > 0,
    `Kräutermühle: eigenes Haus, beim Mahlen läuft der Mahlstein und staubt (${JSON.stringify(muehleMotion)})`,
  );
  await shot('3d-11c-kraeutermuehle');

  // v0.46.0: Waren auf dem Band mit eigenem Aussehen (Tobias, Chat 27) – alle Waren
  // nebeneinander auf Bändern, je Ware eine eigene Form, nicht größer als ein Feld
  const goodsArea = await game(page, async () => {
    const { ITEMS } = await import('./src/core/data/items.js');
    const types = Object.keys(ITEMS).filter((t) => !ITEMS[t].raw && ITEMS[t].price);
    const g = window.__game;
    const p = g.state.plot;
    const cols = 8;
    const rows = Math.ceil(types.length / cols);
    for (let y0 = p.y; y0 + rows <= p.y + p.height; y0++) {
      for (let x0 = p.x; x0 + cols <= p.x + p.width; x0++) {
        let free = true;
        for (let i = 0; i < cols * rows && free; i++) free = g.isFree(x0 + (i % cols), y0 + Math.floor(i / cols));
        if (!free) continue;
        types.forEach((type, i) => {
          g.state.belts[`${x0 + (i % cols)},${y0 + Math.floor(i / cols)}`] = { outs: ['E'], item: { type, progress: 1, from: 'W' } };
        });
        g.camera.distance = 9;
        g.camera.target.set(x0 + cols / 2, 0, y0 + rows / 2);
        g.camera.update();
        g.simulate(0);
        return { x0, y0, cols, rows, types };
      }
    }
    return null;
  });
  check(Boolean(goodsArea), `Freie Fläche für ein Band mit allen Waren gefunden (${goodsArea ? `${goodsArea.x0},${goodsArea.y0}` : 'keine'})`);
  if (goodsArea) {
    await sleep(1500);
    const shapes = await game(page, () => window.__game.view3d.itemShapes());
    const byType = new Map(shapes.map((s) => [s.type, s]));
    const missing = goodsArea.types.filter((t) => !byType.has(t));
    check(goodsArea.types.length === 46 && missing.length === 0, `Alle ${goodsArea.types.length} Waren liegen auf dem Band und haben eine Form (fehlt: ${missing.join(', ') || '–'})`);
    const tooBig = shapes.filter((s) => s.size[0] > 0.62 || s.size[2] > 0.62 || s.size[1] > 0.42).map((s) => `${s.type} ${s.size.join('×')}`);
    check(tooBig.length === 0, `Jede Ware passt aufs Band: höchstens 0,62 breit und 0,42 hoch (${tooBig.join(', ') || 'alle passen'})`);
    const heavy = shapes.filter((s) => s.triangles > 900).map((s) => `${s.type} ${s.triangles}`);
    check(heavy.length === 0, `Jede Ware hat höchstens 900 Dreiecke (${heavy.join(', ') || `meist ${Math.max(...shapes.map((s) => s.triangles))}`})`);
    await shot('3d-11c-waren');
    await game(page, (area) => {
      const g = window.__game;
      area.types.forEach((type, i) => delete g.state.belts[`${area.x0 + (i % area.cols)},${area.y0 + Math.floor(i / area.cols)}`]);
      g.simulate(0);
    }, goodsArea);
  }

  // v0.47.0 (Tobias, Chat 28: „diese Kräuter sehen alle gleich aus“): Im Beet
  // wachsen die Pflanzen sichtbar in ihrer eigenen Form (Keimling, klein,
  // Knospen, reif); die Erntebank hat Knöpfe mit großem Bild und Namen, das
  // Infofenster einen Rahmen aus Kenneys UI Pack Adventure.
  const shopLevelBefore = await game(page, () => window.__game.state.shopLevel);
  const beds = await game(page, () => {
    const g = window.__game;
    const p = g.state.plot;
    const seeds = ['leinsamen', 'ringelblumensamen', 'schafgarbensamen', 'kamillensamen'];
    const ids = [];
    for (let y = p.y; y + 2 <= p.y + p.height && ids.length < 4; y += 2) {
      for (let x = p.x + 4; x + 2 <= p.x + p.width && ids.length < 4; x += 2) {
        if (![0, 1, 2, 3].every((i) => g.isFree(x + (i % 2), y + Math.floor(i / 2)))) continue;
        const id = g.place('beet', x, y, 0);
        if (id === null) continue;
        Object.assign(g.state.buildings.find((b) => b.id === id).prod, { crop: seeds[ids.length], timer: 0 });
        ids.push(id);
      }
    }
    const first = g.state.buildings.find((b) => b.id === ids[0]);
    const last = g.state.buildings.find((b) => b.id === ids[ids.length - 1]);
    if (first && last) {
      const x0 = Math.min(first.x, last.x);
      const y0 = Math.min(first.y, last.y);
      g.camera.fitRect({ x: x0, y: y0, width: Math.max(first.x, last.x) + 2 - x0, height: Math.max(first.y, last.y) + 2 - y0 });
    }
    g.simulate(0);
    return ids;
  });
  check(beds.length === 4, `Vier Beete gesetzt (${beds.join(', ')})`);
  const plants = ['flachspflanze', 'ringelblume', 'schafgarbe', 'kamille'];
  // Die Beete werden etwa 8-mal pro Sekunde geprüft; im Test-Browser laufen nur
  // wenige Bilder pro Sekunde – deshalb auf die erwartete Stufe warten.
  const cropsAt = async (stage) => {
    const want = plants.map((t) => `${t}|${stage}`).join();
    await page
      .waitForFunction(([ids, w]) => ids.map((id) => window.__game.view3d.crop(id)).join() === w, [beds, want], { timeout: 8000 })
      .catch(() => {});
    return game(page, (ids) => ids.map((id) => window.__game.view3d.crop(id)), beds);
  };
  const seedlings = await cropsAt(0);
  check(seedlings.join() === plants.map((t) => `${t}|0`).join(), `Frisch gesät: Keimlinge im Beet (${seedlings.join(', ')})`);
  await game(page, () => window.__game.simulate(1800 * 0.65));
  const buds = await cropsAt(2);
  check(buds.join() === plants.map((t) => `${t}|2`).join(), `Nach 65 % der Zeit: große Pflanzen mit Knospen (${buds.join(', ')})`);
  await game(page, () => window.__game.simulate(1800));
  const ripe = await cropsAt(3);
  check(ripe.join() === plants.map((t) => `${t}|3`).join(), `Reif: jede Pflanze blüht in ihrer Form (${ripe.join(', ')})`);
  await shot('3d-11d-beete');
  // Erntebank: alle vier Pflanzen freigeschaltet (Level 13), Knöpfe mit Bild und Namen
  const bench = houseIds[houseTypes.indexOf('flachsbreche')];
  await game(page, (id) => {
    const g = window.__game;
    g.state.shopLevel = 13;
    const b = g.state.buildings.find((item) => item.id === id);
    g.camera.fitRect({ x: b.x - 3, y: b.y - 2, width: 8, height: 6 });
    g.simulate(0);
  }, bench);
  await sleep(300);
  const benchAt = await game(page, (id) => window.__game.view3d.building(id), bench);
  await page.touchscreen.tap(benchAt.x, benchAt.y);
  await sleep(400);
  const herbButtons = await page.evaluate(() =>
    [...document.querySelectorAll('#info-panel button.herb')].filter((b) => !b.hidden).map((b) => ({
      text: b.textContent.trim(),
      icon: b.querySelector('canvas.item-icon')?.dataset.size,
    })),
  );
  check(
    herbButtons.length === 4 && herbButtons.every((b) => b.icon === '34') && ['Flachspflanze', 'Ringelblume', 'Schafgarbe', 'Kamille'].every((n, i) => herbButtons[i].text.includes(n)),
    `Erntebank: vier Knöpfe mit großem Bild und Namen (${herbButtons.map((b) => b.text).join(', ')})`,
  );
  const frame = await page.evaluate(() => getComputedStyle(document.getElementById('info-panel')).borderImageSource);
  check(frame.includes('panel_brown_corners_a'), `Infofenster mit Kenneys Holzrahmen (${frame.slice(-40)})`);
  const benchFit = await infoFits(page);
  check(benchFit.length === 0, `Erntebank: nichts ragt aus dem Fenster (${benchFit.join(', ') || 'alles passt'})`);
  await shot('3d-11e-erntebank');
  await page.tap('#info-close');
  await game(page, ([ids, level]) => {
    const g = window.__game;
    g.state.buildings = g.state.buildings.filter((b) => !ids.includes(b.id));
    g.state.shopLevel = level;
    g.simulate(0);
  }, [beds, shopLevelBefore]);

  // v0.48.0 (Tobias, Chat 28): große Fenster und Menü im Kenney-Stil, der
  // gewählte Reiter dunkles Holz; Menü ☰ → „🔊 Audio“ – Klänge beim ersten
  // Start aus, Einstellung im Browser des Geräts (nicht im Spielstand)
  await page.tap('#btn-shop');
  await sleep(300);
  // v0.50.0: „⚖️ Tobias' Laden“ mit ✏️ zum Ändern
  check((await page.textContent('#modal-content h2')).startsWith("⚖️ Tobias' Laden"), `Laden-Fenster mit Namen (${await page.textContent('#modal-content h2')})`);
  await page.tap('#shop-rename');
  await sleep(250);
  check((await page.textContent('#modal-content h2')) === '✏️ Name ändern' && (await page.inputValue('#name-input')) === 'Tobias', '✏️ öffnet „Name ändern“ mit dem jetzigen Namen');
  await page.fill('#name-input', 'Anna');
  await page.keyboard.press('Enter');
  await sleep(300);
  check(
    (await page.textContent('#modal-content h2')).startsWith('⚖️ Annas Laden') && (await game(page, () => window.__game.state.playerName)) === 'Anna',
    `Enter speichert, zurück im Laden: „${(await page.textContent('#modal-content h2')).replace('✏️', '').trim()}“`,
  );
  await shot('3d-0c-laden-name');
  await page.tap('#shop-rename');
  await sleep(250);
  await page.fill('#name-input', 'Tobias');
  await page.tap('#name-ok');
  await sleep(300);
  const shopLook = await page.evaluate(() => ({
    frame: getComputedStyle(document.querySelector('#modal .modal-box')).borderImageSource,
    tab: getComputedStyle(document.querySelector('#modal .tabs .tab.active')).borderImageSource,
    other: getComputedStyle(document.querySelector('#modal .tabs .tab:not(.active)')).borderImageSource,
  }));
  check(
    shopLook.frame.includes('panel_brown_corners_a') && shopLook.tab.includes('button_dark') && shopLook.other.includes('button_brown'),
    `Laden: Holzrahmen, gewählter Reiter dunkles Holz, die anderen hell (${[shopLook.frame, shopLook.tab, shopLook.other].map((u) => u.split('/').pop()).join(', ')})`,
  );
  await page.tap('#modal-close');
  await sleep(200);
  await page.tap('#btn-menu');
  await sleep(150);
  const audioMenu = await page.locator('#menu').boundingBox();
  check(
    (await page.isVisible('#menu-audio')) && (await page.textContent('#menu-audio')).includes('Audio') && audioMenu.y + audioMenu.height <= vp.height,
    `Menü: Eintrag „🔊 Audio“, Menü passt (${Math.round(audioMenu.y + audioMenu.height)} ≤ ${vp.height})`,
  );
  await page.tap('#menu-audio');
  await sleep(250);
  const audioStart = { text: await page.textContent('#audio-toggle'), stored: await game(page, () => localStorage.getItem('erstesspiel-audio')) };
  check(audioStart.text.includes('aus') && audioStart.stored === null, `Audio: beim ersten Start aus (${audioStart.text}, gespeichert: ${audioStart.stored})`);
  await page.tap('#audio-toggle');
  await sleep(200);
  await game(page, () => {
    const slider = document.getElementById('audio-volume');
    slider.value = '30';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await sleep(150);
  const audioOn = {
    text: await page.textContent('#audio-toggle'),
    volume: await page.textContent('.audio-volume-text'),
    stored: JSON.parse(await game(page, () => localStorage.getItem('erstesspiel-audio'))),
    box: await page.locator('#modal .modal-box').boundingBox(),
  };
  check(
    audioOn.text.includes('an') && audioOn.volume.trim() === '30 %' && audioOn.stored.on === true && audioOn.stored.volume === 0.3,
    `Audio: an, Lautstärke 30 %, auf dem Gerät gemerkt (${JSON.stringify(audioOn.stored)})`,
  );
  check(audioOn.box.y >= 0 && audioOn.box.y + audioOn.box.height <= vp.height && audioOn.box.x + audioOn.box.width <= vp.width, 'Fenster „Audio“ passt auf den Bildschirm');
  await shot('3d-11f-audio');
  await page.tap('#audio-toggle');
  await sleep(150);
  check(JSON.parse(await game(page, () => localStorage.getItem('erstesspiel-audio'))).on === false, 'Audio: wieder aus');
  await page.tap('#modal-close');
  await sleep(150);
  // v0.49.0: Bauleiste und Leisten im selben Stil – offener Reiter dunkles Holz,
  // Knöpfe oben und unten Holzknöpfe, alle Reiter auf dem Bildschirm
  await page.tap('#btn-build');
  await sleep(300);
  const barLook = await page.evaluate(() => {
    const src = (sel) => getComputedStyle(document.querySelector(sel)).borderImageSource.split('/').pop().replace(/["')]/g, '');
    const tabs = [...document.querySelectorAll('#build-tabs .build-tab')].map((t) => t.getBoundingClientRect());
    return {
      active: src('#build-tabs .build-tab.active'),
      other: src('#build-tabs .build-tab:not(.active)'),
      close: src('#build-close'),
      menu: src('#btn-menu'),
      shop: src('#btn-shop'),
      tabsFit: tabs.every((r) => r.left >= 0 && r.right <= innerWidth),
    };
  });
  check(
    barLook.active === 'button_dark.png' && barLook.other === 'button_brown.png' && barLook.close === 'button_red.png' && barLook.menu === 'button_brown.png' && barLook.shop === 'button_brown.png' && barLook.tabsFit,
    `Bauleiste und Leisten: offener Reiter dunkel, Holzknöpfe, ✕ rot, alle Reiter passen (${JSON.stringify(barLook)})`,
  );
  await shot('3d-11g-bauleiste');
  await page.tap('#build-close');
  await sleep(200);

  // v0.54.0: Gespeichert wird auf dem Platz des früheren 3D-Tests, die alte 2D-Fabrik bleibt
  await game(page, () => window.__game.saveNow());
  const slots = await game(page, () => ({
    test: localStorage.getItem('erstesspiel-spielstand-3d-test'),
    real: localStorage.getItem('erstesspiel-spielstand'),
  }));
  check(Boolean(slots.test) && slots.real === real, 'Spielstand unter „erstesspiel-spielstand-3d-test“, der alte 2D-Spielstand bleibt unverändert');
  check(errors.length === 0, `Keine Fehler in der Konsole${errors.length ? ': ' + errors.join(' | ') : ''}`);

  // v0.39.0: Belastungstest – im Testmodus aus dem Menü, volle Fabrik, wird nie gespeichert
  await page.tap('#btn-menu');
  await sleep(100);
  check(!(await page.isVisible('#menu-stress')), 'Ohne Testmodus kein Belastungstest im Menü');
  // v0.53.0: Vollbild und Versionsnummer stehen im Menü
  const menuExtras = await page.evaluate(() => {
    const shown = (id) => {
      const r = document.getElementById(id).getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom <= window.innerHeight;
    };
    return { full: shown('menu-fullscreen'), fullText: document.getElementById('menu-fullscreen').textContent, version: shown('menu-version') };
  });
  check(menuExtras.full && menuExtras.fullText.includes('Vollbild') && menuExtras.version, `Menü: „⛶ Vollbild“ und Versionsnummer sichtbar (${JSON.stringify(menuExtras)})`);
  await shot('3d-menu');
  await page.tap('#menu-test-mode');
  await sleep(150);
  await page.tap('#btn-menu');
  await sleep(100);
  const stressMenu = await page.locator('#menu').boundingBox();
  check((await page.isVisible('#menu-stress')) && stressMenu.y + stressMenu.height <= vp.height, `Testmodus: „🏭 Belastungstest“ im Menü, Menü passt (${Math.round(stressMenu.y + stressMenu.height)} ≤ ${vp.height})`);
  const ownBuildings = await game(page, () => window.__game.state.buildings.length);
  await page.tap('#menu-stress');
  await page.waitForURL(/belastungstest=1/);
  await waitForGame(page, { timeout: 60000 });
  // v0.50.0: Der Belastungstest fragt nicht nach dem Namen (er wird nie gespeichert)
  check((await game(page, () => window.__game.state.playerName)) === '', 'Belastungstest: kein „Wie heißt du?“');
  // vor dem Wechsel hat das 3D-Spiel gespeichert – ab hier darf sich nichts mehr ändern
  const before3d = await game(page, () => localStorage.getItem('erstesspiel-spielstand-3d-test'));
  await sleep(1500);
  const stress = await game(page, () => ({ counts: window.__game.view3d.counts(), level: window.__game.state.shopLevel, plot: [window.__game.state.plot.width, window.__game.state.plot.height] }));
  check(stress.counts.buildings >= 150 && stress.counts.belts >= 300 && stress.level === 13 && stress.plot.join() === '46,38', `Volle Fabrik in 3D (${JSON.stringify(stress)})`);
  check(await page.isVisible('#stress-banner'), 'Hinweis „Belastungstest … Bilder/s ablesen“ mit „↩ Beenden“');
  // v0.40.0: 3D schneller – weit weg nur Statuslichter, wenige Zeichenaufrufe je Bild (vorher bis 6.200)
  const view = async (d) => {
    await game(page, (dist) => {
      const c = window.__game.camera;
      const p = window.__game.state.plot;
      c.distance = dist;
      c.target.set(p.x + p.width / 2, 0, p.y + p.height / 2);
      c.update();
    }, d);
    await sleep(900);
    return game(page, () => ({ calls: window.__game.view3d.drawCalls(), ...window.__game.view3d.farSigns() }));
  };
  const far = await view(70);
  check(far.far && far.dots >= 100 && far.signs === 0 && far.calls < 1000, `Herausgezoomt: nur Statuslichter, ${far.calls} Zeichenaufrufe je Bild (${JSON.stringify(far)})`);
  await shot('3d-13-belastungstest-weit');
  const near = await view(20);
  check(!near.far && near.dots === 0 && near.signs > 0 && near.calls < 1000, `Herangezoomt: Schilder wieder da, ${near.calls} Zeichenaufrufe (${JSON.stringify(near)})`);
  const bannerBox = await page.locator('#stress-banner').boundingBox();
  check(bannerBox.x >= 0 && bannerBox.x + bannerBox.width <= vp.width, `Hinweis passt auf den Bildschirm (${Math.round(bannerBox.x)}–${Math.round(bannerBox.x + bannerBox.width)})`);
  await shot('3d-12-belastungstest');
  await game(page, () => window.__game.saveNow());
  const stressSlots = await game(page, () => ({ test: localStorage.getItem('erstesspiel-spielstand-3d-test'), own: localStorage.getItem('erstesspiel-spielstand-belastungstest') }));
  check(stressSlots.test === before3d && stressSlots.own === null, 'Der Belastungstest speichert nichts – der 3D-Spielstand bleibt, wie er war');
  await page.tap('#stress-exit');
  // v0.50.0: Ladebildschirm mit Balken und Tipp – mindestens 2 Sekunden, ohne Antippen weiter
  // (gleich nach dem Seitenwechsel nachsehen, nicht erst nach dem Laden der Seite)
  await page.waitForURL((u) => !u.search.includes('belastungstest'), { waitUntil: 'commit' });
  await page.waitForFunction(() => document.getElementById('loading-tip')?.textContent || document.getElementById('loading')?.hidden, null, { timeout: 30000 });
  const bootLook = await page.evaluate(() => ({
    shown: !document.getElementById('loading').hidden,
    bar: !document.getElementById('loading-progress').hidden,
    ask: !document.getElementById('loading-name').hidden,
    tip: document.getElementById('loading-tip').textContent,
    text: document.getElementById('loading-text').textContent,
    box: document.getElementById('loading-progress').getBoundingClientRect().toJSON(),
  }));
  check(bootLook.shown && bootLook.bar && !bootLook.ask && bootLook.tip.length > 10, `Neu laden: Ladebildschirm mit Balken und Tipp, ohne Namensfrage (${bootLook.text} · ${bootLook.tip})`);
  const bootBox = bootLook.box;
  await shot('3d-0b-ladebildschirm');
  check(bootBox.x >= 0 && bootBox.x + bootBox.width <= vp.width && bootBox.y + bootBox.height <= vp.height, `Ladebalken passt auf den Bildschirm (${Math.round(bootBox.y + bootBox.height)} ≤ ${vp.height})`);
  await waitForGame(page, { timeout: 60000 });
  check((await game(page, () => window.__game.state.playerName)) === 'Tobias', 'Danach geht es von selbst ins Spiel, der Name bleibt');
  const after = await game(page, () => ({ level: window.__game.state.shopLevel, buildings: window.__game.state.buildings.length }));
  check(after.level === 1 && after.buildings === ownBuildings, `„↩ Beenden“ führt zurück ins eigene 3D-Spiel (Level ${after.level}, ${after.buildings} Gebäude wie vorher)`);
  // Testmodus wieder aus
  await page.tap('#btn-menu');
  await sleep(100);
  await page.tap('#menu-test-mode');
  await sleep(150);

  // v0.51.0 (Tobias, Chat 29): Aufstieg im 3D-Test – die Schriftrolle rollt sich
  // über dem Spiel auf und bleibt, bis man „✓ Gelesen“ tippt
  await game(page, () => {
    window.__game.state.quest.index = window.__game.questCount();
    window.__game.state.gold += 100;
  });
  await page.tap('#btn-level');
  await sleep(300);
  await page.locator('#modal-content button', { hasText: 'Aufsteigen auf Level 2' }).tap();
  await page.waitForFunction(() => document.getElementById('letter')?.classList.contains('open'), null, { timeout: 5000 });
  await sleep(900);
  const roll = await page.evaluate(() => ({
    banner: document.getElementById('letter-banner').textContent,
    rows: document.querySelectorAll('#letter .letter-row').length,
    box: document.querySelector('#letter .letter-scroll').getBoundingClientRect().toJSON(),
    ok: document.getElementById('letter-ok').getBoundingClientRect().toJSON(),
  }));
  check(
    roll.banner === 'Laden-Level 2!' && roll.rows >= 3 && roll.box.top >= 0 && roll.box.bottom <= vp.height && roll.ok.bottom <= roll.box.bottom - 20,
    `3D: Schriftrolle zum Aufstieg passt auf den Bildschirm, „✓ Gelesen“ zu sehen (${Math.round(roll.box.top)}–${Math.round(roll.box.bottom)} von ${vp.height}, Knopf bis ${Math.round(roll.ok.bottom)}, ${roll.rows} Zeilen)`,
  );
  await shot('3d-14-schriftrolle');
  await readLetter(page);
  check(!(await page.isVisible('#letter')) && (await game(page, () => window.__game.state.shopLevel)) === 2, '„✓ Gelesen“ schließt sie, Level 2');
  await page.tap('#modal-close');
  await sleep(150);

  // v0.54.0: Ein alter Link auf die 2D-Welt öffnet dasselbe Spiel (Level 2, nicht die 4321 Gold der alten 2D-Fabrik)
  await game(page, () => window.__game.saveNow());
  await page.goto(`${baseUrl}?ansicht=2d`);
  await waitForGame(page);
  const back = await game(page, () => ({ gold: window.__game.state.gold, level: window.__game.state.shopLevel, view3d: Boolean(window.__game.view3d), real: localStorage.getItem('erstesspiel-spielstand') }));
  check(back.view3d && back.level === 2 && back.gold !== 4321 && back.real === real, `„?ansicht=2d“ öffnet das Spiel in 3D mit demselben Spielstand (Level ${back.level}, ${back.gold} Gold)`);
  await context.close();
}

module.exports = { run3d };
