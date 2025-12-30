# Kombiniertes Szenario 01: Buchung mit Farb-Validierung

**Ziel:** Eine komplette Buchung durchfuehren und nach JEDEM Schritt die korrekten Kalenderfarben validieren.

## Beteiligte Agenten

| Agent | Rolle |
|-------|-------|
| master-supervisor | Orchestriert alles |
| agentur1 | Erstellt Buchung |
| freelancer1 | Bestaetigt/lehnt ab |
| agentur2 | Pruefer (sieht fremde Buchungen) |
| ui-checker1 | Validiert Farben |

---

## SCHRITT 1: Option erstellen

### System-Aktion
```
Agent: agentur1
Aktion: Erstelle Option-Buchung fuer Anna Schmidt (15.-17. Januar)
Erwarteter Status: option_pending
```

### UI-Validierung

| Perspektive | Tage 15.-17. Jan | Erwartete Farbe | Tailwind-Klasse |
|-------------|------------------|-----------------|-----------------|
| Freelancer (Anna) | Buchungstage | LILA | `bg-purple-500` |
| Agentur 1 (Bluescreen) | Buchungstage | LILA | `bg-purple-500` |
| Agentur 2 (Redlight) | Buchungstage | GRUEN | `bg-green-500` |

### Zusaetzliche UI-Checks
- [ ] Freelancer hat Notification "Neue Anfrage"
- [ ] StatusBadge zeigt "Option angefragt"
- [ ] Buchung erscheint in Freelancer-Anfragen-Liste

---

## SCHRITT 2: Freelancer bestaetigt Option

### System-Aktion
```
Agent: freelancer1
Aktion: Bestaetigt die Option von Bluescreen
Erwarteter Status: option_confirmed
```

### UI-Validierung

| Perspektive | Tage 15.-17. Jan | Erwartete Farbe | Tailwind-Klasse |
|-------------|------------------|-----------------|-----------------|
| Freelancer (Anna) | Buchungstage | GELB | `bg-yellow-400` |
| Agentur 1 (Bluescreen) | Buchungstage | GELB | `bg-yellow-400` |
| Agentur 2 (Redlight) | Buchungstage | GRUEN | `bg-green-500` |

### Zusaetzliche UI-Checks
- [ ] StatusBadge zeigt "Option bestaetigt"
- [ ] Agentur 1 sieht "Zur Fixbuchung"-Button
- [ ] Agentur 2 sieht diese Buchung NICHT

---

## SCHRITT 3: Agentur wandelt in Fix um

### System-Aktion
```
Agent: agentur1
Aktion: Wandelt Option in Fix um
Erwarteter Status: fix_confirmed (DIREKT, ohne erneute Bestaetigung!)
```

### UI-Validierung

| Perspektive | Tage 15.-17. Jan | Erwartete Farbe | Tailwind-Klasse |
|-------------|------------------|-----------------|-----------------|
| Freelancer (Anna) | Buchungstage | ROT | `bg-red-500` |
| Agentur 1 (Bluescreen) | Buchungstage | ROT | `bg-red-500` |
| Agentur 2 (Redlight) | Buchungstage | ROT | `bg-red-500` |

### Zusaetzliche UI-Checks
- [ ] StatusBadge zeigt "Fix bestaetigt"
- [ ] ALLE Agenturen sehen diese Tage als blockiert
- [ ] Freelancer kann keine weitere Buchung annehmen

---

## SCHRITT 4: OpenForMore aktivieren

### System-Aktion
```
Agent: freelancer1
Aktion: Aktiviert "Offen fuer weitere Jobs" fuer 15.-17. Januar
Erwarteter Status: fix_confirmed + openForMore=true
```

### UI-Validierung

| Perspektive | Tage 15.-17. Jan | Erwartete Farbe | Tailwind-Klasse |
|-------------|------------------|-----------------|-----------------|
| Freelancer (Anna) | Buchungstage | GESTREIFT | `bg-gradient-to-br from-red-500 to-green-500` |
| Agentur 1 (Bluescreen) | Buchungstage | ROT | `bg-red-500` |
| Agentur 2 (Redlight) | Buchungstage | GRUEN | `bg-green-500` |

### Zusaetzliche UI-Checks
- [ ] Freelancer sieht gestreiftes Muster (rot/gruen)
- [ ] Eigene Agentur sieht weiterhin Rot
- [ ] Fremde Agentur sieht GRUEN und kann buchen!

---

## SCHRITT 5: Zweite Agentur bucht gleichen Tag

### System-Aktion
```
Agent: agentur2
Aktion: Erstellt Option-Buchung fuer Anna Schmidt (16. Januar)
Erwarteter Status: option_pending (fuer Agentur 2)
```

### UI-Validierung

| Perspektive | Tag 16. Jan | Erwartete Farbe | Tailwind-Klasse |
|-------------|-------------|-----------------|-----------------|
| Freelancer (Anna) | Buchungstag | GESTREIFT + LILA Badge | Komplex |
| Agentur 1 (Bluescreen) | Buchungstag | ROT | `bg-red-500` |
| Agentur 2 (Redlight) | Buchungstag | LILA | `bg-purple-500` |

### Zusaetzliche UI-Checks
- [ ] Freelancer sieht mehrere Buchungen am selben Tag
- [ ] Agentur 1 weiss nichts von Agentur 2's Anfrage
- [ ] Agentur 2 weiss nichts von Agentur 1's Fix

---

## Erfolgs-Kriterien

### Alle Farben korrekt:
- [ ] Lila fuer alle pending-Status (eigene Ansichten)
- [ ] Gelb fuer option_confirmed
- [ ] Rot fuer fix_confirmed
- [ ] Gestreift fuer fix + openForMore (nur Freelancer)
- [ ] Gruen fuer fremde Agenturen bei allem ausser fix_confirmed

### Sichtbarkeit korrekt:
- [ ] Fremde Agenturen sehen KEINE pending/confirmed Options
- [ ] Nur fix_confirmed ist fuer alle sichtbar
- [ ] openForMore macht Tage wieder buchbar fuer Fremde

### Code-Referenzen pruefen:
- `src/constants/calendar.js:DAY_STATUS_COLORS`
- `src/hooks/useBookings.js:getDayStatus()`
- `src/components/freelancer/FreelancerCalendar.jsx`
- `src/components/shared/StatusBadge.jsx`
