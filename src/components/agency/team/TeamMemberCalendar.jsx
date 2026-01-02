import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Briefcase, Plane, Heart, GraduationCap, Baby, Clock, ExternalLink, Plus, Trash2, ChevronRight as ChevronRightIcon, AlertTriangle } from 'lucide-react';
import { createDateKey, getDaysInMonth, getFirstDayOfMonth, formatDate } from '../../../utils/dateUtils';
import { MONTH_NAMES, WEEKDAY_NAMES } from '../../../constants/calendar';
import { WEEKDAYS, getAbsenceTypeLabel } from '../../../constants/team';

/**
 * TeamMemberCalendar - Kalenderansicht für ein Team-Mitglied
 *
 * Zeigt:
 * - Arbeitstage vs. freie Tage
 * - Abwesenheiten (Urlaub, Krank, etc.)
 * - Einplanungen (Projekte)
 *
 * @param {Object} member - Das Team-Mitglied
 * @param {Array} memberAbsences - Abwesenheiten des Mitglieds
 * @param {Array} memberAssignments - Einplanungen des Mitglieds
 * @param {Array} projects - Alle Projekte für Lookup
 * @param {Function} onDayClick - Callback bei Klick auf Tag
 * @param {Function} onAssignmentClick - Callback bei Klick auf Einplanung (projectId, phaseId)
 * @param {Function} onAddAbsence - Callback zum Hinzufügen einer Abwesenheit (memberId, { type, startDate, endDate, note })
 * @param {Function} onRemoveAbsence - Callback zum Entfernen einer Abwesenheit (absenceId)
 * @param {string} memberId - ID des Mitglieds (für onAddAbsence)
 */
