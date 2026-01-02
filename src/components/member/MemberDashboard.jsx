import React, { useMemo } from 'react';
import { Calendar, Clock, MapPin, Briefcase, AlertCircle, CheckCircle, Clock3 } from 'lucide-react';
import { createDateKey } from '../../utils/dateUtils';

/**
 * MemberDashboard - Dashboard für eingeloggte Mitarbeiter
 * Zeigt eigene Einplanungen, Projekte und Urlaubsanträge
 */
const MemberDashboard = ({
  member,
  assignments = [],
  absences = [],
  absenceRequests = [],
  projects = [],
  teamMembers = [],
  onNavigateToProject,
  onNavigateToCalendar,
  onNavigateToAbsences
}) => {
  const today = new Date();
  const todayKey = createDateKey(today);

  // Diese Woche berechnen
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Montag
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sonntag

  const startOfWeekKey = createDateKey(startOfWeek);
  const endOfWeekKey = createDateKey(endOfWeek);

  // Einplanungen diese Woche
  const thisWeekAssignments = useMemo(() => {
    return assignments.filter(a =>
      a.dates.some(d => d >= startOfWeekKey && d <= endOfWeekKey)
    ).map(a => {
      const project = projects.find(p => p.id === a.projectId);
      const phase = project?.phases?.find(ph => ph.id === a.phaseId);
      const datesThisWeek = a.dates.filter(d => d >= startOfWeekKey && d <= endOfWeekKey).sort();
      return {
        ...a,
        project,
        phase,
        datesThisWeek
      };
    }).sort((a, b) => (a.datesThisWeek[0] || '').localeCompare(b.datesThisWeek[0] || ''));
  }, [assignments, projects, startOfWeekKey, endOfWeekKey]);

  // Projekte wo Mitarbeiter eingeplant ist
  const myProjects = useMemo(() => {
    const projectIds = [...new Set(assignments.map(a => a.projectId))];
    return projects.filter(p => projectIds.includes(p.id));
  }, [assignments, projects]);

  // Offene Urlaubsanträge
  const pendingRequests = absenceRequests.filter(r => r.status === 'pending');

  // Formatiere Datum für Anzeige
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Heute eineplant?
  const todayAssignment = assignments.find(a => a.dates.includes(todayKey));
  const todayProject = todayAssignment ? projects.find(p => p.id === todayAssignment.projectId) : null;

  return (
    <div className="space-y-6">
      {/* Begrüßung */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Willkommen, {member.firstName}!
        </h1>
        {todayAssignment ? (
          <p className="text-gray-600 dark:text-gray-300">
            Du bist heute eingeplant für <span className="font-semibold">{todayProject?.name || 'Projekt'}</span>
            {todayAssignment.projectRole && ` als ${todayAssignment.projectRole}`}.
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">
            Du hast heute keine Einplanung.
          </p>
        )}
      </div>

      {/* Diese Woche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Diese Woche
          </h2>
          <button
            onClick={onNavigateToCalendar}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Kalender öffnen →
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {thisWeekAssignments.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
              Keine Einplanungen diese Woche
            </div>
          ) : (
            thisWeekAssignments.map(assignment => (
              <div
                key={assignment.id}
                className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => onNavigateToProject?.(assignment.projectId)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {assignment.project?.name || 'Projekt'}
                    </h3>
                    {assignment.phase && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        Phase: {assignment.phase.name}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {assignment.datesThisWeek.map(date => (
                        <span
                          key={date}
                          className={`text-xs px-2 py-1 rounded-full ${
                            date === todayKey
                              ? 'bg-primary text-primary-foreground font-semibold'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {formatDate(date)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {assignment.projectRole && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full flex-shrink-0">
                      {assignment.projectRole}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid: Meine Projekte & Urlaubsanträge */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Meine Projekte */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Meine Projekte
              <span className="ml-auto text-sm font-normal text-gray-500 dark:text-gray-400">
                {myProjects.length}
              </span>
            </h2>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
            {myProjects.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                Keine Projekte zugewiesen
              </div>
            ) : (
              myProjects.map(project => {
                const projectAssignments = assignments.filter(a => a.projectId === project.id);
                const allDates = projectAssignments.flatMap(a => a.dates).sort();
                const nextDate = allDates.find(d => d >= todayKey);

                return (
                  <button
                    key={project.id}
                    onClick={() => onNavigateToProject?.(project.id)}
                    className="w-full px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {project.client}
                    </p>
                    {nextDate && (
                      <p className="text-xs text-primary mt-1">
                        Nächster Einsatz: {formatDate(nextDate)}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Urlaubsanträge */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock3 className="w-5 h-5 text-primary" />
              Offene Anträge
              {pendingRequests.length > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </h2>
            <button
              onClick={onNavigateToAbsences}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Alle anzeigen →
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>Keine offenen Anträge</p>
              </div>
            ) : (
              pendingRequests.map(request => (
                <div key={request.id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.type === 'vacation' ? 'Urlaub' :
                         request.type === 'sick' ? 'Krank' :
                         request.type === 'training' ? 'Weiterbildung' : 'Abwesenheit'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </p>
                    </div>
                    <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                      Ausstehend
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
