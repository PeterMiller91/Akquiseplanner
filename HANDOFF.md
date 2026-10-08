# DS Finanzdienstleistungen – Akquise-Planer

Mobile-first Web-App (PWA) für einen einzelnen Finanzdienstleister: Akquise-Projekte planen, Kunden durch die Pipeline führen, Termine, Aufgaben und Ziele im Blick behalten.

Referenz-Design: `Akquise App.dc.html` mit `variant="b"` („Salbei“). Die Datei ist ein klickbarer Prototyp und zeigt alle Screens, Interaktionen und Beispieldaten. Werte unten haben Vorrang, falls etwas abweicht.

## Tech-Stack (Vorschlag)
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth, Single-User-Login per E-Mail)
- PWA: Manifest + Service Worker, installierbar auf iOS/Android
- Sprache: Deutsch, Locale `de-DE` (Datum, Währung `1.234 €`)

## Design-Tokens (Variante „Salbei“)
Farben:
- `bg` #F3F0E9 (App-Hintergrund)
- `surface` #FFFDF8 (Karten, Nav)
- `ink` #1D2920 (Text)
- `muted` #646D5E (Sekundärtext)
- `line` #E3DDD0 (Rahmen, Trenner)
- `primary` #2E5E46 (Buttons, Fortschritt, Links, aktive Chips)
- `primary-ink` #FFFFFF
- `hero` #1F3A2C (dunkle Hero-Karte, Avatar Detail) · `hero-ink` #F6F1E6 · `hero-muted` rgba(246,241,230,.75)
- `hero-track` rgba(246,241,230,.18) · `accent-gold` #D9C48F (Fortschritt auf Hero)
- `track` #E7E2D6 (leere Fortschrittsbalken)
- `tag-bg` #DFE8DF · `tag-ink` #24493A (Sparten-Tags, Avatare, aktive Nav)

Typografie (Google Fonts):
- Fließtext/UI: **DM Sans** 400/500/600/700
- Headlines (H1, große Zahlen): **Instrument Serif** 400, letter-spacing -0.02em
- H1 36px · Hero-Zahl 40px · KPI-Zahl 26px · Sektionstitel 15px/700 · Body 13.5–14.5px · Meta 12px · Nav-Label 10.5px/600

Form:
- Radius Karten 14px, kleine Elemente 10px, Chips/Tags pill (30px)
- Karten: `surface` + 1px `line`, kein Schatten
- Seitenpadding 18px, Abstände zwischen Sektionen 16–18px, in Listen 8–10px
- Touch-Targets mind. 44px

## Navigation
Bottom-Tab-Bar (5 Tabs, SVG-Line-Icons 22px, Stroke 1.8): **Start · Pipeline · Kunden · Termine · Ziele**. Aktiver Tab: `tag-bg` Pill, `tag-ink` Farbe.
Aufgaben und Akquise-Projekte sind vom Start-Screen aus erreichbar (mit „‹ Übersicht“-Zurück). Kundendetail öffnet sich von überall und springt zurück zum Ursprungs-Screen.

## Domänenmodell
- **Phasen** (fest, geordnet): Lead → Kontakt → Termin → Analyse → Angebot → Abschluss
- **Sparten**: BU, Altersvorsorge, Investment, bKV, Strom, Gas

```ts
Customer { id, name, type: 'privat'|'gewerbe', sparte, stage (0–5), expectedCourtage (€),
  nextStep: string, nextStepAt?: datetime, phone, email, source, projectId?, note, createdAt, lastContactAt }
Activity { id, customerId, type: 'anruf'|'termin'|'mail'|'phase'|'notiz', text, at }
Event    { id, customerId?, title, start, durationMin, place }
Task     { id, customerId?, title, due: date, done: boolean }
Project  { id, name, sparten: string[], start, end, goalDeals: number }   // Leads/Abschlüsse aus Kunden abgeleitet
Goal     { month, courtage, deals, events, leads }                          // Monatsziele
```
Phasenwechsel erzeugt automatisch eine `Activity` vom Typ `phase`.

