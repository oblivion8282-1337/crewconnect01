# Testszenario 26: Buchung bei teilweiser Verfügbarkeit

## Übersicht
Freelancer hat bereits Buchungen an einigen Tagen. Die Agentur soll nur die verfügbaren Tage buchen können.

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Möchte Freelancer buchen |
| agentur2 | Redlight Studios | Hat bereits Buchung |
| freelancer1 | Anna Schmidt | Teilweise gebucht |
| supervisor | Orchestrator | Validiert Ergebnisse |

## Voraussetzung
- Freelancer 1 hat bestätigte Fix-Buchung am 22.-23. Januar 2025

---

## Ablauf

### Schritt 1: Setup - Bestehende Buchung
**Agent:** agentur2
**Aktion:** Hat bereits Fix-Buchung für Anna Schmidt am 22.-23. Januar
**Status:** Buchung ist "confirmed" + "fix"

### Schritt 2: Agentur 1 will buchen
**Agent:** agentur1
**Aktion:**
- Öffne Profil von Anna Schmidt
- Prüfe Kalender-Vorschau
**Erwartung:**
- 22. + 23. Januar sind ROT (gebucht)
- Andere Tage sind GRÜN (verfügbar)

### Schritt 3: Buchung starten
**Agent:** agentur1
**Aktion:** Klicke "Buchen" → Projekt wählen → Phase wählen (20.-24. Januar)
**Erwartung:** BookFromProfileModal Schritt 3 zeigt Tage-Kalender

### Schritt 4: Verfügbarkeit im Kalender
**Agent:** supervisor
**Prüfung:**
- [ ] 20. Januar: GRÜN (verfügbar, klickbar)
- [ ] 21. Januar: GRÜN (verfügbar, klickbar)
- [ ] 22. Januar: ROT (belegt, nicht klickbar)
- [ ] 23. Januar: ROT (belegt, nicht klickbar)
- [ ] 24. Januar: GRÜN (verfügbar, klickbar)

### Schritt 5: "Alle verfügbaren" auswählen
**Agent:** agentur1
**Aktion:** Klicke "Alle verfügbaren"
**Erwartung:** Nur 20., 21., 24. Januar werden ausgewählt (3 Tage)

### Schritt 6: Kosten-Berechnung
**Agent:** supervisor
**Prüfung:**
- [ ] Kosten-Übersicht zeigt: 3 Tage × Tagessatz
- [ ] Nicht 5 Tage!

### Schritt 7: Anfrage senden
**Agent:** agentur1
**Aktion:** Sende Anfrage
**Erwartung:** Buchung wird erstellt für 20., 21., 24. Januar

### Schritt 8: Freelancer-Ansicht
**Agent:** freelancer1
**Aktion:** Prüfe Kalender
**Erwartung:**
- 20., 21. Januar: Neue Anfrage (lila)
- 22., 23. Januar: Fix-Buchung (rot)
- 24. Januar: Neue Anfrage (lila)

---

## Supervisor-Validierung

### Buchung ist korrekt
- [ ] Buchung enthält nur: ["2025-01-20", "2025-01-21", "2025-01-24"]
- [ ] 22. und 23. sind NICHT in der Buchung
- [ ] Kein Konflikt mit bestehender Buchung

### Sichtbarkeitsmatrix
- [ ] Agentur 1 sieht 22.-23. als ROT (Fix von anderer Agentur)
- [ ] Freelancer sieht alle Buchungen korrekt
- [ ] Tage-Kalender im Modal zeigt korrekte Verfügbarkeit

---

## Edge Cases

### Fall: Alle Tage belegt
Wenn alle Tage der Phase bereits gebucht sind:
- [ ] "Alle verfügbaren" wählt nichts aus
- [ ] "Option anfragen" Button bleibt deaktiviert
- [ ] Hinweistext sollte erscheinen

### Fall: Wochenende im Zeitraum
- [ ] Samstag/Sonntag sind ausgegraut
- [ ] Können nicht ausgewählt werden

---

## Erwartetes Ergebnis
Agentur kann nur verfügbare Tage buchen. Belegte Tage sind visuell gekennzeichnet und nicht auswählbar.
