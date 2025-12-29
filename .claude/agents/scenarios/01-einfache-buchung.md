# Szenario 01: Einfache Option-Buchung

**Ziel:** Prüfen ob der grundlegende Buchungs-Flow funktioniert.

## Vorbedingungen
- Keine aktiven Buchungen für Anna Schmidt
- Agentur 1 (Bluescreen) hat Projekt "Werbespot Mercedes 2025"

## Schritte

### Schritt 1: Agentur erstellt Option
**Agent:** agentur1
**Aktion:** Erstelle Option-Buchung für Anna Schmidt, 15.-17. Januar, Projekt "Werbespot Mercedes", Phase "Drehphase"

**Erwartung:**
- Buchung erstellt mit status = `option_pending`
- Kalender zeigt 🟣 Lila für 15., 16., 17. Januar
- Kosten = 3 Tage × 800€ = 2.400€

---

### Schritt 2: Freelancer sieht Anfrage
**Agent:** freelancer1
**Aktion:** Prüfe Dashboard "Ausstehend" Tab

**Erwartung:**
- Anfrage von Bluescreen Productions sichtbar
- Projekt: "Werbespot Mercedes 2025"
- Tage: 15.-17. Januar
- Betrag: 2.400€
- Button "Option bestätigen" vorhanden

---

### Schritt 3: Freelancer bestätigt
**Agent:** freelancer1
**Aktion:** Klicke "Option bestätigen"

**Erwartung:**
- Status wechselt zu `option_confirmed`
- Kalender wechselt von 🟣 Lila zu 🟡 Gelb
- Buchung verschwindet aus "Ausstehend", erscheint in "Bestätigt"

---

### Schritt 4: Agentur sieht Bestätigung
**Agent:** agentur1
**Aktion:** Prüfe Buchungsübersicht

**Erwartung:**
- Buchung zeigt status = `option_confirmed`
- Button "Fix" ist verfügbar
- Button "Verschieben" ist verfügbar

---

## Erfolgs-Kriterien

| Schritt | Prüfpunkt | Erwartet |
|---------|-----------|----------|
| 1 | Status nach Erstellung | option_pending |
| 1 | Kalenderfarbe | 🟣 Lila |
| 1 | Kostenberechnung | 2.400€ |
| 3 | Status nach Bestätigung | option_confirmed |
| 3 | Kalenderfarbe | 🟡 Gelb |

## Mögliche Fehler

- **LOGIK:** Status bleibt `pending` nach Bestätigung
- **UI:** Kalender zeigt falsche Farbe
- **DATEN:** Kosten falsch berechnet
