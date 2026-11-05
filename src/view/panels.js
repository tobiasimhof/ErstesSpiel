// Fenster über dem Spielfeld: Infofenster (rechts), großes Fenster (Mitte),
// Bestätigungsfrage und kurze Meldungen (unten).
// Texte werden immer über textContent gesetzt, nie als HTML.

import { onBackdropPress, onPress } from './press.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function makeButton({ label, onClick, danger = false, primary = false }) {
  const button = el('button', [danger && 'danger', primary && 'primary'].filter(Boolean).join(' '), label);
  button.type = 'button';
  onPress(button, onClick);
  return button;
}

export function createPanels() {
  const info = document.getElementById('info-panel');
  const infoIcon = document.getElementById('info-icon');
  const infoTitle = document.getElementById('info-title');
  const infoMeta = document.getElementById('info-meta');
  const infoText = document.getElementById('info-text');
  const infoSoon = document.getElementById('info-soon');
  const infoActions = document.getElementById('info-actions');
  let onInfoClose = null;
  onPress(document.getElementById('info-close'), () => onInfoClose?.());

  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  onPress(document.getElementById('modal-close'), () => hideModal());
  onBackdropPress(modal, () => hideModal());

  const dialog = document.getElementById('dialog');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogText = document.getElementById('dialog-text');
  const dialogOk = document.getElementById('dialog-ok');
  const dialogCancel = document.getElementById('dialog-cancel');
  let resolveDialog = null;
  function closeDialog(result) {
    dialog.hidden = true;
    resolveDialog?.(result);
    resolveDialog = null;
  }
  onPress(dialogOk, () => closeDialog(true));
  onPress(dialogCancel, () => closeDialog(false));
  onBackdropPress(dialog, () => closeDialog(false));

  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function hideModal() {
    modal.hidden = true;
    modalContent.replaceChildren();
  }

  return {
    setInfoCloseHandler(handler) {
      onInfoClose = handler;
    },

    showInfo({ icon, title, meta, text, soon, actions = [] }) {
      infoIcon.textContent = icon;
      infoTitle.textContent = title;
      infoMeta.textContent = meta ?? '';
      infoMeta.hidden = !meta;
      infoText.textContent = text;
      infoSoon.textContent = soon ? `Bald: ${soon}` : '';
      infoSoon.hidden = !soon;
      infoActions.replaceChildren(...actions.map(makeButton));
      infoActions.hidden = actions.length === 0;
      info.hidden = false;
    },

    hideInfo() {
      info.hidden = true;
    },

    // build(container, helpers) füllt das Fenster.
    showModal(build) {
      modalContent.replaceChildren();
      build(modalContent, { el, makeButton });
      modal.hidden = false;
    },

    hideModal,

    isModalOpen() {
      return !modal.hidden || !dialog.hidden;
    },

    closeTopmost() {
      if (!dialog.hidden) closeDialog(false);
      else if (!modal.hidden) hideModal();
    },

    confirm({ title, text, okLabel = 'OK', danger = false }) {
      if (resolveDialog) closeDialog(false);
      dialogTitle.textContent = title;
      dialogText.textContent = text;
      dialogOk.textContent = okLabel;
      dialogOk.className = danger ? 'danger' : 'primary';
      dialog.hidden = false;
      return new Promise((resolve) => {
        resolveDialog = resolve;
      });
    },

    toast(text, ms = 2200) {
      toastEl.textContent = text;
      toastEl.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastEl.hidden = true;
      }, ms);
    },
  };
}
