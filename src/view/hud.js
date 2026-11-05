// Anzeige über dem Spielfeld: obere Leiste und Infofenster.

const numberFormat = new Intl.NumberFormat('de-DE');

export function createHud({ version, onClosePanel }) {
  const gold = document.getElementById('hud-gold');
  const level = document.getElementById('hud-level');
  const versionEl = document.getElementById('hud-version');
  const panel = document.getElementById('info-panel');
  const panelIcon = document.getElementById('info-icon');
  const panelTitle = document.getElementById('info-title');
  const panelMeta = document.getElementById('info-meta');
  const panelText = document.getElementById('info-text');
  const panelSoon = document.getElementById('info-soon');
  const hint = document.getElementById('hint');

  versionEl.textContent = `v${version}`;
  document.getElementById('info-close').addEventListener('click', () => onClosePanel());

  function showPanel({ icon, title, meta, text, soon }) {
    panelIcon.textContent = icon;
    panelTitle.textContent = title;
    panelMeta.textContent = meta ?? '';
    panelMeta.hidden = !meta;
    panelText.textContent = text;
    panelSoon.textContent = soon ? `Bald: ${soon}` : '';
    panelSoon.hidden = !soon;
    panel.hidden = false;
  }

  return {
    update(state) {
      gold.textContent = numberFormat.format(state.gold);
      level.textContent = String(state.shopLevel);
    },
    showBuilding(def, building, state) {
      const meta = [`${def.size[0]} × ${def.size[1]} Felder`];
      if (building.type === 'laden') meta.unshift(`Level ${state.shopLevel}`);
      showPanel({ icon: def.icon, title: def.name, meta: meta.join(' · '), text: def.description, soon: def.soon });
    },
    showLocked() {
      showPanel({
        icon: '🔒',
        title: 'Gesperrte Fläche',
        text: 'Diese Fläche gehört noch nicht dir. Später kannst du sie mit Gold kaufen und deine Fabrik vergrößern.',
      });
    },
    hidePanel() {
      panel.hidden = true;
    },
    hideHint() {
      hint.classList.add('hidden');
    },
  };
}
