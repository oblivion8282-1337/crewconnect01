import { useState, useCallback } from 'react';
import {
  INITIAL_FREELANCERS,
  INITIAL_AGENCIES
} from '../data/initialData';

// Kalender-Sichtbarkeits-Optionen
export const CALENDAR_VISIBILITY = {
  PUBLIC: 'public',           // Öffentlich sichtbar
  ON_REQUEST: 'on_request',   // Nur auf Anfrage
  CONTACTS_ONLY: 'contacts_only' // Nur für bisherige Kontakte
};

export const CALENDAR_VISIBILITY_LABELS = {
  [CALENDAR_VISIBILITY.PUBLIC]: 'Öffentlich',
  [CALENDAR_VISIBILITY.ON_REQUEST]: 'Nur auf Anfrage',
  [CALENDAR_VISIBILITY.CONTACTS_ONLY]: 'Nur für Kontakte'
};

export const CALENDAR_VISIBILITY_DESCRIPTIONS = {
  [CALENDAR_VISIBILITY.PUBLIC]: 'Alle Agenturen können deinen Kalender sehen',
  [CALENDAR_VISIBILITY.ON_REQUEST]: 'Agenturen müssen deine Verfügbarkeit erst anfragen',
  [CALENDAR_VISIBILITY.CONTACTS_ONLY]: 'Nur Agenturen, mit denen du bereits gearbeitet hast, sehen deinen Kalender'
};

