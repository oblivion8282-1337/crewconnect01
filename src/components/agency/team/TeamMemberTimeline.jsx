import React, { useMemo } from 'react';
import {
  Calendar,
  Briefcase,
  Plane,
  Heart,
  GraduationCap,
  Baby,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { getAbsenceTypeLabel } from '../../../constants/team';

/**
 * TeamMemberTimeline - Zeigt kommende Abwesenheiten und Einplanungen
 *
 * @param {Array} memberAbsences - Abwesenheiten des Mitglieds
 * @param {Array} memberAssignments - Einplanungen des Mitglieds
 * @param {number} limit - Max Anzahl anzuzeigender Einträge
 */
const TeamMemberTimeline = ({
  memberAbsences = [],
  memberAssignments = [],
  limit = 10
}) => {
  // Kombiniere und sortiere alle Events chronologisch
  const timelineEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Abwesenheiten als Events
    const absenceEvents = memberAbsences
      .filter(a => a.endDate >= todayStr) // Nur zukünftige oder laufende
      .map(a => ({
        id: a.id,
        type: 'absence',
        subType: a.type,
        startDate: a.startDate,
        endDate: a.endDate,
        title: getAbsenceTypeLabel(a.type),
        note: a.note,
        isOngoing: a.startDate <= todayStr && a.endDate >= todayStr,
        isPast: a.endDate < todayStr
      }));

    // Einplanungen als Events
    const assignmentEvents = memberAssignments
      .filter(a => a.dates?.some(d => d >= todayStr)) // Nur zukünftige oder laufende
      .map(a => {
        const sortedDates = [...(a.dates || [])].sort();
        const futureDates = sortedDates.filter(d => d >= todayStr);
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
          totalDays: a.dates?.length || 0,
          isOngoing: sortedDates.some(d => d === todayStr),
          isPast: sortedDates.every(d => d < todayStr)
        };
      });

    // Kombinieren und sortieren
    return [...absenceEvents, ...assignmentEvents]
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, limit);
  }, [memberAbsences, memberAssignments, limit]);

  // Icon für Event-Typ
  const getEventIcon = (event) => {
    if (event.type === 'assignment') {
      return Briefcase;
    }
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
      case 'sick':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-700 dark:text-red-300',
          dot: 'bg-red-500'
        };
      case 'training':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'text-purple-600 dark:text-purple-400',
          text: 'text-purple-700 dark:text-purple-300',
          dot: 'bg-purple-500'
        };
      case 'parental':
        return {
          bg: 'bg-pink-50 dark:bg-pink-900/20',
          border: 'border-pink-200 dark:border-pink-800',
          icon: 'text-pink-600 dark:text-pink-400',
          text: 'text-pink-700 dark:text-pink-300',
          dot: 'bg-pink-500'
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
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatOptions = { day: '2-digit', month: 'short' };

    // Prüfe ob Event heute beginnt
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

    if (prefix) {
      return `${prefix} - ${endStr}`;
    }

    return `${startStr} - ${endStr}`;
  };

  // Berechne Anzahl der Tage
  const getDayCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (timelineEvents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Keine kommenden Termine</p>
          <p className="text-sm mt-1">Abwesenheiten und Einplanungen erscheinen hier</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Kommende Termine
      </h3>

      <div className="relative">
        {/* Timeline-Linie */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Events */}
        <div className="space-y-3">
          {timelineEvents.map((event, index) => {
            const colors = getEventColor(event);
            const Icon = getEventIcon(event);
            const dayCount = event.type === 'assignment'
              ? event.totalDays
              : getDayCount(event.startDate, event.endDate);

            return (
              <div key={event.id} className="relative pl-8">
                {/* Timeline-Dot */}
                <div className={`absolute left-1.5 top-3 w-3 h-3 rounded-full ${colors.dot} ring-2 ring-white dark:ring-gray-800`} />

                {/* Event-Card */}
                <div className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
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
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {formatDateRange(event.startDate, event.endDate)}
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
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hinweis wenn mehr Events existieren */}
      {(memberAbsences.length + memberAssignments.length) > limit && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          + {(memberAbsences.length + memberAssignments.length) - limit} weitere Termine
        </div>
      )}
    </div>
  );
};

export default TeamMemberTimeline;
