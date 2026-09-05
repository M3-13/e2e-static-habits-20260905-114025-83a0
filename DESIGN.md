# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Ruhige, minimalistische Produktivitätsästhetik nach Linear/Stripe-Vorbild: warmes Hellgrau, klare Karten, ein Indigo-Akzent für Aktionen und erledigte Tage; der Dark Mode nutzt dieselbe Hierarchie in gedämpftem Graphit.

## Colors

- `--color-bg`: **#F7F7F5**
- `--color-surface`: **#FFFFFF**
- `--color-surface_2`: **#EFEFEC**
- `--color-fg`: **#1B1D21**
- `--color-muted`: **#6E7480**
- `--color-border`: **#E3E5E8**
- `--color-accent`: **#4F46E5**
- `--color-accent_hover`: **#4338CA**
- `--color-accent_soft`: **#EEF2FF**
- `--color-on_accent`: **#FFFFFF**
- `--color-success`: **#16A34A**
- `--color-danger`: **#DC2626**
- `--color-warning`: **#D97706**
- `--color-dark_bg`: **#111318**
- `--color-dark_surface`: **#191C22**
- `--color-dark_surface_2`: **#22262E**
- `--color-dark_fg`: **#E8EAED**
- `--color-dark_muted`: **#9AA3B2**
- `--color-dark_border`: **#2B303A**
- `--color-dark_accent`: **#818CF8**
- `--color-dark_accent_hover`: **#A5B4FC**
- `--color-dark_accent_soft`: **#262B3B**
- `--color-dark_on_accent`: **#111318**
- `--color-dark_success`: **#34D399**
- `--color-dark_danger`: **#F87171**
- `--color-dark_warning`: **#FBBF24**

## Typography

- `font_family`: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
- `heading_weight`: 600
- `body_weight`: 400
- `size_sm`: 13px
- `size_base`: 15px
- `size_md`: 16px
- `size_lg`: 20px
- `size_xl`: 28px

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 6px
- `--radius-md`: 10px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button

Primär: min-height 44px, padding 12px 20px, radius md (10px), bg=accent, color=on_accent, font-weight 600, font-size 15px. Hover bg=accent_hover; Active um 2px nach unten versetzt, bg=accent_hover; Disabled opacity 0.5, cursor not-allowed. Fokus: outline 2px accent, offset 2px. Sekundär: bg=transparent, border 1px border, color=fg; Hover bg=surface_2. Gefahr: color=danger, border 1px danger bei 40% Deckkraft; Hover bg=danger mit 8% Deckkraft.

### Card

bg=surface, border 1px border, radius lg (16px), padding 16px (mobil) / 24px (ab 640px), box-shadow 0 1px 2px rgba(0,0,0,0.04). Dark Mode: bg=dark_surface, border=dark_border.

### Input

min-height 44px, padding 12px 14px, radius md (10px), border 1px border, bg=surface, color=fg, font-size 15px. Placeholder color=muted. Fokus: border=accent + box-shadow 0 0 0 3px accent_soft. Ungültig: border=danger, Hinweistext in danger.

### HabitRow

Card-Stil. Kopfzeile als Flex: Name links (font-weight 600, font-size 16px), Statistiken rechts als Badges. Darunter 30-Tage-Raster. Unter 640px: Statistiken untereinander, Raster horizontal scrollbar, Tageszellen mindestens 36px. Zeilenabstand 8px.

### DayCell

Quadrat 36px (Desktop 40px), radius sm (6px), border 1px border, bg=surface_2. Unchecked: transparent mit border. Checked: bg=accent, border=accent, weißes Häkchen (2px Strich, SVG/Pseudo-Element). Heute: border 2px accent, bg=accent_soft. Hover: border=accent. Archiviert/disabled: opacity 0.6. Kein Text in der Zelle, Datum als Tooltip.

### Toggle

Dark-Mode-Schalter. Track 48x28px, radius pill, bg=border; Thumb 22x22px, radius pill, bg=surface, subtiler Schatten. Aktiv: bg=accent, Thumb um 20px nach rechts. Gesamtes Klickziel min 44x44px (unsichtbarer Hit-Bereich). Fokusring wie Button.

### Badge

padding 4px 10px, radius pill, font-size 13px, font-weight 600, bg=surface_2, color=muted. Variante Erfolg: bg=accent_soft, color=accent. Variante Gefahr: bg=danger bei 8% Deckkraft, color=danger.

### FilterTabs

Segmented Control: Container bg=surface_2, radius md (10px), padding 4px, inline-flex. Tab: padding 8px 16px, min-height 40px, radius 6px, color=muted. Aktiver Tab: bg=surface, color=fg, box-shadow 0 1px 2px rgba(0,0,0,0.06).

### Modal

Overlay bg=rgba(15,17,19,0.5), zentriert, padding 16px. Dialog bg=surface, radius lg (16px), max-width 420px, padding 24px, border 1px border. Titel font-weight 600, 18px. Aktionen rechtsbündig mit Sekundär- und Gefahr-Button.

### EmptyState

Zentriert, max-width 420px, padding 48px 24px. Abstrakte Häkchen-Illustration 64px (3 Linien in accent und muted), Headline 20px/600, Erklärtext 15px/muted, Abstand 16px. Darunter primärer Button 'Erste Gewohnheit anlegen' und Datenschutzhinweis als muted 13px.

### CanvasChart

Canvas width 100%, Höhe 180px (mobil) / 220px (ab 640px), devicePixelRatio-scharf. Hintergrund transparent. Achsen und Rasterlinien in border bei 50% Deckkraft. Balken accent (aktive Wochen), muted (leere Wochen); Balkenbreite max 32px, Abstand 12px, Radius oben sm. Achsenlabels 12px muted. Keine überladenen Annotationen.

## Layout Principles

- Container max-width 960px, zentriert, padding 16px (mobil) / 24px (ab 640px) / 32px (ab 960px).
- Breakpoints: 640px (mobil zu tablet) und 960px (tablet zu desktop); unter 640px einspaltig, darüber Kartenraster mit 2 Spalten für Sekundärbereiche.
- Header sticky oben, bg=bg (Dark Mode bg=dark_bg), Höhe 64px; enthält Titel, Dark-Mode-Toggle sowie Export/Import als Icon-Buttons mit min 44x44px.
- Vertikaler Rhythmus: 24px Abstand zwischen Sektionen, 16px innerhalb von Karten; primäre Aktion oben rechts oder direkt nach dem Leerzustand.
- Alle Zustandswechsel mit 120ms ease-out; Hover und Fokus klar sichtbar, Touch-Ziele mindestens 44x44px.
