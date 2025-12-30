import React from 'react';
import { FileText, Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

/**
 * BookingRefMessage - Buchungs-Referenz Nachricht
 */
const BookingRefMessage = ({
  message,
  isOwn,
  onOpenBooking
}) => {
  const { bookingRef } = message;

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateRange = () => {
    const dates = bookingRef.dates;
    if (!dates || dates.length === 0) return 'Kein Datum';
    if (dates.length === 1) return formatDate(dates[0]);
    return `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`;
  };

  const getStatusConfig = () => {
    switch (bookingRef.status) {
      case 'pending':
      case 'option_pending':
        return { label: 'Ausstehend', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' };
      case 'confirmed':
      case 'option_confirmed':
        return { label: 'Option bestätigt', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
      case 'fix_pending':
        return { label: 'Fix ausstehend', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' };
      case 'fix_confirmed':
        return { label: 'Fix bestätigt', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
      case 'declined':
        return { label: 'Abgelehnt', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
      case 'cancelled':
        return { label: 'Storniert', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' };
      default:
        return { label: bookingRef.status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[85%] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              {bookingRef.type === 'fix' ? 'Buchung (Fix)' : 'Buchungsanfrage'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Projekt */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Projekt</p>
            <p className="font-medium text-gray-900 dark:text-white">{bookingRef.projectName}</p>
          </div>

          {/* Zeitraum */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{formatDateRange()}</span>
            {bookingRef.dates && (
              <span className="text-gray-500">
                ({bookingRef.dates.length} {bookingRef.dates.length === 1 ? 'Tag' : 'Tage'})
              </span>
            )}
          </div>

          {/* Status & Typ */}
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              bookingRef.type === 'fix'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {bookingRef.type === 'fix' ? 'Fix' : 'Option'}
            </span>
          </div>

          {/* Nachrichtentext */}
          {message.text && (
            <>
              <hr className="border-gray-200 dark:border-gray-700" />
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {message.text}
              </p>
            </>
          )}

          {/* Zur Buchung Button */}
          <button
            onClick={() => onOpenBooking?.(bookingRef.bookingId)}
            className="w-full py-2 flex items-center justify-center gap-2 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Zur Buchung
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer mit Zeitstempel */}
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 text-right">
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingRefMessage;
