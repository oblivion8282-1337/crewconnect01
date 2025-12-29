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
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 resize-none"
        />

        {/* Aktionen */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Stornieren
          </button>
        </div>
      </div>
    </ResizableModal>
  );
};

export default CancelBookingModal;
