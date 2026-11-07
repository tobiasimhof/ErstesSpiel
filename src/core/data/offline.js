// Spiel im Hintergrund (v0.14.0, Tobias): Die Fabrik läuft weiter, bis
// Rohstoffe, Zutaten oder Theken leer sind (oder das Laden-Lager voll ist).
// Beim Zurückkommen wird die verpasste Zeit nachgerechnet. Platzhalter.

export const OFFLINE = {
  // Ab so vielen Sekunden zwischen zwei Bildern gilt das Spiel als „weg
  // gewesen“ (App im Hintergrund, Gerät im Standby) und rechnet nach.
  gapSeconds: 3,
  // Höchstens so viel Zeit wird nachgerechnet (Schutz vor einer falsch
  // gestellten Uhr). Nach wenigen Stunden steht ohnehin alles still.
  maxSeconds: 30 * 24 * 3600,
  // So lange rechnet die Fabrik höchstens Takt für Takt nach. Mit 3
  // Rohstoffen je Gebäude (45 Minuten) steht sie lange vorher still; die
  // Grenze greift nur, wenn Waren endlos im Kreis laufen. Danach rechnen
  // nur noch die Kunden weiter.
  maxBusySeconds: 4 * 3600,
  // Alle so viele Sekunden wird geprüft, ob die Fabrik stillsteht. Dann
  // kaufen nur noch Kunden ein – das geht im Schnelldurchlauf.
  checkSeconds: 10,
  // Ab so langer Abwesenheit erscheint eine kurze Meldung …
  toastSeconds: 60,
  // … und ab so langer das Fenster „Willkommen zurück“.
  reportSeconds: 600,
};
