import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Context für ungespeicherte Änderungen
 * Ermöglicht globale Tracking und Blockierung von Navigation
 */
const UnsavedChangesContext = createContext(null);

export const UnsavedChangesProvider = ({ children }) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unsavedMessage, setUnsavedMessage] = useState('Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren?');

  // Browser beforeunload Event
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = unsavedMessage;
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, unsavedMessage]);

  // Setzt den Zustand für ungespeicherte Änderungen
  const setUnsaved = useCallback((hasChanges, message) => {
    setHasUnsavedChanges(hasChanges);
    if (message) {
      setUnsavedMessage(message);
    }
  }, []);

  // Setzt zurück auf "keine Änderungen"
  const clearUnsaved = useCallback(() => {
    setHasUnsavedChanges(false);
    setUnsavedMessage('Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren?');
  }, []);

  // Prüft ob Navigation erlaubt ist - zeigt Dialog wenn nötig
  const confirmNavigation = useCallback((customMessage) => {
    if (!hasUnsavedChanges) return true;

    const message = customMessage || unsavedMessage;
    return window.confirm(message);
  }, [hasUnsavedChanges, unsavedMessage]);

  // Wrapper für Navigation - nur navigieren wenn bestätigt
  const safeNavigate = useCallback((navigateFn, customMessage) => {
    if (confirmNavigation(customMessage)) {
      clearUnsaved();
      navigateFn();
      return true;
    }
    return false;
  }, [confirmNavigation, clearUnsaved]);

  return (
    <UnsavedChangesContext.Provider value={{
      hasUnsavedChanges,
      setUnsaved,
      clearUnsaved,
      confirmNavigation,
      safeNavigate
    }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
};

/**
 * Hook zum Verwenden des UnsavedChanges Context
 */
export const useUnsavedChangesContext = () => {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error('useUnsavedChangesContext must be used within UnsavedChangesProvider');
  }
  return context;
};

export default UnsavedChangesContext;
