# Szenario 21: Favoriten und Crew-Listen

**Ziel:** Pruefen ob Agenturen Freelancer favorisieren und in Crew-Listen organisieren koennen.

## Konzept

Agenturen koennen:
- Freelancer als Favoriten markieren (Herz-Icon)
- Eigene Crew-Listen erstellen (mit Namen und Farbe)
- Freelancer zu Listen hinzufuegen/entfernen
- Listen umbenennen, Farbe aendern, loeschen

## Vorbedingungen
- Agentur ist eingeloggt
- Freelancer existieren im System

## Schritte

### Schritt 1: Freelancer favorisieren
**Agent:** agentur1
**Aktion:** Oeffne Freelancer-Suche, klicke auf Herz-Icon bei Anna Schmidt

**Erwartung:**
- Herz wird ausgefuellt (rot)
- Anna erscheint in "Meine Crew" → Favoriten-Sektion
- Favoriten-Count: 1

---

### Schritt 2: Weitere Freelancer favorisieren
**Agent:** agentur1
**Aktion:** Favorisiere Max Weber

**Erwartung:**
- Beide Freelancer in Favoriten-Liste
- Favoriten-Count: 2

---

### Schritt 3: Crew-Liste erstellen
**Agent:** agentur1
**Aktion:** Gehe zu "Meine Crew" → Klicke "Neue Liste" → Name: "Stammteam", Farbe: Blau

**Erwartung:**
- Liste "Stammteam" erscheint
- Farbe ist Blau
- Liste ist leer (0 Mitglieder)

---

### Schritt 4: Freelancer zur Liste hinzufuegen
**Agent:** agentur1
**Aktion:** Bei Anna → Dropdown → "Stammteam" auswaehlen

**Erwartung:**
- Anna ist in Liste "Stammteam"
- Haekchen erscheint bei "Stammteam" im Dropdown
- Liste zeigt "1 Mitglied"

---

### Schritt 5: Zweite Liste erstellen
**Agent:** agentur1
**Aktion:** Erstelle Liste "Kameraleute", Farbe: Gruen

**Erwartung:**
- Zwei Listen vorhanden: "Stammteam" (blau), "Kameraleute" (gruen)

---

### Schritt 6: Freelancer in mehreren Listen
**Agent:** agentur1
**Aktion:** Fuege Anna auch zu "Kameraleute" hinzu

**Erwartung:**
- Anna ist in beiden Listen
- Dropdown zeigt zwei Haekchen
- Beide Listen zeigen Anna als Mitglied

---

### Schritt 7: Liste umbenennen
**Agent:** agentur1
**Aktion:** "Stammteam" → Menu → Umbenennen → "A-Team"

**Erwartung:**
- Liste heisst jetzt "A-Team"
- Mitglieder bleiben erhalten

---

### Schritt 8: Listenfarbe aendern
**Agent:** agentur1
**Aktion:** "A-Team" → Menu → Farbe aendern → Lila

**Erwartung:**
- Farbe wechselt zu Lila
- Mitglieder bleiben erhalten

---

### Schritt 9: Freelancer aus Liste entfernen
**Agent:** agentur1
**Aktion:** In "A-Team" → Bei Anna → "Aus Liste entfernen" klicken

**Erwartung:**
- Anna ist nicht mehr in "A-Team"
- Anna bleibt in "Kameraleute"
- Anna bleibt Favorit

---

### Schritt 10: Favorit entfernen
**Agent:** agentur1
**Aktion:** Klicke erneut auf Herz bei Anna (de-favorisieren)

**Erwartung:**
- Anna ist kein Favorit mehr
- Anna bleibt in Crew-Listen (Listen sind unabhaengig von Favoriten)

---

### Schritt 11: Liste loeschen
**Agent:** agentur1
**Aktion:** "A-Team" → Menu → Liste loeschen → Bestaetigen

**Erwartung:**
- Liste "A-Team" ist geloescht
- "Kameraleute" bleibt erhalten
- Freelancer in geloeschter Liste bleiben im System

---

### Schritt 12: Agentur-Isolation pruefen
**Agent:** agentur2
**Aktion:** Gehe zu "Meine Crew"

**Erwartung:**
- Keine Favoriten (eigene Liste ist leer)
- Keine Crew-Listen
- Listen von Agentur 1 sind NICHT sichtbar

---

## Erfolgs-Kriterien

| Schritt | Pruefpunkt | Erwartet |
|---------|-----------|----------|
| 1 | Favorit hinzufuegen | Herz ausgefuellt |
| 3 | Liste erstellen | Liste mit Name + Farbe |
| 4 | Zu Liste hinzufuegen | Freelancer in Liste |
| 6 | Mehrere Listen | Freelancer in beiden |
| 7 | Umbenennen | Name geaendert |
| 8 | Farbe aendern | Farbe geaendert |
| 9 | Aus Liste entfernen | Nur aus einer Liste |
| 10 | Favorit entfernen | Bleibt in Listen |
| 11 | Liste loeschen | Liste weg, Freelancer bleiben |
| 12 | Agentur-Isolation | Getrennte Daten |

## Datenmodell-Pruefung

```javascript
// Nach Schritt 6 sollte State so aussehen:
favorites: {
  1: [1, 2]  // Agentur 1 hat Anna (1) und Max (2) als Favoriten
}

crewLists: {
  1: [
    { id: 123, name: "Stammteam", color: "blue", freelancerIds: [1] },
    { id: 124, name: "Kameraleute", color: "green", freelancerIds: [1] }
  ]
}
```

## UI-Elemente zu pruefen

1. **FavoriteButton**: Herz-Icon mit Dropdown
2. **CrewListsPage**: Favoriten-Sektion + Listen-Sektion
3. **AddToListModal**: Formular fuer neue Liste
4. **Sidebar**: "Meine Crew" Navigation (nur fuer Agenturen)

## Edge Cases

- Leerer Listenname → Sollte blockiert werden
- Liste mit gleichem Namen → Erlaubt (IDs sind unique)
- Freelancer loeschen → Was passiert mit Listen-Eintraegen?
