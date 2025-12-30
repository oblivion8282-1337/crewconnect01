# Szenario 13: Agentur-Sichtbarkeit (KRITISCH)

**Ziel:** Pruefen ob Agenturen NUR ihre eigenen Buchungen sehen und NICHT die Optionen anderer Agenturen.

## Vorbedingungen
- Agentur 1 (Bluescreen) hat Option fuer Anna (15.-17.)
- Agentur 2 (Redlight) hat keine Buchungen fuer Anna

## Schritte

### Schritt 1: Agentur 1 erstellt Option
**Agent:** agentur1
**Aktion:** Erstelle Option fuer Anna, 15.-17. Januar

**Erwartung:**
- Buchung erstellt mit agencyId = 1
- Status: option_pending oder option_confirmed

---

### Schritt 2: Agentur 1 sieht eigene Buchung
**Agent:** agentur1
**Aktion:** Pruefe Buchungsliste und Kalender

**Erwartung:**
- Buchung ist sichtbar in Liste
- Kalender zeigt 15.-17. als GELB (eigene Option)
- Alle Details einsehbar

---

### Schritt 3: Agentur 2 prueft Kalender (KRITISCH!)
**Agent:** agentur2
**Aktion:** Oeffne Anna's Kalender/Verfuegbarkeit

**Erwartung:**
- 15.-17. Januar erscheinen als GRUEN (frei/verfuegbar)!
- KEINE Information ueber Bluescreen-Option
- Agentur 2 soll NICHT wissen, dass andere Agentur Option hat

---

### Schritt 4: Agentur 2 prueft Buchungsliste
**Agent:** agentur2
**Aktion:** Pruefe eigene Buchungsliste

**Erwartung:**
- Bluescreen-Buchung ist NICHT sichtbar
- Nur eigene Buchungen werden angezeigt

---

### Schritt 5: Nach Fix-Umwandlung
**Agent:** agentur1
**Aktion:** Wandle Option in Fix um

**Erwartung fuer Agentur 2:**
- JETZT zeigt Kalender 15.-17. als ROT (blockiert)
- Fix-Buchungen sind fuer alle sichtbar (Tage belegt)
- ABER: Projektname/Details von Bluescreen NICHT sichtbar

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 3 | Fremde Option sichtbar? | NEIN! |
| 3 | Kalenderfarbe fuer fremde Option | GRUEN |
| 4 | Fremde Buchung in Liste? | NEIN! |
| 5 | Fix sichtbar im Kalender? | JA (nur Rot, keine Details) |

## Sichtbarkeitsmatrix

| Buchungstyp | Eigene Agentur | Fremde Agentur |
|-------------|----------------|----------------|
| option_pending | Lila | GRUEN (unsichtbar) |
| option_confirmed | Gelb | GRUEN (unsichtbar) |
| fix_pending | Lila | GRUEN (unsichtbar) |
| fix_confirmed | Rot | Rot (blockiert) |

## KRITISCHE FEHLER

- Wenn Agentur 2 die Option von Agentur 1 sehen kann = DATENSCHUTZ-VERLETZUNG
- Wenn Agentur 2 Projektdetails von Agentur 1 sieht = GESCHAEFTSGEHEIMNIS
