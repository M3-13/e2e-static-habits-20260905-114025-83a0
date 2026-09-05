VERDICT: CHANGES_REQUESTED

## 1. DSGVO / ePrivacy

### 1.1 Fehlende Datenschutzerklärung und Transparenzinformationen
**Schweregrad:** high  
**Befund:** Die Anwendung verarbeitet personenbezogene Daten (insbesondere Gewohnheitsnamen, die sensible Lebensbereiche wie Gesundheit, Religion oder Suchtverhalten erkennen lassen können) ausschließlich lokal im Browser. Zwar findet keine Übermittlung an den Anbieter statt, aber bereits das Hosting einer öffentlichen Web-UI erzeugt beim Abruf serverseitig typischerweise Logdaten (IP-Adresse, Zeitstempel, User-Agent). Für diese Verarbeitungen fehlt eine Datenschutzerklärung; im sichtbaren Code (`index.html`) existieren weder ein Link noch eine eigene Datenschutzseite. Art. 12, 13 DSGVO verlangen transparente Informationen. Der vorhandene Hinweis im Leerzustand und im Footer reicht dafür nicht aus.  
**Abhilfe:** Neue statische Datei `datenschutz.html` erstellen und im Footer von `index.html` verlinken. Inhalt mindestens:
- Verantwortlicher mit Kontaktdaten
- Beschreibung der rein lokalen Speicherung im Browser (Schlüssel `habitTracker.v1`)
- Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO (Erbringung der Funktion) bzw. lit. f für Server-Logs
- Speicherdauer: lokale Daten bis zur Löschung durch Nutzer; Server-Logs gemäß Hosting-Richtlinie
- Hinweis auf Betroffenenrechte (Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch)
- Beschwerderecht bei einer Aufsichtsbehörde
- Kein Tracking, keine Analysedienste, keine externen Ressourcen

### 1.2 Fehlendes Impressum (Legal Notice)
**Schweregrad:** high  
**Befund:** Für eine öffentliche Web-UI mit Sitz bzw. Angebot in Deutschland/EU besteht nach § 5 DDG (früher TMG) bzw. entsprechenden nationalen Vorschriften eine Impressumspflicht, sofern das Angebot geschäftsmäßig ist. Ein Impressum oder ein Link darauf ist in `index.html` nicht vorhanden.  
**Abhilfe:** Neue statische Datei `impressum.html` erstellen und im Footer von `index.html` verlinken. Inhalt: Name/Anschrift des Diensteanbieters, Kontakt (z. B. E-Mail), ggf. Vertretungsberechtigter, Handelsregister-/USt-Id (falls vorhanden). Ergänzung im Footer:
```html
<nav class="footer-legal" aria-label="Rechtliches">
  <a href="impressum.html">Impressum</a>
  <a href="datenschutz.html">Datenschutz</a>
</nav>
```

### 1.3 Positiv festgestellt
- Keine Netzwerkaufrufe, keine externen Ressourcen, kein Tracking (AC-15 erfüllt).
- Nutzereingaben und importierte Daten werden ausschließlich als Text (`textContent`, `createTextNode`) gerendert; kein `innerHTML` mit Nutzerdaten (AC-13, AC-16 erfüllt).
- Der JSON-Import validiert Struktur, Datentypen, ISO-Datums-Schlüssel und Werte strikt; bei Fehlern bleibt der vorhandene Datenbestand unverändert (AC-14 erfüllt).
- Der sichtbare Erststart-Hinweis im Leerzustand beschreibt lokale Speicherung und Löschmöglichkeit (AC-17 erfüllt).
- Keine einwilligungspflichtigen Cookies; die Speicherung von `theme` in `localStorage` ist technisch notwendig und benötigt keinen Consent-Banner, muss aber in der Datenschutzerklärung erwähnt werden.

## 2. EU Cyber Resilience Act (CRA)

