import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Briefcase, Palmtree, Clock, X, Calendar, Plane, Heart, GraduationCap, Baby, ExternalLink } from 'lucide-react';
import { createDateKey, getDaysInMonth, getFirstDayOfMonth, formatDate } from '../../utils/dateUtils';
import { MONTH_NAMES, WEEKDAY_NAMES } from '../../constants/calendar';
import { getAbsenceTypeLabel } from '../../constants/team';

/**
 * MemberCalendar - Kalender für Mitarbeiter
 * Zeigt eigene Einplanungen und Abwesenheiten
 */
const MemberCalendar = ({
  member,
  assignments = [],
  absences = [],
  absenceRequests = [],
  projects = [],
  currentDate: initialDate,
  onNavigateToPhase
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month);
  const todayKey = createDateKey(new Date());

  // Kommende Termine (Timeline Events)
  const timelineEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Abwesenheiten als Events - KRANK wird ausgefiltert (keine "kommenden Termine")
    const absenceEvents = absences
      .filter(a => a.endDate >= todayStr && a.type !== 'sick')
      .map(a => ({
        id: a.id,
        type: 'absence',
        subType: a.type,
        startDate: a.startDate,
        endDate: a.endDate,
        title: getAbsenceTypeLabel(a.type),
        note: a.note,
        isOngoing: a.startDate <= todayStr && a.endDate >= todayStr,
        isClickable: false
      }));

    // Einplanungen als Events
    const assignmentEvents = assignments
      .filter(a => a.dates?.some(d => d >= todayStr))
      .map(a => {
        const sortedDates = [...(a.dates || [])].sort();
        const futureDates = sortedDates.filter(d => d >= todayStr);
        const project = projects.find(p => p.id === a.projectId);
        const phase = project?.phases?.find(ph => ph.id === a.phaseId);
        return {
          id: a.id,
          type: 'assignment',
          subType: 'project',
          startDate: futureDates[0] || sortedDates[0],
          endDate: futureDates[futureDates.length - 1] || sortedDates[sortedDates.length - 1],
          title: a.projectRole || 'Projekt-Einplanung',
          note: a.note,
          projectId: a.projectId,
          phaseId: a.phaseId,
          projectName: project?.name,
          phaseName: phase?.name,
          totalDays: a.dates?.length || 0,
          isOngoing: sortedDates.some(d => d === todayStr),
          isClickable: !!(a.projectId && a.phaseId && onNavigateToPhase)
        };
      });

    return [...absenceEvents, ...assignmentEvents]
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, 8);
  }, [absences, assignments, projects, onNavigateToPhase]);

  // Icon für Event-Typ
  const getEventIcon = (event) => {
    if (event.type === 'assignment') return Briefcase;
    switch (event.subType) {
      case 'vacation': return Plane;
      case 'sick': return Heart;
      case 'training': return GraduationCap;
      case 'parental': return Baby;
      default: return Clock;
    }
  };

  // Farbe für Event-Typ
  const getEventColor = (event) => {
    if (event.type === 'assignment') {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        text: 'text-blue-700 dark:text-blue-300',
        dot: 'bg-blue-500'
      };
    }
    switch (event.subType) {
      case 'vacation':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          icon: 'text-orange-600 dark:text-orange-400',
          text: 'text-orange-700 dark:text-orange-300',
          dot: 'bg-orange-500'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-700/50',
          border: 'border-gray-200 dark:border-gray-600',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-700 dark:text-gray-300',
          dot: 'bg-gray-500'
        };
    }
  };

  // Formatiere Datum-Range
  const formatDateRangeStr = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatOptions = { day: '2-digit', month: 'short' };
    const isToday = start.toDateString() === today.toDateString();
    const isTomorrow = start.toDateString() === new Date(today.getTime() + 86400000).toDateString();

    let prefix = '';
    if (isToday) prefix = 'Heute';
    else if (isTomorrow) prefix = 'Morgen';

    if (startDate === endDate) {
      return prefix || start.toLocaleDateString('de-DE', formatOptions);
    }

    const startStr = start.toLocaleDateString('de-DE', formatOptions);
    const endStr = end.toLocaleDateString('de-DE', formatOptions);

    if (prefix) return `${prefix} - ${endStr}`;
    return `${startStr} - ${endStr}`;
  };

  // Erstelle eine Map mit allen Tagesinformationen
  const dayInfoMap = useMemo(() => {
    const map = new Map();

    // Einplanungen hinzufügen
    assignments.forEach(assignment => {
      assignment.dates.forEach(dateKey => {
        if (!map.has(dateKey)) {
          map.set(dateKey, { assignments: [], absences: [], pendingRequests: [] });
        }
        const project = projects.find(p => p.id === assignment.projectId);
        const phase = project?.phases?.find(ph => ph.id === assignment.phaseId);
        map.get(dateKey).assignments.push({
          ...assignment,
          project,
          phase
        });
      });
    });

    // Genehmigte Abwesenheiten hinzufügen
    absences.forEach(absence => {
      const start = new Date(absence.startDate);
      const end = new Date(absence.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = createDateKey(d);
        if (!map.has(dateKey)) {
          map.set(dateKey, { assignments: [], absences: [], pendingRequests: [] });
        }
        map.get(dateKey).absences.push(absence);
      }
    });

    // Offene Anträge hinzufügen
    absenceRequests.filter(r => r.status === 'pending').forEach(request => {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = createDateKey(d);
        if (!map.has(dateKey)) {
          map.set(dateKey, { assignments: [], absences: [], pendingRequests: [] });
        }
        map.get(dateKey).pendingRequests.push(request);
      }
    });

    return map;
  }, [assignments, absences, absenceRequests, projects]);

  const getDayStatus = (dateKey) => {
    const info = dayInfoMap.get(dateKey);
    if (!info) return { color: 'default', info: null };

    if (info.absences.length > 0) {
      return { color: 'absent', info };
    }
    if (info.pendingRequests.length > 0) {
      return { color: 'pending', info };
    }
    if (info.assignments.length > 0) {
      return { color: 'busy', info };
    }
    return { color: 'default', info };
  };

  const getDayColorClass = (color) => {
    switch (color) {
      case 'busy':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'absent':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'pending':
        return 'bg-orange-400 text-white hover:bg-orange-500 border-2 border-dashed border-orange-600';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (dateKey) => {
    const status = getDayStatus(dateKey);
    setSelectedDay({ dateKey, ...status });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Kommende Termine */}
      {timelineEvents.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Kommende Termine
          </h3>

          <div className="relative">
            {/* Timeline-Linie */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {/* Events */}
            <div className="space-y-3">
              {timelineEvents.map((event) => {
                const colors = getEventColor(event);
                const Icon = getEventIcon(event);
                const dayCount = event.type === 'assignment'
                  ? event.totalDays
                  : Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60 * 24)) + 1;

                const handleClick = () => {
                  if (event.isClickable && onNavigateToPhase) {
                    onNavigateToPhase(event.projectId, event.phaseId);
                  }
                };

                return (
                  <div key={event.id} className="relative pl-8">
                    {/* Timeline-Dot */}
                    <div className={`absolute left-1.5 top-3 w-3 h-3 rounded-full ${colors.dot} ring-2 ring-white dark:ring-gray-800`} />

                    {/* Event-Card */}
                    <div
                      onClick={handleClick}
                      className={`p-3 rounded-lg border ${colors.bg} ${colors.border} ${
                        event.isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${colors.icon}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${colors.text}`}>
                                {event.title}
                              </span>
                              {event.isOngoing && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                  JETZT
                                </span>
                              )}
                            </div>

                            {/* Projekt & Phase für Assignments */}
                            {event.type === 'assignment' && (event.projectName || event.phaseName) && (
                              <div className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">
                                {event.projectName}
                                {event.phaseName && (
                                  <span className="text-blue-500 dark:text-blue-500"> / {event.phaseName}</span>
                                )}
                              </div>
                            )}

                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                              {formatDateRangeStr(event.startDate, event.endDate)}
                              <span className="text-gray-400 dark:text-gray-500 ml-2">
                                ({dayCount} Tag{dayCount > 1 ? 'e' : ''})
                              </span>
                            </div>
                            {event.note && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {event.note}
                              </div>
                            )}
                          </div>
                        </div>
                        {event.isClickable ? (
                          <ExternalLink className="w-4 h-4 text-blue-400 dark:text-blue-500 flex-shrink-0 mt-1" />
                        ) : (
                          <div className="w-4 h-4 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Kalender Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kalender */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          {/* Header mit Legende */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mein Kalender</h2>
          <div className="flex gap-3 text-xs flex-wrap justify-end text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              Eingeplant
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              Abwesend
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-400 rounded border-2 border-dashed border-orange-600"></div>
              Antrag
            </span>
          </div>
        </div>

        {/* Monat-Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_NAMES.map(day => (
            <div key={day} className="text-center text-xs text-gray-500 dark:text-gray-400 py-2 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Tage */}
        <div className="grid grid-cols-7 gap-1">
          {/* Leere Zellen vor dem ersten Tag */}
          {[...Array(firstDayOffset)].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Tage des Monats */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateKey = createDateKey(year, month, day);
            const status = getDayStatus(dateKey);
            const isSelected = selectedDay?.dateKey === dateKey;
            const isToday = dateKey === todayKey;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(dateKey)}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                  ${getDayColorClass(status.color)}
                  ${isSelected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800' : ''}
                  ${isToday && status.color === 'default' ? 'ring-2 ring-gray-400 dark:ring-gray-500' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seitenleiste mit Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        {selectedDay ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {formatDate(selectedDay.dateKey)}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {selectedDay.info ? (
              <div className="space-y-4">
                {/* Einplanungen */}
                {selectedDay.info.assignments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Einplanung
                    </h4>
                    {selectedDay.info.assignments.map((assignment, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-2"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {assignment.project?.name || 'Projekt'}
                        </p>
                        {assignment.phase && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Phase: {assignment.phase.name}
                          </p>
                        )}
                        {assignment.projectRole && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            Rolle: {assignment.projectRole}
                          </p>
                        )}
                        {assignment.timeSlots && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {assignment.timeSlots.start} - {assignment.timeSlots.end}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Abwesenheiten */}
                {selectedDay.info.absences.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Palmtree className="w-4 h-4" />
                      Abwesend
                    </h4>
                    {selectedDay.info.absences.map((absence, idx) => (
                      <div
                        key={idx}
                        className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-2"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {absence.type === 'vacation' ? 'Urlaub' :
                           absence.type === 'sick' ? 'Krank' :
                           absence.type === 'training' ? 'Weiterbildung' :
                           absence.type === 'other_project' ? 'Anderes Projekt' : 'Abwesenheit'}
                        </p>
                        {absence.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {absence.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Offene Anträge */}
                {selectedDay.info.pendingRequests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Offener Antrag
                    </h4>
                    {selectedDay.info.pendingRequests.map((request, idx) => (
                      <div
                        key={idx}
                        className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-2 border border-dashed border-orange-300 dark:border-orange-700"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {request.type === 'vacation' ? 'Urlaub' :
                           request.type === 'sick' ? 'Krank' :
                           request.type === 'training' ? 'Weiterbildung' : 'Abwesenheit'}
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                          Warte auf Genehmigung
                        </p>
                        {request.reason && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {request.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Keine Einträge an diesem Tag.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Wähle einen Tag im Kalender aus, um Details zu sehen.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MemberCalendar;
