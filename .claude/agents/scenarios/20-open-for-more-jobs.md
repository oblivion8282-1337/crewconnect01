# Szenario 20: "Offen fuer weitere Jobs" (openForMoreJobs)

**Ziel:** Pruefen ob die Spezial-Option "Fix aber offen fuer mehr" korrekt funktioniert.

## Konzept

Ein Freelancer kann bei einer Fix-Buchung angeben, dass er an diesem Tag noch fuer andere Jobs verfuegbar ist. Beispiel: Halbtags-Job, Abendjob, etc.

## Vorbedingungen
- Fix-Buchung existiert
- Freelancer will Tag als "offen" markieren

## Schritte

### Schritt 1: Fix-Buchung erstellen
**Agent:** agentur1
**Aktion:** Erstelle Fix-Buchung fuer Anna, 15.-17. Januar

**Erwartung:**
- Status: fix_confirmed
- openForMoreJobs: false (default)
- Kalender: ROT

---

### Schritt 2: Freelancer markiert als "offen"
**Agent:** freelancer1
**Aktion:** Aktiviere "Offen fuer weitere Jobs" fuer diese Buchung

**Erwartung:**
- openForMoreJobs: true
- Kalender wechselt zu GESTREIFT (rot/gruen)
- Eigene Buchung bleibt sichtbar

---

### Schritt 3: Andere Agentur sieht Verfuegbarkeit
**Agent:** agentur2
**Aktion:** Pruefe Kalender von Anna fuer 15.-17. Januar

**Erwartung:**
- Tage erscheinen als GRUEN (verfuegbar)!
- NICHT als Rot (obwohl Fix existiert)
- Agentur 2 kann Buchung erstellen

---

### Schritt 4: Agentur 2 bucht zusaetzlich
**Agent:** agentur2
**Aktion:** Erstelle Option fuer Anna, 15.-17. Januar

**Erwartung:**
- Buchung wird erstellt (kein Konflikt-Block)
- Anna erhaelt Anfrage
- Beide Buchungen koennen parallel existieren

---

### Schritt 5: Freelancer sieht beide Buchungen
**Agent:** freelancer1
**Aktion:** Pruefe Dashboard

**Erwartung:**
- Bluescreen Fix (15.-17.) - confirmed
- Redlight Option (15.-17.) - pending
- Kalender zeigt GESTREIFT (mehrere Buchungen)

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 2 | openForMoreJobs = true | Ja |
| 2 | Kalenderfarbe | Gestreift |
| 3 | Fremde Agentur sieht | GRUEN |
| 4 | Zusatz-Buchung moeglich | Ja |

## Sichtbarkeitsmatrix mit openForMoreJobs

| Status | openForMore | Eigene Agentur | Fremde Agentur |
|--------|-------------|----------------|----------------|
| fix_confirmed | false | Rot | Rot |
| fix_confirmed | true | Rot | GRUEN! |

## Kalenderfarben-Logik

```javascript
// In getDayStatus():
if (booking.status === 'fix_confirmed') {
  if (booking.openForMoreJobs) {
    // Fuer Freelancer: Gestreift
    // Fuer fremde Agenturen: Gruen (verfuegbar)
    // Fuer eigene Agentur: Rot
  } else {
    // Alle sehen: Rot
  }
}
```

## Use Cases

1. **Halbtags-Job:** Vormittags Shooting, nachmittags frei
2. **Abendjob:** Tagsueber frei, abends Event
3. **Standby:** Bereit fuer kurzfristige Jobs
4. **Mehrfach-Buchung:** Zwei kurze Jobs am selben Tag
