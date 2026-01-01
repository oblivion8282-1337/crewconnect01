import React from 'react';
import {
  User,
  Mail,
  Briefcase,
  ChevronRight,
  Shield,
  AlertCircle
} from 'lucide-react';
import { getTeamRoleLabel, getEmploymentTypeLabel } from '../../../constants/team';

/**
 * TeamMemberCard - Kompakte Karte für ein Team-Mitglied
 *
 * @param {Object} member - Das Team-Mitglied
 * @param {Function} onClick - Callback für Klick
 * @param {Object} utilization - Auslastungsdaten { percentage, daysAssigned, totalDays }
 * @param {boolean} hasAbsenceRequest - Hat offene Abwesenheitsanfrage
 * @param {boolean} isSelected - Ist ausgewählt
 */
const TeamMemberCard = ({
  member,
  onClick,
  utilization,
  hasAbsenceRequest = false,
  isSelected = false
}) => {
  const isProjectLead = member.role === 'projectlead';
  const memberName = member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unbekannt';

  // Auslastung-Farbe basierend auf Prozent
  const getUtilizationColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getUtilizationBg = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-4 rounded-lg border cursor-pointer transition-all duration-200
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
        }
      `}
    >
      {/* Offene Abwesenheitsanfrage Badge */}
      {hasAbsenceRequest && (
        <div
          className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 rounded-full flex items-center gap-1"
          title="Hat offene Abwesenheitsanfrage"
        >
          <AlertCircle className="w-3 h-3 text-white" />
          <span className="text-[10px] font-medium text-white">Anfrage</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {memberName}
            </h3>
            {isProjectLead && (
              <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" title="Projektleitung" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{member.position || getTeamRoleLabel(member.role)}</span>
          </div>

          {/* Kontakt - immer sichtbar, aber dezent */}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
            {member.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate max-w-[140px]">{member.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Auslastung */}
        {utilization && (
          <div className="flex-shrink-0 text-right">
            <div className={`text-lg font-semibold ${getUtilizationColor(utilization.percentage)}`}>
              {utilization.percentage}%
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {utilization.daysAssigned}/{utilization.totalDays} Tage
            </div>
            {/* Mini Progress Bar */}
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${getUtilizationBg(utilization.percentage)} transition-all`}
                style={{ width: `${Math.min(utilization.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default TeamMemberCard;
