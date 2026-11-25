// v0.52.0: Einführung mit Bürgermeisterin Hilde – das kleine Fenster, der
// hüpfende gelbe Pfeil und der leuchtende Ring (Tobias, Chat 29: „Finde es
// cool, wenn das so kleine Fenster sind, die man … einfach wegklicken kann,
// aber man die Grundlagen dadurch gezeigt bekommt“; „dass man die Schritte
// überspringen kann oder ganz beenden … oder man macht sie und durch das
// erledigen, springt der Schritt zum nächsten Schritt“).
//
// Was Hilde je Schritt sagt und worauf sie zeigt, steht in
// src/core/data/tutorial.js; wann ein Schritt erledigt ist, in
// src/core/tutorial.js. Hier: was gerade offen ist („when“), wo das Ziel auf
// dem Bildschirm liegt („target“), Fenster, Pfeil und Ring.
//
// - Das Fenster steht in einer Ecke, die das Ziel nicht verdeckt.
// - ✕ klappt es weg: Hilde wartet klein am linken Rand, der Pfeil bleibt.
// - „Weiter ›“ überspringt den Schritt, „Beenden“ beendet die Einführung.
// - Schritt 1 und der Abschluss sind Briefe (Schriftrolle, letters.js).

import { BUILDINGS } from '../core/data/buildings.js';
import { buildingPorts, footprintSize } from '../core/geometry.js';
import {
  TUTORIAL_STEPS,
  advanceTutorial,
  endTutorial,
  nextStockedCustomerIn,
  noteTutorial,
  skipTutorialStep,
  startTutorial,
  tutorialStep,
} from '../core/tutorial.js';
import { fillName } from './format.js';
import { tutorialEndLetter, tutorialWelcomeLetter } from './letters.js';
import { onPress } from './press.js';

const TOOL_MODES = ['place', 'belt', 'erase', 'area', 'areaMove', 'areaCopy'];
const MARGIN = 8;
const RING_PAD = 6;
const ARROW_W = 36;
const ARROW_H = 46;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Sichtbares Element? (nicht hidden, mit Größe)
function shown(node) {
  if (!node?.isConnected) return false;
  const r = node.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && node.getClientRects().length > 0;
}

const overlap = (a, b) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

const union = (a, b) => ({ left: Math.min(a.left, b.left), top: Math.min(a.top, b.top), right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom) });