## Screens
1. **Start**: Datum + „Guten Morgen“, Avatar/Logo. Hero-Karte (dunkel) mit Courtage im Monat vs. Ziel, Fortschrittsbalken in Gold, Resttage. 3 KPI-Kacheln (offene Kontakte, Termine Woche, Aufgaben offen, jeweils verlinkt). „Heute“: Terminliste (Uhrzeit, Titel, Kunde · Ort). Die nächsten 3 Aufgaben (abhakbar). Akquise-Projekte als horizontales Karussell (Tag, Name, Fortschritt, „x von y Abschlüssen“).
2. **Pipeline**: Gesamtpotenzial + Anzahl. Segmentbalken für die Verteilung über die Phasen. Horizontal scrollbare Phasen-Chips mit Anzahl. Darunter Kundenkarten der gewählten Phase: Avatar, Name, Sparte · Wert, nächster Schritt, Buttons „Details“ + „Weiter zu {Phase} →“. Mobile-Ansatz statt breitem Kanban: eine Phase gleichzeitig.
3. **Kunden**: Suche, Sparten-Filterchips (Alle + 6), Liste (Avatar, Name, Sparte · letzter Kontakt, Phasen-Badge).
4. **Kundendetail**: Zurück, Avatar groß, Name, Sparte- und Wert-Tag. Phasen-Stepper (6 Segmente). Aktionen Anrufen (`tel:`), Termin, „Phase weiter“. Hervorgehobene Box „Nächster Schritt“. Infoliste (Telefon, E-Mail, Quelle, Projekt, letzter Kontakt). Notiz. Verlauf (Timeline).
5. **Termine**: Monat/KW, Wochenstreifen (7 Tage, Punkt bei Terminen, gewählter Tag gefüllt `primary`), Terminliste des Tages. Leerzustand: „Keine Termine – Zeit für Akquise-Anrufe“.
6. **Aufgaben**: Fortschritt „x von y erledigt“ + Balken, Gruppen „Heute“ / „Diese Woche“ (Label uppercase 12px), Checkbox-Karten mit Kundenname.
7. **Akquise-Projekte**: Karten mit Sparte, Zeitraum, Name, 3 Kennzahlen (Leads, Abschlüsse, Quote), Fortschritt zum Ziel. Aufklappbar mit zugeordneten Kunden (Tap → Detail).
8. **Ziele**: Monatsziele mit Balken (Courtage, Abschlüsse, Termine, neue Leads), Akquise-Trichter (kumulativ je Phase, horizontale Balken), Pipeline nach Sparte (Anzahl + Summe offener Werte).

## Ergänzungen über den Prototyp hinaus (MVP)
- FAB oder „+“ in der Kopfzeile: Kunde, Termin, Aufgabe, Projekt anlegen (Bottom-Sheet-Formulare)
- Kunden bearbeiten/löschen, Phase auch zurücksetzen
- Ziele pro Monat bearbeiten
- Optional später: Desktop-Layout (Sidebar + echtes Kanban mit Drag & Drop), Kalender-Export (ICS), CSV-Import

## Berechnungen
- Courtage Monat = Summe `expectedCourtage` der Kunden mit Abschluss im laufenden Monat
- Pipeline-Potenzial = Summe der Kunden mit stage < 5
- Projekt-Quote = Abschlüsse / Leads
- Trichter Phase i = Anzahl Kunden mit stage ≥ i

## Datenschutz
Kundendaten sind personenbezogen (DSGVO): Hosting in der EU (Supabase-Region Frankfurt), Row Level Security, keine Analytics-Tracker, Export-/Löschfunktion pro Kunde.

## Seed-Daten
Beispielkunden, -termine, -aufgaben und -projekte aus `Akquise App.dc.html` (Konstanten `CUSTOMERS`, `EVENTS`, `TASKS`, `PROJECTS`) als Seed übernehmen.