// Vordefinierte Farben für Crew-Listen
export const CREW_LIST_COLORS = [
  { id: 'blue', name: 'Blau', bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  { id: 'green', name: 'Grün', bg: 'bg-green-500', light: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  { id: 'purple', name: 'Lila', bg: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  { id: 'orange', name: 'Orange', bg: 'bg-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  { id: 'pink', name: 'Pink', bg: 'bg-pink-500', light: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500', light: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400' },
];

/**
 * useProfile - Custom Hook für Profilverwaltung
 *
 * Verwaltet den State für Freelancer- und Agentur-Profile
 * mit Anzeige- und Bearbeitungsfunktionen.
 *
 * @param {number} freelancerId - ID des aktuellen Freelancers
 * @param {number} agencyId - ID der aktuellen Agentur
 */
export const useProfile = (freelancerId, agencyId) => {
  const [freelancers, setFreelancers] = useState(INITIAL_FREELANCERS);
  const [agencies, setAgencies] = useState(INITIAL_AGENCIES);

  // === Crew-Listen & Favoriten State (pro Agentur) ===
  const [favorites, setFavorites] = useState({}); // { agencyId: [freelancerId, ...] }
  const [crewLists, setCrewLists] = useState({}); // { agencyId: [{ id, name, color, freelancerIds, createdAt }] }

  /**
   * Gibt das aktuelle Freelancer-Profil zurück
   */
  const getCurrentFreelancerProfile = useCallback(() => {
    return freelancers.find(f => f.id === freelancerId) || null;
  }, [freelancers, freelancerId]);

  /**
   * Gibt das aktuelle Agentur-Profil zurück
   */
  const getCurrentAgencyProfile = useCallback(() => {
    return agencies.find(a => a.id === agencyId) || null;
  }, [agencies, agencyId]);

  /**
   * Aktualisiert das Freelancer-Profil
   * @param {Object} updates - Zu aktualisierende Felder
   */
  const updateFreelancerProfile = useCallback((updates) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? { ...f, ...updates }
        : f
    ));
  }, [freelancerId]);

  /**
   * Aktualisiert das Agentur-Profil
   * @param {Object} updates - Zu aktualisierende Felder
   */
  const updateAgencyProfile = useCallback((updates) => {
    setAgencies(prev => prev.map(a =>
      a.id === agencyId
        ? { ...a, ...updates }
        : a
    ));
  }, [agencyId]);

  /**
   * Fügt einen Beruf zum Freelancer-Profil hinzu
   * @param {string} profession - Neuer Beruf
   */
  const addProfession = useCallback((profession) => {
    if (!profession.trim()) return;

    setFreelancers(prev => prev.map(f => {
      if (f.id !== freelancerId) return f;
      const currentProfessions = f.professions || [];
      if (currentProfessions.includes(profession.trim())) return f;

      return {
        ...f,
        professions: [...currentProfessions, profession.trim()]
      };
    }));
  }, [freelancerId]);

  /**
   * Entfernt einen Beruf vom Freelancer-Profil
   * @param {string} profession - Zu entfernender Beruf
   */
  const removeProfession = useCallback((profession) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? { ...f, professions: (f.professions || []).filter(p => p !== profession) }
        : f
    ));
  }, [freelancerId]);

  /**
   * Fügt einen Tag zum Freelancer-Profil hinzu
   * @param {string} tag - Neuer Tag (Skill, Equipment oder Sprache)
   */
  const addTag = useCallback((tag) => {
    if (!tag.trim()) return;

    setFreelancers(prev => prev.map(f => {
      if (f.id !== freelancerId) return f;
      const currentTags = f.tags || [];
      if (currentTags.includes(tag.trim())) return f;

      return {
        ...f,
        tags: [...currentTags, tag.trim()]
      };
    }));
  }, [freelancerId]);

  /**
   * Entfernt einen Tag vom Freelancer-Profil
   * @param {string} tag - Zu entfernender Tag
   */
  const removeTag = useCallback((tag) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? { ...f, tags: (f.tags || []).filter(t => t !== tag) }
        : f
    ));
  }, [freelancerId]);

  // === Portfolio-Operationen (erweitert) ===

  /**
   * Fügt einen Portfolio-Eintrag hinzu
   * @param {Object} item - Portfolio-Eintrag mit url, title, description, category
   */
  const addPortfolioItem = useCallback((item) => {
    if (!item.url?.trim()) return;

    const newItem = {
      id: Date.now(),
      url: item.url.trim(),
      title: item.title?.trim() || '',
      description: item.description?.trim() || '',
      category: item.category || 'other'
    };

    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? { ...f, portfolio: [...(f.portfolio || []), newItem] }
        : f
    ));
  }, [freelancerId]);

  /**
   * Aktualisiert einen Portfolio-Eintrag
   * @param {number} itemId - ID des Eintrags
   * @param {Object} updates - Zu aktualisierende Felder
   */
  const updatePortfolioItem = useCallback((itemId, updates) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? {
            ...f,
            portfolio: (f.portfolio || []).map(p =>
              p.id === itemId ? { ...p, ...updates } : p
            )
          }
        : f
    ));
  }, [freelancerId]);

  /**
   * Entfernt einen Portfolio-Eintrag
   * @param {number} itemId - ID des Eintrags
   */
  const removePortfolioItem = useCallback((itemId) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? { ...f, portfolio: (f.portfolio || []).filter(p => p.id !== itemId) }
        : f
    ));
  }, [freelancerId]);

  // === Social Media ===

  /**
   * Aktualisiert ein Social Media Feld
   * @param {string} platform - Plattform-Key (z.B. 'linkedin', 'instagram')
   * @param {string} value - Neuer Wert
   */
  const updateSocialMedia = useCallback((platform, value) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? {
            ...f,
            socialMedia: {
              ...(f.socialMedia || {}),
              [platform]: value
            }
          }
        : f
    ));
  }, [freelancerId]);

  // === Sichtbarkeit ===

  /**
   * Schaltet die Sichtbarkeit eines Feldes um
   * @param {string} field - Feld-Key (z.B. 'dayRate', 'email')
   */
  const toggleVisibility = useCallback((field) => {
    setFreelancers(prev => prev.map(f => {
      if (f.id !== freelancerId) return f;

      const currentVisibility = f.visibility || {};
      return {
        ...f,
        visibility: {
          ...currentVisibility,
          [field]: !currentVisibility[field]
        }
      };
    }));
  }, [freelancerId]);

  /**
   * Setzt die Sichtbarkeit eines Feldes
   * @param {string} field - Feld-Key
   * @param {boolean} visible - Sichtbar oder nicht
   */
  const setVisibility = useCallback((field, visible) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? {
            ...f,
            visibility: {
              ...(f.visibility || {}),
              [field]: visible
            }
          }
        : f
    ));
  }, [freelancerId]);

  /**
   * Aktualisiert die Kalender-Sichtbarkeit
   * @param {string} visibility - 'public' | 'on_request' | 'contacts_only'
   */
  const updateCalendarVisibility = useCallback((visibility) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? { ...f, calendarVisibility: visibility }
        : f
    ));
  }, [freelancerId]);

  /**
   * Gibt die Kalender-Sichtbarkeit eines Freelancers zurück
   * @param {number} fId - Freelancer ID
   */
  const getCalendarVisibility = useCallback((fId) => {
    const freelancer = freelancers.find(f => f.id === fId);
    return freelancer?.calendarVisibility || CALENDAR_VISIBILITY.PUBLIC;
  }, [freelancers]);

  // === Agentur Social Media ===

  /**
   * Aktualisiert ein Social Media Feld der Agentur
   * @param {string} platform - Plattform-Key
   * @param {string} value - Neuer Wert
   */
  const updateAgencySocialMedia = useCallback((platform, value) => {
    setAgencies(prev => prev.map(a =>
      a.id === agencyId
        ? {
            ...a,
            socialMedia: {
              ...(a.socialMedia || {}),
              [platform]: value
            }
          }
        : a
    ));
  }, [agencyId]);

  // === Agentur Portfolio ===

  /**
   * Fügt einen Portfolio-Eintrag zur Agentur hinzu
   * @param {Object} item - Portfolio-Eintrag
   */
  const addAgencyPortfolioItem = useCallback((item) => {
    if (!item.url?.trim()) return;

    const newItem = {
      id: Date.now(),
      url: item.url.trim(),
      title: item.title?.trim() || '',
      description: item.description?.trim() || '',
      category: item.category || 'other'
    };

    setAgencies(prev => prev.map(a =>
      a.id === agencyId
        ? { ...a, portfolio: [...(a.portfolio || []), newItem] }
        : a
    ));
  }, [agencyId]);

  /**
   * Aktualisiert einen Portfolio-Eintrag der Agentur
   * @param {number} itemId - ID des Eintrags
   * @param {Object} updates - Zu aktualisierende Felder
   */
  const updateAgencyPortfolioItem = useCallback((itemId, updates) => {
    setAgencies(prev => prev.map(a =>
      a.id === agencyId
        ? {
            ...a,
            portfolio: (a.portfolio || []).map(p =>
              p.id === itemId ? { ...p, ...updates } : p
            )
          }
        : a
    ));
  }, [agencyId]);

  /**
   * Entfernt einen Portfolio-Eintrag der Agentur
   * @param {number} itemId - ID des Eintrags
   */
  const removeAgencyPortfolioItem = useCallback((itemId) => {
    setAgencies(prev => prev.map(a =>
      a.id === agencyId
        ? { ...a, portfolio: (a.portfolio || []).filter(p => p.id !== itemId) }
        : a
    ));
  }, [agencyId]);

  // === Favoriten-Operationen ===

  /**
   * Gibt die Favoriten der aktuellen Agentur zurück
   */
  const getAgencyFavorites = useCallback(() => {
    return favorites[agencyId] || [];
  }, [favorites, agencyId]);

  /**
   * Prüft ob ein Freelancer Favorit ist
   * @param {number} freelancerId - ID des Freelancers
   */
  const isFavorite = useCallback((fId) => {
    return (favorites[agencyId] || []).includes(fId);
  }, [favorites, agencyId]);

  /**
   * Toggled Favoriten-Status eines Freelancers
   * @param {number} freelancerId - ID des Freelancers
   */
  const toggleFavorite = useCallback((fId) => {
    setFavorites(prev => {
      const agencyFavorites = prev[agencyId] || [];
      const isCurrentlyFavorite = agencyFavorites.includes(fId);

      return {
        ...prev,
        [agencyId]: isCurrentlyFavorite
          ? agencyFavorites.filter(id => id !== fId)
          : [...agencyFavorites, fId]
      };
    });
  }, [agencyId]);

  // === Crew-Listen-Operationen ===

  /**
   * Gibt die Crew-Listen der aktuellen Agentur zurück
   */
  const getAgencyCrewLists = useCallback(() => {
    return crewLists[agencyId] || [];
  }, [crewLists, agencyId]);

  /**
   * Erstellt eine neue Crew-Liste
   * @param {string} name - Name der Liste
   * @param {string} color - Farb-ID (optional)
   */
  const createCrewList = useCallback((name, color = 'blue') => {
    if (!name?.trim()) return null;

    const newList = {
      id: Date.now(),
      name: name.trim(),
      color,
      freelancerIds: [],
      createdAt: new Date().toISOString()
    };

    setCrewLists(prev => ({
      ...prev,
      [agencyId]: [...(prev[agencyId] || []), newList]
    }));

    return newList;
  }, [agencyId]);

  /**
   * Löscht eine Crew-Liste
   * @param {number} listId - ID der Liste
   */
  const deleteCrewList = useCallback((listId) => {
    setCrewLists(prev => ({
      ...prev,
      [agencyId]: (prev[agencyId] || []).filter(l => l.id !== listId)
    }));
  }, [agencyId]);

  /**
   * Benennt eine Crew-Liste um
   * @param {number} listId - ID der Liste
   * @param {string} newName - Neuer Name
   */
  const renameCrewList = useCallback((listId, newName) => {
    if (!newName?.trim()) return;

    setCrewLists(prev => ({
      ...prev,
      [agencyId]: (prev[agencyId] || []).map(l =>
        l.id === listId ? { ...l, name: newName.trim() } : l
      )
    }));
  }, [agencyId]);

  /**
   * Ändert die Farbe einer Crew-Liste
   * @param {number} listId - ID der Liste
   * @param {string} color - Neue Farb-ID
   */
  const updateCrewListColor = useCallback((listId, color) => {
    setCrewLists(prev => ({
      ...prev,
      [agencyId]: (prev[agencyId] || []).map(l =>
        l.id === listId ? { ...l, color } : l
      )
    }));
  }, [agencyId]);

  /**
   * Fügt einen Freelancer zu einer Crew-Liste hinzu
   * @param {number} listId - ID der Liste
   * @param {number} freelancerId - ID des Freelancers
   */
  const addToCrewList = useCallback((listId, fId) => {
    setCrewLists(prev => ({
      ...prev,
      [agencyId]: (prev[agencyId] || []).map(l => {
        if (l.id !== listId) return l;
        if (l.freelancerIds.includes(fId)) return l;
        return { ...l, freelancerIds: [...l.freelancerIds, fId] };
      })
    }));
  }, [agencyId]);

  /**
   * Entfernt einen Freelancer aus einer Crew-Liste
   * @param {number} listId - ID der Liste
   * @param {number} freelancerId - ID des Freelancers
   */
  const removeFromCrewList = useCallback((listId, fId) => {
    setCrewLists(prev => ({
      ...prev,
      [agencyId]: (prev[agencyId] || []).map(l =>
        l.id === listId
          ? { ...l, freelancerIds: l.freelancerIds.filter(id => id !== fId) }
          : l
      )
    }));
  }, [agencyId]);

  /**
   * Gibt alle Listen zurück, in denen ein Freelancer ist
   * @param {number} freelancerId - ID des Freelancers
   */
  const getListsForFreelancer = useCallback((fId) => {
    return (crewLists[agencyId] || []).filter(l => l.freelancerIds.includes(fId));
  }, [crewLists, agencyId]);

  /**
   * Prüft ob ein Freelancer in einer bestimmten Liste ist
   * @param {number} listId - ID der Liste
   * @param {number} freelancerId - ID des Freelancers
   */
  const isInCrewList = useCallback((listId, fId) => {
    const list = (crewLists[agencyId] || []).find(l => l.id === listId);
    return list?.freelancerIds.includes(fId) || false;
  }, [crewLists, agencyId]);

  return {
    // Aktuelle Profile
    freelancerProfile: getCurrentFreelancerProfile(),
    agencyProfile: getCurrentAgencyProfile(),

    // Alle Profile (für Suche)
    freelancers,
    agencies,

    // Update-Funktionen
    updateFreelancerProfile,
    updateAgencyProfile,

    // Array-Operationen für Freelancer
    addProfession,
    removeProfession,
    addTag,
    removeTag,

    // Portfolio (erweitert)
    addPortfolioItem,
    updatePortfolioItem,
    removePortfolioItem,

    // Social Media
    updateSocialMedia,

    // Sichtbarkeit
    toggleVisibility,
    setVisibility,

    // Kalender-Sichtbarkeit
    updateCalendarVisibility,
    getCalendarVisibility,

    // Agentur Social Media
    updateAgencySocialMedia,

    // Agentur Portfolio
    addAgencyPortfolioItem,
    updateAgencyPortfolioItem,
    removeAgencyPortfolioItem,

    // Favoriten
    getAgencyFavorites,
    isFavorite,
    toggleFavorite,

    // Crew-Listen
    getAgencyCrewLists,
    createCrewList,
    deleteCrewList,
    renameCrewList,
    updateCrewListColor,
    addToCrewList,
    removeFromCrewList,
    getListsForFreelancer,
    isInCrewList
  };
};
