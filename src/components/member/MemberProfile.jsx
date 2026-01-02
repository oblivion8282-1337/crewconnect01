import React from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Clock,
  Calendar,
  MapPin,
  Award,
  Lock
} from 'lucide-react';
import { getEmploymentTypeLabel, getWeekdayShort, WEEKDAYS } from '../../constants/team';
import { PROFESSIONS } from '../../constants/profileOptions';

/**
 * MemberProfile - Profilansicht für Mitarbeiter (nur lesen)
 */
const MemberProfile = ({ member }) => {
  if (!member) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500">Profil nicht gefunden</p>
        </div>
      </div>
    );
  }

  const getProfessionLabel = (value) => {
    return PROFESSIONS.find(p => p.value === value)?.label || value;
  };

  const formatWorkingHours = (hours) => {
    if (!hours) return '-';
    return `${hours.start} - ${hours.end} Uhr`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mein Profil</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Deine Profildaten werden von der Projektleitung verwaltet
        </p>
      </div>

      {/* Profil-Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
            {member.avatar || `${member.firstName?.charAt(0)}${member.lastName?.charAt(0)}`}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {member.firstName} {member.lastName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {member.position}
            </p>
            <div className="mt-2">
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${member.role === 'projectlead'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
              `}>
                {member.role === 'projectlead' ? 'Projektleitung' : 'Mitarbeiter'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kontakt */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Kontakt
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">E-Mail</p>
              <p className="text-gray-900 dark:text-white">{member.email || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Telefon</p>
              <p className="text-gray-900 dark:text-white">{member.phone || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Anstellung */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Anstellung
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Anstellungsart</p>
            <p className="text-gray-900 dark:text-white">
              {getEmploymentTypeLabel(member.employmentType)}
            </p>
          </div>
        </div>
      </div>

      {/* Arbeitszeiten */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Arbeitszeiten
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Arbeitstage</p>
            <div className="flex gap-1">
              {WEEKDAYS.map(day => {
                const isWorkingDay = member.workingDays?.includes(day.value);
                return (
                  <span
                    key={day.value}
                    className={`
                      w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium
                      ${isWorkingDay
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}
                    `}
                  >
                    {day.short}
                  </span>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Arbeitszeit</p>
            <p className="text-gray-900 dark:text-white">
              {formatWorkingHours(member.workingHours)}
            </p>
          </div>
        </div>
      </div>

      {/* Berufe & Skills */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Berufe & Skills
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {member.professions && member.professions.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Berufe</p>
              <div className="flex flex-wrap gap-2">
                {member.professions.map(profession => (
                  <span
                    key={profession}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {getProfessionLabel(profession)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {member.skills && member.skills.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {member.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(!member.professions || member.professions.length === 0) && (!member.skills || member.skills.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400">Keine Berufe oder Skills hinterlegt</p>
          )}
        </div>
      </div>

      {/* Notizen */}
      {member.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notizen</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {member.notes}
            </p>
          </div>
        </div>
      )}

      {/* Hinweis */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Änderungen an deinem Profil können nur von der Projektleitung vorgenommen werden.
          Wende dich bei Fragen an deine Ansprechperson.
        </p>
      </div>
    </div>
  );
};

export default MemberProfile;
