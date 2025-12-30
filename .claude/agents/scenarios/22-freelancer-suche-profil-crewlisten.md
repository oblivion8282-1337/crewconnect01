# Testszenario 22: Freelancer-Suche, Profil & Crew-Listen

## Übersicht
Dieses Szenario testet das vollständige Feature-Set für Agenturen:
- Freelancer-Suche mit Filtern
- Profilansicht mit Kalender-Vorschau
- Favoriten-Verwaltung
- Crew-Listen (CRUD)
- Buchung direkt aus dem Profil (3-Schritte-Flow)
- Sichtbarkeitsmatrix zwischen Agenturen

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Hauptakteur, testet alle Features |
| agentur2 | Redlight Studios | Testet Sichtbarkeit/Privatsphäre |
| freelancer1 | Anna Schmidt | Wird gesucht, favorisiert, gebucht |
| freelancer2 | Max Weber | Wird zur Crew-Liste hinzugefügt |
| supervisor | Orchestrator | Validiert alle Ergebnisse |

---

## Phase 1: Freelancer-Suche testen

### Schritt 1.1: Navigation zur Suche
**Agent:** agentur1
**Aktion:** Öffne "Freelancer" im Seitenmenü
**Erwartung:** AgencyFreelancerSearch wird angezeigt mit Suchfiltern und Freelancer-Liste

### Schritt 1.2: Suche nach Beruf
**Agent:** agentur1
**Aktion:** Wähle Filter "Beruf" → "Kamera"
**Erwartung:** Nur Freelancer mit Beruf "Kamera" werden angezeigt

### Schritt 1.3: Filter nach Standort
**Agent:** agentur1
**Aktion:** Gib "Berlin" in Standort-Filter ein
**Erwartung:** Liste wird weiter gefiltert auf Kameraleute aus Berlin

### Schritt 1.4: Supervisor-Validierung Suche
**Agent:** supervisor
**Prüfung:**
- [ ] Filter werden korrekt angewendet (AND-Verknüpfung)
- [ ] Alle passenden Freelancer werden angezeigt
- [ ] Verfügbarkeits-Indikator (grün/gelb/rot) ist sichtbar
- [ ] FavoriteButton ist auf jeder Karte vorhanden

---

## Phase 2: Profil ansehen

### Schritt 2.1: Profil öffnen
**Agent:** agentur1
**Aktion:** Klicke auf Freelancer 1 (Anna Schmidt) in den Suchergebnissen
**Erwartung:** FreelancerProfileView öffnet sich

### Schritt 2.2: Supervisor-Validierung Profil
**Agent:** supervisor
**Prüfung:**
- [ ] Header: Avatar, Name, Berufe, Standort, Tagessatz
- [ ] Bio/Beschreibung wird angezeigt
- [ ] Skills-Liste ist sichtbar
- [ ] Equipment-Liste ist sichtbar
- [ ] Sprachen werden angezeigt
- [ ] Portfolio-Sektion (falls vorhanden)
- [ ] 6-Wochen-Kalender-Vorschau
- [ ] Zusammenarbeits-Historie (Anzahl Projekte, letzte Buchung)
- [ ] Action-Buttons: Favorit, Zur Liste, Buchen

---

## Phase 3: Favoriten testen

### Schritt 3.1: Favorit hinzufügen
**Agent:** agentur1
**Aktion:** Klicke auf Herz-Button bei Freelancer 1
**Erwartung:** Herz wird ausgefüllt (rot), Freelancer ist favorisiert

### Schritt 3.2: Favoriten in Crew-Seite prüfen
**Agent:** agentur1
**Aktion:** Navigiere zu "Meine Crew"
**Erwartung:** Freelancer 1 erscheint in der Favoriten-Sektion

### Schritt 3.3: Favorit entfernen
**Agent:** agentur1
**Aktion:** Klicke erneut auf Herz-Button bei Freelancer 1
**Erwartung:** Herz wird leer, Freelancer verschwindet aus Favoriten

### Schritt 3.4: Supervisor-Validierung Favoriten
**Agent:** supervisor
**Prüfung:**
- [ ] Toggle funktioniert in beide Richtungen
- [ ] UI-Update erfolgt sofort (kein Page Reload nötig)
- [ ] Favoriten sind agentur-spezifisch (nur eigene sichtbar)

---

## Phase 4: Crew-Listen testen

### Schritt 4.1: Neue Liste erstellen
**Agent:** agentur1
**Aktion:** In "Meine Crew" → "+ Neue Liste" → Name: "Stamm-Crew"
**Erwartung:** Neue leere Liste wird angezeigt

### Schritt 4.2: Freelancer zur Liste hinzufügen
**Agent:** agentur1
**Aktion:** Bei Freelancer 1 → "Zur Liste hinzufügen" → Wähle "Stamm-Crew"
**Erwartung:** AddToListModal öffnet sich, Freelancer wird hinzugefügt

