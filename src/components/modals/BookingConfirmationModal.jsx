import React, { useState, useRef, useCallback } from 'react';
import { X, Calendar, User, Euro, FileText, MessageSquare, CheckCircle, ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react';
import { formatDateShort } from '../../utils/dateUtils';
import { ProfileAvatar } from '../shared/ProfileField';

// Vordefinierte Farben für Projekte/Phasen
const PHASE_COLORS = [
  { id: 'gray', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' },
  { id: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
  { id: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
  { id: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
  { id: 'violet', bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300' },
  { id: 'rose', bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300' },
  { id: 'cyan', bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300' },
  { id: 'orange', bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300' }
];

// Hilfsfunktion um Hex-Farbe aufzuhellen (für Hintergrund)
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
  const [daysExpanded, setDaysExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Drag handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('textarea') || e.target.closest('input')) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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

  // Projekt-Farbe berechnen
  const isProjectCustomColor = project?.color?.startsWith('#');
  const projectColorDef = isProjectCustomColor
    ? null
    : (PHASE_COLORS.find(c => c.id === project?.color) || PHASE_COLORS[1]); // Default: blue

  const projectBgStyle = isProjectCustomColor ? {
    backgroundColor: hexToRgba(project.color, 0.15)
  } : {};

  const projectBgClass = isProjectCustomColor
    ? ''
    : projectColorDef.bg;

  const projectTextStyle = isProjectCustomColor ? {
    color: project.color
  } : {};

  const projectTextClass = isProjectCustomColor
    ? 'font-medium'
    : `font-medium ${projectColorDef.text}`;

  // Phase-Farbe berechnen
  const isPhaseCustomColor = phase?.color?.startsWith('#');
  const phaseColorDef = isPhaseCustomColor
    ? null
    : (PHASE_COLORS.find(c => c.id === phase?.color) || PHASE_COLORS[0]); // Default: gray

  const phaseBgStyle = isPhaseCustomColor ? {
    backgroundColor: hexToRgba(phase.color, 0.15)
  } : {};

  const phaseBgClass = isPhaseCustomColor
    ? ''
    : phaseColorDef.bg;

  const phaseTextStyle = isPhaseCustomColor ? {
    color: phase.color
  } : {};

  const phaseTextClass = isPhaseCustomColor
    ? 'font-medium'
    : `font-medium ${phaseColorDef.text}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        ref={dragRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* Header - Draggable */}
        <div
          className={`p-6 ${isOption ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'} cursor-grab active:cursor-grabbing`}
          onMouseDown={handleMouseDown}
        >
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
            <div className="flex items-center gap-1">
              <GripHorizontal className="w-5 h-5 text-gray-400" />
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Freelancer */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <ProfileAvatar
              imageUrl={freelancer.profileImage}
              firstName={freelancer.firstName}
              lastName={freelancer.lastName}
              size="md"
            />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{fullName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(freelancer.professions || []).join(', ')}
              </p>
            </div>
          </div>

          {/* Projekt & Phase */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3 rounded-lg ${projectBgClass}`}
              style={projectBgStyle}
            >
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium">Projekt</span>
              </div>
              <p className={projectTextClass} style={projectTextStyle}>{project.name}</p>
            </div>
            <div
              className={`p-3 rounded-lg ${phaseBgClass}`}
              style={phaseBgStyle}
            >
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Phase</span>
              </div>
              <p className={phaseTextClass} style={phaseTextStyle}>{phase.name}</p>
            </div>
          </div>

          {/* Zeitraum & Tage */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Zeitraum</span>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">{formatDateRange()}</p>
            <button
              onClick={() => setDaysExpanded(!daysExpanded)}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1"
            >
              <span>{selectedDays.length} Tag{selectedDays.length !== 1 ? 'e' : ''} ausgewählt</span>
              {daysExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {daysExpanded && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {sortedDays.map(day => {
                    const date = new Date(day);
                    const weekday = date.toLocaleDateString('de-DE', { weekday: 'short' });
                    return (
                      <span
                        key={day}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md"
                      >
                        {weekday}, {formatDateShort(day)}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
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
