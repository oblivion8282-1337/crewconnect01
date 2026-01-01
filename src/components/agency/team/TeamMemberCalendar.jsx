import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Briefcase, Plane, Heart, GraduationCap, Baby, Clock } from 'lucide-react';
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
 */
const TeamMemberCalendar = ({
  member,
  memberAbsences = [],
  memberAssignments = [],
  onDayClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month);

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

      statuses[dateKey] = {
        isWorkingDay,
        absence,
        assignments,
        hasAbsence: !!absence,
        hasAssignment: assignments.length > 0
      };
    }

    return statuses;
  }, [year, month, daysInMonth, member?.workingDays, memberAbsences, memberAssignments]);

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const handleDayClick = (dateKey) => {
    const status = dayStatuses[dateKey];
    setSelectedDay({ date: dateKey, ...status });
    onDayClick?.(dateKey, status);
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
            const isToday = dateKey === createDateKey(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate()
            );

            return (
              <button
                key={day}
                onClick={() => handleDayClick(dateKey)}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all
                  ${getDayColor(status)}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                  ${isToday ? 'ring-2 ring-gray-400 dark:ring-gray-500' : ''}
                  hover:opacity-80
                `}
              >
                <span>{day}</span>
                {/* Kleine Indikatoren */}
                {status?.hasAssignment && status?.hasAbsence && (
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
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {formatDate(selectedDay.date)}
            </h3>

            {/* Arbeitstag-Status */}
            <div className={`text-sm ${selectedDay.isWorkingDay ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {selectedDay.isWorkingDay ? 'Arbeitstag' : 'Kein Arbeitstag'}
            </div>

            {/* Abwesenheit */}
            {selectedDay.absence && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-medium">
                  {React.createElement(getAbsenceIcon(selectedDay.absence.type), { className: 'w-4 h-4' })}
                  {getAbsenceTypeLabel(selectedDay.absence.type)}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                  {new Date(selectedDay.absence.startDate).toLocaleDateString('de-DE')} - {new Date(selectedDay.absence.endDate).toLocaleDateString('de-DE')}
                </div>
                {selectedDay.absence.note && (
                  <div className="text-sm text-orange-500 dark:text-orange-400 mt-1">
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
                {selectedDay.assignments.map(assignment => (
                  <div key={assignment.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium">
                      <Briefcase className="w-4 h-4" />
                      {assignment.projectRole || 'Projekt'}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                      {assignment.dates?.length || 0} Tag(e)
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Verfügbar */}
            {!selectedDay.absence && selectedDay.assignments?.length === 0 && selectedDay.isWorkingDay && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                Verfügbar
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
  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded border border-green-300 dark:border-green-700" />
      Verfügbar
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-blue-500 rounded" />
      Projekt
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-orange-500 rounded" />
      Urlaub
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-red-500 rounded" />
      Krank
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      Frei
    </span>
  </div>
);

export default TeamMemberCalendar;
