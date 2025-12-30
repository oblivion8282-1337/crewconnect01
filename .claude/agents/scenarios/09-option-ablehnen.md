# Szenario 09: Option ablehnen

**Ziel:** Pruefen ob Freelancer eine Option korrekt ablehnen kann.

## Vorbedingungen
- Agentur hat Option-Anfrage gesendet
- Status: option_pending

## Schritte

### Schritt 1: Agentur erstellt Option
**Agent:** agentur1
**Aktion:** Erstelle Option fuer Anna, 25.-27. Januar

**Erwartung:**
- Status: option_pending
- Kalender: Lila

---

### Schritt 2: Freelancer sieht Anfrage
**Agent:** freelancer1
**Aktion:** Oeffne Dashboard "Ausstehend"

**Erwartung:**
- Anfrage sichtbar
- Buttons: "Bestaetigen" UND "Ablehnen"

---

### Schritt 3: Freelancer lehnt ab
**Agent:** freelancer1
**Aktion:** Klicke "Ablehnen"

**Erwartung:**
- Status wechselt zu `declined`
- Buchung verschwindet aus aktiver Liste
- Kalender: Tage werden wieder GRUEN (frei)
- Agentur erhaelt Benachrichtigung

---

### Schritt 4: Agentur sieht Ablehnung
**Agent:** agentur1
**Aktion:** Pruefe Buchungsuebersicht und Notifications

**Erwartung:**
- Notification: "Option wurde abgelehnt"
- Buchung nicht mehr in aktiver Liste
- Optional: In Historie sichtbar

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 3 | Status nach Ablehnung | declined |
| 3 | Kalender | Gruen (frei) |
| 4 | Agentur benachrichtigt | Ja |

## Unterschied zu Stornierung

- **Ablehnung:** Freelancer lehnt PENDING Anfrage ab
- **Stornierung:** Bereits CONFIRMED Buchung wird gecancelt
