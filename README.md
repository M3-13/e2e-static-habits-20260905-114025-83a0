# Gewohnheiten – Habit-Tracker

Ein rein statischer Habit-Tracker, der vollständig im Browser läuft. Gewohnheiten lassen sich anlegen, umbenennen, löschen, archivieren und wiederherstellen; pro Gewohnheit gibt es ein 30-Tage-Raster mit setz- und entfernbaren Häkchen, aktuelle und längste Serie, die wöchentliche Erfüllungsquote, ein Balkendiagramm der letzten acht Wochen, Dark-Mode mit Persistenz sowie JSON-Export/-Import. Alle Daten liegen ausschließlich im LocalStorage des Browsers — es findet keinerlei Netzwerkzugriff statt und es werden keine externen Ressourcen geladen.

## Tech-Stack

- **Sprache**: JavaScript (Vanilla, ES-Module)
- **Markup**: HTML
- **Styling**: CSS (CSS-Variablen für Light-/Dark-Theme)
- **Speicher**: LocalStorage (Schlüssel `habitTracker.v1`)
- **Diagramm**: Canvas API
- **Build**: keiner — reine statische Dateien

## Installation

Keine Abhängigkeiten, kein Build-Schritt. Einfach das Repository klonen:

```bash
git clone <repo-url>
cd <projektverzeichnis>
```

## Starten (Entwicklung)

Da ES-Module und `fetch` unter `file://` nicht funktionieren, muss die App über einen lokalen HTTP-Server ausgeliefert werden. Im Projektverzeichnis:

```bash
python -m http.server 8000
```

Dann im Browser öffnen: <http://localhost:8000>

Alternativ funktioniert auch die VS Code Live-Server-Erweiterung.

## Tests

Die Tests verwenden `node:test` (kein Framework nötig):

```bash
node --test tests/
```

## Bedienung

- **Neue Gewohnheit anlegen**: Namen ins Eingabefeld oben tippen und auf **Hinzufügen** klicken (oder Enter drücken).
- **Häkchen setzen/entfernen**: Im 30-Tage-Raster einer Gewohnheit einen Tag anklicken.
- **Umbenennen / Löschen / Archivieren**: über die Buttons an jeder Gewohnheit.
- **Filter**: Mit dem Umschalter zwischen *Aktiv* und *Archiviert* wechseln.
- **Dunkelmodus**: Über den Schalter oben rechts; die Auswahl bleibt nach einem Neuladen erhalten.
- **Export/Import**: Daten als JSON-Datei herunterladen bzw. eine zuvor exportierte Datei wieder einlesen.

## Datenschutz

Alle Daten bleiben ausschließlich lokal im Browser des Nutzers gespeichert (LocalStorage). Es gibt keine Tracking-, Analyse- oder Schriftdienste und keinerlei Netzwerkzugriffe. Daten können jederzeit gelöscht werden, indem Gewohnheiten einzeln entfernt oder der Browserspeicher geleert wird.

## Features

- Gewohnheiten anlegen, umbenennen, löschen, archivieren und wiederherstellen
- 30-Tage-Raster mit setz- und entfernbarer Häkchen je Gewohnheit
- Aktuelle und längste Serie sowie wöchentliche Erfüllungsquote
- Balkendiagramm der letzten acht Wochen (Canvas)
- Dark-Mode mit Persistenz
- Vollständige LocalStorage-Speicherung (überlebt Neuladen)
- JSON-Export und validierter Import
- Aufgeräumter Leerzustand mit Handlungsaufforderung und Datenschutzhinweis
