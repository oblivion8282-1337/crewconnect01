# Testszenario 47: Crew-Suche

## Übersicht
Agentur nutzt die Suchfunktion auf der "Meine Crew" Seite, um schnell einen Freelancer in der eigenen Crew zu finden.

## Voraussetzung
- Mehrere Freelancer in Favoriten oder Listen

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Durchsucht Crew |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Ablauf

### Schritt 1: Meine Crew öffnen
**Agent:** agentur1
**Aktion:** Klicke auf "Meine Crew" in der Sidebar
**Erwartung:**
- CrewListsPage wird angezeigt
- Suchfeld oben sichtbar
- Placeholder: "In meiner Crew suchen..."

### Schritt 2: Nach Name suchen
**Agent:** agentur1
**Aktion:** Tippe "Anna" in das Suchfeld
**Erwartung:**
- Suchergebnisse erscheinen unterhalb
- Anna Schmidt wird angezeigt
- Ergebnis-Zähler: "1 Ergebnis für 'Anna'"

### Schritt 3: Nach Beruf suchen
**Agent:** agentur1
**Aktion:** Lösche Suche, tippe "Editor"
**Erwartung:**
- Alle Freelancer mit "Editor" im Beruf werden angezeigt
- z.B. Max Weber (Editor, Colorist)

### Schritt 4: Keine Ergebnisse
**Agent:** agentur1
**Aktion:** Tippe "xyz123"
**Erwartung:**
- Meldung: "Keine Freelancer in deiner Crew gefunden."
- Hinweis auf "Freelancer hinzufügen" Button

### Schritt 5: Chat aus Suchergebnis
**Agent:** agentur1
**Aktion:** Suche nach "Anna", klicke Chat-Button im Ergebnis
**Erwartung:**
- Navigation zu Messages
- Chat mit Anna öffnet sich

---

## Supervisor-Validierung

### Datenintegrität
- [ ] Suche durchsucht: firstName, lastName, professions
- [ ] Nur Crew-Mitglieder werden durchsucht (Favoriten + Listen)
- [ ] Case-insensitive Suche

### UI-Validierung
- [ ] Suchfeld ist prominent platziert
- [ ] Live-Filterung bei Eingabe
- [ ] Ergebnis-Zähler korrekt
- [ ] Leerer Zustand mit hilfreicher Meldung

### Such-Logik
```javascript
const filteredCrewFreelancers = crewFreelancers.filter(f => {
  const fullName = `${f.firstName} ${f.lastName}`.toLowerCase();
  const professions = f.professions.join(' ').toLowerCase();
  return fullName.includes(query) || professions.includes(query);
});
```

---

## Erwartetes Ergebnis
Die Suchfunktion ermöglicht schnelles Auffinden von Freelancern innerhalb der eigenen Crew nach Name oder Beruf.
