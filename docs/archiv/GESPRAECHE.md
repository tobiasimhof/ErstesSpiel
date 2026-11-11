# Gesprächsprotokoll

> **Archiv.** Wörtlich übernommen aus der README bis v0.18.0 (Abschnitt 10). Hier wird nur gesucht, nicht zu Beginn eines Chats gelesen. Verweise wie „Abschnitt 4.2“ oder „offene Frage 12“ beziehen sich auf die alte README: Abschnitte 3, 4 und 8 stehen in `KONZEPT-VERLAUF.md`, 6 in `PLAENE.md`, 7 in `ENTSCHEIDUNGEN.md`, 9 in `VERSIONEN.md`, 10 in `GESPRAECHE.md`. Den aktuellen Stand beschreiben `docs/SPIEL.md` und `docs/STAND.md`.

Neuester Chat oben. Was Tobias gesagt hat, was Claude vorgeschlagen hat, was umgesetzt wurde.

### 11.11.2026 – Chat 17: Gold-Gleichgewicht (v0.21.4 bis v0.21.6)

**Tobias** (mit drei Screenshots: seine Fabrik, das Laden-Lager): „Informiere dich über den aktuellen Spielstand. Ich bin auf Level 8 und hab aufgrund der Entwicklung erstmal weiter auf Level 8 gespielt ohne die Missionen zu machen, weil ich testen wollte, wie es mit dem Platz aussieht, wenn ich meine Fabrik so baue, dass ich jedes Teil mindestens 1x irgendwie herstellen kann, damit ich es auch verkaufen kann bzw. ich es nutzen kann, um die Missionen abzuschließen. Da ich die ganzen Missionen nie gemacht habe, habe ich natürlich keinen Vergleich bzgl. Balancing von Gold. Ich hab jetzt einige Versionen auf Level 8 gespielt und wollte dir mal zeigen, was ich alles habe, damit du das einordnen kannst. Ich hab einmal die komplette Fabrik (ich hab alles gebaut bis auf die komplette Reihe der Pflanzen, also keine richtige Produktion angefangen, sondern nur einmal gebaut) und hab jede Menge im Inventar (glaube einen Wert von 160.000 Gold). Meine Frage lautet: Ist das so in Ordnung, dass man quasi längere Zeit auf einem Level verbringt, um damit ‚unendlich Gold‘ zu generieren, oder wie können wir das steuern? Natürlich verstehe ich, dass man alles bauen muss, damit man die Missionen abschließen kann und man als Spieler eher damit beschäftigt ist, die Missionen zu machen, aber viel Gold bedeutet viele Möglichkeiten.“

**Claude** hat aus den Datentabellen nachgerechnet und eingeordnet (ausführlich in `PLAENE.md`, „Überlegung: Gold-Gleichgewicht“): Auf einem Level zu bleiben ist an sich in Ordnung, lohnt sich heute aber ohne Grenze. Gold fließt nur in Rohstoffe (die mit Gewinn zurückkommen), Aufstiege und Fläche (zusammen bisher 14.850 Gold, einmalig) – Tobias' Gold allein ist das Dreifache. Seine Fabrik verdient grob 30.000 bis 50.000 Gold pro Stunde, wenn alles läuft. Die Theken bremsen teure Waren nicht (mit Zirkeln bis 12.000 Gold pro Minute); alle heutigen Bremsen begrenzen nur, wie lange die Fabrik ohne einen läuft. Level 7/8 bringen beim Gold weniger als die besten Waren von Level 5/6. Fünf Möglichkeiten: A Aufstiege teurer, B Nachfrage (gleiche Ware wird billiger), C Kasse mit Obergrenze, D mehr, wofür man Gold ausgibt, E laufende Kosten (nicht empfohlen). Empfehlung: Farmen erlauben, aber Weiterspielen soll sich mehr lohnen – D + A zuerst, B als Bremse in M3. Nichts davon ist vor den ersten Testern nötig. Fragen an Tobias: Soll Gold durchgehend knapp bleiben? Welche Bremse? Wie viele Stunden auf Level 8? Reicht der Platz?

**Umgesetzt:** v0.21.4 (nur Doku).

**Tobias:** „Der Platz reicht mir. Ich hab bestimmt die ganzen Fabriken 5–6x aufgefüllt. Die läuft ja auch ohne mich weiter. Ich finde, Gold sollte Teil des Spiels sein, aber der Hauptfokus sollte auf der Massenproduktion sein, sodass man immer längere Straßen bauen kann, um Werkzeuge herzustellen und diese dann zu verkaufen. Ich finde das Optimieren und Automatisieren von Prozessen bei diesen Spielen am besten, deswegen sollte darauf auch der Fokus liegen. Von allen Ideen, die du genannt hast, finde ich D am besten. So kann man z. B. die Vergrößerung der Ladentheke teuer machen, damit man erst auf Level 8 es überhaupt schafft, die dritte freizuschalten. Ich hatte auch daran gedacht, dass wir die Ladentheke ‚langsamer‘ machen können. Wenn man auf mehr Produkten sitzen bleibt, ist man auch gezwungen, die Produkte in längere Produktionsstraßen einzusetzen. Die Geschwindigkeit des Verkaufs haben wir ganz am Anfang gemacht, um Gold zu generieren, deswegen liegt dort noch kein Feintuning drin.“

**Claude** hat die Entscheidungen festgehalten (Platz reicht, Schwerpunkt Massenproduktion, Möglichkeit D, Theken langsamer) und den Entwurf v0.23.0 „Theken kaufen, langsamer verkaufen“ vorgestellt (siehe `PLAENE.md`). Kern: Heute ändert die Zahl der Theken nicht, wie viel verkauft wird – eine teure Theke muss deshalb eigene Kunden bringen. Vorschlag: jede Theke im Schnitt 1 Stück pro Minute (2 Theken = ein Drittel von heute), Start mit 2 Theken, weitere kaufen (Platzhalter 40.000 / 100.000 / 200.000 Gold, die dritte so um Level 8 bezahlbar), Aufstiege bringen keine Theken mehr. Folgen: billige Waren lohnen kaum, Tobias' Fabrik (voll ausgelastet grob 240 fertige Teile pro Stunde) stößt mit 2 Theken an die Grenze, der Anfang wird langsamer (ein Holzstamm in 20 statt 7 Minuten verkauft), Aufträge werden wichtiger. Fragen an Tobias: Tempo, Preise (nur Gold oder auch Waren oder Mindest-Level), seine 5 Theken behalten oder zurück auf 2, Reihenfolge (Empfehlung: erst v0.22.0, damit er vorher sichern kann) und sein OK.

**Umgesetzt:** v0.21.5 (nur Doku).

**Tobias:** „Das Tempo passt so für mich, aber wir könnten es ja nochmal drosseln, dass wir sagen von Level 1–3 sind es 6 die Minute, ab Level 4 sind es nur noch 3 die Minute und ab Level 7 sind es nur noch 1–2 die Minute, damit reguliert sich der Verkauf ohnehin und der Anfang wird nicht so ‚zäh‘. Finde die Idee, dass Theken Gold kosten sollen, sinnvoller. Ja, ändere das bei mir auch direkt auf 2 Theken, damit ich ein besseres Gefühl dafür bekommen kann. Immerhin muss ich genug Gold verdienen, dass ich meine Fabriken mit Rohstoffen befüllen kann. Aktuell geht das, und mir bleibt noch jede Menge Gold übrig.“

**Claude** hat die Entscheidungen festgehalten und den Entwurf v0.23.0 angepasst (siehe `PLAENE.md`). Rückfrage zur Lesart: Gelten die Zahlen für die 2 Start-Theken zusammen (je Theke 3 / 1,5 / 0,75 pro Minute), und jede gekaufte Theke legt ihren Anteil drauf? Sonst brächte eine gekaufte Theke keinen zusätzlichen Verkauf. „1–2“ = 1,5 im Schnitt? Kein Mindest-Level? Dazu die Folgen für Tobias' Fabrik: Auf Level 8 mit 2 Theken verkauft er 90 Stück pro Stunde; sein Laden-Lager ist im Schnitt 166 Gold je Stück wert (so verkauft etwa 15.000 Gold pro Stunde), eine volle Füllung seiner Fabrik kostet etwa 74.000 Gold – er muss also vor allem teure Teile verkaufen oder Theken dazukaufen. Weil Tobias zu v0.22.0 noch nicht geantwortet hat, hat Claude zu den 4 Fragen Vorschläge gemacht (Teilen-Menü, sonst „Downloads“; Testmodus und Test-Knopf bleiben sichtbar; die Fabrik läuft nach dem Laden nach) und um ein OK für beide Schritte gebeten – erst v0.22.0, damit Tobias seine Fabrik sichern kann, bevor sie auf 2 Theken zurückgeht.

**Umgesetzt:** v0.21.6 (nur Doku).

### 11.11.2026 – Chat 16: Antworten auf die Fragen aus Chat 15 (v0.20.3)

**Tobias** hat die Fragen vom Ende von Chat 15 wiederholt und beantwortet:
- „Passt Variante B so, ohne Gebäudebild oder mit kleinem? Wenn ja, ist das dein OK für v0.21.0?“ – ohne Antwort.
- „Sollen die beiden Punkte aus dem Belastungstest in v0.21.0 mit hinein?“ – „Passt.“
- „Ruckelt das Spiel bei dir auf dem Tablet manchmal, vor allem herausgezoomt?“ – „Nein.“
- „Spielen deine Tester auf eigenen Geräten oder auf deinem Tablet? Sollen sie bei Level 1 anfangen oder deine Fabrik laden können? Brauchen sie eine kurze Einführung? Die gibt es bisher nicht.“ – „Das können wir im Hinterkopf behalten, aber ich möchte frühestens nächste Woche jemandem das Spiel zeigen.“

**Claude** hat die Antworten festgehalten: Nur zeichnen, was im Bild ist, und „Bilder pro Sekunde“ im Testmodus kommen mit in v0.21.0; da das Tablet nicht ruckelt, ist das Vorsorge für größere Fabriken, kein dringender Fehler. Die Tester-Fragen bleiben bis zum Schritt „Spielstand sichern und was Tester brauchen“ offen, der ohnehin nach v0.21.0 kommt. Weil die erste Frage unbeantwortet ist, hat Claude nach der obersten Regel nicht angefangen zu programmieren, sondern nachgefragt: ohne oder mit kleinem Gebäudebild, auch Rohstoff-Gebäude, OK für v0.21.0?

**Umgesetzt:** v0.20.3 (nur Doku).

**Tobias:** „Das Gebäudebild ist noch nicht so aussagekräftig, und später werden aus diesen Bildern ja echte 2D- bzw. 3D-Grafiken ähnlich wie bei Clash of Clans. Von daher können wir das gerne ohne Gebäudebild machen. Alternativ kann man die Farbe evtl. ändern: die Holzgebäude in einem Braun, die Steingebäude in einer Steinfarbe und Eisen und Kräuter eben auch in einer spezifischen Farbe, so haben wir immerhin eine kleine Trennung. Rohstoffgebäude können wir auch miteinbetten. Ist eine gute Idee. Ja, du hast mein Okay.“

**Claude** hat v0.21.0 gebaut und Tobias' Farb-Idee mit hineingenommen (sie ersetzt das Gebäudebild als Unterscheidung): Holz braun, Stein steingrau, Eisen stahlblau, Erde grün; Lagerhaus sandfarben (vorher braun wie Holz), Versandportal bleibt lila. Beim Messen fiel auf, dass die neue Scheibe mit dem Warenbild mehr Rechenarbeit kostet als das alte Emoji; deshalb werden die Warenbilder jetzt zwischengespeichert und der Boden in einem Rutsch gezeichnet. Ergebnis (Testrechner ohne Grafikchip, 130 Gebäude, 360 Bänder): Rechenarbeit fürs Zeichnen nah dran etwa halbiert, ganz herausgezoomt fast halbiert, bei mittlerem Zoom etwa gleich. Wie es auf dem Tablet läuft, zeigt die neue Anzeige im Testmodus.

**Umgesetzt:** v0.21.0 (siehe Versionshistorie).

**Tobias:** „Das Gebäudebild vermisse ich nicht. Farben passen alle so und ist mir ehrlich gesagt gar nicht aktiv aufgefallen, deswegen ist die Farbe so gut. Ich sehe leider keine Bilder/s. Das Einzige, was mir aufgefallen ist, dass die Rohstoffgebäude nach einiger Zeit, bzw. der gelbe Kreis der Gebäude, einfach stehen bleibt und nicht mehr weiterläuft. Es wirkt so, als würde die Maschine zum Stillstand kommen.“

