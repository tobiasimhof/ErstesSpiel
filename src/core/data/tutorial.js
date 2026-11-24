// v0.52.0: Einführung mit Bürgermeisterin Hilde (Tobias, Chat 29: „In den
// ersten Minuten wäre es cool, wenn man gezeigt bekommt wie das Spiel
// funktioniert … wie man baut, wie man umplatziert, man kann beim Händler
// kaufen, bei der Theke verkaufen, alles landet im Lager durch das Portal“).
// Jeder Schritt lässt sich überspringen, die Einführung ganz beenden; wer den
// Schritt erledigt, springt ebenfalls weiter – „quasi als interaktive Anleitung“.
//
// Neue Schritte sind neue Zeilen. Je Schritt:
//   id:     Name des Schritts
//   letter: true = Hildes Begrüßungsbrief (Schriftrolle) statt des kleinen Fensters
//   done:   Ereignis, das ihn erledigt (siehe src/core/tutorial.js):
//           'brief'                Begrüßungsbrief gelesen
//           'einlegen:<Gebäude>'   Rohstoff in ein solches Gebäude gelegt
//           'verschieben:<Gebäude>' ein solches Gebäude verschoben
//           'laden:<Reiter>'       Laden mit diesem Reiter offen
//           'kaufen:<Ware>'        beim Händler gekauft
//           'level'                Level-Fenster geöffnet
//           'angekommen', 'verkauft' (aus der Fabrik): Ware im Laden-Lager
//           angekommen, erster Kunde hat gekauft – zählen nur bei einem neuen
//           Spiel, nicht beim Ansehen (dort läuft die Fabrik ja schon)
//   hints:  was Hilde sagt und worauf Pfeil und Ring zeigen, je nachdem, was
//           gerade offen ist – die erste passende Zeile gilt, die letzte ohne
//           „when“ immer. Die Oberfläche (src/ui/tutorial.js) prüft „when“:
//             'info:<Gebäude>'   Infofenster dieses Gebäudes offen
//             'place:<Gebäude>'  dieses Gebäude wird gerade verschoben
//             'mode:<Modus>'     Bauleiste ('menu') oder Werkzeug ('belt', …)
//             'tool'             irgendein Werkzeug (Leiste unten mit „✓ Fertig“)
//             'shop:<Reiter>'    Laden mit diesem Reiter offen; 'shop' irgendeiner
//             'picker', 'amount' Laden: Ware für die Theke bzw. Menge wählen
//             'modal'            irgendein großes Fenster offen
//             'stocked'          auf einer Theke liegt etwas
//             'belts'            es liegt mindestens ein Förderband
//           und findet „target“:
//             'building:<Gebäude>' das Gebäude auf der Karte
//             'port:<Gebäude>:<in|out>' das Feld vor seinem Ein- bzw. Ausgang
//             '#<id>'            ein Knopf mit dieser id
//             'info:<key>'       Knopf im Infofenster ('move', 'load:holzstamm' …)
//             'tool:<Werkzeug>'  Werkzeug in der Bauleiste ('belt')
//             'tab:<Reiter>'     Reiter im Laden
//             'counter:ware'     „➕ Ware wählen“ der ersten leeren Theke
//             'counter:stocked'  die erste Theke, auf der etwas liegt
//             'pick:<Ware>', 'amount:ok', 'buy:<Ware>'  Knöpfe im Laden
//           Ohne „target“ zeigt kein Pfeil. „{name}“ wird zum Namen des Spielers.

import { BELT_COST, BUILDINGS } from './buildings.js';
import { ITEMS } from './items.js';

const LOG = ITEMS.holzstamm.name;
const BLOCKS = ITEMS.holzblock.plural;
const LOG_AMOUNT = BUILDINGS.holzfaeller.production.amount;
const BELT_BLOCKS = BELT_COST.holzblock;

