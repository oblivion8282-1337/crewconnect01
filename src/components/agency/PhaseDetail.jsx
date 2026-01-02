import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Users,
  Calendar,
  Euro,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  UserPlus,
  UsersRound,
  Mail,
  Phone,
  Clock,
  MapPin,
  Package,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  AlertTriangle
} from 'lucide-react';
import FreelancerSearchModal from '../modals/FreelancerSearchModal';
import { ProfileAvatar } from '../shared/ProfileField';
import { formatDate, createDateKey } from '../../utils/dateUtils';
import { useUnsavedChangesContext } from '../../contexts/UnsavedChangesContext';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isFixStatus
} from '../../constants/calendar';

// Vordefinierte Farben für Phasen (sync mit ProjectDetail.jsx)
const PHASE_COLORS = [
  { id: 'gray', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', preview: 'bg-gray-200 dark:bg-gray-600', glow: 'gray', text: 'text-gray-700 dark:text-gray-300' },
  { id: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', preview: 'bg-blue-400', glow: '#3b82f6', text: 'text-blue-700 dark:text-blue-300' },
  { id: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', preview: 'bg-emerald-400', glow: '#10b981', text: 'text-emerald-700 dark:text-emerald-300' },
  { id: 'amber', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', preview: 'bg-amber-400', glow: '#f59e0b', text: 'text-amber-700 dark:text-amber-300' },
  { id: 'violet', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', preview: 'bg-violet-400', glow: '#8b5cf6', text: 'text-violet-700 dark:text-violet-300' },
  { id: 'rose', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', preview: 'bg-rose-400', glow: '#f43f5e', text: 'text-rose-700 dark:text-rose-300' },
  { id: 'cyan', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', preview: 'bg-cyan-400', glow: '#06b6d4', text: 'text-cyan-700 dark:text-cyan-300' },
  { id: 'orange', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', preview: 'bg-orange-400', glow: '#f97316', text: 'text-orange-700 dark:text-orange-300' }
];

// Hilfsfunktion um Hex-Farbe aufzuhellen (für Hintergrund)
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * TeamMemberCard - Karte für ein Team-Mitglied
 */
const TeamMemberCard = ({ freelancer, memberBookings, onWithdraw, onConvertToFix, onReschedule, accentColor }) => {
  const totalDays = memberBookings.reduce((sum, b) => sum + b.dates.length, 0);
  const totalCost = memberBookings.reduce((sum, b) => sum + (b.totalCost || b.dates.length * (b.dailyRate || 500)), 0);

  const borderColors = {
    violet: 'border-l-violet-500',
    orange: 'border-l-orange-500',
    amber: 'border-l-amber-500',
    emerald: 'border-l-emerald-500'
  };

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-l-4 ${borderColors[accentColor]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            imageUrl={freelancer.profileImage}
            firstName={freelancer.firstName}
            lastName={freelancer.lastName}
            size="lg"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {freelancer.firstName} {freelancer.lastName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{freelancer.professions?.[0]}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
              {freelancer.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {freelancer.email}
                </span>
              )}
              {freelancer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {freelancer.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-900 dark:text-white">{totalDays} Tage</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{totalCost.toLocaleString('de-DE')} €</p>
        </div>
      </div>

      {/* Buchungs-Details */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {memberBookings.map(booking => (
          <div key={booking.id} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              {formatDate(booking.dates[0])} – {formatDate(booking.dates[booking.dates.length - 1])}
              <span className="text-gray-400 dark:text-gray-500">({booking.dates.length} Tage)</span>
            </div>
            <div className="flex items-center gap-2">
              {isPendingStatus(booking.status) && (
                <>
                  <button
                    onClick={() => onReschedule?.(booking)}
                    className="px-3 py-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Verschieben
                  </button>
                  <button
                    onClick={() => onWithdraw(booking)}
                    className="px-3 py-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Zurückziehen
                  </button>
                </>
              )}
              {booking.status === BOOKING_STATUS.OPTION_CONFIRMED && (
                <>
                  <button
                    onClick={() => onReschedule?.(booking)}
                    className="px-3 py-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Verschieben
                  </button>
                  <button
                    onClick={() => onConvertToFix(booking)}
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
                  >
                    Fix buchen
                  </button>
                </>
              )}
              {booking.status === BOOKING_STATUS.FIX_CONFIRMED && (
                <>
                  <button
                    onClick={() => onReschedule?.(booking)}
                    className="px-3 py-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Verschieben
                  </button>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs">
                    Fix bestätigt
                  </span>
                </>
              )}
              {booking.rescheduleRequest && (
                <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-xs">
                  Verschiebung angefragt
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * PhaseDetail - Detailansicht einer Projektphase
 *
 * Zeigt Team, Timeline, Budget und Aufgaben für eine Phase
 */
const PhaseDetail = ({
  project,
  phase,
  bookings,
  freelancers,
  agencyId,
  agencyProfile,
  getDayStatus,
  onBack,
  onBackToProjects,
  onBook,
  onConvertToFix,
  onWithdraw,
  onReschedule,
  onUpdatePhase,
  // Favoriten & Crew-Listen Props
  isFavorite,
  onToggleFavorite,
  crewLists,
  getListsForFreelancer,
  onAddToList,
  onRemoveFromList,
  onOpenAddToListModal,
  // Chat Props
  getOrCreateChat,
  onOpenChat,
  // Team Props (interne Mitarbeiter)
  teamMembers = [],
  teamAssignments = [],
  onAddTeamAssignment,
  onRemoveTeamAssignment,
  checkTeamConflicts
}) => {
  const [activeTab, setActiveTab] = useState('team');
  const [tasks, setTasks] = useState(phase.tasks || []);
  const [newTask, setNewTask] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showTeamAssignModal, setShowTeamAssignModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2); // 0=fit-all, 1=klein, 2=mittel, 3=normal, 4=groß
  const [containerWidth, setContainerWidth] = useState(800);
  const timelineContainerRef = useRef(null);

  // Ungespeicherte Änderungen tracken (für neue Aufgabe im Input - globaler Context)
  const { setUnsaved, clearUnsaved, confirmNavigation } = useUnsavedChangesContext();

  // Wenn eine neue Aufgabe getippt wurde aber noch nicht hinzugefügt
  useEffect(() => {
    setUnsaved(newTask.trim().length > 0);
  }, [newTask, setUnsaved]);

  // Sichere Navigation mit Warnung bei ungespeicherten Änderungen
  const handleSafeBack = () => {
    if (confirmNavigation('Du hast eine nicht gespeicherte Aufgabe. Möchtest du wirklich zurück?')) {
      setNewTask('');
      clearUnsaved();
      onBack();
    }
  };

  const handleSafeBackToProjects = () => {
    if (confirmNavigation('Du hast eine nicht gespeicherte Aufgabe. Möchtest du wirklich zurück?')) {
      setNewTask('');
      clearUnsaved();
      onBackToProjects();
    }
  };

  // Measure container width for "fit all" zoom mode
  useEffect(() => {
    const updateWidth = () => {
      if (timelineContainerRef.current) {
        setContainerWidth(timelineContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [activeTab]);

  // Buchungen für diese Phase
  const phaseBookings = useMemo(() =>
    bookings.filter(b =>
      b.agencyId === agencyId &&
      b.projectId === project.id &&
      b.phaseId === phase.id &&
      b.status !== BOOKING_STATUS.DECLINED &&
      b.status !== BOOKING_STATUS.WITHDRAWN &&
      b.status !== BOOKING_STATUS.CANCELLED
    ),
    [bookings, agencyId, project.id, phase.id]
  );

  // Stornierte Buchungen für diese Phase
  const cancelledBookings = useMemo(() =>
    bookings.filter(b =>
      b.agencyId === agencyId &&
      b.projectId === project.id &&
      b.phaseId === phase.id &&
      b.status === BOOKING_STATUS.CANCELLED
    ),
    [bookings, agencyId, project.id, phase.id]
  );

  // Team-Mitglieder mit ihren Buchungen
  const team = useMemo(() => {
    const teamMap = new Map();
    phaseBookings.forEach(booking => {
      const freelancer = freelancers.find(f => f.id === booking.freelancerId);
      if (!freelancer) return;

      if (!teamMap.has(booking.freelancerId)) {
        teamMap.set(booking.freelancerId, {
          freelancer,
          bookings: []
        });
      }
      teamMap.get(booking.freelancerId).bookings.push(booking);
    });
    return Array.from(teamMap.values());
  }, [phaseBookings, freelancers]);

  // Team-Assignments für diese Phase (interne Mitarbeiter)
  const phaseTeamAssignments = useMemo(() => {
    return teamAssignments.filter(a =>
      a.projectId === project.id && a.phaseId === phase.id
    );
  }, [teamAssignments, project.id, phase.id]);

  // Interne Mitarbeiter mit ihren Einplanungen
  const internalTeam = useMemo(() => {
    const memberMap = new Map();
    phaseTeamAssignments.forEach(assignment => {
      const member = teamMembers.find(m => m.id === assignment.memberId);
      if (!member) return;
      if (!memberMap.has(assignment.memberId)) {
        memberMap.set(assignment.memberId, {
          member,
          assignments: []
        });
      }
      memberMap.get(assignment.memberId).assignments.push(assignment);
    });
    return Array.from(memberMap.values());
  }, [phaseTeamAssignments, teamMembers]);

  // Team nach Status gruppiert
  const groupedTeam = useMemo(() => {
    const groups = {
      pending: [],      // Ausstehend
      rescheduling: [], // Verschiebungen
      optioned: [],     // Optioniert
      confirmed: []     // Bestätigt
    };

    team.forEach(member => {
      const { bookings: memberBookings } = member;

      // Kategorisiere nach höchster Priorität
      if (memberBookings.some(b => isPendingStatus(b.status))) {
        groups.pending.push(member);
      } else if (memberBookings.some(b => b.rescheduleRequest)) {
        groups.rescheduling.push(member);
      } else if (memberBookings.some(b => b.status === BOOKING_STATUS.OPTION_CONFIRMED)) {
        groups.optioned.push(member);
      } else {
        groups.confirmed.push(member);
      }
    });

    return groups;
  }, [team]);

  // Budget-Berechnung für Phase (basierend auf tatsächlichen Buchungskosten)
  const budgetInfo = useMemo(() => {
    let committed = 0;
    let pending = 0;

    phaseBookings.forEach(booking => {
      const cost = booking.totalCost || 0;

      if (isConfirmedStatus(booking.status)) {
        committed += cost;
      } else if (isPendingStatus(booking.status)) {
        pending += cost;
      }
    });

    const total = committed + pending;

    return { total, committed, pending };
  }, [phaseBookings]);

  // Berechne effektiven Phasenzeitraum aus Buchungen und/oder manuellen Daten
  const effectiveDateRange = useMemo(() => {
    // Sammle alle Buchungsdaten
    const allBookingDates = phaseBookings.flatMap(b => b.dates).sort();

    if (allBookingDates.length === 0 && !phase.startDate && !phase.endDate) {
      return { startDate: null, endDate: null };
    }

    let startDate = phase.startDate || null;
    let endDate = phase.endDate || null;

    // Wenn Buchungen existieren, erweitere den Zeitraum entsprechend
    if (allBookingDates.length > 0) {
      const firstBookingDate = allBookingDates[0];
      const lastBookingDate = allBookingDates[allBookingDates.length - 1];

      // Startdatum: nimm das frühere von Phase-Start und erster Buchung
      if (!startDate || firstBookingDate < startDate) {
        startDate = firstBookingDate;
      }
      // Enddatum: nimm das spätere von Phase-Ende und letzter Buchung
      if (!endDate || lastBookingDate > endDate) {
        endDate = lastBookingDate;
      }
    }

    return { startDate, endDate };
  }, [phase.startDate, phase.endDate, phaseBookings]);

  // Timeline-Daten
  const timelineData = useMemo(() => {
    const { startDate, endDate } = effectiveDateRange;
    if (!startDate || !endDate) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayBookings = phaseBookings.filter(b => b.dates.includes(dateStr));

      days.push({
        date: new Date(d),
        dateStr,
        bookings: dayBookings.map(b => ({
          ...b,
          freelancer: freelancers.find(f => f.id === b.freelancerId)
        }))
      });
    }

    return days;
  }, [effectiveDateRange, phaseBookings, freelancers]);

  // Calculate cell width based on zoom level (0 = fit all)
  const getCellWidth = useMemo(() => {
    const nameColumnWidth = 240;
    const availableWidth = containerWidth - nameColumnWidth - 20; // 20px buffer
    const numDays = timelineData.length || 1;

    // Zoom 0 = fit all, otherwise use fixed widths
    const fixedWidths = [24, 32, 44, 56, 72];

    if (zoomLevel === 0) {
      // Calculate width to fit all days, with minimum of 16px per day
      return Math.max(16, Math.floor(availableWidth / numDays));
    }

    return fixedWidths[zoomLevel - 1] || 32;
  }, [zoomLevel, containerWidth, timelineData.length]);

  // Task-Management
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const updatedTasks = [...tasks, { id: Date.now(), text: newTask, completed: false }];
    setTasks(updatedTasks);
    setNewTask('');
    onUpdatePhase?.(project.id, phase.id, { tasks: updatedTasks });
  };

  const handleToggleTask = (taskId) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    onUpdatePhase?.(project.id, phase.id, { tasks: updatedTasks });
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    onUpdatePhase?.(project.id, phase.id, { tasks: updatedTasks });
  };

  const tabs = [
    { id: 'team', label: 'Team', icon: Users, count: team.length },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'budget', label: 'Budget', icon: Euro },
    { id: 'tasks', label: 'Aufgaben', icon: CheckSquare, count: tasks.filter(t => !t.completed).length }
  ];

  // Projekt-Farbe für Breadcrumb
  const isProjectCustomColor = project.color?.startsWith('#');
  const projectColorDef = isProjectCustomColor
    ? null
    : (PHASE_COLORS.find(c => c.id === project.color) || PHASE_COLORS[1]); // Default: blue

  const projectBreadcrumbStyle = isProjectCustomColor ? {
    backgroundColor: hexToRgba(project.color, 0.15),
    color: project.color,
    borderColor: hexToRgba(project.color, 0.3)
  } : {};

  const projectBreadcrumbClass = isProjectCustomColor
    ? 'border'
    : `${projectColorDef.bg} ${projectColorDef.text} ${projectColorDef.border}`;

  // Phase-Farbe für Breadcrumb
  const isPhaseCustomColor = phase.color?.startsWith('#');
  const phaseColorDef = isPhaseCustomColor
    ? null
    : (PHASE_COLORS.find(c => c.id === phase.color) || PHASE_COLORS[0]); // Default: gray

  const phaseBreadcrumbStyle = isPhaseCustomColor ? {
    backgroundColor: hexToRgba(phase.color, 0.15),
    color: phase.color,
    borderColor: hexToRgba(phase.color, 0.3)
  } : {};

  const phaseBreadcrumbClass = isPhaseCustomColor
    ? 'border'
    : `${phaseColorDef.bg} ${phaseColorDef.text} ${phaseColorDef.border}`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb Navigation - mit Projekt- und Phasenfarben */}
      <nav className="flex items-center gap-3 mb-6">
        <button
          onClick={handleSafeBackToProjects}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Projekte
        </button>
        <span className="text-gray-400 dark:text-gray-500">→</span>
        <button
          onClick={handleSafeBack}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors hover:opacity-80 ${projectBreadcrumbClass}`}
          style={projectBreadcrumbStyle}
        >
          {project.name}
        </button>
        <span className="text-gray-400 dark:text-gray-500">→</span>
        <span
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${phaseBreadcrumbClass}`}
          style={phaseBreadcrumbStyle}
        >
          {phase.name}
        </span>
      </nav>

      {/* Phase Header */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{phase.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {effectiveDateRange.startDate && effectiveDateRange.endDate
                ? `${formatDate(effectiveDateRange.startDate)} – ${formatDate(effectiveDateRange.endDate)}`
                : 'Kein Zeitraum festgelegt – buche Freelancer um Zeitraum zu definieren'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTeamAssignModal(true)}
              className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
            >
              <UsersRound className="w-4 h-4" />
              Mitarbeiter
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all hover:shadow-[0_0_15px_var(--color-primary)]"
            >
              <UserPlus className="w-4 h-4" />
              Freelancer
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Team</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{team.length}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Buchungen</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{phaseBookings.length}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Budget</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{budgetInfo.total.toLocaleString('de-DE')} €</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Aufgaben</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {tasks.filter(t => t.completed).length}/{tasks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 text-sm transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-[0_0_10px_var(--color-primary)]'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700">
        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team-Übersicht</h2>

            {/* Interne Mitarbeiter */}
            {internalTeam.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Interne Mitarbeiter
                  </h3>
                  <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-medium">
                    {internalTeam.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {internalTeam.map(({ member, assignments }) => {
                    const totalDays = assignments.reduce((sum, a) => sum + a.dates.length, 0);
                    return (
                      <div
                        key={member.id}
                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-l-4 border-l-cyan-500"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-lg font-semibold text-cyan-700 dark:text-cyan-300">
                              {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {member.firstName} {member.lastName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{member.position}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">{totalDays} Tage</p>
                            <span className="text-xs px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full">
                              Intern
                            </span>
                          </div>
                        </div>
                        {/* Einplanungs-Details */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          {assignments.map(assignment => (
                            <div key={assignment.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                {formatDate(assignment.dates[0])} – {formatDate(assignment.dates[assignment.dates.length - 1])}
                                <span className="text-gray-400 dark:text-gray-500">({assignment.dates.length} Tage)</span>
                                {assignment.projectRole && (
                                  <span className="text-cyan-600 dark:text-cyan-400">• {assignment.projectRole}</span>
                                )}
                              </div>
                              <button
                                onClick={() => onRemoveTeamAssignment?.(assignment.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Einplanung entfernen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {team.length === 0 && internalTeam.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Noch keine Freelancer oder Mitarbeiter eingeplant</p>
                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all hover:shadow-[0_0_15px_var(--color-primary)]"
                >
                  Freelancer suchen
                </button>
              </div>
            ) : team.length > 0 ? (
              <div className="space-y-8">
                {/* Ausstehend */}
                {groupedTeam.pending.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Ausstehend
                      </h3>
                      <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full text-xs font-medium">
                        {groupedTeam.pending.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {groupedTeam.pending.map(({ freelancer, bookings: memberBookings }) => (
                        <TeamMemberCard
                          key={freelancer.id}
                          freelancer={freelancer}
                          memberBookings={memberBookings}
                          onWithdraw={onWithdraw}
                          onConvertToFix={onConvertToFix}
                          onReschedule={onReschedule}
                          accentColor="violet"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Verschiebungen */}
                {groupedTeam.rescheduling.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Verschiebungen
                      </h3>
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                        {groupedTeam.rescheduling.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {groupedTeam.rescheduling.map(({ freelancer, bookings: memberBookings }) => (
                        <TeamMemberCard
                          key={freelancer.id}
                          freelancer={freelancer}
                          memberBookings={memberBookings}
                          onWithdraw={onWithdraw}
                          onConvertToFix={onConvertToFix}
                          onReschedule={onReschedule}
                          accentColor="orange"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Optioniert */}
                {groupedTeam.optioned.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Optioniert
                      </h3>
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                        {groupedTeam.optioned.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {groupedTeam.optioned.map(({ freelancer, bookings: memberBookings }) => (
                        <TeamMemberCard
                          key={freelancer.id}
                          freelancer={freelancer}
                          memberBookings={memberBookings}
                          onWithdraw={onWithdraw}
                          onConvertToFix={onConvertToFix}
                          onReschedule={onReschedule}
                          accentColor="amber"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bestätigt */}
                {groupedTeam.confirmed.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Bestätigt
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                        {groupedTeam.confirmed.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {groupedTeam.confirmed.map(({ freelancer, bookings: memberBookings }) => (
                        <TeamMemberCard
                          key={freelancer.id}
                          freelancer={freelancer}
                          memberBookings={memberBookings}
                          onWithdraw={onWithdraw}
                          onConvertToFix={onConvertToFix}
                          onReschedule={onReschedule}
                          accentColor="emerald"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Stornierte Buchungen */}
            {cancelledBookings.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-red-600 dark:text-red-400">
                    Stornierte Buchungen ({cancelledBookings.length})
                  </h3>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  {cancelledBookings.map(booking => {
                    const freelancer = freelancers.find(f => f.id === booking.freelancerId);
                    return (
                      <div
                        key={booking.id}
                        className="p-3 bg-white dark:bg-gray-800 rounded-lg mb-2 last:mb-0 border border-red-100 dark:border-red-900"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl opacity-50">
                              {freelancer?.avatar || '👤'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white line-through">
                                {freelancer ? `${freelancer.firstName} ${freelancer.lastName}` : booking.freelancerName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {booking.dates.length} Tag{booking.dates.length !== 1 ? 'e' : ''} • {formatDate(booking.dates[0])} – {formatDate(booking.dates[booking.dates.length - 1])}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">
                            Storniert
                          </span>
                        </div>
                        {booking.cancelReason && (
                          <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded text-sm">
                            <span className="font-medium text-red-800 dark:text-red-300">Grund: </span>
                            <span className="text-red-700 dark:text-red-400">{booking.cancelReason}</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {booking.cancelledBy === 'freelancer' ? 'Vom Freelancer storniert' : 'Von dir storniert'}
                          {booking.cancelledAt && ` am ${formatDate(booking.cancelledAt)}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="p-6">
            {/* Header mit Zoom-Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline</h2>

              {timelineData.length > 0 && (
                <div className="flex items-center gap-3">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <ZoomOut className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="range"
                      min="0"
                      max="4"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                      className="w-24 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                    />
                    <ZoomIn className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              )}
            </div>

            {timelineData.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">Noch keine Buchungen in dieser Phase</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Der Zeitraum wird automatisch aus den Buchungsdaten berechnet.
                </p>
                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all hover:shadow-[0_0_15px_var(--color-primary)]"
                >
                  Freelancer buchen
                </button>
              </div>
            ) : (
              <>
                {/* Timeline Container mit Sticky Names */}
                <div
                  ref={timelineContainerRef}
                  className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900"
                >
                  {/* Scrollable Container */}
                  <div className="overflow-x-auto">
                    <div className="min-w-max">
                      {/* Month Header Row */}
                      <div className="flex bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        {/* Sticky empty cell for name column */}
                        <div
                          className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"
                          style={{ width: '240px', minWidth: '240px' }}
                        />
                        {/* Month spans */}
                        <div className="flex">
                          {(() => {
                            const months = [];
                            let currentMonth = null;
                            let startIndex = 0;

                            timelineData.forEach((day, index) => {
                              const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`;
                              if (monthKey !== currentMonth) {
                                if (currentMonth !== null) {
                                  months.push({
                                    key: currentMonth,
                                    label: timelineData[startIndex].date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
                                    span: index - startIndex
                                  });
                                }
                                currentMonth = monthKey;
                                startIndex = index;
                              }
                            });
                            // Push last month
                            if (currentMonth !== null) {
                              months.push({
                                key: currentMonth,
                                label: timelineData[startIndex].date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
                                span: timelineData.length - startIndex
                              });
                            }

                            return months.map((month, idx) => (
                              <div
                                key={month.key}
                                className={`flex items-center justify-center py-1.5 text-xs font-semibold text-primary border-r border-gray-200 dark:border-gray-700 ${
                                  idx > 0 ? 'border-l-2 border-l-primary/30' : ''
                                }`}
                                style={{ width: `${month.span * getCellWidth}px`, minWidth: `${month.span * getCellWidth}px` }}
                              >
                                {month.label}
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Date Header Row */}
                      <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        {/* Sticky Name Column Header */}
                        <div
                          className="sticky left-0 z-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center px-4"
                          style={{ width: '240px', minWidth: '240px' }}
                        >
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Team
                          </span>
                        </div>

                        {/* Date Headers */}
                        <div className="flex">
                          {timelineData.map((day, index) => {
                            const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                            const isFirstOfMonth = day.date.getDate() === 1;

                            return (
                              <div
                                key={day.dateStr}
                                className={`flex flex-col items-center justify-center py-2 border-r border-gray-100 dark:border-gray-700 ${
                                  isWeekend ? 'bg-gray-50 dark:bg-gray-900' : ''
                                } ${isFirstOfMonth ? 'border-l-2 border-l-gray-300 dark:border-l-gray-600' : ''}`}
                                style={{ width: `${getCellWidth}px`, minWidth: `${getCellWidth}px` }}
                              >
                                {getCellWidth >= 28 && (
                                  <div className={`text-[10px] font-medium ${isWeekend ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {day.date.toLocaleDateString('de-DE', { weekday: getCellWidth >= 40 ? 'short' : 'narrow' })}
                                  </div>
                                )}
                                <div className={`text-sm font-bold ${isWeekend ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {day.date.getDate()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Team Rows */}
                      {team.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                          Keine Buchungen vorhanden
                        </div>
                      ) : (
                        team.map(({ freelancer, bookings: memberBookings }, rowIndex) => (
                          <div
                            key={freelancer.id}
                            className="flex bg-white dark:bg-gray-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            {/* Sticky Name Column */}
                            <div
                              className="sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800"
                              style={{ width: '240px', minWidth: '240px' }}
                            >
                              <div className="flex-shrink-0">
                                <ProfileAvatar
                                  imageUrl={freelancer.profileImage}
                                  firstName={freelancer.firstName}
                                  lastName={freelancer.lastName}
                                  size="sm"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {freelancer.firstName} {freelancer.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {freelancer.professions?.[0] || 'Freelancer'}
                                </p>
                              </div>
                            </div>

                            {/* Day Cells */}
                            <div className="flex items-stretch">
                              {timelineData.map(day => {
                                const booking = memberBookings.find(b => b.dates.includes(day.dateStr));
                                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

                                // Determine if this is start/middle/end of a booking block
                                const isBookingStart = booking && !memberBookings.some(b =>
                                  b.id === booking.id &&
                                  b.dates.includes(new Date(new Date(day.dateStr).setDate(day.date.getDate() - 1)).toISOString().split('T')[0])
                                );
                                const isBookingEnd = booking && !memberBookings.some(b =>
                                  b.id === booking.id &&
                                  b.dates.includes(new Date(new Date(day.dateStr).setDate(day.date.getDate() + 1)).toISOString().split('T')[0])
                                );

                                let statusColor = '';

                                if (booking) {
                                  if (isFixStatus(booking.status)) {
                                    statusColor = 'bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-sm shadow-emerald-200';
                                  } else if (booking.status === BOOKING_STATUS.OPTION_CONFIRMED) {
                                    statusColor = 'bg-gradient-to-b from-amber-300 to-amber-400 shadow-sm shadow-amber-200';
                                  } else if (isPendingStatus(booking.status)) {
                                    statusColor = 'bg-gradient-to-b from-violet-400 to-violet-500 shadow-sm shadow-violet-200';
                                  }
                                }

                                return (
                                  <div
                                    key={day.dateStr}
                                    className={`border-r border-gray-100 dark:border-gray-700 flex items-center justify-center py-1.5 px-0.5 ${isWeekend ? 'bg-gray-100/50 dark:bg-gray-700/30' : ''}`}
                                    style={{ width: `${getCellWidth}px`, minWidth: `${getCellWidth}px` }}
                                  >
                                    {booking && (
                                      <div
                                        className={`w-full h-full min-h-[28px] ${statusColor} ${
                                          isBookingStart && isBookingEnd ? 'rounded-lg' :
                                          isBookingStart ? 'rounded-l-lg' :
                                          isBookingEnd ? 'rounded-r-lg' : ''
                                        } transition-all hover:scale-105 hover:z-10 cursor-pointer`}
                                        title={`${freelancer.firstName} ${freelancer.lastName}\n${booking.status}\n${formatDate(booking.dates[0])} - ${formatDate(booking.dates[booking.dates.length - 1])}`}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Legende */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-6 text-xs">
                    <span className="text-gray-400 dark:text-gray-500 font-medium">Status:</span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-sm"></span>
                      <span className="text-gray-600 dark:text-gray-400">Fix bestätigt</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-gradient-to-b from-amber-300 to-amber-400 shadow-sm"></span>
                      <span className="text-gray-600 dark:text-gray-400">Option</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-gradient-to-b from-violet-400 to-violet-500 shadow-sm"></span>
                      <span className="text-gray-600 dark:text-gray-400">Ausstehend</span>
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {timelineData.length} Tage • {team.length} Freelancer
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget-Tracking</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Gesamt</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {budgetInfo.total.toLocaleString('de-DE')} €
                </p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Bestätigt</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                  {budgetInfo.committed.toLocaleString('de-DE')} €
                </p>
              </div>
              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                <p className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider">Angefragt</p>
                <p className="text-2xl font-bold text-violet-700 dark:text-violet-300 mt-1">
                  {budgetInfo.pending.toLocaleString('de-DE')} €
                </p>
              </div>
            </div>

            {/* Aufteilung Balken */}
            {budgetInfo.total > 0 && (
              <div className="mb-8">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(budgetInfo.committed / budgetInfo.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-violet-400 transition-all"
                    style={{ width: `${(budgetInfo.pending / budgetInfo.total) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span>
                    Bestätigt
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-violet-400"></span>
                    Angefragt
                  </span>
                </div>
              </div>
            )}

            {/* Kosten-Aufschlüsselung */}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Kosten-Aufschlüsselung</h3>
            {phaseBookings.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center py-8">Keine Buchungen vorhanden</p>
            ) : (
              <div className="space-y-2">
                {phaseBookings.map(booking => {
                  const freelancer = freelancers.find(f => f.id === booking.freelancerId);
                  if (!freelancer) return null;

                  const days = booking.dates.length;
                  const cost = booking.totalCost || 0;
                  const isConfirmed = isConfirmedStatus(booking.status);

                  // Berechne Tagessatz für Anzeige
                  const isFlat = booking.rateType === 'flat';
                  const displayRate = isFlat ? null : (days > 0 ? Math.round(cost / days) : 0);

                  return (
                    <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          imageUrl={freelancer.profileImage}
                          firstName={freelancer.firstName}
                          lastName={freelancer.lastName}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {freelancer.firstName} {freelancer.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isFlat
                              ? `Pauschal für ${days} Tage`
                              : `${days} Tage × ${displayRate?.toLocaleString('de-DE')} €`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{cost.toLocaleString('de-DE')} €</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          isConfirmed
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                        }`}>
                          {isConfirmed ? 'Bestätigt' : 'Angefragt'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aufgaben & Checkliste</h2>

            {/* Neue Aufgabe hinzufügen */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Neue Aufgabe hinzufügen..."
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={handleAddTask}
                disabled={!newTask.trim()}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all hover:shadow-[0_0_15px_var(--color-primary)]"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Aufgaben-Liste */}
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Noch keine Aufgaben erstellt</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors ${
                      task.completed ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-sm ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                        {task.text}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Fortschritt */}
            {tasks.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Fortschritt</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tasks.filter(t => t.completed).length} / {tasks.length} erledigt
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick-Add Templates */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Schnell hinzufügen</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Package, text: 'Equipment prüfen' },
                  { icon: MapPin, text: 'Location scouten' },
                  { icon: Users, text: 'Team-Meeting' },
                  { icon: Calendar, text: 'Termin bestätigen' }
                ].map(template => (
                  <button
                    key={template.text}
                    onClick={() => {
                      setNewTask(template.text);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <template.icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    {template.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Freelancer Search Modal */}
      {showSearch && (
        <FreelancerSearchModal
          project={project}
          phase={phase}
          freelancers={freelancers}
          getDayStatus={getDayStatus}
          agencyId={agencyId}
          agencyProfile={agencyProfile}
          onBook={onBook}
          onClose={() => setShowSearch(false)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          crewLists={crewLists}
          getListsForFreelancer={getListsForFreelancer}
          onAddToList={onAddToList}
          onRemoveFromList={onRemoveFromList}
          onOpenAddToListModal={onOpenAddToListModal}
          getOrCreateChat={getOrCreateChat}
          onOpenChat={onOpenChat}
        />
      )}

      {/* Team Member Assign Modal */}
      {showTeamAssignModal && (
        <TeamMemberAssignModal
          project={project}
          phase={phase}
          teamMembers={teamMembers}
          teamAssignments={teamAssignments}
          checkTeamConflicts={checkTeamConflicts}
          onAssign={onAddTeamAssignment}
          onRemove={onRemoveTeamAssignment}
          onClose={() => setShowTeamAssignModal(false)}
        />
      )}
    </div>
  );
};

/**
 * TeamMemberAssignModal - Modal zum Einplanen interner Mitarbeiter
 */
const TeamMemberAssignModal = ({
  project,
  phase,
  teamMembers,
  teamAssignments,
  checkTeamConflicts,
  onAssign,
  onRemove,
  onClose
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [projectRole, setProjectRole] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const todayKey = createDateKey(new Date());

  // Aktive Team-Mitglieder
  const activeMembers = teamMembers.filter(m => m.isActive);

  // Bereits eingeplante Mitglieder in dieser Phase
  const phaseAssignments = teamAssignments.filter(a =>
    a.projectId === project.id && a.phaseId === phase.id
  );

  // Ausgewählter Mitarbeiter
  const selectedMember = activeMembers.find(m => m.id === selectedMemberId);

  // Konflikte für ausgewählten Mitarbeiter und Daten
  const conflicts = useMemo(() => {
    if (!selectedMemberId || selectedDates.length === 0) return [];
    if (!checkTeamConflicts) return [];

    const result = [];
    selectedDates.forEach(date => {
      const conflict = checkTeamConflicts(selectedMemberId, date);
      if (conflict) {
        result.push({ date, ...conflict });
      }
    });
    return result;
  }, [selectedMemberId, selectedDates, checkTeamConflicts]);

  // Kalender-Rendering
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay();
  const adjustedOffset = firstDayOffset === 0 ? 6 : firstDayOffset - 1; // Montag = 0

  const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  const handleDayClick = (dateKey) => {
    if (selectedDates.includes(dateKey)) {
      setSelectedDates(selectedDates.filter(d => d !== dateKey));
    } else {
      setSelectedDates([...selectedDates, dateKey].sort());
    }
  };

  const handleAssign = () => {
    if (!selectedMemberId || selectedDates.length === 0) return;

    onAssign({
      memberId: selectedMemberId,
      projectId: project.id,
      phaseId: phase.id,
      dates: selectedDates,
      projectRole: projectRole || undefined
    });

    // Reset selection
    setSelectedDates([]);
    setProjectRole('');
  };

  const handleRemoveAssignment = (assignmentId) => {
    onRemove(assignmentId);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mitarbeiter einplanen
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {phase.name} • {project.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Linke Spalte: Mitarbeiter auswählen */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Mitarbeiter auswählen
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {activeMembers.map(member => {
                  const isSelected = selectedMemberId === member.id;
                  const memberAssignments = phaseAssignments.filter(a => a.memberId === member.id);
                  const isAlreadyAssigned = memberAssignments.length > 0;

                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                        {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {member.position}
                        </p>
                      </div>
                      {isAlreadyAssigned && (
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                          {memberAssignments.reduce((sum, a) => sum + a.dates.length, 0)} Tage
                        </span>
                      )}
                    </button>
                  );
                })}

                {activeMembers.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Keine aktiven Mitarbeiter vorhanden
                  </p>
                )}
              </div>

              {/* Bereits eingeplante Mitarbeiter */}
              {phaseAssignments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Bereits eingeplant
                  </h3>
                  <div className="space-y-2">
                    {phaseAssignments.map(assignment => {
                      const member = teamMembers.find(m => m.id === assignment.memberId);
                      if (!member) return null;

                      return (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {assignment.dates.length} Tag{assignment.dates.length !== 1 ? 'e' : ''}
                                {assignment.projectRole && ` • ${assignment.projectRole}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAssignment(assignment.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Rechte Spalte: Kalender & Datum auswählen */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Tage auswählen
              </h3>

              {!selectedMemberId ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Wähle zuerst einen Mitarbeiter aus
                </div>
              ) : (
                <>
                  {/* Mini-Kalender */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    {/* Monat-Navigation */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180 text-gray-500" />
                      </button>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {monthNames[month]} {year}
                      </span>
                      <button
                        onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    {/* Wochentage */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {weekdays.map(day => (
                        <div key={day} className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Tage */}
                    <div className="grid grid-cols-7 gap-1">
                      {[...Array(adjustedOffset)].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}

                      {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const dateKey = createDateKey(year, month, day);
                        const isSelected = selectedDates.includes(dateKey);
                        const isPast = dateKey < todayKey;
                        const hasConflict = conflicts.some(c => c.date === dateKey);
                        const isWeekend = new Date(year, month, day).getDay() === 0 ||
                                          new Date(year, month, day).getDay() === 6;

                        return (
                          <button
                            key={day}
                            onClick={() => !isPast && handleDayClick(dateKey)}
                            disabled={isPast}
                            className={`
                              aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                              ${isPast
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : isSelected
                                  ? hasConflict
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-primary text-primary-foreground'
                                  : isWeekend
                                    ? 'text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ausgewählte Tage */}
                  {selectedDates.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {selectedDates.length} Tag{selectedDates.length !== 1 ? 'e' : ''} ausgewählt:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedDates.map(date => (
                          <span
                            key={date}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                          >
                            {formatDate(date)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Konflikte */}
                  {conflicts.length > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Konflikte gefunden
                      </p>
                      <ul className="mt-2 text-xs text-orange-600 dark:text-orange-400 space-y-1">
                        {conflicts.slice(0, 3).map(c => (
                          <li key={c.date}>
                            {formatDate(c.date)}: {c.reason}
                          </li>
                        ))}
                        {conflicts.length > 3 && (
                          <li>... und {conflicts.length - 3} weitere</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Rolle */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rolle im Projekt (optional)
                    </label>
                    <input
                      type="text"
                      value={projectRole}
                      onChange={(e) => setProjectRole(e.target.value)}
                      placeholder="z.B. Produktionsleitung, Aufnahmeleitung..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Schließen
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedMemberId || selectedDates.length === 0}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Einplanen
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhaseDetail;
