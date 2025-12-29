import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatDate, createDateKey, getDaysInMonth, getFirstDayOfMonth } from '../../utils/dateUtils';
import { MONTH_NAMES, WEEKDAY_NAMES, DAY_STATUS_COLORS } from '../../constants/calendar';

/**
 * FreelancerCalendar - Kalenderansicht für Freelancer
 *
 * FARBEN:
 * 🟢 Grün - Verfügbar
 * 🟣 Lila - Anfrage pending (wartet auf Antwort)
 * 🟡 Gelb - Option bestätigt
 * 🔴 Rot - Fix bestätigt / blockiert
 * 🔴🟢 Gestreift - Fix bestätigt + offen für mehr
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
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
        {/* Header mit Legende */}
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Kalender</h1>
          <CalendarLegend />
        </div>

        {/* Monat-Navigation */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_NAMES.map(day => (
            <div key={day} className="text-center text-xs text-gray-500 py-1">
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
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${DAY_STATUS_COLORS[status.color]} ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
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
  <div className="flex gap-2 text-xs flex-wrap">
    <span className="flex items-center gap-1">
      <div className="w-3 h-3 bg-green-500 rounded"></div>
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
      <div className="bg-white rounded-xl shadow-lg p-4 text-center text-gray-500">
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
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="font-bold mb-2">{formatDate(date)}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {statusLabels[status] || `Status: ${status}`}
      </p>

      {/* Buchungsdetails */}
      {booking && (
        <div className="p-2 bg-gray-50 rounded mb-3 text-sm">
          <p className="font-medium">{booking.projectName}</p>
          <p className="text-gray-600">{booking.agencyName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {booking.dates?.length || 0} Tage • {booking.totalCost}€
          </p>
        </div>
      )}

      {/* Mehrere Buchungen anzeigen */}
      {bookings && bookings.length > 1 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">{bookings.length} Anfragen:</p>
          {bookings.map(b => (
            <div key={b.id} className="p-2 bg-gray-50 rounded mb-1 text-sm">
              <p className="font-medium">{b.projectName}</p>
              <p className="text-gray-600 text-xs">{b.agencyName}</p>
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
              className="w-full py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
            >
              Blocken
            </button>
            <button
              onClick={() => onBlockDayOpen(date)}
              className="w-full py-2 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200"
            >
              Blocken (offen für Anfragen)
            </button>
          </>
        )}

        {/* Selbst geblockt: Freigeben */}
        {status === 'blocked' && (
          <button
            onClick={() => onUnblockDay(date)}
            className="w-full py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
          >
            Freigeben
          </button>
        )}

        {/* Geblockt + offen: Schließen oder komplett freigeben */}
        {status === 'blocked-open' && (
          <>
            <button
              onClick={() => onBlockDay(date)}
              className="w-full py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
            >
              Komplett blocken
            </button>
            <button
              onClick={() => onUnblockDay(date)}
              className="w-full py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
            >
              Freigeben
            </button>
          </>
        )}

        {/* Fix bestätigt: Öffnen für mehr */}
        {(status === 'fix-confirmed' || status === 'fix-open') && (
          <button
            onClick={() => onToggleOpenForMore(date)}
            className={`w-full py-2 rounded text-sm ${
              isOpenForMore
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isOpenForMore ? 'Für weitere schließen' : 'Öffnen für mehr'}
          </button>
        )}

        {/* Pending/Option: Hinweis dass erst reagiert werden muss */}
        {(status === 'pending' || status === 'option-confirmed') && (
          <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
            Reagiere im Dashboard auf die Anfrage(n)
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerCalendar;
