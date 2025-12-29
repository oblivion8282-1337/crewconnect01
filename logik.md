# CREWCONNECT BUCHUNGSLOGIK - VOLLSTÄNDIGE DOKUMENTATION

Dies ist die komplette Logik für das Buchungssystem. Bitte halte dich exakt an diese Regeln.

---

## 1. ANFRAGE-TYPEN

Es gibt zwei Typen von Buchungsanfragen:

- **Option**: Unverbindliche Reservierung. Andere Agenturen können dieselben Tage auch anfragen. "First to fix wins" - wer zuerst zur Fixbuchung umwandelt und bestätigt wird, gewinnt.

- **Fixbuchung**: Verbindliche Buchung. Nach Bestätigung sind die Tage für alle anderen blockiert (rot).

---

## 2. KALENDER-FARBEN UND SICHTBARKEIT

Die Sichtbarkeit ist ZENTRAL für die Logik. Verschiedene Nutzer sehen verschiedene Farben:

### Farbcodes:
- 🟢 GRÜN = Verfügbar/Buchbar
- 🟡 GELB = Anfrage pending oder Option bestätigt
- 🔴 ROT = Fix gebucht oder geblockt (nicht buchbar)
- 🔴🟢 GESTREIFT = Gebucht/Geblockt aber offen für weitere Anfragen

### Sichtbarkeitsmatrix:

| Status | Freelancer sieht | Anfragende Agentur sieht | ANDERE Agenturen sehen |
|--------|------------------|--------------------------|------------------------|
| Verfügbar | 🟢 grün | - | 🟢 grün |
| Anfrage pending | 🟡 gelb | 🟡 gelb | 🟢 grün (!) |
| Option bestätigt | 🟡 gelb | 🟡 gelb | 🟢 grün (!) |
| Fix bestätigt | 🔴 rot | 🔴 rot | 🔴 rot |
| Fix + offen für mehr | 🔴🟢 gestreift | 🔴 rot | 🟢 grün |
| Selbst geblockt | 🔴 rot | - | 🔴 rot |
| Selbst geblockt + offen | 🔴🟢 gestreift | - | 🟢 grün |

WICHTIG: Pending-Anfragen und bestätigte Optionen sind PRIVAT! Andere Agenturen sehen diese Tage als GRÜN und können selbst anfragen!

---

## 3. KERNREGELN

### Regel 1: Pending = Pending
Egal ob Option-Anfrage oder Fix-Anfrage - solange sie "pending" ist, sehen andere Agenturen den Tag als GRÜN. Erst wenn eine FIXBUCHUNG BESTÄTIGT wird, wird der Tag ROT für alle.

### Regel 2: First to Fix Wins
- Mehrere Agenturen können dieselben Tage optionieren
- Freelancer kann mehrere überlappende Optionen bestätigen
- Freelancer sieht Warnung bei Überlappungen
- Sobald EINE Agentur ihre Option zur Fixbuchung macht UND der Freelancer bestätigt → diese Agentur gewinnt
- Andere Agenturen mit überlappenden Optionen werden benachrichtigt: "Deine optionierten Tage wurden anderweitig fix gebucht"
- Deren komplette Option fällt weg (nicht nur überlappende Tage)

### Regel 3: Alles oder Nichts
- Teilbuchung ist NICHT möglich
- Eine Option muss komplett zur Fixbuchung werden
- Will eine Agentur weniger Tage buchen → Option stornieren → neue Anfrage mit weniger Tagen stellen

### Regel 4: Keine automatische Ablehnung
- Wenn Freelancer eine Fixbuchung bestätigt, werden überlappende Anfragen/Optionen NICHT automatisch abgelehnt
- Freelancer entscheidet selbst was mit Überlappungen passiert
- Es gibt einen Convenience-Button "Alle überlappenden ablehnen"
- Das ermöglicht bewusste Mehrfachbuchung (z.B. für 3D Artists, Editoren)

### Regel 5: Überlappungs-Warnung
- Freelancer sieht deutliche Warnung wenn überlappende Anfragen existieren
- Überlappende Tage werden orange markiert
- Anzahl der Überlappungen wird angezeigt

---

## 4. CONFIRMED-OPEN (Mehrfachbuchung)

Freelancer kann fix gebuchte Tage auf "offen für weitere" setzen:

- Pro Tag einzeln steuerbar (nicht alle Tage einer Buchung müssen gleich sein)
- Kein Limit für parallele Buchungen
- Bestehende Buchungen werden NICHT beeinflusst
- Jede Agentur sieht nur ihre eigene Buchung als rot
- Andere Agenturen sehen den Tag als GRÜN und können anfragen
- Niemand weiß wie viele andere Buchungen existieren

### Use Cases:
- 3D Artist: Arbeitet remote, kann mehrere Projekte parallel
- Editor: Tagschicht für Projekt A, Nachtschicht für Projekt B
- Generell: Freelancer will Kalender maximal auslasten

