// Laden-Level und Aufträge (v0.13.0, Modell von Tobias).
//
// Der rote Faden: Dein Laden liegt in einem kleinen Ort am Fluss, der wächst.
// Jedes Level ist ein Bauabschnitt des Ortes. Die Bewohner geben Aufträge –
// immer einer nach dem anderen, 2–5 je Level. Wer einen Auftrag abgibt
// (die Waren kommen aus dem Laden-Lager), bekommt Erfahrung (XP) und Gold.
// Mit genug Erfahrung lässt sich das nächste Level freischalten; kaufen muss
// man es mit Gold. Danach braucht man Bauteile für die neuen Maschinen.
//
// Was ein Level freischaltet, steht direkt bei den Gebäuden (level in
// data/buildings.js) und bei den Rohstoffen (level in data/items.js).
//
// name:   Bauabschnitt des Ortes (Überschrift des Levels)
// story:  ein, zwei Sätze, was im Ort gerade passiert
// cost:   so viel Gold kostet der Aufstieg auf dieses Level
// gift:   gibt es beim Aufstieg gratis ins Laden-Lager (zu Beginn jedes
//         Levels ein Rohstoff; Level 1: der Holzstamm im Startvorrat)
// quests: Aufträge, die man AUF diesem Level erledigt. Ihre Erfahrung reicht
//         zusammen genau für den Aufstieg auf das nächste Level.
//         from: wer bestellt, text: wofür, items: was abgegeben wird.
// Mengen sind Platzhalter (Tobias: Man soll für die Stückzahl schon ein wenig
// in die Masse gehen müssen).