// buildingRect(building): Rechteck des Gebäudes auf dem Bildschirm (Seite) oder null
export function createTutorialView({ state, ui, panels, letters, buildingRect, onChange }) {
  // ---------- Aufbau ----------
  const box = el('div', 'hilde');
  box.id = 'hilde';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Einführung mit Bürgermeisterin Hilde');
  const head = el('div', 'hilde-head');
  const seal = el('span', 'hilde-seal', 'H');
  seal.setAttribute('aria-hidden', 'true');
  const who = el('div', 'hilde-who');
  const stepText = el('span', 'hilde-step');
  stepText.id = 'hilde-step';
  who.append(el('b', null, 'Bürgermeisterin Hilde'), stepText);
  const close = el('button', 'hilde-close', '✕');
  close.type = 'button';
  close.id = 'hilde-close';
  close.title = 'Wegklappen – Hilde wartet am Rand';
  close.setAttribute('aria-label', close.title);
  head.append(seal, who, close);
  const text = el('p', 'hilde-text');
  text.id = 'hilde-text';
  const actions = el('div', 'hilde-actions');
  const end = el('button', 'hilde-end', 'Beenden');
  end.type = 'button';
  end.id = 'hilde-end';
  end.title = 'Einführung beenden';
  const next = el('button', 'hilde-next primary', 'Weiter ›');
  next.type = 'button';
  next.id = 'hilde-next';
  next.title = 'Diesen Schritt überspringen';
  actions.append(end, next);
  box.append(head, text, actions);

  // weggeklappt: Hilde klein am Rand
  const mini = el('button', 'hilde-mini');
  mini.type = 'button';
  mini.id = 'hilde-mini';
  mini.hidden = true;
  mini.title = 'Hilde: Hinweis zeigen';
  mini.setAttribute('aria-label', mini.title);
  mini.append(el('span', 'hilde-seal', 'H'), el('span', 'hilde-mini-bubble', '💬'));

  const ring = el('div', 'hilde-ring');
  ring.id = 'hilde-ring';
  ring.hidden = true;
  const arrow = el('div', 'hilde-arrow');
  arrow.id = 'hilde-arrow';
  arrow.hidden = true;
  arrow.innerHTML =
    '<svg viewBox="0 0 36 46" width="36" height="46" aria-hidden="true"><path d="M11 2h14v22h9L18 44 2 24h9z" fill="#ffd23f" stroke="#5a3a12" stroke-width="3" stroke-linejoin="round"/></svg>';
  document.body.append(ring, arrow, box, mini);

  let collapsed = false;
  let welcomeOpen = false; // Begrüßungsbrief liegt gerade in der Schriftrolle
  let shownKey = null; // Schritt|Hinweis, der gerade im Fenster steht
  let corner = null; // Ecke des Fensters
  let lastTargetNode = null;

  // ---------- Was ist gerade offen? ----------

  const modalOpen = () => !document.getElementById('modal').hidden;
  const dialogOpen = () => !document.getElementById('dialog').hidden;
  const modalBox = () => document.querySelector('#modal .modal-box');
  // Laden offen? Dann der gewählte Reiter (lager, theken, haendler)
  function shopTab() {
    if (!modalOpen() || !document.querySelector('#modal-content .tab[data-tab="lager"]')) return null;
    return document.querySelector('#modal-content .tab.active')?.dataset.tab ?? null;
  }

  function matches(when) {
    if (!when) return true;
    const [kind, arg] = when.split(':');
    switch (kind) {
      case 'info': {
        const sel = ui.selected;
        if (sel?.kind !== 'building' || document.getElementById('info-panel').hidden) return false;
        return state.buildings.find((b) => b.id === sel.id)?.type === arg;
      }
      case 'place':
        return ui.mode === 'place' && ui.ghost?.type === arg;
      case 'mode':
        return ui.mode === arg;
      case 'tool':
        return TOOL_MODES.includes(ui.mode);
      case 'shop':
        return arg ? shopTab() === arg : shopTab() !== null;
      case 'picker':
        return Boolean(shopTab()) && Boolean(document.querySelector('#modal-content .pick-row'));
      case 'amount':
        return Boolean(shopTab()) && Boolean(document.querySelector('#modal-content .amount-ok'));
      case 'modal':
        return modalOpen();
      case 'stocked':
        return state.counters.some((c) => c.count > 0);
      case 'belts':
        return Object.keys(state.belts).length > 0;
      default:
        return false;
    }
  }

  function currentHint(step) {
    const index = step.hints.findIndex((h) => matches(h.when));
    return { hint: step.hints[index] ?? step.hints.at(-1), index };
  }

  // ---------- Wo liegt das Ziel? ----------

  // Ergebnis: { rect, round, node } oder null (kein Pfeil)
  function findTarget(target) {
    if (!target) return null;
    const [kind, ...rest] = target.split(':');
    const arg = rest.join(':');
    let node = null;
    if (kind === 'building') {
      const b = state.buildings.find((item) => item.type === arg && BUILDINGS[item.type]);
      const rect = b ? buildingRect(b, footprintSize(b.type, b.rot)) : null;
      return rect ? { rect, round: true, node: null } : null;
    }
    // Feld vor einem Anschluss (z. B. 'port:holzfaeller:out' – dort beginnt das Band)
    if (kind === 'port') {
      const [type, portKind] = arg.split(':');
      const b = state.buildings.find((item) => item.type === type);
      const port = b ? buildingPorts(b).find((p) => p.kind === portKind) : null;
      const rect = port ? buildingRect(port.outside, { width: 1, height: 1 }, 0.2) : null;
      return rect ? { rect, round: true, node: null } : null;
    }
    if (target.startsWith('#')) node = document.getElementById(target.slice(1));
    else if (kind === 'info') node = document.querySelector(`#info-panel [data-key="${arg}"]`);
    else if (kind === 'tool') node = document.querySelector(`#build-bar [data-tool="${arg}"]`);
    else if (kind === 'tab') node = document.querySelector(`#modal-content .tab[data-tab="${arg}"]`);
    else if (kind === 'counter' && arg === 'ware') node = document.querySelector('#modal-content [data-counter-action="ware"]');
    else if (kind === 'counter' && arg === 'stocked') {
      const index = state.counters.findIndex((c) => c.count > 0);
      node = shopTab() === 'theken' && index >= 0 ? document.querySelector(`#modal-content .counter-card[data-counter="${index}"]`) : null;
    } else if (kind === 'pick') node = document.querySelector(`#modal-content .pick-row[data-item="${arg}"]`);
    else if (kind === 'amount') node = document.querySelector('#modal-content .amount-ok');
    else if (kind === 'buy') node = document.querySelector(`#modal-content [data-buy="${arg}"]`);
    if (!shown(node)) return null;
    // Ein neues Ziel in einem Fenster mit Bildlauf ins Bild holen (auf dem
    // Handy liegt z. B. „➕ 1 einlegen“ unten im Infofenster)
    if (node !== lastTargetNode && node.closest('#modal-content, #info-panel')) {
      try {
        node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } catch {
        // nichts zu tun
      }
    }
    lastTargetNode = node;
    const rect = visiblePart(node);
    return rect ? { rect, round: false, node } : null;
  }

  // Der sichtbare Teil eines Knopfs (Fenster mit Bildlauf schneiden ab) –
  // null, wenn höchstens die Hälfte zu sehen ist
  function visiblePart(node) {
    const r = node.getBoundingClientRect();
    let rect = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    for (let p = node.parentElement; p && p !== document.body; p = p.parentElement) {
      const style = getComputedStyle(p);
      if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
      const c = p.getBoundingClientRect();
      rect = { left: Math.max(rect.left, c.left), top: Math.max(rect.top, c.top), right: Math.min(rect.right, c.right), bottom: Math.min(rect.bottom, c.bottom) };
    }
    const area = Math.max(0, rect.right - rect.left) * Math.max(0, rect.bottom - rect.top);
    return area > 0.5 * r.width * r.height ? rect : null;
  }

  // ---------- Pfeil und Ring ----------

  function hidePointer() {
    ring.hidden = true;
    arrow.hidden = true;
  }

  // Gibt das Rechteck zurück, das Pfeil und Ring zusammen belegen
  function showPointer(found) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = found.rect;
    const ringRect = { left: r.left - RING_PAD, top: r.top - RING_PAD, right: r.right + RING_PAD, bottom: r.bottom + RING_PAD };
    ring.hidden = false;
    ring.classList.toggle('round', found.round);
    ring.style.left = `${ringRect.left}px`;
    ring.style.top = `${ringRect.top}px`;
    ring.style.width = `${ringRect.right - ringRect.left}px`;
    ring.style.height = `${ringRect.bottom - ringRect.top}px`;
    // Pfeil über dem Ziel, nach unten zeigend – ist oben kein Platz, darunter
    const cx = Math.max(MARGIN + ARROW_W / 2, Math.min(vw - MARGIN - ARROW_W / 2, (r.left + r.right) / 2));
    const above = ringRect.top - ARROW_H - 4 >= MARGIN || ringRect.bottom + ARROW_H + 4 > vh - MARGIN;
    const top = above ? ringRect.top - ARROW_H - 4 : ringRect.bottom + 4;
    arrow.hidden = false;
    arrow.classList.toggle('up', !above);
    arrow.style.left = `${cx - ARROW_W / 2}px`;
    arrow.style.top = `${top}px`;
    return union(ringRect, { left: cx - ARROW_W / 2, top, right: cx + ARROW_W / 2, bottom: top + ARROW_H });
  }

  // ---------- Wohin mit dem Fenster? ----------

  // Was das Fenster möglichst nicht verdecken soll: andere Bedienelemente und
  // die Gebäude, um die es in diesem Schritt geht (dazu die Vorschau beim
  // Verschieben – dorthin tippt man ja gleich). weight: wie schlimm Verdecken ist
  function busyRects(step) {
    const ids = ['info-panel', 'bottom-bar', 'build-bar', 'tool-bar', 'hud', 'turn-buttons'];
    const rects = ids.map((id) => document.getElementById(id)).filter(shown).map((node) => ({ rect: node.getBoundingClientRect(), weight: 1 }));
    const mb = modalOpen() ? modalBox() : null;
    if (shown(mb)) rects.push({ rect: mb.getBoundingClientRect(), weight: 1 });
    if (modalOpen()) return rects;
    const types = new Set(step.hints.map((h) => h.target ?? '').filter((t) => t.startsWith('building:')).map((t) => t.slice(9)));
    for (const b of state.buildings) {
      if (!types.has(b.type)) continue;
      const rect = buildingRect(b, footprintSize(b.type, b.rot));
      if (rect) rects.push({ rect, weight: 3 });
    }
    const g = ui.mode === 'place' ? ui.ghost : null;
    if (g) {
      const size = footprintSize(g.type, g.rot);
      const rect = buildingRect({ x: g.x - 2, y: g.y - 2 }, { width: size.width + 4, height: size.height + 4 });
      if (rect) rects.push({ rect, weight: 3 });
    }
    return rects;
  }

  function corners(w, h) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const hud = document.getElementById('hud');
    const top = Math.min(vh - h - MARGIN, (shown(hud) && !modalOpen() ? hud.getBoundingClientRect().bottom : 0) + MARGIN);
    const bottom = vh - h - MARGIN;
    const left = MARGIN;
    const right = vw - w - MARGIN;
    const middle = Math.max(top, Math.round((vh - h) / 2));
    return {
      topLeft: { x: left, y: top },
      bottomLeft: { x: left, y: bottom },
      topRight: { x: right, y: top },
      bottomRight: { x: right, y: bottom },
      middleLeft: { x: left, y: middle },
      middleRight: { x: right, y: middle },
    };
  }

  function rectAt(pos, w, h) {
    return { left: pos.x, top: pos.y, right: pos.x + w, bottom: pos.y + h };
  }

  function placeBox(step, pointerRect, force) {
    const w = box.offsetWidth;
    const h = box.offsetHeight;
    const all = corners(w, h);
    const covers = (name) => (pointerRect ? overlap(rectAt(all[name], w, h), pointerRect) > 0 : false);
    if (!force && corner && all[corner] && !covers(corner)) {
      setBox(all[corner]);
      return;
    }
    const busy = busyRects(step);
    let best = null;
    for (const [name, pos] of Object.entries(all)) {
      const rect = rectAt(pos, w, h);
      const score = (pointerRect ? overlap(rect, pointerRect) * 1000 : 0) + busy.reduce((sum, b) => sum + overlap(rect, b.rect) * b.weight, 0);
      if (!best || score < best.score) best = { name, score };
    }
    corner = best.name;
    setBox(all[corner]);
  }

  function setBox(pos) {
    box.style.left = `${Math.round(pos.x)}px`;
    box.style.top = `${Math.round(pos.y)}px`;
  }

  // ---------- Zeigen ----------

  function hideAll() {
    if (!box.hidden) box.hidden = true;
    if (!mini.hidden) mini.hidden = true;
    if (!ring.hidden || !arrow.hidden) hidePointer();
  }

  function hintText(raw) {
    const words = fillName(raw, state.playerName);
    if (!words.includes('{sekunden}')) return words;
    return words.replaceAll('{sekunden}', String(nextStockedCustomerIn(state) ?? '–'));
  }

  // Wird in jedem Bild aufgerufen: Pfeil und Ring folgen dem Ziel (die Karte
  // lässt sich verschieben), das Fenster bleibt in seiner Ecke, solange es
  // das Ziel nicht verdeckt.
  function frame() {
    const step = tutorialStep(state);
    if (!step || step.letter || letters.isOpen() || !document.getElementById('loading').hidden) return hideAll();
    const { hint, index } = currentHint(step);
    const key = `${state.tutorial.step}|${index}`;
    const changed = key !== shownKey;
    if (changed) {
      shownKey = key;
      stepText.textContent = `Schritt ${state.tutorial.step + 1} von ${TUTORIAL_STEPS}`;
      box.dataset.step = step.id;
      box.dataset.target = hint.target ?? '';
      lastTargetNode = null;
    }
    // v0.53.0: „{sekunden}“ zählt bis zum nächsten Kunden herunter
    const words = hintText(hint.text);
    if (text.textContent !== words) text.textContent = words;
    const found = dialogOpen() ? null : findTarget(hint.target);
    const pointerRect = found ? showPointer(found) : null;
    if (!found) hidePointer();
    box.hidden = collapsed;
    mini.hidden = !collapsed;
    if (!collapsed) placeBox(step, pointerRect, changed);
  }

  // ---------- Ablauf ----------

  function showWelcome() {
    if (welcomeOpen) return;
    welcomeOpen = true;
    letters.show({
      ...tutorialWelcomeLetter(state),
      onRead() {
        welcomeOpen = false;
        note('brief');
      },
    });
  }

  function finish() {
    hideAll();
    shownKey = null;
    letters.show(tutorialEndLetter(state));
  }

  function handle(result) {
    if (!result) return;
    onChange();
    if (result === 'finished') return finish();
    collapsed = false; // neuer Schritt: Hilde meldet sich wieder
    shownKey = null;
    corner = null;
    if (tutorialStep(state)?.letter) showWelcome();
  }

  function note(event) {
    handle(noteTutorial(state, event));
  }

  onPress(close, () => {
    collapsed = true;
    frame();
  });
  onPress(mini, () => {
    collapsed = false;
    corner = null;
    frame();
  });
  onPress(next, () => handle(skipTutorialStep(state)));
  onPress(end, async () => {
    const ok = await panels.confirm({
      title: 'Einführung beenden?',
      text: 'Du kannst sie jederzeit wieder ansehen: oben „Laden-Level“ → Reiter „🏘️ Ort & Level“ → „🎓 Einführung ansehen“.',
      okLabel: 'Beenden',
    });
    if (!ok || !state.tutorial) return;
    endTutorial(state);
    hideAll();
    shownKey = null;
    onChange();
    panels.toast('Einführung beendet. Viel Erfolg mit deinem Laden!', 3000);
  });

  return {
    // Beim Start (nach dem Ladebildschirm): Begrüßungsbrief oder der Schritt, bei dem man war
    start() {
      if (tutorialStep(state)?.letter) showWelcome();
    },
    // Regelmäßig: Ist in der Fabrik etwas angekommen, hat ein Kunde gekauft?
    check() {
      handle(advanceTutorial(state));
    },
    note,
    frame,
    // „🎓 Einführung ansehen“ (Level-Fenster): von vorn
    restart() {
      panels.hideModal();
      startTutorial(state);
      collapsed = false;
      shownKey = null;
      corner = null;
      onChange();
      showWelcome();
    },
    isActive: () => Boolean(state.tutorial),
  };
}
