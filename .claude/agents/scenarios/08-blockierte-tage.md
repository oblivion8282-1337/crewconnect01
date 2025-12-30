# Szenario 08: Blockierte Tage

**Ziel:** Pruefen ob blockierte Tage korrekt behandelt werden.

## Vorbedingungen
- Anna Schmidt hat keine aktiven Buchungen
- Keine blockierten Tage vorhanden

## Schritte

### Schritt 1: Freelancer blockiert Tage
**Agent:** freelancer1
**Aktion:** Blockiere 10.-12. Januar (z.B. Urlaub)

**Erwartung:**
- Tage erscheinen als blockiert im Kalender
- Farbe: Grau oder spezieller Blocked-Status
- blockedDays Array enthaelt die Daten

---

### Schritt 2: Agentur sieht blockierte Tage
**Agent:** agentur1
**Aktion:** Oeffne Freelancer-Profil/Kalender von Anna

**Erwartung:**
- Blockierte Tage sind sichtbar (nicht buchbar)
- Tage sollten als "nicht verfuegbar" angezeigt werden

---

### Schritt 3: Agentur versucht Buchung auf blockierte Tage
**Agent:** agentur1
**Aktion:** Versuche Option fuer 10.-12. Januar zu erstellen

**Erwartung:**
- Buchung wird ABGELEHNT oder Warnung angezeigt
- ODER: Buchung wird erstellt aber Konflikt-Warnung
- Freelancer muss informiert werden

---

### Schritt 4: Agentur bucht teilweise ueberlappend
**Agent:** agentur1
**Aktion:** Versuche Option fuer 9.-11. Januar (1 Tag blockiert)

**Erwartung:**
- Warnung ueber Konflikt mit blockierten Tagen
- Buchung moeglich aber mit Hinweis?

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 1 | blockedDays aktualisiert | Ja |
| 2 | Blockierte Tage sichtbar | Ja |
| 3 | Buchung verhindert/gewarnt | Ja |

## Moegliche Implementierungen

1. **Harte Sperre:** Buchung auf blockierte Tage unmoeglich
2. **Weiche Sperre:** Buchung moeglich, Freelancer lehnt ab
3. **Warnung:** Agentur wird gewarnt, kann trotzdem buchen
