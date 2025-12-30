# Testszenario 28: Freelancer lehnt ab - Alternative buchen

## Übersicht
Freelancer lehnt Buchungsanfrage ab. Agentur sucht und bucht Alternative über die Freelancer-Suche.

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Sucht Ersatz |
| freelancer1 | Anna Schmidt | Lehnt ab |
| freelancer2 | Max Weber | Alternative |
| supervisor | Orchestrator | Validiert Workflow |

---

## Ablauf

### Phase 1: Initiale Buchung

#### Schritt 1.1: Erste Anfrage
**Agent:** agentur1
**Aktion:** Buche Anna Schmidt für 5.-7. März (Option)
**Erwartung:** Anfrage wird gesendet

#### Schritt 1.2: Freelancer erhält Anfrage
**Agent:** freelancer1
**Aktion:** Prüfe Anfragen
**Erwartung:** Neue Anfrage sichtbar

#### Schritt 1.3: Freelancer lehnt ab
**Agent:** freelancer1
**Aktion:** Klicke "Ablehnen"
**Erwartung:**
- Status wird "declined"
- Optional: Ablehnungsgrund eingeben

---

### Phase 2: Agentur wird benachrichtigt

#### Schritt 2.1: Notification
**Agent:** agentur1
**Aktion:** Prüfe Notifications
**Erwartung:**
- Benachrichtigung: "Anna Schmidt hat Ihre Anfrage abgelehnt"
- Buchung zeigt Status "Abgelehnt"

#### Schritt 2.2: Agentur-Buchungen prüfen
**Agent:** agentur1
**Aktion:** Gehe zu "Buchungen"
**Erwartung:**
- Abgelehnte Buchung ist markiert (durchgestrichen oder ausgegraut)
- Tage sind wieder "frei" für neue Buchung

---

### Phase 3: Alternative suchen

#### Schritt 3.1: Zurück zur Suche
**Agent:** agentur1
**Aktion:** Gehe zu "Freelancer" in Sidebar
**Erwartung:** Suchseite öffnet sich

#### Schritt 3.2: Nach gleichem Beruf filtern
**Agent:** agentur1
**Aktion:** Filtere nach Beruf "Kamera" (wie Anna)
**Erwartung:** Max Weber und andere Kameraleute erscheinen

#### Schritt 3.3: Verfügbarkeit prüfen
**Agent:** agentur1
**Aktion:** Prüfe Verfügbarkeits-Indikator bei Max Weber
**Erwartung:** Grüner Dot (verfügbar)

#### Schritt 3.4: Profil öffnen
**Agent:** agentur1
**Aktion:** Klicke auf Max Weber
**Erwartung:** Kalender zeigt 5.-7. März als verfügbar

---

### Phase 4: Alternative buchen

#### Schritt 4.1: Buchung starten
**Agent:** agentur1
**Aktion:** Klicke "Buchen"
**Erwartung:** Modal öffnet sich

#### Schritt 4.2: Gleiches Projekt/Phase wählen
**Agent:** agentur1
**Aktion:**
- Wähle bestehendes Projekt
- Wähle bestehende Phase (5.-7. März)
- Wähle alle Tage
- Sende Anfrage
**Erwartung:** Neue Anfrage an Max Weber

#### Schritt 4.3: Alternative bestätigt
**Agent:** freelancer2
**Aktion:** Bestätige Anfrage
**Erwartung:** Buchung ist "confirmed"

---

## Supervisor-Validierung

### Buchungshistorie
```
Phase für 5.-7. März:
├── Buchung 1: Anna Schmidt → DECLINED
└── Buchung 2: Max Weber → CONFIRMED
```

### Notifications-Kette
1. Freelancer 1 erhält Anfrage
2. Agentur erhält Ablehnung
3. Freelancer 2 erhält Anfrage
4. Agentur erhält Bestätigung

### Datenintegrität
- [ ] Abgelehnte Buchung bleibt in Historie (nicht gelöscht)
- [ ] Neue Buchung ist unabhängig von alter
- [ ] Phase zeigt nur aktive Buchungen
- [ ] Tage waren nach Ablehnung wieder verfügbar

---

## Edge Case: Crew-Liste für Alternativen

### Schritt E1: Crew-Liste nutzen
**Agent:** agentur1
**Aktion:**
- Nach Ablehnung: Gehe zu "Meine Crew"
- Öffne Liste "Kamera-Team"
- Prüfe Verfügbarkeit der Listenmitglieder
**Erwartung:** Schnellerer Zugang zu Alternativen

### Schritt E2: Direkt aus Liste buchen
**Agent:** agentur1
**Aktion:**
- Klicke auf Freelancer in der Liste
- Navigiere zum Profil
- Starte Buchung
**Erwartung:** Gleicher Buchungsflow wie aus Suche

---

## Erwartetes Ergebnis
Agentur kann nach Ablehnung effizient eine Alternative finden und buchen. Abgelehnte Buchungen bleiben in der Historie erhalten.
