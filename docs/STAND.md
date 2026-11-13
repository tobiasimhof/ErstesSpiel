# Stand

> Zu Beginn jedes Chats lesen (zusammen mit `docs/SPIEL.md`). Wird bei jeder Version aktualisiert: Status, offene Fragen und die **letzten 3 Arbeitsschritte** (der neueste oben; der älteste fällt weg – vollständig steht jeder Schritt im Archiv).

| | |
|---|---|
| **Aktuelle Version** | v0.25.1 – Entwurf Level 9–12 (nur Doku) |
| **Phase** | M2 – Produktionsketten (Kräuter-Kapitel ab Level 7) |
| **Spielen (live)** | https://tobiasimhof.github.io/ErstesSpiel/ |
| **Nächster Schritt** | **Tobias testet v0.25.0** (schnellere Kunden ab Level 4) und sagt, was er vom **Entwurf Level 9–12** hält (`docs/archiv/PLAENE.md`, 5 Fragen am Ende). Danach Level 9 umsetzen. |

**Tobias' Fabrik** (Screenshots vom 11.11.2026, Gold und Werte vor v0.23.0 – seitdem durch 3): Level 8, ganze Fläche gekauft (38 × 30), **43.870 Gold** (heute 14.623), Laden-Lager 1.004 / 1.000, Waren im Wert von **166.579 Gold** (heute etwa 55.500) (u. a. 61 Zahnradwellen, 69 Räderwerke, 70 Verstärkte Holzplatten, 38 Gewichtsteine). Er spielt seit einigen Versionen auf Level 8 weiter, ohne Aufträge, um zu testen, ob eine Fabrik, die **jede Ware mindestens einmal** herstellt, auf die Fläche passt: Sie passt (alles außer der Pflanzenreihe in voller Größe), rechts und unten in der Mitte ist noch Platz frei – „Der Platz reicht mir.“ Alle Rohstoff-Gebäude hat er 5- bis 6-mal aufgefüllt (etwa 4 bis 4,5 Stunden Produktion). Etwa 8 Holzfällerlager, 9 Steinbrüche, 7 Schmelzhütten, 6 Schmieden, 3 Sägewerke, 3 Steinmetze, 3 Zimmereien, 3 Feinschmieden (Scharnier, Schlüssel, Zirkel), 3 Schlossereien, 5 Beete, 2 Erntebänke, Webstube, Kräuterstube; jede Ausgabe endet in einem Lagerhaus. **Versandportale baut er nicht** – volle Lagerhäuser räumt er von Hand aus oder füllt damit das Lagerhaus einer anderen Straße. Er spielt auf dem Tablet und nutzt für Aufträge den Test-Knopf. Chat 18: Er hat eine Straße umgebaut – seine Scharniere kommen nicht mehr auf die Theke, sondern gehen in Zirkel und Vorhängeschlösser. Seit v0.24.0 hat er 2 Theken (vorher 5); was auf den Theken 3 bis 5 stand, liegt im Laden-Lager. Den Test von v0.23.0 fand er gut („hat sich gut angefühlt“, Chat 19). Mit v0.24.0 hat er sofort Theke 3 und 4 gekauft und alles aufgefüllt – danach blieben etwa 6.000 Gold, Theke 5 ist „noch in weiter Ferne“. Er macht jetzt nebenbei die Aufträge, um „realistischer“ auf Level 9 zu kommen.

## Fahrplan

| | Meilenstein | Inhalt |
|---|---|---|
| M0 | Planung | Regeln, Konzept, Fahrplan |
| M1 | Fabrik-Grundgerüst | Spielfeld, Bauen, Bänder, erste Kette, Speichern, Offline-Produktion – erledigt |
| **M2** | **Produktionsketten** | **jetzt:** Werkzeug-Kapitel (Level 1–6) fertig, Kräuter-Kapitel ab Level 7 läuft |
| M3 | Wirtschaft & Fortschritt | Nachfrage und Trends, Laden-Ausbau mit Waren, evtl. Freischaltpunkte (Laden-Level, Aufträge und Fläche kaufen gibt es schon) |
| M4 | Optik & Gefühl | Grafik, Animationen, Sound, Einführung für neue Spieler |
| M5 | Online | Spielerkonto, Spielstand auf dem Server, globaler Schwarzmarkt |
| M6 | Clans & Handel | Clans, Handel zwischen Spielern |
| M7 | App | Android und iOS |

