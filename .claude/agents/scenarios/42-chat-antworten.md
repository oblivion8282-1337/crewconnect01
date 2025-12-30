# Testszenario 42: Chat - Freelancer antwortet

## Übersicht
Freelancer antwortet auf eine Nachricht der Agentur. Der Dialog entwickelt sich.

## Voraussetzung
- Szenario 41 wurde durchgeführt (Chat existiert)

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| freelancer1 | Anna Schmidt | Antwortet auf Nachricht |
| agentur1 | Bluescreen Productions | Empfängt Antwort |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Schritt 1: Chat öffnen (falls nicht schon offen)
**Agent:** freelancer1
**Aktion:** Öffne den Chat mit Bluescreen Productions
**Erwartung:** ChatView zeigt vorherige Nachricht

### Schritt 2: Antwort schreiben
**Agent:** freelancer1
**Aktion:** Tippe "Hallo! Klingt interessant. Um welches Projekt geht es genau?" und klicke Senden
**Erwartung:**
- Nachricht erscheint als eigene Nachricht (rechtsbündig)
- Chat wird aktualisiert

### Schritt 3: Weitere Nachricht senden
**Agent:** freelancer1
**Aktion:** Tippe "Ich hätte im Januar noch einige freie Tage." und drücke Enter
**Erwartung:**
- Zweite Nachricht erscheint direkt unter der ersten
- Nachrichten werden ohne erneuten Absender-Header gruppiert

### Schritt 4: Agentur prüft Nachrichten
**Agent:** agentur1
**Aktion:** Klicke auf "Nachrichten" in der Sidebar
**Erwartung:**
- Unread-Badge zeigt "2"
- Chat-Preview zeigt letzte Nachricht

### Schritt 5: Agentur öffnet Chat
**Agent:** agentur1
**Aktion:** Klicke auf den Chat mit Anna Schmidt
**Erwartung:**
- Alle 3 Nachrichten werden angezeigt
- Nachrichten nach Datum gruppiert
- Scroll-Position ist am Ende (neueste Nachricht)

### Schritt 6: Agentur antwortet
**Agent:** agentur1
**Aktion:** Tippe "Es geht um einen Werbespot für Mercedes. Drehzeitraum wäre 15.-17. Januar." und sende
**Erwartung:**
- Nachricht erscheint im Chat
- unreadCountFreelancer wird erhöht

---

## Supervisor-Validierung

### Datenintegrität
- [ ] Chat.messages Array enthält 4 Nachrichten
- [ ] Nachrichten sind chronologisch sortiert
- [ ] Jede Nachricht hat korrekten senderType (freelancer/agency)
- [ ] lastMessageAt entspricht der neuesten Nachricht

### UI-Validierung
- [ ] Eigene Nachrichten rechtsbündig, fremde linksbündig
- [ ] Nachrichten-Gruppierung nach Zeit funktioniert
- [ ] Auto-Scroll zu neuesten Nachrichten
- [ ] Unread-Count wird korrekt gezählt

### Nachrichtenfluss
```
Agentur: "Hallo Anna..."
  ↓
Freelancer: "Hallo! Klingt interessant..."
Freelancer: "Ich hätte im Januar..."
  ↓
Agentur: "Es geht um einen Werbespot..."
```

---

## Erwartetes Ergebnis
Ein flüssiger Dialog entwickelt sich. Nachrichten werden korrekt zugeordnet und angezeigt. Unread-Counts werden für beide Seiten aktualisiert.
