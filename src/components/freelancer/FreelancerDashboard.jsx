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

  // Filtere Buchungen nach Kategorie
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

  const conflictCount = pendingBookings.filter(b => findConflicts(b).hasConflict).length;

  const activeBookings = activeTab === 'pending'
    ? pendingBookings
    : activeTab === 'reschedule'
      ? rescheduleBookings
      : confirmedBookings;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Buchungsanfragen</h1>

      {/* Konflikt-Warnung */}
      {conflictCount > 0 && (
        <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-card flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-orange-800 dark:text-orange-300">
              Terminkonflikt erkannt!
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              {conflictCount} Anfrage{conflictCount > 1 ? 'n haben' : ' hat'} überlappende Termine.
              Du kannst mehrere bestätigen, aber nur EINE kann später zur Fixbuchung werden.
            </p>
          </div>
        </div>
      )}

      {/* Tab-Navigation */}
      <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-card shadow-sm border border-gray-200 dark:border-gray-700">
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
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
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
    green: 'bg-emerald-600 text-white'
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl font-medium text-sm relative transition-colors ${
        active ? activeColors[color] : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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

  const getBorderColor = () => {
    if (hasConflict) return 'border-l-orange-500';
    if (hasReschedule) return 'border-l-blue-500';

    switch (booking.status) {
      case BOOKING_STATUS.FIX_PENDING:
      case BOOKING_STATUS.FIX_CONFIRMED:
        return 'border-l-emerald-500';
      case BOOKING_STATUS.OPTION_PENDING:
        return 'border-l-purple-500';
      case BOOKING_STATUS.OPTION_CONFIRMED:
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-300 dark:border-l-gray-600';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-card shadow-sm p-4 mb-3 border border-gray-200 dark:border-gray-700 border-l-4 ${getBorderColor()}`}>
      {/* Konflikt-Banner */}
      {hasConflict && (
        <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-sm">
          <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 font-medium mb-1">
            <span>⚠️</span>
            Terminkonflikt mit {conflict.conflictingBookings.length} andere{conflict.conflictingBookings.length > 1 ? 'n' : 'r'} Anfrage{conflict.conflictingBookings.length > 1 ? 'n' : ''}
          </div>
          <div className="text-orange-700 dark:text-orange-400">
            Überlappende Tage: {conflict.conflictingDates.map(d => formatDate(d)).join(', ')}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-500 mt-1">
            Kollidiert mit: {conflict.conflictingBookings.map(b => b.agencyName).join(', ')}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <span>{booking.agencyAvatar}</span>
            {booking.projectName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {booking.agencyName} • {booking.phaseName}
          </p>
        </div>
        <StatusBadge
          status={booking.status}
          hasReschedule={hasReschedule}
        />
      </div>

      {/* Content */}
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
    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktuelle Termine:</span>
        <div className="flex flex-wrap gap-1">
          {booking.reschedule.originalDates.map(date => (
            <span
              key={date}
              className="px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700 line-through text-gray-600 dark:text-gray-400"
            >
              {formatDate(date)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Neue Termine:</span>
        <div className="flex flex-wrap gap-1">
          {booking.reschedule.newDates.map(date => (
            <span
              key={date}
              className="px-2 py-0.5 text-xs rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
            >
              {formatDate(date)}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
      <div>
        <span className="text-gray-500 dark:text-gray-500 line-through mr-2">{booking.totalCost}€</span>
        <span className="font-bold text-purple-700 dark:text-purple-400">{booking.reschedule.newTotalCost}€</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onDecline(booking)}
          className="px-3 py-1.5 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Ablehnen
        </button>
        <button
          onClick={() => onAccept(booking)}
          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
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
              className={`px-2 py-1 text-xs rounded-lg ${
                isConflict
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 ring-1 ring-orange-300 dark:ring-orange-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title={isConflict ? 'Konflikt mit anderer Anfrage' : ''}
            >
              {formatDate(date)}
              {isConflict && ' ⚠️'}
            </span>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <span className="font-bold text-gray-900 dark:text-white">{booking.totalCost}€</span>

        {isPending && (
          <div className="flex gap-2">
            <button
              onClick={() => onDecline(booking)}
              className="px-3 py-1.5 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Ablehnen
            </button>
            <button
              onClick={() => onAccept(booking)}
              className={`px-3 py-1.5 text-white rounded-lg text-sm transition-colors ${
                isFix ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isFix ? 'Fix bestätigen' : 'Option bestätigen'}
            </button>
          </div>
        )}

        {isConfirmed && (
          <button
            onClick={() => onCancel(booking)}
            className="px-3 py-1.5 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Stornieren
          </button>
        )}
      </div>
    </>
  );
};

export default FreelancerDashboard;
