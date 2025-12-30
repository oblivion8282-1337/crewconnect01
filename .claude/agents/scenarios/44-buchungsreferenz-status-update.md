# Testszenario 44: Buchungsreferenz Status-Update

## Übersicht
Wenn sich der Status einer Buchung ändert (bestätigt, abgelehnt, etc.), wird die Buchungsreferenz im Chat automatisch aktualisiert.

## Voraussetzung
- Szenario 43 wurde durchgeführt (Buchung mit Referenz im Chat existiert)

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| freelancer1 | Anna Schmidt | Bestätigt Buchung |
| agentur1 | Bluescreen Productions | Sieht Status-Update |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Schritt 1: Buchung im Dashboard bestätigen
**Agent:** freelancer1
**Aktion:** Gehe zu Dashboard > Buchungsanfragen > Bestätige die Option
**Erwartung:**
- Buchung wechselt zu Status "option_confirmed"
- Notification wird erstellt

### Schritt 2: Chat-Referenz prüfen (Freelancer)
**Agent:** freelancer1
**Aktion:** Öffne den Chat mit Bluescreen Productions
**Erwartung:**
- Buchungsreferenz-Karte zeigt aktualisierten Status
- Status-Badge: "Option bestätigt" (gelb)

### Schritt 3: Agentur prüft Chat
**Agent:** agentur1
**Aktion:** Öffne den Chat mit Anna Schmidt
**Erwartung:**
- Buchungsreferenz-Karte zeigt "Option bestätigt"
- "Zur Buchung" Button navigiert zur Buchungsübersicht

### Schritt 4: Option zu Fix umwandeln
**Agent:** agentur1
**Aktion:** Gehe zu Buchungen > Klicke "Zu Fix umwandeln"
**Erwartung:**
- Buchung wechselt zu "fix_pending"
- Notification für Freelancer

### Schritt 5: Fix bestätigen
**Agent:** freelancer1
**Aktion:** Bestätige die Fix-Anfrage im Dashboard
**Erwartung:** Buchung wechselt zu "fix_confirmed"

### Schritt 6: Finaler Status im Chat
**Agent:** agentur1
**Aktion:** Prüfe die Buchungsreferenz im Chat
**Erwartung:**
- Status-Badge: "Fix bestätigt" (grün)
- Karte zeigt "Buchung (Fix)"

---

## Supervisor-Validierung

### Datenintegrität
- [ ] bookingRef.status wird bei jeder Änderung aktualisiert
- [ ] updateBookingRefStatus() wird korrekt aufgerufen
- [ ] Alle Status-Übergänge sind korrekt

### Status-Übergänge
```
pending → option_confirmed → fix_pending → fix_confirmed
                ↓
            declined
```

### UI-Validierung
- [ ] Status-Badge ändert Farbe bei jedem Update
- [ ] Buchungsreferenz-Karte wird live aktualisiert
- [ ] Keine neue Nachricht bei Status-Update (nur Karten-Update)

### Status-Farben
| Status | Farbe |
|--------|-------|
| pending / option_pending | Lila |
| option_confirmed | Gelb |
| fix_pending | Lila |
| fix_confirmed | Grün |
| declined | Rot |
| cancelled | Grau |

---

## Erwartetes Ergebnis
Der Buchungsstatus in der Chat-Referenz wird automatisch synchronisiert, wenn sich der tatsächliche Buchungsstatus ändert.
