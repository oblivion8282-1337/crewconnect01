import React, { useState } from 'react';
import ResizableModal from '../shared/ResizableModal';

/**
 * CancelBookingModal - Modal zum Stornieren einer Buchung
 */
const CancelBookingModal = ({ booking, onCancel, onClose }) => {
  const [reason, setReason] = useState('');

  if (!booking) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert('Bitte Grund angeben');
      return;
    }
    onCancel(booking, reason);
    onClose();
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <ResizableModal
      title="Buchung stornieren"
      subtitle={`${booking.projectName} • ${booking.dates.length} Tage`}
      onClose={handleClose}
      defaultWidth={450}
      defaultHeight={280}
      minWidth={350}
      minHeight={220}
    >
      <div className="p-4 flex flex-col flex-1">
        {/* Grund-Eingabe */}
        <textarea
          autoFocus
          value={reason}
          onChange={e => setReason(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
          placeholder="Grund für Stornierung..."
          rows={3}
          className="
            w-full p-3 border rounded-xl mb-4 flex-1 resize-none
            bg-white dark:bg-gray-900
            border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            transition-colors
          "
        />

        {/* Aktionen */}
        <div className="flex gap-3">
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
            className="
              flex-1 py-2.5 rounded-xl font-medium
              bg-red-600 text-white
              hover:bg-red-700
              transition-colors
            "
          >
            Stornieren
          </button>
        </div>
      </div>
    </ResizableModal>
  );
};

export default CancelBookingModal;
