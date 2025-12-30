# UI-01: Button-Konsistenz

## Ziel
Alle Buttons im Projekt auf einheitliches Styling prüfen.

## Prüfpunkte

### ui-checker1 (Design)
1. **Basis-Klassen**: Haben alle Buttons `rounded-lg`, `font-medium`, `transition-colors`?
2. **Primary Buttons**: Einheitlich `bg-blue-600 hover:bg-blue-700 text-white`?
3. **Secondary Buttons**: Einheitlich `bg-gray-100 hover:bg-gray-200 text-gray-700`?
4. **Danger Buttons**: Einheitlich `bg-red-600 hover:bg-red-700 text-white`?
5. **Ghost Buttons**: Konsistenter Hover-State?
6. **Icon-Buttons**: Gleiche Größe (`p-2 rounded-lg`)?

### ui-checker2 (Fehler)
1. **Disabled State**: `disabled:opacity-50 disabled:cursor-not-allowed` vorhanden?
2. **Loading State**: Buttons mit async-Aktionen haben Loading-Indikator?
3. **Cursor**: `cursor-pointer` bei allen klickbaren Buttons?
4. **Accessibility**: Icon-only Buttons haben `aria-label`?

## Dateien prüfen
- `src/components/**/*.jsx` (alle)

## Erwartetes Ergebnis
Liste aller inkonsistenten Buttons mit Zeile und Fix-Vorschlag.

## Beispiel-Pattern (Korrekt)
```jsx
<button
  onClick={handleClick}
  disabled={isLoading}
  className="px-4 py-2 rounded-lg font-medium transition-colors
             bg-blue-600 text-white hover:bg-blue-700
             disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? <Spinner /> : 'Text'}
</button>
```
