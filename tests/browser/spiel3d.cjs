// Browser-Test, 3D-Teil (der 3D-Test mit eigenem Spielstand). Gestartet von
// smoke.cjs; ONLY=3d prüft nur diesen Teil.

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
  worldPos,
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
  setDevice,
} = require('./helpers.cjs');

// v0.34.0: 3D-Test (Tobias, Chat 24) – Level 1 in der neuen Grafik mit
// eigenem Spielstand. Spielt per Touch: Holzstamm einlegen, Band ziehen,
// Sägewerk bauen, antippen, Kamera drehen und zoomen, abreißen; seit v0.35.0
// auch Bereich markieren, verschieben, drehen und Fläche kaufen.
async function run3d(browser, baseUrl, device) {
  setDevice(`${device.name}-3d`);
  console.log(`\n${device.name} – 3D-Test`);
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

  // Die echte Fabrik (2D, seit v0.38.0 ?ansicht=2d) mit etwas Gold – sie darf
  // sich durch den 3D-Test nicht ändern
  await page.goto(`${baseUrl}?ansicht=2d`);
  await waitForGame(page);
  await game(page, () => {
    window.__game.state.gold = 4321;
    window.__game.saveNow();
  });
  await page.tap('#btn-menu');
  await sleep(100);
  const menuBox = await page.locator('#menu').boundingBox();
  check(
    (await page.textContent('#menu-3d')).includes('3D-Test') && menuBox.y + menuBox.height <= vp.height,
    `Menü ☰ zeigt „🧊 Zurück zum 3D-Test“ und passt auf den Bildschirm (${Math.round(menuBox.y + menuBox.height)} ≤ ${vp.height})`,
  );
  await page.tap('#menu-3d');
  // v0.38.0: Der 3D-Test ist der Start – der Link ohne Zusatz
  await page.waitForURL((u) => !u.search.includes('ansicht'));
  await page.waitForFunction(() => window.__game?.view3d && window.__game.camera.viewWidth > 0, null, { timeout: 30000 });
  // so hat die echte Fabrik beim Wechsel gespeichert – der 3D-Test darf daran nichts ändern
  const real = await game(page, () => localStorage.getItem('erstesspiel-spielstand'));
  await sleep(1500);
  const start = await game(page, () => ({
    level: window.__game.state.shopLevel,
    gold: window.__game.state.gold,
    types: window.__game.state.buildings.map((b) => b.type).sort(),
    counts: window.__game.view3d.counts(),
    models: window.__game.view3d.models(),
    loading: !document.getElementById('catchup').hidden,
    version: document.getElementById('hud-version').textContent,
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
  check(start.version.includes('3D-Test') && start.turn, `Oben „3D-Test“, Dreh-Knöpfe ⟲ ⟳ sichtbar (${start.version})`);
  // v0.36.0: Bilder pro Sekunde im 3D-Test immer sichtbar, auch ohne Testmodus
  check(start.fps && !(await page.isVisible('#hud-speed')), `Bilder pro Sekunde oben sichtbar, ohne Testmodus (${await page.textContent('#hud-fps')})`);
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

  // v0.42.0: eigene Häuser für Level 2–6 (Tobias, Chat 26: Möglichkeit B) – im neuen Streifen links,
  // je Haus ein Teil, das sich beim Arbeiten bewegt oder leuchtet
  const houseTypes = ['steinbruch', 'steinmetz', 'schmelzhuette', 'zimmerei', 'feinschmiede', 'schlosserei'];
  const houseIds = await game(page, (types) => {
    const p = window.__game.state.plot;
    return types.map((type, i) => window.__game.place(type, p.x + (i % 2) * 2, p.y + 1 + Math.floor(i / 2) * 3, 0));
  }, houseTypes);
  check(houseIds.every((id) => id !== null), `Sechs neue Häuser gesetzt (${houseIds.join(', ')})`);
  await game(page, (ids) => {
    const raw = { steinbruch: 'felsbrocken', schmelzhuette: 'eisenerz' };
    for (const id of ids) {
      const b = window.__game.state.buildings.find((item) => item.id === id);
      if (raw[b.type]) Object.assign(b.prod, { loaded: true, input: raw[b.type], remaining: 200, timer: 0 });
      else Object.assign(b.prod, { busy: true, timer: 0 });
    }
    const c = window.__game.camera;
    const p = window.__game.state.plot;
    c.distance = 13;
    c.target.set(p.x + 2, 0, p.y + 5.5);
    c.update();
  }, houseIds);
  await sleep(1500);
  const motions = await game(page, (ids) => ids.map((id) => window.__game.view3d.motion(id)), houseIds);
  const want = { steinbruch: ['swing'], steinmetz: ['dustSpot'], schmelzhuette: ['chimneyTop', 'glow'], zimmerei: ['spin'], feinschmiede: ['spin'], schlosserei: ['chimneyTop', 'glow'] };
  houseTypes.forEach((type, i) => {
    const m = motions[i];
    const moving = want[type].includes('spin') || want[type].includes('swing') ? m.sum > 0 : true;
    check(Boolean(m) && want[type].every((k) => m.kinds.includes(k)) && moving, `${type}: eigenes Haus, beim Arbeiten ${want[type].join(' + ')} (${JSON.stringify(m)})`);
  });
  await shot('3d-11b-neue-haeuser');

  // Eigener Spielstand: der 3D-Test speichert getrennt, die echte Fabrik bleibt
  await game(page, () => window.__game.saveNow());
  const slots = await game(page, () => ({
    test: localStorage.getItem('erstesspiel-spielstand-3d-test'),
    real: localStorage.getItem('erstesspiel-spielstand'),
  }));
  check(Boolean(slots.test) && slots.real === real, '3D-Test hat einen eigenen Spielstand, die echte Fabrik bleibt unverändert');
  check(errors.length === 0, `Keine Fehler in der Konsole des 3D-Tests${errors.length ? ': ' + errors.join(' | ') : ''}`);

  // v0.39.0: Belastungstest – im Testmodus aus dem Menü, volle Fabrik, wird nie gespeichert
  await page.tap('#btn-menu');
  await sleep(100);
  check(!(await page.isVisible('#menu-stress')), 'Ohne Testmodus kein Belastungstest im Menü');
  await page.tap('#menu-test-mode');
  await sleep(150);
  await page.tap('#btn-menu');
  await sleep(100);
  const stressMenu = await page.locator('#menu').boundingBox();
  check((await page.isVisible('#menu-stress')) && stressMenu.y + stressMenu.height <= vp.height, `Testmodus: „🏭 Belastungstest“ im Menü, Menü passt (${Math.round(stressMenu.y + stressMenu.height)} ≤ ${vp.height})`);
  await page.tap('#menu-stress');
  await page.waitForURL(/belastungstest=1/);
  await page.waitForFunction(() => window.__game?.view3d && window.__game.camera.viewWidth > 0, null, { timeout: 60000 });
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
  await page.waitForURL((u) => !u.search.includes('belastungstest'));
  await page.waitForFunction(() => window.__game?.view3d && window.__game.camera.viewWidth > 0, null, { timeout: 60000 });
  const after = await game(page, () => ({ level: window.__game.state.shopLevel, buildings: window.__game.state.buildings.length }));
  check(after.level === 1 && after.buildings < 10, `„↩ Beenden“ führt zurück ins eigene 3D-Spiel (Level ${after.level}, ${after.buildings} Gebäude)`);
  // Testmodus wieder aus
  await page.tap('#btn-menu');
  await sleep(100);
  await page.tap('#menu-test-mode');
  await sleep(150);

  // Zurück zur echten Fabrik
  await page.tap('#btn-menu');
  await sleep(100);
  check((await page.textContent('#menu-3d')).includes('Zur echten Fabrik'), 'Menü im 3D-Test: „🗺️ Zur echten Fabrik (2D)“');
  await page.tap('#menu-3d');
  await page.waitForURL(/ansicht=2d/);
  await waitForGame(page);
  const back = await game(page, () => ({ gold: window.__game.state.gold, view3d: window.__game.view3d }));
  check(back.gold === 4321 && back.view3d === null, `Zurück in der echten Fabrik (2D, ${back.gold} Gold)`);
  // aufräumen: der nächste Durchlauf beginnt mit einem neuen 3D-Test
  await game(page, () => localStorage.removeItem('erstesspiel-spielstand-3d-test'));
  await context.close();
}

module.exports = { run3d };
