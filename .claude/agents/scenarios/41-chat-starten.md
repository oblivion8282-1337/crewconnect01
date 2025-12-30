# Testszenario 41: Chat starten - Agentur kontaktiert Freelancer

## Übersicht
Eine Agentur startet einen neuen Chat mit einem Freelancer über die Freelancer-Profilansicht.

## Voraussetzung
- Agentur ist eingeloggt
- Freelancer existiert im System

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Startet Chat |
| freelancer1 | Anna Schmidt | Empfängt Nachricht |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Schritt 1: Freelancer-Suche öffnen
**Agent:** agentur1
**Aktion:** Klicke auf "Freelancer" in der Sidebar
**Erwartung:** AgencyFreelancerSearch wird angezeigt

### Schritt 2: Freelancer-Profil öffnen
**Agent:** agentur1
**Aktion:** Klicke auf Anna Schmidt in der Suchergebnisliste
**Erwartung:**
- FreelancerProfileView öffnet sich
- Chat-Button (MessageCircle-Icon) ist sichtbar

### Schritt 3: Chat starten
**Agent:** agentur1
**Aktion:** Klicke auf den Chat-Button (blaues Icon)
**Erwartung:**
- Ansicht wechselt zu "Nachrichten"
- ChatView öffnet sich mit leerem Chat
- Header zeigt "Anna Schmidt"

### Schritt 4: Erste Nachricht senden
**Agent:** agentur1
**Aktion:** Tippe "Hallo Anna, wir suchen eine DoP für ein Projekt im Januar." und klicke Senden
**Erwartung:**
- Nachricht erscheint als eigene Nachricht (rechtsbündig)
- MessageBubble zeigt Text und Zeitstempel
- Chat wird in der ChatList angezeigt

### Schritt 5: Freelancer prüft Nachrichten
**Agent:** freelancer1
**Aktion:** Klicke auf "Nachrichten" in der Sidebar
**Erwartung:**
- Unread-Badge zeigt "1"
- ChatList zeigt Eintrag "Bluescreen Productions"
- Preview zeigt Nachrichtenvorschau

### Schritt 6: Freelancer öffnet Chat
**Agent:** freelancer1
**Aktion:** Klicke auf den Chat mit Bluescreen Productions
**Erwartung:**
- ChatView öffnet sich
- Nachricht von Agentur wird angezeigt (linksbündig)
- Unread-Badge verschwindet

---

## Supervisor-Validierung

### Datenintegrität
- [ ] Chat wurde erstellt mit korrekten IDs (agencyId, freelancerId)
- [ ] Message-Objekt enthält: id, type='text', text, senderType='agency', senderId, senderName, createdAt
- [ ] Chat.lastMessageAt wurde aktualisiert
- [ ] unreadCountFreelancer = 1 (vor dem Öffnen)

### UI-Validierung
- [ ] Chat-Button auf Profil funktioniert
- [ ] Nachricht wird korrekt formatiert angezeigt
- [ ] Zeitstempel im richtigen Format
- [ ] Unread-Badge in Sidebar aktualisiert

### Message-Struktur
```javascript
{
  id: string,
  type: 'text',
  text: 'Hallo Anna...',
  senderType: 'agency',
  senderId: 1,
  senderName: 'Bluescreen Productions',
  createdAt: ISO-String
}
```

---

## Erwartetes Ergebnis
Ein neuer Chat zwischen Agentur und Freelancer wird erstellt. Die erste Nachricht wird korrekt übermittelt und angezeigt.
