# Testszenario 23: Buchung über Freelancer-Suche - Neues Projekt

## Übersicht
Agentur findet Freelancer über die Suche und erstellt ein komplett neues Projekt mit neuer Phase im Buchungsflow.

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Erstellt neues Projekt und bucht |
| freelancer1 | Anna Schmidt | Erhält und bearbeitet Anfrage |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Schritt 1: Freelancer-Suche öffnen
**Agent:** agentur1
**Aktion:** Klicke auf "Freelancer" in der Sidebar
**Erwartung:** AgencyFreelancerSearch wird angezeigt

### Schritt 2: Freelancer finden
**Agent:** agentur1
**Aktion:** Suche nach "Anna" oder filtere nach Beruf "Kamera"
**Erwartung:** Freelancer 1 (Anna Schmidt) erscheint in den Ergebnissen

### Schritt 3: Profil öffnen
**Agent:** agentur1
**Aktion:** Klicke auf Anna Schmidt
**Erwartung:** FreelancerProfileView öffnet sich mit vollständigem Profil

### Schritt 4: Buchung starten
**Agent:** agentur1
**Aktion:** Klicke auf "Buchen" Button
**Erwartung:** BookFromProfileModal öffnet sich bei Schritt 1 (Projekt wählen)

### Schritt 5: Neues Projekt erstellen
**Agent:** agentur1
**Aktion:**
- Klicke auf "+ Neues Projekt erstellen"
- Gib Namen ein: "Imagefilm Startup XY"
- Klicke "Erstellen"
**Erwartung:**
- Projekt wird erstellt
- Radio-Button ist automatisch ausgewählt
- "Weiter" Button wird aktiv

### Schritt 6: Zu Schritt 2 wechseln
**Agent:** agentur1
**Aktion:** Klicke "Weiter"
**Erwartung:** Schritt 2 wird angezeigt (Phase wählen)

### Schritt 7: Neue Phase erstellen
**Agent:** agentur1
**Aktion:**
- Klicke auf "+ Neue Phase erstellen"
- Name: "Hauptdreh"
- Datum: 20.-24. Januar 2025 (DateRangePicker)
- Klicke "Phase erstellen"
**Erwartung:**
- Phase wird erstellt
- Phase ist automatisch ausgewählt
- Buchungszeitraum wird auf Phase-Datum gesetzt

### Schritt 8: Zu Schritt 3 wechseln
**Agent:** agentur1
**Aktion:** Klicke "Weiter"
**Erwartung:**
- Schritt 3 wird angezeigt
- Zusammenfassung zeigt: Anna Schmidt, Imagefilm Startup XY, Hauptdreh
- Tage-Kalender zeigt 20.-24. Januar

### Schritt 9: Tage auswählen
**Agent:** agentur1
**Aktion:** Klicke "Alle verfügbaren" oder wähle manuell 20., 21., 22., 23., 24. Januar
**Erwartung:**
- 5 Tage sind ausgewählt (falls alle verfügbar)
- Wochenend-Tage (falls vorhanden) sind ausgegraut

### Schritt 10: Buchungstyp wählen
**Agent:** agentur1
**Aktion:** Wähle "Option"
**Erwartung:** Option-Button ist hervorgehoben (gelb)

### Schritt 11: Tagessatz prüfen
**Agent:** agentur1
**Aktion:** Prüfe vorausgefüllten Tagessatz (sollte Freelancer-Rate sein)
**Erwartung:** Tagessatz = Freelancer dayRate (z.B. 650€)

### Schritt 12: Anfrage senden
**Agent:** agentur1
**Aktion:** Klicke "Option anfragen"
**Erwartung:**
- Modal schließt sich
- Erfolgsmeldung (falls implementiert)

### Schritt 13: Freelancer-Benachrichtigung
**Agent:** freelancer1
**Aktion:** Prüfe Notifications/Anfragen
**Erwartung:**
- Neue Anfrage von Bluescreen Productions
- Projekt: Imagefilm Startup XY
- Phase: Hauptdreh
- Datum: 20.-24. Januar 2025
- Typ: Option

### Schritt 14: Freelancer bestätigt
**Agent:** freelancer1
**Aktion:** Bestätige die Option
**Erwartung:** Status wechselt zu "confirmed"

---

## Supervisor-Validierung

### Datenintegrität
- [ ] Projekt "Imagefilm Startup XY" existiert mit agencyId = 1
- [ ] Phase "Hauptdreh" existiert mit korrektem Datum
- [ ] Buchung existiert mit:
  - freelancerId = 1
  - projectId = (neues Projekt)
  - phaseId = (neue Phase)
  - dates = ["2025-01-20", "2025-01-21", "2025-01-22", "2025-01-23", "2025-01-24"]
  - status = "pending" → "confirmed"
  - type = "option"

### UI-Validierung
- [ ] 3-Schritte-Progress-Bar funktioniert
- [ ] Inline-Erstellung von Projekt funktioniert
- [ ] Inline-Erstellung von Phase mit DateRangePicker funktioniert
- [ ] Tage-Auswahl zeigt korrekten Zeitraum
- [ ] Kosten-Übersicht berechnet korrekt (5 Tage × Tagessatz)

---

## Erwartetes Ergebnis
Neues Projekt und Phase werden inline erstellt, Buchungsanfrage wird korrekt generiert und vom Freelancer bestätigt.
