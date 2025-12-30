import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Users,
  Calendar,
  Euro,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Clock,
  MapPin,
  Package,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import FreelancerSearchModal from '../modals/FreelancerSearchModal';
import { formatDate } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isFixStatus
} from '../../constants/calendar';

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
  onOpenChat
}) => {
  const [activeTab, setActiveTab] = useState('team');
  const [tasks, setTasks] = useState(phase.tasks || []);
  const [newTask, setNewTask] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2); // 0=klein, 1=mittel, 2=normal, 3=groß, 4=sehr groß

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

  // Budget-Berechnung für Phase
  const budgetInfo = useMemo(() => {
    const total = phase.budget || 0;

    // Berechne Kosten basierend auf Buchungen
    let committed = 0;
    let pending = 0;

    phaseBookings.forEach(booking => {
      const days = booking.dates.length;
      const rate = booking.dailyRate || 500; // Default Tagessatz
      const cost = days * rate;

      if (isConfirmedStatus(booking.status)) {
        committed += cost;
      } else if (isPendingStatus(booking.status)) {
        pending += cost;
      }
    });

    const remaining = total - committed - pending;
    const percentUsed = total > 0 ? Math.round(((committed + pending) / total) * 100) : 0;

    return { total, committed, pending, remaining, percentUsed };
  }, [phase.budget, phaseBookings]);

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

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <button
          onClick={onBackToProjects}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Projekte
        </button>
        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        <button
          onClick={onBack}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {project.name}
        </button>
        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        <span className="text-gray-900 dark:text-white font-medium">
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
          <button
            onClick={() => setShowSearch(true)}
            className="px-4 py-2.5 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Freelancer buchen
          </button>
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
                  ? 'bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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

            {team.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Noch keine Freelancer gebucht</p>
                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-4 px-4 py-2 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  Freelancer suchen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {team.map(({ freelancer, bookings: memberBookings }) => {
                  const totalDays = memberBookings.reduce((sum, b) => sum + b.dates.length, 0);
                  const totalCost = memberBookings.reduce((sum, b) => sum + (b.dates.length * (b.dailyRate || 500)), 0);
                  const hasOption = memberBookings.some(b => b.status === BOOKING_STATUS.OPTION_CONFIRMED);
                  const hasFix = memberBookings.some(b => b.status === BOOKING_STATUS.FIX_CONFIRMED);
                  const hasPending = memberBookings.some(b => isPendingStatus(b.status));

                  return (
                    <div key={freelancer.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl">
                            {freelancer.avatar}
                          </div>
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
                          <div className="flex gap-1 mt-2 justify-end">
                            {hasFix && (
                              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-100 dark:border-emerald-800">Fix</span>
                            )}
                            {hasOption && (
                              <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-medium border border-amber-100 dark:border-amber-800">Option</span>
                            )}
                            {hasPending && (
                              <span className="px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg text-xs font-medium border border-violet-100 dark:border-violet-800">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Buchungs-Details */}
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                        {memberBookings.map(booking => (
                          <div key={booking.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              {formatDate(booking.dates[0])} – {formatDate(booking.dates[booking.dates.length - 1])}
                              <span className="text-gray-400 dark:text-gray-500">({booking.dates.length} Tage)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isPendingStatus(booking.status) && (
                                <button
                                  onClick={() => onWithdraw(booking)}
                                  className="px-3 py-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  Zurückziehen
                                </button>
                              )}
                              {booking.status === BOOKING_STATUS.OPTION_CONFIRMED && (
                                <button
                                  onClick={() => onConvertToFix(booking)}
                                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
                                >
                                  Fix buchen
                                </button>
                              )}
                              {booking.status === BOOKING_STATUS.FIX_CONFIRMED && (
                                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs">
                                  Fix bestätigt
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                  className="mt-4 px-4 py-2 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  Freelancer buchen
                </button>
              </div>
            ) : (
              <>
                {/* Timeline Container mit Sticky Names */}
                <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
                  {/* Scrollable Container */}
                  <div className="overflow-x-auto">
                    <div className="min-w-max">
                      {/* Header Row */}
                      <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        {/* Sticky Name Column Header */}
                        <div
                          className="sticky left-0 z-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center px-4"
                          style={{ width: '180px', minWidth: '180px' }}
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
                            const cellWidth = [24, 32, 44, 56, 72][zoomLevel];

                            return (
                              <div
                                key={day.dateStr}
                                className={`flex flex-col items-center justify-center py-3 border-r border-gray-100 dark:border-gray-700 ${
                                  isWeekend ? 'bg-gray-50 dark:bg-gray-900' : ''
                                } ${isFirstOfMonth ? 'border-l-2 border-l-gray-300 dark:border-l-gray-600' : ''}`}
                                style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                              >
                                {/* Month indicator on first of month or first cell */}
                                {(isFirstOfMonth || index === 0) && zoomLevel >= 2 && (
                                  <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">
                                    {day.date.toLocaleDateString('de-DE', { month: 'short' })}
                                  </div>
                                )}
                                <div className={`text-[10px] font-medium ${isWeekend ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {day.date.toLocaleDateString('de-DE', { weekday: zoomLevel >= 2 ? 'short' : 'narrow' })}
                                </div>
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
                            className={`flex ${rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'} hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors`}
                          >
                            {/* Sticky Name Column */}
                            <div
                              className={`sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 flex items-center gap-3 px-4 py-3 ${
                                rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                              }`}
                              style={{ width: '180px', minWidth: '180px' }}
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-lg flex-shrink-0">
                                {freelancer.avatar}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {freelancer.firstName} {freelancer.lastName?.[0]}.
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                  {freelancer.professions?.[0] || 'Freelancer'}
                                </p>
                              </div>
                            </div>

                            {/* Day Cells */}
                            <div className="flex">
                              {timelineData.map(day => {
                                const booking = memberBookings.find(b => b.dates.includes(day.dateStr));
                                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                                const cellWidth = [24, 32, 44, 56, 72][zoomLevel];
                                const cellHeight = [28, 32, 40, 48, 56][zoomLevel];

                                // Determine if this is start/middle/end of a booking block
                                const isBookingStart = booking && !memberBookings.some(b =>
                                  b.id === booking.id &&
                                  b.dates.includes(new Date(new Date(day.dateStr).setDate(day.date.getDate() - 1)).toISOString().split('T')[0])
                                );
                                const isBookingEnd = booking && !memberBookings.some(b =>
                                  b.id === booking.id &&
                                  b.dates.includes(new Date(new Date(day.dateStr).setDate(day.date.getDate() + 1)).toISOString().split('T')[0])
                                );

                                let bgColor = isWeekend ? 'bg-gray-100 dark:bg-gray-700' : 'bg-transparent';
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
                                    className={`border-r border-gray-100 dark:border-gray-700 flex items-center justify-center p-0.5 ${bgColor}`}
                                    style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px`, height: `${cellHeight}px` }}
                                  >
                                    {booking ? (
                                      <div
                                        className={`w-full h-full ${statusColor} ${
                                          isBookingStart && isBookingEnd ? 'rounded-lg' :
                                          isBookingStart ? 'rounded-l-lg' :
                                          isBookingEnd ? 'rounded-r-lg' : ''
                                        } transition-all hover:scale-105 hover:z-10 cursor-pointer`}
                                        title={`${freelancer.firstName} ${freelancer.lastName}\n${booking.status}\n${formatDate(booking.dates[0])} - ${formatDate(booking.dates[booking.dates.length - 1])}`}
                                      />
                                    ) : (
                                      <div className={`w-full h-full rounded ${isWeekend ? '' : 'bg-gray-50 dark:bg-gray-900'}`} />
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

            <div className="grid grid-cols-4 gap-4 mb-6">
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
                <p className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-violet-700 dark:text-violet-300 mt-1">
                  {budgetInfo.pending.toLocaleString('de-DE')} €
                </p>
              </div>
              <div className={`p-4 rounded-xl ${budgetInfo.remaining < 0 ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                <p className={`text-xs font-medium uppercase tracking-wider ${budgetInfo.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  Verbleibend
                </p>
                <p className={`text-2xl font-bold mt-1 ${budgetInfo.remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {budgetInfo.remaining.toLocaleString('de-DE')} €
                </p>
              </div>
            </div>

            {/* Budget-Balken */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">Budget-Auslastung</span>
                <span className="font-medium text-gray-900 dark:text-white">{budgetInfo.percentUsed}%</span>
              </div>
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min((budgetInfo.committed / budgetInfo.total) * 100, 100)}%` }}
                />
                <div
                  className="h-full bg-violet-400 transition-all"
                  style={{ width: `${Math.min((budgetInfo.pending / budgetInfo.total) * 100, 100 - (budgetInfo.committed / budgetInfo.total) * 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span>
                  Bestätigt
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-violet-400"></span>
                  Pending
                </span>
              </div>
            </div>

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
                  const rate = booking.dailyRate || 500;
                  const cost = days * rate;
                  const isConfirmed = isConfirmedStatus(booking.status);

                  return (
                    <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{freelancer.avatar}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {freelancer.firstName} {freelancer.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {days} Tage × {rate.toLocaleString('de-DE')} €
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
                          {isConfirmed ? 'Bestätigt' : 'Pending'}
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
                className="px-4 py-2.5 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
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
    </div>
  );
};

export default PhaseDetail;
