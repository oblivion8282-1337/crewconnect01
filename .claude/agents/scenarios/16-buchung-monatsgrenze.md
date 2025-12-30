# Szenario 16: Buchung ueber Monatsgrenzen

**Ziel:** Pruefen ob Buchungen die Monatsgrenzen ueberspannen korrekt funktionieren.

## Vorbedingungen
- Keine aktiven Buchungen

## Schritte

### Schritt 1: Buchung ueber Monatsende
**Agent:** agentur1
**Aktion:** Erstelle Option fuer Anna, 28. Januar - 3. Februar

**Erwartung:**
- dates Array enthaelt:
  ```javascript
  ['2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31',
   '2025-02-01', '2025-02-02', '2025-02-03']
  ```
- 7 Tage insgesamt
- Kosten = 7 * 800 = 5.600 EUR

---

### Schritt 2: Kalender-Anzeige Januar
**Agent:** freelancer1
**Aktion:** Oeffne Kalender Januar 2025

**Erwartung:**
- 28., 29., 30., 31. Januar sind markiert (Lila)
- Korrekte Farbe fuer alle 4 Tage

---

### Schritt 3: Kalender-Anzeige Februar
**Agent:** freelancer1
**Aktion:** Wechsle zu Februar 2025

**Erwartung:**
- 1., 2., 3. Februar sind markiert (Lila)
- Gleiche Buchung, gleiche Farbe
- Kein "Bruch" an der Monatsgrenze

---

### Schritt 4: Buchung ueber Jahresende
**Agent:** agentur1
**Aktion:** Erstelle Option fuer Max, 29. Dezember 2025 - 2. Januar 2026

**Erwartung:**
- dates Array enthaelt:
  ```javascript
  ['2025-12-29', '2025-12-30', '2025-12-31',
   '2026-01-01', '2026-01-02']
  ```
- Jahreswechsel korrekt behandelt

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 1 | Alle Tage im Array | 7 Tage |
| 1 | Korrekte Datumsformate | YYYY-MM-DD |
| 2+3 | Kalender zeigt alle Tage | Ja |
| 4 | Jahreswechsel funktioniert | Ja |

## Technische Details

- Datumsformat: YYYY-MM-DD (ISO 8601)
- createDateKey() in dateUtils.js sollte konsistent sein
- Keine Zeitzone-Probleme (nur Datum, keine Uhrzeit)

## Moegliche Fehler

- Off-by-one bei Monatsenden (31. vs 30. vs 28.)
- Schaltjahr-Problem (29. Februar)
- Zeitzone verschiebt Datum um 1 Tag
