# Hinweise für Claude

- Lies zu Beginn jedes Chats die komplette `README.md`. Sie ist das Gedächtnis des Projekts.
- Kommuniziere auf Deutsch.
- Halte dich an die Zusammenarbeitsregeln (README, Abschnitt 1) und an den Arbeitsablauf (README, Abschnitt 2).
- Tobias programmiert nicht selbst. Erkläre Ergebnisse verständlich, ohne Programmierkenntnisse vorauszusetzen.
- Vor jedem Code: Plan besprechen und Zustimmung abwarten.
- Jeder Arbeitsschritt bekommt eine neue Versionsnummer. Dazu:
  - README aktualisieren (Status-Tabelle, Versionshistorie, Gesprächsprotokoll, Entscheidungen, offene Fragen).
  - Pull Request nach `main` erstellen und direkt mergen.
  - Versionsnummer in den Titel von Pull Request und Merge-Commit schreiben, z. B. `v0.2.0: …` (Tags lassen sich aus der Arbeitsumgebung nicht pushen).
- Hauptgerät ist ein Galaxy Tab S9: Alles muss per Touch im Browser funktionieren. Das Spiel läuft nur im Querformat, auf Tablet und Handy.
- Vor jedem Merge mit Spielcode: automatische Tests der Spielregeln und ein Durchlauf im Browser (Playwright) in Tablet- und Handygröße im Querformat:
  - `npm test`
  - `SCREENSHOT_DIR=<Scratchpad>/shots npm run test:browser`, danach die Screenshots ansehen.
- Neue Version: `src/version.js`, die `?v=` Angaben in `index.html` und die Status-Tabelle der README anpassen (ein Test prüft das).
- Die Live-Seite (github.io) ist aus der Arbeitsumgebung nicht erreichbar; nach dem Merge den Pages-Status über GitHub Actions („pages build and deployment“) prüfen.
- Spielregeln (Simulation) strikt getrennt von der Darstellung halten; Waren, Rezepte, Gebäude und Preise als Datentabellen.
- Andere Spiele (Alchemy Factory, Clash of Clans, Hay Day) dienen nur als Vorbild für Mechaniken: eigene Namen, eigene Rezepte, eigene Grafik.
