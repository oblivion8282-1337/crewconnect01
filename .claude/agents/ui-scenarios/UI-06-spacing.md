# UI-06: Spacing-Konsistenz

## Ziel
Abstände (Padding, Margin, Gap) auf Einheitlichkeit prüfen.

## Spacing-System (Tailwind)

| Wert | Verwendung |
|------|------------|
| `gap-2` / `space-y-2` | Kleine Elemente (Icons, Tags) |
| `gap-3` / `space-y-3` | Button-Gruppen, kleine Listen |
| `gap-4` / `space-y-4` | Standard für Listen, Formular-Felder |
| `gap-6` / `space-y-6` | Sections, größere Abstände |
| `gap-8` / `space-y-8` | Page-Sections |

## Prüfpunkte

### ui-checker1 (Design)

**Card Padding:**
- [ ] Cards: `p-4` oder `p-6` (nicht gemischt)
- [ ] List Items: `p-3` oder `p-4` (nicht gemischt)
- [ ] Modals: `p-6` (Header, Content, Footer)

**Section Gaps:**
- [ ] Page Sections: `gap-6` oder `gap-8`
- [ ] Card Lists: `gap-4`
- [ ] Form Fields: `space-y-4`

**Button Padding:**
- [ ] Standard: `px-4 py-2`
- [ ] Small: `px-3 py-1.5`
- [ ] Icon-only: `p-2`

**Margin vs Gap:**
- [ ] Flex/Grid: `gap-*` verwenden
- [ ] Einzelne Elemente: `mb-*` oder `mt-*`
- [ ] Keine `ml-*` / `mr-*` wo `gap` möglich

### ui-checker2 (Fehler)
1. **Overflow**: Fehlende Abstände verursachen Überlappung?
2. **Touch-Targets**: Min 44x44px für klickbare Elemente?
3. **Responsive**: Spacing passt sich auf Mobile an?

## Zu prüfende Bereiche

### Kritische Konsistenz
```jsx
// Cards sollten gleich sein:
<div className="p-4">  // oder
<div className="p-6">  // aber nicht gemischt

// Listen-Items:
<div className="p-3 hover:bg-gray-50">
<div className="p-4 hover:bg-gray-50">  // Welches?

// Form-Gruppen:
<div className="space-y-4">  // Konsistent
<div className="space-y-3">  // Inkonsistent
```

### Problematische Patterns
```jsx
// ❌ Margin statt Gap
<div className="flex">
  <div className="mr-4">Item 1</div>
  <div className="mr-4">Item 2</div>
</div>

// ✅ Gap verwenden
<div className="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// ❌ Inkonsistente Paddings
<div className="p-3">Card 1</div>
<div className="p-5">Card 2</div>
<div className="p-4">Card 3</div>

// ✅ Einheitlich
<div className="p-4">Card 1</div>
<div className="p-4">Card 2</div>
<div className="p-4">Card 3</div>
```

## Erwartetes Ergebnis
- Liste aller inkonsistenten Spacing-Werte
- Empfehlung für einheitliches Pattern
