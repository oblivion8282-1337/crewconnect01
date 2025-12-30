# Szenario 14: Kalenderfarben-Matrix

**Ziel:** Systematischer Test aller Kalenderfarben aus verschiedenen Perspektiven.

## Vorbedingungen
- Verschiedene Buchungen in verschiedenen Status erstellen

## Test-Setup

Erstelle folgende Buchungen fuer Anna Schmidt:

| # | Tage | Typ | Status | Agentur |
|---|------|-----|--------|---------|
| A | 10.-11. Jan | Option | pending | Bluescreen |
| B | 12.-13. Jan | Option | confirmed | Bluescreen |
| C | 14.-15. Jan | Fix | pending | Bluescreen |
| D | 16.-17. Jan | Fix | confirmed | Bluescreen |
| E | 18.-19. Jan | Fix | confirmed + openForMore | Bluescreen |
| F | 20.-21. Jan | Option | pending | Redlight |

---

## Pruefung 1: Freelancer-Ansicht
**Agent:** freelancer1

| Buchung | Tage | Erwartete Farbe |
|---------|------|-----------------|
| A | 10.-11. | LILA (pending) |
| B | 12.-13. | GELB (option confirmed) |
| C | 14.-15. | LILA (pending) |
| D | 16.-17. | ROT (fix confirmed) |
| E | 18.-19. | GESTREIFT (fix + offen) |
| F | 20.-21. | LILA (pending) |

---

## Pruefung 2: Agentur 1 (Bluescreen) Ansicht
**Agent:** agentur1

| Buchung | Tage | Erwartete Farbe |
|---------|------|-----------------|
| A | 10.-11. | LILA (eigene pending) |
| B | 12.-13. | GELB (eigene option) |
| C | 14.-15. | LILA (eigene pending) |
| D | 16.-17. | ROT (eigene fix) |
| E | 18.-19. | ROT (eigene fix) |
| F | 20.-21. | GRUEN! (fremde Option = unsichtbar) |

---

## Pruefung 3: Agentur 2 (Redlight) Ansicht
**Agent:** agentur2

| Buchung | Tage | Erwartete Farbe |
|---------|------|-----------------|
| A | 10.-11. | GRUEN (fremde Option) |
| B | 12.-13. | GRUEN (fremde Option) |
| C | 14.-15. | GRUEN (fremde pending) |
| D | 16.-17. | ROT (Fix = blockiert) |
| E | 18.-19. | GRUEN (offen fuer mehr!) |
| F | 20.-21. | LILA (eigene pending) |

---

## Erfolgs-Kriterien

### Freelancer sieht:
| Status | Farbe |
|--------|-------|
| *_pending | Lila |
| option_confirmed | Gelb |
| fix_confirmed | Rot |
| fix + openForMore | Gestreift |

### Eigene Agentur sieht:
| Status | Farbe |
|--------|-------|
| *_pending | Lila |
| option_confirmed | Gelb |
| fix_confirmed | Rot |

### Fremde Agentur sieht:
| Status | Farbe |
|--------|-------|
| Alles ausser fix_confirmed | GRUEN |
| fix_confirmed | Rot |
| fix + openForMore | GRUEN |

---

## Code-Referenz

Die Logik sollte in `getDayStatus()` implementiert sein:

```javascript
getDayStatus(forFreelancerId, date, forAgencyId, excludeBookingId)
```

Der `forAgencyId` Parameter bestimmt die Sichtbarkeit.
