# Testszenario 49: Chat-Liste verwalten

## Übersicht
Überblick über alle Chats, Unread-Badges, Sortierung und Navigation zwischen verschiedenen Chats.

## Voraussetzung
- Mehrere Chats existieren (Szenarien 41, 42 durchgeführt)

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Verwaltet Chats |
| freelancer1 | Anna Schmidt | Chat-Partner |
| freelancer2 | Max Weber | Weiterer Chat-Partner |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Schritt 1: Chat-Liste öffnen
**Agent:** agentur1
**Aktion:** Klicke auf "Nachrichten" in der Sidebar
**Erwartung:**
- ChatList wird angezeigt
- Alle Chats sind aufgelistet
- Sortiert nach letzter Nachricht (neueste oben)

### Schritt 2: Unread-Badge prüfen
**Agent:** agentur1
**Aktion:** Prüfe Sidebar und Chat-Einträge
**Erwartung:**
- Sidebar zeigt Gesamt-Unread-Count
- Einzelne Chats zeigen jeweiligen Unread-Count
- Chat-Preview zeigt letzte Nachricht

### Schritt 3: Neuen Chat mit Max starten
**Agent:** agentur1
**Aktion:** Gehe zu Freelancer-Suche → Max Weber → Chat-Button
**Erwartung:**
- Neuer Chat wird erstellt
- ChatView öffnet sich
- Header zeigt "Max Weber"

### Schritt 4: Nachricht an Max senden
**Agent:** agentur1
**Aktion:** Sende "Hi Max, bist du nächsten Monat verfügbar?"
**Erwartung:** Nachricht erscheint im Chat

### Schritt 5: Zurück zur Chat-Liste
**Agent:** agentur1
**Aktion:** Klicke Zurück-Button
**Erwartung:**
- ChatList wird angezeigt
- Max Weber Chat ist jetzt oben (neueste Aktivität)
- Anna Schmidt Chat darunter

### Schritt 6: Zwischen Chats wechseln
**Agent:** agentur1
**Aktion:** Klicke auf Anna Schmidt Chat
**Erwartung:**
- ChatView mit Anna öffnet sich
- Vorherige Nachrichten sind sichtbar
- Unread-Count für diesen Chat wird 0

### Schritt 7: Freelancer-Ansicht prüfen
**Agent:** freelancer2
**Aktion:** Öffne Nachrichten als Max Weber
**Erwartung:**
- ChatList zeigt Chat mit Bluescreen Productions
- Unread-Badge zeigt "1"
- Preview zeigt "Hi Max, bist du..."

---

## Supervisor-Validierung

### Datenintegrität
- [ ] Chats sind nach lastMessageAt sortiert
- [ ] Unread-Counts korrekt für beide Seiten
- [ ] Chat-Erstellung funktioniert korrekt

### UI-Validierung
- [ ] ChatList zeigt Avatar, Name, Preview, Zeit
- [ ] Unread-Badge prominent sichtbar
- [ ] Sortierung aktualisiert bei neuer Nachricht
- [ ] Zurück-Navigation funktioniert

### Chat-Eintrag Struktur
```
[Avatar] Name                    Zeit
         Letzte Nachricht...  [Badge]
```

---

## Erwartetes Ergebnis
Die Chat-Liste bietet einen klaren Überblick über alle Konversationen mit korrekten Unread-Counts und intuitiver Navigation.
