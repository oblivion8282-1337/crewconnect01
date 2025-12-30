# Claude Code Agenten

Diese Agenten simulieren und testen das CrewConnect Buchungssystem.

## Master-Supervisor

| Agent | Datei | Beschreibung |
|-------|-------|--------------|
| Master Supervisor | `master-supervisor.md` | Koordiniert System- UND UI-Agenten, validiert Farben nach jeder Aktion |

Der Master-Supervisor fuehrt kombinierte Tests durch: Nach jeder Buchungs-Aktion werden die Kalenderfarben aus allen Perspektiven (Freelancer, eigene Agentur, fremde Agentur) validiert.

## System-Agenten (5)

| Agent | Datei | Beschreibung |
|-------|-------|--------------|
| Supervisor | `supervisor.md` | Orchestrator der alle Agenten steuert und Testergebnisse validiert |
| Agentur 1 | `agentur1.md` | Bluescreen Productions - Simuliert Agentur-Aktionen |
| Agentur 2 | `agentur2.md` | Redlight Studios - Konkurrierende Agentur für Konflikt-Tests |
| Freelancer 1 | `freelancer1.md` | Anna Schmidt - Simuliert Freelancer-Aktionen |
| Freelancer 2 | `freelancer2.md` | Max Weber - Zweiter Freelancer für parallele Tests |

## UI-Agenten (3)

| Agent | Datei | Beschreibung |
|-------|-------|--------------|
| UI Supervisor | `ui-supervisor.md` | Koordiniert UI-Checker, erstellt kombinierte Reports |
| UI Checker 1 | `ui-checker1.md` | Prüft Design-Konsistenz (Farben, Typografie, Abstände) |
| UI Checker 2 | `ui-checker2.md` | Prüft Fehler, Loading/Empty States, Accessibility |

## Test-Szenarien

### Buchungs-Szenarien (`scenarios/`)

| Nr. | Szenario |
|-----|----------|
| 01 | Einfache Buchung |
| 02 | Option zu Fix |
| 03 | Konflikt-Buchung |
| 04 | Fix direkt |
| 05 | Verschiebung |
| 06 | Stornierung |
| 07 | Komplett-Workflow |
| 08 | Blockierte Tage |
| 09 | Option ablehnen |
| 10 | Anfrage zurückziehen |
| 11 | Verschiebung ablehnen |
| 12 | Verschiebung auf Konflikt |
| 13 | Agentur-Sichtbarkeit |
| 14 | Kalenderfarben-Matrix |
| 15 | Flat Rate vs Day Rate |
| 16 | Buchung Monatsgrenze |
| 17 | Validierung Edge Cases |
| 18 | Doppelte Aktionen |
| 19 | Stornierung Pending |
| 20 | Open for More Jobs |
| 21 | Favoriten und Crewlisten |
| 22 | Freelancer-Suche, Profil, Crewlisten |
| 23 | Buchung neues Projekt |
| 24 | Buchung bestehendes Projekt, neue Phase |
| 25 | Buchung bestehendes Projekt, bestehende Phase |
| 26 | Buchung teilweise verfügbar |
| 27 | Buchung Option vs Fix |
| 28 | Buchung Ablehnung Alternative |
| 29 | Buchung aus Crewliste |

### Chat-Szenarien (`scenarios/`)

| Nr. | Szenario |
|-----|----------|
| 41 | Chat starten |
| 42 | Chat antworten |
| 43 | Buchung aus Chat |
| 44 | Buchungsreferenz Status-Update |
| 45 | Chat aus Crew-Liste |
| 46 | Freelancer zur Crew hinzufügen |
| 47 | Crew-Suche |
| 48 | Buchungsreferenz im Chat |
| 49 | Chat-Liste verwalten |
| 50 | Nachrichten-Workflow |

### UI-Szenarien (`ui-scenarios/`)

| Nr. | Szenario |
|-----|----------|
| UI-01 | Buttons |
| UI-02 | Colors |
| UI-03 | Empty States |
| UI-04 | Loading States |
| UI-05 | Modals |
| UI-06 | Spacing |
| UI-07 | Typography |
| UI-08 | Accessibility |

### Kombinierte Szenarien (`combined-scenarios/`)

Diese Szenarien kombinieren System- und UI-Agenten fuer End-to-End Validierung.

| Nr. | Szenario | Fokus |
|-----|----------|-------|
| 01 | Buchung mit Farb-Validierung | Kompletter Buchungsflow mit Farbpruefung nach jedem Schritt |
| 02 | Komplette Farb-Matrix | Alle Farbkombinationen aus allen Perspektiven |

## Farb-Referenz

| Status | Freelancer | Eigene Agentur | Fremde Agentur |
|--------|------------|----------------|----------------|
| *_pending | Lila | Lila | Gruen |
| option_confirmed | Gelb | Gelb | Gruen |
| fix_confirmed | Rot | Rot | Rot |
| fix + openForMore | Gestreift | Rot | Gruen |
