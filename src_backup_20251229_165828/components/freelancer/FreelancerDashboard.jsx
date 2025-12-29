import React, { useState } from 'react';
import StatusBadge from '../shared/StatusBadge';
import { formatDate } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isFixStatus
} from '../../constants/calendar';

/**
 * FreelancerDashboard - Hauptansicht für Freelancer mit Buchungsanfragen
 *
 * NEUE STATUS-LOGIK:
 * - option_pending / fix_pending: Lila (wartet auf Antwort)
 * - option_confirmed: Gelb
 * - fix_confirmed: Grün/Rot
 */
const FreelancerDashboard = ({
  bookings,
  freelancerId,
  onAccept,
  onDecline,
  onCancel,
  onAcceptReschedule,
  onDeclineReschedule
}) => {
  const [activeTab, setActiveTab] = useState('pending');

  // Filtere Buchungen nach Kategorie (mit neuen Status-Werten)
  const pendingBookings = bookings.filter(b =>
    b.freelancerId === freelancerId &&
    isPendingStatus(b.status) &&
    !b.reschedule
  );

  const rescheduleBookings = bookings.filter(b =>
    b.freelancerId === freelancerId && b.reschedule
  );

  const confirmedBookings = bookings.filter(b =>
    b.freelancerId === freelancerId &&
    isConfirmedStatus(b.status) &&
    !b.reschedule
  );

  // Konflikte zwischen ausstehenden Anfragen erkennen
  const findConflicts = (booking) => {
    const otherPending = pendingBookings.filter(b => b.id !== booking.id);
    const conflictingDates = [];
    const conflictingBookings = [];

    for (const other of otherPending) {
      const overlap = booking.dates.filter(d => other.dates.includes(d));
      if (overlap.length > 0) {
        conflictingDates.push(...overlap);
        conflictingBookings.push({
          id: other.id,
          agencyName: other.agencyName,
          projectName: other.projectName,
          dates: overlap
        });
      }
    }

    return {
      hasConflict: conflictingDates.length > 0,
      conflictingDates: [...new Set(conflictingDates)],
      conflictingBookings
    };
  };

  // Anzahl der Konflikte für Tab-Badge
  const conflictCount = pendingBookings.filter(b => findConflicts(b).hasConflict).length;

  // Aktive Liste basierend auf Tab
  const activeBookings = activeTab === 'pending'
    ? pendingBookings
    : activeTab === 'reschedule'
      ? rescheduleBookings
      : confirmedBookings;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buchungsanfragen</h1>

      {/* Konflikt-Warnung */}
      {conflictCount > 0 && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-orange-800">
              Terminkonflikt erkannt!
            </p>
            <p className="text-sm text-orange-700">
              {conflictCount} Anfrage{conflictCount > 1 ? 'n haben' : ' hat'} überlappende Termine.
              Du kannst mehrere bestätigen, aber nur EINE kann später zur Fixbuchung werden.
            </p>
          </div>
        </div>
      )}

      {/* Tab-Navigation */}
      <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
        <TabButton
          active={activeTab === 'pending'}
          onClick={() => setActiveTab('pending')}
          color="purple"
          badge={conflictCount > 0 ? conflictCount : null}
        >
          Ausstehend ({pendingBookings.length})
        </TabButton>
        <TabButton
          active={activeTab === 'reschedule'}
          onClick={() => setActiveTab('reschedule')}
          color="blue"
        >
          Verschiebungen ({rescheduleBookings.length})
        </TabButton>
        <TabButton
          active={activeTab === 'confirmed'}
          onClick={() => setActiveTab('confirmed')}
          color="green"
        >
          Bestätigt ({confirmedBookings.length})
        </TabButton>
      </div>

      {/* Buchungsliste */}
      {activeBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg text-gray-500">
          Keine Anfragen
        </div>
      ) : (
        activeBookings.map(booking => (
          <BookingCard
            key={booking.id}
            booking={booking}
            conflict={activeTab === 'pending' ? findConflicts(booking) : null}
            onAccept={onAccept}
            onDecline={onDecline}
            onCancel={onCancel}
            onAcceptReschedule={onAcceptReschedule}
            onDeclineReschedule={onDeclineReschedule}
          />
        ))
      )}
    </div>
  );
};

/**
 * Tab-Button Komponente
 */
