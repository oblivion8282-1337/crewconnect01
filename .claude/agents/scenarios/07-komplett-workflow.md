# Szenario 07: Kompletter Workflow

**Ziel:** End-to-End Test des gesamten Buchungsprozesses mit allen Agenten.

## Übersicht

```
agentur1 ─────────────────────────────────────────────────────►
          │                           │                      │
          │ Option erstellen          │ Fix umwandeln        │ Verschieben
          ▼                           ▼                      ▼
freelancer1 ◄─────────────────────────────────────────────────
            │                                               │
            │ Bestätigen                                    │ Bestätigen
            ▼                                               ▼
agentur2 ──────────────────────────────────────────────────►
          │                           │
          │ Konflikt-Buchung          │ Abgelehnt
          ▼                           ▼
```

## Schritte

### Phase 1: Erste Buchung

**Schritt 1.1:** [agentur1] Option erstellen
- Anna Schmidt, 15.-17. Januar, Mercedes-Projekt
- Erwartung: status = `option_pending`, Kalender 🟣

**Schritt 1.2:** [freelancer1] Option bestätigen
- Erwartung: status = `option_confirmed`, Kalender 🟡

---

### Phase 2: Konkurrenz

**Schritt 2.1:** [agentur2] Konflikt-Buchung erstellen
- Anna Schmidt, 16.-18. Januar, Neon Dreams-Projekt
- Überlappung: 16., 17. Januar
- Erwartung: Buchung erstellt, Konflikt-Warnung

**Schritt 2.2:** [freelancer1] Konflikt prüfen
- Erwartung: Warnung sichtbar, beide Anfragen da

**Schritt 2.3:** [freelancer1] Konflikt-Buchung ablehnen
- Erwartung: Redlight-Buchung = `declined`

---

### Phase 3: Fix-Umwandlung

**Schritt 3.1:** [agentur1] Option zu Fix
- Erwartung: DIREKT `fix_confirmed` (keine Pending-Phase!)
- Kalender: 🟡 → 🔴

**Schritt 3.2:** [freelancer1] Fix prüfen
- Erwartung: Keine neue Anfrage, Kalender 🔴

---

### Phase 4: Verschiebung

**Schritt 4.1:** [agentur1] Verschiebung anfragen
- Neue Tage: 20.-22. Januar
- Erwartung: reschedule Objekt erstellt

**Schritt 4.2:** [freelancer1] Verschiebung bestätigen
- Erwartung: dates aktualisiert, alte Tage frei

---

### Phase 5: Zweite Buchung (parallel)

**Schritt 5.1:** [agentur1] Zweite Buchung für Max Weber
- Post-Production Phase, 1.-5. Februar
- Erwartung: Unabhängig von Anna-Buchung

**Schritt 5.2:** [freelancer2] Bestätigen
- Erwartung: status = `option_confirmed`

---

## Erfolgs-Matrix

| Phase | Schritt | Agent | Erwartung | Status |
|-------|---------|-------|-----------|--------|
| 1 | 1.1 | agentur1 | option_pending | ⬜ |
| 1 | 1.2 | freelancer1 | option_confirmed | ⬜ |
| 2 | 2.1 | agentur2 | Konflikt erstellt | ⬜ |
| 2 | 2.2 | freelancer1 | Warnung sichtbar | ⬜ |
| 2 | 2.3 | freelancer1 | declined | ⬜ |
| 3 | 3.1 | agentur1 | fix_confirmed (direkt!) | ⬜ |
| 3 | 3.2 | freelancer1 | Keine neue Anfrage | ⬜ |
| 4 | 4.1 | agentur1 | reschedule Objekt | ⬜ |
| 4 | 4.2 | freelancer1 | dates aktualisiert | ⬜ |
| 5 | 5.1 | agentur1 | Zweite Buchung | ⬜ |
| 5 | 5.2 | freelancer2 | option_confirmed | ⬜ |

## Finale Validierung

Nach Abschluss aller Schritte:

```
BOOKING 1 (Anna/Mercedes):
- status: fix_confirmed
- dates: ['2025-01-20', '2025-01-21', '2025-01-22']
- Kalender: 🔴 Rot

BOOKING 2 (Anna/Neon Dreams):
- status: declined
- Nicht mehr aktiv

BOOKING 3 (Max/Mercedes Post):
- status: option_confirmed
- dates: ['2025-02-01', ..., '2025-02-05']
- Kalender: 🟡 Gelb
```
