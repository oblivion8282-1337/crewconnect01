/**
 * Team-Management Konstanten
 */

export const EMPLOYMENT_TYPES = [
  { value: 'fulltime', label: 'Festangestellt (Vollzeit)' },
  { value: 'parttime', label: 'Festangestellt (Teilzeit)' },
  { value: 'werkstudent', label: 'Werkstudent' },
  { value: 'management', label: 'Geschäftsführung' },
  { value: 'freelance_internal', label: 'Fester Freier' }
];

export const WEEKDAYS = [
  { value: 'monday', label: 'Montag', short: 'Mo' },
  { value: 'tuesday', label: 'Dienstag', short: 'Di' },
  { value: 'wednesday', label: 'Mittwoch', short: 'Mi' },
  { value: 'thursday', label: 'Donnerstag', short: 'Do' },
  { value: 'friday', label: 'Freitag', short: 'Fr' },
  { value: 'saturday', label: 'Samstag', short: 'Sa' },
  { value: 'sunday', label: 'Sonntag', short: 'So' }
];

export const ABSENCE_TYPES = [
  { value: 'vacation', label: 'Urlaub', color: 'blue', icon: 'Palmtree' },
  { value: 'sick', label: 'Krank', color: 'red', icon: 'Thermometer' },
  { value: 'other_project', label: 'Anderes Projekt', color: 'purple', icon: 'Briefcase' },
  { value: 'training', label: 'Weiterbildung', color: 'green', icon: 'GraduationCap' },
  { value: 'other', label: 'Sonstiges', color: 'gray', icon: 'Calendar' }
];

export const TEAM_ROLES = [
  {
    value: 'projectlead',
    label: 'Projektleitung',
    description: 'Voller Zugriff: Projekte, Team, Kunden, Buchungen, Einstellungen'
  },
  {
    value: 'member',
    label: 'Mitarbeiter',
    description: 'Sieht eigene Einplanungen und Projekte, kann Urlaub beantragen'
  }
];

export const ABSENCE_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const MEMBER_PERMISSIONS = [
  {
    key: 'canSeeBudget',
    label: 'Budget & Kosten sehen',
    description: 'Kann Projektbudget, Tagessätze und Gesamtkosten einsehen',
    default: false,
    category: 'projects'
  },
  {
    key: 'canSeeFreelancerRates',
    label: 'Freelancer-Tagessätze sehen',
    description: 'Kann Tagessätze der gebuchten Freelancer sehen',
    default: false,
    category: 'projects'
  },
  {
    key: 'canEditOwnTimes',
    label: 'Eigene Zeiten anpassen',
    description: 'Kann eigene Start-/Endzeiten bei Einplanungen ändern',
    default: false,
    category: 'projects'
  },
  {
    key: 'canAddNotes',
    label: 'Notizen hinzufügen',
    description: 'Kann Notizen und Kommentare zu Projekten hinterlassen',
    default: true,
    category: 'projects'
  },
  {
    key: 'canUploadFiles',
    label: 'Dateien hochladen',
    description: 'Kann Dateien zu Projekten hochladen',
    default: false,
    category: 'projects'
  },
  {
    key: 'canViewFiles',
    label: 'Dateien ansehen',
    description: 'Kann hochgeladene Projekt-Dateien ansehen und herunterladen',
    default: true,
    category: 'projects'
  },
  {
    key: 'canUseProjectChat',
    label: 'Projekt-Chat nutzen',
    description: 'Kann im Projekt-Chat mit Team kommunizieren',
    default: true,
    category: 'communication'
  },
  {
    key: 'canContactFreelancers',
    label: 'Freelancer kontaktieren',
    description: 'Kann gebuchte Freelancer direkt anschreiben',
    default: false,
    category: 'communication'
  },
  {
    key: 'canSeeAllProjects',
    label: 'Alle Projekte sehen',
    description: 'Kann alle Projekte sehen, nicht nur zugewiesene',
    default: false,
    category: 'visibility'
  },
  {
    key: 'canSeeTeamCalendar',
    label: 'Team-Kalender sehen',
    description: 'Kann Kalender aller Team-Mitglieder einsehen',
    default: false,
    category: 'visibility'
  }
];

export const PERMISSION_CATEGORIES = [
  { key: 'projects', label: 'Projekte' },
  { key: 'communication', label: 'Kommunikation' },
  { key: 'visibility', label: 'Sichtbarkeit' }
];

export const DEFAULT_WORKING_HOURS = { start: '09:00', end: '18:00' };
export const DEFAULT_WORKING_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

// Helper-Funktionen
export const getEmploymentTypeLabel = (value) => {
  return EMPLOYMENT_TYPES.find(t => t.value === value)?.label || value;
};

export const getAbsenceTypeLabel = (value) => {
  return ABSENCE_TYPES.find(t => t.value === value)?.label || value;
};

export const getAbsenceTypeColor = (value) => {
  return ABSENCE_TYPES.find(t => t.value === value)?.color || 'gray';
};

export const getTeamRoleLabel = (value) => {
  return TEAM_ROLES.find(r => r.value === value)?.label || value;
};

export const getWeekdayLabel = (value) => {
  return WEEKDAYS.find(d => d.value === value)?.label || value;
};

export const getWeekdayShort = (value) => {
  return WEEKDAYS.find(d => d.value === value)?.short || value;
};

// Konvertiere JS Date zu Weekday-Value
export const dateToWeekday = (date) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date(date).getDay()];
};
