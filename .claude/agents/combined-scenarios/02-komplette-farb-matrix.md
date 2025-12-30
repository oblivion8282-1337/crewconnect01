# Kombiniertes Szenario 02: Komplette Farb-Matrix Validierung

**Ziel:** Alle moeglichen Farbkombinationen systematisch pruefen.

## Beteiligte Agenten

| Agent | Rolle |
|-------|-------|
| master-supervisor | Orchestriert alles |
| agentur1, agentur2 | Erstellen Buchungen |
| freelancer1 | Bestaetigt/verwaltet |
| ui-checker1 | Validiert ALLE Farben |

---

## SETUP: Buchungen erstellen

Erstelle folgende Buchungen fuer Anna Schmidt (Freelancer 1):

| ID | Tage | Status | Agentur | openForMore |
|----|------|--------|---------|-------------|
| A | 10.-11. Jan | option_pending | Bluescreen | - |
| B | 12.-13. Jan | option_confirmed | Bluescreen | - |
| C | 14.-15. Jan | fix_pending | Bluescreen | - |
| D | 16.-17. Jan | fix_confirmed | Bluescreen | false |
| E | 18.-19. Jan | fix_confirmed | Bluescreen | true |
| F | 20.-21. Jan | option_pending | Redlight | - |

---

## FARB-MATRIX VALIDIERUNG

### Freelancer-Ansicht (Anna Schmidt)

| Buchung | Tage | Farbe | Tailwind | Check |
|---------|------|-------|----------|-------|
| A | 10.-11. | LILA | `bg-purple-500` | [ ] |
| B | 12.-13. | GELB | `bg-yellow-400` | [ ] |
| C | 14.-15. | LILA | `bg-purple-500` | [ ] |
| D | 16.-17. | ROT | `bg-red-500` | [ ] |
| E | 18.-19. | GESTREIFT | `from-red-500 to-green-500` | [ ] |
| F | 20.-21. | LILA | `bg-purple-500` | [ ] |

### Agentur 1 (Bluescreen) Ansicht

| Buchung | Tage | Farbe | Tailwind | Grund | Check |
|---------|------|-------|----------|-------|-------|
| A | 10.-11. | LILA | `bg-purple-500` | Eigene pending | [ ] |
| B | 12.-13. | GELB | `bg-yellow-400` | Eigene option | [ ] |
| C | 14.-15. | LILA | `bg-purple-500` | Eigene pending | [ ] |
| D | 16.-17. | ROT | `bg-red-500` | Eigene fix | [ ] |
| E | 18.-19. | ROT | `bg-red-500` | Eigene fix | [ ] |
| F | 20.-21. | GRUEN | `bg-green-500` | Fremde Option! | [ ] |

### Agentur 2 (Redlight) Ansicht

| Buchung | Tage | Farbe | Tailwind | Grund | Check |
|---------|------|-------|----------|-------|-------|
| A | 10.-11. | GRUEN | `bg-green-500` | Fremde Option | [ ] |
| B | 12.-13. | GRUEN | `bg-green-500` | Fremde Option | [ ] |
| C | 14.-15. | GRUEN | `bg-green-500` | Fremde pending | [ ] |
| D | 16.-17. | ROT | `bg-red-500` | Fix = blockiert | [ ] |
| E | 18.-19. | GRUEN | `bg-green-500` | openForMore! | [ ] |
| F | 20.-21. | LILA | `bg-purple-500` | Eigene pending | [ ] |

---

## UI-CHECKER AUFGABEN

### Aufruf ui-checker1:
```
Pruefe die Kalenderfarben in folgenden Dateien:
1. src/components/freelancer/FreelancerCalendar.jsx
2. src/hooks/useBookings.js (getDayStatus Funktion)
3. src/constants/calendar.js (DAY_STATUS_COLORS)

Validiere:
- Werden die richtigen Tailwind-Klassen verwendet?
- Ist die Sichtbarkeits-Logik in getDayStatus korrekt?
- Parameter: getDayStatus(forFreelancerId, date, forAgencyId, excludeBookingId)
```

### Pruefpunkte fuer ui-checker1:

1. **DAY_STATUS_COLORS Konsistenz**
   ```javascript
   // Erwartete Definition in calendar.js
   green: 'bg-green-500 text-white',
   purple: 'bg-purple-500 text-white',
   yellow: 'bg-yellow-400 text-gray-800',
   red: 'bg-red-500 text-white',
   striped: 'bg-gradient-to-br from-red-500 to-green-500 text-white'
   ```

2. **getDayStatus Parameter-Logik**
   ```javascript
   // Wenn forAgencyId gesetzt und NICHT gleich Buchungs-Agentur:
   // → Option/Pending = GRUEN (nicht sichtbar)
   // → Fix confirmed = ROT (sichtbar)
   // → Fix + openForMore = GRUEN (buchbar)
   ```

3. **Kalender-Rendering**
   - Wird `getDayStatus` mit korrekten Parametern aufgerufen?
   - Freelancer-View: forAgencyId = null
   - Agentur-View: forAgencyId = aktuelle Agentur ID

---

## EDGE CASES PRUEFEN

### Edge Case 1: Mehrere Buchungen am selben Tag
```
Tag 16. Januar:
- Buchung D (Bluescreen): fix_confirmed
- Neue Anfrage (Redlight): option_pending

Erwartung:
- Freelancer: Sieht beide, Tag ist ROT (Fix hat Prioritaet)
- Bluescreen: ROT (eigener Fix)
- Redlight: Sollte NICHT buchen koennen (Tag ist blockiert)
```

### Edge Case 2: openForMore aktiviert
```
Tag 18.-19. Januar:
- Buchung E (Bluescreen): fix_confirmed + openForMore

Erwartung:
- Freelancer: GESTREIFT
- Bluescreen: ROT (eigener Fix)
- Redlight: GRUEN (kann buchen!)
```

### Edge Case 3: Pending von fremder Agentur
```
Tag 20.-21. Januar:
- Buchung F (Redlight): option_pending

Aus Sicht Bluescreen:
- Sieht nur GRUEN
- Weiss NICHTS von Redlights Anfrage
```

---

## FEHLER-REPORT FORMAT

```
═══════════════════════════════════════════════════════════════
FARB-MATRIX VALIDIERUNG
═══════════════════════════════════════════════════════════════

FREELANCER-ANSICHT: [6/6] korrekt
AGENTUR 1 ANSICHT:  [X/6] korrekt
AGENTUR 2 ANSICHT:  [X/6] korrekt

FEHLER GEFUNDEN:

❌ Fehler 1:
   Buchung: [ID]
   Perspektive: [Agentur 2]
   Erwartet: GRUEN (bg-green-500)
   Tatsaechlich: LILA (bg-purple-500)
   Ursache: getDayStatus prueft forAgencyId nicht
   Datei: src/hooks/useBookings.js:XXX
   Fix: if (forAgencyId && booking.agencyId !== forAgencyId) return 'green'

═══════════════════════════════════════════════════════════════
```

---

## ERFOLGS-KRITERIEN

- [ ] Alle 6 Buchungen in Freelancer-Ansicht korrekt
- [ ] Alle 6 Buchungen in Agentur 1 Ansicht korrekt
- [ ] Alle 6 Buchungen in Agentur 2 Ansicht korrekt
- [ ] Fremde Options sind IMMER gruen
- [ ] Nur fix_confirmed ist fuer alle rot
- [ ] openForMore macht Tag fuer Fremde gruen
- [ ] Gestreiftes Muster nur fuer Freelancer bei openForMore
