# UI-03: Empty States

## Ziel
Alle Listen und Daten-Ansichten auf Empty States prüfen.

## Komponenten mit Daten

| Komponente | Daten | Braucht Empty State |
|------------|-------|---------------------|
| FreelancerDashboard | Buchungsanfragen | Ja |
| AgencyBookings | Buchungslisten | Ja |
| CrewListsPage | Crew-Listen, Favoriten | Ja |
| ChatList | Chat-Konversationen | Ja |
| ProjectDetail | Phasen | Ja |
| PhaseDetail | Freelancer | Ja |
| BookingHistory | History-Einträge | Ja |
| FreelancerCalendar | Buchungen | Bedingt |

## Prüfpunkte

### ui-checker2 (Hauptprüfer)
1. **Vorhanden?**: Gibt es einen Check auf `length === 0` oder `!data`?
2. **Hilfreich?**: Erklärt der Text was zu tun ist?
3. **Icon?**: Passendes Icon zur Verdeutlichung?
4. **CTA?**: Button/Link für nächste Aktion vorhanden?
5. **Styling?**: Zentriert, nicht zu prominent, nicht zu versteckt?

### ui-checker1 (Design)
1. **Konsistenz**: Gleicher Stil über alle Empty States?
2. **Spacing**: Einheitlicher Abstand (`py-12`)?
3. **Icon-Größe**: Einheitlich (`w-12 h-12`)?
4. **Textfarbe**: `text-gray-500` für dezente Darstellung?

## Beispiel-Pattern (Korrekt)
```jsx
{items.length === 0 ? (
  <div className="text-center py-12">
    <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-medium text-gray-900">
      Keine Buchungen
    </h3>
    <p className="text-sm text-gray-500 mt-1">
      Du hast noch keine Buchungsanfragen erhalten.
    </p>
    <button className="mt-4 text-blue-600 hover:text-blue-700">
      Profil optimieren →
    </button>
  </div>
) : (
  items.map(item => ...)
)}
```

## Problematische Patterns
```jsx
// ❌ Kein Empty State
{items.map(item => ...)}

// ❌ Nur Text ohne Kontext
{items.length === 0 && <p>Keine Daten</p>}

// ❌ Versteckt/unklar
{items.length === 0 && null}
```

## Erwartetes Ergebnis
- Liste aller Komponenten OHNE Empty State
- Vorschläge für passende Empty-State-Texte
