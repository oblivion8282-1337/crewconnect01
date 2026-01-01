import { useState, useCallback, useMemo } from 'react';
import {
  DEFAULT_WORKING_HOURS,
  DEFAULT_WORKING_DAYS,
  dateToWeekday
} from '../constants/team';
import { createDateKey } from '../utils/dateUtils';

/**
 * useTeam Hook - Team-Management für Agenturen
 *
 * Verwaltet:
 * - Team-Mitglieder (CRUD)
 * - Abwesenheiten (genehmigte)
 * - Abwesenheitsanträge
 * - Team-Einplanungen (Assignments)
 * - Verfügbarkeit & Auslastung
 */
const useTeam = (agencyId = 1) => {
  // === STATE ===

  const [teamMembers, setTeamMembers] = useState([
    // Demo-Daten
    {
      id: 'member-1',
      agencyId: 1,
      firstName: 'Laura',
      lastName: 'Weber',
      avatar: null,
      email: 'laura.weber@agentur.de',
      phone: '+49 170 1234567',
      position: 'Senior Producerin',
      professions: ['producer', 'productionmanager'],
      skills: ['Budgetplanung', 'Teamführung', 'Postproduktion'],
      employmentType: 'fulltime',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: { start: '09:00', end: '18:00' },
      internalDayRate: 450,
      role: 'projectlead',
      permissionOverrides: null,
      isActive: true,
      lastLoginAt: '2025-01-15T10:30:00Z',
      notes: '',
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2025-01-15T10:30:00Z'
    },
    {
      id: 'member-2',
      agencyId: 1,
      firstName: 'Max',
      lastName: 'Hoffmann',
      avatar: null,
      email: 'max.hoffmann@agentur.de',
      phone: '+49 171 9876543',
      position: 'Junior Producer',
      professions: ['producer'],
      skills: ['Locationscout', 'Casting'],
      employmentType: 'fulltime',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: { start: '09:00', end: '18:00' },
      internalDayRate: 280,
      role: 'member',
      permissionOverrides: null,
      isActive: true,
      lastLoginAt: '2025-01-14T16:00:00Z',
      notes: 'Einarbeitung läuft gut',
      createdAt: '2024-09-15T00:00:00Z',
      updatedAt: '2025-01-14T16:00:00Z'
    },
    {
      id: 'member-3',
      agencyId: 1,
      firstName: 'Sophie',
      lastName: 'Klein',
      avatar: null,
      email: 'sophie.klein@agentur.de',
      phone: '+49 172 5555555',
      position: 'Produktionsassistenz',
      professions: ['productionassistant'],
      skills: ['Organisation', 'Catering-Koordination'],
      employmentType: 'werkstudent',
      workingDays: ['tuesday', 'wednesday', 'thursday'],
      workingHours: { start: '10:00', end: '18:00' },
      internalDayRate: 150,
      role: 'member',
      permissionOverrides: { canAddNotes: true, canViewFiles: true },
      isActive: true,
      lastLoginAt: null,
      notes: 'Studiert noch bis Sommer',
      createdAt: '2024-11-01T00:00:00Z',
      updatedAt: '2024-11-01T00:00:00Z'
    }
  ]);

  const [teamAbsences, setTeamAbsences] = useState([
    // Demo-Daten
    {
      id: 'absence-1',
      memberId: 'member-2',
      type: 'vacation',
      startDate: '2025-02-10',
      endDate: '2025-02-14',
      isPartialDay: false,
      startTime: null,
      endTime: null,
      note: 'Skiurlaub',
      createdAt: '2025-01-10T00:00:00Z'
    }
  ]);

  const [absenceRequests, setAbsenceRequests] = useState([
    // Demo-Daten
    {
      id: 'request-1',
      memberId: 'member-3',
      type: 'vacation',
      startDate: '2025-03-24',
      endDate: '2025-03-28',
      isPartialDay: false,
      startTime: null,
      endTime: null,
      reason: 'Familienbesuch in Österreich',
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      createdAt: '2025-01-12T00:00:00Z'
    }
  ]);

  const [teamAssignments, setTeamAssignments] = useState([
    // Demo-Daten
    {
      id: 'assignment-1',
      memberId: 'member-1',
      projectId: 'proj-1',
      phaseId: 'phase-1',
      dates: ['2025-01-20', '2025-01-21', '2025-01-22'],
      timeSlots: null,
      projectRole: 'Produktionsleitung',
      note: '',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: 'assignment-2',
      memberId: 'member-2',
      projectId: 'proj-1',
      phaseId: 'phase-1',
      dates: ['2025-01-20', '2025-01-21'],
      timeSlots: null,
      projectRole: 'Set-Aufnahmeleitung',
      note: '',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    }
  ]);

  // === TEAM NOTIFICATIONS ===
  const [teamNotifications, setTeamNotifications] = useState([]);

  const addTeamNotification = useCallback((type, data) => {
    const notification = {
      id: `team-notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      ...data,
      read: false,
      createdAt: new Date().toISOString()
    };
    setTeamNotifications(prev => [notification, ...prev]);
    return notification;
  }, []);

  const markTeamNotificationAsRead = useCallback((notificationId) => {
    setTeamNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllTeamNotificationsAsRead = useCallback(() => {
    setTeamNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const getUnreadTeamNotificationsCount = useCallback(() => {
    return teamNotifications.filter(n => !n.read).length;
  }, [teamNotifications]);

  // === HELPER FUNCTIONS ===

  const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const now = () => new Date().toISOString();

  // === TEAM MEMBERS CRUD ===

  const createMember = useCallback((memberData) => {
    const newMember = {
      id: generateId('member'),
      agencyId,
      firstName: memberData.firstName || '',
      lastName: memberData.lastName || '',
      avatar: memberData.avatar || null,
      email: memberData.email || '',
      phone: memberData.phone || '',
      position: memberData.position || '',
      professions: memberData.professions || [],
      skills: memberData.skills || [],
      employmentType: memberData.employmentType || 'fulltime',
      workingDays: memberData.workingDays || DEFAULT_WORKING_DAYS,
      workingHours: memberData.workingHours || DEFAULT_WORKING_HOURS,
      internalDayRate: memberData.internalDayRate || null,
      role: memberData.role || 'member',
      permissionOverrides: memberData.permissionOverrides || null,
      isActive: true,
      lastLoginAt: null,
      notes: memberData.notes || '',
      createdAt: now(),
      updatedAt: now()
    };

    setTeamMembers(prev => [...prev, newMember]);
    return newMember;
  }, [agencyId]);

  const updateMember = useCallback((memberId, updates) => {
    let updatedMember = null;
    setTeamMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        updatedMember = { ...member, ...updates, updatedAt: now() };
        return updatedMember;
      }
      return member;
    }));
    return updatedMember;
  }, []);

  const deactivateMember = useCallback((memberId) => {
    return updateMember(memberId, { isActive: false });
  }, [updateMember]);

  const reactivateMember = useCallback((memberId) => {
    return updateMember(memberId, { isActive: true });
  }, [updateMember]);

  const deleteMember = useCallback((memberId) => {
    // Prüfen ob Einplanungen oder Abwesenheiten existieren
    const hasAssignments = teamAssignments.some(a => a.memberId === memberId);
    const hasAbsences = teamAbsences.some(a => a.memberId === memberId);

    if (hasAssignments || hasAbsences) {
      throw new Error('Mitglied hat noch Einplanungen oder Abwesenheiten. Bitte zuerst deaktivieren.');
    }

    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    return true;
  }, [teamAssignments, teamAbsences]);

  const getMemberById = useCallback((memberId) => {
    return teamMembers.find(m => m.id === memberId) || null;
  }, [teamMembers]);

  const getActiveMembers = useCallback(() => {
    return teamMembers.filter(m => m.isActive);
  }, [teamMembers]);

  const getMembersByRole = useCallback((role) => {
    return teamMembers.filter(m => m.role === role && m.isActive);
  }, [teamMembers]);

  const getMembersByProfession = useCallback((profession) => {
    return teamMembers.filter(m =>
      m.isActive && m.professions.includes(profession)
    );
  }, [teamMembers]);

  const searchMembers = useCallback((query) => {
    if (!query?.trim()) return getActiveMembers();

    const q = query.toLowerCase();
    return teamMembers.filter(m => {
      if (!m.isActive) return false;
      return (
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.position.toLowerCase().includes(q) ||
        m.skills.some(s => s.toLowerCase().includes(q)) ||
        m.email.toLowerCase().includes(q)
      );
    });
  }, [teamMembers, getActiveMembers]);

  // === MEMBER PERMISSIONS ===

  const updateMemberPermissions = useCallback((memberId, permissions) => {
    return updateMember(memberId, { permissionOverrides: permissions });
  }, [updateMember]);

  const resetMemberPermissions = useCallback((memberId) => {
    return updateMember(memberId, { permissionOverrides: null });
  }, [updateMember]);

  // === ABSENCES (APPROVED) ===

  const addAbsence = useCallback((memberId, absenceData) => {
    const newAbsence = {
      id: generateId('absence'),
      memberId,
      type: absenceData.type || 'vacation',
      startDate: absenceData.startDate,
      endDate: absenceData.endDate,
      isPartialDay: absenceData.isPartialDay || false,
      startTime: absenceData.startTime || null,
      endTime: absenceData.endTime || null,
      note: absenceData.note || '',
      createdAt: now()
    };

    // Prüfe auf Konflikte mit Assignments
    const conflicts = [];
    const startDate = new Date(absenceData.startDate);
    const endDate = new Date(absenceData.endDate);

    teamAssignments
      .filter(a => a.memberId === memberId)
      .forEach(assignment => {
        assignment.dates.forEach(dateStr => {
          const date = new Date(dateStr);
          if (date >= startDate && date <= endDate) {
            conflicts.push({
              type: 'assignment',
              date: dateStr,
              projectId: assignment.projectId,
              phaseId: assignment.phaseId
            });
          }
        });
      });

    setTeamAbsences(prev => [...prev, newAbsence]);

    return {
      absence: newAbsence,
      warnings: conflicts.length > 0 ? conflicts : null
    };
  }, [teamAssignments]);

  const updateAbsence = useCallback((absenceId, updates) => {
    let updatedAbsence = null;
    setTeamAbsences(prev => prev.map(absence => {
      if (absence.id === absenceId) {
        updatedAbsence = { ...absence, ...updates };
        return updatedAbsence;
      }
      return absence;
    }));
    return updatedAbsence;
  }, []);

  const removeAbsence = useCallback((absenceId) => {
    setTeamAbsences(prev => prev.filter(a => a.id !== absenceId));
    return true;
  }, []);

  const getAbsencesForMember = useCallback((memberId, startDate = null, endDate = null) => {
    return teamAbsences.filter(a => {
      if (a.memberId !== memberId) return false;
      if (startDate && a.endDate < startDate) return false;
      if (endDate && a.startDate > endDate) return false;
      return true;
    });
  }, [teamAbsences]);

  const getAbsencesInRange = useCallback((startDate, endDate) => {
    return teamAbsences.filter(a => {
      if (a.endDate < startDate) return false;
      if (a.startDate > endDate) return false;
      return true;
    });
  }, [teamAbsences]);

  const isAbsent = useCallback((memberId, date) => {
    const dateKey = typeof date === 'string' ? date : createDateKey(date);
    return teamAbsences.some(a => {
      if (a.memberId !== memberId) return false;
      return dateKey >= a.startDate && dateKey <= a.endDate;
    });
  }, [teamAbsences]);

  const getAbsenceForDate = useCallback((memberId, date) => {
    const dateKey = typeof date === 'string' ? date : createDateKey(date);
    return teamAbsences.find(a => {
      if (a.memberId !== memberId) return false;
      return dateKey >= a.startDate && dateKey <= a.endDate;
    }) || null;
  }, [teamAbsences]);

  // === ABSENCE REQUESTS ===

  const createAbsenceRequest = useCallback((memberId, requestData) => {
    const newRequest = {
      id: generateId('request'),
      memberId,
      type: requestData.type || 'vacation',
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      isPartialDay: requestData.isPartialDay || false,
      startTime: requestData.startTime || null,
      endTime: requestData.endTime || null,
      reason: requestData.reason || '',
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      createdAt: now()
    };

    // Prüfe auf Konflikte
    const conflicts = [];
    const startDate = new Date(requestData.startDate);
    const endDate = new Date(requestData.endDate);

    teamAssignments
      .filter(a => a.memberId === memberId)
      .forEach(assignment => {
        assignment.dates.forEach(dateStr => {
          const date = new Date(dateStr);
          if (date >= startDate && date <= endDate) {
            conflicts.push({
              type: 'assignment',
              date: dateStr,
              projectId: assignment.projectId,
              phaseId: assignment.phaseId
            });
          }
        });
      });

    setAbsenceRequests(prev => [...prev, newRequest]);

    // Benachrichtigung für Projektleitungen
    const member = teamMembers.find(m => m.id === memberId);
    addTeamNotification('absence_request_new', {
      forRole: 'projectlead',
      memberId,
      memberName: member ? `${member.firstName} ${member.lastName}` : 'Unbekannt',
      requestId: newRequest.id,
      type: requestData.type,
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      message: `Neuer Abwesenheitsantrag von ${member ? `${member.firstName} ${member.lastName}` : 'Unbekannt'}`
    });

    return {
      request: newRequest,
      conflicts
    };
  }, [teamAssignments, teamMembers, addTeamNotification]);

  const getAbsenceRequests = useCallback((status = null) => {
    if (!status) return absenceRequests;
    return absenceRequests.filter(r => r.status === status);
  }, [absenceRequests]);

  const getAbsenceRequestsForMember = useCallback((memberId) => {
    return absenceRequests.filter(r => r.memberId === memberId);
  }, [absenceRequests]);

  const getPendingAbsenceRequests = useCallback(() => {
    return absenceRequests.filter(r => r.status === 'pending');
  }, [absenceRequests]);

  const approveAbsenceRequest = useCallback((requestId, reviewerId) => {
    let updatedRequest = null;

    setAbsenceRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        updatedRequest = {
          ...request,
          status: 'approved',
          reviewedBy: reviewerId,
          reviewedAt: now()
        };
        return updatedRequest;
      }
      return request;
    }));

    // Erstelle Absence aus Request
    if (updatedRequest) {
      const newAbsence = {
        id: generateId('absence'),
        memberId: updatedRequest.memberId,
        type: updatedRequest.type,
        startDate: updatedRequest.startDate,
        endDate: updatedRequest.endDate,
        isPartialDay: updatedRequest.isPartialDay,
        startTime: updatedRequest.startTime,
        endTime: updatedRequest.endTime,
        note: updatedRequest.reason,
        createdAt: now()
      };

      setTeamAbsences(prev => [...prev, newAbsence]);

      // Benachrichtigung für den Mitarbeiter
      const member = teamMembers.find(m => m.id === updatedRequest.memberId);
      addTeamNotification('absence_request_approved', {
        forRole: 'member',
        memberId: updatedRequest.memberId,
        memberName: member ? `${member.firstName} ${member.lastName}` : 'Unbekannt',
        requestId,
        type: updatedRequest.type,
        startDate: updatedRequest.startDate,
        endDate: updatedRequest.endDate,
        message: `Dein Abwesenheitsantrag wurde genehmigt`
      });
    }

    return updatedRequest;
  }, [teamMembers, addTeamNotification]);

  const rejectAbsenceRequest = useCallback((requestId, reviewerId, reason) => {
    let updatedRequest = null;

    setAbsenceRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        updatedRequest = {
          ...request,
          status: 'rejected',
          reviewedBy: reviewerId,
          reviewedAt: now(),
          rejectionReason: reason
        };
        return updatedRequest;
      }
      return request;
    }));

    // Benachrichtigung für den Mitarbeiter
    if (updatedRequest) {
      const member = teamMembers.find(m => m.id === updatedRequest.memberId);
      addTeamNotification('absence_request_rejected', {
        forRole: 'member',
        memberId: updatedRequest.memberId,
        memberName: member ? `${member.firstName} ${member.lastName}` : 'Unbekannt',
        requestId,
        type: updatedRequest.type,
        startDate: updatedRequest.startDate,
        endDate: updatedRequest.endDate,
        rejectionReason: reason,
        message: `Dein Abwesenheitsantrag wurde abgelehnt${reason ? `: ${reason}` : ''}`
      });
    }

    return updatedRequest;
  }, [teamMembers, addTeamNotification]);

  const withdrawAbsenceRequest = useCallback((requestId) => {
    const request = absenceRequests.find(r => r.id === requestId);
    if (request?.status !== 'pending') {
      throw new Error('Nur offene Anträge können zurückgezogen werden.');
    }

    setAbsenceRequests(prev => prev.filter(r => r.id !== requestId));
    return true;
  }, [absenceRequests]);

  const getPendingRequestsCount = useCallback(() => {
    return absenceRequests.filter(r => r.status === 'pending').length;
  }, [absenceRequests]);

  // === ASSIGNMENTS ===

  const createAssignment = useCallback((memberId, projectId, phaseId, dates, options = {}) => {
    const conflicts = checkConflicts(memberId, dates);

    const newAssignment = {
      id: generateId('assignment'),
      memberId,
      projectId,
      phaseId,
      dates: dates.sort(),
      timeSlots: options.timeSlots || null,
      projectRole: options.projectRole || '',
      note: options.note || '',
      createdAt: now(),
      updatedAt: now()
    };

    setTeamAssignments(prev => [...prev, newAssignment]);

    // Benachrichtigung für den Mitarbeiter
    const member = teamMembers.find(m => m.id === memberId);
    addTeamNotification('assignment_new', {
      forRole: 'member',
      memberId,
      memberName: member ? `${member.firstName} ${member.lastName}` : 'Unbekannt',
      assignmentId: newAssignment.id,
      projectId,
      phaseId,
      dates,
      projectRole: options.projectRole,
      message: `Du wurdest für ein Projekt eingeplant (${dates.length} Tag${dates.length > 1 ? 'e' : ''})`
    });

    return {
      assignment: newAssignment,
      conflicts
    };
  }, [teamMembers, addTeamNotification]);

  const updateAssignment = useCallback((assignmentId, updates) => {
    let updatedAssignment = null;
    let conflicts = [];

    setTeamAssignments(prev => prev.map(assignment => {
      if (assignment.id === assignmentId) {
        updatedAssignment = { ...assignment, ...updates, updatedAt: now() };

        // Prüfe Konflikte bei Datumsänderung
        if (updates.dates) {
          conflicts = checkConflicts(assignment.memberId, updates.dates, assignmentId);
        }

        return updatedAssignment;
      }
      return assignment;
    }));

    return { assignment: updatedAssignment, conflicts };
  }, []);

  const removeAssignment = useCallback((assignmentId) => {
    setTeamAssignments(prev => prev.filter(a => a.id !== assignmentId));
    return true;
  }, []);

  const getAssignmentsForMember = useCallback((memberId, startDate = null, endDate = null) => {
    return teamAssignments.filter(a => {
      if (a.memberId !== memberId) return false;
      if (startDate || endDate) {
        const hasDatesInRange = a.dates.some(d => {
          if (startDate && d < startDate) return false;
          if (endDate && d > endDate) return false;
          return true;
        });
        if (!hasDatesInRange) return false;
      }
      return true;
    });
  }, [teamAssignments]);

  const getAssignmentsForProject = useCallback((projectId) => {
    return teamAssignments.filter(a => a.projectId === projectId);
  }, [teamAssignments]);

  const getAssignmentsForPhase = useCallback((phaseId) => {
    return teamAssignments.filter(a => a.phaseId === phaseId);
  }, [teamAssignments]);

  const getAssignmentForDate = useCallback((memberId, date) => {
    const dateKey = typeof date === 'string' ? date : createDateKey(date);
    return teamAssignments.find(a =>
      a.memberId === memberId && a.dates.includes(dateKey)
    ) || null;
  }, [teamAssignments]);

  // === AVAILABILITY ===

  const getMemberDayStatus = useCallback((memberId, date) => {
    const member = getMemberById(memberId);
    if (!member) return null;

    const dateKey = typeof date === 'string' ? date : createDateKey(date);
    const weekday = dateToWeekday(new Date(dateKey));

    // Arbeitstag?
    const isWorkingDay = member.workingDays.includes(weekday);
    const workingHours = isWorkingDay ? member.workingHours : null;

    // Abwesend?
    const absence = getAbsenceForDate(memberId, dateKey);

    // Pending Request?
    const absenceRequest = absenceRequests.find(r =>
      r.memberId === memberId &&
      r.status === 'pending' &&
      dateKey >= r.startDate &&
      dateKey <= r.endDate
    ) || null;

    // Einplanungen
    const assignments = teamAssignments.filter(a =>
      a.memberId === memberId && a.dates.includes(dateKey)
    );

    // Status berechnen
    let status = 'available';
    if (!isWorkingDay) {
      status = 'non_working';
    } else if (absence) {
      status = absence.isPartialDay ? 'partial' : 'absent';
    } else if (absenceRequest) {
      status = 'absent_pending';
    } else if (assignments.length > 0) {
      status = 'busy';
    }

    return {
      isWorkingDay,
      workingHours,
      absence,
      absenceRequest,
      assignments,
      status
    };
  }, [getMemberById, getAbsenceForDate, absenceRequests, teamAssignments]);

  const getMemberAvailabilityRange = useCallback((memberId, startDate, endDate) => {
    const result = new Map();
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = createDateKey(d);
      result.set(dateKey, getMemberDayStatus(memberId, dateKey));
    }

    return result;
  }, [getMemberDayStatus]);

  const getAvailableMembersForDates = useCallback((dates, profession = null) => {
    const members = profession
      ? getMembersByProfession(profession)
      : getActiveMembers();

    return members.map(member => {
      let fullAvailable = 0;
      let partialAvailable = 0;
      const conflicts = [];

      dates.forEach(date => {
        const status = getMemberDayStatus(member.id, date);
        if (status.status === 'available') {
          fullAvailable++;
        } else if (status.status === 'partial') {
          partialAvailable++;
        } else if (status.status !== 'available') {
          conflicts.push({ date, ...status });
        }
      });

      let availability = 'none';
      if (fullAvailable === dates.length) {
        availability = 'full';
      } else if (fullAvailable + partialAvailable > 0) {
        availability = 'partial';
      }

      return {
        member,
        availability,
        conflicts,
        availableDays: fullAvailable,
        partialDays: partialAvailable,
        totalDays: dates.length
      };
    }).sort((a, b) => {
      // Sortiere: full > partial > none
      const order = { full: 0, partial: 1, none: 2 };
      return order[a.availability] - order[b.availability];
    });
  }, [getActiveMembers, getMembersByProfession, getMemberDayStatus]);

  // === UTILIZATION ===

  const getMemberUtilization = useCallback((memberId, startDate, endDate) => {
    const member = getMemberById(memberId);
    if (!member) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    let workingDays = 0;
    let assignedDays = 0;
    let absentDays = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = createDateKey(d);
      const weekday = dateToWeekday(d);

      if (member.workingDays.includes(weekday)) {
        workingDays++;

        const status = getMemberDayStatus(memberId, dateKey);
        if (status.status === 'busy') {
          assignedDays++;
        } else if (status.status === 'absent') {
          absentDays++;
        }
      }
    }

    const availableDays = workingDays - absentDays;
    const percentage = availableDays > 0
      ? Math.round((assignedDays / availableDays) * 100)
      : 0;

    return {
      workingDays,
      availableDays,
      assignedDays,
      absentDays,
      percentage
    };
  }, [getMemberById, getMemberDayStatus]);

  const getTeamUtilization = useCallback((startDate, endDate) => {
    const members = getActiveMembers();
    const utilizations = members.map(member => ({
      member,
      utilization: getMemberUtilization(member.id, startDate, endDate)
    }));

    const totalAssigned = utilizations.reduce((sum, u) => sum + (u.utilization?.assignedDays || 0), 0);
    const totalAvailable = utilizations.reduce((sum, u) => sum + (u.utilization?.availableDays || 0), 0);
    const averagePercentage = totalAvailable > 0
      ? Math.round((totalAssigned / totalAvailable) * 100)
      : 0;

    return {
      members: utilizations,
      totalAssignedDays: totalAssigned,
      totalAvailableDays: totalAvailable,
      averagePercentage
    };
  }, [getActiveMembers, getMemberUtilization]);

  // === CONFLICT CHECKING ===

  const checkConflicts = useCallback((memberId, dates, excludeAssignmentId = null) => {
    const member = getMemberById(memberId);
    if (!member) return [];

    const conflicts = [];

    dates.forEach(date => {
      const dateKey = typeof date === 'string' ? date : createDateKey(date);
      const weekday = dateToWeekday(new Date(dateKey));

      // Kein Arbeitstag?
      if (!member.workingDays.includes(weekday)) {
        conflicts.push({
          date: dateKey,
          type: 'non_working',
          details: { weekday }
        });
        return;
      }

      // Abwesend?
      const absence = getAbsenceForDate(memberId, dateKey);
      if (absence && !absence.isPartialDay) {
        conflicts.push({
          date: dateKey,
          type: 'absence',
          details: { absence }
        });
        return;
      }

      // Bereits eingeplant?
      const existingAssignment = teamAssignments.find(a =>
        a.memberId === memberId &&
        a.dates.includes(dateKey) &&
        a.id !== excludeAssignmentId
      );
      if (existingAssignment) {
        conflicts.push({
          date: dateKey,
          type: 'assignment',
          details: { assignment: existingAssignment }
        });
      }
    });

    return conflicts;
  }, [getMemberById, getAbsenceForDate, teamAssignments]);

  // === RETURN ===

  return {
    // State
    teamMembers,
    teamAbsences,
    absenceRequests,
    teamAssignments,

    // Member CRUD
    createMember,
    updateMember,
    deactivateMember,
    reactivateMember,
    deleteMember,
    getMemberById,
    getActiveMembers,
    getMembersByRole,
    getMembersByProfession,
    searchMembers,

    // Member Permissions
    updateMemberPermissions,
    resetMemberPermissions,

    // Absences
    addAbsence,
    updateAbsence,
    removeAbsence,
    getAbsencesForMember,
    getAbsencesInRange,
    isAbsent,
    getAbsenceForDate,

    // Absence Requests
    createAbsenceRequest,
    getAbsenceRequests,
    getAbsenceRequestsForMember,
    getPendingAbsenceRequests,
    approveAbsenceRequest,
    rejectAbsenceRequest,
    withdrawAbsenceRequest,
    getPendingRequestsCount,

    // Assignments
    createAssignment,
    updateAssignment,
    removeAssignment,
    getAssignmentsForMember,
    getAssignmentsForProject,
    getAssignmentsForPhase,
    getAssignmentForDate,

    // Availability
    getMemberDayStatus,
    getMemberAvailabilityRange,
    getAvailableMembersForDates,

    // Utilization
    getMemberUtilization,
    getTeamUtilization,

    // Conflicts
    checkConflicts,

    // Notifications
    teamNotifications,
    addTeamNotification,
    markTeamNotificationAsRead,
    markAllTeamNotificationsAsRead,
    getUnreadTeamNotificationsCount
  };
};

export default useTeam;
