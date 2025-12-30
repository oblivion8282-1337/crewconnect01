# UI-08: Accessibility (A11y)

## Ziel
Basis-Accessibility-Anforderungen prüfen.

## Prüfpunkte

### ui-checker2 (Hauptprüfer)

**1. Buttons & Links**
- [ ] Icon-only Buttons haben `aria-label`
- [ ] Buttons haben sichtbaren Text oder `aria-label`
- [ ] Links beschreiben Ziel (nicht "hier klicken")
- [ ] Disabled Buttons haben `disabled` Attribut (nicht nur Styling)

**2. Formulare**
- [ ] Alle Inputs haben `<label>` oder `aria-label`
- [ ] Labels sind mit `htmlFor` verknüpft
- [ ] Required-Felder sind markiert
- [ ] Fehlermeldungen mit `aria-describedby` verknüpft

**3. Bilder & Icons**
- [ ] Dekorative Icons haben `aria-hidden="true"`
- [ ] Bedeutungstragende Icons haben `aria-label`
- [ ] Images haben `alt` Attribut

**4. Keyboard Navigation**
- [ ] Alle interaktiven Elemente sind fokussierbar
- [ ] Focus-State ist sichtbar (`focus:ring-2`)
- [ ] Tab-Reihenfolge ist logisch
- [ ] Modale haben Focus-Trap

**5. Semantik**
- [ ] Richtige Heading-Hierarchie (h1 → h2 → h3)
- [ ] Listen verwenden `<ul>`/`<ol>` statt `<div>`
- [ ] Buttons sind `<button>`, Links sind `<a>`
- [ ] `role` Attribute wo nötig

### ui-checker1 (Design)
1. **Kontrast**: Text-zu-Hintergrund-Verhältnis ausreichend?
2. **Focus-Style**: Konsistent `focus:ring-2 focus:ring-blue-500`?
3. **Touch-Target**: Min 44x44px für Mobile?

## Kritische Komponenten

### Modals
```jsx
// ❌ Fehlt
<div className="modal">
  <button onClick={close}>×</button>
</div>

// ✅ Korrekt
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <button onClick={close} aria-label="Schließen">×</button>
</div>
```

### Icon-Buttons
```jsx
// ❌ Fehlt aria-label
<button onClick={edit}>
  <Pencil className="w-4 h-4" />
</button>

// ✅ Korrekt
<button onClick={edit} aria-label="Bearbeiten">
  <Pencil className="w-4 h-4" aria-hidden="true" />
</button>
```

### Formulare
```jsx
// ❌ Kein Label
<input type="text" placeholder="Name" />

// ✅ Korrekt
<label htmlFor="name" className="...">Name</label>
<input id="name" type="text" />

// oder
<input type="text" aria-label="Name" placeholder="Name" />
```

### Focus-States
```jsx
// ❌ Nur Hover
<button className="hover:bg-blue-700">Action</button>

// ✅ Mit Focus
<button className="hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Action
</button>
```

## Schweregrade

| Problem | Schweregrad |
|---------|-------------|
| Keine keyboard-Zugänglichkeit | 🔴 KRITISCH |
| Fehlender `aria-label` bei Icon-Buttons | 🟠 HOCH |
| Fehlende Focus-States | 🟠 HOCH |
| Fehlende Labels bei Inputs | 🟠 HOCH |
| Inkonsistente Focus-Styles | 🟡 MITTEL |
| Dekorative Icons ohne `aria-hidden` | ⚪ NIEDRIG |

## Erwartetes Ergebnis
- Liste aller A11y-Probleme nach Schweregrad
- Konkrete Fixes für kritische Probleme
