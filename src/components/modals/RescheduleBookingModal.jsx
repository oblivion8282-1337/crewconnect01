import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (isSelected) return 'bg-primary text-primary-foreground ring-2 ring-primary/30';
    if (isOriginal) return 'bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
    if (status.color === 'green') return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50';
    if (status.color === 'yellow') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-500 cursor-not-allowed';
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

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      onReschedule(booking, selectedDates);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Aktuelle Termine:</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {booking.dates.map(date => (
              <span
                key={date}
                className="px-2 py-1 bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-lg text-xs"
              >
                {formatDate(date)}
              </span>
            ))}
          </div>
        </div>

        {/* Neue Termine (wenn ausgewählt) */}
        {selectedDates.length > 0 && (
          <div className="mb-4 p-3 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Neue Termine:</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedDates.map(date => (
                <span
                  key={date}
                  className="px-2 py-1 bg-primary text-primary-foreground rounded-lg text-xs"
                >
                  {formatDate(date)}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {selectedDates.length} Tage • {booking.dayRate * selectedDates.length}€
            </p>
          </div>
        )}

        {/* Kalender */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          {/* Monat-Navigation */}
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Vorheriger Monat"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
            </button>
            <span className="font-medium text-sm text-gray-900 dark:text-white">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Nächster Monat"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
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
              const status = getDayStatus(booking.freelancerId, dateKey, agencyId, booking.id);
              const isClickable = status.bookable || status.status === 'available';

              return (
                <button
                  key={day}
                  onClick={() => isClickable && toggleDate(dateKey)}
                  disabled={!isClickable}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${getDateColor(dateKey)}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legende */}
          <div className="flex gap-3 mt-4 text-xs text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-100 dark:bg-emerald-900/30 rounded"></div>
              Verfügbar
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-200 dark:bg-blue-900/50 rounded"></div>
              Aktuell
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-primary rounded"></div>
              Neu
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
        <button
          onClick={handleClose}
          className="
            flex-1 py-2.5 rounded-xl font-medium
            border border-gray-300 dark:border-gray-600
            text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors
          "
        >
          Abbrechen
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`
            flex-1 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2
            ${canSubmit && !isSubmitting
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Wird gesendet...
            </>
          ) : (
            'Verschiebung anfragen'
          )}
        </button>
      </div>
    </ResizableModal>
  );
};

export default RescheduleBookingModal;
