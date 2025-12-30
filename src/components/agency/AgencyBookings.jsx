import React, { useState, useMemo } from 'react';
import { CalendarRange, Inbox, ChevronRight, ChevronDown, ChevronUp, Euro, Calendar, AlertTriangle } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { formatDateShort, formatDateWithYear, formatDateTime } from '../../utils/dateUtils';
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
 * Tab-Button Komponente
 */
const TabButton = ({ active, onClick, color, badge, count, children }) => {
  const activeColors = {
    purple: 'bg-purple-600 text-white',
    blue: 'bg-blue-600 text-white',
    yellow: 'bg-yellow-500 text-white',
    green: 'bg-emerald-600 text-white',
    red: 'bg-red-600 text-white'
  };

  const badgeColors = {
    purple: 'bg-purple-700',
    blue: 'bg-blue-700',
    yellow: 'bg-yellow-600',
    green: 'bg-emerald-700',
    red: 'bg-red-700'
  };

  const inactiveBadgeColors = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-emerald-500',
    red: 'bg-red-500'
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 px-3 rounded-xl font-medium text-sm relative transition-colors flex items-center justify-center gap-2 ${
        active ? activeColors[color] : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {children}
      {count > 0 && (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${
          active ? badgeColors[color] : inactiveBadgeColors[color]
        }`}>
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
 * Aufklappbare Tagesliste
 */
const ExpandableDateList = ({ dates, colorScheme = 'blue' }) => {
  const [expanded, setExpanded] = useState(false);
  const sortedDates = [...dates].sort();

  const colors = {
    blue: {
      bg: 'bg-blue-100/50 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-500',
      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      button: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
    },
    yellow: {
      bg: 'bg-yellow-100/50 dark:bg-yellow-900/30',
      icon: 'text-yellow-600 dark:text-yellow-500',
      badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      button: 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300'
    },
    emerald: {
      bg: 'bg-emerald-100/50 dark:bg-emerald-900/30',
      icon: 'text-emerald-600 dark:text-emerald-500',
      badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      button: 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
    },
    purple: {
      bg: 'bg-purple-100/50 dark:bg-purple-900/30',
      icon: 'text-purple-600 dark:text-purple-500',
      badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
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
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {sortedDates.map(day => {
              const date = new Date(day);
              const weekday = date.toLocaleDateString('de-DE', { weekday: 'short' });
              return (
                <span
                  key={day}
                  className={`px-2 py-1 text-xs rounded-md ${c.badge}`}
                >
                  {weekday}, {formatDateShort(day)}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Projekt/Phase Badges wie im FreelancerSearchModal
 */
const ProjectPhaseBadges = ({ projectName, phaseName }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg font-medium text-sm">
      {projectName}
    </span>
    <span className="text-gray-400 dark:text-gray-500">→</span>
    <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-sm">
      {phaseName || 'Phase'}
    </span>
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
                  onNavigateToPhase={onNavigateToPhase}
                />
              ))}
              {activeTab === 'reschedule' && currentBookings.map(booking => (
                <RescheduleBookingCard
                  key={booking.id}
                  booking={booking}
                  onWithdraw={onWithdrawReschedule}
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
                  onNavigateToPhase={onNavigateToPhase}
                />
              ))}
              {activeTab === 'confirmed' && currentBookings.map(booking => (
                <FixBookingCard
                  key={booking.id}
                  booking={booking}
                  onReschedule={onReschedule}
                  onCancel={onCancel}
                  onNavigateToPhase={onNavigateToPhase}
                />
              ))}
              {activeTab === 'cancelled' && currentBookings.map(booking => (
                <CancelledBookingCard
                  key={booking.id}
                  booking={booking}
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
const RescheduleBookingCard = ({ booking, onWithdraw, onNavigateToPhase }) => (
  <div
    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500 rounded-card mb-3 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer group"
    onClick={() => onNavigateToPhase?.(booking.projectId, booking.phaseId)}
  >
    {/* Header: Freelancer + Status */}
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-gray-900 dark:text-white">{booking.freelancerName}</p>
        <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <StatusBadge
        status={booking.status}
        type={booking.type}
        hasReschedule={true}
      />
    </div>

    {/* Projekt/Phase Badges */}
    <div className="mb-3">
      <ProjectPhaseBadges projectName={booking.projectName} phaseName={booking.phaseName} />
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
    <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Euro className="w-4 h-4" />
        Gage
      </span>
      <span className="font-bold text-lg text-gray-900 dark:text-white">
        {booking.totalCost?.toLocaleString('de-DE') || 0}€
      </span>
    </div>

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
const PendingBookingCard = ({ booking, onWithdraw, onReschedule, onNavigateToPhase }) => (
  <div
    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-purple-500 rounded-card mb-3 hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer group"
    onClick={() => onNavigateToPhase?.(booking.projectId, booking.phaseId)}
  >
    {/* Header: Freelancer + Status */}
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-gray-900 dark:text-white">{booking.freelancerName}</p>
        <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <StatusBadge status={booking.status} type={booking.type} />
    </div>

    {/* Projekt/Phase Badges */}
    <div className="mb-3">
      <ProjectPhaseBadges projectName={booking.projectName} phaseName={booking.phaseName} />
    </div>

    {/* Aufklappbare Tagesliste */}
    <div className="mb-3">
      <ExpandableDateList dates={booking.dates} colorScheme="purple" />
    </div>

    {/* Kosten */}
    <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Euro className="w-4 h-4" />
        Gage
      </span>
      <span className="font-bold text-lg text-gray-900 dark:text-white">
        {booking.totalCost?.toLocaleString('de-DE') || 0}€
      </span>
    </div>

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
const OptionBookingCard = ({ booking, onReschedule, onCancel, onConvertToFix, onNavigateToPhase }) => {
  return (
    <div
      className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-yellow-500 rounded-card mb-3 hover:border-yellow-300 dark:hover:border-yellow-600 transition-colors cursor-pointer group"
      onClick={() => onNavigateToPhase?.(booking.projectId, booking.phaseId)}
    >
      {/* Header: Freelancer + Status Badge */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 dark:text-white">{booking.freelancerName}</p>
          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400">
          Option
        </span>
      </div>

      {/* Projekt/Phase Badges */}
      <div className="mb-3">
        <ProjectPhaseBadges projectName={booking.projectName} phaseName={booking.phaseName} />
      </div>

      {/* Aufklappbare Tagesliste */}
      <div className="mb-3">
        <ExpandableDateList dates={booking.dates} colorScheme="yellow" />
      </div>

      {/* Kosten */}
      <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Euro className="w-4 h-4" />
          Gage
        </span>
        <span className="font-bold text-lg text-gray-900 dark:text-white">
          {booking.totalCost?.toLocaleString('de-DE') || 0}€
        </span>
      </div>

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
const FixBookingCard = ({ booking, onReschedule, onCancel, onNavigateToPhase }) => {
  return (
    <div
      className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 border-l-emerald-500 rounded-card mb-3 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors cursor-pointer group"
      onClick={() => onNavigateToPhase?.(booking.projectId, booking.phaseId)}
    >
      {/* Header: Freelancer + Status Badge */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 dark:text-white">{booking.freelancerName}</p>
          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
          Fix
        </span>
      </div>

      {/* Projekt/Phase Badges */}
      <div className="mb-3">
        <ProjectPhaseBadges projectName={booking.projectName} phaseName={booking.phaseName} />
      </div>

      {/* Aufklappbare Tagesliste */}
      <div className="mb-3">
        <ExpandableDateList dates={booking.dates} colorScheme="emerald" />
      </div>

      {/* Kosten */}
      <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Euro className="w-4 h-4" />
          Gage
        </span>
        <span className="font-bold text-lg text-gray-900 dark:text-white">
          {booking.totalCost?.toLocaleString('de-DE') || 0}€
        </span>
      </div>

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
const CancelledBookingCard = ({ booking, onNavigateToPhase }) => {
  const cancelledByFreelancer = booking.cancelledBy === 'freelancer';
  const cancelDate = booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleDateString('de-DE') : '';

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-4 mb-3 border border-gray-200 dark:border-gray-700 border-l-4 border-l-red-500 opacity-75 cursor-pointer group"
      onClick={() => onNavigateToPhase?.(booking.projectId, booking.phaseId)}
    >
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
        <div className="flex-1 min-w-0">
          {/* Freelancer */}
          <p className="font-semibold text-gray-500 dark:text-gray-400 line-through flex items-center gap-2">
            {booking.freelancerName}
            <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          Storniert
        </span>
      </div>

      {/* Projekt/Phase */}
      <div className="mb-3 opacity-60">
        <ProjectPhaseBadges projectName={booking.projectName} phaseName={booking.phaseName} />
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
