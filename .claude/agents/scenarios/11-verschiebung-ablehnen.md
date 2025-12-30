# Szenario 11: Verschiebung ablehnen

**Ziel:** Pruefen ob Ablehnung einer Verschiebung korrekt funktioniert.

## Vorbedingungen
- Bestaetigte Buchung existiert (15.-17. Januar)
- Agentur hat Verschiebung angefragt (auf 22.-24. Januar)

## Schritte

### Schritt 1: Ausgangslage
**Agent:** agentur1
**Aktion:** Pruefe Buchung mit reschedule-Anfrage

**Erwartung:**
- Buchung hat reschedule Objekt:
  ```javascript
  reschedule: {
    originalDates: ['2025-01-15', ...],
    newDates: ['2025-01-22', ...],
    newTotalCost: 2400
  }
  ```
- Status ist weiterhin confirmed

---

### Schritt 2: Freelancer sieht Verschiebungsanfrage
**Agent:** freelancer1
**Aktion:** Oeffne Tab "Verschiebungen"

**Erwartung:**
- Verschiebungsanfrage sichtbar
- Alte und neue Tage angezeigt
- Buttons: "Bestaetigen" und "Ablehnen"

---

### Schritt 3: Freelancer lehnt ab
**Agent:** freelancer1
**Aktion:** Klicke "Ablehnen"

**Erwartung:**
- `reschedule` Objekt wird ENTFERNT
- `dates` bleibt UNVERAENDERT (alte Tage: 15.-17.)
- Status bleibt confirmed
- Buchung bleibt aktiv mit urspruenglichen Tagen

---

### Schritt 4: Agentur sieht Ablehnung
**Agent:** agentur1
**Aktion:** Pruefe Buchung

**Erwartung:**
- Notification: "Verschiebung abgelehnt"
- Buchung zeigt wieder urspruengliche Tage
- Kein reschedule Objekt mehr vorhanden
- Kann erneut Verschiebung anfragen

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 3 | reschedule entfernt | Ja |
| 3 | dates unveraendert | Ja (15.-17.) |
| 3 | Status | Bleibt confirmed |
| 4 | Notification | Ja |

## Code-Referenz

```javascript
// declineReschedule() sollte:
// 1. reschedule auf null setzen
// 2. dates NICHT aendern
// 3. Notification an Agentur senden
```