### 2.1 Fehlende Content Security Policy (CSP)
**Schweregrad:** medium  
**Befund:** `index.html` enthält keine Content Security Policy (weder per HTTP-Header sichtbar noch per `<meta>`-Tag). Eine CSP ist ein zentraler Baustein für Security-by-Default gemäß CRA. Das im `<head>` vorhandene Inline-Script zur Theme-Erkennung darf dabei nicht blockiert werden, sonst bricht die eigene Dark-Mode-Funktion (FOUC-Vermeidung).  
**Abhilfe:** In `index.html` im `<head>` folgenden Meta-Tag ergänzen, wobei der `sha256-...`-Hash exakt über das Inline-Theme-Script gebildet wird:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'sha256-<HASH>'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'" />
```
Der Hash lässt sich z. B. mit `echo -n "<script>...</script>" | openssl dgst -sha256 -binary | openssl base64 -A` erzeugen. Alternativ kann das Inline-Script in eine externe Datei ausgelagert werden, muss dann aber vor dem Rendern synchron geladen werden, um das Aufblitzen des falschen Themes zu vermeiden.

### 2.2 Fehlende sichtbare Sicherheitsdokumentation / SBOM / Update-Verfahren
**Schweregrad:** medium  
**Befund:** Im sichtbaren Code ist keine CRA-konforme Dokumentation erkennbar: kein SBOM (auch wenn keine Drittanbieter-Abhängigkeiten existieren), kein dokumentiertes Schwachstellen- und Patch-Management, kein Update-/Deployment-Verfahren. Die Datei `README.md` ist vorhanden, ihr Inhalt war jedoch nicht Bestandteil der Prüfung; daher kann die Konformität nicht bestätigt werden.  
**Abhilfe:** In `README.md` ergänzen:
- Abschnitt „Security / CRA“ mit SBOM (leere Dependency-Liste)
- Beschreibung des Update-/Patch-Prozesses für die statischen Dateien
- Kontaktadresse für Schwachstellenmeldungen
- Unterstützungszeitraum und Vorgehen bei Sicherheitslücken

### 2.3 Positiv festgestellt
- Keine externen Bibliotheken oder Build-Abhängigkeiten (geringe Angriffsfläche).
- Strikte Import-Validierung verhindert die Übernahme manipulierter JSON-Strukturen.
- XSS-Schutz durch konsequente Nutzung von `textContent` / `createTextNode`.
- Keine PII in Logs oder im Klartext, da die App keine Logs schreibt und alle Daten lokal im Browser verbleiben.

## 3. EU AI Act

Nicht anwendbar. Es sind keine KI-Funktionen, automatisierten Entscheidungen oder Modelle enthalten; der Habit-Tracker besteht ausschließlich aus deterministischer Logik und lokaler Datenhaltung. Keine Kennzeichnungs- oder Transparenzpflichten nach AI Act.

## 4. Pflichttexte & UI

### 4.1 Fehlende Pflichtseiten und Verlinkung
**Schweregrad:** high  
**Befund:** Weder Impressum, Datenschutzerklärung noch Nutzungsbedingungen sind im Code sichtbar oder verlinkt. Für eine öffentliche Web-UI sind Impressum und Datenschutzerklärung verpflichtend; Nutzungsbedingungen sind empfehlenswert, wenn die Anwendung als Dienst bereitgestellt wird.  
**Abhilfe:** Wie in Abschnitt 1.1 und 1.2 beschrieben. Footer um Links zu `impressum.html` und `datenschutz.html` ergänzen. Optional `terms.html` erstellen, wenn vertragliche Nutzungsregeln gewünscht sind.

### 4.2 Cookie-/Consent-Banner
**Schweregrad:** low (kein Verstoß)  
**Befund:** Es werden keine Cookies gesetzt und keine einwilligungspflichtigen Speicherungen vorgenommen. `localStorage` für Theme und Nutzerdaten ist technisch notwendig bzw. vom Nutzer aktiv veranlasst. Ein Consent-Banner ist daher nicht erforderlich. Die Speicherung sollte jedoch in der Datenschutzerklärung dokumentiert werden (siehe 1.1).

### 4.3 Widerrufsbelehrung / Verkauf
Nicht anwendbar, da keine Verkaufsfunktion oder kostenpflichtigen Leistungen enthalten sind.

## 5. Barrierefreiheit (WCAG / BITV / EAA)

### 5.1 Canvas-Diagramm ohne zugängliche Textalternative
**Schweregrad:** medium  
**Befund:** Das `<canvas id="chart">` in `index.html` besitzt weder `role="img"` noch `aria-label` oder eine textuelle Alternative. Die visuell dargestellten Wochenraten sind für Screenreader-Nutzer nicht wahrnehmbar. Das verletzt WCAG 1.1.1 (Nicht-Text-Inhalte) und die ab 2025 geltenden EAA-Anforderungen.  
**Abhilfe:** In `index.html` das Canvas ergänzen:
```html
<canvas id="chart" class="chart" role="img" aria-label="Balkendiagramm: wöchentliche Erfüllungsquote der letzten acht Wochen"></canvas>
<p id="chart-summary" class="visually-hidden"></p>
```
In `js/chart.js` in `draw()` nach dem Zeichnen die Raten textuell aktualisieren, z. B.:
```js
const summary = document.getElementById('chart-summary');
if (summary) {
  summary.textContent = weeks.map((w, i) => `${weekLabel(w.start)}: ${Math.round(rates[i] * 100)}%`).join('; ');
}
```
Zusätzlich eine CSS-Klasse `.visually-hidden` ergänzen, die den Text optisch verbirgt, aber für Screenreader verfügbar macht.

### 5.2 Filter-Tabs entsprechen nicht dem ARIA-Tabs-Pattern
**Schweregrad:** medium  
**Befund:** Die Filter-Umschalter in `index.html` verwenden `role="tablist"` und `role="tab"`, ohne die zugehörigen Tab-Panels, roving tabindex und Pfeiltasten-Navigation zu implementieren. Dies entspricht nicht dem WAI-ARIA-Tabs-Pattern und kann für Tastatur- und Screenreader-Nutzer verwirrend sein.  
**Abhilfe:** Da keine separaten Tab-Panels existieren, ist eine Button-Group einfacher und konform. In `index.html`:
```html
<div id="filter-toggle" class="filter-tabs" role="group" aria-label="Gewohnheiten filtern">
  <button class="filter-tab is-active" type="button" aria-pressed="true">Aktiv</button>
  <button class="filter-tab" type="button" aria-pressed="false">Archiviert</button>
