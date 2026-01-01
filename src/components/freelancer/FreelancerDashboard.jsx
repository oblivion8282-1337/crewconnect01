import React, { useState, useMemo } from 'react';
import { Calendar, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { formatDate, parseLocalDate } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isFixStatus
} from '../../constants/calendar';

/**
 * FreelancerDashboard - Hauptansicht für Freelancer mit Buchungen
 */
const FreelancerDashboard = ({
  bookings,
  freelancerId,
  onAccept,
  onDecline,
  onCancel,
  onAcceptReschedule,
  onDeclineReschedule,
  onNavigateToProject
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

  // Optionierte Buchungen (bestätigte Optionen)
  const optionBookings = bookings.filter(b =>
    b.freelancerId === freelancerId &&
    b.status === BOOKING_STATUS.OPTION_CONFIRMED &&
    !b.reschedule
  );

  // Fix-bestätigte Buchungen
  const fixBookings = bookings.filter(b =>
    b.freelancerId === freelancerId &&
    b.status === BOOKING_STATUS.FIX_CONFIRMED &&
    !b.reschedule
  );

  // Stornierte Buchungen (letzte 30 Tage)
  const cancelledBookings = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return bookings.filter(b =>
      b.freelancerId === freelancerId &&
      b.status === BOOKING_STATUS.CANCELLED &&
      b.cancelledAt &&
      new Date(b.cancelledAt) >= thirtyDaysAgo
    ).sort((a, b) => new Date(b.cancelledAt) - new Date(a.cancelledAt));
  }, [bookings, freelancerId]);

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
      : activeTab === 'option'
        ? optionBookings
        : activeTab === 'confirmed'
          ? fixBookings
          : cancelledBookings;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Buchungen</h1>

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
      <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-card shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <TabButton
          active={activeTab === 'pending'}
          onClick={() => setActiveTab('pending')}
          color="purple"
          count={pendingBookings.length}
          badge={conflictCount > 0 ? conflictCount : null}
        >
          Ausstehend
        </TabButton>
        <TabButton
          active={activeTab === 'reschedule'}
          onClick={() => setActiveTab('reschedule')}
          color="blue"
          count={rescheduleBookings.length}
        >
          Verschiebungen
        </TabButton>
        <TabButton
          active={activeTab === 'option'}
          onClick={() => setActiveTab('option')}
          color="yellow"
          count={optionBookings.length}
        >
          Optioniert
        </TabButton>
        <TabButton
          active={activeTab === 'confirmed'}
          onClick={() => setActiveTab('confirmed')}
          color="green"
          count={fixBookings.length}
        >
          Bestätigt
        </TabButton>
        {cancelledBookings.length > 0 && (
          <TabButton
            active={activeTab === 'cancelled'}
            onClick={() => setActiveTab('cancelled')}
            color="red"
            count={cancelledBookings.length}
          >
            Storniert
          </TabButton>
        )}
      </div>

      {/* Buchungsliste */}
      {activeBookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          {activeTab === 'pending' && 'Keine ausstehenden Anfragen'}
          {activeTab === 'reschedule' && 'Keine Verschiebungsanfragen'}
          {activeTab === 'option' && 'Keine optionierten Buchungen'}
          {activeTab === 'confirmed' && 'Keine bestätigten Buchungen'}
          {activeTab === 'cancelled' && 'Keine stornierten Buchungen'}
        </div>
      ) : activeTab === 'cancelled' ? (
        activeBookings.map(booking => (
          <CancelledBookingCard
            key={booking.id}
            booking={booking}
          />
        ))
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
            onNavigateToProject={onNavigateToProject}
          />
        ))
      )}
    </div>
  );
};

/**
 * Tab-Button Komponente - Border-Highlight Design mit Farben
 */
