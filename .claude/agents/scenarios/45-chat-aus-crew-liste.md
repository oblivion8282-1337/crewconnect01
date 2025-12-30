# Testszenario 45: Chat aus Crew-Liste öffnen

## Übersicht
Agentur öffnet einen Chat direkt aus der "Meine Crew" Seite über den Chat-Button bei einem Freelancer.

## Voraussetzung
- Freelancer ist in Favoriten oder einer Crew-Liste

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Öffnet Chat aus Crew |
| freelancer1 | Anna Schmidt | In Crew-Liste |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Schritt 1: Meine Crew öffnen
**Agent:** agentur1
**Aktion:** Klicke auf "Meine Crew" in der Sidebar
**Erwartung:**
- CrewListsPage wird angezeigt
- Favoriten-Sektion mit Anna Schmidt sichtbar
- Chat-Button (MessageSquare-Icon) bei jedem Freelancer

### Schritt 2: Chat-Button klicken
**Agent:** agentur1
**Aktion:** Klicke auf den Chat-Button bei Anna Schmidt
**Erwartung:**
- Ansicht wechselt zu "Nachrichten"
- ChatView öffnet sich
- Header zeigt "Anna Schmidt"

### Schritt 3: Nachricht senden
**Agent:** agentur1
**Aktion:** Tippe "Hi Anna, ich wollte kurz wegen dem nächsten Projekt sprechen." und sende
**Erwartung:**
- Nachricht erscheint im Chat
- Chat wird in ChatList angezeigt

### Schritt 4: Freelancer empfängt
**Agent:** freelancer1
**Aktion:** Prüfe Nachrichten in der Sidebar
**Erwartung:**
- Unread-Badge zeigt "1"
- ChatList zeigt neuen Chat

---

## Supervisor-Validierung

### Datenintegrität
- [ ] Chat wird korrekt erstellt (getOrCreateChat)
- [ ] Wenn Chat existiert, wird er wiederverwendet
- [ ] agencyId und freelancerId korrekt gesetzt

### UI-Validierung
- [ ] Chat-Button ist bei jedem Freelancer sichtbar
- [ ] Hover-Effekt auf Button
- [ ] Navigation zu Messages funktioniert
- [ ] Korrekter Chat wird geöffnet

### Workflow
```
Meine Crew → Chat-Button → Messages View → ChatView
```

---

## Erwartetes Ergebnis
Direkte Chat-Funktion aus der Crew-Übersicht ermöglicht schnelle Kommunikation mit bekannten Freelancern.
