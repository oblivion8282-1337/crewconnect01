import React, { useMemo } from 'react';
import {
  Euro,
  Calendar,
  Bell,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  CalendarDays
} from 'lucide-react';
import KPICard from '../shared/KPICard';
import StatusBadge from '../shared/StatusBadge';
import { formatDate, getDaysInMonth, createDateKey } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isFixStatus,
  isTerminalStatus,
  WEEKDAY_NAMES,
  DAY_STATUS_COLORS
} from '../../constants/calendar';

/**
 * FreelancerHomeDashboard - Neue Startseite für Freelancer
 * Zeigt KPIs, offene Aktionen, kommende Termine und Mini-Kalender
 */
const FreelancerHomeDashboard = ({
  bookings,
  freelancerId,
  freelancerProfile,
  currentDate,
  onAccept,
  onDecline,
  onCancel,
  onAcceptReschedule,
  onDeclineReschedule,
  onViewCalendar,
  onViewAllRequests
}) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Alle Buchungen für diesen Freelancer
  const myBookings = useMemo(() =>
    bookings.filter(b =>
      b.freelancerId === freelancerId &&
      !isTerminalStatus(b.status)
    ),
    [bookings, freelancerId]
  );

  // Kategorisierte Buchungen
  const pendingBookings = useMemo(() =>
    myBookings.filter(b => isPendingStatus(b.status) && !b.reschedule),
    [myBookings]
  );

  const rescheduleBookings = useMemo(() =>
    myBookings.filter(b => b.reschedule),
    [myBookings]
  );

  const confirmedBookings = useMemo(() =>
    myBookings.filter(b => isConfirmedStatus(b.status) && !b.reschedule),
    [myBookings]
  );

  // KPI Berechnungen
  const stats = useMemo(() => {
    // Fix-bestätigte Buchungen für diesen Monat
    const fixedThisMonth = myBookings.filter(b => {
      if (b.status !== BOOKING_STATUS.FIX_CONFIRMED) return false;
      return b.dates.some(d => {
        const date = new Date(d);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
    });

    // Einnahmen diesen Monat
    const revenueThisMonth = fixedThisMonth.reduce((sum, b) => sum + (b.totalCost || 0), 0);

    // Gebuchte Tage diesen Monat (nur fix_confirmed)
    const bookedDaysThisMonth = fixedThisMonth.reduce((total, b) => {
      return total + b.dates.filter(d => {
        const date = new Date(d);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;
    }, 0);

    // Arbeitstage im Monat (Mo-Fr)
    const workingDaysInMonth = getWorkingDaysInMonth(currentYear, currentMonth);

    // Auslastung
    const utilization = workingDaysInMonth > 0
      ? Math.round((bookedDaysThisMonth / workingDaysInMonth) * 100)
      : 0;

    return {
      revenueThisMonth,
      bookedDaysThisMonth,
      pendingCount: pendingBookings.length + rescheduleBookings.length,
      utilization,
      workingDaysInMonth
    };
  }, [myBookings, pendingBookings, rescheduleBookings, currentMonth, currentYear]);

  // Konflikte erkennen
  const conflicts = useMemo(() => {
    const conflictingBookings = [];
    for (let i = 0; i < pendingBookings.length; i++) {
      for (let j = i + 1; j < pendingBookings.length; j++) {
        const overlap = pendingBookings[i].dates.filter(d =>
          pendingBookings[j].dates.includes(d)
        );
        if (overlap.length > 0) {
          conflictingBookings.push({
            booking1: pendingBookings[i],
            booking2: pendingBookings[j],
            dates: overlap
          });
        }
      }
    }
    return conflictingBookings;
  }, [pendingBookings]);

  // Nächste Termine (sortiert, nur Zukunft)
  const upcomingBookings = useMemo(() => {
    const today = createDateKey(now.getFullYear(), now.getMonth(), now.getDate());
    return confirmedBookings
      .filter(b => b.dates.some(d => d >= today))
      .sort((a, b) => {
        const aNext = a.dates.find(d => d >= today) || a.dates[0];
        const bNext = b.dates.find(d => d >= today) || b.dates[0];
        return aNext.localeCompare(bNext);
      })
      .slice(0, 5);
  }, [confirmedBookings, now]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-sm text-gray-500">
          {now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Euro}
          label="Einnahmen (Monat)"
          value={`${stats.revenueThisMonth.toLocaleString('de-DE')}€`}
          variant="success"
        />
        <KPICard
          icon={CalendarDays}
          label="Gebuchte Tage"
          value={stats.bookedDaysThisMonth}
          subValue={`von ${stats.workingDaysInMonth} Arbeitstagen`}
          variant="default"
        />
        <KPICard
          icon={Bell}
          label="Offene Anfragen"
          value={stats.pendingCount}
          variant={stats.pendingCount > 0 ? 'purple' : 'default'}
          onClick={onViewAllRequests}
        />
        <KPICard
          icon={TrendingUp}
          label="Auslastung"
          value={`${stats.utilization}%`}
          variant={stats.utilization >= 80 ? 'success' : stats.utilization >= 50 ? 'warning' : 'default'}
        />
      </div>

      {/* Konflikt-Warnung */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-800">
              {conflicts.length} Terminkonflikt{conflicts.length > 1 ? 'e' : ''} erkannt!
            </p>
            <p className="text-sm text-orange-700">
              Mehrere Anfragen überlappen sich. Prüfe die offenen Anfragen.
            </p>
          </div>
        </div>
      )}

      {/* Hauptbereich: Aktionen + Kalender */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Linke Spalte: Aktionen */}
        <div className="lg:col-span-2 space-y-6">
          {/* Offene Anfragen */}
          <Section
            title="Offene Anfragen"
            count={pendingBookings.length}
            icon={Clock}
            color="purple"
          >
            {pendingBookings.length === 0 ? (
              <EmptyState text="Keine offenen Anfragen" />
            ) : (
              <div className="space-y-3">
                {pendingBookings.slice(0, 3).map(booking => (
                  <ActionCard
                    key={booking.id}
                    booking={booking}
                    onAccept={onAccept}
                    onDecline={onDecline}
                    hasConflict={conflicts.some(c =>
                      c.booking1.id === booking.id || c.booking2.id === booking.id
                    )}
                  />
                ))}
                {pendingBookings.length > 3 && (
                  <button
                    onClick={onViewAllRequests}
                    className="w-full text-center py-2 text-purple-600 text-sm hover:bg-purple-50 rounded-lg"
                  >
                    Alle {pendingBookings.length} Anfragen anzeigen <ArrowRight className="inline w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </Section>

          {/* Verschiebungsanfragen */}
          {rescheduleBookings.length > 0 && (
            <Section
              title="Verschiebungsanfragen"
              count={rescheduleBookings.length}
              icon={Calendar}
              color="blue"
            >
              <div className="space-y-3">
                {rescheduleBookings.slice(0, 2).map(booking => (
                  <RescheduleCard
                    key={booking.id}
                    booking={booking}
                    onAccept={onAcceptReschedule}
                    onDecline={onDeclineReschedule}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Nächste Termine */}
          <Section
            title="Nächste Termine"
            count={upcomingBookings.length}
            icon={CheckCircle}
            color="green"
          >
            {upcomingBookings.length === 0 ? (
              <EmptyState text="Keine bestätigten Termine" />
            ) : (
              <div className="space-y-2">
                {upcomingBookings.map(booking => (
                  <UpcomingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Rechte Spalte: Mini-Kalender */}
        <div>
          <MiniCalendar
            bookings={myBookings}
            year={currentYear}
            month={currentMonth}
            onViewCalendar={onViewCalendar}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Section Wrapper
 */
const Section = ({ title, count, icon: Icon, color, children }) => {
  const colors = {
    purple: { icon: 'text-violet-600 bg-violet-50', badge: 'text-violet-700 bg-violet-100' },
    blue: { icon: 'text-blue-600 bg-blue-50', badge: 'text-blue-700 bg-blue-100' },
    green: { icon: 'text-emerald-600 bg-emerald-50', badge: 'text-emerald-700 bg-emerald-100' }
  };

  const colorConfig = colors[color] || colors.purple;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2 rounded-xl ${colorConfig.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {count > 0 && (
          <span className={`ml-auto px-2.5 py-1 rounded-lg text-xs font-semibold ${colorConfig.badge}`}>
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
};

/**
 * Leerer Zustand
 */
const EmptyState = ({ text }) => (
  <div className="text-center py-8 text-slate-400 text-sm">
    {text}
  </div>
);

/**
 * Aktionskarte für offene Anfragen
 */
const ActionCard = ({ booking, onAccept, onDecline, hasConflict }) => {
  const isFix = isFixStatus(booking.status);

  return (
    <div className={`p-4 rounded-xl border transition-all ${hasConflict ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{booking.agencyAvatar}</span>
            <span className="font-semibold text-sm text-slate-900">{booking.projectName}</span>
            {hasConflict && <span className="text-amber-500">⚠️</span>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{booking.agencyName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {booking.dates.slice(0, 4).map(date => (
          <span key={date} className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-600">
            {formatDate(date)}
          </span>
        ))}
        {booking.dates.length > 4 && (
          <span className="px-2.5 py-1 text-xs text-slate-400">
            +{booking.dates.length - 4} weitere
          </span>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-200">
        <span className="font-bold text-slate-900">{booking.totalCost?.toLocaleString('de-DE')}€</span>
        <div className="flex gap-2">
          <button
            onClick={() => onDecline(booking)}
            className="px-4 py-2 text-xs font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Ablehnen
          </button>
          <button
            onClick={() => onAccept(booking)}
            className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors ${isFix ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            {isFix ? 'Fix bestätigen' : 'Bestätigen'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Karte für Verschiebungsanfragen
 */
const RescheduleCard = ({ booking, onAccept, onDecline }) => (
  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{booking.agencyAvatar}</span>
          <span className="font-semibold text-sm text-slate-900">{booking.projectName}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{booking.agencyName}</p>
      </div>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Verschiebung
      </span>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
      <div>
        <span className="text-slate-500 font-medium">Bisherige Termine:</span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {booking.reschedule.originalDates.slice(0, 3).map(d => (
            <span key={d} className="px-2 py-1 rounded-lg bg-slate-200 text-slate-500 line-through">{formatDate(d)}</span>
          ))}
        </div>
      </div>
      <div>
        <span className="text-blue-600 font-medium">Neue Termine:</span>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {booking.reschedule.newDates.slice(0, 3).map(d => (
            <span key={d} className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">{formatDate(d)}</span>
          ))}
        </div>
      </div>
    </div>

    <div className="flex justify-between items-center pt-3 border-t border-blue-200">
      <span className="font-bold text-slate-900">{booking.reschedule.newTotalCost?.toLocaleString('de-DE')}€</span>
      <div className="flex gap-2">
        <button
          onClick={() => onDecline(booking)}
          className="px-4 py-2 text-xs font-medium border border-slate-300 text-slate-600 rounded-lg hover:bg-white transition-colors"
        >
          Ablehnen
        </button>
        <button
          onClick={() => onAccept(booking)}
          className="px-4 py-2 text-xs font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Bestätigen
        </button>
      </div>
    </div>
  </div>
);

/**
 * Karte für kommende Termine
 */
const UpcomingCard = ({ booking }) => {
  const today = new Date();
  const todayKey = createDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const nextDate = booking.dates.find(d => d >= todayKey) || booking.dates[0];
  const isFix = booking.status === BOOKING_STATUS.FIX_CONFIRMED;

  return (
    <div className={`p-4 rounded-xl border transition-all hover:shadow-sm ${isFix ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFix ? 'bg-red-500' : 'bg-yellow-400'}`}></span>
            <span className="font-medium text-sm">{booking.projectName}</span>
          </div>
          <p className="text-xs text-gray-500 ml-4">{booking.agencyName}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-sm">{formatDate(nextDate)}</p>
          <p className="text-xs text-gray-500">{booking.dates.length} Tag{booking.dates.length > 1 ? 'e' : ''}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Mini-Kalender
 */
const MiniCalendar = ({ bookings, year, month, onViewCalendar }) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Mo = 0

  // Status pro Tag berechnen
  const dayStatuses = useMemo(() => {
    const statuses = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = createDateKey(year, month, day);
      const dayBookings = bookings.filter(b => b.dates.includes(dateKey));

      if (dayBookings.length === 0) {
        statuses[day] = 'available';
      } else {
        // Priorität: fix_confirmed > option_confirmed > pending
        const hasFix = dayBookings.some(b => b.status === BOOKING_STATUS.FIX_CONFIRMED);
        const hasOption = dayBookings.some(b => b.status === BOOKING_STATUS.OPTION_CONFIRMED);
        const hasPending = dayBookings.some(b => isPendingStatus(b.status));

        if (hasFix) statuses[day] = 'fix';
        else if (hasOption) statuses[day] = 'option';
        else if (hasPending) statuses[day] = 'pending';
        else statuses[day] = 'available';
      }
    }
    return statuses;
  }, [bookings, year, month, daysInMonth]);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const currentDay = today.getDate();

  const monthName = new Date(year, month).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">{monthName}</h2>
        {onViewCalendar && (
          <button
            onClick={onViewCalendar}
            className="text-xs text-purple-600 hover:underline"
          >
            Vollansicht <ArrowRight className="inline w-3 h-3" />
          </button>
        )}
      </div>

      {/* Wochentage */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_NAMES.map(day => (
          <div key={day} className="text-center text-xs text-gray-400 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Tage */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leere Felder vor dem 1. */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Tage des Monats */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const status = dayStatuses[day];
          const isToday = isCurrentMonth && day === currentDay;

          const colorClasses = {
            available: 'bg-gray-100 text-gray-600',
            pending: 'bg-purple-500 text-white',
            option: 'bg-yellow-400 text-gray-800',
            fix: 'bg-red-500 text-white'
          };

          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-xs rounded ${colorClasses[status]} ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legende */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-purple-500"></span>
          <span className="text-gray-500">Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-400"></span>
          <span className="text-gray-500">Option</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500"></span>
          <span className="text-gray-500">Fix</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Hilfsfunktion: Arbeitstage im Monat (Mo-Fr)
 */
const getWorkingDaysInMonth = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
  }
  return workingDays;
};

export default FreelancerHomeDashboard;
