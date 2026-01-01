import { useState, useEffect, useCallback } from 'react';

/**
 * Hook zum Schutz vor Verlust ungespeicherter Änderungen
 *
 * Funktionen:
 * - Warnt bei Browser-Schließen/Refresh (beforeunload)
 * - Bietet Methoden zum Tracken von Änderungen
 * - Kann für Navigation-Warnungen verwendet werden
 *
 * @param {boolean} initialState - Anfangszustand (default: false)
 * @returns {Object} - { hasUnsavedChanges, setHasUnsavedChanges, markAsChanged, markAsSaved, confirmNavigation }
 */
const useUnsavedChanges = (initialState = false) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(initialState);

  // Browser beforeunload Event - warnt bei Tab schließen/Refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        // Moderne Browser ignorieren custom messages, zeigen aber Standard-Dialog
        e.returnValue = 'Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Markiert als geändert
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Markiert als gespeichert
  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  // Bestätigt Navigation - zeigt Dialog wenn ungespeicherte Änderungen
  // Gibt true zurück wenn Navigation erlaubt, false wenn abgebrochen
  const confirmNavigation = useCallback((customMessage) => {
    if (!hasUnsavedChanges) return true;

    const message = customMessage || 'Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren?';
    return window.confirm(message);
  }, [hasUnsavedChanges]);

  return {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    markAsChanged,
    markAsSaved,
    confirmNavigation
  };
};

export default useUnsavedChanges;