**Claude** hat nachgerechnet (Holzfällerlager und Erntebank mit Versandportal am Ausgang, Simulation): Die Gebäude arbeiten weiter. Der Ring zeigt aber, wie viel vom laufenden Rohstoff übrig ist – beim Holzfällerlager nimmt er je Block um 1/200 ab, also 1,8° alle 4,5 Sekunden (nach 2 Minuten 313° statt 360°); bei der Erntebank 7,2° alle 12 Sekunden. Neben den Maschinen, deren Ring sich alle 5 bis 20 Sekunden ganz füllt, sieht das aus wie Stillstand. Vorschlag für v0.21.2: Der Ring der Rohstoff-Gebäude zeigt jedes einzelne Stück (füllt sich in 4,5 bzw. 12 Sekunden, wie bei den Maschinen; ist der Ausgang voll, bleibt er voll und das Licht ist rot); wie viel vom laufenden Rohstoff übrig ist, zeigt der erste Vorrat-Punkt als kleines Tortenstück, das sich in 15 bzw. 10 Minuten leert (genauer im Infofenster: „leer in etwa …“). Zu „Bilder/s“: Die Anzeige erscheint nur im Testmodus (☰ → „⏩ Testmodus“, dann oben „⏩ ×10“ und „🎞️ … Bilder/s“); im Browser-Test auf Tablet und Handy war sie zu sehen. Rückfrage, ob der Testmodus an war und ob die Anzeige auch ohne Testmodus einschaltbar sein soll.

**Umgesetzt:** v0.21.1 (nur Doku).

**Tobias:** „Okay, das wusste ich nicht. Ist tatsächlich besser so, dann weiß man ca., wann das Rohstoffgebäude leer ist. Können wir gerne so lassen. Hab den Testmodus angemacht, und die Anzeige ist zwischen 60–90 Bilder/s immer geswitcht.“

**Claude** hat festgehalten: Der Ring bleibt, v0.21.2 wird nicht programmiert. 60 bis 90 Bilder pro Sekunde heißt: flüssig; dass die Zahl springt, ist normal (das Tablet stellt die Bildwiederholung je nach Bedarf zwischen 60 und 120 um, um Strom zu sparen). Als Nächstes hat Claude den Entwurf für v0.22.0 „Spielstand sichern und laden“ vorgestellt (siehe `PLAENE.md`) – mit dem Gedanken, dass Tester damit auch auf Tobias' Tablet spielen können, ohne einen zweiten Spielstand: sichern → neues Spiel → Tester spielt → laden.

**Umgesetzt:** v0.21.2 (nur Doku).

**Tobias:** „Bevor wir weitermachen, schreib die nächsten Schritte erstmal auf. Ich dachte auch daran, dass wir den Kreis der Rohstoffgebäude einfach in einer anderen Farbe machen. Dann machen wir Kreislauf zur Fertigung gelb und Kreislauf, bis etwas leer ist, evtl. grün, damit man das auch klarer erkennen kann. Das kannst du gerne jetzt schon codieren, ich würde danach in einem neuen Chat weitermachen.“

