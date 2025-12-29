# Szenario 05: Verschiebungsanfrage

**Ziel:** Prüfen ob Verschiebungen korrekt funktionieren.

## Vorbedingungen
- Bestätigte Buchung existiert (option_confirmed oder fix_confirmed)
- Neue gewünschte Tage sind frei

## Schritte

### Schritt 1: Verschiebung anfragen
**Agent:** agentur1
**Aktion:**
1. Öffne bestätigte Buchung (z.B. 15.-17. Januar)
2. Klicke "Verschieben"
3. Wähle neue Tage: 22.-24. Januar

**Erwartung:**
- Buchung bekommt `reschedule` Objekt:
  ```javascript
  reschedule: {
    originalDates: ['2025-01-15', '2025-01-16', '2025-01-17'],
    newDates: ['2025-01-22', '2025-01-23', '2025-01-24'],
    newTotalCost: 2400
  }
  ```
- Status bleibt unverändert (immer noch confirmed)

---

### Schritt 2: Freelancer sieht Verschiebung
**Agent:** freelancer1
**Aktion:** Öffne Dashboard, Tab "Verschiebungen"

**Erwartung:**
- Verschiebungsanfrage sichtbar
- Alte Tage durchgestrichen: ~~15.-17. Januar~~
- Neue Tage hervorgehoben: 22.-24. Januar
- Buttons: "Verschiebung bestätigen" / "Ablehnen"

---

### Schritt 3: Freelancer bestätigt Verschiebung
**Agent:** freelancer1
**Aktion:** Klicke "Verschiebung bestätigen"

**Erwartung:**
- `dates` Array wird aktualisiert auf neue Tage
- `reschedule` Objekt wird entfernt
- Kalender: Alte Tage frei (🟢), neue Tage gebucht (🟡/🔴)
- Kosten neu berechnet falls Anzahl Tage geändert

---

### Schritt 4: Validierung
**Agent:** supervisor (oder agentur1)
**Aktion:** Prüfe finale Buchung

**Erwartung:**
- dates = ['2025-01-22', '2025-01-23', '2025-01-24']
- reschedule = null/undefined
- Kalender korrekt aktualisiert

---

## Erfolgs-Kriterien

| Schritt | Prüfpunkt | Erwartet |
|---------|-----------|----------|
| 1 | reschedule Objekt erstellt | Ja |
| 1 | Status unverändert | confirmed bleibt |
| 2 | Alte Tage durchgestrichen | Ja |
| 3 | dates aktualisiert | Neue Tage |
| 3 | reschedule entfernt | Ja |

## Variante: Verschiebung ablehnen

Wenn Freelancer ablehnt:
- `reschedule` Objekt wird entfernt
- `dates` bleibt unverändert (alte Tage)
- Keine Status-Änderung
