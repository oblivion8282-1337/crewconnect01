# UI-04: Loading States

## Ziel
Alle async-Operationen auf Loading-Feedback prüfen.

## Async-Operationen identifizieren

| Aktion | Erwartetes Feedback |
|--------|---------------------|
| Seite/Komponente laden | Skeleton oder Spinner |
| Formular absenden | Button disabled + Text/Spinner |
| Buchung erstellen | Modal Loading State |
| Buchung bestätigen/ablehnen | Button Loading |
| Daten nachladen | Inline Spinner |
| Suche ausführen | Search Loading Indicator |

## Prüfpunkte

### ui-checker2 (Hauptprüfer)
1. **Button-Loading**: Alle Buttons mit async onClick haben Loading State?
2. **Form-Submit**: Formulare zeigen Loading beim Absenden?
3. **Liste-Loading**: Listen zeigen Loading beim ersten Render?
4. **Inline-Loading**: Nachladen zeigt Indikator?

### ui-checker1 (Design)
1. **Spinner-Style**: Einheitlicher Spinner verwendet?
2. **Button-Text**: "Lädt...", "Speichern...", etc. konsistent?
3. **Opacity**: Loading Elemente mit `opacity-50`?
4. **Cursor**: `cursor-wait` bei Loading-Zuständen?

## Zu prüfende Komponenten

### Modals (kritisch)
- `BookFromProfileModal.jsx` - Buchung erstellen
- `RescheduleBookingModal.jsx` - Verschiebung anfragen
- `CancelBookingModal.jsx` - Stornierung
- `AddToListModal.jsx` - Zu Liste hinzufügen
- `AddFreelancerToCrewModal.jsx` - Zur Crew hinzufügen

### Dashboards
- `FreelancerDashboard.jsx` - Anfragen bearbeiten
- `AgencyBookings.jsx` - Buchungen verwalten

### Formulare
- `*Profile.jsx` - Profil speichern
- `ChatInput.jsx` - Nachricht senden

## Beispiel-Pattern (Korrekt)
```jsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await doSomething();
  } finally {
    setIsLoading(false);
  }
};

<button
  onClick={handleSubmit}
  disabled={isLoading}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin mr-2" />
      Speichern...
    </>
  ) : (
    'Speichern'
  )}
</button>
```

## Problematische Patterns
```jsx
// ❌ Kein Loading State
<button onClick={async () => await save()}>Speichern</button>

// ❌ Button nicht disabled während Loading
{isLoading && <Spinner />}
<button onClick={save}>Speichern</button>
```
