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
  RotateCcw
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
  getDayStatus,
  onBack,
  onBackToProjects,
  onBook,
  onConvertToFix,
  onWithdraw,
  onUpdatePhase
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
          className="text-slate-500 hover:text-slate-900 transition-colors"
        >
          Projekte
        </button>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-900 transition-colors"
        >
          {project.name}
        </button>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-900 font-medium">
          {phase.name}
        </span>
      </nav>

      {/* Phase Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{phase.name}</h1>
            <p className="text-slate-500 mt-1">
              {effectiveDateRange.startDate && effectiveDateRange.endDate
                ? `${formatDate(effectiveDateRange.startDate)} – ${formatDate(effectiveDateRange.endDate)}`
                : 'Kein Zeitraum festgelegt – buche Freelancer um Zeitraum zu definieren'}
            </p>
          </div>
          <button
            onClick={() => setShowSearch(true)}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Freelancer buchen
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Team</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{team.length}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Buchungen</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{phaseBookings.length}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Budget</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{budgetInfo.total.toLocaleString('de-DE')} €</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Aufgaben</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
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
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200">
        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Team-Übersicht</h2>

            {team.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Noch keine Freelancer gebucht</p>
                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
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
                    <div key={freelancer.id} className="p-4 border border-slate-200 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                            {freelancer.avatar}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {freelancer.firstName} {freelancer.lastName}
                            </h3>
                            <p className="text-sm text-slate-500">{freelancer.professions?.[0]}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
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
                          <p className="font-semibold text-slate-900">{totalDays} Tage</p>
                          <p className="text-sm text-slate-500">{totalCost.toLocaleString('de-DE')} €</p>
                          <div className="flex gap-1 mt-2 justify-end">
                            {hasFix && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100">Fix</span>
                            )}
                            {hasOption && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-100">Option</span>
                            )}
                            {hasPending && (
                              <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-medium border border-violet-100">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Buchungs-Details */}
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                        {memberBookings.map(booking => (
                          <div key={booking.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {formatDate(booking.dates[0])} – {formatDate(booking.dates[booking.dates.length - 1])}
                              <span className="text-slate-400">({booking.dates.length} Tage)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isPendingStatus(booking.status) && (
                                <button
                                  onClick={() => onWithdraw(booking)}
                                  className="px-3 py-1 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50"
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
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs">
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
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="p-6">
            {/* Header mit Zoom-Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>

              {timelineData.length > 0 && (
                <div className="flex items-center gap-3">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setZoomLevel(Math.max(0, zoomLevel - 1))}
                      disabled={zoomLevel === 0}
                      className="p-1.5 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                      title="Verkleinern"
                    >
                      <ZoomOut className="w-4 h-4 text-slate-600" />
                    </button>

                    {/* Zoom Slider */}
                    <div className="flex items-center gap-1 px-2">
                      {[0, 1, 2, 3, 4].map(level => (
                        <button
                          key={level}
                          onClick={() => setZoomLevel(level)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            level === zoomLevel
                              ? 'bg-slate-900 scale-125'
                              : 'bg-slate-300 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setZoomLevel(Math.min(4, zoomLevel + 1))}
                      disabled={zoomLevel === 4}
                      className="p-1.5 rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                      title="Vergrößern"
                    >
                      <ZoomIn className="w-4 h-4 text-slate-600" />
                    </button>

                    <div className="w-px h-4 bg-slate-300 mx-1" />

                    <button
                      onClick={() => setZoomLevel(2)}
                      className="p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all"
                      title="Zurücksetzen"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  {/* Zoom Label */}
                  <span className="text-xs text-slate-400 min-w-[60px]">
                    {['XS', 'S', 'M', 'L', 'XL'][zoomLevel]}
                  </span>
                </div>
              )}
            </div>

            {timelineData.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-2">Noch keine Buchungen in dieser Phase</p>
                <p className="text-sm text-slate-400">
                  Der Zeitraum wird automatisch aus den Buchungsdaten berechnet.
                </p>
                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                >
                  Freelancer buchen
                </button>
              </div>
            ) : (
              <>
                {/* Timeline Container mit Sticky Names */}
                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  {/* Scrollable Container */}
                  <div className="overflow-x-auto">
                    <div className="min-w-max">
                      {/* Header Row */}
                      <div className="flex bg-white border-b border-slate-200">
                        {/* Sticky Name Column Header */}
                        <div
                          className="sticky left-0 z-20 bg-white border-r border-slate-200 flex items-center px-4"
                          style={{ width: '180px', minWidth: '180px' }}
                        >
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                                className={`flex flex-col items-center justify-center py-3 border-r border-slate-100 ${
                                  isWeekend ? 'bg-slate-50' : ''
                                } ${isFirstOfMonth ? 'border-l-2 border-l-slate-300' : ''}`}
                                style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                              >
                                {/* Month indicator on first of month or first cell */}
                                {(isFirstOfMonth || index === 0) && zoomLevel >= 2 && (
                                  <div className="text-[10px] font-medium text-slate-400 mb-0.5">
                                    {day.date.toLocaleDateString('de-DE', { month: 'short' })}
                                  </div>
                                )}
                                <div className={`text-[10px] font-medium ${isWeekend ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {day.date.toLocaleDateString('de-DE', { weekday: zoomLevel >= 2 ? 'short' : 'narrow' })}
                                </div>
                                <div className={`text-sm font-bold ${isWeekend ? 'text-slate-400' : 'text-slate-700'}`}>
                                  {day.date.getDate()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Team Rows */}
                      {team.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          Keine Buchungen vorhanden
                        </div>
                      ) : (
                        team.map(({ freelancer, bookings: memberBookings }, rowIndex) => (
                          <div
                            key={freelancer.id}
                            className={`flex ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/30 transition-colors`}
                          >
                            {/* Sticky Name Column */}
                            <div
                              className={`sticky left-0 z-10 border-r border-slate-200 flex items-center gap-3 px-4 py-3 ${
                                rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                              }`}
                              style={{ width: '180px', minWidth: '180px' }}
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-lg flex-shrink-0">
                                {freelancer.avatar}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {freelancer.firstName} {freelancer.lastName?.[0]}.
                                </p>
                                <p className="text-xs text-slate-400 truncate">
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

                                let bgColor = isWeekend ? 'bg-slate-100' : 'bg-transparent';
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
                                    className={`border-r border-slate-100 flex items-center justify-center p-0.5 ${bgColor}`}
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
                                      <div className={`w-full h-full rounded ${isWeekend ? '' : 'bg-slate-50'}`} />
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
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-6 text-xs">
                    <span className="text-slate-400 font-medium">Status:</span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-gradient-to-b from-emerald-400 to-emerald-500 shadow-sm"></span>
                      <span className="text-slate-600">Fix bestätigt</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-gradient-to-b from-amber-300 to-amber-400 shadow-sm"></span>
                      <span className="text-slate-600">Option</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-gradient-to-b from-violet-400 to-violet-500 shadow-sm"></span>
                      <span className="text-slate-600">Ausstehend</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
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
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Budget-Tracking</h2>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gesamt</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {budgetInfo.total.toLocaleString('de-DE')} €
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Bestätigt</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {budgetInfo.committed.toLocaleString('de-DE')} €
                </p>
              </div>
              <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-violet-700 mt-1">
                  {budgetInfo.pending.toLocaleString('de-DE')} €
                </p>
              </div>
              <div className={`p-4 rounded-xl ${budgetInfo.remaining < 0 ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                <p className={`text-xs font-medium uppercase tracking-wider ${budgetInfo.remaining < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  Verbleibend
                </p>
                <p className={`text-2xl font-bold mt-1 ${budgetInfo.remaining < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {budgetInfo.remaining.toLocaleString('de-DE')} €
                </p>
              </div>
            </div>

            {/* Budget-Balken */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Budget-Auslastung</span>
                <span className="font-medium text-slate-900">{budgetInfo.percentUsed}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min((budgetInfo.committed / budgetInfo.total) * 100, 100)}%` }}
                />
                <div
                  className="h-full bg-violet-400 transition-all"
                  style={{ width: `${Math.min((budgetInfo.pending / budgetInfo.total) * 100, 100 - (budgetInfo.committed / budgetInfo.total) * 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
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
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Kosten-Aufschlüsselung</h3>
            {phaseBookings.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Keine Buchungen vorhanden</p>
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
                    <div key={booking.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{freelancer.avatar}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {freelancer.firstName} {freelancer.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {days} Tage × {rate.toLocaleString('de-DE')} €
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{cost.toLocaleString('de-DE')} €</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-violet-100 text-violet-700'
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
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Aufgaben & Checkliste</h2>

            {/* Neue Aufgabe hinzufügen */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Neue Aufgabe hinzufügen..."
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              <button
                onClick={handleAddTask}
                disabled={!newTask.trim()}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Aufgaben-Liste */}
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Noch keine Aufgaben erstellt</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 border border-slate-200 rounded-xl transition-colors ${
                      task.completed ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {task.text}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Fortschritt */}
            {tasks.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Fortschritt</span>
                  <span className="font-medium text-slate-900">
                    {tasks.filter(t => t.completed).length} / {tasks.length} erledigt
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick-Add Templates */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Schnell hinzufügen</h3>
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
                    className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <template.icon className="w-4 h-4 text-slate-400" />
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
          onBook={onBook}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};

export default PhaseDetail;
