import React, { useMemo, useState } from 'react';
import {
  Euro,
  Calendar,
  Bell,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { formatDate, getDaysInMonth, createDateKey } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isFixStatus,
  isTerminalStatus,
  WEEKDAY_NAMES,
  MONTH_NAMES
} from '../../constants/calendar';

/**
 * FreelancerHomeDashboard - Dashboard mit Einnahmen-Übersicht
 */
const FreelancerHomeDashboard = ({
  bookings,
  freelancerId,
  freelancerProfile,
  currentDate,
  getDayStatus,
  onAccept,
  onDecline,
  onCancel,
  onAcceptReschedule,
  onDeclineReschedule,
  onViewCalendar,
  onViewAllRequests
}) => {
  const now = new Date();
  // Use currentDate for calendar sync (demo mode uses Jan 2025), fallback to now
  const calendarDate = currentDate || now;
  const currentMonth = calendarDate.getMonth();
  const currentYear = calendarDate.getFullYear();

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

  // Monatliche Einnahmen berechnen (für Jahresübersicht)
  const monthlyRevenue = useMemo(() => {
    const revenue = Array(12).fill(0);

    // Auch terminated bookings für historische Daten
    const allMyBookings = bookings.filter(b => b.freelancerId === freelancerId);

    allMyBookings.forEach(b => {
      if (b.status === BOOKING_STATUS.FIX_CONFIRMED) {
        b.dates.forEach(d => {
          const date = new Date(d);
          if (date.getFullYear() === currentYear) {
            const month = date.getMonth();
            revenue[month] += (b.dayRate || 0);
          }
        });
      }
    });

    return revenue;
  }, [bookings, freelancerId, currentYear]);

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
    const revenueThisMonth = monthlyRevenue[currentMonth];

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

    // Jahreseinnahmen
    const yearlyRevenue = monthlyRevenue.reduce((sum, val) => sum + val, 0);

    return {
      revenueThisMonth,
      yearlyRevenue,
      bookedDaysThisMonth,
      pendingCount: pendingBookings.length + rescheduleBookings.length,
      utilization,
      workingDaysInMonth
    };
  }, [myBookings, pendingBookings, rescheduleBookings, currentMonth, currentYear, monthlyRevenue]);

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

  // Nächste Termine
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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Wallet}
          label="Einnahmen (Monat)"
          value={`${stats.revenueThisMonth.toLocaleString('de-DE')} €`}
          change="+12%"
          trend="up"
        />
        <StatsCard
          icon={Euro}
          label="Einnahmen (Jahr)"
          value={`${stats.yearlyRevenue.toLocaleString('de-DE')} €`}
          change="+8%"
          trend="up"
        />
        <StatsCard
          icon={Bell}
          label="Offene Anfragen"
          value={stats.pendingCount}
          onClick={onViewAllRequests}
          highlight={stats.pendingCount > 0}
        />
        <StatsCard
          icon={TrendingUp}
          label="Auslastung"
          value={`${stats.utilization}%`}
          subValue={`${stats.bookedDaysThisMonth} / ${stats.workingDaysInMonth} Tage`}
        />
      </div>

      {/* Konflikt-Warnung */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-card flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-800 dark:text-orange-300">
              {conflicts.length} Terminkonflikt{conflicts.length > 1 ? 'e' : ''} erkannt!
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              Mehrere Anfragen überlappen sich. Prüfe die offenen Anfragen.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-3">
          <RevenueChart
            data={monthlyRevenue}
            currentMonth={currentMonth}
            title="Einnahmen Übersicht"
          />
        </div>

        {/* Mini Calendar & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          <MiniCalendar
            getDayStatus={getDayStatus}
            freelancerId={freelancerId}
            year={currentYear}
            month={currentMonth}
            onViewCalendar={onViewCalendar}
            bookings={bookings}
          />

          {/* Nächste Termine */}
          <div className="p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Nächste Termine</h3>
              <span className="text-caption text-gray-500">{upcomingBookings.length} anstehend</span>
            </div>
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                Keine bestätigten Termine
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingBookings.slice(0, 3).map(booking => (
                  <UpcomingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offene Anfragen */}
        <Section
          title="Offene Anfragen"
          count={pendingBookings.length}
          icon={Clock}
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
                  className="w-full text-center py-2 text-primary text-sm hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Alle {pendingBookings.length} anzeigen <ArrowRight className="inline w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </Section>

        {/* Verschiebungsanfragen */}
        <Section
          title="Verschiebungsanfragen"
          count={rescheduleBookings.length}
          icon={Calendar}
        >
          {rescheduleBookings.length === 0 ? (
            <EmptyState text="Keine Verschiebungen" />
          ) : (
            <div className="space-y-3">
              {rescheduleBookings.slice(0, 3).map(booking => (
                <RescheduleCard
                  key={booking.id}
                  booking={booking}
                  onAccept={onAcceptReschedule}
                  onDecline={onDeclineReschedule}
                />
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

/**
 * Stats Card Component
 */
const StatsCard = ({ icon: Icon, label, value, subValue, change, trend, onClick, highlight }) => (
  <div
    className={`
      p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
      transition-all duration-200
      ${onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg' : ''}
      ${highlight ? 'ring-2 ring-primary/50' : ''}
    `}
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </div>
      {change && (
        <span className={`
          text-caption font-medium px-2 py-1 rounded-lg
          ${trend === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : ''}
          ${trend === 'down' ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : ''}
        `}>
          {change}
        </span>
      )}
    </div>
    <p className="text-caption text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-stat text-gray-900 dark:text-white">{value}</p>
    {subValue && (
      <p className="text-caption text-gray-400 mt-1">{subValue}</p>
    )}
  </div>
);

/**
 * Revenue Chart - Balkendiagramm für monatliche Einnahmen
 */
const RevenueChart = ({ data, currentMonth, title }) => {
  const maxValue = Math.max(...data, 1000); // Min 1000 für Skalierung

  return (
    <div className="p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-caption text-gray-500 dark:text-gray-400">Aktueller Monat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600" />
            <span className="text-caption text-gray-500 dark:text-gray-400">Vergangene Monate</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-right pr-4 w-14">
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((val, i) => (
            <span key={i} className="text-caption text-gray-400">
              {(val / 1000).toFixed(0)}k
            </span>
          ))}
        </div>

        {/* Chart Area */}
        <div className="ml-14">
          {/* Grid Lines */}
          <div className="absolute left-14 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((_, i) => (
              <div key={i} className="border-t border-gray-100 dark:border-gray-700" />
            ))}
          </div>

          {/* Bars */}
          <div className="relative h-64 flex items-end justify-between gap-1 sm:gap-2 pb-8">
            {data.map((value, index) => {
              const heightPercent = (value / maxValue) * 100;
              const isCurrent = index === currentMonth;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex justify-center group">
                    <div
                      className={`
                        w-full max-w-8 sm:max-w-10 rounded-t-lg transition-all duration-300
                        ${isCurrent
                          ? 'bg-primary shadow-lg shadow-primary/20'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }
                      `}
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="
                      absolute -top-10 left-1/2 -translate-x-1/2
                      px-2 py-1 rounded-lg bg-gray-900 text-white text-caption
                      opacity-0 group-hover:opacity-100 transition-opacity
                      whitespace-nowrap pointer-events-none z-10
                    ">
                      {value.toLocaleString('de-DE')} €
                    </div>
                  </div>
                  <span className={`
                    text-caption font-medium
                    ${isCurrent ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}
                  `}>
                    {MONTH_NAMES[index]?.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Section Wrapper
 */
const Section = ({ title, count, icon: Icon, children }) => (
  <div className="p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700">
        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      {count > 0 && (
        <span className="ml-auto px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary">
          {count}
        </span>
      )}
    </div>
    {children}
  </div>
);

/**
 * Empty State
 */
const EmptyState = ({ text }) => (
  <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
    {text}
  </div>
);

/**
 * Action Card
 */
const ActionCard = ({ booking, onAccept, onDecline, hasConflict }) => {
  const isFix = isFixStatus(booking.status);

  return (
    <div className={`
      p-4 rounded-xl border transition-all
      ${hasConflict
        ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
      }
    `}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{booking.agencyAvatar}</span>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">{booking.projectName}</span>
            {hasConflict && <span className="text-amber-500">⚠️</span>}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{booking.agencyName}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {booking.dates.slice(0, 4).map(date => (
          <span key={date} className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
            {formatDate(date)}
          </span>
        ))}
        {booking.dates.length > 4 && (
          <span className="px-2.5 py-1 text-xs text-gray-400">+{booking.dates.length - 4}</span>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <span className="font-bold text-gray-900 dark:text-white">{booking.totalCost?.toLocaleString('de-DE')}€</span>
        <div className="flex gap-2">
          <button
            onClick={() => onDecline(booking)}
            className="px-4 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Ablehnen
          </button>
          <button
            onClick={() => onAccept(booking)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              isFix
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {isFix ? 'Fix bestätigen' : 'Bestätigen'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Reschedule Card
 */
const RescheduleCard = ({ booking, onAccept, onDecline }) => (
  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{booking.agencyAvatar}</span>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">{booking.projectName}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{booking.agencyName}</p>
      </div>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Verschiebung
      </span>
    </div>

    <div className="flex justify-between items-center pt-3 border-t border-blue-200 dark:border-blue-800">
      <span className="font-bold text-gray-900 dark:text-white">{booking.reschedule?.newTotalCost?.toLocaleString('de-DE')}€</span>
      <div className="flex gap-2">
        <button
          onClick={() => onDecline(booking)}
          className="px-4 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
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
 * Upcoming Card
 */
const UpcomingCard = ({ booking }) => {
  const today = new Date();
  const todayKey = createDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const nextDate = booking.dates.find(d => d >= todayKey) || booking.dates[0];
  const isFix = booking.status === BOOKING_STATUS.FIX_CONFIRMED;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full ${isFix ? 'bg-red-500' : 'bg-yellow-400'}`}></span>
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">{booking.projectName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{booking.agencyName}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm text-gray-900 dark:text-white">{formatDate(nextDate)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{booking.dates.length} Tag{booking.dates.length > 1 ? 'e' : ''}</p>
      </div>
    </div>
  );
};

/**
 * Mini Calendar - uses getDayStatus for consistent day coloring
 */
const MiniCalendar = ({ getDayStatus, freelancerId, year: initialYear, month: initialMonth, onViewCalendar, bookings }) => {
  const [displayMonth, setDisplayMonth] = useState(initialMonth);
  const [displayYear, setDisplayYear] = useState(initialYear);

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDay = (new Date(displayYear, displayMonth, 1).getDay() + 6) % 7;

  const goToPrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setDisplayMonth(now.getMonth());
    setDisplayYear(now.getFullYear());
  };

  // Use getDayStatus for consistent coloring with the main calendar
  // Include bookings in deps to trigger re-render when bookings change
  const dayStatuses = useMemo(() => {
    const statuses = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = createDateKey(displayYear, displayMonth, day);
      const status = getDayStatus(freelancerId, dateKey);
      statuses[day] = status.color; // getDayStatus returns { color: 'green'|'purple'|'yellow'|'red'|'striped', ... }
    }
    return statuses;
  }, [getDayStatus, freelancerId, displayYear, displayMonth, daysInMonth, bookings]);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === displayMonth && today.getFullYear() === displayYear;
  const currentDay = today.getDate();
  const monthName = new Date(displayYear, displayMonth).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

  // Map getDayStatus colors to CSS classes
  const colorClasses = {
    green: 'bg-green-500 text-white',
    purple: 'bg-purple-500 text-white',
    yellow: 'bg-yellow-400 text-gray-800',
    red: 'bg-red-500 text-white',
    striped: 'bg-[length:8px_8px] bg-[linear-gradient(135deg,#ef4444_25%,#22c55e_25%,#22c55e_50%,#ef4444_50%,#ef4444_75%,#22c55e_75%)] text-white'
  };

  return (
    <div className="p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="font-semibold text-gray-900 dark:text-white min-w-[140px] text-center">{monthName}</h3>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="text-caption text-primary hover:underline ml-2"
            >
              Heute
            </button>
          )}
        </div>
        {onViewCalendar && (
          <button onClick={onViewCalendar} className="text-caption text-primary hover:underline">
            Vollansicht <ArrowRight className="inline w-3 h-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_NAMES.map(day => (
          <div key={day} className="text-center text-caption text-gray-400 dark:text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const color = dayStatuses[day] || 'green';
          const isToday = isCurrentMonth && day === currentDay;

          return (
            <div
              key={day}
              className={`
                aspect-square flex items-center justify-center text-caption rounded-lg
                ${colorClasses[color] || colorClasses.green}
                ${isToday ? 'ring-2 ring-primary' : ''}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-caption text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500"></span>Frei</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-500"></span>Pending</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-400"></span>Option</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500"></span>Fix</span>
      </div>
    </div>
  );
};

/**
 * Helper: Working days in month
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