**Nächste Schritte** (der Reihe nach; neu geordnet von Tobias in Chat 19; jeder Schritt erst nach Tobias' OK):

1. **Techbaum ab Level 9** (Tobias, Chat 19): „Die Kräutersachen laufen eigentlich relativ gut und schnell, wodurch ich nicht glaube, dass man lange auf den Kräuterleveln bleiben wird, daher sollten wir uns dann auch weiter mit dem Techbaum beschäftigen für Level 9, 10 etc.“ **Entwurf Level 9–12** steht (v0.25.1, `docs/archiv/PLAENE.md`, offene Frage 14) – wartet auf Tobias' Antworten; danach ein Level je Version umsetzen.
2. **Nach hinten verschoben** (Tobias, Chat 19): die drei folgenden Schritte.
3. **Was Tester brauchen** – mit v0.22.0 können Tester auch auf Tobias' Tablet spielen (sichern → neues Spiel → Tester spielt → laden); Testmodus und Test-Knopf bleiben sichtbar. Eine kurze Einführung bleibt im Hinterkopf (M4) (offene Frage 13).
4. **Bereich kopieren** (Tobias: „sehr wichtig“) – einen markierten Bereich als Ganzes noch einmal bauen, wenn die Waren reichen (Tobias baut gleiche Straßen mehrfach). Plan noch zu machen.
5. **Weiche** (Tobias: „sehr sinnvoll“, offene Frage 5) – trennt eine Spur in zwei (hier nur Stäbe, dort nur Bleche). Plan noch zu machen.
6. **Später:** Verbesserungen mit Erfahrung (Frage 7), gründliche Durchsicht des Codes.

Abgelehnt: „Umlagern“, „Alle auffüllen“, Fabrik-Übersicht pro Minute, Ring pro Stück bei Rohstoff-Gebäuden.

## Offene Fragen

1. **Gold-Gleichgewicht testen** (Tobias, Chat 18): Er möchte verhindern, dass es Produkte gibt, „mit denen man zu schnell zu viel Gold macht“, hat aber „ein wenig die Angst, dass wir zu viel regulieren“ – deshalb: umsetzen und testen. Beobachtung: Scharniere direkt verkaufen brachte ihm viel Gold; seit seine Straßen Zirkel und Vorhängeschlösser machen, fällt dieser Gewinn weg. Claudes Rechnung: Je Rohstoff bringt die längere Straße mehr (1 Eisenerz = 2⅔ Scharniere für 1.152 Gold oder 2 Zirkel für 1.324); je Minute kann es weniger sein, weil Zirkel und Vorhängeschloss je 30 s brauchen und die Räderwerke jetzt ins Schloss gehen statt auf die Theke. Seit v0.24.0 zählen die Theken Stück (ab Level 7 je Theke 0,75 pro Minute) – teure Waren aus langen Straßen bringen damit deutlich mehr als viele billige. Stellschrauben sind das Tempo je Level und die Theken-Preise (je eine Zahl in `data/shop.js`). Der kleinere Aufschlag bleibt in der Hinterhand. **Test von v0.24.0 (Chat 19):** Mit seinem Gold konnte Tobias Theke 3 und 4 kaufen und alles auffüllen (6.000 Gold blieben). Aber: „Man stellt jetzt deutlich mehr Ware her, als man verkauft, deswegen sollten wir dieses Verhältnis auch ein wenig anpassen.“ Er möchte Waren, die er gerade nicht weiterverarbeiten kann, schneller verkaufen, „damit das Lager nicht zu voll wird“ → v0.25.0: je Theke ab Level 7 alle 45–60 Sekunden ein Kunde (etwa 1,1 statt 0,75 Stück pro Minute; seine 4 Theken etwa 274 statt 180 Stück pro Stunde). Nach seinem Test wieder prüfen.
2. **Kräuterstube mit 2 Eingängen** ist gebaut und angeschlossen (v0.18.2), Tobias' Urteil steht noch aus.
3. **Platzhalter-Zahlen:** Aufstiegspreise, Auftragsmengen, Baukosten. Kostet der Laden-Ausbau später zusätzlich Waren? Begrenzt das Level die kaufbare Fläche?
4. **6. Theke** (Tobias, Chat 19): „Wir brauchen im späteren Spielverlauf noch eine sechste, damit die Thekenansicht auch voll ist, aber da können wir den Preis noch offen lassen.“ Bis dahin steht sie als „🔒 Kommt später im Spiel“ im Laden (ein Preis in `COUNTERS.prices` in `data/shop.js` macht sie kaufbar).
5. **Weiche** (von Tobias gewünscht, Chat 15): trennt eine Spur in zwei, „sodass man sagen kann, hier laufen nur Stäbe und hier nur Bleche“ – damit die Produktionsstraßen länger werden. Noch zu planen: eigenes Gebäude oder Band-Feld, wie man die Ware je Ausgang einstellt, was mit Waren passiert, die zu keinem Ausgang passen.
6. **Eiserner Bestand:** Ein Mindestbestand im Laden-Lager, den die Theken nicht anrühren? Nur, wenn Tobias das möchte.
7. **Verbesserungen mit Erfahrung** (Tobias' Idee; er will sie erst später einführen): z. B. schneller verarbeiten, schnellere Bänder, größerer Rohstoff-Vorrat; die Theke verbessern, „damit man 10 % mehr Kundschaft oder so was bekommt“ (Chat 17). Das Spiel zählt alle Erfahrung mit (`xpTotal`, auch die vom Test-Knopf).
8. **Laden-Lager über der Grenze:** Abreißen und Ausräumen geben Waren auch über die Grenze zurück (Tobias hatte 1.500 bei 1.000 Plätzen); bis wieder Platz ist, nimmt das Versandportal nichts an. Lagerhäuser sind damit ein Zusatzlager (10 Lagerhäuser = 1.500 Plätze). Für Tobias in Ordnung – beobachten.
9. **Claudes Lesarten**, die Tobias jederzeit ändern kann (je eine Zahl in `data/shop.js`): Laden-Lager 1.000 erst ab Level 4; mittlere Theken ab Level 4, große ab Level 5. Seit v0.24.0: Jeder Kunde kauft 1 Stück (je Theke kommt Level 1–3 alle 15–25 Sekunden einer, ab Level 4 alle 30–50, ab Level 7 alle 60–100); vor dem Kauf einer Theke kommt eine Rückfrage; die Theken-Ansicht zeigt immer 6 Plätze.
10. **Einstieg:** Tobias' Idee, am Anfang vor allem die Massenproduktion auszubauen – später austesten.
11. **Pleiteschutz:** Ein Rohstoff ohne passendes Gebäude verhindert das Geschenk – bewusst so gelassen, beobachten.
12. **Vor v1.0:** Test-Knopf entfernen (`QUEST_TEST_SKIP = false`). Später: Schwarzmarkt und verbundene Läden (M5), Arbeitstitel.
13. **Anderen das Spiel zeigen** (nach hinten verschoben, Chat 19) (Tobias, Chat 15): Er möchte den jetzigen Stand anderen zum Testen geben, ohne dass sein Spielstand verloren geht. Jedes Gerät hat seinen eigenen Spielstand – wer den Link auf seinem eigenen Gerät öffnet, beginnt ein neues Spiel und berührt Tobias' Fabrik nicht. Tobias (Chat 16): „Das können wir im Hinterkopf behalten, aber ich möchte frühestens nächste Woche jemandem das Spiel zeigen.“ Seit v0.22.0 geht beides ohne zweiten Spielstand: auf eigenen Geräten (Start bei Level 1 oder Tobias' Datei laden) oder auf Tobias' Tablet (sichern → neues Spiel → Tester spielt → laden). Testmodus und Test-Knopf bleiben sichtbar. Noch offen: kurze Einführung?

14. **Techbaum: Werkzeuge, Kräuter und Tränke wachsen parallel** (Tobias, Chat 19): Ab Level 7 konzentriert man sich auf die Kräuter und kann die Werkzeuge nicht mehr weiterverarbeiten (wer schnell durch die Kräuter-Level kommt, macht damit etwas Gold). „Zirkel + Kräuter ergibt für mich noch keine sinnvolle Weiterverarbeitung“ – Werkzeuge und Kräuter werden erst über neue Rohstoffe wie Glas (Kolben) zu **Tränken** zusammengeführt. Deshalb soll das **Werkzeug-Kapitel selbst weiterwachsen**, parallel zu Kräutern und Tränken. Bisher ohne Weiterverarbeitung: Zirkel, Schlüssel, Verstärkte Holzplatte, Vorhängeschloss (ebenso Gewichtstein und Uhrwerk). Tobias' Ideen: Schlüssel + Vorhängeschloss in einer weiteren Maschine; Verstärkte Holzplatte + Zirkel + Fasern für ein Zeichenbrett „oder Ähnliches“. (Claudes erste Lesart „Kräuter-Rezepte mit Zirkeln“ war nicht gemeint.) Tobias' Vorgaben (Chat 19): erst Werkzeuge, dann Kräuter, dann Tränke einführen, aber die Werkzeuge sollen von Level 7 bis 12 nicht stillstehen; **höchstens 2 Eingänge je Maschine**, jedes Produkt entsteht logisch aus seinen Zutaten; 1–2 weitere Kräuter für verschiedene Tränke; Randidee **Holzkohle** aus Baumstämmen für weitere Produkte. **Claudes Entwurf Level 9–12** (v0.25.1, `PLAENE.md`): 9 Die Schreibstube (Kohlenmeiler, Schreibstube: Zeichenbrett, Reißzeug), 10 Das Spital (Schafgarbe, Wundverband), 11 Die Uhrmacherei (Räderuhr, Kastenschloss, Sternenuhr), 12 Die Apotheke (Kamille, Kräutermischung, Kamillenkissen, Heilpäckchen; Reißbrett). Offen: Tobias' Antworten auf die 5 Fragen des Entwurfs.

## Die letzten 3 Arbeitsschritte

### v0.25.1 – Entwurf Level 9–12 (13.11.2026, nur Doku)

- **Tobias (Chat 19):** Erst Werkzeuge, dann Kräuter, dann Tränke einführen – aber die Werkzeuge sollen ab Level 7 nicht stillstehen. Fasern und Verstärkte Holzplatte zu etwas, worauf man zeichnen kann; den Zirkel zu etwas für die Wissenschaft. 2 Eingänge je Maschine bleiben. 1–2 weitere Kräuter für verschiedene Tränke; Randidee: Holzkohle aus Baumstämmen.
- **Claude:** Entwurf Level 9–12 in `docs/archiv/PLAENE.md` – abwechselnd Werkzeuge (9 Schreibstube mit Kohlenmeiler, 11 Uhrmacherei) und Kräuter (10 Spital mit Schafgarbe, 12 Apotheke mit Kamille), Aufträge aus beiden Bereichen; 5 Fragen an Tobias.
- Spiel unverändert, nur die Versionsnummer steigt.

### v0.25.0 – Kunden-Tempo angeglichen (13.11.2026)

- **Warum (Tobias, Chat 19):** „Man stellt jetzt deutlich mehr Ware her, als man verkauft“ – Waren, die man nicht weiterverarbeiten kann, sollen schneller verkauft sein, damit das Lager nicht volläuft. Freigabe: „Ja, darfst du gerne so umsetzen.“
- **Umgesetzt:** Je Theke kommt Level 4–6 alle 25–45 Sekunden ein Kunde (vorher 30–50), ab Level 7 alle 45–60 (vorher 60–100); Level 1–3 bleibt bei 15–25. Die Datentabelle nennt die Sekunden direkt; Laden und Kauf-Rückfrage zeigen sie an. Spielstand unverändert.
- **Außerdem (Chat 19):** Tobias' Bild vom Techbaum festgehalten – Werkzeuge, Kräuter und Tränke wachsen parallel (offene Frage 14).
- **Offen:** Tobias testet; danach den Techbaum planen.

### v0.24.1 – Kunden schneller, danach der Techbaum (13.11.2026, nur Doku)

- **Tobias (Chat 19), Test von v0.24.0:** Theke 3 und 4 gekauft, alles aufgefüllt, 6.000 Gold übrig. Man stellt deutlich mehr her, als man verkauft – er will Waren, die er nicht weiterverarbeiten kann, schneller verkaufen. Wunsch: je Theke Level 4–6 alle 25–45 Sekunden, ab Level 7 alle 45–60 Sekunden ein Kunde. Im Kräuter-Kapitel entstehen „überproportional viele Zirkel etc.“; die Kräuter-Level gehen schnell – als Nächstes der Techbaum für Level 9, 10 … Tester, Bereich kopieren und Weiche kommen später.
- **Claude:** Entwurf v0.25.0 „Kunden-Tempo angleichen“ (offene Frage 1), Lesart und Ideen zu den Werkzeug-Waren (offene Frage 14), neue Reihenfolge der nächsten Schritte.
- Spiel unverändert, nur die Versionsnummer steigt.
