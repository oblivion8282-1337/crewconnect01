# Testszenario 43: Buchung aus Chat erstellen

## Übersicht
Agentur erstellt eine Buchung direkt aus dem Chat heraus über den Buchungs-Button.

## Voraussetzung
- Chat zwischen Agentur und Freelancer existiert (Szenario 41/42)

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Erstellt Buchung aus Chat |
| freelancer1 | Anna Schmidt | Empfängt Buchungsanfrage |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Schritt 1: Chat öffnen
**Agent:** agentur1
**Aktion:** Öffne den Chat mit Anna Schmidt
**Erwartung:**
- ChatView wird angezeigt
- Grüner Buchungs-Button (CalendarPlus-Icon) ist links vom Textfeld sichtbar

### Schritt 2: Buchungs-Modal öffnen
**Agent:** agentur1
**Aktion:** Klicke auf den grünen Buchungs-Button
**Erwartung:**
- BookFromProfileModal öffnet sich
- Freelancer (Anna Schmidt) ist vorausgewählt
- Projekt- und Phasen-Auswahl verfügbar

### Schritt 3: Buchung konfigurieren
**Agent:** agentur1
**Aktion:**
- Projekt: "Werbespot Mercedes 2025" auswählen
- Phase: "Drehphase" auswählen
- Tage: 20., 21., 22. Januar markieren
- Typ: "Option"
**Erwartung:** Alle Felder sind ausgefüllt, Tagessatz wird angezeigt

### Schritt 4: Buchung absenden
**Agent:** agentur1
**Aktion:** Klicke "Option anfragen"
**Erwartung:**
- Modal schließt sich
- Buchung wird erstellt mit Status "pending"
- Buchungsreferenz-Nachricht erscheint automatisch im Chat

### Schritt 5: Freelancer sieht Buchungsreferenz
**Agent:** freelancer1
**Aktion:** Öffne den Chat mit Bluescreen Productions
**Erwartung:**
- Buchungsreferenz-Karte wird angezeigt
- Zeigt: Projektname, Zeitraum, "Option", Status "Ausstehend"
- "Zur Buchung" Button verfügbar

---

## Supervisor-Validierung

### Datenintegrität
- [ ] Buchung wurde erstellt mit korrekten Daten
- [ ] booking_ref Nachricht automatisch gesendet
- [ ] bookingRef.bookingId verweist auf echte Buchung
- [ ] Chat.messages enthält die neue Nachricht

### UI-Validierung
- [ ] Buchungs-Button ist grün (nicht lila wie alter Avail-Check)
- [ ] BookFromProfileModal öffnet sich korrekt
- [ ] Buchungsreferenz-Karte wird formatiert angezeigt
- [ ] Status-Badge zeigt "Ausstehend" (lila)

### Message-Struktur
```javascript
{
  id: string,
  type: 'booking_ref',
  text: 'Neue Buchungsanfrage',
  senderType: 'agency',
  senderId: 1,
  senderName: 'Bluescreen Productions',
  createdAt: ISO-String,
  bookingRef: {
    bookingId: number,
    projectName: 'Werbespot Mercedes 2025',
    dates: ['2025-01-20', '2025-01-21', '2025-01-22'],
    status: 'pending',
    type: 'option'
  }
}
```

---

## Erwartetes Ergebnis
Die Agentur kann direkt aus dem Chat eine Buchung erstellen. Die Buchungsreferenz wird automatisch als spezielle Nachricht im Chat angezeigt.
