# Szenario 02: Option zu Fix umwandeln

**Ziel:** Prüfen ob Option→Fix OHNE erneute Freelancer-Bestätigung funktioniert.

## Vorbedingungen
- Buchung mit status = `option_confirmed` existiert
- (Führe zuerst Szenario 01 aus)

## Schritte

### Schritt 1: Ausgangslage prüfen
**Agent:** agentur1
**Aktion:** Prüfe bestätigte Option in Buchungsübersicht

**Erwartung:**
- Buchung mit status = `option_confirmed`
- Kalender zeigt 🟡 Gelb
- Button "Fix" ist sichtbar

---

### Schritt 2: Fix-Umwandlung
**Agent:** agentur1
**Aktion:** Klicke Button "Fix" bei der bestätigten Option

**Erwartung:**
- Status wechselt DIREKT zu `fix_confirmed` (KEINE Pending-Phase!)
- Kalender wechselt von 🟡 Gelb zu 🔴 Rot
- Freelancer wird NICHT um Bestätigung gebeten

---

### Schritt 3: Freelancer-Prüfung
**Agent:** freelancer1
**Aktion:** Prüfe Dashboard

**Erwartung:**
- KEINE neue Anfrage im "Ausstehend" Tab
- Buchung erscheint weiterhin in "Bestätigt"
- Kalender zeigt 🔴 Rot für die gebuchten Tage

---

## Erfolgs-Kriterien

| Schritt | Prüfpunkt | Erwartet |
|---------|-----------|----------|
| 1 | Ausgangsstatus | option_confirmed |
| 2 | Status nach Fix | fix_confirmed (DIREKT!) |
| 2 | Kalenderfarbe | 🔴 Rot |
| 3 | Neue Anfrage bei Freelancer | NEIN |

## Kritischer Fehler

⚠️ **WENN** der Status zu `fix_pending` wechselt **STATT** `fix_confirmed`:
- Das ist ein Fehler in `convertOptionToFix()`
- Die Funktion sollte DIREKT zu `fix_confirmed` wechseln
- Datei: `src/hooks/useBookings.js`
