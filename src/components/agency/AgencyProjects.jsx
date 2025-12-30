import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Users, Euro, ChevronRight, ChevronDown, Layers } from 'lucide-react';
import DateRangePicker from '../shared/DateRangePicker';
import ResizableModal from '../shared/ResizableModal';
import { formatDate, parseLocalDate } from '../../utils/dateUtils';
import { isTerminalStatus } from '../../constants/calendar';
import {
  PROJECT_STATUS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../data/initialData';

/**
 * AgencyProjects - Projektübersicht für Agenturen (Listenansicht)
 */
// Projekt-Kategorien
const PROJECT_CATEGORIES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const CATEGORY_LABELS = {
  [PROJECT_CATEGORIES.ACTIVE]: 'Laufend',
  [PROJECT_CATEGORIES.COMPLETED]: 'Abgeschlossen',
  [PROJECT_CATEGORIES.CANCELLED]: 'Abgebrochen'
};

// Welche Status gehören zu welcher Kategorie
const getProjectCategory = (status) => {
  if (status === PROJECT_STATUS.COMPLETED) return PROJECT_CATEGORIES.COMPLETED;
  if (status === PROJECT_STATUS.CANCELLED) return PROJECT_CATEGORIES.CANCELLED;
  return PROJECT_CATEGORIES.ACTIVE; // planning, pre_production, production, post_production, on_hold
};

const AgencyProjects = ({
  projects,
  bookings,
  agencyId,
  onAddProject,
  onSelectProject
}) => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [activeCategory, setActiveCategory] = useState(PROJECT_CATEGORIES.ACTIVE);

  // Filtere Projekte der aktuellen Agentur
  const agencyProjects = projects.filter(p => p.agencyId === agencyId);

  // Kategorisiere Projekte
  const categorizedProjects = useMemo(() => {
    return {
      [PROJECT_CATEGORIES.ACTIVE]: agencyProjects.filter(p => getProjectCategory(p.status) === PROJECT_CATEGORIES.ACTIVE),
      [PROJECT_CATEGORIES.COMPLETED]: agencyProjects.filter(p => getProjectCategory(p.status) === PROJECT_CATEGORIES.COMPLETED),
      [PROJECT_CATEGORIES.CANCELLED]: agencyProjects.filter(p => getProjectCategory(p.status) === PROJECT_CATEGORIES.CANCELLED)
    };
  }, [agencyProjects]);

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

      stats[project.id] = {
        freelancerCount: uniqueFreelancers.size,
        phaseCount: project.phases?.length || 0
      };
    });
    return stats;
  }, [agencyProjects, bookings, agencyId]);

  // Aktuelle Projekte basierend auf Kategorie
  const currentProjects = categorizedProjects[activeCategory] || [];

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

      {/* Kategorie-Tabs */}
      <div className="flex gap-2 mb-6">
        {Object.values(PROJECT_CATEGORIES).map(category => {
          const count = categorizedProjects[category]?.length || 0;
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {CATEGORY_LABELS[category]}
              {count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

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
      ) : currentProjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-8 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          <p>Keine {CATEGORY_LABELS[activeCategory].toLowerCase()}en Projekte.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentProjects.map(project => (
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
                <Layers className="w-4 h-4" />
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
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    startDate: '',
    endDate: ''
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
      defaultWidth={700}
      defaultHeight={850}
      minWidth={550}
      minHeight={650}
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Ansprechpartner Sektion */}
        <div className="pt-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Ansprechpartner</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="z.B. Max Mustermann"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="max@beispiel.de"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+49 123 456789"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>
          </div>
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
