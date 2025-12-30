# UI-02: Farbkonsistenz

## Ziel
Alle Farben auf einheitliche Verwendung prüfen.

## Farbpalette (Soll)

### Primary (Blue)
- `blue-600` - Primary Action Background
- `blue-700` - Primary Hover
- `blue-500` - Links, Focus-Ring
- `blue-100` - Light Background

### Gray (Neutral)
- `gray-900` - Haupttext
- `gray-700` - Sekundärtext
- `gray-500` - Tertiärtext, Placeholder
- `gray-400` - Disabled Text
- `gray-300` - Borders
- `gray-200` - Divider
- `gray-100` - Light Background
- `gray-50` - Hover Background

### Status-Farben
- `red-600/700` - Danger, Fix-Buchung
- `green-600/700` - Success, Verfügbar
- `yellow-500/600` - Warning, Option
- `purple-600` - Pending

## Prüfpunkte

### ui-checker1 (Design)
1. **Text-Farben**: Konsistent `gray-900`, `gray-700`, `gray-500`?
2. **Status-Badges**: Einheitliche Farben je Status?
3. **Links**: Alle `text-blue-600 hover:text-blue-700`?
4. **Borders**: Konsistent `border-gray-200` oder `border-gray-300`?
5. **Hardcoded Farben**: Keine Hex-Codes wie `#ffffff`?

### ui-checker2 (Fehler)
1. **Kontrast**: Text auf Hintergrund lesbar?
2. **Focus-States**: `focus:ring-2 focus:ring-blue-500` vorhanden?
3. **Hover-States**: Alle interaktiven Elemente haben Hover?
4. **Dark Mode**: (Falls vorhanden) Farben angepasst?

## Dateien prüfen
- `src/components/**/*.jsx`
- `src/constants/calendar.js` (Status-Farben)

## Problematische Patterns
```jsx
// ❌ Inkonsistent
className="text-gray-800"  // Soll: gray-900 oder gray-700
className="bg-blue-500"    // Soll: blue-600 für Buttons
className="border-gray-400" // Soll: gray-200 oder gray-300

// ❌ Hardcoded
style={{ color: '#333' }}
```
