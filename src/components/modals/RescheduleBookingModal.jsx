import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, RotateCcw, Minus, Plus, Calendar, User } from 'lucide-react';
import { formatDate, createDateKey, getDateRange, parseLocalDate } from '../../utils/dateUtils';
import ResizableModal from '../shared/ResizableModal';
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
 * RescheduleBookingModal - Modal zum Verschieben einer Buchung
 *
 * Verwendet das gleiche intuitive Kalender-Design wie FreelancerSearchModal:
 * - Monats-gruppierte Tage-Grids
 * - Klickbare Tag-Buttons mit Farbcodierung
 * - Shift-Klick für Bereichsauswahl
 * - Klare visuelle Unterscheidung: Original (Geister) vs. Neu
 */
const RescheduleBookingModal = ({
  booking,
  projects,
  getDayStatus,
  agencyId,
  onReschedule,
  onClose
}) => {
  // Initialisiere mit Original-Daten
  const [selectedDates, setSelectedDates] = useState(() =>
    booking ? [...booking.dates].sort() : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastClickedIndex, setLastClickedIndex] = useState(null);

  // Reset selectedDates wenn sich booking ändert (Modal neu geöffnet)
  useEffect(() => {
    if (booking?.dates) {
      setSelectedDates([...booking.dates].sort());
      setLastClickedIndex(null);
    }
  }, [booking?.id]);

  // Original-Tage als Set für schnellen Lookup
  const originalDatesSet = useMemo(() => booking ? new Set(booking.dates) : new Set(), [booking?.dates]);

  // Berechne den Datumsbereich für die Anzeige (Original + 30 Tage davor/danach)
  const dateRangeForDisplay = useMemo(() => {
    if (!booking?.dates?.length) return [];

    const sortedOriginal = [...booking.dates].sort();
    const firstDate = parseLocalDate(sortedOriginal[0]);
    const lastDate = parseLocalDate(sortedOriginal[sortedOriginal.length - 1]);

    // Erweitere den Bereich um 30 Tage vor und nach
    const startDate = new Date(firstDate);
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date(lastDate);
    endDate.setDate(endDate.getDate() + 60);

    return getDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }, [booking?.dates]);

  // Berechne Verfügbarkeit für jeden Tag
  const daysWithStatus = useMemo(() => {
    if (!booking) return [];

    return dateRangeForDisplay.map((dateStr, index) => {
      const date = parseLocalDate(dateStr);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isOriginal = originalDatesSet.has(dateStr);
      const status = getDayStatus(booking.freelancerId, dateStr, agencyId, booking.id);

      // Ein Tag ist buchbar wenn: original ODER (verfügbar UND nicht blockiert UND nicht gelb/pending)
      const isAvailable = isOriginal || (!status.isBlocked && !status.hasBooking && status.color !== 'yellow');

      return {
        dateStr,
        date,
        isWeekend,
        isOriginal,
        isAvailable,
        status,
        index
      };
    });
  }, [dateRangeForDisplay, originalDatesSet, getDayStatus, booking, agencyId]);

  // Gruppiere Tage nach Monat
  const monthGroups = useMemo(() => {
    const groups = {};
    daysWithStatus.forEach(day => {
      const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`;
      if (!groups[monthKey]) {
        groups[monthKey] = {
          year: day.date.getFullYear(),
          month: day.date.getMonth(),
          days: []
        };
      }
      groups[monthKey].days.push(day);
    });
    return groups;
  }, [daysWithStatus]);

  // Berechne Änderungen
  const changes = useMemo(() => {
    if (!booking?.dates) return { removed: [], added: [], kept: [] };

    const selectedSet = new Set(selectedDates);
    const removed = booking.dates.filter(d => !selectedSet.has(d));
    const added = selectedDates.filter(d => !originalDatesSet.has(d));
    const kept = selectedDates.filter(d => originalDatesSet.has(d));

    return { removed, added, kept };
  }, [selectedDates, booking?.dates, originalDatesSet]);

  const hasChanges = changes.removed.length > 0 || changes.added.length > 0;

  /**
   * Tag anklicken (mit Shift-Support für Bereichsauswahl)
   */
  const handleDayClick = useCallback((day, shiftKey) => {
    if (!day.isAvailable && !day.isOriginal) return;

    if (shiftKey && lastClickedIndex !== null) {
      // Shift-Klick: Bereich auswählen
      const start = Math.min(lastClickedIndex, day.index);
      const end = Math.max(lastClickedIndex, day.index);

      const newDates = new Set(selectedDates);
      for (let i = start; i <= end; i++) {
        const d = daysWithStatus[i];
        if (d && (d.isAvailable || d.isOriginal)) {
          newDates.add(d.dateStr);
        }
      }
      setSelectedDates([...newDates].sort());
      setLastClickedIndex(day.index);
    } else {
      // Normaler Klick: Toggle
      if (selectedDates.includes(day.dateStr)) {
        setSelectedDates(selectedDates.filter(d => d !== day.dateStr));
      } else {
        setSelectedDates([...selectedDates, day.dateStr].sort());
      }
      setLastClickedIndex(day.index);
    }
  }, [selectedDates, lastClickedIndex, daysWithStatus]);

  // Early return nach allen Hooks
  if (!booking) return null;

  /**
   * Alle Original-Tage wiederherstellen
   */
  const resetToOriginal = () => {
    setSelectedDates([...booking.dates].sort());
    setLastClickedIndex(null);
  };

  /**
   * Alle Tage abwählen
   */
  const clearAll = () => {
    setSelectedDates([]);
    setLastClickedIndex(null);
  };

  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  const canSubmit = selectedDates.length > 0 && hasChanges;

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

  /**
   * Ermittelt die Darstellung für einen Tag
   */
  const getDayStyle = (day) => {
    const isSelected = selectedDates.includes(day.dateStr);
    const isOriginal = day.isOriginal;
    const statusColor = day.status?.color;

    // Ausgewählt
    if (isSelected) {
      if (isOriginal) {
        // Beibehalten (Original + ausgewählt) = Blau
        return 'bg-blue-500 text-white ring-2 ring-blue-300 dark:ring-blue-600';
      } else {
        // Neu hinzugefügt = Grün
        return 'bg-emerald-500 text-white ring-2 ring-emerald-300 dark:ring-emerald-600';
      }
    }

    // Nicht ausgewählt
    if (isOriginal) {
      // Entfernt (Original aber nicht mehr ausgewählt) = Rot gestreift/Geister
      return 'bg-red-200 dark:bg-red-900/50 text-red-600 dark:text-red-400 border-2 border-dashed border-red-400 dark:border-red-600 line-through';
    }

    // Wochenende
    if (day.isWeekend) {
      return 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500';
    }

    // Verfügbar (klickbar)
    if (day.isAvailable) {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 cursor-pointer';
    }

    // Gelb (pending von anderen) - nicht klickbar
    if (statusColor === 'yellow') {
      return 'bg-yellow-400 text-yellow-900';
    }

    // Blockiert/Gebucht - nicht klickbar
    return 'bg-red-100 dark:bg-red-900/30 text-red-300 dark:text-red-600';
  };

  // Projekt und Phase aus der projects-Liste finden
  const project = projects?.find(p => p.id === booking.projectId);
  const phase = project?.phases?.find(ph => ph.id === booking.phaseId);

  // Projekt-Farbe berechnen
  const isProjectCustomColor = project?.color?.startsWith('#');
  const projectColorDef = isProjectCustomColor
    ? null
    : (PHASE_COLORS.find(c => c.id === project?.color) || PHASE_COLORS[1]); // Default: blue

  const projectBadgeStyle = isProjectCustomColor ? {
    backgroundColor: hexToRgba(project.color, 0.2),
    color: project.color
  } : {};

  const projectBadgeClass = isProjectCustomColor
    ? ''
    : `${projectColorDef.bg} ${projectColorDef.text}`;

  // Phase-Farbe berechnen
  const isPhaseCustomColor = phase?.color?.startsWith('#');
  const phaseColorDef = isPhaseCustomColor
    ? null
    : (PHASE_COLORS.find(c => c.id === phase?.color) || PHASE_COLORS[0]); // Default: gray

  const phaseBadgeStyle = isPhaseCustomColor ? {
    backgroundColor: hexToRgba(phase.color, 0.2),
    color: phase.color
  } : {};

  const phaseBadgeClass = isPhaseCustomColor
    ? ''
    : `${phaseColorDef.bg} ${phaseColorDef.text}`;

  // Custom Subtitle wie in FreelancerSearchModal
  const customSubtitle = (
    <div className="flex items-center gap-2">
      <span
        className={`px-2 py-0.5 rounded font-medium text-sm ${projectBadgeClass}`}
        style={projectBadgeStyle}
      >
        {booking.projectName}
      </span>
      <span className="text-gray-400 dark:text-gray-500">→</span>
      <span
        className={`px-2 py-0.5 rounded font-medium text-sm ${phaseBadgeClass}`}
        style={phaseBadgeStyle}
      >
        {booking.phaseName || 'Phase'}
      </span>
      <span className="text-gray-400 dark:text-gray-500">•</span>
      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
        <ProfileAvatar name={booking.freelancerName} size="xs" />
        <span className="text-sm text-gray-700 dark:text-gray-300">{booking.freelancerName}</span>
      </div>
    </div>
  );

  return (
    <ResizableModal
      title="Buchung verschieben"
      subtitle={customSubtitle}
      onClose={handleClose}
      defaultWidth={1100}
      defaultHeight={750}
      minWidth={800}
      minHeight={500}
    >
      {/* Content */}
      <div className="p-6 overflow-y-auto flex-1 space-y-5">

        {/* Original-Buchung Zusammenfassung */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Ursprüngliche Buchung
              </p>
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {formatDate(booking.dates[0])} – {formatDate(booking.dates[booking.dates.length - 1])}
                <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                  ({booking.dates.length} Tage)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Kalender mit Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          {/* Header mit Buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3">
              <button
                onClick={resetToOriginal}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors border border-blue-200 dark:border-blue-800"
              >
                <RotateCcw className="w-4 h-4" />
                Original wiederherstellen
              </button>
              <button
                onClick={clearAll}
                disabled={selectedDates.length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-red-200 dark:border-red-800"
              >
                <Minus className="w-4 h-4" />
                Alle abwählen
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800">
              <span className="text-xs font-bold bg-amber-200 dark:bg-amber-800 px-1.5 py-0.5 rounded">SHIFT</span>
              <span className="text-sm">+ Klick für Bereichsauswahl</span>
            </div>
          </div>

          {/* Kalender-Grid nach Monaten */}
          <div className="flex flex-wrap gap-8">
            {Object.values(monthGroups).map(group => (
              <div key={`${group.year}-${group.month}`} className="flex-shrink-0">
                <div className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {monthNames[group.month]} {group.year}
                </div>
                <div className="grid grid-cols-7 gap-1.5" style={{ width: '280px' }}>
                  {/* Wochentag-Header */}
                  {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(wd => (
                    <div key={wd} className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium py-1">
                      {wd}
                    </div>
                  ))}
                  {/* Leere Zellen vor dem ersten Tag */}
                  {(() => {
                    const firstDay = group.days[0]?.date;
                    if (!firstDay) return null;
                    // Montag = 0, Sonntag = 6 (angepasst von JS wo Sonntag = 0)
                    const dayOfWeek = (firstDay.getDay() + 6) % 7;
                    return [...Array(dayOfWeek)].map((_, i) => (
                      <div key={`empty-${i}`} className="w-9 h-9" />
                    ));
                  })()}
                  {/* Tage */}
                  {group.days.map(day => {
                    const isClickable = day.isAvailable || day.isOriginal;

                    return (
                      <div
                        key={day.dateStr}
                        onClick={(e) => isClickable && handleDayClick(day, e.shiftKey)}
                        title={`${day.date.getDate()}. ${monthNames[day.date.getMonth()]} ${day.date.getFullYear()}`}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all flex items-center justify-center select-none ${getDayStyle(day)}`}
                      >
                        {day.date.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legende */}
          <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-lg"></div>
              Beibehalten
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 bg-emerald-500 rounded-lg"></div>
              Neu
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-200 dark:bg-red-900/50 rounded-lg border-2 border-dashed border-red-400"></div>
              Entfernt
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"></div>
              Verfügbar
            </span>
          </div>
        </div>

        {/* Änderungs-Übersicht */}
        {hasChanges && (
          <div className="grid grid-cols-2 gap-3">
            {/* Entfernte Tage */}
            {changes.removed.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                  <Minus className="w-3.5 h-3.5" />
                  Entfernt ({changes.removed.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {changes.removed.map(date => (
                    <span
                      key={date}
                      className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded text-xs line-through"
                    >
                      {formatDate(date)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hinzugefügte Tage */}
            {changes.added.length > 0 && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  Hinzugefügt ({changes.added.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {changes.added.map(date => (
                    <span
                      key={date}
                      className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded text-xs"
                    >
                      {formatDate(date)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Neue Buchung Zusammenfassung */}
        <div className={`p-3 rounded-xl border ${
          hasChanges
            ? 'bg-primary/10 border-primary/20'
            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                {hasChanges ? 'Neue Buchung' : 'Aktuelle Auswahl'}
              </p>
              {selectedDates.length > 0 ? (
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {formatDate(selectedDates[0])} – {formatDate(selectedDates[selectedDates.length - 1])}
                  <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                    ({selectedDates.length} Tage)
                  </span>
                </p>
              ) : (
                <p className="text-sm text-gray-400">Keine Tage ausgewählt</p>
              )}
            </div>
            {hasChanges && (
              <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                Geändert
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
        <button
          onClick={handleClose}
          className="flex-1 py-3 rounded-xl font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2
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
