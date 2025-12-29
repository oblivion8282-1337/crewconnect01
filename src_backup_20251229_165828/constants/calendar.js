/**
 * Kalender-Konstanten für die CrewConnect App
 *
 * NEUE BUCHUNGSLOGIK (Stand: Dezember 2024)
 * - Status ist EIN Feld (kein separates type-Feld mehr)
 * - Neue Farbe: Lila für pending Anfragen
 * - openForMore ist Flag am Tag, nicht an Buchung
 */

/** Deutsche Monatsnamen */
export const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember'
];

/** Deutsche Wochentags-Abkürzungen (Woche beginnt mit Montag) */
export const WEEKDAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

/**
 * Status-Typen für Buchungen
 *
 * | Status | Bedeutung | Farbe |
 * |--------|-----------|-------|
 * | option_pending | Option angefragt, wartet auf Antwort | 🟣 Lila |
 * | option_confirmed | Option bestätigt | 🟡 Gelb |
 * | fix_pending | Fixbuchung angefragt, wartet auf Antwort | 🟣 Lila |
 * | fix_confirmed | Fixbuchung bestätigt | 🔴 Rot |
 * | declined | Abgelehnt (wurde nie angenommen) | – |
 * | withdrawn | Zurückgezogen vor Antwort (von Agentur) | – |
 * | cancelled | Nachträglich storniert (war mal bestätigt) | – |
 */
export const BOOKING_STATUS = {
  // Aktive Status
  OPTION_PENDING: 'option_pending',
  OPTION_CONFIRMED: 'option_confirmed',
  FIX_PENDING: 'fix_pending',
  FIX_CONFIRMED: 'fix_confirmed',
  // Terminal Status
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn',
  CANCELLED: 'cancelled'
};

/**
 * Farb-Mapping für Kalendertage
 *
 * | Farbe | Bedeutung |
 * |-------|-----------|
 * | 🟢 Grün | Verfügbar / Buchbar |
 * | 🟣 Lila | Anfrage pending (wartet auf Antwort) |
 * | 🟡 Gelb | Option bestätigt |
 * | 🔴 Rot | Fix bestätigt / blockiert |
 * | 🔴🟢 Gestreift | Fix bestätigt + offen für mehr |
 */
export const DAY_STATUS_COLORS = {
  green: 'bg-green-500 text-white',
  purple: 'bg-purple-500 text-white',
  yellow: 'bg-yellow-400 text-gray-800',
  red: 'bg-red-500 text-white',
  striped: 'bg-gradient-to-br from-red-500 to-green-500 text-white'
};

/** Benutzerrollen */
export const USER_ROLES = {
  FREELANCER: 'freelancer',
  AGENCY: 'agency'
};

/**
 * Helper: Prüft ob Status "pending" ist
 */
export const isPendingStatus = (status) =>
  status === BOOKING_STATUS.OPTION_PENDING ||
  status === BOOKING_STATUS.FIX_PENDING;

/**
 * Helper: Prüft ob Status "confirmed" ist
 */
export const isConfirmedStatus = (status) =>
  status === BOOKING_STATUS.OPTION_CONFIRMED ||
  status === BOOKING_STATUS.FIX_CONFIRMED;

/**
 * Helper: Prüft ob Status eine Option ist
 */
export const isOptionStatus = (status) =>
  status === BOOKING_STATUS.OPTION_PENDING ||
  status === BOOKING_STATUS.OPTION_CONFIRMED;

/**
 * Helper: Prüft ob Status eine Fixbuchung ist
 */
export const isFixStatus = (status) =>
  status === BOOKING_STATUS.FIX_PENDING ||
  status === BOOKING_STATUS.FIX_CONFIRMED;

/**
 * Helper: Prüft ob Status terminal ist (Buchung abgeschlossen)
 */
export const isTerminalStatus = (status) =>
  status === BOOKING_STATUS.DECLINED ||
  status === BOOKING_STATUS.WITHDRAWN ||
  status === BOOKING_STATUS.CANCELLED;
