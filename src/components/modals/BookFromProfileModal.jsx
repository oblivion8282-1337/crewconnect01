import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Briefcase,
  Calendar,
  User,
  Euro,
  Loader2
} from 'lucide-react';
import DateRangePicker from '../shared/DateRangePicker';
import { formatDate, getDateRange, parseLocalDate } from '../../utils/dateUtils';

/**
 * BookFromProfileModal - 3-Schritte-Buchungsflow aus dem Profil
 *
 * Schritt 1: Projekt wählen
 * Schritt 2: Phase wählen
 * Schritt 3: Buchungsdetails
 */
const BookFromProfileModal = ({
  isOpen,
  freelancer,
  projects,
  agencyId,
  getDayStatus,
  onBook,
  onAddProject,
  onAddPhase,
  onClose
}) => {
  const [step, setStep] = useState(1);

  // Loading States
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingPhase, setIsCreatingPhase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Schritt 1: Projekt
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Schritt 2: Phase
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [showNewPhase, setShowNewPhase] = useState(false);
  const [newPhase, setNewPhase] = useState({ name: '', startDate: '', endDate: '' });

  // Schritt 3: Buchungsdetails
  const [bookingDates, setBookingDates] = useState({ startDate: '', endDate: '' });
  const [selectedDays, setSelectedDays] = useState([]);
  const [bookingType, setBookingType] = useState('option');
  const [dayRate, setDayRate] = useState(freelancer?.dayRate || 500);
  const [note, setNote] = useState('');

  // Gefilterte Projekte der Agentur
  const agencyProjects = useMemo(() =>
    projects.filter(p => p.agencyId === agencyId),
    [projects, agencyId]
  );

  const selectedProject = agencyProjects.find(p => p.id === selectedProjectId);
  const selectedPhase = selectedProject?.phases?.find(p => p.id === selectedPhaseId);

  // Datumsbereich aus Phase oder custom
  const effectiveStartDate = selectedPhase?.startDate || bookingDates.startDate;
  const effectiveEndDate = selectedPhase?.endDate || bookingDates.endDate;
  const dateRange = effectiveStartDate && effectiveEndDate
    ? getDateRange(effectiveStartDate, effectiveEndDate)
    : [];

  // Verfügbarkeit berechnen
  const availability = useMemo(() => {
    if (!freelancer || dateRange.length === 0) return [];

    const today = new Date().toISOString().split('T')[0];

    return dateRange.map(dateStr => {
      const d = parseLocalDate(dateStr);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isPast = dateStr < today;
      const status = getDayStatus(freelancer.id, dateStr, agencyId);
      const isAvailable = !status.isBlocked && !status.hasBooking && !isPast;

      return {
        date: d,
        dateStr,
        isWeekend,
        isPast,
        isAvailable,
        status
      };
    });
  }, [freelancer, dateRange, getDayStatus, agencyId]);

  // Gruppiere Tage nach Monat (muss vor early return sein wegen Hooks-Regel)
  const monthGroups = useMemo(() => {
    const groups = {};
    availability.forEach(day => {
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
    return Object.values(groups);
  }, [availability]);

  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  if (!isOpen || !freelancer) return null;

  const fullName = `${freelancer.firstName} ${freelancer.lastName}`;

  // === Schritt 1: Projekt erstellen ===
  const handleCreateProject = async () => {
    if (!newProjectName.trim() || isCreatingProject) return;

    setIsCreatingProject(true);
    try {
      const newProject = onAddProject({
        name: newProjectName.trim(),
        client: 'Neuer Kunde',
        status: 'planning'
      });

      if (newProject) {
        setSelectedProjectId(newProject.id);
        setShowNewProject(false);
        setNewProjectName('');
      }
    } finally {
      setIsCreatingProject(false);
    }
  };

  // === Schritt 2: Phase erstellen ===
  const handleCreatePhase = async () => {
    if (!newPhase.name.trim() || !selectedProjectId || isCreatingPhase) return;

    setIsCreatingPhase(true);
    try {
      const createdPhase = onAddPhase(selectedProjectId, {
        name: newPhase.name.trim(),
        startDate: newPhase.startDate || null,
        endDate: newPhase.endDate || null
      });

      if (createdPhase) {
        setSelectedPhaseId(createdPhase.id);
        setShowNewPhase(false);
        setNewPhase({ name: '', startDate: '', endDate: '' });

        // Setze Buchungsdatum auf Phase-Datum wenn vorhanden
        if (createdPhase.startDate && createdPhase.endDate) {
          setBookingDates({
            startDate: createdPhase.startDate,
            endDate: createdPhase.endDate
          });
        }
      }
    } finally {
      setIsCreatingPhase(false);
    }
  };

  // === Navigation ===
  const canGoToStep2 = selectedProjectId !== null;
  const canGoToStep3 = selectedPhaseId !== null;
  const canSubmit = selectedDays.length > 0;

  const goToStep = (newStep) => {
    if (newStep === 2 && !canGoToStep2) return;
    if (newStep === 3 && !canGoToStep3) return;

    // Beim Wechsel zu Schritt 3, initialisiere Daten aus Phase
    if (newStep === 3 && selectedPhase) {
      if (selectedPhase.startDate && selectedPhase.endDate) {
        setBookingDates({
          startDate: selectedPhase.startDate,
          endDate: selectedPhase.endDate
        });
      }
    }

    setStep(newStep);
  };

  // === Tag-Auswahl ===
  const toggleDay = (dateStr) => {
    setSelectedDays(prev =>
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr].sort()
    );
  };

  const selectAllAvailable = () => {
    const availableDays = availability
      .filter(d => d.isAvailable && !d.isWeekend)
      .map(d => d.dateStr);
    setSelectedDays(availableDays);
  };

  const clearSelection = () => {
    setSelectedDays([]);
  };

  // === Buchung absenden ===
  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // createBooking erwartet: (freelancer, dates, requestType, project, phase, rateInfo)
      const rateInfo = {
        dailyRate: dayRate,
        note: note.trim() || null
      };

      onBook(freelancer, selectedDays, bookingType, selectedProject, selectedPhase, rateInfo);
      onClose();

      // Reset
      setStep(1);
      setSelectedProjectId(null);
      setSelectedPhaseId(null);
      setSelectedDays([]);
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const totalCost = dayRate * selectedDays.length;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {fullName} buchen
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Schritt {step} von 3
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  s <= step ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Schritt 1: Projekt wählen */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-400" />
                Projekt auswählen
              </h3>

              <div className="space-y-2">
                {agencyProjects.map(project => (
                  <label
                    key={project.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProjectId === project.id
                        ? 'border-accent bg-accent/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="project"
                      checked={selectedProjectId === project.id}
                      onChange={() => {
                        setSelectedProjectId(project.id);
                        setSelectedPhaseId(null);
                        setShowNewProject(false);
                      }}
                      className="w-4 h-4 text-accent focus:ring-accent"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {project.client} • {project.phases?.length || 0} Phasen
                      </p>
                    </div>
                  </label>
                ))}

                {/* Neues Projekt */}
                {showNewProject ? (
                  <div className="p-3 border border-accent rounded-lg bg-accent/5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Projektname"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={handleCreateProject}
                        disabled={!newProjectName.trim() || isCreatingProject}
                        className="px-4 py-2 bg-accent text-gray-900 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {isCreatingProject ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Erstellen...
                          </>
                        ) : (
                          'Erstellen'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowNewProject(false);
                          setNewProjectName('');
                        }}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewProject(true)}
                    className="w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Neues Projekt erstellen
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Schritt 2: Phase wählen */}
          {step === 2 && selectedProject && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                Phase auswählen
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Projekt: <strong>{selectedProject.name}</strong>
              </p>

              <div className="space-y-2">
                {selectedProject.phases?.map(phase => (
                  <label
                    key={phase.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPhaseId === phase.id
                        ? 'border-accent bg-accent/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="phase"
                      checked={selectedPhaseId === phase.id}
                      onChange={() => {
                        setSelectedPhaseId(phase.id);
                        setShowNewPhase(false);
                        if (phase.startDate && phase.endDate) {
                          setBookingDates({
                            startDate: phase.startDate,
                            endDate: phase.endDate
                          });
                        }
                      }}
                      className="w-4 h-4 text-accent focus:ring-accent"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{phase.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {phase.startDate && phase.endDate
                          ? `${formatDate(phase.startDate)} – ${formatDate(phase.endDate)}`
                          : 'Kein Datum festgelegt'}
                      </p>
                    </div>
                  </label>
                ))}

                {selectedProject.phases?.length === 0 && !showNewPhase && (
                  <p className="text-center py-4 text-gray-400 dark:text-gray-500">
                    Keine Phasen vorhanden. Erstelle eine neue Phase.
                  </p>
                )}

                {/* Neue Phase */}
                {showNewPhase ? (
                  <div className="p-4 border border-accent rounded-lg bg-accent/5 space-y-3">
                    <input
                      type="text"
                      value={newPhase.name}
                      onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                      placeholder="Phasenname"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                      autoFocus
                    />

                    <DateRangePicker
                      startDate={newPhase.startDate}
                      endDate={newPhase.endDate}
                      onChange={({ startDate, endDate }) =>
                        setNewPhase({ ...newPhase, startDate, endDate })
                      }
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={handleCreatePhase}
                        disabled={!newPhase.name.trim() || isCreatingPhase}
                        className="flex-1 px-4 py-2 bg-accent text-gray-900 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isCreatingPhase ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Erstellen...
                          </>
                        ) : (
                          'Phase erstellen'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowNewPhase(false);
                          setNewPhase({ name: '', startDate: '', endDate: '' });
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewPhase(true)}
                    className="w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Neue Phase erstellen
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Schritt 3: Buchungsdetails */}
          {step === 3 && selectedProject && selectedPhase && (
            <div className="space-y-6">
              {/* Zusammenfassung */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Freelancer</p>
                    <p className="font-medium text-gray-900 dark:text-white">{fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Projekt</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Phase</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPhase.name}</p>
                  </div>
                </div>
              </div>

              {/* Zeitraum */}
              {!selectedPhase.startDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Buchungszeitraum
                  </label>
                  <DateRangePicker
                    startDate={bookingDates.startDate}
                    endDate={bookingDates.endDate}
                    onChange={({ startDate, endDate }) => {
                      setBookingDates({ startDate, endDate });
                      setSelectedDays([]);
                    }}
                  />
                </div>
              )}

              {/* Tage-Auswahl */}
              {dateRange.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tage auswählen
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllAvailable}
                        className="text-xs text-accent hover:underline"
                      >
                        Alle verfügbaren
                      </button>
                      <button
                        onClick={clearSelection}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Auswahl löschen
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {monthGroups.map(group => (
                      <div key={`${group.year}-${group.month}`}>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {monthNames[group.month]} {group.year}
                        </div>
                        <div className="flex flex-wrap gap-1" style={{ maxWidth: '160px' }}>
                          {group.days.map(day => {
                            const isSelected = selectedDays.includes(day.dateStr);
                            const isBookable = day.isAvailable && !day.isWeekend;

                            return (
                              <button
                                key={day.dateStr}
                                onClick={() => isBookable && toggleDay(day.dateStr)}
                                disabled={!isBookable}
                                className={`w-6 h-6 rounded text-xs font-medium transition-all ${
                                  isSelected
                                    ? 'bg-accent text-gray-900 ring-2 ring-accent/50'
                                    : day.isWeekend || day.isPast
                                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                      : day.isAvailable
                                        ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                                        : 'bg-red-500 text-white cursor-not-allowed'
                                }`}
                                title={day.isPast ? 'Vergangen' : (day.isAvailable ? 'Verfügbar' : 'Belegt')}
                              >
                                {day.date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legende */}
                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-accent" /> Ausgewählt
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-green-500" /> Verfügbar
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-red-500" /> Belegt
                    </span>
                  </div>
                </div>
              )}

              {/* Buchungstyp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buchungstyp
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBookingType('option')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      bookingType === 'option'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Option
                  </button>
                  <button
                    onClick={() => setBookingType('fix')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      bookingType === 'fix'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Fix
                  </button>
                </div>
              </div>

              {/* Tagessatz */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tagessatz (€)
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={dayRate}
                    onChange={(e) => setDayRate(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              {/* Notiz */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nachricht an Freelancer (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="z.B. Details zum Projekt, besondere Anforderungen..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                />
              </div>

              {/* Kosten-Übersicht */}
              {selectedDays.length > 0 && (
                <div className="p-4 bg-accent/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedDays.length} Tage × {dayRate}€
                    </span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {totalCost.toLocaleString('de-DE')}€
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => goToStep(step - 1)}
                className="px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Zurück
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Abbrechen
            </button>

            {step < 3 ? (
              <button
                onClick={() => goToStep(step + 1)}
                disabled={step === 1 ? !canGoToStep2 : !canGoToStep3}
                className="px-4 py-2 flex items-center gap-2 bg-accent text-gray-900 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Weiter
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="px-4 py-2 flex items-center gap-2 bg-accent text-gray-900 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {bookingType === 'option' ? 'Option anfragen' : 'Fix buchen'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookFromProfileModal;
