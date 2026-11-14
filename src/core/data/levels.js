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
// v0.23.0: Aufstiegspreise durch 3 wie alle Preise, auf 10 gerundet
// (vorher 100, 250, 500, 1.000, 2.000, 3.000, 4.000).

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
    cost: 30,
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
    cost: 80,
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
    cost: 170,
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
    cost: 330,
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
    cost: 670,
    gift: { eisenerz: 1 },
    quests: [
      { from: 'Torwächter Ulrich', text: 'Die Zugbrücke hebt sich nur mit Gegengewichten.', items: { gewichtstein: 4 } },
      { from: 'Torwächter Ulrich', text: 'Nachts wird das Tor verschlossen – am besten doppelt.', items: { vorhaengeschloss: 2 } },
      { from: 'Bürgermeisterin Hilde', text: 'Der Torturm bekommt eine Uhr, damit das Tor pünktlich schließt.', items: { uhrwerk: 2 } },
      { from: 'Torwächter Ulrich', text: 'Die ganze Stadtmauer bekommt Pforten – jede mit Schloss und Gegengewicht.', items: { vorhaengeschloss: 4, gewichtstein: 4 } },
    ],
  },
  // v0.16.0: Das Kräuter-Kapitel beginnt (Tobias, Chat 11) – wieder einfach,
  // wie Level 1: Flachs → Fasern → Verbände. Weniger Erfahrung als Level 6,
  // weil das Kapitel von vorn anfängt.
  7: {
    name: 'Die Heilstube',
    story:
      'Vor dem neuen Stadttor rasten Reisende, Händler und Wachen – und manche kommen verletzt an. Heilerin Agnes zieht in den Ort und richtet eine Heilstube ein. Was sie braucht, wächst auf dem Feld: Flachs.',
    cost: 1000,
    gift: { leinsamen: 1 },
    quests: [
      { from: 'Heilerin Agnes', text: 'Ich richte am Stadttor eine Heilstube ein. Für den Anfang brauche ich saubere Verbände.', items: { verband: 5 } },
      { from: 'Heilerin Agnes', text: 'Aus Flachsfasern zupfe ich weiche Polster für die Wunden.', items: { flachsfaser: 50 } },
      { from: 'Torwächter Ulrich', text: 'Meine Wachen holen sich beim Üben Schrammen. Die Wachstube soll einen eigenen Vorrat haben.', items: { verband: 15 } },
      { from: 'Bürgermeisterin Hilde', text: 'Zum Markttag kommen viele Reisende. Agnes braucht einen großen Vorrat.', items: { verband: 20, flachsfaser: 50 } },
    ],
  },
  // v0.17.0: Die Ringelblume kommt dazu und die erste Maschine mit zwei
  // Eingängen (Tobias, Chat 11). Teurer, bringt aber mehr.
  8: {
    name: 'Der Kräutergarten',
    story: 'Die Heilstube ist voll. Agnes legt hinter dem Haus einen Kräutergarten an – die Ringelblume heilt Wunden schneller als jeder Verband allein.',
    cost: 1330,
    gift: { ringelblumensamen: 1 },
    quests: [
      { from: 'Heilerin Agnes', text: 'Hinter der Heilstube lege ich einen Kräutergarten an. Bring mir getrocknete Ringelblüten.', items: { ringelbluete: 50 } },
      { from: 'Heilerin Agnes', text: 'Verband und Ringelblüten zusammen ergeben einen Heilverband – damit heilen Wunden schneller.', items: { heilverband: 5 } },
      { from: 'Torwächter Ulrich', text: 'Nach dem Turnier haben meine Wachen Beulen und Prellungen. Kräuterkompressen lindern das.', items: { kraeuterkompresse: 5 } },
      { from: 'Bürgermeisterin Hilde', text: 'Der Ort baut ein kleines Spital. Agnes braucht einen Vorrat für die Kranken.', items: { heilverband: 10, verband: 20 } },
    ],
  },
  // v0.26.0: Level 9 (Tobias, Chat 19): Die Werkzeuge wachsen weiter, während
  // das Kräuter-Kapitel läuft – abwechselnd ein Werkzeug-Level (9, 11) und ein
  // Kräuter-Level (10, 12), die Aufträge verlangen Waren aus beiden Bereichen.
  // Einen neuen Rohstoff gibt es nicht: 1 Holzstamm für den Kohlenmeiler.
  9: {
    name: 'Die Schreibstube',
    story:
      'Die Stadt wächst schneller, als man bauen kann. Baumeister Anton richtet eine Schreibstube ein und zeichnet Pläne für Spital, Rathaus und eine Ratsuhr – mit Zirkel und Kohle, die ein Köhler draußen im Wald brennt.',
    cost: 1670,
    gift: { holzstamm: 1 },
    quests: [
      { from: 'Schmied Konrad', text: 'Holzkohle brennt heißer als Holz. Für meine Esse will ich nichts anderes mehr.', items: { holzkohle: 50 } },
      { from: 'Baumeister Anton', text: 'In der Schreibstube fehlen Zeichenbretter – mit Leinen bespannt, damit die Kohle darauf hält.', items: { zeichenbrett: 3 } },
      { from: 'Baumeister Anton', text: 'Meine Gehilfen brauchen eigenes Reißzeug: Zirkel und Zeichenkohle im Etui.', items: { reisszeug: 2 } },
      { from: 'Bürgermeisterin Hilde', text: 'Anton zeichnet das Spital. Bis es steht, braucht Agnes Heilverbände – und Anton noch mehr Zeichenbretter.', items: { zeichenbrett: 4, heilverband: 10 } },
    ],
  },
  // v0.27.0: Level 10 (Entwurf v0.25.1, Tobias, Chat 20: „Ja, darfst du.“) –
  // ein Kräuter-Level: Schafgarbe und Wundverband; die Aufträge verlangen auch
  // Werkzeug-Waren. Dazu mehr Fläche (LAND_MORE in data/land.js).
  10: {
    name: 'Das Spital',
    story:
      'Antons Pläne sind gebaut: Am Stadttor steht jetzt ein Spital. Agnes pflegt dort Kranke und Verwundete und braucht ein Kraut, das Blut stillt – die Schafgarbe. Der Ort wächst über seine alten Grenzen hinaus.',
    cost: 2000,
    gift: { schafgarbensamen: 1 },
    quests: [
      { from: 'Heilerin Agnes', text: 'Das Spital ist fertig. Ich brauche Schafgarbe – sie stillt Blut wie kein anderes Kraut.', items: { schafgarbenbluete: 50 } },
      { from: 'Heilerin Agnes', text: 'Heilverband und Schafgarbe zusammen ergeben einen Wundverband – für tiefe Schnitte.', items: { wundverband: 5 } },
      { from: 'Bürgermeisterin Hilde', text: 'Die Arzneien im Spital gehören hinter Schloss und Riegel.', items: { vorhaengeschloss: 2 } },
      { from: 'Torwächter Ulrich', text: 'Räuber haben einen Händlerzug überfallen. Ich bringe die Verwundeten ins Spital.', items: { wundverband: 8, kraeuterkompresse: 10 } },
    ],
  },
  // v0.28.0: Level 11 (Entwurf v0.25.1, Tobias, Chat 20) – ein Werkzeug-Level.
  // Tobias: „Eisenerzgeschenke brauchen wir keine mehr. Das sollte mit Level 10
  // enden.“ – kein Geschenk. „Aufstieg können wir jetzt etwas anziehen und bei
  // 5000 Gold starten, damit wir auch etwas mit dem Cash Flow arbeiten können.“
  11: {
    name: 'Die Uhrmacherei',
    story:
      'Das Rathaus ist fertig, und Antons Pläne zeigen eine Ratsuhr. Uhrmacher Kaspar zieht in den Ort – er hat bei Ulrichs Schlossern gelernt und baut Uhren, Schlösser und sogar eine Uhr, die Sonne, Mond und Sterne zeigt.',
    cost: 5000,
    quests: [
      { from: 'Bürgermeisterin Hilde', text: 'Das Rathaus bekommt eine Ratsuhr. Uhrmacher Kaspar braucht zwei Räderuhren als Vorlage.', items: { raederuhr: 2 } },
      { from: 'Händlerin Marta', text: 'Meine Tageskasse braucht ein Schloss mit eigenem Schlüssel.', items: { kastenschloss: 2 } },
      { from: 'Baumeister Anton', text: 'Im Rathausturm soll eine Sternenuhr Sonne, Mond und Sterne zeigen.', items: { sternenuhr: 1 } },
      { from: 'Heilerin Agnes', text: 'Im Spital zählt jede Stunde – ich brauche Uhren und Wundverbände.', items: { raederuhr: 2, wundverband: 10 } },
    ],
  },
};

export const MAX_LEVEL = Math.max(...Object.keys(LEVELS).map(Number));

// Belohnung eines Auftrags, berechnet aus dem Wert der verlangten Waren:
// Gold genau so viel wie an der Theke (Tobias: nicht mehr – man macht die
// Aufträge wegen der Erfahrung), Erfahrung 3 je 10 Gold Warenwert.
// v0.23.0: Seit die Preise durch 3 geteilt sind, gibt es 3 statt 1 Erfahrung
// je 10 Gold – so bleibt die Erfahrung je Auftrag und Level wie vorher.
export const QUEST_REWARD = { goldFactor: 1, xpPerGold: 0.3 };

// v0.15.0 (Tobias): Test-Knopf „🧪 Test: Auftrag erledigen“ im Level-Fenster,
// solange das Spiel ein Prototyp ist (bis v1.0 immer sichtbar). Er gibt die
// Erfahrung des Auftrags, nimmt keine Waren und gibt kein Gold – so lässt sich
// die Spielmechanik testen, ohne die Wirtschaft zu verfälschen.
// false blendet den Knopf aus.
export const QUEST_TEST_SKIP = true;
