// v0.51.0 (Tobias, Chat 29): Neuigkeiten als Schriftrolle – „ein Fenster …
// das aufploppt und die Nachricht dann so übermittelt wird, quasi als Brief
// oder Nachricht zum aufrollen … ohne Zeit, selbst zum wegklicken, damit man
// alles lesen kann“. Pergament mit ausgefranstem Rand (Kenneys
// panel_brown_damaged) zwischen zwei Holzstäben, oben das rote Band
// (banner_classic_curtain), unten ein Wachssiegel. Rollt sich beim Öffnen auf
// und beim Schließen zu; bleibt, bis man „✓ Gelesen“ tippt. Mehrere Briefe
// kommen nacheinander. Inhalte: letters.js. Texte nur über textContent.

import { createItemIcon } from './itemArt.js';
import { onPress } from './press.js';

const ROLL_MS = 450; // so lange rollt sie sich zu (style.css: Aufrollen 0,55 s)

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createLetterView() {
  const root = el('div', 'letter');
  root.id = 'letter';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  const scroll = el('div', 'letter-scroll');
  const paper = el('div', 'letter-paper');
  const clip = el('div', 'letter-clip');
  const content = el('div', 'letter-content');
  const banner = el('div', 'letter-banner');
  banner.id = 'letter-banner';
  const from = el('div', 'letter-from');
  const title = el('p', 'letter-title');
  const text = el('p', 'letter-text');
  const rows = el('div', 'letter-rows');
  const ok = el('button', 'letter-ok primary');
  ok.type = 'button';
  ok.id = 'letter-ok';
  const seal = el('span', 'letter-seal');
  const bottomRod = el('div', 'letter-rod');
  bottomRod.append(seal);
  // Der Knopf steht unter dem Text, damit er auch auf dem Handy immer zu sehen
  // ist – schieben lässt sich nur der Text darüber.
  const actions = el('div', 'letter-actions');
  actions.append(ok);
  content.append(banner, from, title, text, rows);
  clip.append(content, actions);
  paper.append(clip);
  scroll.append(el('div', 'letter-rod'), paper, bottomRod);
  root.append(scroll);
  document.body.append(root);

  const queue = [];
  let current = null;
  let closing = false;
  let shown = 0;

  function fill(letter) {
    banner.textContent = letter.banner ?? '';
    from.textContent = letter.from ? `✉️ ${letter.from} schreibt` : '';
    from.hidden = !letter.from;
    title.textContent = letter.title ?? '';
    title.hidden = !letter.title;
    text.textContent = letter.text ?? '';
    text.hidden = !letter.text;
    rows.replaceChildren(
      ...(letter.rows ?? []).map((row) => {
        const line = el('div', 'letter-row');
        const icon = el('span', 'letter-icon');
        if (row.icon?.item) icon.append(createItemIcon(row.icon.item, 28));
        else icon.textContent = row.icon?.emoji ?? '•';
        const body = el('span', 'letter-row-text');
        if (row.label) body.append(el('b', null, `${row.label}: `));
        body.append(document.createTextNode(row.text));
        line.append(icon, body);
        return line;
      }),
    );
    rows.hidden = !(letter.rows ?? []).length;
    seal.textContent = letter.seal ?? '';
    ok.textContent = queue.length > 0 ? `Weiter · noch ${queue.length} ${queue.length === 1 ? 'Brief' : 'Briefe'}` : '✓ Gelesen';
    content.scrollTop = 0;
  }

  function next() {
    current = queue.shift() ?? null;
    if (!current) {
      root.hidden = true;
      root.classList.remove('open');
      return;
    }
    fill(current);
    root.hidden = false;
    root.dataset.n = String(++shown);
    root.classList.remove('open');
    void root.offsetHeight; // erst zusammengerollt zeigen, dann aufrollen
    requestAnimationFrame(() => {
      root.classList.add('open');
      try {
        ok.focus({ preventScroll: true });
      } catch {
        // nichts zu tun
      }
    });
  }

  onPress(ok, () => {
    if (!current || closing) return;
    closing = true;
    root.classList.remove('open');
    setTimeout(() => {
      closing = false;
      next();
    }, ROLL_MS);
  });

  return {
    // Brief zeigen – oder hinten anstellen, wenn gerade einer offen ist
    show(letter) {
      queue.push(letter);
      if (!current && !closing) next();
      else if (current && !closing) ok.textContent = `Weiter · noch ${queue.length} ${queue.length === 1 ? 'Brief' : 'Briefe'}`;
    },
    isOpen: () => Boolean(current),
  };
}
