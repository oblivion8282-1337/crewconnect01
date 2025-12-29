import React from 'react';
import { BOOKING_STATUS } from '../../constants/calendar';

/**
 * StatusBadge - Zeigt den Status einer Buchung als modernes Badge an
 */
const StatusBadge = ({ status, hasReschedule }) => {
  // Verschiebungsanfrage hat Vorrang
  if (hasReschedule) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        Verschiebung
      </span>
    );
  }

  // Stil und Label basierend auf Status
  const statusConfig = {
    [BOOKING_STATUS.OPTION_PENDING]: {
      style: 'bg-violet-50 text-violet-700 border-violet-100',
      dotColor: 'bg-violet-500',
      label: 'Option pending'
    },
    [BOOKING_STATUS.OPTION_CONFIRMED]: {
      style: 'bg-amber-50 text-amber-700 border-amber-100',
      dotColor: 'bg-amber-500',
      label: 'Option'
    },
    [BOOKING_STATUS.FIX_PENDING]: {
      style: 'bg-violet-50 text-violet-700 border-violet-100',
      dotColor: 'bg-violet-500 animate-pulse',
      label: 'Fix pending'
    },
    [BOOKING_STATUS.FIX_CONFIRMED]: {
      style: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      dotColor: 'bg-emerald-500',
      label: 'Fix'
    },
    [BOOKING_STATUS.DECLINED]: {
      style: 'bg-slate-50 text-slate-500 border-slate-100',
      dotColor: 'bg-slate-400',
      label: 'Abgelehnt'
    },
    [BOOKING_STATUS.WITHDRAWN]: {
      style: 'bg-slate-50 text-slate-500 border-slate-100',
      dotColor: 'bg-slate-400',
      label: 'Zurückgezogen'
    },
    [BOOKING_STATUS.CANCELLED]: {
      style: 'bg-red-50 text-red-600 border-red-100',
      dotColor: 'bg-red-500',
      label: 'Storniert'
    }
  };

  const config = statusConfig[status] || {
    style: 'bg-slate-50 text-slate-500 border-slate-100',
    dotColor: 'bg-slate-400',
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
