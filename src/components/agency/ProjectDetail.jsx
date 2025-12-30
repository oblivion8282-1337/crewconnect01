import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Users,
  Euro,
  Plus,
  Trash2,
  UserPlus,
  Edit2,
  X,
  Phone,
  Mail,
  Building2,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import FreelancerSearchModal from '../modals/FreelancerSearchModal';
import DateRangePicker from '../shared/DateRangePicker';
import ResizableModal from '../shared/ResizableModal';
import { formatDate } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isTerminalStatus,
  isFixStatus
} from '../../constants/calendar';
import {
  PROJECT_STATUS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../data/initialData';

/**
 * ProjectDetail - Detailansicht eines Projekts
 */
const ProjectDetail = ({
  project,
  bookings,
  freelancers,
  agencyId,
  getDayStatus,
  onBack,
  onBackToProjects,
  onBook,
  onConvertToFix,
  onWithdraw,
  onUpdateProject,
  onDeleteProject,
  onAddPhase,
  onUpdatePhase,
  onDeletePhase,
  onSelectPhase,
  // Favoriten & Crew-Listen Props
  isFavorite,
  onToggleFavorite,
  crewLists,
  getListsForFreelancer,
  onAddToList,
  onRemoveFromList,
  onOpenAddToListModal
}) => {
  const [searchContext, setSearchContext] = useState(null);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editData, setEditData] = useState({});

  // Buchungen für dieses Projekt
  const projectBookings = useMemo(() =>
    bookings.filter(b =>
      b.agencyId === agencyId &&
      b.projectId === project.id &&
      b.status !== BOOKING_STATUS.DECLINED &&
      b.status !== BOOKING_STATUS.WITHDRAWN &&
      b.status !== BOOKING_STATUS.CANCELLED
    ),
    [bookings, agencyId, project.id]
  );

  // Team (Freelancer mit bestätigten Buchungen)
  const team = useMemo(() => {
    const teamMap = new Map();
    projectBookings.forEach(booking => {
      const freelancer = freelancers.find(f => f.id === booking.freelancerId);
      if (!freelancer) return;

      if (!teamMap.has(booking.freelancerId)) {
        teamMap.set(booking.freelancerId, {
          freelancer,
          bookings: []
        });
      }
      teamMap.get(booking.freelancerId).bookings.push(booking);
    });
    return Array.from(teamMap.values());
  }, [projectBookings, freelancers]);

  // Budget-Berechnung
  const budgetInfo = useMemo(() => {
    const planned = project.phases?.reduce((sum, phase) => sum + (phase.budget || 0), 0) || 0;
    const total = project.budget?.total || 0;
    const spent = project.budget?.spent || 0;
    const remaining = total - spent;
    const percentUsed = total > 0 ? Math.round((spent / total) * 100) : 0;

    return { total, spent, remaining, planned, percentUsed };
  }, [project]);

  const handleOpenSearch = (phase) => {
    setSearchContext({ project, phase });
  };

  const handleStartEdit = (section, initialData) => {
    setEditingSection(section);
    setEditData(initialData);
  };

  const handleSaveEdit = () => {
    if (editingSection === 'overview') {
      onUpdateProject(project.id, editData);
    } else if (editingSection === 'client') {
      onUpdateProject(project.id, { clientContact: editData });
    } else if (editingSection === 'budget') {
      onUpdateProject(project.id, {
        budget: { ...project.budget, total: editData.total }
      });
    }
    setEditingSection(null);
    setEditData({});
  };

  const handleDeleteProject = () => {
    if (window.confirm('Projekt wirklich löschen? Alle Phasen werden ebenfalls gelöscht.')) {
      onDeleteProject(project.id);
      onBack();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <button
          onClick={onBackToProjects || onBack}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Projekte
        </button>
        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 dark:text-gray-400" />
        <span className="text-gray-900 dark:text-white font-medium">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {editingSection === 'overview' ? (
                <OverviewEditForm
                  data={editData}
                  onChange={setEditData}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingSection(null)}
                />
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{project.client}</p>
                  {project.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{project.description}</p>
                  )}
                  {(project.startDate || project.endDate) && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project.startDate && project.endDate
                        ? `${formatDate(project.startDate)} – ${formatDate(project.endDate)}`
                        : project.startDate
                          ? `Ab ${formatDate(project.startDate)}`
                          : `Bis ${formatDate(project.endDate)}`
                      }
                    </p>
                  )}
                </>
              )}
            </div>
            {editingSection !== 'overview' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStartEdit('overview', {
                    name: project.name,
                    description: project.description || '',
                    client: project.client,
                    status: project.status,
                    startDate: project.startDate || '',
                    endDate: project.endDate || ''
                  })}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kunde & Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Kunde */}
        <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kunde</h2>
            {editingSection !== 'client' && (
              <button
                onClick={() => handleStartEdit('client', project.clientContact || {})}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </div>

          {editingSection === 'client' ? (
            <ClientEditForm
              data={editData}
              onChange={setEditData}
              onSave={handleSaveEdit}
              onCancel={() => setEditingSection(null)}
            />
          ) : (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900 dark:text-white">{project.client}</p>
              {project.clientContact?.name && (
                <p className="text-gray-600 dark:text-gray-400">{project.clientContact.name}</p>
              )}
              {project.clientContact?.email && (
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {project.clientContact.email}
                </p>
              )}
              {project.clientContact?.phone && (
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {project.clientContact.phone}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Budget</h2>
            {editingSection !== 'budget' && (
              <button
                onClick={() => handleStartEdit('budget', { total: budgetInfo.total })}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Edit2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </div>

          {editingSection === 'budget' ? (
            <BudgetEditForm
              data={editData}
              onChange={setEditData}
              onSave={handleSaveEdit}
              onCancel={() => setEditingSection(null)}
            />
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Ausgegeben</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {budgetInfo.spent.toLocaleString('de-DE')} € / {budgetInfo.total.toLocaleString('de-DE')} €
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budgetInfo.percentUsed > 90 ? 'bg-red-500' :
                      budgetInfo.percentUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budgetInfo.percentUsed, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Verplant (Phasen)</p>
                  <p className="font-medium text-gray-900 dark:text-white">{budgetInfo.planned.toLocaleString('de-DE')} €</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Verbleibend</p>
                  <p className={`font-medium ${budgetInfo.remaining < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    {budgetInfo.remaining.toLocaleString('de-DE')} €
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phasen-Timeline */}
      <div className="mb-6">
        <PhaseTimeline
          phases={project.phases || []}
          bookings={projectBookings}
          onSelectPhase={onSelectPhase}
        />
      </div>

      {/* Phasen */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6 mb-6">
        {project.phases?.length === 0 ? (
          /* Empty State - Prominent mit Erklärung */
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Projekt in Phasen aufteilen
            </h2>

            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
              <strong>Phasen</strong> sind die verschiedenen Abschnitte deines Projekts.
              Für jede Phase kannst du separat Freelancer suchen und buchen.
            </p>

            {/* Beispiele */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                Drehphase
              </span>
              <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
                Post-Production
              </span>
              <span className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 rounded-full text-sm font-medium">
                Pre-Production
              </span>
              <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                Sounddesign
              </span>
            </div>

            <button
              onClick={() => setShowAddPhase(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              <Plus className="w-5 h-5" />
              Erste Phase erstellen
            </button>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              Du kannst später jederzeit weitere Phasen hinzufügen
            </p>
          </div>
        ) : (
          /* Normale Ansicht mit Phasen */
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Phasen</h2>
            </div>

            <div className="space-y-3">
              {project.phases?.map(phase => (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  projectId={project.id}
                  bookings={projectBookings.filter(b => b.phaseId === phase.id)}
                  onDeletePhase={onDeletePhase}
                  onSelectPhase={onSelectPhase}
                />
              ))}
            </div>

            <button
              onClick={() => setShowAddPhase(true)}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Phase hinzufügen
            </button>
          </>
        )}
      </div>

      {/* Team */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Team ({team.length} Freelancer)
        </h2>

        {team.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Noch keine Freelancer gebucht</p>
        ) : (
          <div className="space-y-3">
            {team.map(({ freelancer, bookings }) => (
              <TeamMemberCard
                key={freelancer.id}
                freelancer={freelancer}
                bookings={bookings}
                onConvertToFix={onConvertToFix}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {searchContext && (
        <FreelancerSearchModal
          project={searchContext.project}
          phase={searchContext.phase}
          freelancers={freelancers}
          getDayStatus={getDayStatus}
          agencyId={agencyId}
          onBook={onBook}
          onClose={() => setSearchContext(null)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          crewLists={crewLists}
          getListsForFreelancer={getListsForFreelancer}
          onAddToList={onAddToList}
          onRemoveFromList={onRemoveFromList}
          onOpenAddToListModal={onOpenAddToListModal}
        />
      )}

      {showAddPhase && (
        <AddPhaseModal
          projectId={project.id}
          onSave={(projectId, phaseData) => {
            onAddPhase(projectId, phaseData);
            setShowAddPhase(false);
          }}
          onClose={() => setShowAddPhase(false)}
        />
      )}
    </div>
  );
};

/**
 * Phasen-Timeline - Visuelle Übersicht aller Phasen im Projekt
 */
const PhaseTimeline = ({ phases, bookings, onSelectPhase }) => {
  const [zoomLevel, setZoomLevel] = useState(2);

  // Berechne effektive Zeiträume für alle Phasen
  const phaseRanges = useMemo(() => {
    return phases.map(phase => {
      const phaseBookings = bookings.filter(b => b.phaseId === phase.id);
      const allDates = phaseBookings.flatMap(b => b.dates).sort();

      let startDate = phase.startDate || null;
      let endDate = phase.endDate || null;

      if (allDates.length > 0) {
        const firstBooking = allDates[0];
        const lastBooking = allDates[allDates.length - 1];

        if (!startDate || firstBooking < startDate) startDate = firstBooking;
        if (!endDate || lastBooking > endDate) endDate = lastBooking;
      }

      // Berechne Tage für diese Phase
      const phaseDays = new Set(allDates);

      return {
        ...phase,
        effectiveStart: startDate,
        effectiveEnd: endDate,
        bookingCount: phaseBookings.length,
        bookedDays: phaseDays
      };
    });
  }, [phases, bookings]);

  // Finde den Gesamtzeitraum aller Phasen
  const totalRange = useMemo(() => {
    const validRanges = phaseRanges.filter(p => p.effectiveStart && p.effectiveEnd);
    if (validRanges.length === 0) return null;

    const starts = validRanges.map(p => p.effectiveStart).sort();
    const ends = validRanges.map(p => p.effectiveEnd).sort();

    return {
      start: starts[0],
      end: ends[ends.length - 1]
    };
  }, [phaseRanges]);

  // Generiere alle Tage im Zeitraum
  const timelineDays = useMemo(() => {
    if (!totalRange) return [];

    const days = [];
    const start = new Date(totalRange.start);
    const end = new Date(totalRange.end);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        date: new Date(d),
        dateStr: d.toISOString().split('T')[0]
      });
    }

    return days;
  }, [totalRange]);

  // Farben für Phasen mit Gradient
  const phaseColors = [
    { gradient: 'from-blue-400 to-blue-500', shadow: 'shadow-blue-200', light: 'bg-blue-50', text: 'text-blue-700' },
    { gradient: 'from-emerald-400 to-emerald-500', shadow: 'shadow-emerald-200', light: 'bg-emerald-50', text: 'text-emerald-700' },
    { gradient: 'from-amber-400 to-amber-500', shadow: 'shadow-amber-200', light: 'bg-amber-50', text: 'text-amber-700' },
    { gradient: 'from-violet-400 to-violet-500', shadow: 'shadow-violet-200', light: 'bg-violet-50', text: 'text-violet-700' },
    { gradient: 'from-rose-400 to-rose-500', shadow: 'shadow-rose-200', light: 'bg-rose-50', text: 'text-rose-700' },
    { gradient: 'from-cyan-400 to-cyan-500', shadow: 'shadow-cyan-200', light: 'bg-cyan-50', text: 'text-cyan-700' }
  ];

  if (phases.length === 0) return null;

  const hasAnyData = phaseRanges.some(p => p.effectiveStart && p.effectiveEnd);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6">
      {/* Header mit Zoom */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          Phasen-Timeline
        </h2>

        {hasAnyData && (
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
              <ZoomOut className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="range"
                min="0"
                max="4"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                className="w-24 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
              />
              <ZoomIn className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        )}
      </div>

      {!hasAnyData ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          Noch keine Zeiträume definiert. Buche Freelancer um die Timeline zu sehen.
        </div>
      ) : (
        <>
          {/* Timeline Container */}
          <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Header Row */}
                <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  {/* Sticky Phase Column Header */}
                  <div
                    className="sticky left-0 z-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center px-4 py-3"
                    style={{ width: '160px', minWidth: '160px' }}
                  >
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phasen
                    </span>
                  </div>

                  {/* Date Headers */}
                  <div className="flex">
                    {timelineDays.map((day, index) => {
                      const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                      const isFirstOfMonth = day.date.getDate() === 1;
                      const cellWidth = [20, 28, 36, 48, 64][zoomLevel];

                      return (
                        <div
                          key={day.dateStr}
                          className={`flex flex-col items-center justify-center py-2 border-r border-gray-100 dark:border-gray-700 ${
                            isWeekend ? 'bg-gray-50 dark:bg-gray-900' : ''
                          } ${isFirstOfMonth ? 'border-l-2 border-l-gray-300 dark:border-l-gray-600' : ''}`}
                          style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
                        >
                          {(isFirstOfMonth || index === 0) && zoomLevel >= 1 && (
                            <div className="text-[9px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">
                              {day.date.toLocaleDateString('de-DE', { month: 'short' })}
                            </div>
                          )}
                          {zoomLevel >= 2 && (
                            <div className={`text-[9px] font-medium ${isWeekend ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                              {day.date.toLocaleDateString('de-DE', { weekday: 'narrow' })}
                            </div>
                          )}
                          <div className={`text-xs font-bold ${isWeekend ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                            {day.date.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Phase Rows */}
                {phaseRanges.map((phase, rowIndex) => {
                  const color = phaseColors[rowIndex % phaseColors.length];
                  const cellWidth = [20, 28, 36, 48, 64][zoomLevel];
                  const cellHeight = [24, 28, 36, 44, 52][zoomLevel];

                  return (
                    <div
                      key={phase.id}
                      className={`flex cursor-pointer ${rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'} hover:bg-blue-50/30 transition-colors`}
                      onClick={() => onSelectPhase?.(phase)}
                    >
                      {/* Sticky Phase Name */}
                      <div
                        className={`sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 flex items-center gap-2 px-3 ${
                          rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                        }`}
                        style={{ width: '160px', minWidth: '160px', height: `${cellHeight + 8}px` }}
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${color.gradient}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {phase.name}
                          </p>
                          {zoomLevel >= 2 && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                              {phase.bookingCount} Buchung{phase.bookingCount !== 1 ? 'en' : ''}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      </div>

                      {/* Day Cells */}
                      <div className="flex">
                        {timelineDays.map(day => {
                          const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                          const isInPhase = phase.effectiveStart && phase.effectiveEnd &&
                            day.dateStr >= phase.effectiveStart && day.dateStr <= phase.effectiveEnd;
                          const hasBooking = phase.bookedDays.has(day.dateStr);

                          // Determine if this is start/end of phase range
                          const isPhaseStart = day.dateStr === phase.effectiveStart;
                          const isPhaseEnd = day.dateStr === phase.effectiveEnd;

                          return (
                            <div
                              key={day.dateStr}
                              className={`border-r border-gray-100 dark:border-gray-700 flex items-center justify-center p-0.5 ${
                                isWeekend && !isInPhase ? 'bg-gray-100 dark:bg-gray-700' : ''
                              }`}
                              style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px`, height: `${cellHeight + 8}px` }}
                            >
                              {isInPhase ? (
                                <div
                                  className={`w-full h-full bg-gradient-to-b ${color.gradient} shadow-sm ${color.shadow} ${
                                    isPhaseStart && isPhaseEnd ? 'rounded-lg' :
                                    isPhaseStart ? 'rounded-l-lg' :
                                    isPhaseEnd ? 'rounded-r-lg' : ''
                                  } ${hasBooking ? 'opacity-100' : 'opacity-40'} transition-all hover:opacity-100`}
                                  title={`${phase.name}\n${formatDate(phase.effectiveStart)} - ${formatDate(phase.effectiveEnd)}`}
                                />
                              ) : (
                                <div className={`w-full h-full ${isWeekend ? '' : 'bg-gray-50 dark:bg-gray-900'} rounded`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 text-xs">
              {phaseRanges.slice(0, 4).map((phase, index) => {
                const color = phaseColors[index % phaseColors.length];
                return (
                  <span key={phase.id} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded bg-gradient-to-b ${color.gradient} shadow-sm`} />
                    <span className="text-gray-600 dark:text-gray-400 truncate max-w-[100px]">{phase.name}</span>
                  </span>
                );
              })}
              {phaseRanges.length > 4 && (
                <span className="text-gray-400 dark:text-gray-500">+{phaseRanges.length - 4} weitere</span>
              )}
            </div>

            <div className="text-xs text-gray-400 dark:text-gray-500">
              {timelineDays.length} Tage • {phases.length} Phasen
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Phasen-Karte - Klickbar zur Phase-Detailseite
 */
const PhaseCard = ({
  phase,
  projectId,
  bookings,
  onDeletePhase,
  onSelectPhase
}) => {
  const confirmedCount = bookings.filter(b => isConfirmedStatus(b.status)).length;
  const pendingCount = bookings.filter(b => isPendingStatus(b.status)).length;
  const totalBookings = bookings.length;

  // Berechne effektiven Zeitraum aus Buchungen
  const effectiveDateRange = useMemo(() => {
    const allDates = bookings.flatMap(b => b.dates).sort();

    let startDate = phase.startDate || null;
    let endDate = phase.endDate || null;

    if (allDates.length > 0) {
      const firstBooking = allDates[0];
      const lastBooking = allDates[allDates.length - 1];

      if (!startDate || firstBooking < startDate) startDate = firstBooking;
      if (!endDate || lastBooking > endDate) endDate = lastBooking;
    }

    return { startDate, endDate };
  }, [phase.startDate, phase.endDate, bookings]);

  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900 transition-all group"
      onClick={() => onSelectPhase?.(phase)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{phase.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {effectiveDateRange.startDate && effectiveDateRange.endDate
                ? `${formatDate(effectiveDateRange.startDate)} – ${formatDate(effectiveDateRange.endDate)}`
                : 'Kein Datum festgelegt'}
              {phase.budget > 0 && ` • ${phase.budget.toLocaleString('de-DE')} €`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {confirmedCount > 0 && (
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-medium">
              {confirmedCount} Fix
            </span>
          )}
          {pendingCount > 0 && (
            <span className="px-2 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-xs font-medium">
              {pendingCount} Pending
            </span>
          )}
          {totalBookings === 0 && (
            <span className="px-2 py-1 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 rounded-lg text-xs">
              Keine Buchungen
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeletePhase(projectId, phase.id);
            }}
            className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:text-gray-500 transition-colors" />
        </div>
      </div>
    </div>
  );
};

/**
 * Team-Member-Karte
 */
const TeamMemberCard = ({ freelancer, bookings, onConvertToFix }) => {
  const totalDays = bookings.reduce((sum, b) => sum + b.dates.length, 0);
  const hasOption = bookings.some(b => b.status === BOOKING_STATUS.OPTION_CONFIRMED);
  const hasFix = bookings.some(b => b.status === BOOKING_STATUS.FIX_CONFIRMED);
  const hasPending = bookings.some(b => isPendingStatus(b.status));

  return (
    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{freelancer.avatar}</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{freelancer.firstName} {freelancer.lastName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{freelancer.professions?.[0]}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{totalDays} Tage</p>
          <div className="flex gap-1 mt-1">
            {hasFix && (
              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">Fix</span>
            )}
            {hasOption && (
              <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs">Option</span>
            )}
            {hasPending && (
              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">Pending</span>
            )}
          </div>
        </div>
      </div>

      {/* Buchungs-Details */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
        {bookings.map(booking => (
          <div key={booking.id} className="flex justify-between items-center text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              {formatDate(booking.dates[0])} - {formatDate(booking.dates[booking.dates.length - 1])}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{booking.phaseName}</span>
              {booking.status === BOOKING_STATUS.OPTION_CONFIRMED && (
                <button
                  onClick={() => onConvertToFix(booking)}
                  className="px-2 py-0.5 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Fix
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// === Edit Forms ===

const OverviewEditForm = ({ data, onChange, onSave, onCancel }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projektname</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            value={data.status || PROJECT_STATUS.PLANNING}
            onChange={(e) => onChange({ ...data, status: e.target.value })}
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kunde</label>
        <input
          type="text"
          value={data.client || ''}
          onChange={(e) => onChange({ ...data, client: e.target.value })}
          className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={2}
          className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zeitraum</label>
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-left flex items-center justify-between hover:border-gray-400"
        >
          <span className={data.startDate ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
            {data.startDate && data.endDate
              ? `${formatDate(data.startDate)} – ${formatDate(data.endDate)}`
              : 'Zeitraum auswählen'}
          </span>
          <ChevronDown className={`w-4 h-4 ${showDatePicker ? 'rotate-180' : ''}`} />
        </button>
        {showDatePicker && (
          <div className="mt-2">
            <DateRangePicker
              startDate={data.startDate}
              endDate={data.endDate}
              onChange={({ startDate, endDate }) => onChange({ ...data, startDate, endDate })}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
          Abbrechen
        </button>
        <button onClick={onSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Speichern
        </button>
      </div>
    </div>
  );
};

const ClientEditForm = ({ data, onChange, onSave, onCancel }) => (
  <div className="space-y-3">
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ansprechpartner</label>
      <input
        type="text"
        value={data.name || ''}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail</label>
      <input
        type="email"
        value={data.email || ''}
        onChange={(e) => onChange({ ...data, email: e.target.value })}
        className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
      <input
        type="tel"
        value={data.phone || ''}
        onChange={(e) => onChange({ ...data, phone: e.target.value })}
        className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="flex gap-2 pt-2">
      <button onClick={onCancel} className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
        Abbrechen
      </button>
      <button onClick={onSave} className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
        Speichern
      </button>
    </div>
  </div>
);

const BudgetEditForm = ({ data, onChange, onSave, onCancel }) => (
  <div className="space-y-3">
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Gesamtbudget (€)</label>
      <input
        type="number"
        value={data.total || 0}
        onChange={(e) => onChange({ ...data, total: Number(e.target.value) })}
        className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="flex gap-2 pt-2">
      <button onClick={onCancel} className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
        Abbrechen
      </button>
      <button onClick={onSave} className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
        Speichern
      </button>
    </div>
  </div>
);

/**
 * Modal zum Hinzufügen einer Phase
 */
const AddPhaseModal = ({ projectId, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budget: 0
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(projectId, formData);
    }
  };

  return (
    <ResizableModal
      title="Neue Phase"
      onClose={onClose}
      defaultWidth={500}
      defaultHeight={showDatePicker ? 550 : 350}
      minWidth={400}
      minHeight={300}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phasenname *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="z.B. Drehphase, Post-Production"
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget (€)</label>
          <input
            type="number"
            value={formData.budget || ''}
            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
            placeholder="0"
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zeitraum</label>
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-left flex items-center justify-between hover:border-gray-400"
          >
            <span className={formData.startDate ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
              {formData.startDate && formData.endDate
                ? `${formatDate(formData.startDate)} – ${formatDate(formData.endDate)}`
                : 'Zeitraum auswählen'}
            </span>
            <ChevronDown className={`w-5 h-5 ${showDatePicker ? 'rotate-180' : ''}`} />
          </button>
          {showDatePicker && (
            <div className="mt-2">
              <DateRangePicker
                startDate={formData.startDate}
                endDate={formData.endDate}
                onChange={({ startDate, endDate }) => setFormData({ ...formData, startDate, endDate })}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-900 dark:text-white"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={!formData.name.trim()}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            Phase hinzufügen
          </button>
        </div>
      </form>
    </ResizableModal>
  );
};

export default ProjectDetail;
