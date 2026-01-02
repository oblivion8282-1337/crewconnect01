import React, { useMemo } from 'react';
import { Briefcase, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { createDateKey } from '../../utils/dateUtils';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '../../data/initialData';

/**
 * MemberProjects - Projektliste für Mitarbeiter
 * Zeigt nur Projekte, wo der Mitarbeiter eingeplant ist
 */
const MemberProjects = ({
  member,
  assignments = [],
  projects = [],
  onSelectProject
}) => {
  const todayKey = createDateKey(new Date());

  // Projekte wo Mitarbeiter eingeplant ist, mit zusätzlichen Infos
  const myProjects = useMemo(() => {
    const projectIds = [...new Set(assignments.map(a => a.projectId))];

    return projects
      .filter(p => projectIds.includes(p.id))
      .map(project => {
        const projectAssignments = assignments.filter(a => a.projectId === project.id);
        const allDates = projectAssignments.flatMap(a => a.dates).sort();
        const uniqueDates = [...new Set(allDates)];
        const roles = [...new Set(projectAssignments.map(a => a.projectRole).filter(Boolean))];
        const phases = [...new Set(projectAssignments.map(a => a.phaseId))];

        // Zeitraum der eigenen Einsätze
        const startDate = uniqueDates[0];
        const endDate = uniqueDates[uniqueDates.length - 1];

        // Nächster und vergangener Einsatz
        const futureDates = uniqueDates.filter(d => d >= todayKey);
        const pastDates = uniqueDates.filter(d => d < todayKey);
        const nextDate = futureDates[0];
        const lastDate = pastDates[pastDates.length - 1];

        return {
          ...project,
          myAssignments: projectAssignments,
          myDates: uniqueDates,
          myRoles: roles,
          myPhaseIds: phases,
          dateRange: { start: startDate, end: endDate },
          nextDate,
          lastDate,
          totalDays: uniqueDates.length,
          isActive: futureDates.length > 0 || uniqueDates.includes(todayKey)
        };
      })
      .sort((a, b) => {
        // Aktive Projekte zuerst, dann nach nächstem Datum
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        if (a.nextDate && b.nextDate) return a.nextDate.localeCompare(b.nextDate);
        if (a.nextDate) return -1;
        if (b.nextDate) return 1;
        return (b.lastDate || '').localeCompare(a.lastDate || '');
      });
  }, [assignments, projects, todayKey]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const activeProjects = myProjects.filter(p => p.isActive);
  const pastProjects = myProjects.filter(p => !p.isActive);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meine Projekte</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Projekte, bei denen du eingeplant bist
        </p>
      </div>

      {myProjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Keine Projekte zugewiesen
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Du bist aktuell bei keinem Projekt eingeplant.
          </p>
        </div>
      ) : (
        <>
          {/* Aktive Projekte */}
          {activeProjects.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Aktive Projekte ({activeProjects.length})
              </h2>
              <div className="space-y-3">
                {activeProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={() => onSelectProject(project.id)}
                    formatDate={formatDate}
                    todayKey={todayKey}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Vergangene Projekte */}
          {pastProjects.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Vergangene Projekte ({pastProjects.length})
              </h2>
              <div className="space-y-3">
                {pastProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={() => onSelectProject(project.id)}
                    formatDate={formatDate}
                    todayKey={todayKey}
                    isPast
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Projekt-Karte
 */
const ProjectCard = ({ project, onSelect, formatDate, todayKey, isPast = false }) => {
  const statusColor = PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-700';
  const statusLabel = PROJECT_STATUS_LABELS[project.status] || project.status;

  return (
    <button
      onClick={onSelect}
      className={`
        w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
        p-4 text-left hover:border-primary/50 hover:shadow-md transition-all group
        ${isPast ? 'opacity-75' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${isPast ? 'bg-gray-100 dark:bg-gray-700' : 'bg-primary/10'}
        `}>
          <Briefcase className={`w-6 h-6 ${isPast ? 'text-gray-400' : 'text-primary'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {project.client}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {project.totalDays} Tag{project.totalDays !== 1 ? 'e' : ''}
            </span>

            {project.myRoles.length > 0 && (
              <span className="flex items-center gap-1">
                Rolle: {project.myRoles.join(', ')}
              </span>
            )}
          </div>

          {project.nextDate && (
            <div className="mt-2">
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${project.myDates.includes(todayKey)
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}
              `}>
                {project.myDates.includes(todayKey)
                  ? 'Heute eingeplant'
                  : `Nächster Einsatz: ${formatDate(project.nextDate)}`}
              </span>
            </div>
          )}

          {isPast && project.lastDate && (
            <div className="mt-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Letzter Einsatz: {formatDate(project.lastDate)}
              </span>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-primary flex-shrink-0" />
      </div>
    </button>
  );
};

export default MemberProjects;