**Claude** hat die nächsten Schritte als nummerierte Liste oben in `docs/STAND.md` geschrieben (v0.22.0 Spielstand sichern und laden mit den 4 offenen Fragen, was Tester brauchen, Bereich kopieren, Weiche, später) und den Ring der Rohstoff-Gebäude grün gemacht – als v0.21.3 (Feinschliff nach Tobias' Test), damit „Spielstand sichern“ v0.22.0 bleibt. Die Vorrat-Punkte bleiben gelb.

**Umgesetzt:** v0.21.3 (siehe Versionshistorie). Weiter geht es in einem neuen Chat.

### 10.11.2026 – Chat 15: Braucht es das Versandportal noch? (v0.19.0)

**Tobias:** „Hi, informiere dich über den aktuellen Stand der Dinge. Im letzten Chat haben wir v19 auf GitHub veröffentlicht. Beet, Lagerhaus und Versandportal haben wir noch nicht umgestellt. Ich habe mich gefragt, ob das Versandportal noch Sinn macht, wenn wir die gleiche Funktion mit dem Lagerhaus haben. Das Versandportal schickt die Ware direkt ins Laden-Lager. Lass uns erst die nächsten Schritte theoretisch durchgehen.“

**Claude** hat beide Gebäude verglichen (Zahlen aus den Datentabellen und dem Code):
- **Versandportal:** 1 × 1, 10 Holzblöcke; schickt jedes Stück sofort und ohne Mengengrenze ins Laden-Lager, auch im Hintergrund, bis das Laden-Lager voll ist. Die Ware steht sofort für Theken, Aufträge und Bauen bereit.
- **Lagerhaus:** 2 × 1, 8 Holzplatten; 3 Fächer × 50 (höchstens 3 Waren), gibt am Ausgang weiter; Befüllen aus dem Laden-Lager, Ausräumen von Hand ins Laden-Lager (darf es überfüllen). Was darin liegt, zählt nicht zum Laden-Lager.
- Die Überschneidung ist nur das Ausräumen. Beispiel: Eine Straße mit 3 aufgefüllten Holzfällerlagern und Sägewerk macht in 45 Minuten 360 Platten oder Stäbe (etwa 8 pro Minute). Ein Lagerhaus am Ende ist nach etwa 19 Minuten voll, dann steht die Straße, bis man ausräumt; mit Versandportal läuft sie die ganzen 45 Minuten.
- Die beiden sind Gegenstücke: Portal = Band → Laden-Lager (automatisch), Lagerhaus = Laden-Lager → Band (von Hand) und Puffer zwischen zwei Straßen.
- Varianten: **A** beide behalten, Rollen klar trennen und im Infofenster zeigen (Empfehlung); **B** zusammenlegen – Lagerhaus mit Schalter „📤 Ins Laden-Lager schicken“, Portal fällt weg (Nachteile: 2 × 1 statt 1 × 1 bei knappem Platz, teurer, vorhandene Portale müssten umgewandelt werden und das größere Lagerhaus passt nicht immer auf ihr Feld, ein Gebäude mit zwei Betriebsarten ist schwerer zu durchschauen); **C** Portal weglassen, nur Ausräumen (nicht empfohlen: die Fabrik liefe im Hintergrund nur noch, bis die Lagerhäuser voll sind, und Level 1 hätte keinen automatischen Weg in den Laden).
- Nebenbei: Lagerhäuser am Ende der Straßen sind ein Zusatzlager neben dem Laden-Lager (10 Lagerhäuser = 1.500 Plätze). Empfehlung: erst einmal so lassen und beobachten (wie beim Abreißen über die Grenze).
- Entwurf v0.20.0: Beet, Lagerhaus und Versandportal bekommen das Infofenster im neuen Stil (Bilder statt Textzeilen), mit Vorschaubildern vorab. Danach: Maschinen zeigen auf der Karte, was sie herstellen; dann Weiche mit Filter, Verbesserungen mit Erfahrung, Level 9.
- Fragen an Tobias: A, B oder C? Wie nutzt er Portal und Lagerhaus heute (baut er noch Portale oder räumt er die Lagerhäuser am Ende von Hand aus – und warum)? Zusatzlager so lassen? Passt die Reihenfolge?

**Umgesetzt:** v0.19.1 (nur Doku).

**Tobias:** „Okay, perfekt. Ich baue aktuell keine Versandportale, deswegen hab ich mich gefragt, ob das noch sinnvoll ist. Von mir aus lassen wir gerne A. Ich benutze es aktuell so, dass ich z. B. Zahnräder, die in einem Lager voll laufen, weil die Holzstäbe der anderen Straße nicht hinterherkommen, in das andere Zwischenlager packe, weil ich die Produktion einmal gespiegelt gebaut habe mit einem anderen Produkt (einmal sind es zu wenig Zahnräder, einmal zu wenig Holzstäbe). Dann räume ich die Zahnräder vom Lagerhaus raus, sie sind kurz im Laden-Lager, und packe sie in das andere Lagerhaus wieder rein, damit die Produktion weitergehen kann. Das war genau der Sinn der Lager, dass man dort Sachen lagern kann, die man für spätere Produktionen braucht. Aber aktuell nutze ich das Portal gar nicht mehr, weil ich nur noch teurere Einzelteile produziere und keine 500 Stäbe, die ich ins Laden-Lager schicken muss. Frage 3: Hab ich dir, glaube ich, gerade beantwortet. 4. Ja, codiere erst die neuen Infofenster für die Sachen, die noch nicht gemacht sind, wie wir das bei der letzten Version gemacht haben.“

**Claude** hat das als OK für v0.20.0 genommen (Variante A, Lagerhäuser bleiben Zusatzlager, Ausräumen ohne Grenze) und die drei Infofenster im Stil von v0.19.0 gebaut, ohne vorherige Vorschaubilder – Tobias hat sie im Chat als Screenshots aus dem Browser-Test bekommen. Idee für später (noch nicht besprochen): ein Knopf „Umlagern“, der direkt von einem Lagerhaus ins andere packt.

**Umgesetzt:** v0.20.0 (siehe Versionshistorie).

**Tobias:** „Die neuen Vorschaubilder sehen gut aus. Jetzt ist alles übersichtlich dargestellt. Aktuell werden die produzierten Rohstoffe oder Produkte sehr klein auf den Maschinen dargestellt, sodass man erahnen kann, was gerade produziert wird. Mach mir gerne einen Vorschlag, wie du das ändern wollen würdest.“ Er nutzt seit heute ein neueres Claude-Modell und möchte deshalb noch weitere Vorschläge, was die nächsten Schritte sein könnten.

**Claude** hat nachgeschaut, was die Karte heute zeigt: Gebäudebild (Emoji), Name, Statuslicht, Fortschrittsleiste, Punkte für den Rohstoff-Vorrat – und nur bei Kombi-Maschinen, die warten, ein kleines dunkles Schild mit der **fehlenden** Zutat. Was eine Maschine herstellt, steht nirgends; zwei Schmieden (Bleche, Stangen) sehen gleich aus. Vorschaubilder (Tablet, nah und weit herausgezoomt; aus einer Kopie des Spiels, nicht im Projekt gespeichert):
- **Variante A – Schild in der Ecke:** Das Gebäudebild bleibt groß, das Produkt steht als rundes helles Schild unten rechts.
- **Variante B – Produkt in der Mitte (Empfehlung):** Das Produkt steht groß auf einer hellen Scheibe in der Mitte, das Gebäudebild klein unten rechts; Farbe und Name bleiben. Herausgezoomt bleibt es lesbar. Wartet eine Kombi-Maschine, steht unten ein gelbes Schild „? + fehlende Zutat“ (statt des dunklen Schildes oben).
- In beiden Varianten: Rohstoff-Gebäude zeigen, was herauskommt (leer = blass; die Erntebank das, was gerade läuft), das Lagerhaus zeigt die Waren seiner Fächer (bis 3) statt des Pakets. Beet und Versandportal bleiben. Nur Darstellung, Spielregeln und Spielstand bleiben gleich.
- Fragen: A oder B? Auch Rohstoff-Gebäude? Passt das gelbe „?“-Schild?

Weitere Vorschläge für die nächsten Schritte (Claude): „Umlagern“ von Lagerhaus zu Lagerhaus; Fabrik-Übersicht (je Ware hergestellt und verbraucht pro Minute, zeigt Engpässe); Spielstand sichern und auf ein anderes Gerät mitnehmen; „Alle auffüllen“ mit Gesamtpreis (Frage, ob das zu „Nachlegen ist Handarbeit“ passt); Bereich kopieren; Weiche mit Filter; erste Wirtschaft aus M3 (Nachfrage des Tages oder Sonderaufträge); Verbesserungen mit Erfahrung; Belastungstest mit großer Fabrik und Durchsicht des Codes; Level 9. Empfohlene Reihenfolge nach v0.21.0: Umlagern, Fabrik-Übersicht, Spielstand sichern.

**Umgesetzt:** v0.20.1 (nur Doku).

**Tobias:** „Ich würde mich für Variante B entscheiden, aber finde das nicht so 100 % hübsch. Finde, das wirkt etwas gequetscht. Ich würde von allen Punkten eher den dritten Punkt nehmen, weil ich diesen Zustand gerne schon anderen Menschen zeigen wollen würde, damit diese das Spiel auch testen können, ohne dass mein Spielstand verloren geht. Ich hoffe, ich verstehe den dritten Punkt richtig. Finde den ersten Punkt nicht gut, weil dadurch das händische Arbeiten verloren geht. Wie viel die Minute hergestellt wird, finde ich auch nicht gut bzw. zur jetzigen Phase des Spiels. Alle auffüllen finde ich nicht gut. Bereich kopieren und das Ganze nochmal bauen finde ich sehr wichtig, und daran hatte ich heute Morgen auch gedacht. Eine Weiche, die z. B. eine Spur in 2 Spuren trennt, sodass man sagen kann, hier laufen nur Stäbe und hier nur Bleche, finde ich auch sehr sinnvoll, damit die Produktionsstraßen länger werden. Verbesserung mit Erfahrungen würde ich erst später einführen wollen. Den Belastungstest finde ich auch sinnvoll, dass wir den [mit dem neuen Modell] durchführen.“

**Claude** hat Variante B überarbeitet und neue Vorschaubilder gezeigt (wieder aus einer Kopie des Spiels): Der Fortschritt läuft als gelber Ring um das Produkt statt als Leiste oben, das Gebäudebild fällt weg (Farbe und Name bleiben), die Punkte für den Vorrat rücken in die Zeile des Statuslichts, das gelbe „?“-Schild steht oben links. Als Alternative dieselbe Fassung mit kleinem Gebäudebild unten links. Zum dritten Punkt: Jedes Gerät hat seinen eigenen Spielstand im Browser – wer den Link auf dem eigenen Gerät öffnet, beginnt bei Level 1 und berührt Tobias' Fabrik nicht; nur wenn andere auf seinem Tablet spielen, spielen sie in seinem Spielstand. Rückfragen: eigene Geräte oder sein Tablet? Bei Level 1 anfangen oder seine Fabrik laden? Kurze Einführung für Tester?

**Belastungstest** (reine Messung in einer Kopie, nichts am Spiel geändert; Testrechner ohne Grafikchip): zwei voll bebaute Fabriken auf 38 × 30 Feldern – 180 Gebäude und 120 Bänder bzw. 30 Gebäude und 1.065 Bänder.
- Rechnen: 0,2 Millisekunden je Takt, also etwa 2 Millisekunden je Sekunde Spiel; im Testmodus (×10) etwa 22. Unkritisch.
- Abwesenheit nachrechnen: 8 Stunden in 0,02 bis 1,3 Sekunden, wenn die Fabrik bald steht; läuft alles 45 Minuten durch, hochgerechnet etwa 6 Sekunden (auf dem Tablet eher 10 bis 20).
- Spielstand: 31 bis 49 KB, Speichern unter 1 Millisekunde, Laden 1 bis 2.
- Zeichnen: leere Fläche 6 Millisekunden je Bild, kleine Fabrik (20 Gebäude) 8 bis 10, volle Fabrik 18 bis 21 – für flüssige 60 Bilder pro Sekunde dürfen es höchstens 16,7 sein. Bei Zoom 1 kostet es fast so viel wie ganz herausgezoomt: Das Spiel zeichnet auch, was nicht im Bild ist. Ein Gebäude kostet etwa 0,085, ein Band 0,011 Millisekunden.
- Keine Fehler in der Konsole. Vorschlag: mit v0.21.0 nur noch zeichnen, was im Bild ist, und im Testmodus „Bilder pro Sekunde“ anzeigen, damit Tobias auf dem Tablet selbst messen kann.

Claudes Vorschlag für die Reihenfolge: v0.21.0 Maschinen zeigen, was sie herstellen (mit den beiden Punkten aus dem Belastungstest), dann Spielstand sichern und was Tester brauchen, Bereich kopieren, Weiche.

**Umgesetzt:** v0.20.2 (nur Doku). Tobias' OK für v0.21.0 steht aus.

### 09.11.2026 – Chat 14: Feedback nach einer Stunde Spielen (v0.18.1)

**Tobias** (mit Screenshot seiner Fabrik auf Level 8, 6.036 Gold): „Ich hab jetzt ca. eine Stunde lang im normalen Spieltempo gespielt, und konnte langsam immer stetiger wachsen. Ich bin immer am Ball geblieben, weil ich meine ganzen Fabriken voll machen wollte mit Rohstoffen, was jetzt auch ganz gut geklappt hat, nur die Eisenvorräte könnten noch besser sein. Immer wenn ich Rohstoffe voll machen wollte, bin ich quasi pleite gegangen und musste erst warten, bis ich genug Ware produziert hatte, um diese zu verkaufen. Aktuell hab ich zwar 6000 Gold, aber müsste noch Eisen dazu kaufen und wäre wieder bei fast 0. Ich finde, es macht Spaß, und man kann sich so langsam an die Kräutersachen machen. Außerdem muss ich noch mehr Eisenproduktionen bauen, weil ich bei der Schlosserei aktuell nur ein Produkt herstelle, weshalb man nicht reich wird, aber man kommt langsam voran.“

**Auf dem Screenshot:** links zwei gleiche Holz-Stein-Straßen (je 3 Holzfällerlager, 3 Steinbrüche, Sägewerk, Steinmetz, Zimmerei, Lagerhäuser); oben 2 Holzfällerlager, 5 Schmelzhütten mit 5 Schmieden, 3 Steinbrüche, darunter Zimmerei, 2 Feinschmieden, 1 Schlosserei; unten 3 Beete, 2 Erntebänke, Webstube, Kräuterstube. Zimmerei und eine Feinschmiede warten auf Eisenstangen.

**Claude** hat nachgerechnet (Zahlen aus den Datentabellen):
- Eine Schmelzhütte voll aufzufüllen kostet 3 × 2.200 = 6.600 Gold, Tobias' 5 Hütten 33.000 Gold – und nach 45 Minuten wieder. Holz und Stein kosten je Gebäude nur 1.650.
- Eine Schmelzhütte liefert etwa 13 Barren pro Minute (2–3 Bleche oder Stangen). Eine Feinschmiede braucht bei voller Arbeit für Scharniere 45 Bleche und Stangen pro Minute – das Eisen von etwa 17 Schmelzhütten. Ebenso verbraucht eine Zimmerei so viel wie etwa 17 Holz- und Steingebäude liefern, eine Grundmaschine so viel wie 4–5 Rohstoff-Gebäude. Deshalb warten Tobias' Kombi-Maschinen; „mehr Eisen bauen“ ist der richtige Schluss.
- Kunden kommen etwa alle 20 Sekunden und kaufen im Schnitt 2 Stück, also etwa 6 Stück pro Minute (360 pro Stunde) – egal wie viele Theken. Jedes Stück nimmt der Kunde von einer zufälligen gefüllten Theke. Aus 1 Eisenerz werden 40 Bleche und Stangen (2.880 Gold), die allein 7 Minuten aller Kunden bräuchten; als Vorhängeschlösser werden daraus 2⅔ Stück (5.184 Gold). Tipp: die teuersten Waren auf die Theken; Bleche und Stangen weiterverarbeiten statt verkaufen.
- Tipp: Das Uhrwerk (Zahnradwelle + Räderwerk) braucht gar kein Eisen und bringt im Verhältnis zu den Rohstoffen genauso viel wie das Vorhängeschloss (etwa das 1,9-Fache) – eine zweite Schlosserei für Uhrwerke ließe sich aus den Holz-Stein-Straßen versorgen, mit Rohstoffen für 550 statt 2.200 Gold.
- Vorschlag für den nächsten Schritt: erst einmal nichts an der Balance ändern (es macht Spaß, man kommt voran, und der Wunsch, alles voll zu machen, hält am Ball) und die Kräuter ausprobieren. Alternativ: Eisen-Balance anpassen (z. B. mehr Kunden mit jedem Level, Eisenpreis, Vorrat) oder eine Planungshilfe im Infofenster („braucht bei voller Arbeit so viel wie 17 Schmelzhütten“).

**Umgesetzt:** v0.18.2 (nur Doku).

**Tobias:** „Notier bitte noch in den obersten Regeln in der Datei, die du immer als Erstes liest, dass du nicht ohne meine Erlaubnis anfängst zu codieren, sondern mir immer vorstellst, was du codieren möchtest, und dann setzen wir das gemeinsam um. Ich entscheide mich für Option A. Alles ist gut so, wie es aktuell ist, und dass man mehr Eisen braucht und dafür mehr Eisen bauen muss, ist mir klar – nur man kann das nicht alles auf einmal bauen, weil man das Gold nicht dazu hat. Deswegen finde ich das Balancing zwischen Gold verdienen und Rohstoffe nachkaufen sehr gut. Der Verkauf der Theke gefällt mir ebenfalls. Wer mehr verdienen will, muss teurere Sachen anbieten, was genau mein Ziel ist. Die Massenproduktion steht wie gesagt im Vordergrund, aber die kann ich noch nicht umsetzen, weil Gold fehlt, aber prinzipiell könnte man sich darauf konzentrieren. So entstehen eben mehr Spielstile, das Spiel zu spielen, was ich gut finde. Was hatten wir als nächsten Schritt geplant?“

**Umgesetzt:** v0.18.3 (nur Doku): oberste Regel ganz oben in `CLAUDE.md` (mit der Ausnahme für reine Doku-Versionen), Entscheidungen festgehalten, offene Frage 3 erledigt.

**Claude** hat die möglichen nächsten Schritte aus `docs/STAND.md` aufgezählt (Warenbilder in der Bauleiste, Level 9, Weiche mit Filter, Verbesserungen mit Erfahrung) und Tobias wählen lassen; Empfehlung: Warenbilder in der Bauleiste.

**Tobias:** „Gerne Punkt 1, und du kannst Kräuter auch in Pflanzen oder Pflanzenkunde umbenennen. Welche Möglichkeiten hast du, die Gebäude (also die Icons) darzustellen? Was hergestellt wird – kann man einfach das Symbol nehmen, welches auf dem Band liegen würde, nur minimal größer, oder wie würdest du das aus Sicht eines Spieleentwicklers machen?“

**Claude** hat Vorschaubilder (Tablet und Handy) mit drei Varianten gebaut und erklärt: Das Warenbild vom Band zu nehmen, ist genau richtig – eine Ware sieht überall gleich aus (Band, Laden, Aufträge, Bauleiste). Variante A (Waren neben dem Gebäudebild) passt bei drei Waren nicht in den Knopf; B (eigene Zeile unter dem Namen, Leiste etwas höher) empfohlen; C (Waren groß, Gebäude klein in der Ecke, Leiste gleich hoch). Gebäudebilder: Emojis (heute, sehen auf jedem Gerät anders aus, manche ähneln sich), selbst gezeichnet wie die Waren, oder gemalte Grafik-Dateien – Empfehlung: Emojis vorerst behalten, eigene Gebäudebilder in M4. Reiter: „Pflanzen“ empfohlen. Idee für danach: Maschinen zeigen auf der Karte, was sie gerade herstellen.

**Umgesetzt:** v0.18.4 (nur Doku): Plan für v0.19.0 in `PLAENE.md`.

**Tobias:** „Ich bin tatsächlich für Variante B, wenn ich das richtig gesehen habe. Symbol, wie es heißt und was es kostet. Was es herstellt, würde ich da nicht drauf machen. Ich finde Pflanzenkunde zu lang, und Pflanzen hört sich auch komisch an. Wir sind bei Rohstoffen, deswegen könnte man diesen Bereich evtl. einfach ‚Erde‘ nennen. Ich würde evtl., wenn man das Gebäude anklickt, das nochmal übersichtlicher darstellen wollen, dann prägt man sich das auch besser ein. Aktuell klick ich auf das Gebäude und sehe nur eine Menge an Informationen. Ich würde gerne ganz oben stehen haben, was man aktuell produziert und was man dafür braucht, und unten drunter dann nochmal, was die anderen Dinge kosten würden. So haben wir das aktuell auch schon, aber ich finde es sehr unübersichtlich. Evtl. können wir das klarer und übersichtlicher darstellen. Ansonsten hast du mein Go.“

**Claude** hat nachgefragt, ob die Bauleiste damit wie heute bleibt (Variante B hatte die Warenzeile), und Vorschaubilder fürs neue Infofenster gezeigt (Feinschmiede und Holzfällerlager, heute und neu, Tablet und Handy): oben ein grüner Kasten „Stellt gerade her“ mit Zutaten als Bildern (hat / braucht) → Ergebnis, darunter „Umstellen auf“ mit jedem anderen Rezept als Knopf, Verschieben/Drehen/Abreißen klein in einer Zeile, ein kurzer Tipp statt des langen Textes. Weil der Entwurf neu ist, wartet Claude nach der obersten Regel auf Tobias' OK.

**Umgesetzt:** v0.18.5 (nur Doku): Plan für v0.19.0 „Übersichtliches Infofenster und Reiter ‚Erde‘“ in `PLAENE.md`.

**Tobias:** „Finde das passt so. Sieht sehr übersichtlich aus und ansprechend. Go für v19.“

**Umgesetzt:** v0.19.0 (siehe Versionshistorie). Beim Prüfen fielen zwei Kleinigkeiten auf und wurden behoben: „Kräuterkompresse“ ragte auf dem Handy aus dem grünen Kasten (lange Namen brechen jetzt um), „10 / 10 ✓“ wurde auf dem Tablet knapp abgeschnitten.

### 09.11.2026 – Chat 12 und 13: Test von v0.17.0, Plan und Umsetzung v0.18.0 (Bauleiste mit Reitern)

*Chat 12 wurde nicht in der README festgehalten; Tobias hat sein Feedback und Claudes Rückfragen in Chat 13 wiederholt.*

**Tobias (Test von v0.17.0):** Das meiste hat funktioniert. Er konnte nicht alles testen, weil er die komplette Fabrik neu gebaut hat – er hatte zu wenig Grundrohstoffe und konnte nicht alle Maschinen versorgen; ein wichtiges Learning. Er arbeitet jetzt viel mehr mit Lagerhäusern, um Zwischenprodukte zu lagern und Wege zu sparen: Sobald er zwei Bänder mit zwei verschiedenen Produkten zusammenführt, hat er keine Kontrolle mehr, was am Ende bei der Maschine ankommt. Deshalb baut er für jedes Zwischenprodukt eine eigene Produktionsstraße, um genug davon in seine Zwischenlager zu packen und damit neue Straßen zu errichten. Die gelbe Ringelblume ist gut zu erkennen. Weil die Erntebank wie das Holzfällerlager funktioniert, baut er lieber zwei Erntebänke und legt alles getrennt ein, um die Straßen besser zu steuern. Der Aufbau der Kräuterstube mit zwei Eingängen ergibt Sinn, ist aber noch nicht getestet. Man investiert viel Zeit, um die Straßen optimal zu bauen; das ständige Neubauen und Optimieren funktioniert sehr gut. Nach dem Abreißen hatte er 1.500 Waren im Lager, konnte das durch Neubauen aber direkt wieder unter 1.000 bringen. Beim Neubauen wurde das Baumenü mit vielen Maschinen unübersichtlich, weil man nicht direkt sieht, was welche Maschine macht – vielleicht lässt es sich übersichtlicher gestalten. Die dritte Pflanze stellt er erst einmal hinten an.

**Claude (Chat 12)** hat Rückfragen gestellt: Reiter nach Straße (Holz, Stein, Eisen, Kombi, Kräuter, Lager) oder nach Stufe? Werkzeuge immer sichtbar links oder als eigener Reiter? Fehlt in der Bauleiste sonst noch etwas?

**Tobias (Chat 13):** Reiter: Man tippt auf „Bauen“, dann öffnen sich Reiter wie Holz, Stein und Eisen (und jetzt die Pflanzen) mit allen spezifischen Gebäuden wie Holzfällerlager und Sägewerk. Daneben stehen die Sachen, die man öfter braucht: Förderband, Lager, Abreißen, Verschieben. Außerdem: Wenn das Baumenü offen ist und er ganz unten bauen will, sieht er die Fläche nicht mehr – das Menü müsste sich zuklappen lassen oder aus der Baufläche raus. Die Frage nach den Werkzeugen war damit beantwortet; sonst fehlt ihm nichts.

**Claude** hat den Plan für v0.18.0 mit zwei Vorschaubildern (Tablet und Handy) vorgestellt: vier Reiter (Holz, Stein, Eisen, Kräuter; Zimmerei bei Holz, Feinschmiede und Schlosserei bei Eisen), links immer Förderband, Lagerhaus, Versandportal, Verschieben, Abreißen; die Karte lässt sich über die Leiste schieben; die Leiste wird nicht höher; Meldungen über der Leiste.

**Tobias:** „Ja, die Einteilung passt so und du kannst gerne loslegen.“

**Umgesetzt:** v0.18.0 (siehe Versionshistorie). Als Nächstes testet Tobias die Bauleiste und baut seine Fabrik weiter.

**Tobias:** „Ja, perfekt. So langsam nimmt das Spiel Form an. Die Übersicht gefällt mir viel besser.“ Die README ist sehr lang und braucht immer viel Kontextfenster. Eine separate Datei, auf die wir uns immer beziehen, in der jeder Arbeitsschritt dokumentiert wird, damit nichts verloren geht und Claude immer den Kontext kennt – eventuell eine Historie, eine Datei für die letzten Arbeitsschritte und eine grobe Zusammenfassung des Spiels. Er ist kein Spielentwickler und weiß nicht, wie man eine übersichtliche Ordnerstruktur anlegt, damit die Arbeit flüssiger läuft und nicht bei jedem neuen Chat 20 % des Kontextfensters verbraucht sind. Erst das Repo klären, dann weiter am Spiel.

**Claude** hat vorgeschlagen: `README.md` als kurze Startseite, `CLAUDE.md` mit den Regeln, `docs/STAND.md` (Version, nächster Schritt, offene Fragen, letzte 3 Arbeitsschritte), `docs/SPIEL.md` (das Spiel, wie es heute ist), `docs/TECHNIK.md`, und ein Archiv mit Entscheidungen, Versionen, Gesprächen und Plänen, das nur gezielt durchsucht wird. Zu Beginn eines Chats nur noch etwa ein Achtel der bisherigen Menge. Reine Feedback-Chats werden sofort als eigene kleine Version festgehalten, damit nichts mehr verloren geht wie in Chat 12.

**Tobias:** „Ja, setze es bitte genauso um, damit wir in jedem neuen Chat direkt arbeiten können und du die wichtigsten Informationen kennst. Das Spielprinzip ist ja klar und wir müssen die Basis eigentlich nur erweitern.“

**Umgesetzt:** v0.18.1 (nur Doku). Zusätzlich zu den vier angekündigten Archiv-Dateien bewahrt `KONZEPT-VERLAUF.md` die alten Abschnitte 3, 4 und 8 wörtlich auf (Konzept mit Verlauf, Tobias' ursprünglicher Techbaum, alte offene Fragen).

### 08.11.2026 – Chat 11: Test von v0.14.0, Test-Knopf, Vorgehen beim Kräuter-Kapitel

**Tobias:** Das Spiel über Nacht geschlossen und am Morgen wieder reingeschaut – alles hat funktioniert, die Fabrik läuft weiter. 3 Rohstoffe reichen. Die neuen Warenbilder erkennt Tobias und findet sie gut. Die Aufträge macht Tobias gerade nicht aktiv, weil die Spielmechanik wichtiger ist. Wunsch: für die Testversion des Prototyps ein Knopf, der den Auftrag automatisch abschließt. Dann gemeinsam das weitere Vorgehen planen.

**Claude** hat vorgeschlagen: Knopf „🧪 Test: Auftrag erledigen“ im Level-Fenster – Erfahrung ja, keine Waren, kein Gold, Aufsteigen kostet weiter Gold; Frage, ob immer oder nur im Testmodus sichtbar. Für das Kräuter-Kapitel: erst das Gesamtbild auf dem Papier, dann häppchenweise umsetzen (v0.16.0 Beet und Level 7 …). Fragen zum Beet (wie der Holzfäller oder echtes Warten?), ein Beet für alle Pflanzen, Preise (wie Holz oder wie Eisen) und eine Skizze für Level 7 (Leinsamen → Beet → Flachsfasern → Webstube mit Verbänden).

**Tobias:** Der Knopf soll immer zu sehen sein. Häppchenweise, wie vorgeschlagen. Das Beet kauft man wie eine Maschine, platziert es und pflanzt den Samen; ein Samen ergibt eine Pflanze, die man etwas größer darstellen kann. Nach einer Zeit ist aus dem Samen eine Pflanze geworden, die man erntet. Dann macht eine Maschine aus der Pflanze Fasern, und im nächsten Schritt gibt es wieder eine Maschine mit 2 Eingängen für Faser + Kräuter. Aus einer Pflanze z. B. 50 Fasern, daraus 10 Verbände. Das Beet soll (noch) keinen Anschluss ans Band haben; darin wächst alles, unabhängig vom Typ. Preise in der mittleren Kategorie – die mittleren Werkstattwaren bringen 72 bis 300 Gold –, z. B. 1 Verband 150 Gold, 1 Samen 1.000 Gold, also 1.500 Gold je Samen; Feintuning später. Die Basis soll günstig bleiben, mit Ringelblumen kann es anziehen (teurer, bringt mehr). Sonst wie Level 1 aufbauen, um klein anzufangen. Weil ein Samen etwa 50 % Rendite bringt, soll es etwa 30 Minuten dauern, bis die Pflanze ausgewachsen ist – so lässt sich der Geldfluss steuern.

**Umgesetzt:** v0.15.0 (siehe Versionshistorie). Tobias' Antworten zum Kräuter-Kapitel stehen in Abschnitt 4.4.

**Claude** hat danach einen Entwurf für Level 7 vorgestellt (Leinsamen → Beet → Flachspflanze → Flachsbreche → 50 Fasern → Webstube → 10 Verbände; Werte 1.000 → 1.250 → 1.500; 3 Beete je Flachsbreche) und gefragt: Pflanze einlegen wie einen Holzstamm? Ernten und neu säen in einem Tipp? Beet 2 × 2? Kommt die Maschine mit 2 Eingängen erst auf Level 8?

**Tobias:** Einlegen: ja. Ernten und Säen sollen zwei getrennte Schritte sein, damit man zweimal alles durchgehen muss. Beet 2 × 2: ja. Level 8: genau richtig verstanden. Schrittweise immer mehr dazu: auf Level 7 erst die Verbände als Grundlage, auf Level 8 kommt etwas dazu, auf Level 9 der nächste Schritt mit einer neuen Pflanze – bis Level 10 hat man Fasern + 3 verschiedene Pflanzen (wie Holz, Eisen und Stein), auf Level 11–12 kann man diese weiter kombinieren. So ähnlich war es schon festgelegt.

**Umgesetzt:** v0.15.1 (nur README): Plan für v0.16.0 – Beet und Level 7 „Die Heilstube“ (Abschnitt 6).

**Tobias:** „Passt so, leg los mit v0.16.0.“

**Umgesetzt:** v0.16.0 (siehe Versionshistorie).

**Tobias (Test von v0.16.0):** Man sieht gut, wie das Beet wächst. Ernten und Säen fühlen sich gut an; Material gab es erst für ein Beet, deshalb lief der Testmodus, damit es schneller wächst. Aus Fasern ließen sich Verbände herstellen. Die Aufträge passen. Der Vorplan war gut, damit wir es gut umsetzen können. Jetzt Level 8 planen.

**Claude** hat einen Entwurf für Level 8 „Der Kräutergarten“ vorgestellt: Ringelblumensamen (1.500 Gold) → Beet → Ringelblume → Trockenboden → 50 Ringelblüten → Kräuterstube (2 Eingänge) mit Heilverband und Kräuterkompresse; Aufstieg 4.000 Gold, 4 Aufträge; Kräuterstube aus 10 Verbänden + 2 Zahnradwellen.

**Tobias:** Für die Pflanzen soll es die gleiche Maschine geben wie für Flachs, damit aus der Ringelblume 50 getrocknete Ringelblüten werden – bei den Pflanzen etwas einfacher halten. Die Rechnung ist sehr gut: dauert lange, bringt aber gutes Geld. Die verschiedenen Blumen (Kräuter) dienen später als Grundlage für einen Mörser, z. B. für Ringelblumenstaub. Die Aufträge passen. Die Gebäude sollen überwiegend aus Werkzeug-Waren hergestellt werden – es ergibt keinen Sinn, dass aus 10 Verbänden und 2 Zahnradwellen eine Maschine wird. Kräuterkompresse gut, aber wofür war sie gedacht? Alles im gleichen Takt; Preise und Namen passen.

**Claude:** Die Kompresse ist für Prellungen und Schwellungen (der Verband für Wunden), später Zutat für Größeres. Vorschlag: die Flachsbreche in „Erntebank“ umbenennen, weil sie jetzt alle Pflanzen verarbeitet.

**Umgesetzt:** v0.16.1 (nur README): Plan für v0.17.0 – Ringelblume und Level 8 „Der Kräutergarten“ (Abschnitt 6).

**Tobias (09.11.2026):** „Ja, das passt so, und die Erntebank darf auch so bleiben. Meiner Meinung nach der bessere Name.“

**Umgesetzt:** v0.17.0 (siehe Versionshistorie). Als Nächstes testet Tobias Level 8; danach planen wir Level 9.

### 07.11.2026 – Chat 10: Test von v0.13.0, Spiel im Hintergrund, Kräuter-Kapitel, Plan und Umsetzung v0.14.0

**Tobias:** Die Stückzahlen passen; er hat den ersten Auftrag gesehen, eine machbare Menge – das Spiel soll auch fordern. Die Produkte mit den neuen Namen ergeben mehr Sinn und passen zur Geschichte. Die Bilder auf dem Band hat er noch nicht ausprobiert, geht aber davon aus, dass sie passen. Zum Weiterlaufen: Das Spiel soll im Hintergrund weiterlaufen, aber man muss selbst nachlegen – Holz, Stein und Eisen immer von Hand. Hat man z. B. 10 Holzfäller, die so viel produzieren, dass die Maschinen mehrere Stunden laufen, soll das auch im Hintergrund passieren. Man soll sich immer wieder einloggen müssen, um nachzulegen; die Produktion läuft automatisch. Das Zwischenlager soll nur noch die Funktion „Befüllen“ haben, sonst könnte man kurze Produktionsstraßen bauen, alles ins Lager schicken und über das Lagerhaus wieder heraus. Wie bei Clash of Clans, nur andersherum: Alles läuft, bis es leer ist, dann manuell nachfüllen. Techbaum: eine neue „Art“ – Kräuter. Auf Level 7 Farn oder Hanf (was mehr Sinn ergibt), daraus Fasern und in einem zweiten Schritt Verbände; auf Level 8 und 9 weitere Kräuter für heilende Verbände; später mit dem Mörser Pulver und Zaubertränke – wir sind ja im Mittelalter-Fantasy-Magier-Genre.

**Claude** hat geantwortet: Ein Holzstamm reicht 15 Minuten; 10 Holzfäller arbeiten gleichzeitig und sind nach 15 Minuten alle leer – mehr Holzfäller machen die Fabrik schneller, nicht länger. Vorschlag: Vorrat von 4 Rohstoffen je Gebäude (1 Stunde), Knopf „Auffüllen“ (erst Laden-Lager, dann kaufen), alles läuft weiter bis es leer ist (auch Kunden bis die Theken leer sind), Fenster „Willkommen zurück“; Lagerhaus: Nachschub weg, Befüllen und Ausräumen bleiben. Techbaum: Flachs statt Farn oder Hanf (Leinenbinden waren die Verbände des Mittelalters), Farn später als Zauberkraut; grober Bogen bis Level 10 mit Kräuterbeet, Heilstube, Mörser und Alchemistenküche. Reihenfolge: erst der Hintergrund (v0.14.0), dann Level 7.

**Tobias:** Mehrere Holzstämme gut, aber 3 statt 4. Seine Rechnung war: Zwischenlager können volllaufen; wird später z. B. ein Schloss aus bestimmten Stoffen hergestellt, ist der Holzfäller nach 15 Minuten leer, aber die restliche Produktion läuft weiter, bis die letzte Maschine nicht mehr arbeitet (15 Minuten bis leer, dazu Zeit für den Transport und jede Weiterverarbeitung) – im Prinzip richtig verstanden. „Auffüllen“ ist ein guter Knopf. Nachschub hat er nie benutzt. Kunden dürfen kaufen, bis alles leer ist. Flachs. Statt einzelner Gebäude ein allgemeines Beet, in dem man alles anpflanzen kann. Ringelblume ist eine gute Ergänzung für die Heilung. Level 7 Verbände, Level 8 erster Heilverband, Level 9 zweite Verbandsversion; mit dem Alchemisten möchte er bis etwa Level 15 warten. Die Level 1–6 waren voller Werkzeuge; die nächsten Level fangen mit neuer Thematik wieder von vorn an – einfach Flachs und Verbände herstellen, dann steigt die Schwierigkeit, sodass man auf Level 10 (dem „Level 4“ der Werkzeuge) wieder mehr in die Produktion investieren muss, und auf Level 11 oder 12 schließt das Kräuter-Kapitel ab. Dann gibt es zwei große Techbäume, Werkzeuge und Kräuter, und ab Level 13 kommen neue Produkte wie Sand: daraus Glas, aber über die Kräuter-Maschinen auch Sandstaub für die Zauberei. Erst den Hintergrund umsetzen, dann die Vorgehensweise mit Level und Techbaum besprechen, damit später alles Sinn ergibt.

**Umgesetzt:** v0.14.0 (siehe Versionshistorie). Der nächste Chat beginnt mit Tobias' Test von v0.14.0; danach besprechen wir das Kräuter-Kapitel (Abschnitt 4.4).

### 07.11.2026 – Chat 9, Teil 2: Test von v0.12.0, Gesamtbild, Plan und Umsetzung v0.13.0

**Tobias:** v0.12.0 getestet und die Schlosserei gebaut. Wer bis Level 6 gekommen ist, hat das Grundprinzip des Spiels verstanden. Die einzelnen Komponenten und Produkte ergeben größtenteils Sinn, aber in der Hauptmasse geht alles irgendwie unter – am Ende stellen wir Ketten, Schlösser und Regler her. Alles soll in der Gesamtheit mehr Sinn ergeben, damit wir die Geschichte mit weiteren Maschinen und Produkten immer besser spinnen können. Als Nächstes stehen die Aufgaben auf dem Plan?

**Claude** hat einen roten Faden vorgeschlagen: wachsender Ort am Fluss, jedes Level ein Bauabschnitt (Hütten, Wege und Brunnen, Schmiede, Mühle, Markt, Stadttor), Aufträge der Bewohner statt nackter Ziele; später eventuell Fertigwaren.

**Tobias:** Der Rahmen gefällt ihm sehr gut. Die Sachen sollen abgegeben werden: ein eigener Reiter mit den Aufträgen, „Abgeben“ entfernt die Waren aus dem Lager, dafür gibt es XP und Gold. Keine Fertigwaren wie Türen oder Truhen, die sind auf dem Band nicht darstellbar – weiterhin kleine Produkte, die im echten Leben klein sind. Bei den Produkten ging es ihm um die Logik: Ist es logisch, dass zwei Verstärkte Platten und ein Scharnier eine Uhr ergeben? Aus zwei Produkten soll das nächstmögliche, sinnvolle Produkt entstehen. Idee für den weiteren Techbaum: Kräuter anpflanzen, die nach einer Zeit wachsen und geerntet werden; durch den Mörser; aus Farn oder Hanf Verbände, Verband + Kräutermixtur = Heilender Verband; Kräuter mit Kohle und anderem gemischt ergeben erste Tränke (Lebenstrank, Manatrank, Alterstrank …). Aber zuerst die Aufgaben, dann den Techbaum. Nächster Schritt: besprechen, wie wir die Aufgaben planen und die Artikel umbenennen.

**Claude** hat geantwortet: 1 Scharnier + 2 Verstärkte Holzplatten sind die Baukosten der Schlosserei, kein Rezept – aber einige Rezepte sind tatsächlich nicht logisch. Vorschlag Teil 1: Rezepte und Werte bleiben, nur Namen und Bilder ändern sich (Tabelle in Abschnitt 4.2). Teil 2: Reiter „Aufträge“ im Laden, bis zu 3 Aufträge, +50 % Gold, danach zufällige Bestellungen, Aufstieg mit Gold.

**Tobias:** Teil 1 passt und gefällt ihm. Teil 2 teilweise: Der Reiter gehört zum Laden-Level, weil die XP für das Level gebraucht werden – deshalb auch eine Level-Leiste, die zeigt, wie viel XP noch fehlen. Aufträge geben unterschiedlich viel XP und Gold, je nachdem, was gebraucht wird; mehr Gold soll es nicht geben, weil die XP im Vordergrund stehen (Ersatz für die Produkte, die man früher für ein Level herstellen musste). Immer nur ein Auftrag; ist er geschafft, kommt der nächste; 2–5 je Level; nicht ignorierbar. Die Produktion soll durch die Aufträge mehr in die Masse gehen – nicht 3 Räderwerke, sondern ein gutes Gleichgewicht, für das man arbeiten muss (z. B. 20 Räderwerke). Idee: mit XP Verbesserungen freischalten (schneller Holz verarbeiten, schnellere Förderbänder) – noch unsicher, vorerst nur Aufträge fürs Level. Die Level erzählen die Geschichte des Dorfes, die Aufträge verpacken sie. Nur diese Aufträge, keine weiteren Anfragen – der Ladenverkauf steht im Vordergrund. Aufsteigen: XP schaltet frei, Gold kauft das Level, Bauteile bauen die Maschinen. Namen darf Claude aussuchen. Alles in der README festhalten, damit er danach einen neuen Chat beginnen kann.

**Umgesetzt:** v0.13.0 (siehe Versionshistorie). Der nächste Chat beginnt mit Tobias' Test von v0.13.0; danach planen wir den weiteren Techbaum.

### 07.11.2026 – Chat 9: Feedback nach Level 6, Plan und Umsetzung v0.12.0

**Tobias:** Level 6 erreicht, die Schlosserei aber noch nicht gebaut. Ihm ist aufgefallen, dass man schon am Anfang auf das „Makro-Game“ achten muss – sonst muss man wie er am Ende noch einmal Holzfäller bauen, um eine eigene Strecke für Stäbe und Platten einzurichten und die Produktion erweitern zu können. Gefehlt hat ihm, Sachen aus dem Lager wieder zurück aufs Band zu nehmen: z. B. 120 Eisenbarren im Lager, die er zu schade findet, für 12 Gold zu verkaufen, wenn er sie in die Produktion einschleusen könnte. Idee: ein Gegenspieler zum Versandportal, der Sachen aus dem Lager auf ein Band schickt – eventuell das Zwischenlager, das man aus dem Lager befüllen kann. So dient es am Anfang als Station, die man befüllt, und lässt sich auch in den Kreislauf einbinden, um Sachen zwischenzulagern, die man viel baut (am Anfang z. B. viel Holz), damit nicht alles direkt im Versandportal landet. Sonst ist er mit der Art und Weise des Spiels sehr zufrieden.

**Claude** hat den Plan für v0.12.0 vorgestellt: Lagerhaus mit „📥 Befüllen“ (Menge wie bei der Theke), „🔁 Nachschub“ mit einstellbarem Rest im Laden-Lager („eiserner Bestand“) und „↩ Ausräumen“; Kreispfeil mit Warenbild am Lagerhaus; dazu „Strecke leeren“ und „Zulauf leeren“. Hinweis zur Balance: Versandportal plus Nachschub schickt Waren quer übers Grundstück – erst einmal ohne Bremse. Frage: Woran hing die Schlosserei?

**Tobias:** Der Plan passt so; man muss es spielen, um zu sehen, wie es läuft. Wer am Anfang mehr auf das Makro achtet und ordentlich arbeitet, kann darauf verzichten, aber es hilft, wenn man zu viel im Lager hat und gerade das Band voll bekommen will. Zur Schlosserei: Er musste Verstärkte Holzplatten bauen, aber seine Holzfarm liegt ganz oben und die Eisenfarm ganz unten. Er wollte die Produktion nicht stören und eine neue Kette für Verstärkte Holzplatten einrichten; dafür fehlten ihm die Materialien, weil er nicht genug „Materialdruck“ hatte, und dann auch das Gold für neue Rohstoffe – entweder produziert man Neues, oder man verkauft. Er muss die Mitte finden, damit zwischen Verkaufen und Produzieren immer noch ein Plus bleibt, um weiter Rohstoffe zu kaufen.

**Claudes Einordnung:** Genau dafür hilft der Nachschub: Holzplatten und Eisenstangen laufen über Versandportale ins Laden-Lager, und an einer freien Stelle holen zwei Lagerhäuser mit Nachschub sie an die Zimmerei – ohne neue Holz-Linie und ohne die beiden Farmen zu verbinden. Die Balance zwischen Verkaufen und Weiterverarbeiten nehmen wir in den Plan für die Aufgaben (v0.13.0) mit.

**Umgesetzt:** v0.12.0 (siehe Versionshistorie).

### 07.11.2026 – Chat 8, Teil 3: Test von v0.11.0 & Pause

**Tobias:** Es läuft sehr gut. Er spielt eigentlich nur in Echtzeit und muss ständig umbauen, weil ihm entweder Blöcke fehlen oder er Platten braucht, um neue Dinge zu errichten. Man muss sich zuerst auf eine Produktion konzentrieren, um dann andere angehen zu können – Umbauen, Abreißen und Neubauen sind dadurch ein wesentlicher Bestandteil des Spiels. Ein „Problem“: Schickt er beim Umbauen plötzlich Holzplatten direkt ins Lager, um Maschinen kaufen zu können, blockieren die Platten unter Umständen die Strecke für die Schalter, auf die eigentlich nur Stäbe gehören. Bisher hat er die Bänder abgerissen und neu gebaut, damit die Waren verschwinden. Verschieben und Markieren klappen hervorragend; man muss sich etwas an die Handhabung gewöhnen, aber das Grundprinzip passt. Drehen mit R klappt hervorragend. Nach über einer Stunde hatte er Level 6 noch nicht erreicht; nach 2–3 Stunden hat er gerade das erste Scharnier hergestellt. Der Flow ist sehr gut: Man kommt schnell rein, kann immer wieder produzieren und muss Holz, Stein und Eisen nachlegen, damit die Produktion weiterläuft – man spielt gut auf Fortschritt hin.

**Claude** hat vorgeschlagen: v0.11.1 mit „🧺 Strecke leeren“ am Band und „🧺 Zulauf leeren“ an blockierten Maschinen (Waren ins Laden-Lager, Bänder bleiben liegen); als Idee für später eine Weiche mit Filter.

**Tobias:** Eine gute erste Idee, aber eigentlich muss er mehr Bänder bauen, weil er vergisst, Baumaterialien extra zu sichern: Am Anfang verkauft man alles, weil man Geld braucht, später lagert man nichts mehr ein, weil man es für die Produktion braucht. Wer am Anfang strukturierter arbeitet und immer einen „eisernen Bestand“ im Lager hat, kommt nicht in Not. „Band leeren“ findet er trotzdem gut – erst einmal festhalten. Jetzt Pause: Er versucht, Level 6 zu erreichen, und gibt dann weiteres Feedback, „damit wir nicht nur für eine Kleinigkeit codieren“.

**Umgesetzt:** v0.11.1 (nur README). Der nächste Chat beginnt mit Tobias' Feedback nach Level 6.

### 07.11.2026 – Chat 8, Teil 2: Test von v0.10.2, Plan und Umsetzung v0.11.0

**Tobias:** Fabrik ist unverändert. Fläche kaufen fühlt sich richtig an, um alles besser auf Masse auszurichten. App minimieren und zurückkommen hat geklappt, alle Bilder sind noch da. Ein Anliegen noch: Das Umbauen ist umständlich geworden, weil er jedes Förderband einzeln antippen muss, um es abzureißen und neu zu bauen; genauso bei Maschinen und Portalen. Wunsch: jedes Teil auf der Fläche verschieben können und zusätzlich einen Bereich markieren, um ihn komplett zu verschieben – z. B. die Eisen-Produktion als gesamten „Prozess“ in die untere Ecke, statt jedes Band und jede Maschine einzeln.

**Claude** hat den Plan vorgestellt: Werkzeug „✥ Verschieben“ – Rechteck ziehen oder Teil antippen, dann die Gruppe verschieben (grün/rot), drehen oder abreißen; alles in der Gruppe bleibt verbunden und Waren ziehen mit um. Dazu der Tipp, dass man im Abreiß-Werkzeug schon über viele Bänder wischen kann. Fragen: Gehören halb markierte Maschinen dazu? Drehen der ganzen Gruppe gleich mit einbauen?

**Tobias:** Guter Tipp, das hatte er noch nicht gesehen. Genau so umsetzen, gerne als v0.11.0. Halb markierte Maschinen oder Teile sind ebenfalls markiert; Drehen der ganzen Gruppe gerne mit einbauen. Er spielt auf dem Galaxy Tab S9 fast immer mit angeschlossener Tastatur – deshalb soll man zusätzlich mit R drehen können, auch einzelne Gebäude und Maschinen.

**Umgesetzt:** v0.11.0 (siehe Versionshistorie).

### 07.11.2026 – Chat 8: Feedback zu v0.10.1, Plan und Umsetzung v0.10.2

**Tobias:** Die Änderungen sind sehr gut und machen jetzt viel mehr Sinn. Die Fläche ist aber immer noch ein entscheidender Faktor. Wunsch: Die Erweiterung kostet immer 500 Gold und steigt nicht, wenn man neue Fläche dazukauft, damit man am Anfang besser skalieren kann; jede Seite soll sich 2× für je 500 Gold vergrößern lassen. Besonders ab Level 4 und 5 muss man in die Massenproduktion gehen, um z. B. Schalter in guter Stückzahl herzustellen. Außerdem werden unten im Menü die Bilder der benötigten Waren nicht mehr angezeigt, dort steht z. B. nur noch „20“ und „5“. Die Aufgaben (v0.11.0) können warten; erst v0.10.2, damit das Spielgefühl noch besser wird.

**Claude** hat den Plan vorgestellt: jeder Kauf 500 Gold und 4 Reihen ab Level 1, Welt so groß, dass jede Seite genau 2 Käufe hat (38 × 30, fast viermal so viel wie zum Start, zusammen 4.000 Gold), gekaufte Fläche zählt mit, Rest-Streifen anteilig. Zu den Bildern: Vermutlich wirft der Browser die einmal beim Start gezeichneten Bilder weg, wenn die App im Hintergrund ist; Lösung: bei jedem Öffnen der Bauleiste und beim Zurückkehren neu zeichnen.

**Tobias:** 4 Reihen reichen. Wer Spaß am Spiel hat und seine Fabrik skalieren möchte, soll nicht am geringen Platz scheitern; die Einstiegshürden sollen so gering wie möglich sein. Die Bilder waren erst weg, nachdem er die App minimiert hatte, um Claude zu öffnen; davor waren sie immer da. „Passt!“

**Umgesetzt:** v0.10.2 (siehe Versionshistorie).

### 07.11.2026 – Chat 7, Teil 2: Test von v0.10.0

**Tobias:**
- **Theken:** Gemeint war, dass die Menge jeder Theke steigt – alle wachsen mit, weil die Ware stetig mitwächst. Idee: zuerst kleine Theken mit 20, dann mittlere mit 25 und große mit 30, dann bleibt es erst einmal fest.
- **Zimmerei:** gebaut und umgestellt, um zu sehen, welche Teile die anderen Produkte brauchen. Dabei sind alle Einzelteile in der Maschine „verschwunden“.
- **Fläche:** Für mehr Platz hat er Fläche gekauft, aber nur 2 Reihen für 430 Gold bekommen. Die Menge pro Kauf sollte größer werden, weil man ab Level 4 die Produktion deutlich steigern muss: mehr Holzfäller und Steinbrüche, um schneller an die Einzelteile zu kommen und die Zimmerei massenhaft zu versorgen. Im Moment dauert es etwa 5 Minuten, bis ein Stein-Zahnrad in der Zimmerei ankommt. Das ist das Feintuning, von dem er gesprochen hat: Am Anfang läuft es relativ schnell, danach wird es immer langwieriger, weil man hier und dort auf Masse gehen muss, um genug zu produzieren.
- **Laden-Lager:** Bei Massenproduktion wird es schnell voll – schon 50 von jedem Artikel auf Level 4 machen es eng. Wunsch: 1.000 Plätze.
- Die Punkte ändern und in der README festhalten; danach testet Tobias erneut und schreibt das Feedback in einen neuen Chat, bevor es mit v0.11.0 weitergeht.

**Claude:** Die Teile waren nicht verloren, sondern lagen im Laden-Lager (es gab nur eine kurze Meldung) – trotzdem verwirrend. Umgesetzt mit Claudes Lesart: Theken 20 → 25 (Level 4) → 30 (ab Level 5); Laden-Lager 1.000 ab Level 4; Flächen-Streifen ab Level 4 doppelt so tief bei gleichem Preis je Feld; Teile bleiben beim Umstellen in der Maschine, die Rezepte aller Einstellungen stehen im Infofenster.

**Umgesetzt:** v0.10.1 (siehe Versionshistorie).

### 06.11.2026 – Chat 7: Plan und Umsetzung v0.10.0 (Techbaum, Teil 2)

**Claude** hat die README gelesen und den Plan für v0.10.0 vorgestellt: 6 Maschinen (Mühlenbauer, Zimmerei, Feinwerkstatt, Feinschmiede, Getriebebauer, Schlosserei), Baukosten, Rezepttabelle, Level 4 mit Eisenerz als Geschenk, Anzeige fehlender Zutaten, Kunden kaufen teure Teile genauso oft.

**Tobias:** Die Zeiten aus dem letzten Test waren echte Zeit; nur die Eisen-Durchläufe hat er etwas schneller gemacht. Für die nächste Stufe nicht 6, sondern nur **3 Maschinen** mit 2 Eingängen und 1 Ausgang, umschaltbar wie die Maschinen davor – sonst zu viele Maschinen und zu viel Unordnung:
- Zimmerei: Handkurbel, Verstärkte Holzplatte, Schalter
- Feinschmiede: Scharnier, Kugellager, Eisenfeder
- Schlosserei: Steinkette, Schloss, Regler

Also 9 neue Produkte und 3 neue Maschinen, die Produkte lassen sich unterschiedlich skalieren; die übrigen fallen weg. Jedes Produkt braucht ein eigenes Rezept, z. B. Handkurbel 10 Holzstäbe + 5 Zahnräder und Schalter 10 Zahnräder + 5 Holzstäbe, damit alle Ressourcen etwa gleich viel beansprucht werden.

**Claude** hat den Plan überarbeitet: Rezepte im Muster 10 + 5 (Steinkette aus Steinplatten), Werte nach +20 %, Baukosten der 3 Maschinen, Level 4 Zimmerei, Level 5 Feinschmiede, Level 6 Schlosserei mit je 1 Eisenerz.

**Tobias:** Steinkette aus Steinplatten klingt schlüssig, die Level passen: So kommt man am Anfang immer ein Stück weiter und lernt alles kennen, bis man etwa bis Level 10 das „Intro“ abgeschlossen hat. Die Ansicht, welche Zutat fehlt und wie viel, ist gut. Dazu: Mit dem Aufstieg auf Level 4 eine Ladentheke mehr und bis Level 6 jedes Mal eine weitere – auf Level 6 also 5 Theken –, weil die Produkte wertvoller werden; das Volumen soll ab 20 für jede neue Theke um 5 steigen. Außerdem eine bestimmte Anzahl auf die Theke räumen können, z. B. nur 8. „Wir probieren die Werte gerne so aus.“

**Umgesetzt:** v0.10.0 (siehe Versionshistorie).

### 06.11.2026 – Chat 6, Teil 3: Test von v0.9.1

**Tobias** (zwei Screenshots: Fabrik auf Level 3 mit 936 Gold; Laden-Lager mit Waren im Wert von 6.081 Gold, u. a. 38 Holzplatten, 38 Holzstäbe, 36 Steinplatten, 27 Stein-Zahnräder, 24 Mini-Eisenplatten, 23 Eisenstangen): Mit dem alten Spielstand getestet. Etwa 45 Minuten gespielt, bis er Eisen herstellen konnte; dafür musste er ein paar Runden komplett Holz und Stein herstellen, um immer mehr Gold zu bekommen. Nach etwa 60 Minuten lief schon die zweite Runde Eisen, und er hat einiges an Gold verdient. Man muss ein wenig grinden, um voranzukommen – „genauso hab ich es mir auch vorgestellt“. Flächen hat er noch nicht gekauft, sieht sie aber als gute Erweiterung; preislich sollten sie erschwinglich sein, notfalls arbeitet man 1–2 Runden mehr mit Rohstoffen. Feedback in die README; danach neuer Chat für den Plan von v0.10.0.

**Fabrik auf dem Screenshot:** je eine Linie für Holz, Stein und Eisen – Rohstoff-Gebäude → Aufteilung auf 2 Maschinen (beide Einstellungen) → Bänder wieder zusammengeführt in 1 Versandportal; dazu ein Versandportal neben dem Holzfällerlager. Die rechte Hälfte des Grundstücks ist noch frei.

**Claudes Hinweis:** Auf den Screenshots ist der Testmodus (×10) an. Ob die Zeiten (45 und 60 Minuten) in Echtzeit gemessen sind, klären wir beim nächsten Test.

**Umgesetzt:** v0.9.2 (nur README). Der neue Chat beginnt mit dem Plan für v0.10.0 (Techbaum, Teil 2).

### 06.11.2026 – Chat 6, Teil 2: Test von v0.9.0 in Echtzeit & Startkapital

**Tobias:** In normaler Geschwindigkeit getestet und quasi pleite gegangen. Nur das Nötigste gebaut (2 Sägewerke, damit beides hergestellt werden kann), 372 Gold verdient – für einen neuen Holzstamm fehlen rund 200 Gold. Level 2 erreicht, aber noch nichts mit Stein gebaut, weil die „Produktionskosten“ ins Minus geführt haben. Vorschlag: 500 Gold Startkapital, damit nach dem Bauen genug Gold für einen zweiten Holzstamm bleibt.

**Claude:** Nachgerechnet – mit einem Holzstamm allein reicht es nie (rund 400 Gold nach den Baukosten). Plan v0.9.1: 500 Gold Startkapital, einmalige Nachzahlung für bestehende Spielstände, und eine Lücke im Pleiteschutz schließen (Felsbrocken ohne Steinbruch verhindert das Geschenk).

**Tobias:** Startkapital und Nachzahlung direkt umsetzen. Den Pleiteschutz lassen wir erstmal so, weil sich das Problem mit den 500 Gold eigentlich gelöst hat.

**Umgesetzt:** v0.9.1 (siehe Versionshistorie).

### 06.11.2026 – Chat 6: Test von v0.8.0, Plan und Umsetzung v0.9.0

**Tobias** (Screenshot der alten Fabrik: Schmelzhütte, 2 Schmieden, 2 Sägewerke, 2 Steinmetze, 9 Lagerhäuser, 8 Versandportale): v0.8.0 läuft, alles hat sich gut geändert. Er spielt erst alles mit hoher Geschwindigkeit durch, um die Logik bis weit in den Fortschritt zu prüfen, danach in Echtzeit. 2 Theken fühlen sich gut an; er hat mehr produziert als verkauft, weil die Theken im Schnellmodus oft leer standen – das Lager hat aber einen hohen Warenwert. Knifflig war, dass für neue Gebäude Blöcke fehlten, weil keine Strecke Blöcke in den Laden schickte. Mit rund 2.500 Gold konnte er Holz und Stein nachkaufen. Mit einer guten Balance der Maschinenkosten lohnt sich das Hinarbeiten auf Neues. Idee: am Anfang eher die Massenproduktion erhöhen. **Nicht die Zeit, sondern der Platz ist das Problem** – für weitere Maschinen wäre kein Platz.

**Claude:** Rund ein Drittel der Fläche ist noch frei (vor allem rechts), aber Lagerhäuser und Versandportale belegen 26 Felder; mehrere Bänder lassen sich in ein Portal zusammenführen. Vorschlag: Fläche kaufen vorziehen; Fragen zu Theken im Testmodus und zu Blöcken.

**Tobias' Antworten:**
- Theken bleiben manuell, damit er die Übersicht behält und nicht versehentlich alles verkauft.
- Erst Fläche, dann Techbaum. Dazu schon kleine Level: Level 1 nur Holz, Level 2 Stein, Level 3 Eisen. Langfristig mit Aufgaben (z. B. 50 Blöcke und 20 Holzplatten herstellen → 100 XP und 250 Gold); mit genug Erfahrung schaltet man das nächste Level frei und kauft den Aufstieg, z. B. für 100 Gold. So gibt es mehrere Handlungsstränge (produzieren, verkaufen, für Aufgaben herstellen). Für den Anfang ganz einfach: aufsteigen, sobald man z. B. 1 Holzplatte und 1 Holzstab hergestellt hat.
- Blöcke: bleibt so – Abreißen gibt die Baukosten 1 : 1 zurück, und die Produktion auf das zu verlagern, was gerade gebraucht wird, gehört zum Spielprinzip.
- Das Zusammenlegen der Bänder hatte er vergessen.

**Claude** hat den Plan für v0.9.0 vorgestellt (Abschnitt 6). **Tobias:** „Ja, leg los. Zu Beginn eines Levels sollte man immer 1× Rohstoff gratis bekommen.“

**Umgesetzt:** v0.9.0 (siehe Versionshistorie).

### 06.11.2026 – Chat 5, Teil 3: v0.7.0 läuft, Freigabe Eisenstange

**Tobias** (Screenshots vom Tablet, noch v0.7.0 aus dem Zwischenspeicher, Testmodus an): v0.7.0 ist doch geladen. Ware verkauft sich und er nimmt Geld ein (gut 3.000 Gold). Alle Gratis-Rohstoffe sind verarbeitet; jetzt müsste er Gold in Holzstamm, Felsbrocken oder Eisenerz stecken, damit die Produktion weiterläuft. Im Lager liegen 140 Eisennägel. „Eisenstange klingt sehr gut. Das kann jetzt schon gerne rein, damit wir alles frisch haben.“ Alles in der README festhalten; danach geht es in einem neuen Chat weiter.

**Umgesetzt:** v0.8.0 (siehe Versionshistorie). Der Fahrplan rückt um eine Version nach. Der neue Chat beginnt mit dem Plan für v0.9.0 (Techbaum, Teil 2).

**Claudes Hinweis:** Der Testmodus beschleunigt auch die Kunden (×10). Um das Verkaufstempo zu beurteilen, ihn im Menü ☰ ausschalten.

### 06.11.2026 – Chat 5, Teil 2: Startfehler & zu viele Nägel

**Tobias** (Screenshots vom Tablet): Seit v0.7.0 öffnet sich das Spiel nicht mehr (schwarzer Bildschirm). In v0.6.1 hat er vorher alles einmal gebaut (Schmelzhütte, 2 Schmieden, 2 Sägewerke, 2 Steinmetze, Lagerhäuser als Verteiler, 6 Versandportale) und gemerkt, dass extrem viele Nägel entstehen (im Lager 100 Eisennägel, sonst je etwa 20 Teile). Vorschlag: aus den Nägeln erst einmal Metallstangen machen, ebenfalls im Verhältnis 5 : 1, damit das Gleichgewicht am Anfang passt.

**Umgesetzt:** v0.7.1 (Startfehler, siehe Versionshistorie).

**Claudes Plan zu den Nägeln (in Teil 3 freigegeben, umgesetzt als v0.8.0):**
- Schmiede, Einstellung B: **Eisenstange** statt Eisennägel – 5 Eisenbarren → 1 Eisenstange in 5 Sekunden, Wert 72 Gold (wie die Mini-Eisenplatte). Damit laufen alle drei Grundmaschinen gleich: Platte oder ein spezielles Teil, je 5 : 1.
- Eisennägel fallen vorerst weg (wie damals Holzwinkel und Splitt). Vorhandene Nägel werden umgewandelt: je 5 Nägel → 1 Eisenstange (aufgerundet), auch auf Theken, in Lagerhäusern und Gebäuden; eine Schmiede auf „Nägel“ wird auf „Stangen“ umgestellt.
- Folge für den Techbaum Teil 2: Wo bisher „2 Eisennägel“ stehen, steht „1 Eisenstange“; die Werte der Kombi-Teile werden neu gerechnet (Plan für Teil 2). Nägel können später als eigene Stufe zurückkommen.

### 06.11.2026 – Chat 5: Plan und Umsetzung v0.7.0 (Handel)

**Tobias:** v0.6.1 lief sehr gut.

**Claude** hat den Plan für v0.7.0 vorgestellt (Laden mit Reitern, Händler, 2 Theken, Kunden, Baukosten in Gold, Pleiteschutz) und drei Fragen gestellt.

**Tobias' Antworten:**
1. Verkaufstempo erst einmal so lassen, um zu sehen, wie das Abverkaufen ist und wie viel Gold man beim Spielen real erwirtschaftet.
2. Kein Notverkauf zum Spottpreis – das war nur eine Online-Idee. Man soll das Lager über die Theken abverkaufen; manche Teile braucht man später noch, deshalb ist es gut, von allem etwas im Lager zu haben.
3. Baukosten nicht in Gold, sondern in Waren, z. B. ein Förderband kostet einen Holzblock, ein Sägewerk ein paar Holzplatten und Holzblöcke. So muss man abwägen: verkaufe ich meine Holzplatten oder baue ich dafür eine Maschine – ohne ins Minus zu rutschen.

**Claude** hat eine Kostentabelle in Waren vorgeschlagen (Abschnitt 4.2). **Tobias:** Passt so; erst einmal spielen und schauen, ob die Mechanik passt und es nicht zu lange dauert, neue Sachen zu bauen.

**Umgesetzt:** v0.7.0 (siehe Versionshistorie).

### 06.11.2026 – Chat 4, Teil 2: Test von v0.6.0 & größeres Grundstück

**Feedback von Tobias** (Screenshot vom Tablet): Alles sieht gut aus, die Ware kommt im Laden an. Tobias hat eine Fabrik mit 2 Sägewerken, 2 Steinmetzen, einer Schmiede, 3 Lagerhäusern als Verteiler und 5 Versandportalen gebaut. Für eine zweite Eisen-Linie fehlt aber der Platz.

**Claudes Vorschlag:** v0.6.1 – Grundstück 22 × 14 statt 16 × 10, wächst nach rechts und unten, auch für bestehende Spielstände; „Fläche kaufen“ bleibt für später.

**Tobias:** Passt so. Alles in der README festhalten, weil danach ein neuer Chat startet.

**Umgesetzt:** v0.6.1 (siehe Versionshistorie). Der neue Chat beginnt mit dem Plan für v0.7.0 (Handel).

### 06.11.2026 – Chat 4: Freigabe v0.6.0

**Claude** hat die README gelesen und den Plan für v0.6.0 samt Preistabelle vorgestellt.

**Tobias:** „Lass uns das erstmal so umsetzen und dann schauen wir, wie es wirkt.“

**Umgesetzt:** v0.6.0 (siehe Versionshistorie).

### 06.11.2026 – Chat 3, Teil 2: Antworten zum Techbaum

**Tobias' Antworten auf Claudes Rückfragen:**
1. Block-Stufe: Ja, die Vorgehensweise ist weiterhin wichtig und richtig.
2. Schmelzhütte für Eisen: guter Vorschlag, so nehmen.
3. „Holz-Werkbank“ war nur theoretisch, zur besseren Orientierung; Claude soll passende Namen für die Arbeitsschritte aussuchen. Später kann es auch Maschinen geben, die mehrere Rohstoffe verarbeiten. Winkel und Splitt fliegen raus und kommen evtl. später wieder.
4. Maschinen sollen 2 × 2 Plätze einnehmen, damit sie später 2 Eingänge für 2 verschiedene Rohstoffe haben können. Alles andere kleiner: Förderbänder 1 × 1, sonstige Gebäude wie das Zwischenlager 2 × 1, damit man sie besser positionieren kann.
5. Scharnier und Eisenfeder mit gleichen Zutaten: nicht aufgefallen, gerne ändern.
6. Kombinations-Maschinen (2 × 2, zwei Eingänge, ein Ausgang): ja, genau.
7. Preise: Es braucht eine sehr logische Tabelle, damit man beim Verkaufen in der Anfangsphase kein Minus macht. Ändern sich die Preise später, muss man schauen.
8. Freischalten nach Level: sehr gute Idee.
9. Erster Rohstoff jeder Sorte gratis beim Freischalten: sehr gute Idee.
10. Verkaufstheken und Kunden: gutes Prinzip.

**Wunsch:** Alles in die README schreiben; im neuen Chat liest Claude die README und startet genau mit diesen Punkten.

**Umgesetzt:** v0.5.2 (nur README): festgelegter Techbaum (4.2) mit Namen, Größen, Rezepten und Preistabelle, Plan für v0.6.0.

### 06.11.2026 – Chat 3: Test von v0.5.0 & Techbaum

**Feedback von Tobias:**
- Das Grundprinzip läuft gut.
- Versandportal: Auf dem kleinen Feld sind die vielen Eingänge schwierig; einer oder höchstens zwei reichen.
- Produktionsstätten wie das Sägewerk in 2 × 2 findet Tobias gut (im Spiel ist das Sägewerk 2 × 1, siehe offene Frage 4). Das Lagerhaus soll 2 × 1 werden, weil es sonst zu viel Platz wegnimmt: Bei einem 2 × 1-Rechteck soll es oben links hinein- und unten rechts herausgehen.
- 5 Blöcke für einen Winkel ist gut: So muss man mehr Holzfäller bauen, um mehr Blöcke pro Sekunde zu produzieren. „1 Holzblock = 1 Winkel“ war nur ein Beispiel; die neue Rechnung ist besser.
- Die Ware kommt über das Versandportal im Laden an, man sieht Wert und Lagerbestand. Der Laden darf später interaktiver werden; für den Anfang reicht die Übersicht.
- Laden-Idee: Man platziert die Waren, die man möchte, auf Verkaufstheken. Leute kommen zufällig vorbei und kaufen zufällig viel, z. B. 2 Zahnräder und 1 Splitt, der Nächste 3 Winkel. Die Theken werden von Hand bestückt, damit man selbst entscheidet, was verkauft wird.
- Kein Startgold: Der erste Holzstamm und der erste Felsblock sollen gratis sein, damit man direkt mit der Produktion starten kann. Die Idee, bei absoluter Pleite einen Holzstamm geschenkt zu bekommen, ist gut.
- Glatte Zahlen (×10) sind besser; 720 Gold für 40 Winkel passt vom Verhältnis.
- Fortschritt: Man fängt mit Holz an, Level 2 ist Stein, Level 3 könnte Eisen sein. Stein kostet genauso viel wie Holz und bringt ähnliche Erträge; Eisen kostet deutlich mehr, bringt aber auch mehr Gold. Mit jedem Rohstoff verdient man mehr, aber bestimmte Produkte verlieren ihren Wert nicht, weil sie später für weitere Prozesse gebraucht werden.
- **Techbaum:** Tobias hat einen ersten Techbaum als Tabelle geschickt (abgeschrieben in Abschnitt 4.1).

**Umgesetzt:** v0.5.1 (Lagerhaus 2 × 1, Versandportal mit einem Eingang). Der Techbaum wird erst nach den Rückfragen (Abschnitt 8) eingebaut.

### 05.11.2026 – Chat 2, Teil 3: Freigabe v0.5.0 & Feinschliff

**Tobias:**
- Das Produktionskonzept ist richtig verstanden, der Plan für v0.5.0 passt.
- Es braucht etwas Analoges zum Sägewerk für Steine, das aus Steinblöcken zwei Dinge herstellt (Platten und Splitt).
- Die Tür war nur ein Beispiel. Tobias entwickelt (heute Abend) einen eigenen Techbaum und schickt ihn, damit nicht bei jedem Schritt überlegt werden muss, wie es weitergeht.
- Stein läuft genau wie Holz: kaufen, aus einem Stein werden viele Steinblöcke usw.
- Ins Holzfällerlager passt nur ein Baumstamm.
- Das Spiel soll von der optimalen Produktionsstätte leben: Am Anfang braucht man viel aus Holz (Sägewerke lohnen sich), am Ende nur noch Einzelteile aus Holz und mehr anderes, dann lohnt es sich, die Holzproduktion zu verkleinern – so lebt das Spiel bis in hohe Level.
- Lagerhaus: z. B. 3 Fächer frei, aber nur ein Eingang und ein Ausgang, deshalb lagert man dort sinnvollerweise nur eine Sache, z. B. 3 × 50 Holzblöcke. Es dient als Zwischenlager und „Verteiler“.
- Mit festen Preisen anfangen, damit die Mechanik einfach bleibt; es muss sich aber lohnen: Holzstamm z. B. 50 Gold → 200 Holzblöcke verkauft knapp über 50 Gold → als 40 Winkel (oder 20 Winkel und 20 Stäbe) deutlich mehr, damit man die Produktion nach und nach erhöhen kann.

**Umgesetzt:** v0.5.0 (siehe Versionshistorie). Claude hat dabei das Verhältnis 5 : 1 aus dem Rechenbeispiel übernommen und die Goldbeträge ×10 gerechnet (offene Fragen 2 und 3).

### 05.11.2026 – Chat 2, Teil 2: Feedback zu v0.4.0 & neues Produktionskonzept

**Feedback von Tobias:** Alles getestet, es läuft sehr gut. Kleiner grafischer Fehler: Getrennte Förderbänder sehen an den Abzweigungen „unsauber“ aus (Screenshot mit blau markierter Spalte von Abzweigen).

**Neues Produktionskonzept von Tobias:**
- Holz und Steine muss man kaufen, z. B. beim Händler. Ein gekaufter Holzstamm wird auf den Holzfäller gelegt, der daraus z. B. in 15 Minuten 200 Holzblöcke herstellt.
- Die Holzblöcke werden im Sägewerk zu Winkeln oder Stäben weiterverarbeitet, z. B. 5 Sekunden pro Holzblock. Das Sägewerk stellt man so ein, dass es nur Winkel oder nur Stäbe herstellt.
- Beispiel: Einen Holzfäller auf 4 Strecken verteilen → 4× Holzblöcke. Davon je eine Strecke in die Produktion von Winkeln und von Stäben, zwei Strecken laufen weiter, weil ein späteres Rezept z. B. Holzblöcke und Splitt braucht.
- Es soll nur Lagerhäuser als Zwischenstation geben, z. B. „hier 200 Stäbe zwischenlagern“; die Waren können aber auch weiterlaufen. Nur in diesen Lagern kann man Ware lagern.
- Wie kommt die Ware von der Produktion in den Laden? Idee: ein „Versandportal“, das die Ware direkt in den Laden schickt. Im Laden gibt es ein Lager mit Verkaufstheken; je nach Level bzw. Größe einer Theke kann man dort z. B. 20 Winkel platzieren und verkaufen – zu einem „normalen“ Preis an NPCs.
- Zusätzlich die Ware am Schwarzmarkt anbieten, sodass der Online-Markt die Preise bestimmt – noch unsicher, ob und wie das Sinn ergibt. Weitere Idee: Alle Läden sind verbunden; wenn alle Winkel anbieten, sinkt der Preis für Winkel.
- Endet eine Strecke z. B. an einem Förderband, bleibt alles stehen und es wird nicht weiter produziert, weil das Band voll ist.

**Umgesetzt:** v0.4.1 (Abzweigungen), siehe Versionshistorie. Das neue Konzept steht in den Abschnitten 3, 4 und 6; die offenen Punkte in Abschnitt 8.

### 05.11.2026 – Chat 2: Feedback zu v0.3.0 & v0.4.0

**Feedback von Tobias:**
- v0.3.0 funktioniert und läuft auf dem Tablet.
- Speichern gerne schon jetzt einbauen.
- Alles soll sich drehen und verschieben lassen, aber auch löschen, damit man den Fokus auf eine neue Fabrik legen kann.
- Der Laden soll kein Gebäude sein, sondern die komplette Fläche, auf der gebaut werden kann. Unten gibt es einen Knopf „Laden“: Dort sieht man sein ganzes Inventar, also alles, was man in seinen „Lagern“ hergestellt hat, und kann es zum Verkauf anbieten.
- Außerdem einen Knopf „Bauen“ für Sägewerk, Förderbänder usw.
- Förderbänder: mehrere Strecken zusammenlegen können, ohne Verteiler; 1 Strecke durch einfaches Ziehen in 4 aufteilen.
- Die Pfeile für Ein- und Ausgänge sind gut.
- Freigabe für v0.4.0.

**Umgesetzt:** v0.4.0 (siehe Versionshistorie).

**Claudes Hinweise:**
- Ein Band-Feld kann in bis zu 3 Richtungen abzweigen (eine Seite ist der Zulauf). Für 4 Strecken zweigt man zweimal ab, z. B. erst in 2 und jede davon noch einmal.
- Wie die „Lager“ genau funktionieren, entscheidet sich mit v0.5.0 (offene Frage 2).

### 05.11.2026 – Chat 1, Teil 3: Feinschliff des Konzepts & v0.3.0

**Antworten von Tobias:**
- Online-Teil ganz am Ende; zuerst ein funktionierendes Spielsystem. Claudes Ideen dürfen ergänzt werden, Tobias liefert den groben Rahmen.
- Die Fabrik läuft, bis die Lager voll sind oder keine Rohstoffe mehr da sind, um die Produktion voranzutreiben.
- Preise sollen je nach Bedarf schwanken (eine Tür bringt mal mehr, mal weniger), damit das Wirtschaftsgefühl entsteht.
- Rezeptentwurf passt. Grundzutaten sind Holz und Stein, daraus kleinere Dinge wie Holzblöcke und Steinblöcke, daraus Winkel und Stäbe; für Stein analog.
- GitHub Pages ist auf `main` / `(root)` umgestellt.
- Frage 1 (Draufsicht): ja, am Anfang lieber alles einfacher.
- Frage 2 (Verkauf per Knopfdruck): ja, für den Anfang.
- Frage 3 (Bauzeiten): Nach einem Aufstieg kann man alles sofort bauen, wenn Gold und Rohstoffe reichen. Der Laden-Ausbau geht auch sofort, hängt aber an Produktionen, z. B. 200 Zahnräder, 200 Splitt und 500 Gold. So muss man ständig Neues produzieren und „wartet“ dadurch.
- Frage 4: mit Frage 3 beantwortet.
- Frage 5 (Forschung): später. Idee: Jeder Laden-Aufstieg gibt Punkte (z. B. 10 für Level 2), mit denen man neue Dinge freischaltet, etwa das Sägewerk.
- Frage 6 (Offline): läuft, bis Ware leer oder Lager voll.
- Frage 7 (Rezepte): sehr gut.
- Frage 8 (Geschäftsmodell): alles kostenlos; später Geld über Season Pass oder Skins; Pay2Win nicht im Fokus.
- Frage 9 (Arbeitstitel): noch keiner, kommt im Laufe der Entwicklung.

**Umgesetzt:** v0.3.0 (Spielfeld), siehe Versionshistorie. Claude hat die Antwort als Freigabe für den Plan von v0.3.0 gewertet.

**Hinweis:** Die Live-Seite (github.io) ist aus Claudes Arbeitsumgebung nicht erreichbar. Claude prüft deshalb vor dem Merge mit einem eigenen Browser-Test und danach den Veröffentlichungs-Status auf GitHub.

### 05.11.2026 – Chat 1, Teil 2: Antworten & Spielkonzept

**Vorbild:** Das Spiel war *Alchemy Factory*. Gefallen hat Tobias vor allem:
- Alles ist sehr klein, man baut seine eigene kleine Fabrik.
- Ein Rohstoff verzweigt sich: Holz wird zerkleinert, daraus entstehen zwei, drei andere Dinge, die wiederum durch weitere Geräte laufen. So lässt sich immer weiter skalieren.

**Recherche:** Claude hat sich Alchemy Factory im Netz angesehen. Das Grundprinzip bestätigt sich: mittelalterliche Automatisierung, Förderbänder verbinden alles, Werkstätten wie Sägen und Mühlen werden erforscht, insgesamt rund 150 Waren. Detailseiten (Fan-Wiki, Artikel) sind aus Claudes Umgebung gesperrt. Wir entwerfen ohnehin einen eigenen Rezeptbaum.

**Große Vision:** ein Mobile-Spiel im Stil von Clash of Clans: Clans beitreten, mit anderen Spielern handeln. Je mehr Spieler mitspielen, desto lebendiger und schwankender wird der Markt, ähnlich wie bei Hay Day. Hauptfaktor bleibt: eigene Fabrik bauen und Waren verkaufen oder weiterverarbeiten.

**Antworten auf die Rückfragen:**
- **2 Schwerpunkt:** das Bauen. Leitfragen: Wie ist die Wirtschaftslage? Was wird zu welchem Preis gebraucht? Was baue ich, um genug Geld zum Wachsen zu verdienen?
- **3 Ansicht:** im Stil von Clash of Clans (siehe offene Frage 1).
- **4 Setting:** Mittelalter, damit Werkzeuge und Waren einfach bleiben, z. B. mit zwei Grundbausteinen Holz und Stein.
- **5 Rohstoffe:** Start mit Hauptgebäude (Verkaufsladen), Holzfällerlager und Steinbruch. Dann z. B. ein Sägewerk für Bretter, aus Brettern erste Einzelteile wie Winkel und Zahnräder; für Stein analog. Jedes Erzeugnis lässt sich im Laden verkaufen. Mit Gold erweitert man den Laden und schaltet neue Produktionen und Rohstoffe frei. Manche Waren kann man kaufen oder selbst herstellen, z. B. eine Tür aus 4 Winkeln, 5 Brettern und 10 Steinnägeln, die über Förderbänder in die Schreinerei laufen.
- **6 Verkauf:** im Laden oder auf dem Schwarzmarkt, der von allen Spielern beeinflusst wird. Gold braucht man zum Leveln, Freischalten und um mehr Platz zu kaufen.
- **7 Forschung:** Idee: Forschungspunkte schalten Produktionen frei, Gold kauft Rohstoffe. Noch nicht sicher.
- **8 Zeit:** Echtzeit, Fokus auf der Produktion. Man muss immer wieder umbauen, je nachdem was der Markt braucht und was am meisten Geld bringt.
- **9 Ziel:** wie in Clash of Clans: Jedes Laden-Level schaltet Neues frei, höhere Level kosten mehr. Pleite gehen soll nicht möglich sein, weil man Holz und Stein immer zum Spottpreis verkaufen kann.
- **10 Spielrunde:** Fokus auf der optimalen Fabrik. Immer mehr Platz kaufen, um größer und mächtiger zu werden. Täglich reinschauen: Rohstoffe abholen, Sachen bauen, prüfen, was sich umzubauen lohnt.
- **11 Technik:** mit Web starten, später erweitern.
- **12 Bildschirm:** Handy und Tablet, nur Querformat wie Clash of Clans.
- **13 Sprache:** erstmal nur Deutsch.
- **14 Versionen:** Schema passt. Nur ein einziger spielbarer Link; Neues wird direkt dort getestet, bei Problemen geht es zurück zur alten Version.
- **15 Schrittgröße:** lieber klein; viele Kleinigkeiten dürfen in einen größeren Schritt.

**Claudes Einordnung:** Fabrikspiel, Wirtschaft und Clan-Universum passen zusammen, sind aber drei große Blöcke. Der Online-Teil braucht einen Server (Kosten, Datenschutz, Schummelschutz, Moderation). Reihenfolge deshalb: zuerst eine Fabrik, die allein Spaß macht, mit Computer-Händlern und schwankender Nachfrage. Danach den Online-Markt und die Clans andocken. Computer-Händler braucht es auch im Online-Spiel, damit der Markt bei wenigen Spielern nicht leer ist.

### 05.11.2026 – Chat 1: Kickoff

**Idee:** Tobias hat ein Spiel über einen Alchemisten-Laden gesehen. Gefallen hat vor allem:
- Viele Grundstoffe herstellen, um daraus viele andere Dinge zu bauen.
- Der Wirtschaftsaspekt: Man muss wirtschaften, um Neues freizuschalten und Materialien zu kaufen.

Wir bauen ein eigenes Spiel mit ähnlichem Prinzip, keinen Nachbau.

**Regeln:** siehe Abschnitt 1.

**GitHub-Check:**
- Repo `tobiasimhof/ErstesSpiel` ist erreichbar und öffentlich, Claude hat Schreibrechte.
- Weil das Repo öffentlich ist, kann das Spiel kostenlos über GitHub Pages live gehen.
- Branch pushen, Pull Request erstellen und mergen funktioniert.
- Versions-Tags kann Claude nicht pushen. Deshalb steht die Versionsnummer im Titel jedes Merges (siehe Entscheidungen).

**Frage zu Assets:** Gibt es über GitHub eine Asset-Datenbank?
- GitHub selbst hat keine Asset-Datenbank, aber Assets können direkt im Repo liegen.
- Gute kostenlose Quellen:
  - **Kenney.nl**: tausende Grafiken, UI-Elemente und Sounds, Lizenz CC0 (keine Namensnennung nötig).
  - **game-icons.net**: über 4000 Icons (Tränke, Kräuter, Kristalle, Kolben …), Lizenz CC BY 3.0 (Namensnennung nötig). Claude kann sie auch über npm laden (`@iconify-json/game-icons`).
  - **OpenGameArt.org** und **itch.io**: viele freie Pakete, Lizenz je Paket prüfen.
  - **Emojis** als Platzhalter: sofort verfügbar, kein Aufwand.
- Hinweis: Kenney.nl, game-icons.net, OpenGameArt.org und itch.io sind aus Claudes Arbeitsumgebung aktuell gesperrt. Entweder Tobias schaltet die Domains in den Umgebungseinstellungen frei, oder Tobias lädt ein Paket herunter und gibt es Claude.
- Vorschlag: im Prototyp Emojis und einfache Formen. Sobald die Optik wichtig wird, einen einheitlichen Stil wählen und alle Lizenzen in einer `CREDITS.md` festhalten.