const TeamMemberCalendar = ({
  member,
  memberAbsences = [],
  memberAssignments = [],
  projects = [],
  onDayClick,
  onAssignmentClick,
  onAddAbsence,
  onRemoveAbsence
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [shiftStartDate, setShiftStartDate] = useState(null); // For shift+click range selection
  const [selectedRange, setSelectedRange] = useState(null); // { start, end } for multi-day selection

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month);

  // Lookup für Projekt- und Phasennamen
  const getProjectInfo = (assignment) => {
    const project = projects.find(p => p.id === assignment.projectId);
    if (!project) return { projectName: null, phaseName: null };

    const phase = project.phases?.find(ph => ph.id === assignment.phaseId);
    return {
      projectName: project.name,
      phaseName: phase?.name || null
    };
  };

  // Mapping Wochentage zu Indices (Mo=0, Di=1, ..., So=6)
  const weekdayToIndex = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6
  };

  // Berechne Status für jeden Tag im Monat
  const dayStatuses = useMemo(() => {
    const statuses = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = createDateKey(year, month, day);
      const date = new Date(year, month, day);
      const weekdayIndex = (date.getDay() + 6) % 7; // Konvertiere zu Mo=0

      // Finde ob es ein Arbeitstag ist
      const workingDayKey = Object.keys(weekdayToIndex).find(
        key => weekdayToIndex[key] === weekdayIndex
      );
      const isWorkingDay = member?.workingDays?.includes(workingDayKey);

      // Finde Abwesenheit für diesen Tag
      const absence = memberAbsences.find(a =>
        dateKey >= a.startDate && dateKey <= a.endDate
      );

      // Finde Einplanungen für diesen Tag
      const assignments = memberAssignments.filter(a =>
        a.dates?.includes(dateKey)
      );

      // Detect conflict: has assignment but also sick
      const hasSickConflict = assignments.length > 0 && absence?.type === 'sick';

      statuses[dateKey] = {
        isWorkingDay,
        absence,
        assignments,
        hasAbsence: !!absence,
        hasAssignment: assignments.length > 0,
        hasSickConflict
      };
    }

    return statuses;
  }, [year, month, daysInMonth, member?.workingDays, memberAbsences, memberAssignments]);

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedRange(null);
    setShiftStartDate(null);
  };

  // Helper: Generate date range between two dates
  const getDateRange = (startDateKey, endDateKey) => {
    // Parse YYYY-MM-DD strings
    let start = new Date(startDateKey);
    let end = new Date(endDateKey);
    if (start > end) {
      [start, end] = [end, start];
    }
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // createDateKey needs (year, month, day) where month is 0-indexed
      dates.push(createDateKey(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    return dates;
  };

  const handleDayClick = (dateKey, event) => {
    const status = dayStatuses[dateKey];

    // Shift+Click for range selection
    if (event?.shiftKey && shiftStartDate) {
      const rangeDates = getDateRange(shiftStartDate, dateKey);
      const startKey = rangeDates[0];
      const endKey = rangeDates[rangeDates.length - 1];
      setSelectedRange({ start: startKey, end: endKey, dates: rangeDates });
      setSelectedDay({ date: dateKey, ...status, isRangeEnd: true });
    } else {
      // Normal click - start new selection
      setShiftStartDate(dateKey);
      setSelectedRange(null);
      setSelectedDay({ date: dateKey, ...status });
    }

    onDayClick?.(dateKey, status);
  };

  // Check if a date is within selected range
  const isInSelectedRange = (dateKey) => {
    if (!selectedRange) return false;
    return selectedRange.dates?.includes(dateKey);
  };

  // Farbe für den Tag bestimmen
  const getDayColor = (status) => {
    if (!status) return 'bg-gray-100 dark:bg-gray-700 text-gray-400';

    if (status.hasAbsence) {
      // Verschiedene Farben für Abwesenheitstypen
      const type = status.absence?.type;
      if (type === 'vacation') return 'bg-orange-500 text-white';
      if (type === 'sick') return 'bg-red-500 text-white';
      if (type === 'parental') return 'bg-pink-500 text-white';
      if (type === 'training') return 'bg-purple-500 text-white';
      if (type === 'other') return 'bg-gray-500 text-white';
      return 'bg-orange-500 text-white';
    }

    if (status.hasAssignment) {
      return 'bg-blue-500 text-white';
    }

    if (!status.isWorkingDay) {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500';
    }

    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
  };

  // Icon für Abwesenheitstyp
  const getAbsenceIcon = (type) => {
    switch (type) {
      case 'vacation': return Plane;
      case 'sick': return Heart;
      case 'training': return GraduationCap;
      case 'parental': return Baby;
      default: return Clock;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kalender */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Verfügbarkeit
          </h3>
          <CalendarLegend />
        </div>

        {/* Monat-Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="font-medium text-gray-900 dark:text-white">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_NAMES.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Kalender-Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Leere Zellen vor dem ersten Tag */}
          {[...Array(firstDayOffset)].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Tage des Monats */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateKey = createDateKey(year, month, day);
            const status = dayStatuses[dateKey];
            const isSelected = selectedDay?.date === dateKey;
            const isRangeSelected = isInSelectedRange(dateKey);
            const isRangeStart = selectedRange?.start === dateKey;
            const isRangeEnd = selectedRange?.end === dateKey;
            const isToday = dateKey === createDateKey(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate()
            );

            return (
              <button
                key={day}
                onClick={(e) => handleDayClick(dateKey, e)}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all relative
                  ${getDayColor(status)}
                  ${isSelected && !selectedRange ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                  ${isRangeSelected ? 'ring-2 ring-purple-500 ring-offset-1 dark:ring-offset-gray-800' : ''}
                  ${isRangeStart || isRangeEnd ? 'ring-2 ring-purple-600 ring-offset-2' : ''}
                  ${isToday && !isSelected && !isRangeSelected ? 'ring-2 ring-gray-400 dark:ring-gray-500' : ''}
                  hover:opacity-80
                `}
                title={status?.hasSickConflict ? 'Konflikt: Krank aber eingeplant!' : (shiftStartDate ? 'Shift+Klick für Bereich auswählen' : '')}
              >
                <span>{day}</span>
                {/* Conflict indicator */}
                {status?.hasSickConflict && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                {/* Kleine Indikatoren */}
                {status?.hasAssignment && status?.hasAbsence && !status?.hasSickConflict && (
                  <div className="flex gap-0.5 mt-0.5">
                    <div className="w-1 h-1 rounded-full bg-white/80" />
                    <div className="w-1 h-1 rounded-full bg-white/80" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Details-Sidebar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {selectedDay ? (
          <div className="space-y-4">
            {/* Header - zeigt Range oder einzelnen Tag */}
            {selectedRange ? (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Ausgewählter Zeitraum
                </h3>
                <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  {formatDate(selectedRange.start)} - {formatDate(selectedRange.end)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {selectedRange.dates?.length} Tag{selectedRange.dates?.length > 1 ? 'e' : ''} ausgewählt
                </div>
              </div>
            ) : (
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {formatDate(selectedDay.date)}
              </h3>
            )}

            {/* Shift-Klick Hinweis */}
            {!selectedRange && shiftStartDate && (
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                Shift+Klick auf anderen Tag für Bereichsauswahl
              </div>
            )}

            {/* Conflict Warning */}
            {selectedDay.hasSickConflict && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Konflikt erkannt
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                  Mitarbeiter ist krank, aber für Projekt eingeplant!
                </div>
              </div>
            )}

            {/* Arbeitstag-Status (nur bei einzelnem Tag) */}
            {!selectedRange && (
              <div className={`text-sm ${selectedDay.isWorkingDay ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {selectedDay.isWorkingDay ? 'Arbeitstag' : 'Kein Arbeitstag'}
              </div>
            )}

            {/* Abwesenheit */}
            {selectedDay.absence && (
              <div className={`p-3 rounded-lg ${
                selectedDay.absence.type === 'sick'
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : 'bg-orange-50 dark:bg-orange-900/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 font-medium ${
                    selectedDay.absence.type === 'sick'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-orange-700 dark:text-orange-400'
                  }`}>
                    {React.createElement(getAbsenceIcon(selectedDay.absence.type), { className: 'w-4 h-4' })}
                    {getAbsenceTypeLabel(selectedDay.absence.type)}
                  </div>
                  {onRemoveAbsence && (
                    <button
                      onClick={() => {
                        if (window.confirm('Abwesenheit wirklich löschen?')) {
                          onRemoveAbsence(selectedDay.absence.id);
                        }
                      }}
                      className={`p-1 rounded transition-colors ${
                        selectedDay.absence.type === 'sick'
                          ? 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500'
                          : 'hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-500'
                      }`}
                      title="Abwesenheit löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className={`text-sm mt-1 ${
                  selectedDay.absence.type === 'sick'
                    ? 'text-red-600 dark:text-red-300'
                    : 'text-orange-600 dark:text-orange-300'
                }`}>
                  {new Date(selectedDay.absence.startDate).toLocaleDateString('de-DE')} - {new Date(selectedDay.absence.endDate).toLocaleDateString('de-DE')}
                </div>
                {selectedDay.absence.note && (
                  <div className={`text-sm mt-1 ${
                    selectedDay.absence.type === 'sick'
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-orange-500 dark:text-orange-400'
                  }`}>
                    {selectedDay.absence.note}
                  </div>
                )}
              </div>
            )}

            {/* Einplanungen */}
            {selectedDay.assignments?.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Einplanungen
                </div>
                {selectedDay.assignments.map(assignment => {
                  const { projectName, phaseName } = getProjectInfo(assignment);
                  const isClickable = onAssignmentClick && assignment.projectId && assignment.phaseId;

                  return (
                    <div
                      key={assignment.id}
                      onClick={() => isClickable && onAssignmentClick(assignment.projectId, assignment.phaseId)}
                      className={`p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg ${
                        isClickable ? 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors' : ''
                      }`}
                    >
                      {/* Rolle */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          <span>{assignment.projectRole || 'Einplanung'}</span>
                        </div>
                        {isClickable && (
                          <ExternalLink className="w-4 h-4 text-blue-400 dark:text-blue-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Projekt & Phase */}
                      {(projectName || phaseName) && (
                        <div className="mt-1.5 text-sm text-blue-600 dark:text-blue-300">
                          {projectName && <div className="font-medium">{projectName}</div>}
                          {phaseName && <div className="text-blue-500 dark:text-blue-400">{phaseName}</div>}
                        </div>
                      )}

                      {/* Zeitraum */}
                      <div className="text-xs text-blue-500 dark:text-blue-400 mt-1.5">
                        {assignment.dates?.length > 0 ? (
                          assignment.dates.length === 1
                            ? new Date(assignment.dates[0]).toLocaleDateString('de-DE')
                            : `${new Date(assignment.dates[0]).toLocaleDateString('de-DE')} - ${new Date(assignment.dates[assignment.dates.length - 1]).toLocaleDateString('de-DE')} (${assignment.dates.length} Tage)`
                        ) : (
                          'Keine Daten'
                        )}
                      </div>

                      {/* Hinweis zum Klicken */}
                      {isClickable && (
                        <div className="text-xs text-blue-400 dark:text-blue-500 mt-2 flex items-center gap-1">
                          Zur Phase springen
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Verfügbar */}
            {!selectedDay.absence && selectedDay.assignments?.length === 0 && selectedDay.isWorkingDay && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                Verfügbar
              </div>
            )}

            {/* Quick-Actions für Abwesenheiten */}
            {onAddAbsence && !selectedDay.absence && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Abwesenheit eintragen {selectedRange && `(${selectedRange.dates?.length} Tage)`}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onAddAbsence(member?.id, {
                      type: 'vacation',
                      startDate: selectedRange?.start || selectedDay.date,
                      endDate: selectedRange?.end || selectedDay.date,
                      note: ''
                    })}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                  >
                    <Plane className="w-4 h-4" />
                    Urlaub eintragen
                  </button>
                  <button
                    onClick={() => onAddAbsence(member?.id, {
                      type: 'sick',
                      startDate: selectedRange?.start || selectedDay.date,
                      endDate: selectedRange?.end || selectedDay.date,
                      note: ''
                    })}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Krank eintragen
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tag auswählen für Details</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Kalender-Legende
 */
const CalendarLegend = () => (
  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded border border-green-300 dark:border-green-700" />
      <span>Verfügbar</span>
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-blue-500 rounded" />
      <span>Projekt</span>
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-orange-500 rounded" />
      <span>Urlaub</span>
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-red-500 rounded" />
      <span>Krank</span>
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <span>Frei</span>
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-yellow-500 rounded flex items-center justify-center">
        <AlertTriangle className="w-2 h-2 text-white" />
      </div>
      <span>Konflikt</span>
    </span>
  </div>
);

export default TeamMemberCalendar;
