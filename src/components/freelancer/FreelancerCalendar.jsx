import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDate, createDateKey, getDaysInMonth, getFirstDayOfMonth } from '../../utils/dateUtils';
import { MONTH_NAMES, WEEKDAY_NAMES, DAY_STATUS_COLORS } from '../../constants/calendar';

/**
 * FreelancerCalendar - Kalenderansicht für Freelancer
 */
const FreelancerCalendar = ({
  currentDate,
  onDateChange,
  getDayStatus,
  openForMoreDays,
  onBlockDay,
  onBlockDayOpen,
  onUnblockDay,
  onToggleOpenForMore
}) => {
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month);

  const handleDayClick = (dateKey) => {
    const status = getDayStatus(null, dateKey);
    setSelectedDay({ date: dateKey, ...status });
  };

  const navigateMonth = (direction) => {
    onDateChange(new Date(year, month + direction, 1));
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kalender */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-card shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        {/* Header mit Legende */}
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kalender</h1>
          <CalendarLegend />
        </div>

        {/* Monat-Navigation */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </button>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </button>
        </div>

        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_NAMES.map(day => (
            <div key={day} className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Tage */}
        <div className="grid grid-cols-7 gap-1">
          {/* Leere Zellen vor dem ersten Tag */}
          {[...Array(firstDayOffset)].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Tage des Monats */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateKey = createDateKey(year, month, day);
            const status = getDayStatus(null, dateKey);
            const isSelected = selectedDay?.date === dateKey;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(dateKey)}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${DAY_STATUS_COLORS[status.color]} ${
                  isSelected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800' : ''
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seitenleiste mit Details */}
      <DayDetailsSidebar
        selectedDay={selectedDay}
        openForMoreDays={openForMoreDays}
        onBlockDay={onBlockDay}
        onBlockDayOpen={onBlockDayOpen}
        onUnblockDay={onUnblockDay}
        onToggleOpenForMore={onToggleOpenForMore}
      />
    </div>
  );
};

/**
 * Kalender-Legende mit allen Farben
 */
const CalendarLegend = () => (
  <div className="flex gap-2 text-xs flex-wrap text-gray-600 dark:text-gray-400">
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-emerald-500 rounded"></div>
      Frei
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-purple-500 rounded"></div>
      Pending
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-yellow-400 rounded"></div>
      Option
    </span>
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-red-500 rounded"></div>
      Fix/Blockiert
    </span>
  </div>
);

/**
 * Seitenleiste mit Tagesdetails und Aktionen
 */
const DayDetailsSidebar = ({
  selectedDay,
  openForMoreDays,
  onBlockDay,
  onBlockDayOpen,
  onUnblockDay,
  onToggleOpenForMore
}) => {
  if (!selectedDay) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Tag auswählen</p>
      </div>
    );
  }

  const { date, status, booking, bookings } = selectedDay;
  const isOpenForMore = openForMoreDays[date];

  // Status-Labels für verschiedene Zustände
  const statusLabels = {
    available: '✅ Frei',
    blocked: '🔴 Geblockt',
    'blocked-open': '🔴🟢 Geblockt (offen für Anfragen)',
    pending: '🟣 Anfrage wartet',
    'option-confirmed': '🟡 Option bestätigt',
    'fix-confirmed': '🔴 Fix gebucht',
    'fix-open': '🔴🟢 Fix (offen für mehr)'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{formatDate(date)}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {statusLabels[status] || `Status: ${status}`}
      </p>

      {/* Buchungsdetails */}
      {booking && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl mb-3 text-sm border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{booking.projectName}</p>
          <p className="text-gray-600 dark:text-gray-400">{booking.agencyName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {booking.dates?.length || 0} Tage • {booking.totalCost}€
          </p>
        </div>
      )}

      {/* Mehrere Buchungen anzeigen */}
      {bookings && bookings.length > 1 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{bookings.length} Anfragen:</p>
          {bookings.map(b => (
            <div key={b.id} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg mb-1 text-sm border border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">{b.projectName}</p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">{b.agencyName}</p>
            </div>
          ))}
        </div>
      )}

      {/* Aktionen basierend auf Status */}
      <div className="space-y-2">
        {/* Freier Tag: Blocken möglich */}
        {status === 'available' && (
          <>
            <button
              onClick={() => onBlockDay(date)}
              className="w-full py-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Blocken
            </button>
            <button
              onClick={() => onBlockDayOpen(date)}
              className="w-full py-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-xl text-sm hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
            >
              Blocken (offen für Anfragen)
            </button>
          </>
        )}

        {/* Selbst geblockt: Freigeben */}
        {status === 'blocked' && (
          <button
            onClick={() => onUnblockDay(date)}
            className="w-full py-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
          >
            Freigeben
          </button>
        )}

        {/* Geblockt + offen: Schließen oder komplett freigeben */}
        {status === 'blocked-open' && (
          <>
            <button
              onClick={() => onBlockDay(date)}
              className="w-full py-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Komplett blocken
            </button>
            <button
              onClick={() => onUnblockDay(date)}
              className="w-full py-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
            >
              Freigeben
            </button>
          </>
        )}

        {/* Fix bestätigt: Öffnen für mehr */}
        {(status === 'fix-confirmed' || status === 'fix-open') && (
          <button
            onClick={() => onToggleOpenForMore(date)}
            className={`w-full py-2.5 rounded-xl text-sm transition-colors ${
              isOpenForMore
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
            }`}
          >
            {isOpenForMore ? 'Für weitere schließen' : 'Öffnen für mehr'}
          </button>
        )}

        {/* Pending/Option: Hinweis dass erst reagiert werden muss */}
        {(status === 'pending' || status === 'option-confirmed') && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            Reagiere im Dashboard auf die Anfrage(n)
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerCalendar;