export const LEVELS = {
  1: {
    name: 'Die ersten Hütten',
    story: 'Am Fluss entsteht ein kleiner Ort. Die ersten Familien brauchen Hütten – und du hast das Holz.',
    quests: [
      { from: 'Zimmermann Jakob', text: 'Ich baue die erste Hütte am Fluss. Für die Wände brauche ich Holzplatten.', items: { holzplatte: 5 } },
      { from: 'Zimmermann Jakob', text: 'Das Dach ruht auf Holzstäben. Bringst du mir welche?', items: { holzstab: 10 } },
      { from: 'Bürgermeisterin Hilde', text: 'Willkommen im Ort! Die Weide braucht einen Zaun, bevor uns die Ziegen davonlaufen.', items: { holzstab: 20, holzplatte: 10 } },
    ],
  },
  2: {
    name: 'Wege und Brunnen',
    story: 'Der Ort wächst. Die Wege versinken im Matsch, und Wasser holt man noch mit Eimern am Fluss.',
    cost: 100,
    gift: { felsbrocken: 1 },
    quests: [
      { from: 'Steinmetzin Berta', text: 'Der Weg zum Fluss wird gepflastert. Dafür brauche ich Steinplatten.', items: { steinplatte: 10 } },
      { from: 'Steinmetzin Berta', text: 'Die Winde für den neuen Brunnen läuft über Zahnräder.', items: { steinzahnrad: 10 } },
      { from: 'Bürgermeisterin Hilde', text: 'Der Dorfplatz bekommt einen Brunnen mit einem kleinen Holzdach.', items: { steinplatte: 20, holzstab: 10 } },
    ],
  },
  3: {
    name: 'Die Dorfschmiede',
    story: 'Mit dem Eisen kommt ein Schmied in den Ort. Werkzeug, Beschläge, Pflüge – alle wollen jetzt etwas aus Eisen.',
    cost: 250,
    gift: { eisenerz: 1 },
    quests: [
      { from: 'Schmied Konrad', text: 'Meine Esse brennt! Für Hämmer und Zangen brauche ich Eisenstangen.', items: { eisenstange: 5 } },
      { from: 'Schmied Konrad', text: 'Die Truhen im Rathaus bekommen Beschläge aus Eisenblech.', items: { eisenblech: 5 } },
      { from: 'Bürgermeisterin Hilde', text: 'Die Bauern brauchen neue Pflüge – Eisen für die Schar, Holz für den Rahmen.', items: { eisenstange: 10, holzplatte: 10 } },
    ],
  },
  // Ab Level 4 schaltet jedes Level eine Kombi-Maschine frei (v0.10.0). Einen
  // vierten Rohstoff gibt es nicht, deshalb gibt es jeweils 1 Eisenerz.
  4: {
    name: 'Die Mühle am Fluss',
    story: 'Das Korn muss gemahlen werden. Müllerin Grete baut eine Mühle am Fluss – mit Wellen und Räderwerken aus deiner Zimmerei.',
    cost: 500,
    gift: { eisenerz: 1 },
    quests: [
      { from: 'Müllerin Grete', text: 'Das Mühlrad dreht sich schon. Jetzt fehlen die Wellen, die seine Kraft ins Haus tragen.', items: { zahnradwelle: 2 } },
      { from: 'Müllerin Grete', text: 'Für das Mahlwerk brauche ich Räderwerke – viele kleine Räder, die ineinandergreifen.', items: { raederwerk: 4 } },
      { from: 'Müllerin Grete', text: 'Die Mühlentür muss Wind und Wetter aushalten.', items: { verstaerkteholzplatte: 2 } },
      { from: 'Bürgermeisterin Hilde', text: 'Die Mühle läuft so gut, dass der Ort eine zweite will. Grete braucht noch einmal alles – in größerer Menge.', items: { raederwerk: 8, zahnradwelle: 4 } },
    ],
  },
  5: {
    name: 'Der Markt',
    story: 'Händler kommen in den Ort, und mit ihnen Marktstände, Kassen und große Pläne.',
    cost: 1000,
    gift: { eisenerz: 1 },
    quests: [
      { from: 'Händlerin Marta', text: 'Meine Marktstände bekommen Klappen, die man hochklappen kann.', items: { scharnier: 2 } },
      { from: 'Händlerin Marta', text: 'Jede Kasse auf dem Markt braucht einen Schlüssel.', items: { schluessel: 2 } },
      { from: 'Baumeister Anton', text: 'Ich vermesse den neuen Marktplatz. Ohne Zirkel geht das nicht.', items: { zirkel: 1 } },
      { from: 'Händlerin Marta', text: 'Zum ersten Markttag will jeder Händler einen eigenen Stand mit Kasse.', items: { scharnier: 3, schluessel: 3 } },
    ],
  },
  6: {
    name: 'Das Stadttor',
    story: 'Aus dem Dorf wird eine kleine Stadt. Sie bekommt eine Mauer, ein Tor mit Zugbrücke und einen Torturm mit Uhr.',
    cost: 2000,
    gift: { eisenerz: 1 },
    quests: [
      { from: 'Torwächter Ulrich', text: 'Die Zugbrücke hebt sich nur mit Gegengewichten.', items: { gewichtstein: 4 } },
      { from: 'Torwächter Ulrich', text: 'Nachts wird das Tor verschlossen – am besten doppelt.', items: { vorhaengeschloss: 2 } },
      { from: 'Bürgermeisterin Hilde', text: 'Der Torturm bekommt eine Uhr, damit das Tor pünktlich schließt.', items: { uhrwerk: 2 } },
      { from: 'Torwächter Ulrich', text: 'Die ganze Stadtmauer bekommt Pforten – jede mit Schloss und Gegengewicht.', items: { vorhaengeschloss: 4, gewichtstein: 4 } },
    ],
  },
};

export const MAX_LEVEL = Math.max(...Object.keys(LEVELS).map(Number));

// Belohnung eines Auftrags, berechnet aus dem Wert der verlangten Waren:
// Gold genau so viel wie an der Theke (Tobias: nicht mehr – man macht die
// Aufträge wegen der Erfahrung), Erfahrung 1 je 10 Gold Warenwert.
export const QUEST_REWARD = { goldFactor: 1, xpPerGold: 0.1 };

// v0.15.0 (Tobias): Test-Knopf „🧪 Test: Auftrag erledigen“ im Level-Fenster,
// solange das Spiel ein Prototyp ist (bis v1.0 immer sichtbar). Er gibt die
// Erfahrung des Auftrags, nimmt keine Waren und gibt kein Gold – so lässt sich
// die Spielmechanik testen, ohne die Wirtschaft zu verfälschen.
// false blendet den Knopf aus.
export const QUEST_TEST_SKIP = true;
