import React, { useState, useMemo } from 'react';
import { CalendarRange, Inbox, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Euro, Calendar, AlertTriangle } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { formatDateShort, formatDateWithYear, formatDateTime, parseLocalDate } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus
} from '../../constants/calendar';

/**
 * Formatiert Datumsbereich für Anzeige (z.B. "12.01.25 – 18.01.25")
 */
const formatDateRange = (dates) => {
  if (!dates || dates.length === 0) return '';
  const sortedDates = [...dates].sort();
  if (sortedDates.length === 1) {
    return formatDateWithYear(sortedDates[0]);
  }
  return `${formatDateWithYear(sortedDates[0])} – ${formatDateWithYear(sortedDates[sortedDates.length - 1])}`;
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
 * Mini-Kalender für Buchungen
 */
const BookingMiniCalendar = ({ dates, colorScheme = 'blue' }) => {
  const sortedDates = useMemo(() => [...dates].sort(), [dates]);
  const firstDate = sortedDates[0];
  const bookedDatesSet = useMemo(() => new Set(dates), [dates]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = parseLocalDate(firstDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const colorMap = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500'
  };
  const bgColor = colorMap[colorScheme] || colorMap.blue;

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
          if (!day) return <div key={`empty-${idx}`} className="h-6" />;
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
    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="flex gap-4">
        {renderMonth(currentMonth, leftDays)}
        {renderMonth(nextMonth, rightDays)}
      </div>
    </div>
  );
};

/**
 * Aufklappbare Tagesliste mit Mini-Kalender
 */
const ExpandableDateList = ({ dates, colorScheme = 'blue' }) => {
  const [expanded, setExpanded] = useState(false);

  const colors = {
    blue: {
      bg: 'bg-blue-100/50 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-500',
      button: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
    },
    yellow: {
      bg: 'bg-yellow-100/50 dark:bg-yellow-900/30',
      icon: 'text-yellow-600 dark:text-yellow-500',
      button: 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300'
    },
    emerald: {
      bg: 'bg-emerald-100/50 dark:bg-emerald-900/30',
      icon: 'text-emerald-600 dark:text-emerald-500',
      button: 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
    },
    purple: {
      bg: 'bg-purple-100/50 dark:bg-purple-900/30',
      icon: 'text-purple-600 dark:text-purple-500',
      button: 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300'
    }
  };

  const c = colors[colorScheme] || colors.blue;

  return (
    <div className={`p-3 rounded-lg ${c.bg}`} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
        <Calendar className={`w-4 h-4 ${c.icon}`} />
        <span className="text-xs font-medium">Zeitraum</span>
      </div>
      <p className="font-medium text-gray-900 dark:text-white">{formatDateRange(dates)}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className={`flex items-center gap-1 text-sm mt-1 ${c.button}`}
      >
        <span>{dates.length} Tag{dates.length !== 1 ? 'e' : ''} ausgewählt</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && (
        <BookingMiniCalendar dates={dates} colorScheme={colorScheme} />
      )}
    </div>
  );
};

/**
 * Gage-Anzeige mit Aufschlüsselung
 */
const BookingFeeDisplay = ({ booking }) => (
  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
    <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Euro className="w-4 h-4" />
      Gage
    </span>
    <div className="text-right">
      {booking.rateType === 'flat' ? (
        <>
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Pauschal</span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            {booking.totalCost?.toLocaleString('de-DE') || 0}€
          </span>
        </>
      ) : (
        <>
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
            {booking.dayRate?.toLocaleString('de-DE') || 0}€ × {booking.dates?.length || 0} Tage
          </span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            {booking.totalCost?.toLocaleString('de-DE') || 0}€
          </span>
        </>
      )}
    </div>
  </div>
);

/**
 * Projekt/Phase Badges mit Klick-Navigation
 */
