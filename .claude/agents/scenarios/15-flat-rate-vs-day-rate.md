# Szenario 15: Flat-Rate vs. Day-Rate Berechnung

**Ziel:** Pruefen ob Kostenberechnung fuer beide Rate-Typen korrekt funktioniert.

## Vorbedingungen
- Freelancer Anna mit dayRate = 800 EUR
- Freelancer Max mit flatRate = 5000 EUR (Pauschal)

## Schritte

### Schritt 1: Day-Rate Buchung (Anna)
**Agent:** agentur1
**Aktion:** Erstelle Option fuer Anna, 5 Tage (15.-19. Januar)

**Erwartung:**
- rateType = 'daily'
- dayRate = 800
- totalCost = 5 * 800 = 4.000 EUR
- Berechnung: `dayRate * dates.length`

---

### Schritt 2: Flat-Rate Buchung (Max)
**Agent:** agentur1
**Aktion:** Erstelle Option fuer Max, 5 Tage (15.-19. Januar)

**Erwartung:**
- rateType = 'flat'
- flatRate = 5000
- totalCost = 5.000 EUR (unabhaengig von Tagen!)
- Berechnung: `flatRate` (fix)

---

### Schritt 3: Day-Rate Verschiebung (mehr Tage)
**Agent:** agentur1
**Aktion:** Verschiebe Anna-Buchung von 5 auf 7 Tage

**Erwartung:**
- Neue Kosten = 7 * 800 = 5.600 EUR
- reschedule.newTotalCost = 5.600

---

### Schritt 4: Flat-Rate Verschiebung (mehr Tage)
**Agent:** agentur1
**Aktion:** Verschiebe Max-Buchung von 5 auf 7 Tage

**Erwartung:**
- Kosten bleiben 5.000 EUR (Pauschal!)
- reschedule.newTotalCost = 5.000

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 1 | Day-Rate Kosten | 4.000 EUR |
| 2 | Flat-Rate Kosten | 5.000 EUR |
| 3 | Day-Rate nach Verschiebung | 5.600 EUR |
| 4 | Flat-Rate nach Verschiebung | 5.000 EUR |

## Berechnungslogik

```javascript
// In createBooking() und requestReschedule():
const totalCost = rateType === 'flat'
  ? flatRate                    // Pauschal: Fix-Betrag
  : dayRate * dates.length;     // Tagessatz: Pro Tag
```

## Edge Cases

1. Was wenn Freelancer BEIDE hat (dayRate UND flatRate)?
2. Was wenn keines gesetzt ist?
3. Negative Werte? Null?
