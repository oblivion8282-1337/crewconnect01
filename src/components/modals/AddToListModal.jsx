import React, { useState } from 'react';
import { X, Plus, Check, Loader2 } from 'lucide-react';
import { CREW_LIST_COLORS } from '../../hooks/useProfile';

/**
 * AddToListModal - Modal zum Erstellen einer neuen Crew-Liste
 * und optionales Hinzufügen eines Freelancers
 *
 * @param {boolean} isOpen - Modal geöffnet?
 * @param {function} onClose - Schließen-Callback
 * @param {function} onCreateList - Callback zum Erstellen einer Liste
 * @param {function} onAddToList - Callback zum Hinzufügen zu einer Liste
 * @param {number} freelancerId - ID des Freelancers (optional, wenn von Freelancer-Kontext aufgerufen)
 * @param {Object} freelancer - Freelancer-Objekt für Anzeige (optional)
 */
const AddToListModal = ({
  isOpen,
  onClose,
  onCreateList,
  onAddToList,
  freelancerId = null,
  freelancer = null
}) => {
  const [listName, setListName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [addFreelancer, setAddFreelancer] = useState(!!freelancerId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!listName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newList = onCreateList(listName.trim(), selectedColor);

      if (newList && addFreelancer && freelancerId && onAddToList) {
        onAddToList(newList.id, freelancerId);
      }

      // Reset und Schließen
      setListName('');
      setSelectedColor('blue');
      setAddFreelancer(!!freelancerId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Neue Crew-Liste erstellen
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Listenname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Listenname
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="z.B. Stammteam, Kameraleute, Favoriten 2025..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Farbauswahl */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Farbe
            </label>
            <div className="flex gap-2 flex-wrap">
              {CREW_LIST_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.id)}
                  className={`w-8 h-8 rounded-full ${color.bg} flex items-center justify-center transition-transform hover:scale-110 ${
                    selectedColor === color.id ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''
                  }`}
                  title={color.name}
                  aria-label={`Farbe ${color.name} auswählen`}
                  aria-pressed={selectedColor === color.id}
                >
                  {selectedColor === color.id && (
                    <Check className="w-4 h-4 text-white" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Freelancer hinzufügen (wenn vorhanden) */}
          {freelancerId && freelancer && (
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addFreelancer}
                  onChange={(e) => setAddFreelancer(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>{freelancer.name}</strong> direkt zur Liste hinzufügen
                </span>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!listName.trim() || isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Liste erstellen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToListModal;
