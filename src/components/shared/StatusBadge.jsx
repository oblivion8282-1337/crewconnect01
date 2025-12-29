import React from 'react';
import { BOOKING_STATUS } from '../../constants/calendar';

/**
 * StatusBadge - Zeigt den Status einer Buchung als modernes Badge an
 */
const StatusBadge = ({ status, hasReschedule }) => {
  // Verschiebungsanfrage hat Vorrang
  if (hasReschedule) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Verschiebung
      </span>
    );
  }

  // Stil und Label basierend auf Status
  const statusConfig = {
    [BOOKING_STATUS.OPTION_PENDING]: {
      style: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-800',
      dotColor: 'bg-violet-500',
      label: 'Option pending'
    },
    [BOOKING_STATUS.OPTION_CONFIRMED]: {
      style: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800',
      dotColor: 'bg-amber-500',
      label: 'Option'
    },
    [BOOKING_STATUS.FIX_PENDING]: {
      style: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-800',
      dotColor: 'bg-violet-500 animate-pulse',
      label: 'Fix pending'
    },
    [BOOKING_STATUS.FIX_CONFIRMED]: {
      style: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800',
      dotColor: 'bg-emerald-500',
      label: 'Fix'
    },
    [BOOKING_STATUS.DECLINED]: {
      style: 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700',
      dotColor: 'bg-gray-400 dark:bg-gray-500',
      label: 'Abgelehnt'
    },
    [BOOKING_STATUS.WITHDRAWN]: {
      style: 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700',
      dotColor: 'bg-gray-400 dark:bg-gray-500',
      label: 'Zurückgezogen'
    },
    [BOOKING_STATUS.CANCELLED]: {
      style: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800',
      dotColor: 'bg-red-500',
      label: 'Storniert'
    }
  };

  const config = statusConfig[status] || {
    style: 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700',
    dotColor: 'bg-gray-400 dark:bg-gray-500',
    label: status
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
