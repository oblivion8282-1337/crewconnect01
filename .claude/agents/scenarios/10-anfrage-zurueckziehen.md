# Szenario 10: Anfrage zurueckziehen (Withdraw)

**Ziel:** Pruefen ob Agentur eine pending Anfrage zurueckziehen kann.

## Vorbedingungen
- Agentur hat Anfrage gesendet
- Freelancer hat noch NICHT bestaetigt (status = pending)

## Schritte

### Schritt 1: Agentur erstellt Option
**Agent:** agentur1
**Aktion:** Erstelle Option fuer Anna, 28.-30. Januar

**Erwartung:**
- Status: option_pending
- Anfrage bei Freelancer sichtbar

---

### Schritt 2: Agentur zieht zurueck
**Agent:** agentur1
**Aktion:** Klicke "Zurueckziehen" bei der pending Anfrage

**Erwartung:**
- Status wechselt zu `withdrawn`
- Buchung verschwindet aus aktiver Liste
- Kalender: Tage werden frei

---

### Schritt 3: Freelancer-Pruefung
**Agent:** freelancer1
**Aktion:** Pruefe Dashboard

**Erwartung:**
- Anfrage NICHT mehr in "Ausstehend"
- Optional: Notification "Anfrage zurueckgezogen"
- Kalender zeigt Tage als frei

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 2 | Status | withdrawn |
| 2 | Aus aktiver Liste entfernt | Ja |
| 3 | Bei Freelancer verschwunden | Ja |

## Wichtig

- Nur PENDING Buchungen koennen zurueckgezogen werden
- CONFIRMED Buchungen muessen STORNIERT werden (anderer Flow)
- withdrawn ist ein terminal Status (wie declined, cancelled)