export const TUTORIAL = [
  { id: 'willkommen', letter: true, done: 'brief' },
  {
    id: 'einlegen',
    done: 'einlegen:holzfaeller',
    hints: [
      { when: 'info:holzfaeller', target: 'info:load:holzstamm', text: `Tippe auf „➕ 1 einlegen“. Der ${LOG} kommt aus deinem Laden-Lager.` },
      { when: 'modal', target: '#modal-close', text: 'Schließ dieses Fenster mit ✕.' },
      { when: 'tool', target: '#tool-cancel', text: 'Brich das hier mit „✕ Abbrechen“ ab.' },
      { target: 'building:holzfaeller', text: `Tippe auf dein Holzfällerlager und lege den ${LOG} ein. Aus einem ${LOG} werden ${LOG_AMOUNT} ${BLOCKS}.` },
    ],
  },
  {
    id: 'verschieben',
    done: 'verschieben:versandportal',
    hints: [
      {
        when: 'place:versandportal',
        target: '#tool-confirm',
        text: 'Zieh das Portal näher ans Holzfällerlager – lass 2 bis 3 Felder Platz für ein Förderband – und tippe auf „✓ Hierhin“.',
      },
      { when: 'info:versandportal', target: 'info:move', text: 'Tippe auf „↔ Verschieben“. Verschieben und Drehen kosten nichts.' },
      { when: 'modal', target: '#modal-close', text: 'Schließ dieses Fenster mit ✕.' },
      { target: 'building:versandportal', text: 'Das Versandportal schickt Waren in deinen Laden. Rück es näher ans Holzfällerlager: Tippe es an.' },
    ],
  },
  {
    id: 'band',
    done: 'angekommen',
    hints: [
      {
        when: 'mode:belt',
        target: 'port:holzfaeller:out',
        text: 'Zieh mit dem Finger von hier – am orangen Pfeil des Holzfällerlagers – bis zum blauen Pfeil des Portals. Danach „✓ Fertig“.',
      },
      { when: 'mode:menu', target: 'tool:belt', text: `Tippe auf „Förderband“. Ein Feld kostet ${BELT_BLOCKS} Holzblock.` },
      { when: 'tool', target: '#tool-cancel', text: 'Brich das hier mit „✕ Abbrechen“ ab.' },
      { when: 'modal', target: '#modal-close', text: 'Schließ dieses Fenster mit ✕.' },
      {
        when: 'belts',
        target: 'building:versandportal',
        text: `Gleich kommen die ersten ${BLOCKS} im Portal an. Kommt nichts an? Das Band muss am blauen Pfeil des Portals enden.`,
      },
      { target: '#btn-build', text: `Jetzt verbindest du beide mit einem Förderband: Tippe auf „🔨 Bauen“. Es bringt die ${BLOCKS} zum Portal.` },
    ],
  },
  {
    id: 'lager',
    done: 'laden:lager',
    hints: [
      { when: 'shop', target: 'tab:lager', text: 'Tippe auf „📦 Lager“.' },
      { when: 'modal', target: '#modal-close', text: 'Schließ dieses Fenster mit ✕.' },
      { when: 'mode:menu', target: '#build-close', text: 'Schließ die Bauleiste mit ✕ und öffne dann den Laden.' },
      { when: 'tool', target: '#tool-confirm', text: 'Tippe auf „✓ Fertig“ und öffne dann den Laden.' },
      { target: '#btn-shop', text: `Die ersten ${BLOCKS} sind da! Alles, was ins Versandportal läuft, landet in deinem Laden-Lager. Öffne den Laden.` },
    ],
  },
  {
    id: 'theke',
    done: 'verkauft',
    hints: [
      { when: 'amount', target: 'amount:ok', text: 'Wähle die Menge – „Alle“ legt so viele hin, wie passen – und tippe auf „✓ Auf die Theke“.' },
      { when: 'picker', target: 'pick:holzblock', text: 'Wähle den Holzblock.' },
      { when: 'stocked', target: 'counter:stocked', text: 'Gut! Jeder Kunde kauft 1 Stück und zahlt mit Gold. Gleich kommt der erste …' },
      { when: 'shop:theken', target: 'counter:ware', text: 'Tippe bei einer leeren Theke auf „➕ Ware wählen“.' },
      { when: 'shop', target: 'tab:theken', text: `Hier im Lager liegen deine ${BLOCKS}. Verkaufen kannst du sie an einer Theke: Tippe auf „🛒 Theken“.` },
      { when: 'modal', target: '#modal-close', text: 'Schließ dieses Fenster mit ✕.' },
      { when: 'mode:menu', target: '#build-close', text: 'Schließ die Bauleiste mit ✕ und öffne dann den Laden.' },
      { when: 'tool', target: '#tool-confirm', text: 'Tippe auf „✓ Fertig“ und öffne dann den Laden.' },
      { target: '#btn-shop', text: `Öffne den Laden und leg ${BLOCKS} auf eine Theke – dort kaufen die Kunden.` },
    ],
  },
  {
    id: 'haendler',
    done: 'kaufen:holzstamm',
    hints: [
      { when: 'shop:haendler', target: 'buy:holzstamm', text: `Kauf einen ${LOG}. Er kommt ins Laden-Lager – von dort legst du ihn ins Holzfällerlager.` },
      { when: 'shop', target: 'tab:haendler', text: 'Dein erstes Gold! Neue Rohstoffe kaufst du beim Händler: Tippe auf „🧺 Händler“.' },
      { when: 'modal', target: '#modal-close', text: 'Schließ dieses Fenster mit ✕.' },
      { when: 'mode:menu', target: '#build-close', text: 'Schließ die Bauleiste mit ✕ und öffne dann den Laden.' },
      { when: 'tool', target: '#tool-confirm', text: 'Tippe auf „✓ Fertig“ und öffne dann den Laden.' },
      { target: '#btn-shop', text: 'Dein erstes Gold! Neue Rohstoffe kaufst du beim Händler im Laden. Öffne den Laden.' },
    ],
  },
  {
    id: 'auftrag',
    done: 'level',
    hints: [
      { when: 'modal', target: '#modal-close', text: 'Schließ dieses Fenster mit ✕. Oben bei „Laden-Level“ warten die Aufträge der Bewohner.' },
      { when: 'mode:menu', target: '#build-close', text: 'Schließ die Bauleiste mit ✕.' },
      { when: 'tool', target: '#tool-confirm', text: 'Tippe auf „✓ Fertig“.' },
      { target: '#btn-level', text: 'Zum Schluss: Tippe oben auf „Laden-Level“. Dort warten die Aufträge der Bewohner.' },
    ],
  },
];

// Ereignisse aus der Fabrik (zählen nur bei einem neuen Spiel, siehe oben)
export const TUTORIAL_FACTORY_EVENTS = ['angekommen', 'verkauft'];
