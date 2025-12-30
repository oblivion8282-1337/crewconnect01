import React from 'react';
import { CalendarRange, Inbox } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { formatDateShort } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus
} from '../../constants/calendar';

/**
 * AgencyBookings - Buchungsübersicht für Agenturen
 */
const AgencyBookings = ({
  bookings,
  agencyId,
  onWithdraw,
  onConvertToFix,
  onReschedule,
  onCancel,
  onWithdrawReschedule
}) => {
  // Filtere relevante Buchungen
  const activeBookings = bookings.filter(b =>
    b.agencyId === agencyId &&
    ![BOOKING_STATUS.DECLINED, BOOKING_STATUS.WITHDRAWN, BOOKING_STATUS.CANCELLED].includes(b.status)
  );

  const pendingBookings = activeBookings.filter(b =>
    isPendingStatus(b.status) && !b.reschedule
  );

  const rescheduleBookings = activeBookings.filter(b => b.reschedule);

  const confirmedBookings = activeBookings.filter(b =>
    isConfirmedStatus(b.status) && !b.reschedule
  );

  // Global empty state wenn keine Buchungen vorhanden
  const hasNoBookings = activeBookings.length === 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Buchungen</h1>

      {hasNoBookings ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700">
          <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Noch keine Buchungen
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Hier erscheinen deine Buchungsanfragen und bestätigten Buchungen.
            Starte über die Freelancer-Suche oder ein Projekt.
          </p>
        </div>
      ) : (
        <>
          {/* Verschiebungsanfragen */}
          {rescheduleBookings.length > 0 && (
            <RescheduleSection
              bookings={rescheduleBookings}
              onWithdraw={onWithdrawReschedule}
            />
          )}

          {/* Wartende Anfragen */}
          {pendingBookings.length > 0 && (
            <PendingSection
              bookings={pendingBookings}
              onWithdraw={onWithdraw}
              onReschedule={onReschedule}
            />
          )}

          {/* Bestätigte Buchungen */}
          <ConfirmedSection
            bookings={confirmedBookings}
            onConvertToFix={onConvertToFix}
            onReschedule={onReschedule}
            onCancel={onCancel}
          />
        </>
      )}
    </div>
  );
};

/**
 * Sektion für Verschiebungsanfragen
 */
const RescheduleSection = ({ bookings, onWithdraw }) => (
  <div className="mb-8">
    <h2 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
      📅 Verschiebungsanfragen ({bookings.length})
    </h2>
    {bookings.map(booking => (
      <div
        key={booking.id}
        className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-card mb-2"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{booking.freelancerName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.projectName}</p>
          </div>
          <StatusBadge
            status={booking.status}
            type={booking.type}
            hasReschedule={true}
          />
        </div>
        <div className="text-sm mb-2">
          <span className="text-gray-500 dark:text-gray-400">Aktuell: </span>
          <span className="line-through text-gray-500 dark:text-gray-500">
            {booking.reschedule.originalDates.map(formatDateShort).join(', ')}
          </span>
          <span className="text-purple-600 dark:text-purple-400 ml-2">
            → {booking.reschedule.newDates.map(formatDateShort).join(', ')}
          </span>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => onWithdraw(booking)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Zurückziehen
          </button>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Sektion für wartende Anfragen
 */
const PendingSection = ({ bookings, onWithdraw, onReschedule }) => (
  <div className="mb-8">
    <h2 className="font-semibold mb-3 text-gray-900 dark:text-white">⏳ Warten ({bookings.length})</h2>
    {bookings.map(booking => (
      <div
        key={booking.id}
        className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-card mb-2 flex justify-between items-center"
      >
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{booking.freelancerName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {booking.projectName} • {booking.dates.map(formatDateShort).join(', ')}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={booking.status} type={booking.type} />
          <button
            onClick={() => onReschedule(booking)}
            className="px-3 py-1.5 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 rounded-lg text-sm flex items-center gap-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <CalendarRange className="w-3 h-3" />
            Verschieben
          </button>
          <button
            onClick={() => onWithdraw(booking)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Zurückziehen
          </button>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Sektion für bestätigte Buchungen
 */
const ConfirmedSection = ({ bookings, onConvertToFix, onReschedule, onCancel }) => (
  <>
    <h2 className="font-semibold mb-3 text-gray-900 dark:text-white">✅ Bestätigt ({bookings.length})</h2>
    {bookings.length === 0 ? (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        Keine
      </div>
    ) : (
      bookings.map(booking => (
        <ConfirmedBookingCard
          key={booking.id}
          booking={booking}
          onConvertToFix={onConvertToFix}
          onReschedule={onReschedule}
          onCancel={onCancel}
        />
      ))
    )}
  </>
);

/**
 * Karte für eine bestätigte Buchung
 */
const ConfirmedBookingCard = ({ booking, onConvertToFix, onReschedule, onCancel }) => {
  const isFixBooking = booking.status === BOOKING_STATUS.FIX_CONFIRMED;
  const cardStyle = isFixBooking
    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';

  return (
    <div className={`p-4 rounded-card mb-2 flex justify-between items-center ${cardStyle}`}>
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{booking.freelancerName}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {booking.projectName} • {booking.dates.map(formatDateShort).join(', ')} • {booking.totalCost}€
        </p>
      </div>
      <div className="flex gap-2">
        {!isFixBooking && (
          <button
            onClick={() => onConvertToFix(booking)}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
          >
            Fix
          </button>
        )}
        <button
          onClick={() => onReschedule(booking)}
          className="px-3 py-1.5 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 rounded-lg text-sm flex items-center gap-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
        >
          <CalendarRange className="w-3 h-3" />
          Verschieben
        </button>
        <button
          onClick={() => onCancel(booking)}
          className="px-3 py-1.5 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Stornieren
        </button>
      </div>
    </div>
  );
};

export default AgencyBookings;
