VERDICT: CHANGES_REQUESTED

## Sicherheitsbericht – Habit-Tracker (statische Web-App)

Geprüft wurde der vollständig zusammengeführte Produktstand (HTML, CSS, Vanilla-JavaScript, LocalStorage, Canvas). Es wurden keine externen Bibliotheken oder Build-Abhängigkeiten verwendet; ein Scanner-Output lag für diesen Projekttyp nicht vor. Die Prüfung erfolgte anhand des sichtbaren Quellcodes.

### Prüfbereiche im Überblick

| Bereich | Ergebnis |
|---|---|
| Secrets | Keine hartkodierten Schlüssel, Tokens, Passwörter oder geheimen URLs gefunden. |
| Injection & Inputs | Keine XSS-/Injection-Lücken erkennbar. Nutzereingaben und Importdaten werden durchgängig mit `textContent` bzw. `createElement`/`setAttribute` gerendert. Kein `innerHTML`/`outerHTML` mit Nutzdaten. Import validiert Struktur und Datentypen sorgfältig. |
| AuthN/AuthZ | Nicht zutreffend – rein lokale Ein-Nutzer-Anwendung ohne Authentifizierung. |
| Dependencies | Keine Pakete, keine externen Ressourcen, keine Angriffsfläche durch veraltete Bibliotheken. |
| Konfiguration & Transport | Keine Netzwerkzugriffe, keine externen Skripte/Styles/Fonts. Daten bleiben in LocalStorage. Kein Transportverschlüsselungsbedarf. |

### Befunde

#### 1. Fehlende Content Security Policy (CSP) – niedrig
**Datei/Stelle:** `index.html` (kein CSP-Meta-Tag)  
**Beschreibung:** Es ist keine Content Security Policy definiert. Zwar werden Nutzdaten ausschließlich über sichere DOM-Methoden gerendert, eine CSP würde als Tiefenverteidigung zusätzlich vor Inline-Injection schützen. Das aktuell vorhandene Inline-Script im `<head>` (Theme-Vorab-Setzung) würde bei einer strikten CSP blockiert werden.  
**Konkreter Fix:** Das Theme-Inline-Script in eine externe Datei (z. B. `js/theme-init.js`) auslagern und im `<head>` synchron laden. Anschließend im `<head>` folgende CSP setzen:  
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'">
```
Dabei bleibt die App voll funktionsfähig: `style-src 'unsafe-inline'` erlaubt die dynamisch erzeugten `<style>`-Elemente (`js/grid.js`), `img-src 'self' data:` deckt ggf. vorhandene lokale Ressourcen ab.

#### 2. Unzureichende Validierung des LocalStorage-State – niedrig
**Datei/Stelle:** `js/store.js`, Funktion `isValidState()` / `loadState()`  
**Beschreibung:** Beim Laden aus LocalStorage prüft `isValidState` lediglich, dass `version` eine Zahl, `habits` ein Array und `theme` `'light'`/`'dark'` ist. Die einzelnen Habit-Einträge werden nicht validiert. Ein manipulierte oder korrupte LocalStorage-Eintrag (z. B. `habits: [null]` oder fehlende Felder) kann beim Rendern zu Laufzeitfehlern und einem Absturz der Oberfläche führen. Ein XSS-Risiko besteht nicht, da Nutzdaten weiterhin mit `textContent` gerendert werden.  
**Konkreter Fix:** Die für den Import verwendete tiefe Validierung (`validateImport` aus `js/transfer.js`) in ein gemeinsames Modul auslagern und in `loadState` wiederverwenden. Abweichende oder unvollständige Datensätze verwerfen und `defaultState()` zurückgeben, sodass die App stabil bleibt.

#### 3. Fehlende Größen-/Mengenbegrenzung beim JSON-Import – niedrig
**Datei/Stelle:** `js/transfer.js`, Funktion `importState()`  
**Beschreibung:** Beim Import wird die ausgewählte Datei ohne Limitierung von Dateigröße, Anzahl der Gewohnheiten oder Anzahl der Checkmarks gelesen und mit `JSON.parse` verarbeitet. Eine extrem große Datei kann den Browser kurzzeitig blockieren oder viel Speicher belegen. Dies ist ein lokaler DoS-Vektor ohne Fernausnutzung.  
**Konkreter Fix:** Vor dem Lesen die Dateigröße prüfen, z. B. `if (file.size > 5 * 1024 * 1024) { showMessage(…); return; }`. Zusätzlich nach dem Parsen die Anzahl der Habits (z. B. max. 1000) und der Checkmarks pro Habit begrenzen, bevor `store.update` ausgeführt wird.

#### 4. Import akzeptiert beliebige `version`-Zahl – niedrig (Robustheit)
**Datei/Stelle:** `js/transfer.js`, Funktion `validateImport()`  
**Beschreibung:** Im Import wird `data.version` nur auf den Typ `number` geprüft, nicht auf den erwarteten Wert `1`. Dadurch kann ein JSON-Import eine beliebige Versionsnummer setzen (z. B. `999`), was zukünftige Migrationen erschwert oder zu inkonsistentem Verhalten führen kann. Kein direktes Sicherheitsrisiko.  
**Konkreter Fix:** In `validateImport` zusätzlich `data.version === 1` fordern. In `store.js` entsprechend konsistent halten.

### Bewertung

Es wurden keine kritischen oder hohen Sicherheitslücken festgestellt. Die gefundenen Punkte sind niedrigschwellige Härtungs- und Robustheitsempfehlungen. Die zentralen Sicherheitsanforderungen (kein `innerHTML` mit Nutzdaten, strenge Import-Validierung, keine externen Ressourcen, lokale Speicherung ohne Netzwerkzugriff) sind im sichtbaren Code erfüllt. Aufgrund der empfohlenen Härtungen wird dennoch eine Überarbeitung angefordert.