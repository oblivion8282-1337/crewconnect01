# Szenario 19: Stornierung einer Pending-Buchung

**Ziel:** Klaeren was mit pending Buchungen passiert - Stornieren vs. Zurueckziehen.

## Konzept-Klaerung

| Aktion | Anwendbar auf | Ergebnis |
|--------|---------------|----------|
| Zurueckziehen (withdraw) | pending | withdrawn |
| Stornieren (cancel) | confirmed | cancelled |
| Ablehnen (decline) | pending (Freelancer) | declined |

## Schritte

### Schritt 1: Agentur versucht pending zu stornieren
**Agent:** agentur1
**Aktion:**
1. Erstelle Option (status = option_pending)
2. Klicke auf "Stornieren"

**Erwartung (Variante A - Blockiert):**
- Fehlermeldung: "Pending Buchungen koennen nicht storniert werden"
- Hinweis: "Bitte 'Zurueckziehen' verwenden"
- Button "Stornieren" ist disabled/nicht sichtbar

**Erwartung (Variante B - Automatisch Withdraw):**
- System fuehrt automatisch "Zurueckziehen" aus
- Status wird zu `withdrawn`

---

### Schritt 2: Korrekte Aktion - Zurueckziehen
**Agent:** agentur1
**Aktion:** Klicke auf "Zurueckziehen" bei pending Buchung

**Erwartung:**
- Status wechselt zu `withdrawn`
- Buchung aus aktiver Liste entfernt
- Freelancer erhaelt Notification

---

### Schritt 3: Freelancer versucht pending zu stornieren
**Agent:** freelancer1
**Aktion:** Versuche pending Anfrage zu "stornieren"

**Erwartung:**
- Freelancer sieht nur "Bestaetigen" und "Ablehnen"
- KEIN "Stornieren" Button bei pending
- Ablehnen = decline (korrekte Aktion)

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 1 | Stornieren bei pending | Nicht moeglich/Redirect |
| 2 | Zurueckziehen | withdrawn |
| 3 | Freelancer-Optionen | Nur Accept/Decline |

## UI-Erwartungen

### Agentur-Ansicht bei PENDING:
- "Zurueckziehen" Button sichtbar
- "Stornieren" Button NICHT sichtbar oder disabled

### Agentur-Ansicht bei CONFIRMED:
- "Stornieren" Button sichtbar
- "Zurueckziehen" NICHT sichtbar

### Freelancer-Ansicht bei PENDING:
- "Bestaetigen" Button
- "Ablehnen" Button
- KEIN "Stornieren"

### Freelancer-Ansicht bei CONFIRMED:
- "Stornieren" Button (kann auch stornieren)
