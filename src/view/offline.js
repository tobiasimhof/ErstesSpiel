// Spiel im Hintergrund (v0.14.0): Hinweis, während die verpasste Zeit
// nachgerechnet wird, und danach der Bericht „Willkommen zurück“ (kurze
// Meldung nach kurzer Abwesenheit, Fenster nach längerer).
// Texte werden immer über textContent gesetzt, nie als HTML.

import { BUILDINGS } from '../core/data/buildings.js';
import { ITEMS } from '../core/data/items.js';
import { OFFLINE } from '../core/data/offline.js';
import { createItemIcon } from './itemArt.js';
import { itemCount, numberFormat } from './format.js';

// „3 Std. 12 Min.“, „4 Min.“, „45 Sek.“
export function durationText(seconds) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} Sek.`;
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'Tag' : 'Tage'}`);
  if (hours > 0) parts.push(`${hours} Std.`);
  if (minutes > 0 && days === 0) parts.push(`${minutes} Min.`);
  return parts.join(' ');
}

const sum = (counts) => Object.values(counts).reduce((a, b) => a + b, 0);

export function createOfflineView({ panels }) {
  const overlay = document.getElementById('catchup');
  const overlayText = document.getElementById('catchup-text');
  const overlayFill = document.getElementById('catchup-fill');

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Waren mit Bild: „[Bild] 120 Holzplatten“
  function goodsList(counts) {
    const list = el('div', 'away-goods');
    const sorted = Object.entries(counts).sort((a, b) => b[1] * ITEMS[b[0]].price - a[1] * ITEMS[a[0]].price);
    for (const [type, n] of sorted) {
      const chip = el('span', 'away-good');
      chip.append(createItemIcon(type, 22), el('span', null, itemCount(type, n)));
      list.append(chip);
    }
    return list;
  }

  // „3× Holzfällerlager, 1× Schmelzhütte“
  function buildingsText(counts) {
    return Object.entries(counts)
      .map(([type, n]) => `${n}× ${BUILDINGS[type].name}`)
      .join(', ');
  }

  function showReport(report) {
    panels.showModal((box, { makeButton }) => {
      box.append(el('h2', null, '👋 Willkommen zurück!'));
      box.append(el('p', null, `Du warst ${durationText(report.seconds)} weg. Deine Fabrik lief weiter, bis etwas leer war:`));
      const rows = el('div', 'away-rows');
      const row = (icon, text, extra) => {
        const r = el('div', 'away-row');
        r.append(el('span', 'away-icon', icon));
        const body = el('div', 'away-body');
        body.append(el('div', null, text));
        if (extra) body.append(extra);
        r.append(body);
        rows.append(r);
      };
      const sold = sum(report.sold);
      if (sold > 0) {
        row('🛒', `Kunden haben ${numberFormat.format(sold)} ${sold === 1 ? 'Ware' : 'Waren'} gekauft: +${numberFormat.format(report.gold)} 🪙`, goodsList(report.sold));
      }
      if (sum(report.stored) > 0) row('📦', 'Ins Laden-Lager gekommen:', goodsList(report.stored));
      if (Object.keys(report.emptied).length > 0) {
        row('🪵', `Leer gelaufen: ${buildingsText(report.emptied)}. Tippe sie an und lege mit „⏫ Auffüllen“ nach.`);
      }
      if (report.storageFull) row('⚠️', 'Das Laden-Lager ist voll – die Fabrik staut sich. Verkaufe oder verbaue Waren.');
      if (report.countersEmpty) row('🧺', 'Alle Theken sind leer verkauft – stelle neue Waren hin.');
      if (report.running) row('⚙️', 'Die Fabrik arbeitet noch.');
      if (rows.childElementCount === 0) {
        row('💤', 'In der Zeit ist nichts passiert. Lege Rohstoffe nach und stelle Waren auf die Theken – dann läuft dein Laden auch, während du weg bist.');
      }
      box.append(rows);
      const actions = el('div', 'panel-actions');
      actions.append(makeButton({ label: '✓ Weiter', primary: true, onClick: () => panels.hideModal() }));
      box.append(actions);
    });
  }

  return {
    // Während des Nachrechnens: dunkler Hinweis mit Fortschritt
    showProgress(seconds, progress) {
      overlayText.textContent = `Du warst ${durationText(seconds)} weg. Die Fabrik holt die Zeit nach …`;
      overlayFill.style.width = `${Math.round(progress * 100)}%`;
      overlay.hidden = false;
    },
    hideProgress() {
      overlay.hidden = true;
    },
    // Nach dem Nachrechnen: nach kurzer Abwesenheit eine Meldung (wenn etwas
    // passiert ist), nach längerer das Fenster „Willkommen zurück“.
    report(report) {
      if (report.seconds >= OFFLINE.reportSeconds) {
        showReport(report);
        return 'window';
      }
      if (report.seconds < OFFLINE.toastSeconds) return null;
      const parts = [];
      if (report.gold > 0) parts.push(`+${numberFormat.format(report.gold)} Gold`);
      const stored = sum(report.stored);
      if (stored > 0) parts.push(`${numberFormat.format(stored)} ${stored === 1 ? 'Ware' : 'Waren'} ins Laden-Lager`);
      const emptied = sum(report.emptied);
      if (emptied > 0) parts.push(`${emptied} ${emptied === 1 ? 'Rohstoff-Gebäude ist' : 'Rohstoff-Gebäude sind'} leer`);
      if (parts.length === 0) return null;
      panels.toast(`Du warst ${durationText(report.seconds)} weg – deine Fabrik lief weiter: ${parts.join(', ')}.`, 5000);
      return 'toast';
    },
  };
}
