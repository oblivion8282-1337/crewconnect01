# Szenario 12: Verschiebung auf Konflikt-Tage

**Ziel:** Pruefen was passiert wenn Verschiebung auf bereits belegte Tage angefragt wird.

## Vorbedingungen
- Buchung A: 15.-17. Januar (fix_confirmed)
- Buchung B: 22.-24. Januar (option_confirmed, andere Agentur)

## Schritte

### Schritt 1: Ausgangslage pruefen
**Agent:** supervisor
**Aktion:** Pruefe beide Buchungen

**Erwartung:**
- Buchung A: Bluescreen, 15.-17., fix_confirmed
- Buchung B: Redlight, 22.-24., option_confirmed
- Kalender: 15.-17. Rot, 22.-24. Gelb

---

### Schritt 2: Verschiebung auf belegte Tage anfragen
**Agent:** agentur1
**Aktion:** Verschiebe Buchung A von 15.-17. auf 22.-24. Januar

**Erwartung (Variante A - Warnung):**
- Warnung: "Diese Tage haben bereits Buchungen"
- Verschiebung trotzdem moeglich (Freelancer entscheidet)

**Erwartung (Variante B - Sperre):**
- Verschiebung wird blockiert
- Fehlermeldung: "Tage nicht verfuegbar"

---

### Schritt 3: Freelancer sieht Konflikt
**Agent:** freelancer1
**Aktion:** Pruefe Verschiebungsanfrage

**Erwartung:**
- Konflikt-Warnung sichtbar
- Hinweis: "Neue Tage ueberschneiden sich mit anderer Buchung"
- Kann bestaetigen ODER ablehnen

---

### Schritt 4: Freelancer-Entscheidung
**Agent:** freelancer1
**Aktion:** Entscheide ueber Verschiebung

**Bei Bestaetigung:**
- Buchung A verschoben auf 22.-24.
- Buchung B hat jetzt Konflikt
- Freelancer muss Buchung B ggf. stornieren

**Bei Ablehnung:**
- Buchung A bleibt auf 15.-17.
- Keine Aenderung bei Buchung B

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 2 | Konflikt erkannt | Ja |
| 3 | Warnung angezeigt | Ja |
| 4 | Freelancer kann entscheiden | Ja |

## Wichtige Fragen

1. Soll Verschiebung auf Fix-Tage erlaubt sein? (Wahrscheinlich NEIN)
2. Soll Verschiebung auf Option-Tage erlaubt sein? (Wahrscheinlich JA mit Warnung)
3. Was passiert mit der anderen Buchung nach Bestaetigung?
