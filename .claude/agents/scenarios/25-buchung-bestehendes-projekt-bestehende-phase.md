# Testszenario 25: Buchung über Freelancer-Suche - Bestehendes Projekt & Phase

## Übersicht
Agentur bucht einen weiteren Freelancer für eine bereits existierende Phase (z.B. zweiter Kameramann für gleichen Dreh).

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Bucht zusätzlichen Freelancer |
| freelancer1 | Anna Schmidt | Bereits gebucht für Phase |
| freelancer2 | Max Weber | Wird zusätzlich gebucht |
| supervisor | Orchestrator | Validiert Ergebnisse |

## Voraussetzung
- Projekt "Imagefilm Startup XY" existiert
- Phase "Hauptdreh" (20.-24. Januar) existiert
- Anna Schmidt ist bereits für "Hauptdreh" gebucht

---

## Ablauf

### Schritt 1-3: Freelancer finden und Buchung starten
**Agent:** agentur1
**Aktion:** Suche Max Weber → Profil öffnen → "Buchen" klicken
**Erwartung:** BookFromProfileModal öffnet sich

### Schritt 4: Bestehendes Projekt wählen
**Agent:** agentur1
**Aktion:** Wähle "Imagefilm Startup XY"
**Erwartung:** Projekt ausgewählt

### Schritt 5: Bestehende Phase wählen
**Agent:** agentur1
**Aktion:**
- Gehe zu Schritt 2
- Wähle "Hauptdreh" (20.-24. Januar)
**Erwartung:**
- Phase ist ausgewählt
- Datum wird automatisch übernommen

### Schritt 6: Gleiche Tage buchen
**Agent:** agentur1
**Aktion:**
- Gehe zu Schritt 3
- Tage-Kalender zeigt 20.-24. Januar
- Wähle alle verfügbaren Tage
- Typ: Option
- Sende Anfrage
**Erwartung:** Buchung wird erstellt

### Schritt 7: Prüfung
**Agent:** supervisor
**Prüfung:**
- [ ] Beide Freelancer (Anna + Max) sind für "Hauptdreh" gebucht
- [ ] Buchungen sind unabhängig voneinander
- [ ] Phase hat keine Duplikate

---

## Supervisor-Validierung

### Phase-Buchungen prüfen
```
Phase "Hauptdreh":
├── Buchung 1: Anna Schmidt (Freelancer 1)
│   └── Tage: 20.-24. Januar, Option confirmed
└── Buchung 2: Max Weber (Freelancer 2)
    └── Tage: 20.-24. Januar, Option pending
```

### Keine Konflikte
- [ ] Mehrere Freelancer pro Phase ist erlaubt
- [ ] Jeder Freelancer hat eigene Buchung
- [ ] Kalender-Ansicht zeigt beide Buchungen korrekt

---

## Erwartetes Ergebnis
Zweiter Freelancer wird erfolgreich zur gleichen Phase hinzugebucht. Das System erlaubt mehrere Freelancer pro Phase (Team-Buchung).
