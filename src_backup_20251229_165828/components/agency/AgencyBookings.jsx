import React from 'react';
import { CalendarRange } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { formatDateShort } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus
} from '../../constants/calendar';

/**
 * AgencyBookings - Buchungsübersicht für Agenturen
 *
 * @param {Object} props
 * @param {Array} props.bookings - Alle Buchungen
 * @param {number} props.agencyId - ID der aktuellen Agentur
 * @param {Function} props.onWithdraw - Callback zum Zurückziehen einer Anfrage
 * @param {Function} props.onConvertToFix - Callback zum Umwandeln in Fix
 * @param {Function} props.onReschedule - Callback zum Öffnen des Verschiebungs-Modals
 * @param {Function} props.onCancel - Callback zum Öffnen des Stornieren-Modals
 * @param {Function} props.onWithdrawReschedule - Callback zum Zurückziehen einer Verschiebung
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buchungen</h1>

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
    </div>
  );
};

/**
 * Sektion für Verschiebungsanfragen
 */
const RescheduleSection = ({ bookings, onWithdraw }) => (
  <div className="mb-8">
    <h2 className="font-semibold mb-3 flex items-center gap-2">
      📅 Verschiebungsanfragen ({bookings.length})
    </h2>
    {bookings.map(booking => (
      <div
        key={booking.id}
        className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-2"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium">{booking.freelancerName}</p>
            <p className="text-sm text-gray-600">{booking.projectName}</p>
          </div>
          <StatusBadge
            status={booking.status}
            type={booking.type}
            hasReschedule={true}
          />
        </div>
        <div className="text-sm mb-2">
          <span className="text-gray-500">Aktuell: </span>
          <span className="line-through">
            {booking.reschedule.originalDates.map(formatDateShort).join(', ')}
          </span>
          <span className="text-purple-600 ml-2">
            → {booking.reschedule.newDates.map(formatDateShort).join(', ')}
          </span>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => onWithdraw(booking)}
            className="px-3 py-1.5 border text-gray-600 rounded text-sm hover:bg-gray-50"
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
    <h2 className="font-semibold mb-3">⏳ Warten ({bookings.length})</h2>
    {bookings.map(booking => (
      <div
        key={booking.id}
        className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-2 flex justify-between items-center"
      >
        <div>
          <p className="font-medium">{booking.freelancerName}</p>
          <p className="text-sm text-gray-600">
            {booking.projectName} • {booking.dates.map(formatDateShort).join(', ')}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={booking.status} type={booking.type} />
          <button
            onClick={() => onReschedule(booking)}
            className="px-3 py-1.5 border border-purple-300 text-purple-700 rounded text-sm flex items-center gap-1 hover:bg-purple-50"
          >
            <CalendarRange className="w-3 h-3" />
            Verschieben
          </button>
          <button
            onClick={() => onWithdraw(booking)}
            className="px-3 py-1.5 border text-gray-600 rounded text-sm hover:bg-gray-50"
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
    <h2 className="font-semibold mb-3">✅ Bestätigt ({bookings.length})</h2>
    {bookings.length === 0 ? (
      <div className="text-center py-8 bg-white rounded-lg text-gray-500">
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
    ? 'bg-green-50 border border-green-200'
    : 'bg-yellow-50 border border-yellow-200';

  return (
    <div className={`p-4 rounded-lg mb-2 flex justify-between items-center ${cardStyle}`}>
      <div>
        <p className="font-medium">{booking.freelancerName}</p>
        <p className="text-sm text-gray-600">
          {booking.projectName} • {booking.dates.map(formatDateShort).join(', ')} • {booking.totalCost}€
        </p>
      </div>
      <div className="flex gap-2">
        {!isFixBooking && (
          <button
            onClick={() => onConvertToFix(booking)}
            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Fix
          </button>
        )}
        <button
          onClick={() => onReschedule(booking)}
          className="px-3 py-1.5 border border-purple-300 text-purple-700 rounded text-sm flex items-center gap-1 hover:bg-purple-50"
        >
          <CalendarRange className="w-3 h-3" />
          Verschieben
        </button>
        <button
          onClick={() => onCancel(booking)}
          className="px-3 py-1.5 border border-red-300 text-red-700 rounded text-sm hover:bg-red-50"
        >
          Stornieren
        </button>
      </div>
    </div>
  );
};

export default AgencyBookings;
