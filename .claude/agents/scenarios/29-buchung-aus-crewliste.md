# Testszenario 29: Buchung aus Crew-Liste

## Übersicht
Agentur nutzt ihre gepflegte Crew-Liste, um schnell bekannte Freelancer zu buchen.

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Nutzt Crew-Listen |
| freelancer1 | Anna Schmidt | In Crew-Liste |
| freelancer2 | Max Weber | In Crew-Liste |
| supervisor | Orchestrator | Validiert Workflow |

## Voraussetzung
- Crew-Liste "Stamm-Crew" existiert mit Anna Schmidt und Max Weber

---

## Ablauf

### Schritt 1: Crew-Listen öffnen
**Agent:** agentur1
**Aktion:** Klicke auf "Meine Crew" in der Sidebar
**Erwartung:** CrewListsPage wird angezeigt

### Schritt 2: Liste öffnen
**Agent:** agentur1
**Aktion:** Klicke auf Liste "Stamm-Crew"
**Erwartung:**
- Liste expandiert/öffnet sich
- Anna Schmidt und Max Weber werden angezeigt
- Jeder Eintrag zeigt: Avatar, Name, Beruf

### Schritt 3: Freelancer-Profil aus Liste öffnen
**Agent:** agentur1
**Aktion:** Klicke auf Anna Schmidt in der Liste
**Erwartung:**
- Navigation zu FreelancerProfileView
- ODER: Profil öffnet sich in Modal/Drawer

### Schritt 4: Verfügbarkeit prüfen
**Agent:** agentur1
**Aktion:** Prüfe Kalender-Vorschau im Profil
**Erwartung:** 6-Wochen-Kalender zeigt Verfügbarkeit

### Schritt 5: Buchung starten
**Agent:** agentur1
**Aktion:** Klicke "Buchen"
**Erwartung:** BookFromProfileModal öffnet sich

### Schritt 6: Schnelle Buchung
**Agent:** agentur1
**Aktion:**
- Wähle bestehendes Projekt
- Wähle bestehende Phase
- Wähle Tage
- Sende Anfrage
**Erwartung:** Buchung wird erstellt

---

## Supervisor-Validierung

### Workflow-Effizienz
- [ ] Von Crew-Liste zum Profil: 1 Klick
- [ ] Vom Profil zur Buchung: 1 Klick
- [ ] Gesamt: 2 Klicks bis Buchungsmodal

### Datenintegrität
- [ ] Freelancer bleibt in Crew-Liste nach Buchung
- [ ] Buchung referenziert korrekten Freelancer
- [ ] Crew-Listen-Status beeinflusst nicht Buchungsstatus

---

## Zusatz: Favoriten-Schnellbuchung

### Schritt F1: Favoriten prüfen
**Agent:** agentur1
**Aktion:** In "Meine Crew" → Favoriten-Sektion prüfen
**Erwartung:** Favorisierte Freelancer werden angezeigt

### Schritt F2: Direkt aus Favoriten buchen
**Agent:** agentur1
**Aktion:** Klicke auf Favorit → Profil → Buchen
**Erwartung:** Gleicher Flow wie bei Crew-Listen

---

## Erwartetes Ergebnis
Crew-Listen ermöglichen schnellen Zugang zu bekannten Freelancern für effiziente Buchungen.
