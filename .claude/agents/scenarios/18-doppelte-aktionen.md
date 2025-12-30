# Szenario 18: Doppelte Aktionen (Race Conditions)

**Ziel:** Pruefen ob doppelte/schnelle Klicks korrekt behandelt werden.

## Vorbedingungen
- Aktive Buchungen in verschiedenen Status

## Test-Faelle

### Test 1: Doppelter Accept-Klick
**Agent:** freelancer1
**Aktion:** Klicke 2x schnell auf "Bestaetigen"

**Erwartung:**
- Buchung wird nur 1x bestaetigt
- Kein Fehler/Crash
- Status: option_confirmed (nicht doppelt)

---

### Test 2: Accept + Decline gleichzeitig
**Agent:** freelancer1
**Aktion:** Versuche gleichzeitig Accept und Decline

**Erwartung:**
- Nur eine Aktion wird ausgefuehrt
- Keine inkonsistenten Daten
- Entweder confirmed ODER declined

---

### Test 3: Doppelter Fix-Klick
**Agent:** agentur1
**Aktion:** Klicke 2x schnell auf "Fix"

**Erwartung:**
- Option wird nur 1x zu Fix
- Keine doppelten Notifications
- Status bleibt fix_confirmed

---

### Test 4: Gleichzeitige Stornierung
**Agent:** agentur1 + freelancer1
**Aktion:** Beide versuchen gleichzeitig zu stornieren

**Erwartung:**
- Buchung wird 1x storniert
- Nur eine Notification
- Keine Race Condition

---

### Test 5: Buchung waehrend anderer bestaetigt
**Agent:** agentur2
**Aktion:** Erstelle Buchung genau wenn freelancer1 andere bestaetigt

**Erwartung:**
- Beide Aktionen erfolgreich
- Keine Datenkorruption
- Konflikte werden nachtraeglich erkannt

---

## Erfolgs-Kriterien

| Test | Pruefpunkt | Erwartet |
|------|-----------|----------|
| 1 | Doppelter Accept | Nur 1x ausgefuehrt |
| 2 | Accept+Decline | Eine Aktion |
| 3 | Doppelter Fix | Nur 1x |
| 4 | Gleichzeitige Stornierung | 1x storniert |
| 5 | Parallele Aktionen | Beide OK |

## Implementierungs-Strategien

### 1. Optimistic UI mit Guard
```javascript
const [isProcessing, setIsProcessing] = useState(false);

const handleAccept = async () => {
  if (isProcessing) return; // Guard
  setIsProcessing(true);
  try {
    await acceptBooking(booking);
  } finally {
    setIsProcessing(false);
  }
};
```

### 2. Button Disable
```jsx
<button
  onClick={handleAccept}
  disabled={isProcessing}
>
  Bestaetigen
</button>
```

### 3. Status-Check vor Aktion
```javascript
const acceptBooking = (booking) => {
  // Pruefe ob noch im erwarteten Status
  const current = bookings.find(b => b.id === booking.id);
  if (current.status !== BOOKING_STATUS.OPTION_PENDING) {
    console.warn('Buchung wurde bereits bearbeitet');
    return;
  }
  // ... proceed
};
```
