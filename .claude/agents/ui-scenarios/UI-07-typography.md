# UI-07: Typografie-Konsistenz

## Ziel
Schriftgrößen und -gewichte auf Einheitlichkeit prüfen.

## Typografie-System

| Element | Klassen |
|---------|---------|
| Page Title | `text-2xl font-bold` oder `text-3xl font-bold` |
| Section Title | `text-xl font-semibold` |
| Card Title | `text-lg font-semibold` |
| Subtitle | `text-lg font-medium` |
| Body | `text-base` oder `text-sm` |
| Small/Caption | `text-xs text-gray-500` |
| Label | `text-sm font-medium text-gray-700` |
| Button Text | `font-medium` |
| Link | `text-blue-600 hover:text-blue-700` |

## Prüfpunkte

### ui-checker1 (Design)

**Headlines:**
- [ ] H1 (Page): `text-2xl font-bold` oder `text-3xl font-bold`
- [ ] H2 (Section): `text-xl font-semibold`
- [ ] H3 (Card): `text-lg font-semibold`
- [ ] Keine gemischten Größen für gleiche Hierarchie

**Body Text:**
- [ ] Standard: `text-sm` oder `text-base` (nicht beide)
- [ ] Sekundär: `text-gray-600` oder `text-gray-500`
- [ ] Labels: `font-medium` vorhanden

**Font Weights:**
- [ ] Bold nur für Headlines
- [ ] Semibold für Section/Card Titles
- [ ] Medium für Labels und Buttons
- [ ] Regular für Body Text

### ui-checker2 (Fehler)
1. **Lesbarkeit**: Text nicht zu klein (`text-xs` nur für Captions)
2. **Kontrast**: Grau-Texte auf hellem Hintergrund lesbar?
3. **Truncate**: Lange Texte mit `truncate` und `title` Attribut?
4. **Line-Height**: Mehrzeilige Texte mit `leading-relaxed`?

## Zu prüfende Patterns

### Headlines (pro View)
```jsx
// Page Title - sollte gleich sein überall
<h1 className="text-2xl font-bold">Buchungen</h1>
<h1 className="text-xl font-bold">Projekte</h1>  // ❌ Inkonsistent

// Section Title
<h2 className="text-xl font-semibold">Offene Anfragen</h2>
<h2 className="text-lg font-bold">Bestätigte</h2>  // ❌ Inkonsistent
```

### Labels
```jsx
// Form Labels
<label className="text-sm font-medium text-gray-700">Name</label>
<label className="text-xs font-semibold text-gray-600">Email</label>  // ❌

// Status Labels
<span className="text-xs font-medium">Pending</span>
<span className="text-sm font-normal">Active</span>  // ❌
```

### Body Text
```jsx
// Primary
<p className="text-sm text-gray-900">Beschreibung</p>
<p className="text-base text-gray-800">Andere</p>  // ❌

// Secondary
<p className="text-sm text-gray-500">Details</p>
<p className="text-xs text-gray-400">Meta</p>  // ❌ (zu verschiedene Stufen)
```

## Problematische Patterns
```jsx
// ❌ Inkonsistente Weights
<h2 className="font-bold">Title A</h2>
<h2 className="font-semibold">Title B</h2>

// ❌ Verschiedene Textgrößen für gleiches Element
<span className="text-sm">Item 1</span>
<span className="text-xs">Item 2</span>
<span className="text-base">Item 3</span>

// ❌ Fehlende Font-Weight bei Labels
<label>Name</label>  // Sollte font-medium haben
```

## Erwartetes Ergebnis
- Liste aller inkonsistenten Typografie-Verwendungen
- Empfehlung für einheitliches Type-System