### Auch ohne externe Buchung möglich:
Freelancer kann Tage selbst auf "geblockt aber offen" setzen (z.B. plant eigenes Projekt, würde aber für guten Job unterbrechen)

---

## 5. FREELANCER SELBST-VERWALTUNG

Freelancer kann Tage selbst verwalten:

| Ausgangsstatus | Mögliche Aktionen |
|----------------|-------------------|
| 🟢 Frei | → "Blocken" (wird rot für alle) ODER → "Blocken + offen" (gestreift, andere sehen grün) |
| 🟡 Anfrage/Option vorhanden | → ERST Anfrage ablehnen, DANN kann geblockt werden |
| 🔴 Fix gebucht | → "Offen für mehr" aktivieren |
| 🔴🟢 Fix + offen | → "Schließen" (zurück zu nur rot) |
| 🔴 Selbst geblockt | → "Freigeben" (wird grün) ODER → "Offen für Anfragen" (wird gestreift) |
| 🔴🟢 Selbst geblockt + offen | → "Komplett blocken" (wird rot) ODER → "Freigeben" (wird grün) |

WICHTIG: Gelbe Tage (pending/Option) können NICHT direkt geblockt werden - keine Doppelbelegung von Status!

---

## 6. STATUS-TYPEN FÜR BUCHUNGEN

| Status | Bedeutung | Wer setzt es |
|--------|-----------|--------------|
| `pending` | Anfrage wartet auf Antwort | System (bei neuer Anfrage) |
| `confirmed` | Bestätigt (kann Option oder Fix sein) | Freelancer bestätigt |
| `declined` | Abgelehnt (wurde nie angenommen) | Freelancer lehnt ab |
| `withdrawn` | Zurückgezogen vor Antwort | Agentur zieht zurück |
| `cancelled` | Nachträglich storniert (war bestätigt) | Freelancer oder Agentur |

---

## 7. STORNIERUNG

### Wer kann was stornieren:

| Wer | Was | Wann möglich |
|-----|-----|--------------|
| Freelancer | Pending ablehnen | Jederzeit |
| Freelancer | Option stornieren | Jederzeit |
| Freelancer | Fix stornieren | Jederzeit |
| Agentur | Pending zurückziehen | Bevor Freelancer antwortet |
| Agentur | Option stornieren | Jederzeit |
| Agentur | Fix stornieren | Jederzeit |

### Ablauf Stornierung:
1. Klick auf "Stornieren"
2. Modal öffnet sich
3. Grund eingeben (PFLICHTFELD)
4. Bestätigen
5. Status wird `cancelled`
6. Andere Partei bekommt Benachrichtigung mit Grund
7. Buchung wandert in Historie

### Zurückziehen (nur Agentur, nur bei pending):
- Ohne Grund möglich
- Status wird `withdrawn`
- Freelancer wird benachrichtigt

---

## 8. BENACHRICHTIGUNGEN

### Freelancer bekommt Notification bei:
- Neue Anfrage kommt rein (Option oder Fix)
- Agentur zieht Anfrage zurück
- Agentur storniert bestätigte Buchung
- Agentur wandelt Option → Fix um (neue Bestätigung nötig!)

### Agentur bekommt Notification bei:
- Freelancer bestätigt Anfrage
- Freelancer lehnt Anfrage ab
- Freelancer storniert bestätigte Buchung
- Eigene Option wurde durch Fix eines anderen überholt

---

## 9. OPTION ZU FIX UMWANDELN

Wenn eine Agentur eine bestätigte Option zur Fixbuchung machen will:

1. Agentur klickt "Fix buchen"
2. Anfrage geht an Freelancer (Status wird wieder `pending`, Type wird `fix`)
3. Freelancer MUSS erneut bestätigen
4. Erst nach Bestätigung werden Tage rot für alle

Die Fixbuchung ist NICHT automatisch - Freelancer hat Kontrolle!

---

## 10. ZUSAMMENFASSUNG FLOW

```
AGENTUR                                    FREELANCER
   |                                            |
   |-- Neue Anfrage (Option oder Fix) --------->|
   |   [Tage werden gelb für beide]             |
   |   [Andere Agenturen sehen GRÜN]            |
   |                                            |
   |<-------- Bestätigt / Abgelehnt ------------|
   |                                            |
   |   Bei Option bestätigt:                    |
   |   [Tage bleiben gelb]                      |
   |   [Andere sehen immer noch GRÜN]           |
   |                                            |
   |-- "Fix buchen" (Option → Fix) ------------>|
   |   [Freelancer muss erneut bestätigen]      |
   |                                            |
   |<-------- Fix bestätigt --------------------|
   |   [Tage werden ROT für ALLE]               |
   |   [Freelancer kann "offen für mehr" setzen]|
   |                                            |
```

---

Diese Dokumentation ist verbindlich für die Implementierung. Bei Unklarheiten frag nach!
