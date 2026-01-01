import { useState, useCallback } from 'react';
import { INITIAL_PROJECTS, PROJECT_STATUS } from '../data/initialData';

/**
 * useProjects - Custom Hook für Projektverwaltung
 *
 * Verwaltet den State für Projekte und bietet Funktionen zum
 * Erstellen, Bearbeiten und Löschen von Projekten und Phasen.
 *
 * @returns {Object} Projekt-State und Handler-Funktionen
 */
export const useProjects = () => {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  /**
   * Findet ein Projekt nach ID
   * @param {number} projectId - ID des Projekts
   */
  const getProjectById = useCallback((projectId) => {
    return projects.find(p => p.id === projectId);
  }, [projects]);

  /**
   * Löscht ein Projekt
   * @param {number} projectId - ID des zu löschenden Projekts
   */
  const deleteProject = useCallback((projectId) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  }, []);

  /**
   * Aktualisiert ein Projekt
   * @param {number} projectId - ID des Projekts
   * @param {Object} updates - Zu aktualisierende Felder
   */
  const updateProject = useCallback((projectId, updates) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      return { ...project, ...updates };
    }));
  }, []);

  /**
   * Löscht eine Phase aus einem Projekt
   * @param {number} projectId - ID des Projekts
   * @param {number} phaseId - ID der zu löschenden Phase
   */
  const deletePhase = useCallback((projectId, phaseId) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;

      return {
        ...project,
        phases: project.phases.filter(phase => phase.id !== phaseId)
      };
    }));
  }, []);

  /**
   * Aktualisiert eine Phase
   * @param {number} projectId - ID des Projekts
   * @param {number} phaseId - ID der Phase
   * @param {Object} updates - Zu aktualisierende Felder
   */
  const updatePhase = useCallback((projectId, phaseId, updates) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;

      return {
        ...project,
        phases: project.phases.map(phase => {
          if (phase.id !== phaseId) return phase;
          return { ...phase, ...updates };
        })
      };
    }));
  }, []);

  /**
   * Fügt ein neues Projekt hinzu
   * @param {Object} projectData - Daten des neuen Projekts
   */
  const addProject = useCallback((projectData) => {
    const newProject = {
      ...projectData,
      id: Date.now(),
      status: PROJECT_STATUS.PLANNING,
      budget: {
        total: projectData.budget?.total || 0,
        spent: 0,
        currency: 'EUR'
      },
      clientContact: projectData.clientContact || {
        name: projectData.contactPerson || '',
        email: projectData.contactEmail || '',
        phone: projectData.contactPhone || ''
      },
      // Kundenverknüpfung (CRM)
      clientId: projectData.clientId || null,
      clientContactId: projectData.clientContactId || null,
      purchaseOrderNumber: projectData.purchaseOrderNumber || null,
      notes: projectData.notes || '',
      phases: []
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;  // Gibt komplettes Objekt zurück für BookFromProfileModal
  }, []);

  /**
   * Fügt eine neue Phase zu einem Projekt hinzu
   * @param {number} projectId - ID des Projekts
   * @param {Object} phaseData - Daten der neuen Phase
   */
  const addPhase = useCallback((projectId, phaseData) => {
    const newPhase = {
      ...phaseData,
      id: Date.now(),
      budget: phaseData.budget || 0
    };

    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;

      return {
        ...project,
        phases: [...project.phases, newPhase]
      };
    }));

    return newPhase;  // Gibt Phase-Objekt zurück für BookFromProfileModal
  }, []);

  /**
   * Aktualisiert das Budget eines Projekts
   * @param {number} projectId - ID des Projekts
   * @param {Object} budgetUpdates - Budget-Updates (total, spent)
   */
  const updateProjectBudget = useCallback((projectId, budgetUpdates) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        budget: { ...project.budget, ...budgetUpdates }
      };
    }));
  }, []);

  /**
   * Gibt alle Projekte eines Kunden zurück
   * @param {string} clientId - ID des Kunden
   */
  const getProjectsByClient = useCallback((clientId) => {
    return projects.filter(p => p.clientId === clientId);
  }, [projects]);

  // === Team-Permissions für Projekte ===

  /**
   * Aktualisiert die Standard-Permissions für Team-Mitglieder in einem Projekt
   * Diese überschreiben Agentur-Defaults für alle Mitarbeiter im Projekt
   * @param {number} projectId - ID des Projekts
   * @param {Object} permissions - Permissions-Objekt { canSeeBudget: boolean, ... }
   */
  const updateProjectMemberPermissions = useCallback((projectId, permissions) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;

      return {
        ...project,
        memberPermissions: {
          ...project.memberPermissions,
          defaults: {
            ...(project.memberPermissions?.defaults || {}),
            ...permissions
          }
        }
      };
    }));
  }, []);

  /**
   * Aktualisiert die Permissions für einen spezifischen Mitarbeiter in einem Projekt
   * Diese überschreiben alle anderen Ebenen (höchste Priorität)
   * @param {number} projectId - ID des Projekts
   * @param {number} memberId - ID des Team-Mitglieds
   * @param {Object} permissions - Permissions-Objekt { canSeeBudget: boolean, ... }
   */
  const updateProjectMemberOverride = useCallback((projectId, memberId, permissions) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;

      return {
        ...project,
        memberPermissions: {
          ...project.memberPermissions,
          memberOverrides: {
            ...(project.memberPermissions?.memberOverrides || {}),
            [memberId]: {
              ...(project.memberPermissions?.memberOverrides?.[memberId] || {}),
              ...permissions
            }
          }
        }
      };
    }));
  }, []);

  /**
   * Löscht alle spezifischen Overrides für einen Mitarbeiter in einem Projekt
   * Danach greifen wieder die Projekt- bzw. Agentur-Defaults
   * @param {number} projectId - ID des Projekts
   * @param {number} memberId - ID des Team-Mitglieds
   */
  const clearProjectMemberOverride = useCallback((projectId, memberId) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      if (!project.memberPermissions?.memberOverrides?.[memberId]) return project;

      const { [memberId]: removed, ...remainingOverrides } = project.memberPermissions.memberOverrides;

      return {
        ...project,
        memberPermissions: {
          ...project.memberPermissions,
          memberOverrides: remainingOverrides
        }
      };
    }));
  }, []);

  /**
   * Gibt die memberPermissions eines Projekts zurück
   * @param {number} projectId - ID des Projekts
   * @returns {Object} { defaults: {}, memberOverrides: {} }
   */
  const getProjectMemberPermissions = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.memberPermissions || { defaults: {}, memberOverrides: {} };
  }, [projects]);

  /**
   * Gibt alle Projekte mit Kunden-Info zurück
   * @param {Array} clients - Array aller Kunden
   */
  const getProjectsWithClientInfo = useCallback((clients) => {
    return projects.map(project => ({
      ...project,
      client: project.clientId
        ? clients.find(c => c.id === project.clientId) || null
        : null
    }));
  }, [projects]);

  return {
    projects,
    getProjectById,
    deleteProject,
    updateProject,
    deletePhase,
    updatePhase,
    addProject,
    addPhase,
    updateProjectBudget,
    // CRM-Integration
    getProjectsByClient,
    getProjectsWithClientInfo,
    // Team-Permissions
    updateProjectMemberPermissions,
    updateProjectMemberOverride,
    clearProjectMemberOverride,
    getProjectMemberPermissions
  };
};
