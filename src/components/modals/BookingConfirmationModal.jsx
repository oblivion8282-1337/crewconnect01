import React, { useState } from 'react';
import { X, Calendar, User, Euro, FileText, MessageSquare, CheckCircle } from 'lucide-react';
import { formatDateShort } from '../../utils/dateUtils';

/**
 * BookingConfirmationModal - Bestätigung vor einer Buchung mit Zusammenfassung und Nachrichtenfeld
 */
const BookingConfirmationModal = ({
  freelancer,
  selectedDays,
  bookingType,
  project,
  phase,
  rateInfo,
  onConfirm,
  onCancel
}) => {
  const [message, setMessage] = useState('');

  const fullName = `${freelancer.firstName} ${freelancer.lastName}`;
  const sortedDays = [...selectedDays].sort();
  const firstDay = sortedDays[0];
  const lastDay = sortedDays[sortedDays.length - 1];

  const isOption = bookingType === 'option';

  const handleConfirm = () => {
    onConfirm({ ...rateInfo, message: message.trim() || null });
  };

  // Gruppiere Tage für bessere Anzeige
  const formatDateRange = () => {
    if (sortedDays.length === 1) {
      return formatDateShort(sortedDays[0]);
    }
    return `${formatDateShort(firstDay)} – ${formatDateShort(lastDay)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${isOption ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isOption ? 'bg-yellow-100 dark:bg-yellow-900/40' : 'bg-green-100 dark:bg-green-900/40'
              }`}>
                <CheckCircle className={`w-6 h-6 ${
                  isOption ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isOption ? 'Option anfragen' : 'Fix buchen'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bitte überprüfe die Details
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Freelancer */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span className="text-3xl">{freelancer.avatar}</span>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{fullName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(freelancer.professions || []).join(', ')}
              </p>
            </div>
          </div>

          {/* Projekt & Phase */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium">Projekt</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Phase</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{phase.name}</p>
            </div>
          </div>

          {/* Zeitraum & Tage */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Zeitraum</span>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">{formatDateRange()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {selectedDays.length} Tag{selectedDays.length !== 1 ? 'e' : ''} ausgewählt
            </p>
          </div>

          {/* Kosten */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Euro className="w-4 h-4" />
              <span className="text-xs font-medium">Kosten</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {rateInfo.totalCost.toLocaleString('de-DE')}€
              </span>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {rateInfo.rateType === 'daily'
                  ? `(${rateInfo.dayRate}€ × ${selectedDays.length} Tage)`
                  : '(Pauschal)'}
              </span>
            </div>
          </div>

          {/* Persönliche Nachricht */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageSquare className="w-4 h-4" />
              Persönliche Nachricht <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Füge eine Nachricht für den Freelancer hinzu..."
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Diese Nachricht erscheint in der Buchungsanfrage des Freelancers
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
              isOption
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isOption ? 'Option anfragen' : 'Fix buchen'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
