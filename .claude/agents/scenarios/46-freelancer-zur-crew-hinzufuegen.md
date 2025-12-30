# Testszenario 46: Freelancer zur Crew hinzufügen

## Übersicht
Agentur nutzt das "Freelancer hinzufügen" Modal, um neue Freelancer zu suchen und zur Crew (Favoriten oder Liste) hinzuzufügen.

## Voraussetzung
- Agentur ist eingeloggt
- Crew-Listen existieren (optional)

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Fügt Freelancer hinzu |
| freelancer2 | Max Weber | Wird zur Crew hinzugefügt |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Schritt 1: Meine Crew öffnen
**Agent:** agentur1
**Aktion:** Klicke auf "Meine Crew" in der Sidebar
**Erwartung:** CrewListsPage wird angezeigt

### Schritt 2: Modal öffnen
**Agent:** agentur1
**Aktion:** Klicke auf "Freelancer hinzufügen" Button (blau, oben rechts)
**Erwartung:**
- AddFreelancerToCrewModal öffnet sich
- Suchfeld ist fokussiert
- Listen-Auswahl wird angezeigt (falls Listen existieren)

### Schritt 3: Freelancer suchen
**Agent:** agentur1
**Aktion:** Tippe "Max" in das Suchfeld
**Erwartung:**
- Suchergebnisse erscheinen
- Max Weber wird angezeigt
- Berufe und Stadt sichtbar

### Schritt 4: Zu Favoriten hinzufügen
**Agent:** agentur1
**Aktion:** Klicke auf das Herz-Icon bei Max Weber
**Erwartung:**
- Herz wird gefüllt (rot)
- Max Weber ist jetzt in Favoriten

### Schritt 5: Zu Liste hinzufügen
**Agent:** agentur1
**Aktion:**
1. Wähle eine Liste aus (z.B. "Stammteam")
2. Klicke auf UserPlus-Icon bei Max Weber
**Erwartung:**
- Max wird zur Liste hinzugefügt
- Listen-Tag erscheint unter seinem Namen

### Schritt 6: Chat starten
**Agent:** agentur1
**Aktion:** Klicke auf Chat-Button bei Max Weber
**Erwartung:**
- Modal schließt sich
- Chat mit Max Weber öffnet sich

### Schritt 7: Modal schließen und prüfen
**Agent:** agentur1
**Aktion:** Prüfe Meine Crew Seite
**Erwartung:**
- Max Weber erscheint in Favoriten
- Max Weber erscheint in "Stammteam" Liste

---

## Supervisor-Validierung

### Datenintegrität
- [ ] Freelancer wurde zu Favoriten hinzugefügt
- [ ] Freelancer wurde zur Liste hinzugefügt
- [ ] Crew-Anzahl wurde aktualisiert

### UI-Validierung
- [ ] Modal öffnet und schließt korrekt
- [ ] Suche filtert live
- [ ] Listen-Tags werden angezeigt
- [ ] Alle Action-Buttons funktionieren

### Modal-Funktionen
| Button | Aktion |
|--------|--------|
| Herz | Zu Favoriten hinzufügen/entfernen |
| UserPlus | Zur ausgewählten Liste hinzufügen |
| MessageSquare | Chat öffnen und Modal schließen |

---

## Erwartetes Ergebnis
Das Modal ermöglicht schnelles Suchen, Hinzufügen und Kontaktieren von Freelancern - alles in einem Workflow.
