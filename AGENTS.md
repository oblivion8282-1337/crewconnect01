# CrewConnect Agent Testing

## Verfügbare Test-User

### Freelancer
| ID | Name | Avatar | Berufe |
|----|------|--------|--------|
| 1 | Anna Schmidt | 👩‍🎨 | DoP, Kamera |
| 2 | Max Weber | 👨‍💻 | Editor, Colorist |
| 3 | Sarah Müller | 👩‍🎤 | Sound Design, Ton |

### Agenturen
| ID | Name | Logo | Standort |
|----|------|------|----------|
| 1 | Bluescreen Productions | 🎬 | Berlin |
| 2 | Redlight Studios | 🔴 | Hamburg |

---

## Agent-Anweisungen

### Agent: agentur1 (Bluescreen Productions)
**Rolle:** Agentur
**ID:** agencyId = 1

**Aufgaben:**
1. User-Switcher öffnen (Dropdown im Header)
2. "Bluescreen Productions" auswählen
3. Projekt "Werbespot Mercedes 2025" öffnen
4. In Phase "Drehphase" Freelancer suchen
5. Anna Schmidt (ID 1) für 3 Tage als **Option** buchen

**Navigation:**
- Dashboard → Projekt anklicken → Phase → "Freelancer suchen"
- Tage im Kalender auswählen → "Option anfragen"

---

### Agent: agentur2 (Redlight Studios)
**Rolle:** Agentur
**ID:** agencyId = 2

**Aufgaben:**
1. User-Switcher öffnen (Dropdown im Header)
2. "Redlight Studios" auswählen
3. Neues Projekt erstellen:
   - Name: "Musikvideo Neon"
   - Kunde: "Label XY"
   - Start: 2025-01-20
   - Ende: 2025-01-25
4. Phase hinzufügen: "Dreh"
5. Anna Schmidt (ID 1) für 2 Tage als **Option** buchen (gleiche Tage wie Agentur 1!)

**Erwartetes Ergebnis:**
- Beide Agenturen haben Optionen auf Anna Schmidt
- Anna sieht alle Anfragen in ihrem Dashboard

---

### Agent: freelancer1 (Anna Schmidt)
**Rolle:** Freelancer
**ID:** freelancerId = 1

**Aufgaben:**
1. User-Switcher öffnen
2. "Anna Schmidt" auswählen
3. Dashboard prüfen: Es sollten 2 Anfragen angezeigt werden
4. Anfrage von Bluescreen Productions **bestätigen** (als Option)
5. Anfrage von Redlight Studios **ablehnen**

**Alternativ-Szenario:**
- Beide Anfragen als Option bestätigen
- Dann entscheiden welche als Fix umgewandelt wird

---

### Agent: freelancer2 (Max Weber)
**Rolle:** Freelancer
**ID:** freelancerId = 2

**Aufgaben:**
1. User-Switcher öffnen
2. "Max Weber" auswählen
3. Kalender prüfen (sollte frei sein)
4. Profil bearbeiten

---

## Test-Workflows

### Workflow 1: Einfache Buchung
```
agentur1: Projekt öffnen → Phase → Freelancer suchen → Anna buchen (Option)
freelancer1: Dashboard → Anfrage bestätigen
agentur1: Buchungen → Option zu Fix umwandeln
freelancer1: Dashboard → Fix bestätigen
```

### Workflow 2: Konkurrenz um Freelancer
```
agentur1: Anna buchen für 15.-17. Januar (Option)
agentur2: Anna buchen für 16.-18. Januar (Option)
freelancer1: Beide Anfragen sehen → Eine bestätigen, eine ablehnen
```

### Workflow 3: Verschiebung
```
agentur1: Bestätigte Buchung verschieben wollen
freelancer1: Verschiebung bestätigen oder ablehnen
```

### Workflow 4: Stornierung
```
agentur1 ODER freelancer1: Bestätigte Buchung stornieren (mit Grund)
```

---

## UI-Elemente für Agenten

### Header
- **User-Switcher Dropdown:** Zeigt aktuellen User, Klick öffnet Liste aller User
- **Info-Bar:** Zeigt aktive IDs (Freelancer ID, Agentur ID, aktuelle Ansicht)
- **Rollen-Toggle:** Schnellwechsel zwischen aktueller Freelancer/Agentur-Ansicht

### Navigation (Freelancer)
- Dashboard: Buchungsanfragen
- Kalender: Verfügbarkeit
- Historie: Vergangene Buchungen
- Profil: Profildaten bearbeiten

### Navigation (Agentur)
- Projekte: Projektübersicht
- Buchungen: Alle Buchungen
- Historie: Vergangene Buchungen
- Profil: Agenturdaten bearbeiten

---

## Wichtige Hinweise

1. **Shared State:** Alle Agenten arbeiten auf demselben React State. Änderungen sind sofort für alle sichtbar.

2. **Bookings:** Buchungen werden im `bookings` Array gespeichert mit:
   - `freelancerId`: Gebuchter Freelancer
   - `agencyId`: Buchende Agentur
   - `projectId`, `phaseId`: Zugehöriges Projekt/Phase
   - `status`: pending, confirmed, declined, withdrawn, cancelled
   - `type`: option, fix

3. **Kalender-Farben:**
   - Grün: Verfügbar
   - Gelb: Pending/Option
   - Rot: Fix gebucht / Geblockt

4. **Sichtbarkeit:**
   - Freelancer sehen ALLE Anfragen an sie
   - Agenturen sehen nur IHRE eigenen Buchungen (andere sind "privat")
