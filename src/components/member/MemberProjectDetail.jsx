import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  Users,
  FileText,
  Euro,
  Building2,
  User
} from 'lucide-react';
import { createDateKey } from '../../utils/dateUtils';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '../../data/initialData';

/**
 * MemberProjectDetail - Projekt-Detailansicht für Mitarbeiter
 * Zeigt eingeschränkte Informationen basierend auf Berechtigungen
 */
const MemberProjectDetail = ({
  member,
  project,
  assignments = [],
  teamMembers = [],
  freelancers = [],
  bookings = [],
  permissions = {},
  onBack
}) => {
  const todayKey = createDateKey(new Date());

  // Eigene Einplanungen für dieses Projekt
  const myAssignments = useMemo(() => {
    return assignments
      .filter(a => a.projectId === project?.id && a.memberId === member?.id)
      .map(a => {
        const phase = project?.phases?.find(ph => ph.id === a.phaseId);
        return { ...a, phase };
      });
  }, [assignments, project, member]);

  // Alle Einsatztage
  const allMyDates = useMemo(() => {
    return [...new Set(myAssignments.flatMap(a => a.dates))].sort();
  }, [myAssignments]);

  // Team in meinen Phasen
  const teamInMyPhases = useMemo(() => {
    const myPhaseIds = [...new Set(myAssignments.map(a => a.phaseId))];

    // Andere Team-Mitglieder
    const otherTeamAssignments = assignments.filter(a =>
      a.projectId === project?.id &&
      myPhaseIds.includes(a.phaseId) &&
      a.memberId !== member?.id
    );

    const teamMemberIds = [...new Set(otherTeamAssignments.map(a => a.memberId))];
    const teamWithRoles = teamMemberIds.map(memberId => {
      const memberInfo = teamMembers.find(m => m.id === memberId);
      const memberAssignments = otherTeamAssignments.filter(a => a.memberId === memberId);
      const roles = [...new Set(memberAssignments.map(a => a.projectRole).filter(Boolean))];
      return {
        ...memberInfo,
        roles,
        assignments: memberAssignments
      };
    });

    // Freelancer in meinen Phasen
    const phaseBookings = bookings.filter(b =>
      b.projectId === project?.id &&
      myPhaseIds.includes(b.phaseId) &&
      (b.status === 'confirmed' || b.status === 'pending')
    );

    const freelancerIds = [...new Set(phaseBookings.map(b => b.freelancerId))];
    const freelancerWithRoles = freelancerIds.map(freelancerId => {
      const freelancerInfo = freelancers.find(f => f.id === freelancerId);
      const freelancerBookings = phaseBookings.filter(b => b.freelancerId === freelancerId);
      return {
        ...freelancerInfo,
        bookings: freelancerBookings,
        isFreelancer: true
      };
    });

    return {
      teamMembers: teamWithRoles,
      freelancers: freelancerWithRoles
    };
  }, [myAssignments, assignments, project, member, teamMembers, bookings, freelancers]);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500">Projekt nicht gefunden</p>
        </div>
      </div>
    );
  }

  const statusColor = PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-700';
  const statusLabel = PROJECT_STATUS_LABELS[project.status] || project.status;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück zu meinen Projekten
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {project.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {project.client}
                  </p>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>

              {project.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Meine Einplanungen */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Meine Einplanung
          </h2>
        </div>

        <div className="p-6">
          {myAssignments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Keine Einplanungen gefunden.
            </p>
          ) : (
            <div className="space-y-4">
              {myAssignments.map(assignment => (
                <div
                  key={assignment.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {assignment.phase?.name || 'Phase'}
                      </h3>
                      {assignment.projectRole && (
                        <p className="text-sm text-primary mt-1">
                          Rolle: {assignment.projectRole}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {assignment.dates.length} Tag{assignment.dates.length !== 1 ? 'e' : ''}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {assignment.dates.sort().map(date => (
                      <span
                        key={date}
                        className={`text-xs px-2 py-1 rounded-full ${
                          date === todayKey
                            ? 'bg-green-500 text-white font-semibold'
                            : date < todayKey
                              ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {formatDate(date)}
                      </span>
                    ))}
                  </div>

                  {assignment.note && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
                      {assignment.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team in meinen Phasen */}
      {(teamInMyPhases.teamMembers.length > 0 || teamInMyPhases.freelancers.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team in meinen Phasen
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Team-Mitglieder */}
            {teamInMyPhases.teamMembers.map(tm => (
              <div key={tm.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                  {tm.firstName?.charAt(0)}{tm.lastName?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {tm.firstName} {tm.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tm.position}
                    {tm.roles.length > 0 && ` • ${tm.roles.join(', ')}`}
                  </p>
                </div>
              </div>
            ))}

            {/* Freelancer */}
            {teamInMyPhases.freelancers.map(f => (
              <div key={f.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {f.avatar || '👤'}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {f.firstName} {f.lastName}
                    <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      Freelancer
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {f.professions?.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget (nur wenn Berechtigung) */}
      {permissions.canSeeBudget && project.budget && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Euro className="w-5 h-5 text-primary" />
              Budget
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gesamt</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {project.budget.total?.toLocaleString('de-DE')} €
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ausgegeben</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {project.budget.spent?.toLocaleString('de-DE')} €
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notizen (nur wenn Berechtigung) */}
      {permissions.canAddNotes && project.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Notizen
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {project.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProjectDetail;