const ProjectPhaseBadges = ({ projectName, phaseName, onProjectClick, onPhaseClick }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <button
      onClick={(e) => { e.stopPropagation(); onProjectClick?.(); }}
      className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg font-medium text-sm hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors cursor-pointer"
    >
      {projectName}
    </button>
    <span className="text-gray-400 dark:text-gray-500">→</span>
    <button
      onClick={(e) => { e.stopPropagation(); onPhaseClick?.(); }}
      className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-sm hover:bg-purple-200 dark:hover:bg-purple-800/60 transition-colors cursor-pointer"
    >
      {phaseName || 'Phase'}
    </button>
  </div>
);

/**
 * AgencyBookings - Buchungsübersicht für Agenturen
 */
const AgencyBookings = ({
  bookings,
  agencyId,
  onWithdraw,
  onReschedule,
  onCancel,
  onWithdrawReschedule,
  onConvertToFix,
  onNavigateToProject,
  onNavigateToPhase
}) => {
  const [activeTab, setActiveTab] = useState('pending');

  // Filtere relevante Buchungen
  const activeBookings = bookings.filter(b =>
    b.agencyId === agencyId &&
    ![BOOKING_STATUS.DECLINED, BOOKING_STATUS.WITHDRAWN, BOOKING_STATUS.CANCELLED].includes(b.status)
  );

  // Wartende Anfragen (Option Pending + Fix Pending)
  const pendingBookings = activeBookings.filter(b =>
    isPendingStatus(b.status) && !b.reschedule
  );

  // Verschiebungsanfragen
  const rescheduleBookings = activeBookings.filter(b => b.reschedule);

  // Optionierte Buchungen (Option Confirmed)
  const optionBookings = activeBookings.filter(b =>
    b.status === BOOKING_STATUS.OPTION_CONFIRMED && !b.reschedule
  );

  // Bestätigte Fix-Buchungen (Fix Confirmed)
  const fixBookings = activeBookings.filter(b =>
    b.status === BOOKING_STATUS.FIX_CONFIRMED && !b.reschedule
  );

  // Stornierte Buchungen (letzte 30 Tage)
  const cancelledBookings = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return bookings.filter(b => {
      if (b.agencyId !== agencyId || b.status !== BOOKING_STATUS.CANCELLED) return false;
      if (b.cancelledAt) {
        const cancelDate = new Date(b.cancelledAt);
        return cancelDate >= thirtyDaysAgo;
      }
      return true;
    }).sort((a, b) => new Date(b.cancelledAt) - new Date(a.cancelledAt));
  }, [bookings, agencyId]);

  // Global empty state wenn keine Buchungen vorhanden
  const hasNoBookings = activeBookings.length === 0 && cancelledBookings.length === 0;

  // Aktive Buchungen basierend auf Tab
  const currentBookings = activeTab === 'pending'
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
          {/* Tab-Navigation */}
          <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-card shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <TabButton
              active={activeTab === 'pending'}
              onClick={() => setActiveTab('pending')}
              color="purple"
              count={pendingBookings.length}
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
          {currentBookings.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              {activeTab === 'pending' && 'Keine ausstehenden Anfragen'}
              {activeTab === 'reschedule' && 'Keine Verschiebungsanfragen'}
              {activeTab === 'option' && 'Keine optionierten Buchungen'}
              {activeTab === 'confirmed' && 'Keine bestätigten Buchungen'}
              {activeTab === 'cancelled' && 'Keine stornierten Buchungen'}
            </div>
          ) : (
            <div>
              {activeTab === 'pending' && currentBookings.map(booking => (
                <PendingBookingCard
                  key={booking.id}
                  booking={booking}
                  onWithdraw={onWithdraw}
                  onReschedule={onReschedule}
                  onNavigateToProject={onNavigateToProject}
                  onNavigateToPhase={onNavigateToPhase}
                />
              ))}
              {activeTab === 'reschedule' && currentBookings.map(booking => (
                <RescheduleBookingCard
                  key={booking.id}
                  booking={booking}
                  onWithdraw={onWithdrawReschedule}
                  onNavigateToProject={onNavigateToProject}
                  onNavigateToPhase={onNavigateToPhase}
                />
              ))}
              {activeTab === 'option' && currentBookings.map(booking => (
                <OptionBookingCard
                  key={booking.id}
                  booking={booking}
                  onReschedule={onReschedule}
                  onCancel={onCancel}
                  onConvertToFix={onConvertToFix}
                  onNavigateToProject={onNavigateToProject}
                  onNavigateToPhase={onNavigateToPhase}
                />
              ))}
              {activeTab === 'confirmed' && currentBookings.map(booking => (
                <FixBookingCard
                  key={booking.id}
                  booking={booking}
                  onReschedule={onReschedule}
                  onCancel={onCancel}
                  onNavigateToProject={onNavigateToProject}
                  onNavigateToPhase={onNavigateToPhase}
                />
              ))}
              {activeTab === 'cancelled' && currentBookings.map(booking => (
                <CancelledBookingCard
                  key={booking.id}
                  booking={booking}
                  onNavigateToProject={onNavigateToProject}
                  onNavigateToPhase={onNavigateToPhase}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Karte für Verschiebungsanfragen
 */
const RescheduleBookingCard = ({ booking, onWithdraw, onNavigateToProject, onNavigateToPhase }) => (
  <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500 rounded-card mb-3">
    {/* Header: Freelancer + Status */}
    <div className="flex justify-between items-start mb-3">
      <p className="font-semibold text-gray-900 dark:text-white">{booking.freelancerName}</p>
      <StatusBadge
        status={booking.status}
        type={booking.type}
        hasReschedule={true}
      />
    </div>

    {/* Projekt/Phase Badges */}
    <div className="mb-3">
      <ProjectPhaseBadges
        projectName={booking.projectName}
        phaseName={booking.phaseName}
        onProjectClick={() => onNavigateToProject?.(booking.projectId)}
        onPhaseClick={() => onNavigateToPhase?.(booking.projectId, booking.phaseId)}
      />
    </div>

    {/* Datum-Änderung (Verschiebung) */}
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
        <Calendar className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-medium">Verschiebung</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="line-through text-gray-500 dark:text-gray-500">
          {formatDateRange(booking.reschedule.originalDates)}
        </span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">
          → {formatDateRange(booking.reschedule.newDates)}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {booking.reschedule.newDates.length} Tag{booking.reschedule.newDates.length !== 1 ? 'e' : ''}
      </p>
    </div>

    {/* Kosten */}
    <BookingFeeDisplay booking={booking} />

    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => onWithdraw(booking)}
        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Zurückziehen
      </button>
    </div>
  </div>
);

/**
 * Karte für wartende Anfragen
 */
const PendingBookingCard = ({ booking, onWithdraw, onReschedule, onNavigateToProject, onNavigateToPhase }) => (
  <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-purple-500 rounded-card mb-3">
    {/* Header: Freelancer + Status */}
    <div className="flex justify-between items-start mb-3">
      <p className="font-semibold text-gray-900 dark:text-white">{booking.freelancerName}</p>
      <StatusBadge status={booking.status} type={booking.type} />
    </div>

    {/* Projekt/Phase Badges */}
    <div className="mb-3">
      <ProjectPhaseBadges
        projectName={booking.projectName}
        phaseName={booking.phaseName}
        onProjectClick={() => onNavigateToProject?.(booking.projectId)}
        onPhaseClick={() => onNavigateToPhase?.(booking.projectId, booking.phaseId)}
      />
    </div>

    {/* Aufklappbare Tagesliste */}
    <div className="mb-3">
      <ExpandableDateList dates={booking.dates} colorScheme="purple" />
    </div>

    {/* Kosten */}
    <BookingFeeDisplay booking={booking} />

    <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => onReschedule(booking)}
        className="px-3 py-1.5 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
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
);

/**
 * Karte für eine optionierte Buchung
 */
const OptionBookingCard = ({ booking, onReschedule, onCancel, onConvertToFix, onNavigateToProject, onNavigateToPhase }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-yellow-500 rounded-card mb-3">
      {/* Header: Freelancer + Status Badge */}
      <div className="flex justify-between items-start mb-3">
        <p className="font-semibold text-gray-900 dark:text-white">{booking.freelancerName}</p>
        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400">
          Option
        </span>
      </div>

      {/* Projekt/Phase Badges */}
      <div className="mb-3">
        <ProjectPhaseBadges
          projectName={booking.projectName}
          phaseName={booking.phaseName}
          onProjectClick={() => onNavigateToProject?.(booking.projectId)}
          onPhaseClick={() => onNavigateToPhase?.(booking.projectId, booking.phaseId)}
        />
      </div>

      {/* Aufklappbare Tagesliste */}
      <div className="mb-3">
        <ExpandableDateList dates={booking.dates} colorScheme="yellow" />
      </div>

      {/* Kosten */}
      <BookingFeeDisplay booking={booking} />

      <div className="flex gap-2 justify-end flex-wrap" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onConvertToFix?.(booking)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Zu Fix umwandeln
        </button>
        <button
          onClick={() => onReschedule(booking)}
          className="px-3 py-1.5 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
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

/**
 * Karte für eine bestätigte Fix-Buchung
 */
const FixBookingCard = ({ booking, onReschedule, onCancel, onNavigateToProject, onNavigateToPhase }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-emerald-500 rounded-card mb-3">
      {/* Header: Freelancer + Status Badge */}
      <div className="flex justify-between items-start mb-3">
        <p className="font-semibold text-gray-900 dark:text-white">{booking.freelancerName}</p>
        <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
          Fix
        </span>
      </div>

      {/* Projekt/Phase Badges */}
      <div className="mb-3">
        <ProjectPhaseBadges
          projectName={booking.projectName}
          phaseName={booking.phaseName}
          onProjectClick={() => onNavigateToProject?.(booking.projectId)}
          onPhaseClick={() => onNavigateToPhase?.(booking.projectId, booking.phaseId)}
        />
      </div>

      {/* Aufklappbare Tagesliste */}
      <div className="mb-3">
        <ExpandableDateList dates={booking.dates} colorScheme="emerald" />
      </div>

      {/* Kosten */}
      <BookingFeeDisplay booking={booking} />

      <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onReschedule(booking)}
          className="px-3 py-1.5 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
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

/**
 * Karte für eine stornierte Buchung
 */
const CancelledBookingCard = ({ booking, onNavigateToProject, onNavigateToPhase }) => {
  const cancelledByFreelancer = booking.cancelledBy === 'freelancer';
  const cancelDate = booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleDateString('de-DE') : '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-4 mb-3 border border-gray-200 dark:border-gray-700 border-l-4 border-l-red-500 opacity-75">
      {/* Storniert-Banner */}
      <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-medium">
          <span>❌</span>
          {cancelledByFreelancer ? (
            <span>Von {booking.freelancerName} storniert am {cancelDate}</span>
          ) : (
            <span>Von dir storniert am {cancelDate}</span>
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
        <p className="font-semibold text-gray-500 dark:text-gray-400 line-through">
          {booking.freelancerName}
        </p>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          Storniert
        </span>
      </div>

      {/* Projekt/Phase */}
      <div className="mb-3 opacity-60">
        <ProjectPhaseBadges
          projectName={booking.projectName}
          phaseName={booking.phaseName}
          onProjectClick={() => onNavigateToProject?.(booking.projectId)}
          onPhaseClick={() => onNavigateToPhase?.(booking.projectId, booking.phaseId)}
        />
      </div>

      {/* Termine und Kosten */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
        <span>{formatDateRange(booking.dates)} • {booking.dates.length} Tag{booking.dates.length !== 1 ? 'e' : ''}</span>
        <span className="font-bold text-gray-400 dark:text-gray-500 line-through">
          {booking.totalCost?.toLocaleString('de-DE') || 0}€
        </span>
      </div>
    </div>
  );
};

export default AgencyBookings;