const TabButton = ({ active, onClick, color, badge, count, children }) => {
  // Aktive Styles: Border + heller Hintergrund + farbige Schrift
  const activeStyles = {
    purple: 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    blue: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    yellow: 'border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    green: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    red: 'border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
  };

  // Badge-Farben (immer gefüllt für Sichtbarkeit)
  const badgeColors = {
    purple: 'bg-purple-500 text-white',
    blue: 'bg-blue-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    green: 'bg-emerald-500 text-white',
    red: 'bg-red-500 text-white'
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 py-2.5 px-3 rounded-xl font-medium text-sm relative transition-all
        flex items-center justify-center gap-2 border-2
        ${active
          ? activeStyles[color]
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
    >
      {children}
      {count > 0 && (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${badgeColors[color]}`}>
          {count}
        </span>
      )}
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
};

/**
 * Karte für stornierte Buchungen
 */
const CancelledBookingCard = ({ booking }) => {
  const cancelledByFreelancer = booking.cancelledBy === 'freelancer';
  const cancelDate = booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleDateString('de-DE') : '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-4 mb-3 border border-gray-200 dark:border-gray-700 border-l-4 border-l-red-500 opacity-75">
      {/* Storniert-Banner */}
      <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-medium">
          <span>❌</span>
          {cancelledByFreelancer ? (
            <span>Von dir storniert am {cancelDate}</span>
          ) : (
            <span>Von {booking.agencyName} storniert am {cancelDate}</span>
          )}
        </div>
        {booking.cancelReason && (
          <p className="text-red-700 dark:text-red-400 mt-1 text-xs">
            Grund: {booking.cancelReason}
          </p>
        )}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          {/* Produktionsfirma */}
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
            {booking.agencyName}
          </p>
          {/* Projekttitel */}
          <h3 className="font-bold text-lg text-gray-500 dark:text-gray-400 line-through">
            {booking.projectName}
          </h3>
          {/* Phase */}
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Phase: {booking.phaseName}
          </p>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          Storniert
        </span>
      </div>

      {/* Termine */}
      <div className="flex flex-wrap gap-1 mb-3">
        {booking.dates.slice(0, 5).map(date => (
          <span
            key={date}
            className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 line-through"
          >
            {formatDate(date)}
          </span>
        ))}
        {booking.dates.length > 5 && (
          <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
            +{booking.dates.length - 5} weitere
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="line-through text-gray-400 dark:text-gray-500">
          {booking.rateType === 'flat' ? (
            <>
              <span className="text-xs">Pauschal: </span>
              <span className="font-bold text-lg">{booking.totalCost?.toLocaleString('de-DE')}€</span>
              <span className="text-xs ml-2">({booking.dates.length} Tage)</span>
            </>
          ) : (
            <>
              <span className="text-xs">{booking.dayRate?.toLocaleString('de-DE')}€ × {booking.dates.length} Tage = </span>
              <span className="font-bold text-lg">{booking.totalCost?.toLocaleString('de-DE')}€</span>
            </>
          )}
        </div>
      </div>
    </div>
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
  onDeclineReschedule,
  onNavigateToProject
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

  const handleCardClick = () => {
    if (onNavigateToProject) {
      onNavigateToProject(booking.projectId, booking.phaseId);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-card shadow-sm p-4 mb-3 border border-gray-200 dark:border-gray-700 border-l-4 ${getBorderColor()} hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer group`}
      onClick={handleCardClick}
    >
      {/* Konflikt-Banner */}
      {hasConflict && (
        <div className="mb-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-sm" onClick={(e) => e.stopPropagation()}>
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
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          {/* Produktionsfirma */}
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
            {booking.agencyName}
          </p>
          {/* Projekttitel */}
          <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
            {booking.projectName}
            <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </h3>
          {/* Projektbeschreibung */}
          {booking.projectDescription && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {booking.projectDescription}
            </p>
          )}
          {/* Phase */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Phase: {booking.phaseName}
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
 * Mini-Kalender für Verschiebungen - zeigt alte und neue Termine
 */
const RescheduleMiniCalendar = ({ originalDates, newDates }) => {
  // Berechne alle relevanten Daten
  const allDates = useMemo(() => [...new Set([...originalDates, ...newDates])].sort(), [originalDates, newDates]);
  const originalSet = useMemo(() => new Set(originalDates), [originalDates]);
  const newSet = useMemo(() => new Set(newDates), [newDates]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const firstDate = allDates[0];
    if (!firstDate) return new Date();
    const d = parseLocalDate(firstDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  // Berechne Änderungen
  const removed = originalDates.filter(d => !newSet.has(d));
  const added = newDates.filter(d => !originalSet.has(d));
  const kept = newDates.filter(d => originalSet.has(d));

  const getDaysInMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isOriginal = originalSet.has(dateStr);
      const isNew = newSet.has(dateStr);

      let status = null;
      if (isOriginal && isNew) status = 'kept';
      else if (isOriginal && !isNew) status = 'removed';
      else if (!isOriginal && isNew) status = 'added';

      days.push({ day: i, dateStr, status });
    }

    return days;
  };

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const leftDays = getDaysInMonth(currentMonth);
  const rightDays = getDaysInMonth(nextMonth);

  const getDayStyle = (status) => {
    switch (status) {
      case 'kept':
        return 'bg-blue-500 text-white font-medium';
      case 'removed':
        return 'bg-red-200 dark:bg-red-900/50 text-red-600 dark:text-red-400 line-through';
      case 'added':
        return 'bg-emerald-500 text-white font-medium';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const renderMonth = (monthDate, days) => (
    <div className="flex-1 min-w-0">
      <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] text-gray-400 dark:text-gray-500 py-0.5">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-6" />;
          }

          return (
            <div
              key={day.dateStr}
              className={`h-6 flex items-center justify-center text-xs rounded ${getDayStyle(day.status)}`}
            >
              {day.day}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3" onClick={(e) => e.stopPropagation()}>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Zwei Monate nebeneinander */}
      <div className="flex gap-4">
        {renderMonth(currentMonth, leftDays)}
        <div className="w-px bg-gray-200 dark:bg-gray-700" />
        {renderMonth(nextMonth, rightDays)}
      </div>

      {/* Legende */}
      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        {kept.length > 0 && (
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500" />
            Beibehalten ({kept.length})
          </span>
        )}
        {removed.length > 0 && (
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-900/50 border border-red-300 dark:border-red-700" />
            Entfernt ({removed.length})
          </span>
        )}
        {added.length > 0 && (
          <span className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            Neu ({added.length})
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Content für Verschiebungsanfragen
 */
const RescheduleContent = ({ booking, onAccept, onDecline }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <>
      {/* Toggle für Kalender */}
      <div className="mb-3">
        <button
          onClick={(e) => { e.stopPropagation(); setShowCalendar(!showCalendar); }}
          className="flex items-center gap-2 px-3 py-2 w-full text-left bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {showCalendar ? 'Kalender ausblenden' : 'Termine im Kalender anzeigen'}
          </span>
        </button>
      </div>

      {/* Kalender oder Text-Ansicht */}
      {showCalendar ? (
        <div className="mb-3">
          <RescheduleMiniCalendar
            originalDates={booking.reschedule.originalDates}
            newDates={booking.reschedule.newDates}
          />
        </div>
      ) : (
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
      )}

      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
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
};

/**
 * Mini-Kalender für Buchungen - zeigt zwei Monate nebeneinander
 */
const BookingMiniCalendar = ({ dates, status }) => {
  const sortedDates = useMemo(() => [...dates].sort(), [dates]);
  const firstDate = sortedDates[0];

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = parseLocalDate(firstDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const bookedDatesSet = useMemo(() => new Set(dates), [dates]);

  // Farben und Labels je nach Status
  const getStatusStyle = () => {
    switch (status) {
      case BOOKING_STATUS.FIX_CONFIRMED:
        return {
          bgColor: 'bg-emerald-500',
          label: 'Gebuchte Tage (Fix)'
        };
      case BOOKING_STATUS.OPTION_CONFIRMED:
        return {
          bgColor: 'bg-yellow-500',
          label: 'Optionierte Tage'
        };
      case BOOKING_STATUS.FIX_PENDING:
        return {
          bgColor: 'bg-emerald-400',
          label: 'Angefragte Tage (Fix)'
        };
      case BOOKING_STATUS.OPTION_PENDING:
      default:
        return {
          bgColor: 'bg-purple-500',
          label: 'Angefragte Tage (Option)'
        };
    }
  };

  const { bgColor, label } = getStatusStyle();

  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const getDaysInMonth = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr, isBooked: bookedDatesSet.has(dateStr) });
    }

    return days;
  };

  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  const leftDays = getDaysInMonth(currentMonth);
  const rightDays = getDaysInMonth(nextMonth);

  const renderMonth = (monthDate, days) => (
    <div className="flex-1 min-w-0">
      <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] text-gray-400 dark:text-gray-500 py-0.5">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-6" />;
          }

          return (
            <div
              key={day.dateStr}
              className={`h-6 flex items-center justify-center text-xs rounded ${
                day.isBooked
                  ? `${bgColor} text-white font-medium`
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {day.day}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3" onClick={(e) => e.stopPropagation()}>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Zwei Monate nebeneinander */}
      <div className="flex gap-4">
        {renderMonth(currentMonth, leftDays)}
        <div className="w-px bg-gray-200 dark:bg-gray-700" />
        {renderMonth(nextMonth, rightDays)}
      </div>

      {/* Legende */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className={`w-3 h-3 rounded ${bgColor}`} />
        <span className="text-xs text-gray-500 dark:text-gray-400">{label} ({dates.length})</span>
      </div>
    </div>
  );
};

/**
 * Standard-Content für normale Buchungen
 */
const StandardContent = ({ booking, conflict, onAccept, onDecline, onCancel }) => {
  const isPending = isPendingStatus(booking.status);
  const isConfirmed = isConfirmedStatus(booking.status);
  const isFix = isFixStatus(booking.status);
  const [showCalendar, setShowCalendar] = useState(false);

  // Farben für Datums-Badges je nach Status
  const getDateBadgeStyle = () => {
    switch (booking.status) {
      case BOOKING_STATUS.FIX_CONFIRMED:
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      case BOOKING_STATUS.OPTION_CONFIRMED:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case BOOKING_STATUS.FIX_PENDING:
        return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400';
      case BOOKING_STATUS.OPTION_PENDING:
      default:
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
    }
  };

  const dateBadgeStyle = getDateBadgeStyle();

  return (
    <>
      {/* Persönliche Nachricht der Agentur */}
      {booking.message && (
        <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-medium">Nachricht von {booking.agencyName}</span>
          </div>
          <p className="text-sm text-purple-800 dark:text-purple-300">{booking.message}</p>
        </div>
      )}

      {/* Datum-Badges mit Kalender-Toggle */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-wrap gap-1">
            {booking.dates.slice(0, 5).map(date => {
              const isConflict = conflict?.conflictingDates?.includes(date);
              return (
                <span
                  key={date}
                  className={`px-2 py-1 text-xs rounded-lg ${
                    isConflict
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 ring-1 ring-orange-300 dark:ring-orange-700'
                      : dateBadgeStyle
                  }`}
                  title={isConflict ? 'Konflikt mit anderer Anfrage' : ''}
                >
                  {formatDate(date)}
                  {isConflict && ' ⚠️'}
                </span>
              );
            })}
            {booking.dates.length > 5 && (
              <span className={`px-2 py-1 text-xs rounded-lg ${dateBadgeStyle} opacity-70`}>
                +{booking.dates.length - 5} weitere
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCalendar(!showCalendar);
            }}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Calendar className="w-3.5 h-3.5" />
            {showCalendar ? 'Kalender ausblenden' : 'Im Kalender anzeigen'}
          </button>
        </div>

        {showCalendar && (
          <BookingMiniCalendar dates={booking.dates} status={booking.status} />
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div>
          {booking.rateType === 'flat' ? (
            <>
              <span className="text-xs text-gray-500 dark:text-gray-400">Pauschal: </span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">{booking.totalCost?.toLocaleString('de-DE')}€</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({booking.dates.length} Tage)
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-500 dark:text-gray-400">{booking.dayRate?.toLocaleString('de-DE')}€ × {booking.dates.length} Tage = </span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">{booking.totalCost?.toLocaleString('de-DE')}€</span>
            </>
          )}
        </div>

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
