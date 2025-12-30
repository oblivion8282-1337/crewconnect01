# Szenario 17: Validierung Edge Cases

**Ziel:** Pruefen ob ungueltige Eingaben korrekt abgefangen werden.

## Test-Faelle

### Test 1: Leere Buchung (0 Tage)
**Agent:** agentur1
**Aktion:** Versuche Buchung ohne Tage zu erstellen

**Erwartung:**
- Buchung wird ABGELEHNT
- Fehlermeldung: "Mindestens 1 Tag erforderlich"
- Keine Buchung in der Datenbank

---

### Test 2: Buchung in der Vergangenheit
**Agent:** agentur1
**Aktion:** Versuche Buchung fuer 1.-3. Januar 2024 (Vergangenheit)

**Erwartung:**
- Buchung wird ABGELEHNT oder GEWARNT
- "Datum liegt in der Vergangenheit"

---

### Test 3: Doppelte Tage im Array
**Agent:** agentur1
**Aktion:** Sende Buchung mit dates = ['2025-01-15', '2025-01-15', '2025-01-16']

**Erwartung:**
- Duplikate werden entfernt ODER
- Fehler: "Doppelte Datumseintraege"
- Kosten nicht doppelt berechnet

---

### Test 4: Ungueltiges Datumsformat
**Agent:** agentur1
**Aktion:** Sende Buchung mit dates = ['15.01.2025', '16/01/2025']

**Erwartung:**
- Fehler: "Ungueltiges Datumsformat"
- Nur YYYY-MM-DD akzeptiert

---

### Test 5: Freelancer existiert nicht
**Agent:** agentur1
**Aktion:** Versuche Buchung fuer freelancerId = 999

**Erwartung:**
- Fehler: "Freelancer nicht gefunden"
- Keine Buchung erstellt

---

### Test 6: Projekt existiert nicht
**Agent:** agentur1
**Aktion:** Versuche Buchung fuer projectId = 999

**Erwartung:**
- Fehler: "Projekt nicht gefunden"
- Keine Buchung erstellt

---

### Test 7: Negative Kosten
**Agent:** agentur1
**Aktion:** Freelancer mit dayRate = -100

**Erwartung:**
- Fehler oder automatische Korrektur
- Keine negativen Kosten in Buchung

---

## Erfolgs-Kriterien

| Test | Pruefpunkt | Erwartet |
|------|-----------|----------|
| 1 | 0 Tage | Abgelehnt |
| 2 | Vergangenheit | Abgelehnt/Warnung |
| 3 | Duplikate | Bereinigt/Fehler |
| 4 | Format | Fehler |
| 5 | Freelancer 404 | Fehler |
| 6 | Projekt 404 | Fehler |
| 7 | Negativ | Fehler |

## Implementierungs-Check

Diese Validierungen sollten in `createBooking()` sein:

```javascript
const createBooking = useCallback((/* params */) => {
  // Validierungen:
  if (!dates || dates.length === 0) {
    throw new Error('Mindestens 1 Tag erforderlich');
  }
  if (!freelancerId) {
    throw new Error('Freelancer erforderlich');
  }
  // ... weitere Checks
}, []);
```
