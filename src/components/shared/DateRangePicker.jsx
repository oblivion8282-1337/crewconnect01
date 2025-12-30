import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

/**
 * DateRangePicker - Zweispaltiger Kalender zur Auswahl eines Zeitraums
 * Mit Dark Mode Unterstützung
 */
const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const today = new Date();
  const [leftMonth, setLeftMonth] = useState(
    startDate ? new Date(startDate) : new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const rightMonth = new Date(leftMonth.getFullYear(), leftMonth.getMonth() + 1, 1);

  const [selecting, setSelecting] = useState(null); // 'start' | 'end' | null
  const [hoverDate, setHoverDate] = useState(null);
  const [miniCalendar, setMiniCalendar] = useState(null); // 'start' | 'end' | null
  const [miniMonth, setMiniMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const miniCalendarRef = useRef(null);

  // Click outside handler für Mini-Kalender
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (miniCalendarRef.current && !miniCalendarRef.current.contains(e.target)) {
        setMiniCalendar(null);
      }
    };
    if (miniCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [miniCalendar]);

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  const shortMonthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // Leere Tage am Anfang (Montag = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Tage des Monats
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDateString = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr);
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const handleDayClick = (day) => {
    if (!day) return;

    const dateStr = formatDateString(day);

    if (!selecting) {
      // Ersten Klick - Start setzen
      onChange({ startDate: dateStr, endDate: '' });
      setSelecting('end');
    } else if (selecting === 'end') {
      // Zweiten Klick - Ende setzen
      if (start && day < start) {
        // Wenn vor Start, dann Start neu setzen
        onChange({ startDate: dateStr, endDate: '' });
      } else {
        onChange({ startDate: startDate, endDate: dateStr });
        setSelecting(null);
      }
    }
  };

  const isInRange = (day) => {
    if (!day || !start) return false;

    const checkEnd = selecting === 'end' && hoverDate ? hoverDate : end;
    if (!checkEnd) return false;

    return day >= start && day <= checkEnd;
  };

  const isStart = (day) => {
    if (!day || !start) return false;
    return day.toDateString() === start.toDateString();
  };

  const isEnd = (day) => {
    if (!day || !end) return false;
    return day.toDateString() === end.toDateString();
  };

  const isToday = (day) => {
    if (!day) return false;
    return day.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction) => {
    setLeftMonth(new Date(leftMonth.getFullYear(), leftMonth.getMonth() + direction, 1));
  };

  const navigateMiniMonth = (direction) => {
    setMiniMonth(new Date(miniMonth.getFullYear(), miniMonth.getMonth() + direction, 1));
  };

  const handleMiniCalendarOpen = (type) => {
    if (type === 'start' && startDate) {
      setMiniMonth(new Date(startDate));
    } else if (type === 'end' && endDate) {
      setMiniMonth(new Date(endDate));
    } else {
      setMiniMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    }
    setMiniCalendar(type);
  };

  const handleMiniCalendarSelect = (day) => {
    if (!day) return;
    const dateStr = formatDateString(day);

    if (miniCalendar === 'start') {
      // Wenn neues Startdatum nach Enddatum liegt, Enddatum zurücksetzen
      if (endDate && day > parseDate(endDate)) {
        onChange({ startDate: dateStr, endDate: '' });
      } else {
        onChange({ startDate: dateStr, endDate });
      }
    } else if (miniCalendar === 'end') {
      // Wenn neues Enddatum vor Startdatum liegt, als neues Startdatum setzen
      if (startDate && day < parseDate(startDate)) {
        onChange({ startDate: dateStr, endDate: '' });
      } else {
        onChange({ startDate, endDate: dateStr });
      }
    }
    setMiniCalendar(null);
  };

  const renderMiniCalendar = () => {
    const days = getDaysInMonth(miniMonth);
    const selectedDate = miniCalendar === 'start' ? start : end;

    return (
      <div
        ref={miniCalendarRef}
        className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-10 w-64"
      >
        {/* Navigation */}
        <div className="flex justify-between items-center mb-2">
          <button
            type="button"
            onClick={() => navigateMiniMonth(-1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {shortMonthNames[miniMonth.getMonth()]} {miniMonth.getFullYear()}
          </span>
          <button
            type="button"
            onClick={() => navigateMiniMonth(1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Nächster Monat"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          </button>
        </div>

        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-gray-400 dark:text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Tage */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-7" />;
            }

            const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
            const isTodayDay = day.toDateString() === today.toDateString();

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleMiniCalendarSelect(day)}
                className={`
                  h-7 text-xs rounded transition-colors
                  ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'}
                  ${!isSelected && isTodayDay ? 'font-bold text-blue-600 dark:text-blue-400' : ''}
                  ${!isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonth = (monthDate) => {
    const days = getDaysInMonth(monthDate);

    return (
      <div className="flex-1">
        <div className="text-center font-medium mb-3 text-gray-700 dark:text-gray-300">
          {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
        </div>

        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-gray-400 dark:text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Tage */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }

            const inRange = isInRange(day);
            const isStartDay = isStart(day);
            const isEndDay = isEnd(day);
            const isTodayDay = isToday(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => selecting === 'end' && setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                className={`
                  h-8 text-sm rounded transition-colors relative
                  ${inRange && !isStartDay && !isEndDay ? 'bg-blue-100 dark:bg-blue-900/40 text-gray-700 dark:text-gray-300' : ''}
                  ${isStartDay ? 'bg-blue-600 text-white rounded-l-full' : ''}
                  ${isEndDay ? 'bg-blue-600 text-white rounded-r-full' : ''}
                  ${isStartDay && isEndDay ? 'rounded-full' : ''}
                  ${!inRange && !isStartDay && !isEndDay ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' : ''}
                  ${isTodayDay && !isStartDay && !isEndDay ? 'font-bold text-blue-600 dark:text-blue-400' : ''}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.getDate()}. ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
      {/* Ausgewählter Zeitraum */}
      <div className="flex gap-4 mb-4">
        {/* Start-Feld */}
        <div className="flex-1 relative">
          <div
            className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
              miniCalendar === 'start'
                ? 'border-blue-500 bg-white dark:bg-gray-800 ring-2 ring-blue-200 dark:ring-blue-800'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onClick={() => handleMiniCalendarOpen('start')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start</div>
                <div className="font-medium text-gray-900 dark:text-white">{formatDisplayDate(startDate)}</div>
              </div>
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          {miniCalendar === 'start' && renderMiniCalendar()}
        </div>

        {/* Ende-Feld */}
        <div className="flex-1 relative">
          <div
            className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
              miniCalendar === 'end'
                ? 'border-blue-500 bg-white dark:bg-gray-800 ring-2 ring-blue-200 dark:ring-blue-800'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onClick={() => handleMiniCalendarOpen('end')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ende</div>
                <div className="font-medium text-gray-900 dark:text-white">{formatDisplayDate(endDate)}</div>
              </div>
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          {miniCalendar === 'end' && renderMiniCalendar()}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Vorherige Monate"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Nächste Monate"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
        </button>
      </div>

      {/* Zwei Monate nebeneinander */}
      <div className="flex gap-6">
        {renderMonth(leftMonth)}
        {renderMonth(rightMonth)}
      </div>

      {/* Hinweis */}
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
        {selecting === 'end'
          ? 'Klicke auf das Enddatum im Kalender'
          : 'Klicke auf Start/Ende oben oder wähle direkt im Kalender'}
      </p>
    </div>
  );
};

export default DateRangePicker;