</div>
```
In `js/habits.js` `setFilter()` anpassen: statt `aria-selected` `aria-pressed` setzen. Die nativen Buttons bleiben vollständig per Tastatur erreichbar und bedienbar.

### 5.3 Add-Eingabe nicht als Formular; Enter löst kein Hinzufügen aus
**Schweregrad:** low  
**Befund:** Die Add-Leiste in `index.html` besteht aus `<section>` mit `<input>` und `<button>`. Drücken der Enter-Taste im Textfeld löst kein Hinzufügen aus, da kein `<form>`-Element vorhanden ist. Zwar ist der Button per Tab erreichbar, die erwartete Interaktion per Enter fehlt jedoch.  
**Abhilfe:** In `index.html` die `<section class="add-bar">` in ein `<form class="add-bar" id="add-form">` ändern und den Button als `type="submit"` belassen. In `js/habits.js` in `init()` folgenden Listener ergänzen:
```js
const form = document.getElementById('add-form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    addHabit();
  });
}
```

### 5.4 Positiv festgestellt
- Ausreichende Fokus-Styles (`:focus-visible`) für interaktive Elemente.
- `aria-label` und `aria-pressed` für Theme-Toggle, Export- und Import-Buttons vorhanden.
- Buttons haben Mindestgrößen (44 × 44 px), was die Bedienbarkeit auf mobilen Geräten und für motorisch eingeschränkte Nutzer unterstützt.
- Fehlermeldungen beim Import verwenden `role="alert"` bzw. `role="status"` mit `aria-live`.

---

**Zusammenfassung:** Es bestehen keine fundamentalen DSGVO-Verstöße (keine Übermittlung personenbezogener Daten an den Anbieter, keine PII in Logs/Plaintext, keine heimliche Verarbeitung) und keine blockierenden Sicherheitslücken. Die App erfüllt die zentralen Sicherheits- und Datenschutz-Anforderungen der Acceptance Criteria. Für die Marktreife müssen jedoch die fehlenden Pflichttexte (Impressum, Datenschutzerklärung), eine CSP und die benannten Barrierefreiheitslücken behoben werden. Daher: **CHANGES_REQUESTED**.