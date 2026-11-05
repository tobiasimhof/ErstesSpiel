# ErstesSpiel

Erstes Spiel gecodet zusammen mit Claude.

Ein **Factory-Game mit Wirtschaftssimulation** im Alchemie-Setting (Arbeitstitel). Man stellt Grundstoffe her, baut daraus immer komplexere Produkte, verkauft sie und schaltet mit dem Gewinn neue Rezepte, Maschinen und Materialien frei.

| | |
|---|---|
| **Aktuelle Version** | v0.1.0 – Projektstart |
| **Phase** | Planung (noch kein Spielcode) |
| **Spielen (live)** | noch nicht verfügbar |
| **Nächster Schritt** | Offene Fragen (Abschnitt 5) beantworten, Bausteine und Technik festlegen |

---

## Inhalt

1. [Zusammenarbeitsregeln](#1-zusammenarbeitsregeln)
2. [Arbeitsablauf pro Version](#2-arbeitsablauf-pro-version)
3. [Bausteine des Spiels (Entwurf)](#3-bausteine-des-spiels-entwurf)
4. [Entscheidungen](#4-entscheidungen)
5. [Offene Fragen](#5-offene-fragen)
6. [Versionshistorie](#6-versionshistorie)
7. [Gesprächsprotokoll](#7-gesprächsprotokoll)

---

## 1. Zusammenarbeitsregeln

Festgelegt am 05.11.2026.

1. **Jeder Arbeitsschritt ist eine eigene Version.** So halten wir Fehler klein und können bei einem großen Bug auf eine ältere Version zurückgehen.
2. **Wir mergen immer direkt und gehen live.** Claude programmiert, Tobias schaut sich das Ergebnis an und gibt Anweisungen. Tobias schreibt keine einzige Zeile Code.
3. **Hauptgerät ist das Galaxy Tab S9** (mobil). Der PC kommt gelegentlich dazu, später eventuell mit Godot oder einer anderen Software.
4. **Diese README ist das Gedächtnis des Projekts.** Zu Beginn jedes neuen Chats liest Claude diese Datei und weiß damit, woran wir arbeiten.
5. **Zu jeder Version steht hier, was wir uns vorgenommen haben, welche Fragen wir uns gestellt haben und was wir geändert haben.**
6. **Erst planen, dann programmieren.** Bevor Code geschrieben wird, gehen wir das Vorhaben theoretisch durch.

---

## 2. Arbeitsablauf pro Version

1. **Planen:** Ziel, Fragen und Entwurf besprechen (Regel 6).
2. **Umsetzen:** Claude programmiert auf einem Arbeitsbranch.
3. **Dokumentieren:** Claude aktualisiert diese README (Status-Tabelle, Versionshistorie, Gesprächsprotokoll, Entscheidungen, offene Fragen).
4. **Mergen:** Pull Request nach `main`, direkt gemergt.
5. **Live:** Das Spiel wird automatisch veröffentlicht (geplant: GitHub Pages, sobald es Spielcode gibt).
6. **Markieren:** Die Version bekommt einen Git-Tag, z. B. `v0.2.0`.
7. **Testen:** Tobias spielt auf dem Tablet und gibt Feedback. Daraus entsteht der nächste Schritt.

**Versionsnummern:** `vA.B.C`

- Solange `A = 0` ist, sind wir in der Entwicklung.
- `B` steigt bei jedem neuen Arbeitsschritt (z. B. `v0.2.0` → `v0.3.0`).
- `C` steigt bei einer reinen Fehlerkorrektur (z. B. `v0.3.0` → `v0.3.1`).
- `v1.0.0` = erste vollständige, rund spielbare Version.

**Zurückgehen:** Jede Version ist ein eigener Merge auf `main` mit eigenem Tag. Bei einem großen Fehler kann Claude gezielt eine Version rückgängig machen oder den Stand einer älteren Version wiederherstellen.

---

## 3. Bausteine des Spiels (Entwurf)

Das Projekt zerlegt in Einzelteile. Noch nichts davon ist entschieden.

| # | Baustein | Worum es geht |
|---|---|---|
| 1 | Kern-Spielschleife | Einkaufen → herstellen → verkaufen → investieren. Diese Schleife muss schon allein Spaß machen. |
| 2 | Gegenstände & Rezepte | Alle Stoffe (Grundstoffe, Zwischenprodukte, Endprodukte) und wie sie zusammenhängen (Rezeptbaum). Als Datentabelle, damit wir leicht Neues ergänzen können. |
| 3 | Produktion | Maschinen bzw. Stationen (z. B. Mörser, Destille, Kessel) mit Produktionszeit, Eingängen und Ausgängen. |
| 4 | Fabrik & Logistik | Wo stehen die Maschinen, wie kommen Stoffe von A nach B (Lager, Förderbänder), wie viel läuft automatisch. |
| 5 | Wirtschaft | Geld, Einkauf, Verkauf, Preise, Kunden und Aufträge, laufende Kosten. |
| 6 | Fortschritt | Freischaltungen, Forschung bzw. Technologiebaum, Ruf, Ziele. |
| 7 | Zeit & Simulation | Spieltakt, Tage, Geschwindigkeit, Pause, eventuell Fortschritt während das Spiel geschlossen ist. |
| 8 | Bedienung (UI) | Für Touch auf dem Tablet gebaut: Inventar, Rezeptbuch, Laden, Bauen. |
| 9 | Speichern & Laden | Spielstand im Browser speichern, Export/Import als Sicherung. |
| 10 | Grafik & Sound | Zuerst Platzhalter (Emojis, einfache Formen), später ein einheitlicher Asset-Stil. |
| 11 | Balancing | Preise, Zeiten und Mengen so abstimmen, dass es sich gut anfühlt. |
| 12 | Technik & Infrastruktur | Engine, Hosting, Versionierung, automatische Tests. |
| 13 | Später / optional | Story, Ereignisse, Erfolge, Einstellungen. |

**Meilensteine (Vorschlag):**

- **M0 – Setup** (jetzt): Regeln, README, Planung.
- **M1 – Text-Prototyp:** Kern-Schleife nur mit Buttons und Zahlen (wenige Grundstoffe, 2–3 Rezepte, verkaufen). Live auf dem Tablet spielbar.
- **M2 – Produktion:** Maschinen stellen selbstständig her, die Zeit läuft.
- **M3 – Wirtschaft & Fortschritt:** Freischaltungen, Kunden/Aufträge, Preise.
- **M4 – Fabrikfläche:** Maschinen auf einem Raster platzieren, Transport zwischen ihnen.
- **M5 – Optik:** Assets, Animationen, Sound.
- **M6 – Balancing & Feinschliff.**

---

## 4. Entscheidungen

| Datum | Entscheidung | Begründung |
|---|---|---|
| 05.11.2026 | Zusammenarbeitsregeln 1–6 (Abschnitt 1) | Von Tobias festgelegt. |
| 05.11.2026 | Zusätzlich gibt es eine `CLAUDE.md` | Claude lädt diese Datei in jedem neuen Chat automatisch. Sie verweist auf die README, damit Regel 4 zuverlässig greift. |
| 05.11.2026 | Jede Version bekommt einen Git-Tag | Macht das Zurückgehen auf eine alte Version einfach (Regel 1). |
| 05.11.2026 | Zuerst Logik und Spielprinzip, Grafik später | Von Tobias gewünscht. Für den Anfang reichen Platzhalter. |

---

## 5. Offene Fragen

Stand 05.11.2026. Die ausführliche Fassung steht im Chat vom 05.11.2026.

**Spielidee**
1. Welches Spiel war das Vorbild, und was genau hat daran gefallen?
2. Schwerpunkt: Fabrik bauen (Maschinen platzieren, verbinden) oder Management über Menüs oder beides nacheinander?
3. Ansicht: Draufsicht auf ein Raster, Seitenansicht oder rein über Menüs?
4. Setting und Stimmung: klassische Fantasy-Alchemie? Gemütlich oder herausfordernd? Arbeitstitel?

**Spielmechanik**
5. Rohstoffe: nur kaufen oder auch selbst gewinnen (Garten, Mine, Brunnen)?
6. Verkauf: fester Händler, Kunden im Laden, Aufträge, schwankende Preise?
7. Freischalten: nur mit Geld oder auch mit Forschung, Ruf, Level?
8. Zeit: Echtzeit, Tage mit Abrechnung, Weiterlaufen bei geschlossenem Spiel?
9. Ziel und Schwierigkeit: Gibt es ein Ende? Kann man pleitegehen?
10. Wie lang ist eine typische Spielrunde?

**Technik**
11. Web (HTML/JavaScript) oder Godot von Anfang an?
12. Querformat auf dem Tablet? Auch Handy?
13. Spielsprache: Deutsch, Englisch oder beides?

**Arbeitsweise**
14. Ist das Versionsschema in Ordnung? Sollen ältere Versionen unter eigenem Link spielbar bleiben?
15. Lieber kleine Schritte (jede Sitzung etwas Sichtbares) oder größere?

---

## 6. Versionshistorie

### v0.1.0 – Projektstart (05.11.2026)

**Vorgenommen:**
- Grundregeln der Zusammenarbeit festhalten.
- Prüfen, ob GitHub funktioniert.
- Projekt in Bausteine zerlegen und Rückfragen sammeln.
- Klären, woher wir Assets bekommen.

**Fragen, die wir uns gestellt haben:**
- Wie stellen wir sicher, dass jeder neue Chat weiß, woran wir arbeiten?
- Wie können wir bei Fehlern auf alte Versionen zurückgehen?
- Woher kommen Grafiken, damit das Spiel später anschaulich wird?

**Gemacht:**
- README zum Projektgedächtnis ausgebaut (Regeln, Ablauf, Bausteine, Entscheidungen, offene Fragen, Historie, Protokoll).
- `CLAUDE.md` angelegt, die Claude in jedem neuen Chat automatisch auf die README verweist.
- Ablauf Branch → Pull Request → Merge → Tag einmal komplett durchgespielt.
- Noch kein Spielcode (Regel 6).

---

## 7. Gesprächsprotokoll

### 05.11.2026 – Chat 1: Kickoff

**Idee:** Tobias hat ein Spiel über einen Alchemisten-Laden gesehen. Gefallen hat vor allem:
- Viele Grundstoffe herstellen, um daraus viele andere Dinge zu bauen.
- Der Wirtschaftsaspekt: Man muss wirtschaften, um Neues freizuschalten und Materialien zu kaufen.

Wir bauen ein eigenes Spiel mit ähnlichem Prinzip, keinen Nachbau.

**Regeln:** siehe Abschnitt 1.

**GitHub-Check:**
- Repo `tobiasimhof/ErstesSpiel` ist erreichbar und öffentlich, Claude hat Schreibrechte.
- Weil das Repo öffentlich ist, kann das Spiel kostenlos über GitHub Pages live gehen.

**Frage zu Assets:** Gibt es über GitHub eine Asset-Datenbank?
- GitHub selbst hat keine Asset-Datenbank, aber Assets können direkt im Repo liegen.
- Gute kostenlose Quellen:
  - **Kenney.nl**: tausende Grafiken, UI-Elemente und Sounds, Lizenz CC0 (keine Namensnennung nötig).
  - **game-icons.net**: über 4000 Icons (Tränke, Kräuter, Kristalle, Kolben …), Lizenz CC BY 3.0 (Namensnennung nötig). Claude kann sie auch über npm laden (`@iconify-json/game-icons`).
  - **OpenGameArt.org** und **itch.io**: viele freie Pakete, Lizenz je Paket prüfen.
  - **Emojis** als Platzhalter: sofort verfügbar, kein Aufwand.
- Hinweis: Kenney.nl, game-icons.net, OpenGameArt.org und itch.io sind aus Claudes Arbeitsumgebung aktuell gesperrt. Entweder Tobias schaltet die Domains in den Umgebungseinstellungen frei, oder Tobias lädt ein Paket herunter und gibt es Claude.
- Vorschlag: im Prototyp Emojis und einfache Formen. Sobald die Optik wichtig wird, einen einheitlichen Stil wählen und alle Lizenzen in einer `CREDITS.md` festhalten.
