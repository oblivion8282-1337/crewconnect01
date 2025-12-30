# Testszenario 50: Kompletter Nachrichten-Workflow

## Übersicht
End-to-End Test des Messaging-Systems: Von der ersten Kontaktaufnahme über die Buchung bis zur Bestätigung.

## Voraussetzung
- Agentur und Freelancer existieren
- Projekt existiert

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Initiiert Kommunikation |
| freelancer1 | Anna Schmidt | Antwortet und bestätigt |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Phase 1: Erstkontakt

#### Schritt 1.1: Chat starten
**Agent:** agentur1
**Aktion:** Freelancer-Suche → Anna Schmidt → Chat-Button
**Erwartung:** ChatView öffnet sich

#### Schritt 1.2: Erste Nachricht
**Agent:** agentur1
**Aktion:** Sende "Hallo Anna! Wir planen einen Werbespot im Januar. Hätten Sie Interesse?"
**Erwartung:** Nachricht wird angezeigt

#### Schritt 1.3: Freelancer antwortet
**Agent:** freelancer1
**Aktion:** Öffne Chat, sende "Hallo! Klingt interessant. Was sind die Details?"
**Erwartung:** Dialog entwickelt sich

### Phase 2: Buchung

#### Schritt 2.1: Buchung aus Chat
**Agent:** agentur1
**Aktion:** Klicke Buchungs-Button → Wähle Projekt/Phase/Tage → Option anfragen
**Erwartung:**
- Modal öffnet sich
- Buchung wird erstellt
- Buchungsreferenz erscheint im Chat

#### Schritt 2.2: Referenz prüfen
**Agent:** freelancer1
**Aktion:** Prüfe Buchungsreferenz im Chat
**Erwartung:**
- Karte zeigt Projektdetails
- Status: "Ausstehend"
- "Zur Buchung" Button

### Phase 3: Bestätigung

#### Schritt 3.1: Zur Buchung navigieren
**Agent:** freelancer1
**Aktion:** Klicke "Zur Buchung" in der Referenz-Karte
**Erwartung:** Navigation zu Buchungen/Dashboard

#### Schritt 3.2: Buchung bestätigen
**Agent:** freelancer1
**Aktion:** Bestätige die Option im Dashboard
**Erwartung:** Status wechselt zu "option_confirmed"

#### Schritt 3.3: Status im Chat prüfen
**Agent:** agentur1
**Aktion:** Öffne Chat mit Anna
**Erwartung:**
- Buchungsreferenz zeigt "Option bestätigt" (gelb)
- Text-Nachrichten weiterhin sichtbar

### Phase 4: Follow-Up

#### Schritt 4.1: Weitere Kommunikation
**Agent:** agentur1
**Aktion:** Sende "Super, danke! Ich schicke dir die Details per E-Mail."
**Erwartung:** Nachricht erscheint nach der Buchungsreferenz

#### Schritt 4.2: Freelancer bestätigt
**Agent:** freelancer1
**Aktion:** Sende "Perfekt, ich freue mich auf die Zusammenarbeit!"
**Erwartung:** Dialog ist komplett

---

## Supervisor-Validierung

### Workflow-Checkpoints
- [ ] Chat wurde korrekt erstellt
- [ ] Textnachrichten funktionieren bidirektional
- [ ] Buchungs-Button öffnet korrektes Modal
- [ ] Buchungsreferenz wird automatisch gesendet
- [ ] "Zur Buchung" Navigation funktioniert
- [ ] Status-Update synchronisiert im Chat
- [ ] Weitere Nachrichten nach Buchung möglich

### Datenintegrität
- [ ] Chat enthält: text + booking_ref Nachrichten
- [ ] bookingRef.status = 'option_confirmed' am Ende
- [ ] Unread-Counts korrekt aktualisiert
- [ ] lastMessageAt entspricht letzter Nachricht

### Nachrichten-Reihenfolge
```
1. [TEXT] Agentur: "Hallo Anna!..."
2. [TEXT] Freelancer: "Hallo! Klingt..."
3. [BOOKING_REF] Buchungsanfrage (Agentur)
4. [TEXT] Agentur: "Super, danke!..."
5. [TEXT] Freelancer: "Perfekt, ich..."
```

### UI-Validierung
- [ ] Nachrichten chronologisch sortiert
- [ ] Booking-Ref als Karte, Text als Bubbles
- [ ] Datum-Separator bei Tageswechsel
- [ ] Auto-Scroll zu neuester Nachricht

---

## Erwartetes Ergebnis
Ein vollständiger Kommunikations- und Buchungs-Workflow funktioniert nahtlos. Text-Nachrichten und Buchungsreferenzen werden korrekt gemischt angezeigt.