const TabButton = ({ active, onClick, color, badge, children }) => {
  const activeColors = {
    purple: 'bg-purple-600 text-white',
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white'
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg font-medium text-sm relative ${
        active ? activeColors[color] : 'text-gray-600'
      }`}
    >
      {children}
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
};

/**
 * Einzelne Buchungskarte
 */
const BookingCard = ({
  booking,
  conflict,
  onAccept,
  onDecline,
  onCancel,
  onAcceptReschedule,
  onDeclineReschedule
}) => {
  const hasReschedule = !!booking.reschedule;
  const hasConflict = conflict?.hasConflict;

  // Border-Farbe basierend auf Status
  const getBorderColor = () => {
    if (hasConflict) return 'border-orange-500';
    if (hasReschedule) return 'border-blue-500';

    switch (booking.status) {
      case BOOKING_STATUS.FIX_PENDING:
      case BOOKING_STATUS.FIX_CONFIRMED:
        return 'border-green-500';
      case BOOKING_STATUS.OPTION_PENDING:
        return 'border-purple-500';
      case BOOKING_STATUS.OPTION_CONFIRMED:
        return 'border-yellow-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-3 border-l-4 ${getBorderColor()}`}>
      {/* Konflikt-Banner */}
      {hasConflict && (
        <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
          <div className="flex items-center gap-2 text-orange-800 font-medium mb-1">
            <span>⚠️</span>
            Terminkonflikt mit {conflict.conflictingBookings.length} andere{conflict.conflictingBookings.length > 1 ? 'n' : 'r'} Anfrage{conflict.conflictingBookings.length > 1 ? 'n' : ''}
          </div>
          <div className="text-orange-700">
            Überlappende Tage: {conflict.conflictingDates.map(d => formatDate(d)).join(', ')}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            Kollidiert mit: {conflict.conflictingBookings.map(b => b.agencyName).join(', ')}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="font-bold flex items-center gap-2">
            <span>{booking.agencyAvatar}</span>
            {booking.projectName}
          </h3>
          <p className="text-sm text-gray-600">
            {booking.agencyName} • {booking.phaseName}
          </p>
        </div>
        <StatusBadge
          status={booking.status}
          hasReschedule={hasReschedule}
        />
      </div>

      {/* Content basierend auf Typ */}
      {hasReschedule ? (
        <RescheduleContent
          booking={booking}
          onAccept={onAcceptReschedule}
          onDecline={onDeclineReschedule}
        />
      ) : (
        <StandardContent
          booking={booking}
          conflict={conflict}
          onAccept={onAccept}
          onDecline={onDecline}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

/**
 * Content für Verschiebungsanfragen
 */
const RescheduleContent = ({ booking, onAccept, onDecline }) => (
  <>
    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-600">Aktuelle Termine:</span>
        <div className="flex flex-wrap gap-1">
          {booking.reschedule.originalDates.map(date => (
            <span
              key={date}
              className="px-2 py-0.5 text-xs rounded bg-gray-200 line-through"
            >
              {formatDate(date)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-purple-600">Neue Termine:</span>
        <div className="flex flex-wrap gap-1">
          {booking.reschedule.newDates.map(date => (
            <span
              key={date}
              className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700"
            >
              {formatDate(date)}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="flex justify-between items-center pt-3 border-t">
      <div>
        <span className="text-gray-500 line-through mr-2">{booking.totalCost}€</span>
        <span className="font-bold text-purple-700">{booking.reschedule.newTotalCost}€</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onDecline(booking)}
          className="px-3 py-1.5 border border-red-300 text-red-700 rounded text-sm"
        >
          Ablehnen
        </button>
        <button
          onClick={() => onAccept(booking)}
          className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm"
        >
          Verschiebung bestätigen
        </button>
      </div>
    </div>
  </>
);

/**
 * Standard-Content für normale Buchungen
 */
const StandardContent = ({ booking, conflict, onAccept, onDecline, onCancel }) => {
  const isPending = isPendingStatus(booking.status);
  const isConfirmed = isConfirmedStatus(booking.status);
  const isFix = isFixStatus(booking.status);

  return (
    <>
      <div className="flex flex-wrap gap-1 mb-3">
        {booking.dates.map(date => {
          const isConflict = conflict?.conflictingDates?.includes(date);
          return (
            <span
              key={date}
              className={`px-2 py-1 text-xs rounded ${
                isConflict
                  ? 'bg-orange-100 text-orange-800 ring-1 ring-orange-300'
                  : 'bg-gray-100'
              }`}
              title={isConflict ? 'Konflikt mit anderer Anfrage' : ''}
            >
              {formatDate(date)}
              {isConflict && ' ⚠️'}
            </span>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-3 border-t">
        <span className="font-bold">{booking.totalCost}€</span>

        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => onDecline(booking)}
              className="px-3 py-1.5 border border-red-300 text-red-700 rounded text-sm"
            >
              Ablehnen
            </button>
            <button
              onClick={() => onAccept(booking)}
              className={`px-3 py-1.5 text-white rounded text-sm ${
                isFix ? 'bg-green-600' : 'bg-purple-600'
              }`}
            >
              {isFix ? 'Fix bestätigen' : 'Option bestätigen'}
            </button>
          </div>
        )}

        {isConfirmed && (
          <button
            onClick={() => onCancel(booking)}
            className="px-3 py-1.5 border border-red-300 text-red-700 rounded text-sm"
          >
            Stornieren
          </button>
        )}
      </div>
    </>
  );
};

export default FreelancerDashboard;
