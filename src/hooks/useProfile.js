import { useState, useCallback } from 'react';
import {
  INITIAL_FREELANCERS,
  INITIAL_AGENCIES
} from '../data/initialData';

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
   * Fügt einen Skill zum Freelancer-Profil hinzu
   * @param {string} skill - Neuer Skill
   */
  const addSkill = useCallback((skill) => {
    if (!skill.trim()) return;

    setFreelancers(prev => prev.map(f => {
      if (f.id !== freelancerId) return f;
      const currentSkills = f.skills || [];
      if (currentSkills.includes(skill.trim())) return f;

      return {
        ...f,
        skills: [...currentSkills, skill.trim()]
      };
    }));
  }, [freelancerId]);

  /**
   * Entfernt einen Skill vom Freelancer-Profil
   * @param {string} skill - Zu entfernender Skill
   */
  const removeSkill = useCallback((skill) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? { ...f, skills: (f.skills || []).filter(s => s !== skill) }
        : f
    ));
  }, [freelancerId]);

  /**
   * Fügt Equipment zum Freelancer-Profil hinzu
   * @param {string} item - Neues Equipment
   */
  const addEquipment = useCallback((item) => {
    if (!item.trim()) return;

    setFreelancers(prev => prev.map(f => {
      if (f.id !== freelancerId) return f;
      const currentEquipment = f.equipment || [];
      if (currentEquipment.includes(item.trim())) return f;

      return {
        ...f,
        equipment: [...currentEquipment, item.trim()]
      };
    }));
  }, [freelancerId]);

  /**
   * Entfernt Equipment vom Freelancer-Profil
   * @param {string} item - Zu entfernendes Equipment
   */
  const removeEquipment = useCallback((item) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? { ...f, equipment: (f.equipment || []).filter(e => e !== item) }
        : f
    ));
  }, [freelancerId]);

  /**
   * Fügt eine Sprache zum Freelancer-Profil hinzu
   * @param {string} language - Neue Sprache
   */
  const addLanguage = useCallback((language) => {
    if (!language.trim()) return;

    setFreelancers(prev => prev.map(f => {
      if (f.id !== freelancerId) return f;
      const currentLanguages = f.languages || [];
      if (currentLanguages.includes(language.trim())) return f;

      return {
        ...f,
        languages: [...currentLanguages, language.trim()]
      };
    }));
  }, [freelancerId]);

  /**
   * Entfernt eine Sprache vom Freelancer-Profil
   * @param {string} language - Zu entfernende Sprache
   */
  const removeLanguage = useCallback((language) => {
    setFreelancers(prev => prev.map(f =>
      f.id === freelancerId
        ? { ...f, languages: (f.languages || []).filter(l => l !== language) }
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
    addSkill,
    removeSkill,
    addEquipment,
    removeEquipment,
    addLanguage,
    removeLanguage,

    // Portfolio (erweitert)
    addPortfolioItem,
    updatePortfolioItem,
    removePortfolioItem,

    // Social Media
    updateSocialMedia,

    // Sichtbarkeit
    toggleVisibility,
    setVisibility,

    // Agentur Social Media
    updateAgencySocialMedia,

    // Agentur Portfolio
    addAgencyPortfolioItem,
    updateAgencyPortfolioItem,
    removeAgencyPortfolioItem
  };
};
