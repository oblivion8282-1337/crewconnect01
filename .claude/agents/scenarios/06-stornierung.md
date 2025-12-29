# Szenario 06: Stornierung

**Ziel:** Prüfen ob Stornierungen korrekt funktionieren.

## Vorbedingungen
- Bestätigte Buchung existiert (option_confirmed oder fix_confirmed)

## Schritte

### Schritt 1: Stornierung durch Agentur
**Agent:** agentur1
**Aktion:**
1. Öffne bestätigte Buchung
2. Klicke "Stornieren"

**Erwartung:**
- Status wechselt zu `cancelled`
- Buchung verschwindet aus aktiver Liste
- Kalender: Tage werden wieder frei (🟢 Grün)

---

### Schritt 2: Freelancer sieht Stornierung
**Agent:** freelancer1
**Aktion:** Prüfe Dashboard und Kalender

**Erwartung:**
- Buchung nicht mehr in "Bestätigt" Tab
- Kalender zeigt die Tage als frei
- Optional: Benachrichtigung über Stornierung

---

## Alternative: Stornierung durch Freelancer

### Schritt A1: Freelancer storniert
**Agent:** freelancer1
**Aktion:**
1. Tab "Bestätigt" → Buchung finden
2. Klicke "Stornieren"

**Erwartung:**
- Status wechselt zu `cancelled`
- Tage werden frei

---

## Erfolgs-Kriterien

| Schritt | Prüfpunkt | Erwartet |
|---------|-----------|----------|
| 1 | Status nach Stornierung | cancelled |
| 1 | Tage im Kalender | 🟢 Grün (frei) |
| 2 | Buchung in aktiver Liste | Nein |

## Edge Case: Stornierung einer Fix-Buchung

Bei Fix-Buchungen könnte es:
- Stornierungsgebühren geben (nicht implementiert)
- Bestätigungsdialog geben
- In Historie erscheinen

Aktuell: Einfache Stornierung wie bei Option.
