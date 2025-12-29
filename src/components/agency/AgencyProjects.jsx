import React, { useState, useMemo } from 'react';
import { Plus, AlertTriangle, Calendar, Users, Euro, ChevronRight, ChevronDown } from 'lucide-react';
import DateRangePicker from '../shared/DateRangePicker';
import ResizableModal from '../shared/ResizableModal';
import { formatDate, parseLocalDate } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isTerminalStatus
} from '../../constants/calendar';
import {
  PROJECT_STATUS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../data/initialData';

/**
 * AgencyProjects - Projektübersicht für Agenturen (Listenansicht)
 */
const AgencyProjects = ({
  projects,
  bookings,
  freelancers,
  agencyId,
  onConvertToFix,
  onAddProject,
  onSelectProject
}) => {
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Filtere Projekte der aktuellen Agentur
  const agencyProjects = projects.filter(p => p.agencyId === agencyId);

  // Finde offene Optionen
  const openOptions = bookings.filter(b =>
    b.agencyId === agencyId &&
    b.status === BOOKING_STATUS.OPTION_CONFIRMED &&
    !b.reschedule
  );

  const handleCreateProject = (projectData) => {
    onAddProject({
      ...projectData,
      agencyId
    });
    setShowCreateProject(false);
  };

  // Berechne Statistiken pro Projekt
  const projectStats = useMemo(() => {
    const stats = {};
    agencyProjects.forEach(project => {
      const projectBookings = bookings.filter(b =>
        b.agencyId === agencyId &&
        b.projectId === project.id &&
        !isTerminalStatus(b.status)
      );

      const uniqueFreelancers = new Set(projectBookings.map(b => b.freelancerId));
      const confirmedBookings = projectBookings.filter(b => isConfirmedStatus(b.status));
      const pendingBookings = projectBookings.filter(b => isPendingStatus(b.status));

      stats[project.id] = {
        freelancerCount: uniqueFreelancers.size,
        confirmedCount: confirmedBookings.length,
        pendingCount: pendingBookings.length,
        phaseCount: project.phases?.length || 0
      };
    });
    return stats;
  }, [agencyProjects, bookings, agencyId]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projekte</h1>
        <button
          onClick={() => setShowCreateProject(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Neues Projekt
        </button>
      </div>

      {/* Offene Optionen Warnung */}
      {openOptions.length > 0 && (
        <OpenOptionsWarning
          options={openOptions}
          onConvertToFix={onConvertToFix}
        />
      )}

      {/* Projektliste */}
      {agencyProjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          <p className="mb-4">Noch keine Projekte vorhanden.</p>
          <button
            onClick={() => setShowCreateProject(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Erstes Projekt erstellen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {agencyProjects.map(project => (
            <ProjectListCard
              key={project.id}
              project={project}
              stats={projectStats[project.id]}
              onClick={() => onSelectProject(project.id)}
            />
          ))}
        </div>
      )}

      {/* Projekt erstellen Modal */}
      {showCreateProject && (
        <CreateProjectModal
          onSave={handleCreateProject}
          onClose={() => setShowCreateProject(false)}
        />
      )}
    </div>
  );
};

/**
 * Warnung für offene Optionen
 */
const OpenOptionsWarning = ({ options, onConvertToFix }) => (
  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-card">
    <h2 className="font-bold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
      <AlertTriangle className="w-5 h-5" />
      Offene Optionen ({options.length})
    </h2>
    {options.map(option => (
      <div
        key={option.id}
        className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-xl mb-2 last:mb-0 border border-gray-200 dark:border-gray-700"
      >
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">
            {option.freelancerName} • {option.projectName}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {option.dates.length} Tage • {option.totalCost?.toLocaleString('de-DE')}€
          </p>
        </div>
        <button
          onClick={() => onConvertToFix(option)}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
        >
          Fix buchen
        </button>
      </div>
    ))}
  </div>
);

/**
 * Kompakte Projektkarte für Listenansicht
 */
const ProjectListCard = ({ project, stats, onClick }) => {
  const budgetPercent = project.budget?.total > 0
    ? Math.round((project.budget.spent / project.budget.total) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-card shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">{project.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                {PROJECT_STATUS_LABELS[project.status] || 'Planung'}
              </span>
            </div>

            {/* Kunde */}
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{project.client}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {/* Zeitraum */}
              {(project.startDate || project.endDate) && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {project.startDate && project.endDate
                    ? `${formatDate(project.startDate)} – ${formatDate(project.endDate)}`
                    : project.startDate
                      ? `Ab ${formatDate(project.startDate)}`
                      : `Bis ${formatDate(project.endDate)}`
                  }
                </span>
              )}

              {/* Phasen */}
              <span className="flex items-center gap-1">
                <span className="text-lg leading-none">📋</span>
                {stats.phaseCount} {stats.phaseCount === 1 ? 'Phase' : 'Phasen'}
              </span>

              {/* Team */}
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {stats.freelancerCount} Freelancer
              </span>

              {/* Budget */}
              {project.budget?.total > 0 && (
                <span className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  {project.budget.spent.toLocaleString('de-DE')} / {project.budget.total.toLocaleString('de-DE')} €
                </span>
              )}
            </div>
          </div>

          {/* Pfeil */}
          <div className="flex items-center pl-4">
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        {/* Budget Bar */}
        {project.budget?.total > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Budget</span>
              <span>{budgetPercent}% verwendet</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetPercent > 90 ? 'bg-red-500' :
                  budgetPercent > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Pending/Confirmed Badges */}
        {(stats.pendingCount > 0 || stats.confirmedCount > 0) && (
          <div className="mt-3 flex gap-2">
            {stats.confirmedCount > 0 && (
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs">
                {stats.confirmedCount} bestätigte Buchung{stats.confirmedCount !== 1 ? 'en' : ''}
              </span>
            )}
            {stats.pendingCount > 0 && (
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-xs">
                {stats.pendingCount} offene Anfrage{stats.pendingCount !== 1 ? 'n' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal zum Erstellen eines neuen Projekts
 */
const CreateProjectModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    projectNumber: '',
    startDate: '',
    endDate: '',
    budget: { total: 0 }
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.client.trim()) {
      onSave(formData);
    }
  };

  const handleDateChange = ({ startDate, endDate }) => {
    setFormData({ ...formData, startDate, endDate });
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = parseLocalDate(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    return `${d.getDate()}. ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const dateRangeDisplay = () => {
    if (formData.startDate && formData.endDate) {
      return `${formatDisplayDate(formData.startDate)} – ${formatDisplayDate(formData.endDate)}`;
    } else if (formData.startDate) {
      return `Ab ${formatDisplayDate(formData.startDate)}`;
    }
    return 'Zeitraum auswählen (optional)';
  };

  return (
    <ResizableModal
      title="Neues Projekt"
      onClose={onClose}
      defaultWidth={600}
      defaultHeight={showDatePicker ? 700 : 550}
      minWidth={450}
      minHeight={400}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Projektname */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Projektname *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="z.B. Werbespot Mercedes 2025"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            autoFocus
          />
        </div>

        {/* Beschreibung */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Beschreibung
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Kurze Beschreibung des Projekts..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>

        {/* Kunde und Projektnummer */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kunde *
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              placeholder="z.B. Mercedes-Benz AG"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Projektnummer
            </label>
            <input
              type="text"
              value={formData.projectNumber}
              onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
              placeholder="z.B. PRJ-2025-001"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gesamtbudget (€)
          </label>
          <input
            type="number"
            value={formData.budget.total || ''}
            onChange={(e) => setFormData({ ...formData, budget: { total: Number(e.target.value) } })}
            placeholder="z.B. 50000"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>

        {/* Projektzeitraum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Projektzeitraum <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl text-left flex items-center justify-between transition-colors bg-white dark:bg-gray-900 ${
              showDatePicker ? 'border-primary ring-2 ring-primary/50' : 'hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <span className={formData.startDate ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
              {dateRangeDisplay()}
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
          </button>

          {showDatePicker && (
            <div className="mt-3">
              <DateRangePicker
                startDate={formData.startDate}
                endDate={formData.endDate}
                onChange={handleDateChange}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={!formData.name.trim() || !formData.client.trim()}
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-opacity"
          >
            Projekt erstellen
          </button>
        </div>
      </form>
    </ResizableModal>
  );
};

export default AgencyProjects;
