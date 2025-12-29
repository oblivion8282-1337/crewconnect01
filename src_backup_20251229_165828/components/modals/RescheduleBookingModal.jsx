import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, createDateKey, getDaysInMonth, getFirstDayOfMonth } from '../../utils/dateUtils';
import { MONTH_NAMES, WEEKDAY_NAMES } from '../../constants/calendar';
import ResizableModal from '../shared/ResizableModal';

/**
 * RescheduleBookingModal - Modal zum Verschieben einer Buchung
 */
const RescheduleBookingModal = ({
  booking,
  getDayStatus,
  agencyId,
  onReschedule,
  onClose
}) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2025, 0, 1));

  if (!booking) return null;

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month);

  /**
   * Toggle-Auswahl eines Datums
   */
  const toggleDate = (date) => {
    const status = getDayStatus(booking.freelancerId, date, agencyId, booking.id);
    if (!status.bookable && status.status !== 'available') return;

    setSelectedDates(prev =>
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date].sort()
    );
  };

  /**
   * Ermittelt die Farbe für ein Datum im Kalender
   */
  const getDateColor = (date) => {
    const isSelected = selectedDates.includes(date);
    const isOriginal = booking.dates.includes(date);
    const status = getDayStatus(booking.freelancerId, date, agencyId, booking.id);

    if (isSelected) return 'bg-purple-500 text-white ring-2 ring-purple-300';
    if (isOriginal) return 'bg-blue-200 text-blue-800';
    if (status.color === 'green') return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (status.color === 'yellow') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-400 cursor-not-allowed';
  };

  /**
   * Navigiert zum vorherigen Monat
   */
  const goToPreviousMonth = () => {
    setCalendarMonth(new Date(year, month - 1, 1));
  };

  /**
   * Navigiert zum nächsten Monat
   */
  const goToNextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  const canSubmit = selectedDates.length > 0 &&
    JSON.stringify(selectedDates) !== JSON.stringify(booking.dates);

  const handleSubmit = () => {
    onReschedule(booking, selectedDates);
    onClose();
  };

  const handleClose = () => {
    setSelectedDates([]);
    onClose();
  };

  return (
    <ResizableModal
      title="Buchung verschieben"
      subtitle={`${booking.projectName} • ${booking.freelancerName}`}
      onClose={handleClose}
      defaultWidth={500}
      defaultHeight={600}
      minWidth={400}
      minHeight={450}
    >
      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1">
          {/* Aktuelle Termine */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Aktuelle Termine:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {booking.dates.map(date => (
                <span
                  key={date}
                  className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                >
                  {formatDate(date)}
                </span>
              ))}
            </div>
          </div>

          {/* Neue Termine (wenn ausgewählt) */}
          {selectedDates.length > 0 && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-800">Neue Termine:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedDates.map(date => (
                  <span
                    key={date}
                    className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs"
                  >
                    {formatDate(date)}
                  </span>
                ))}
              </div>
              <p className="text-sm text-purple-700 mt-2">
                {selectedDates.length} Tage • {booking.dayRate * selectedDates.length}€
              </p>
            </div>
          )}

          {/* Kalender */}
          <div className="bg-gray-50 rounded-lg p-4">
            {/* Monat-Navigation */}
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={goToPreviousMonth}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-sm">
                {MONTH_NAMES[month]} {year}
              </span>
              <button
                onClick={goToNextMonth}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronRight className="w-4 h-4" />
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
                const status = getDayStatus(booking.freelancerId, dateKey, agencyId, booking.id);
                const isClickable = status.bookable || status.status === 'available';

                return (
                  <button
                    key={day}
                    onClick={() => isClickable && toggleDate(dateKey)}
                    disabled={!isClickable}
                    className={`aspect-square rounded flex items-center justify-center text-xs font-medium transition-all ${getDateColor(dateKey)}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Legende */}
            <div className="flex gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                Verfügbar
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                Aktuell
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                Neu
              </span>
            </div>
          </div>
        </div>

      {/* Footer */}
      <div className="p-4 border-t flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`flex-1 py-2 rounded-lg ${
            canSubmit
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          Verschiebung anfragen
        </button>
      </div>
    </ResizableModal>
  );
};

export default RescheduleBookingModal;
