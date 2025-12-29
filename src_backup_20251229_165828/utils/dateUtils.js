/**
 * Datums-Hilfsfunktionen für die CrewConnect App
 */

/**
 * Formatiert ein Datum im deutschen Format (z.B. "12. Jan")
 * @param {string|Date} date - Das zu formatierende Datum
 * @returns {string} Formatiertes Datum
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short'
  });
};

/**
 * Formatiert ein Datum kurz (z.B. "12.1")
 * @param {string|Date} date - Das zu formatierende Datum
 * @returns {string} Kurz formatiertes Datum
 */
export const formatDateShort = (date) => {
  const d = new Date(date);
  return `${d.getDate()}.${d.getMonth() + 1}`;
};

/**
 * Formatiert ein Datum mit Uhrzeit (z.B. "12. Jan, 14:30")
 * @param {string|Date} date - Das zu formatierende Datum
 * @returns {string} Formatiertes Datum mit Uhrzeit
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatiert die vergangene Zeit relativ (z.B. "5m", "2h", "3d")
 * @param {string|Date} date - Das Referenzdatum
 * @returns {string} Relative Zeitangabe
 */
export const formatTimeAgo = (date) => {
  const diffInMinutes = Math.floor((new Date() - new Date(date)) / 60000);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }
  if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h`;
  }
  return `${Math.floor(diffInMinutes / 1440)}d`;
};

/**
 * Erstellt einen ISO-Datums-String für einen bestimmten Tag (YYYY-MM-DD)
 * @param {number} year - Jahr
 * @param {number} month - Monat (0-basiert)
 * @param {number} day - Tag
 * @returns {string} ISO-Datums-String
 */
export const createDateKey = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * Parst einen Datums-String im YYYY-MM-DD Format als lokales Datum
 * (verhindert UTC-Parsing-Probleme bei verschiedenen Browsern)
 * @param {string} dateStr - Datums-String im YYYY-MM-DD Format
 * @returns {Date} Lokales Datum
 */
export const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Erstellt ein Array von Datums-Strings für einen Zeitraum
 * @param {string} startDate - Startdatum (YYYY-MM-DD)
 * @param {string} endDate - Enddatum (YYYY-MM-DD)
 * @returns {string[]} Array von Datums-Strings
 */
export const getDateRange = (startDate, endDate) => {
  // Parse dates as local time to avoid timezone issues
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const dates = [];

  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    // Use local date to match createDateKey format (YYYY-MM-DD in local time)
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
};

/**
 * Berechnet die Anzahl der Tage im Monat
 * @param {number} year - Jahr
 * @param {number} month - Monat (0-basiert)
 * @returns {number} Anzahl der Tage
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Berechnet den Wochentag des ersten Tages im Monat (Mo=0, So=6)
 * @param {number} year - Jahr
 * @param {number} month - Monat (0-basiert)
 * @returns {number} Wochentag (0-6)
 */
export const getFirstDayOfMonth = (year, month) => {
  return (new Date(year, month, 1).getDay() + 6) % 7;
};
