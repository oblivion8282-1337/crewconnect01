import React from 'react';
import StatusBadge from './StatusBadge';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { BOOKING_STATUS, USER_ROLES } from '../../constants/calendar';

/**
 * BookingHistory - Zeigt abgelehnte, zurückgezogene und stornierte Buchungen
 */
const BookingHistory = ({ bookings, userRole, userId }) => {
  // Filtere relevante Buchungen
  const historyBookings = bookings.filter(booking => {
    const isRelevant = userRole === USER_ROLES.FREELANCER
      ? booking.freelancerId === userId
      : booking.agencyId === userId;

    const isHistoryStatus = [
      BOOKING_STATUS.DECLINED,
      BOOKING_STATUS.WITHDRAWN,
      BOOKING_STATUS.CANCELLED
    ].includes(booking.status);

    return isRelevant && isHistoryStatus;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Historie</h1>

      {historyBookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          Keine Einträge
        </div>
      ) : (
        historyBookings.map(booking => (
          <HistoryCard
            key={booking.id}
            booking={booking}
            userRole={userRole}
          />
        ))
      )}
    </div>
  );
};

/**
 * Einzelne Karte in der Historie
 */
const HistoryCard = ({ booking, userRole }) => {
  const isFreelancer = userRole === USER_ROLES.FREELANCER;

  // Titel und Untertitel basierend auf Rolle
  const title = isFreelancer ? booking.projectName : booking.freelancerName;
  const subtitle = isFreelancer ? booking.agencyName : booking.projectName;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-4 mb-3 border border-gray-200 dark:border-gray-700 border-l-4 border-l-gray-300 dark:border-l-gray-600">
      {/* Header */}
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <StatusBadge status={booking.status} type={booking.type} />
      </div>

      {/* Termine */}
      <div className="flex flex-wrap gap-1 mb-3">
        {booking.dates.map(date => (
          <span key={date} className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {formatDate(date)}
          </span>
        ))}
      </div>

      {/* Stornierungsgrund (falls vorhanden) */}
      {booking.status === BOOKING_STATUS.CANCELLED && (
        <CancellationInfo booking={booking} userRole={userRole} />
      )}

      {/* Footer */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {booking.totalCost}€ • {formatDateTime(booking.requestedAt)}
      </div>
    </div>
  );
};

/**
 * Stornierungsinformationen
 */
const CancellationInfo = ({ booking, userRole }) => {
  const cancelledBySelf = booking.cancelledBy === userRole;
  const cancellerLabel = cancelledBySelf
    ? 'dir'
    : userRole === USER_ROLES.FREELANCER
      ? 'Agentur'
      : 'Freelancer';

  return (
    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm mb-3 border border-red-200 dark:border-red-800">
      <p className="font-medium text-red-800 dark:text-red-300">
        Storniert von {cancellerLabel}
      </p>
      <p className="text-red-700 dark:text-red-400">
        Grund: {booking.cancelReason}
      </p>
    </div>
  );
};

export default BookingHistory;