### Schritt 4.3: Zweiten Freelancer hinzufügen
**Agent:** agentur1
**Aktion:** Wiederhole für Freelancer 2 (Max Weber)
**Erwartung:** Beide Freelancer sind in "Stamm-Crew"

### Schritt 4.4: Liste anzeigen
**Agent:** agentur1
**Aktion:** Öffne Liste "Stamm-Crew"
**Erwartung:** Anna Schmidt und Max Weber werden angezeigt

### Schritt 4.5: Freelancer aus Liste entfernen
**Agent:** agentur1
**Aktion:** Klicke "X" bei Freelancer 2 in der Liste
**Erwartung:** Max Weber verschwindet aus "Stamm-Crew"

### Schritt 4.6: Liste umbenennen
**Agent:** agentur1
**Aktion:** Klicke Bearbeiten-Icon → Neuer Name: "A-Team"
**Erwartung:** Liste heißt jetzt "A-Team"

### Schritt 4.7: Liste löschen
**Agent:** agentur1
**Aktion:** Klicke Löschen-Icon bei "A-Team"
**Erwartung:** Liste wird gelöscht, Freelancer bleiben erhalten

### Schritt 4.8: Supervisor-Validierung Listen
**Agent:** supervisor
**Prüfung:**
- [ ] Create: Neue Liste wird erstellt
- [ ] Read: Liste zeigt alle Mitglieder
- [ ] Update: Umbenennen funktioniert
- [ ] Delete: Liste wird gelöscht
- [ ] Keine verwaisten Daten nach Löschung
- [ ] Listen sind agentur-spezifisch

---

## Phase 5: Buchung aus Profil (neues Projekt)

### Schritt 5.1: Buchungsflow starten
**Agent:** agentur1
**Aktion:** Öffne Profil von Freelancer 1 → Klicke "Buchen"
**Erwartung:** BookFromProfileModal öffnet sich bei Schritt 1

### Schritt 5.2: Neues Projekt erstellen
**Agent:** agentur1
**Aktion:** Wähle "+ Neues Projekt erstellen" → Name: "Testdreh"
**Erwartung:** Projekt-Eingabefeld erscheint, "Weiter" wird aktiv

### Schritt 5.3: Neue Phase erstellen
**Agent:** agentur1
**Aktion:** Klicke "Weiter" → Wähle "+ Neue Phase erstellen" → Name: "Drehtag 1", Datum: 15.-17. Januar 2025
**Erwartung:** Phase-Eingabefeld mit DateRangePicker erscheint

### Schritt 5.4: Buchungsdetails
**Agent:** agentur1
**Aktion:** Klicke "Weiter" → Wähle Tage 15., 16., 17. → Typ "Option" → Tagessatz bestätigen
**Erwartung:** Kalender zeigt verfügbare Tage, Zusammenfassung wird angezeigt

### Schritt 5.5: Anfrage senden
**Agent:** agentur1
**Aktion:** Klicke "Anfrage senden"
**Erwartung:** Modal schließt sich, Erfolgsmeldung

### Schritt 5.6: Freelancer-Benachrichtigung
**Agent:** freelancer1
**Aktion:** Prüfe Notifications
**Erwartung:** Neue Anfrage von Bluescreen Productions für 15.-17. Januar

### Schritt 5.7: Supervisor-Validierung Buchung
**Agent:** supervisor
**Prüfung:**
- [ ] Projekt "Testdreh" wurde erstellt
- [ ] Phase "Drehtag 1" wurde erstellt mit korrektem Datum
- [ ] Buchung existiert mit Status "pending" und Typ "option"
- [ ] Buchung ist Freelancer 1 und Agentur 1 zugeordnet
- [ ] Notification wurde generiert

---

## Phase 6: Buchung aus Profil (bestehendes Projekt)

### Schritt 6.1: Zweite Buchung starten
**Agent:** agentur1
**Aktion:** Öffne Profil von Freelancer 2 → Klicke "Buchen"
**Erwartung:** BookFromProfileModal öffnet sich

### Schritt 6.2: Bestehendes Projekt wählen
**Agent:** agentur1
**Aktion:** Wähle Projekt "Testdreh" aus der Liste
**Erwartung:** Projekt ist ausgewählt, "Weiter" aktiv

### Schritt 6.3: Bestehende Phase wählen
**Agent:** agentur1
**Aktion:** Klicke "Weiter" → Wähle Phase "Drehtag 1"
**Erwartung:** Phase ist ausgewählt

### Schritt 6.4: Buchungsdetails
**Agent:** agentur1
**Aktion:** Wähle gleiche Tage 15.-17. → Typ "Option"
**Erwartung:** Kalender zeigt Tage, aber mit Hinweis auf existierende Buchung?

### Schritt 6.5: Anfrage senden
**Agent:** agentur1
**Aktion:** Klicke "Anfrage senden"
**Erwartung:** Buchung wird erstellt

### Schritt 6.6: Freelancer-Benachrichtigung
**Agent:** freelancer2
**Aktion:** Prüfe Notifications
**Erwartung:** Neue Anfrage von Bluescreen Productions

