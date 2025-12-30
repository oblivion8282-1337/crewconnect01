# Testszenario 27: Option vs. Fix Buchung

## Übersicht
Testen der Unterschiede zwischen Option und Fix Buchungen im Buchungsflow.

## Agenten-Rollen
| Agent | Rolle | Beschreibung |
|-------|-------|--------------|
| agentur1 | Bluescreen Productions | Testet beide Buchungstypen |
| agentur2 | Redlight Studios | Prüft Sichtbarkeit |
| freelancer1 | Anna Schmidt | Bearbeitet Anfragen |
| supervisor | Orchestrator | Validiert Unterschiede |

---

## Teil A: Option-Buchung

### Schritt A1: Option erstellen
**Agent:** agentur1
**Aktion:**
- Buche Anna Schmidt für 10.-12. Februar
- Wähle Typ: "Option"
- Sende Anfrage
**Erwartung:** Button zeigt "Option anfragen"

### Schritt A2: Status prüfen
**Agent:** supervisor
**Prüfung:**
- [ ] Buchung hat type = "option"
- [ ] Buchung hat status = "pending"

### Schritt A3: Freelancer sieht Anfrage
**Agent:** freelancer1
**Aktion:** Prüfe Anfragen-Liste
**Erwartung:** Anfrage zeigt "Option" Badge

### Schritt A4: Freelancer bestätigt
**Agent:** freelancer1
**Aktion:** Bestätige Option
**Erwartung:** Status = "confirmed", type bleibt "option"

### Schritt A5: Sichtbarkeit für andere Agentur
**Agent:** agentur2
**Aktion:** Öffne Profil von Anna Schmidt, prüfe Kalender
**Erwartung:**
- [ ] 10.-12. Februar sind GRÜN (Option ist privat!)
- [ ] Agentur 2 sieht keine Buchung

---

## Teil B: Fix-Buchung

### Schritt B1: Fix erstellen
**Agent:** agentur1
**Aktion:**
- Buche Anna Schmidt für 15.-17. Februar
- Wähle Typ: "Fix"
- Sende Anfrage
**Erwartung:** Button zeigt "Fix buchen"

### Schritt B2: Status prüfen
**Agent:** supervisor
**Prüfung:**
- [ ] Buchung hat type = "fix"
- [ ] Buchung hat status = "pending"

### Schritt B3: Freelancer sieht Anfrage
**Agent:** freelancer1
**Aktion:** Prüfe Anfragen-Liste
**Erwartung:** Anfrage zeigt "Fix" Badge (grün)

### Schritt B4: Freelancer bestätigt
**Agent:** freelancer1
**Aktion:** Bestätige Fix
**Erwartung:** Status = "confirmed", type bleibt "fix"

### Schritt B5: Sichtbarkeit für andere Agentur
**Agent:** agentur2
**Aktion:** Öffne Profil von Anna Schmidt, prüfe Kalender
**Erwartung:**
- [ ] 15.-17. Februar sind ROT (Fix ist öffentlich!)
- [ ] Agentur 2 sieht die Buchung

---

## Teil C: Option zu Fix umwandeln

### Schritt C1: Option umwandeln
**Agent:** agentur1
**Aktion:**
- Gehe zu Buchungen
- Finde Option für 10.-12. Februar
- Klicke "Zu Fix umwandeln"
**Erwartung:** Buchung wird aktualisiert

### Schritt C2: Status nach Umwandlung
**Agent:** supervisor
**Prüfung:**
- [ ] type = "fix"
- [ ] status = "pending" (muss erneut bestätigt werden)

### Schritt C3: Freelancer bestätigt Fix
**Agent:** freelancer1
**Aktion:** Bestätige Fix-Umwandlung
**Erwartung:** status = "confirmed"

### Schritt C4: Sichtbarkeit geändert
**Agent:** agentur2
**Aktion:** Prüfe Kalender für Anna Schmidt
**Erwartung:**
- [ ] 10.-12. Februar sind jetzt ROT (war vorher grün!)
- [ ] Sichtbarkeit hat sich geändert

---

## Supervisor-Validierung

### Unterschiede Option vs. Fix

| Aspekt | Option | Fix |
|--------|--------|-----|
| Button-Text | "Option anfragen" | "Fix buchen" |
| Button-Farbe | Gelb | Grün |
| Sichtbarkeit (pending) | Privat (grün) | Öffentlich (gelb) |
| Sichtbarkeit (confirmed) | Privat (grün) | Öffentlich (rot) |
| Verbindlichkeit | Unverbindlich | Verbindlich |

### Korrekte Status-Flows
```
Option:
pending → confirmed (Freelancer akzeptiert)
pending → declined (Freelancer lehnt ab)
confirmed → fix-pending (Agentur wandelt um)

Fix:
pending → confirmed (Freelancer akzeptiert)
pending → declined (Freelancer lehnt ab)
```

---

## Erwartetes Ergebnis
Option und Fix Buchungen verhalten sich unterschiedlich bezüglich Sichtbarkeit und können korrekt umgewandelt werden.
