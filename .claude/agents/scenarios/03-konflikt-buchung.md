# Szenario 03: Konflikt-Buchung

**Ziel:** Prüfen ob überlappende Buchungen korrekt als Konflikt erkannt werden.

## Vorbedingungen
- Anna Schmidt hat KEINE blockierten Tage
- Keine aktiven Buchungen

## Schritte

### Schritt 1: Erste Buchung (Agentur 1)
**Agent:** agentur1
**Aktion:** Erstelle Option für Anna, 15.-17. Januar

**Erwartung:**
- Buchung erstellt mit status = `option_pending`
- Kalender: 15., 16., 17. Januar = 🟣 Lila

---

### Schritt 2: Überlappende Buchung (Agentur 2)
**Agent:** agentur2
**Aktion:** Erstelle Option für Anna, 16.-18. Januar (ÜBERLAPPUNG am 16. & 17.)

**Erwartung:**
- Buchung wird TROTZDEM erstellt (Optionen blockieren nicht!)
- Status = `option_pending`
- Beide Buchungen existieren parallel

---

### Schritt 3: Freelancer sieht Konflikt
**Agent:** freelancer1
**Aktion:** Öffne Dashboard "Ausstehend"

**Erwartung:**
- BEIDE Anfragen sichtbar
- Konflikt-Warnung: "Terminkonflikt erkannt!"
- Überlappende Tage (16., 17.) sind markiert
- Badge zeigt Anzahl der Konflikte

---

### Schritt 4: Freelancer bestätigt EINE Anfrage
**Agent:** freelancer1
**Aktion:** Bestätige Anfrage von Bluescreen (15.-17.)

**Erwartung:**
- Bluescreen-Buchung: status = `option_confirmed`
- Redlight-Buchung: bleibt `option_pending`
- Konflikt-Warnung bleibt (weil Redlight noch pending)

---

### Schritt 5: Freelancer lehnt andere ab
**Agent:** freelancer1
**Aktion:** Lehne Anfrage von Redlight ab

**Erwartung:**
- Redlight-Buchung: status = `declined`
- Konflikt-Warnung verschwindet
- Nur noch eine aktive Buchung

---

## Erfolgs-Kriterien

| Schritt | Prüfpunkt | Erwartet |
|---------|-----------|----------|
| 2 | Überlappende Buchung möglich | JA (Optionen blockieren nicht) |
| 3 | Konflikt-Warnung | Sichtbar |
| 3 | Überlappende Tage markiert | 16., 17. Januar |
| 4 | Erste bestätigt | option_confirmed |
| 5 | Zweite abgelehnt | declined |

## Wichtig

⚠️ **KEIN automatisches Ablehnen!**
- Wenn Agentur 1 bestätigt wird, wird Agentur 2 NICHT automatisch abgelehnt
- Der Freelancer muss selbst entscheiden
- Beide Buchungen können theoretisch bestätigt werden (Freelancer-Entscheidung)
