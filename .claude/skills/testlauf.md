---
name: testlauf
description: Startet einen vollständigen Testlauf mit allen CrewConnect Test-Agenten
---

# CrewConnect Testlauf

Führe einen vollständigen Testlauf der Buchungs-Workflows durch.

## Ablauf

### Phase 1: Konkurrierende Buchungen (parallel)

Starte diese Agenten gleichzeitig:

1. **agentur1** - Bucht Anna Schmidt (freelancerId=1) für 15.-17. Januar
   - Projekt: Werbespot Mercedes 2025
   - Typ: Option

2. **agentur2** - Bucht Anna Schmidt für 16.-18. Januar (KONFLIKT!)
   - Projekt: Musikvideo Neon Dreams
   - Typ: Option

### Phase 2: Freelancer-Reaktion

3. **freelancer1** - Prüft als Anna Schmidt:
   - Sieht sie die Konfliktwarnung im Dashboard?
   - Werden überlappende Tage markiert?
   - Kann sie eine Anfrage bestätigen?

### Phase 3: Validierung

4. **supervisor** - Validiert den gesamten Workflow:
   - Wurden Buchungen korrekt erstellt?
   - Funktioniert die Sichtbarkeitsmatrix?
   - Sind Benachrichtigungen angekommen?

## Erwartete Ergebnisse

- [ ] Beide Buchungen im State mit status='pending'
- [ ] Anna sieht Konfliktwarnung (orange Banner)
- [ ] Überlappende Tage (16., 17. Jan) sind markiert
- [ ] Nach Bestätigung einer Option: andere wird NICHT automatisch abgelehnt (nur Warnung)

## Fehler-Report

Bei gefundenen Fehlern, dokumentiere:
- Komponente/Datei
- Erwartetes vs. tatsächliches Verhalten
- Schweregrad (Kritisch/Hoch/Mittel/Niedrig)
