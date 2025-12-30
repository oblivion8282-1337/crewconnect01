# Testszenario 24: Buchung über Freelancer-Suche - Bestehendes Projekt, Neue Phase

## Übersicht
Agentur wählt ein bestehendes Projekt und erstellt eine neue Phase für die Buchung.

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Nutzt bestehendes Projekt |
| freelancer2 | Max Weber | Erhält Anfrage |
| supervisor | Orchestrator | Validiert Ergebnisse |

## Voraussetzung
- Projekt "Imagefilm Startup XY" existiert bereits (aus Szenario 23)

---

## Ablauf

### Schritt 1: Freelancer-Suche öffnen
**Agent:** agentur1
**Aktion:** Navigiere zu "Freelancer" in der Sidebar
**Erwartung:** Suchseite wird angezeigt

### Schritt 2: Anderen Freelancer wählen
**Agent:** agentur1
**Aktion:** Suche und klicke auf Max Weber (Freelancer 2)
**Erwartung:** Profil von Max Weber öffnet sich

### Schritt 3: Buchung starten
**Agent:** agentur1
**Aktion:** Klicke "Buchen"
**Erwartung:** BookFromProfileModal Schritt 1

### Schritt 4: Bestehendes Projekt wählen
**Agent:** agentur1
**Aktion:** Wähle "Imagefilm Startup XY" aus der Liste
**Erwartung:**
- Projekt ist ausgewählt
- "Weiter" wird aktiv

### Schritt 5: Neue Phase für Nachdreh erstellen
**Agent:** agentur1
**Aktion:**
- Gehe zu Schritt 2
- Klicke "+ Neue Phase erstellen"
- Name: "Nachdreh"
- Datum: 27.-28. Januar 2025
- Klicke "Phase erstellen"
**Erwartung:** Phase wird zum bestehenden Projekt hinzugefügt

### Schritt 6: Buchungsdetails
**Agent:** agentur1
**Aktion:**
- Gehe zu Schritt 3
- Wähle beide Tage (27. + 28.)
- Typ: Fix
- Sende Anfrage
**Erwartung:** Buchung wird erstellt

### Schritt 7: Freelancer-Benachrichtigung
**Agent:** freelancer2
**Aktion:** Prüfe Anfragen
**Erwartung:** Fix-Anfrage für "Nachdreh" am 27.-28. Januar

---

## Supervisor-Validierung

### Projekt-Struktur prüfen
- [ ] Projekt "Imagefilm Startup XY" hat jetzt 2 Phasen:
  1. "Hauptdreh" (20.-24. Januar)
  2. "Nachdreh" (27.-28. Januar)
- [ ] Kein neues Projekt wurde erstellt
- [ ] Phase wurde korrekt zum bestehenden Projekt hinzugefügt

### Buchung prüfen
- [ ] Buchung existiert für Freelancer 2
- [ ] Buchung referenziert das bestehende Projekt
- [ ] Buchung referenziert die neue Phase "Nachdreh"
- [ ] Typ = "fix"

---

## Erwartetes Ergebnis
Neue Phase wird zu bestehendem Projekt hinzugefügt, ohne ein neues Projekt zu erstellen.