### Schritt 6.7: Supervisor-Validierung
**Agent:** supervisor
**Prüfung:**
- [ ] Buchung wurde zur bestehenden Phase hinzugefügt
- [ ] Kein neues Projekt/Phase erstellt
- [ ] Zwei Buchungen in derselben Phase (verschiedene Freelancer)

---

## Phase 7: Sichtbarkeit zwischen Agenturen

### Schritt 7.1: Agentur 2 sucht Freelancer
**Agent:** agentur2
**Aktion:** Öffne "Freelancer" → Suche nach Freelancer 1
**Erwartung:** Freelancer 1 wird gefunden

### Schritt 7.2: Profil ansehen
**Agent:** agentur2
**Aktion:** Öffne Profil von Freelancer 1
**Erwartung:** Kalender-Vorschau wird angezeigt

### Schritt 7.3: Supervisor prüft Sichtbarkeit (pending)
**Agent:** supervisor
**Prüfung:**
- [ ] Tage 15.-17. werden für Agentur 2 als GRÜN angezeigt
- [ ] Pending Anfragen sind PRIVAT (nicht sichtbar für andere Agenturen)

### Schritt 7.4: Freelancer bestätigt Option
**Agent:** freelancer1
**Aktion:** Gehe zu Anfragen → Bestätige Option von Agentur 1
**Erwartung:** Status wird "confirmed"

### Schritt 7.5: Agentur 2 prüft erneut
**Agent:** agentur2
**Aktion:** Refresh Profil von Freelancer 1
**Erwartung:** Kalender-Vorschau aktualisiert sich

### Schritt 7.6: Supervisor prüft Sichtbarkeit (confirmed option)
**Agent:** supervisor
**Prüfung:**
- [ ] Tage 15.-17. werden für Agentur 2 IMMER NOCH als GRÜN angezeigt
- [ ] Bestätigte Optionen sind PRIVAT (nur Fix ist öffentlich sichtbar)

---

## Phase 8: Verfügbarkeits-Indikator

### Schritt 8.1: Agentur 2 prüft Suchergebnisse
**Agent:** agentur2
**Aktion:** Gehe zur Freelancer-Suche
**Erwartung:** Freelancer-Liste mit Verfügbarkeits-Dots

### Schritt 8.2: Supervisor prüft Indikator (Option)
**Agent:** supervisor
**Prüfung:**
- [ ] Freelancer 1 hat GRÜNEN Dot (Option ist privat → "verfügbar")
- [ ] Verfügbarkeit basiert auf nächsten 7 Tagen

### Schritt 8.3: Option zu Fix umwandeln
**Agent:** agentur1
**Aktion:** Gehe zu Buchungen → Wandle Option für Freelancer 1 zu Fix um
**Erwartung:** Status wird "fix", Typ wird "fix"

### Schritt 8.4: Freelancer bestätigt Fix
**Agent:** freelancer1
**Aktion:** Bestätige Fix-Buchung
**Erwartung:** Buchung ist jetzt confirmed + fix

### Schritt 8.5: Agentur 2 prüft erneut
**Agent:** agentur2
**Aktion:** Refresh Freelancer-Suche
**Erwartung:** Verfügbarkeits-Indikator aktualisiert sich

### Schritt 8.6: Supervisor prüft Indikator (Fix)
**Agent:** supervisor
**Prüfung:**
- [ ] Freelancer 1 hat jetzt ROTEN oder GELBEN Dot
- [ ] Fix-Buchungen sind ÖFFENTLICH sichtbar
- [ ] Kalender-Vorschau zeigt Tage 15.-17. als ROT für Agentur 2

---

## Zusammenfassung erwartete Ergebnisse

### Funktionalität
| Feature | Erwartung |
|---------|-----------|
| Suche mit Filtern | AND-Verknüpfung, alle passenden angezeigt |
| Profilansicht | Alle Daten korrekt, Kalender-Vorschau |
| Favoriten-Toggle | Sofortiges UI-Update, agentur-spezifisch |
| Crew-Listen CRUD | Alle Operationen funktionieren |
| Buchungsflow | Inline Projekt/Phase-Erstellung möglich |
| Sichtbarkeitsmatrix | Pending/Option privat, Fix öffentlich |

### Sichtbarkeitsmatrix-Validierung
| Buchungsstatus | Eigene Agentur | Andere Agentur |
|----------------|----------------|----------------|
| Pending Option | GELB | GRÜN (privat!) |
| Confirmed Option | GELB | GRÜN (privat!) |
| Pending Fix | GELB | GELB |
| Confirmed Fix | ROT | ROT |

### Datenintegrität
- [ ] Keine verwaisten Buchungen nach Projekt-Löschung
- [ ] Keine verwaisten Listen-Einträge nach Listen-Löschung
- [ ] Favoriten überleben Freelancer-Updates
- [ ] Buchungen korrekt zu Phasen zugeordnet
