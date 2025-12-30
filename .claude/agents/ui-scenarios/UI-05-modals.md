# UI-05: Modal-Konsistenz

## Ziel
Alle Modals auf einheitliches Verhalten und Design prüfen.

## Modal-Liste

| Modal | Zweck |
|-------|-------|
| BookFromProfileModal | Buchung erstellen |
| RescheduleBookingModal | Verschiebung anfragen |
| CancelBookingModal | Stornierung bestätigen |
| FreelancerSearchModal | Freelancer suchen |
| AddToListModal | Zu Crew-Liste hinzufügen |
| AddFreelancerToCrewModal | Crew-Mitglied hinzufügen |
| ResizableModal | Basis-Modal (shared) |

## Prüfpunkte

### ui-checker1 (Design)
1. **Overlay**: `bg-black/50` oder `bg-gray-900/50`?
2. **Modal-Container**: `bg-white rounded-lg shadow-xl`?
3. **Padding**: Einheitlich `p-6`?
4. **Header**: `text-xl font-semibold` + X-Button?
5. **Footer**: Actions rechts ausgerichtet, Gap `gap-3`?
6. **Max-Width**: `max-w-md`, `max-w-lg`, `max-w-xl` sinnvoll?
7. **Zentriert**: `flex items-center justify-center`?

### ui-checker2 (Fehler)
1. **Schließen via Overlay**: Klick auf Overlay schließt Modal?
2. **Schließen via Escape**: ESC-Taste funktioniert?
3. **X-Button**: Immer vorhanden und funktioniert?
4. **Scroll bei langem Content**: `overflow-y-auto max-h-[80vh]`?
5. **Mobile**: Nicht zu breit, nicht zu hoch?
6. **Body-Scroll-Lock**: Hintergrund scrollt nicht?
7. **Focus-Trap**: Tab bleibt im Modal?
8. **Auto-Focus**: Erstes Input bekommt Focus?

## Beispiel-Pattern (Korrekt)
```jsx
{isOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/50" />

    {/* Modal */}
    <div
      className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold">Titel</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto">
        {/* ... */}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 p-6 border-t">
        <button onClick={onClose}>Abbrechen</button>
        <button onClick={onSubmit}>Bestätigen</button>
      </div>
    </div>
  </div>
)}
```

## Problematische Patterns
```jsx
// ❌ Kein Overlay-Click-to-Close
<div className="modal" onClick={e => e.stopPropagation()}>

// ❌ Kein X-Button
<div className="modal-header">
  <h2>Titel</h2>
</div>

// ❌ Kein Scroll bei langem Content
<div className="modal-content">
  {veryLongContent}
</div>

// ❌ Inkonsistentes Padding
<div className="p-4">  {/* vs p-6 in anderen Modals */}
```
