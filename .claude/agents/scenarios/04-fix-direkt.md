# Szenario 04: Direkte Fix-Buchung

**Ziel:** Prüfen ob eine direkte Fix-Buchung (ohne Option-Vorstufe) funktioniert.

## Vorbedingungen
- Anna Schmidt hat freie Tage
- Keine Konflikte

## Schritte

### Schritt 1: Fix-Buchung erstellen
**Agent:** agentur1
**Aktion:** Erstelle FIX-Buchung (nicht Option!) für Anna, 20.-22. Januar

**Erwartung:**
- Buchung erstellt mit status = `fix_pending`
- Kalender zeigt 🟣 Lila (pending = immer Lila)
- Kosten = 3 × 800€ = 2.400€

---

### Schritt 2: Freelancer sieht Fix-Anfrage
**Agent:** freelancer1
**Aktion:** Prüfe Dashboard

**Erwartung:**
- Anfrage zeigt "Fix-Anfrage" (nicht "Option")
- Button "Fix bestätigen" vorhanden (nicht "Option bestätigen")
- Hinweis dass dies eine verbindliche Buchung ist

---

### Schritt 3: Freelancer bestätigt Fix
**Agent:** freelancer1
**Aktion:** Klicke "Fix bestätigen"

**Erwartung:**
- Status wechselt zu `fix_confirmed`
- Kalender wechselt von 🟣 Lila zu 🔴 Rot
- Buchung erscheint in "Bestätigt" als Fix

---

### Schritt 4: Agentur sieht Bestätigung
**Agent:** agentur1
**Aktion:** Prüfe Buchungsübersicht

**Erwartung:**
- Buchung zeigt "Fix bestätigt"
- KEIN "Fix" Button (ist ja schon Fix)
- "Verschieben" und "Stornieren" verfügbar

---

## Erfolgs-Kriterien

| Schritt | Prüfpunkt | Erwartet |
|---------|-----------|----------|
| 1 | Initialer Status | fix_pending |
| 1 | Kalenderfarbe | 🟣 Lila |
| 3 | Status nach Bestätigung | fix_confirmed |
| 3 | Kalenderfarbe | 🔴 Rot |

## Unterschied zu Option-Flow

```
Option-Flow:  option_pending → option_confirmed → fix_confirmed
Fix-Flow:     fix_pending → fix_confirmed
```

Die direkte Fix-Buchung überspringt die Option-Phase.
