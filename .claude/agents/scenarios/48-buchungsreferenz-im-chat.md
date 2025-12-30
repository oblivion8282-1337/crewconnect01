# Testszenario 48: Buchungsreferenz im Chat

## Übersicht
Nach Erstellung einer Buchung wird automatisch eine Buchungsreferenz-Nachricht im Chat angezeigt. Diese verlinkt zur Buchung und zeigt den aktuellen Status.

## Voraussetzung
- Chat zwischen Agentur und Freelancer existiert

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Erstellt Buchung |
| freelancer1 | Anna Schmidt | Sieht Buchungsreferenz |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Schritt 1: Buchung erstellen
**Agent:** agentur1
**Aktion:** Erstelle Option-Buchung für Anna Schmidt (25.-27. Januar) aus Freelancer-Profil oder Chat
**Erwartung:** Buchung wird erstellt mit Status "pending"

### Schritt 2: Chat prüfen
**Agent:** agentur1
**Aktion:** Öffne den Chat mit Anna Schmidt
**Erwartung:**
- Buchungsreferenz-Nachricht erscheint automatisch
- Karte zeigt: Projektname, Zeitraum, Typ, Status

### Schritt 3: Buchungsreferenz-Details prüfen
**Agent:** agentur1
**Aktion:** Prüfe die Buchungsreferenz-Karte
**Erwartung:**
- Header: "BUCHUNGSANFRAGE" mit FileText-Icon
- Projekt: "Werbespot Mercedes 2025"
- Zeitraum: "25. Jan – 27. Jan 2025 (3 Tage)"
- Status-Badge: "Ausstehend" (lila)
- Typ-Badge: "Option" (gelb)
- "Zur Buchung" Button

### Schritt 4: Freelancer sieht Referenz
**Agent:** freelancer1
**Aktion:** Öffne den Chat mit Bluescreen Productions
**Erwartung:**
- Buchungsreferenz-Nachricht ist sichtbar
- "Zur Buchung" Button navigiert zum Dashboard

### Schritt 5: Buchung bestätigen
**Agent:** freelancer1
**Aktion:** Klicke "Zur Buchung" → Bestätige im Dashboard
**Erwartung:** Buchungsstatus wechselt zu "option_confirmed"

### Schritt 6: Status-Update im Chat
**Agent:** freelancer1
**Aktion:** Prüfe die Buchungsreferenz im Chat erneut
**Erwartung:**
- Status-Badge zeigt "Option bestätigt" (gelb)
- Karte wurde automatisch aktualisiert

---

## Supervisor-Validierung

### Datenintegrität
- [ ] Message.type = 'booking_ref'
- [ ] bookingRef enthält: bookingId, projectName, dates, status, type
- [ ] Status wird bei Buchungsänderung synchronisiert

### UI-Validierung
- [ ] Buchungsreferenz als spezielle Karte (nicht als Bubble)
- [ ] Blauer Header mit Icon
- [ ] Projekt-Info klar strukturiert
- [ ] Kalender-Icon mit Datum
- [ ] Status- und Typ-Badges
- [ ] "Zur Buchung" Button prominent

### Message-Struktur
```javascript
{
  id: 'msg-xxx',
  type: 'booking_ref',
  text: 'Neue Buchungsanfrage',
  senderType: 'agency',
  senderId: 1,
  senderName: 'Bluescreen Productions',
  createdAt: '2025-01-28T10:00:00Z',
  readAt: null,
  bookingRef: {
    bookingId: 123,
    projectName: 'Werbespot Mercedes 2025',
    dates: ['2025-01-25', '2025-01-26', '2025-01-27'],
    status: 'pending',
    type: 'option'
  }
}
```

### Status-Farben
| Status | Badge-Farbe |
|--------|-------------|
| pending | Lila |
| option_confirmed | Gelb |
| fix_pending | Lila |
| fix_confirmed | Grün |
| declined | Rot |
| cancelled | Grau |

---

## Erwartetes Ergebnis
Buchungen werden automatisch als Referenz im Chat dokumentiert. Beide Parteien sehen den aktuellen Status und können direkt zur Buchung navigieren.
