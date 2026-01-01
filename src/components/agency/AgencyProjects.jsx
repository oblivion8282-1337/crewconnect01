import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Calendar, Users, Euro, ChevronRight, ChevronDown, Layers, Palette, Hash, Clock, TrendingUp, Search, X, Building2 } from 'lucide-react';
import DateRangePicker from '../shared/DateRangePicker';
import ResizableModal from '../shared/ResizableModal';
import { formatDate, parseLocalDate } from '../../utils/dateUtils';
import { isTerminalStatus } from '../../constants/calendar';
import {
  PROJECT_STATUS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../data/initialData';
import ClientSelector from './clients/ClientSelector';
import ContactSelector from './clients/ContactSelector';

// Vordefinierte Farben für Projekte (gleich wie bei Phasen)
const PROJECT_COLORS = [
  { id: 'gray', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', preview: 'bg-gray-200 dark:bg-gray-600', glow: 'gray', text: 'text-gray-700 dark:text-gray-300' },
  { id: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', preview: 'bg-blue-400', glow: '#3b82f6', text: 'text-blue-700 dark:text-blue-300' },
  { id: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', preview: 'bg-emerald-400', glow: '#10b981', text: 'text-emerald-700 dark:text-emerald-300' },
  { id: 'amber', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', preview: 'bg-amber-400', glow: '#f59e0b', text: 'text-amber-700 dark:text-amber-300' },
  { id: 'violet', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', preview: 'bg-violet-400', glow: '#8b5cf6', text: 'text-violet-700 dark:text-violet-300' },
  { id: 'rose', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', preview: 'bg-rose-400', glow: '#f43f5e', text: 'text-rose-700 dark:text-rose-300' },
  { id: 'cyan', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', preview: 'bg-cyan-400', glow: '#06b6d4', text: 'text-cyan-700 dark:text-cyan-300' },
  { id: 'orange', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', preview: 'bg-orange-400', glow: '#f97316', text: 'text-orange-700 dark:text-orange-300' }
];

// Hilfsfunktion um Hex-Farbe aufzuhellen (für Hintergrund)
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
  clients = [],
  onAddProject,
  onUpdateProject,
  onSelectProject,
  onCreateClient
}) => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [activeCategory, setActiveCategory] = useState(PROJECT_CATEGORIES.ACTIVE);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtere Projekte der aktuellen Agentur
  const agencyProjects = projects.filter(p => p.agencyId === agencyId);

  // Suchfilter anwenden
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return agencyProjects;

    const query = searchQuery.toLowerCase().trim();
    return agencyProjects.filter(p =>
      p.name?.toLowerCase().includes(query) ||
      p.client?.toLowerCase().includes(query) ||
      p.projectNumber?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.phases?.some(phase => phase.name?.toLowerCase().includes(query))
    );
  }, [agencyProjects, searchQuery]);

  // Kategorisiere gefilterte Projekte
  const categorizedProjects = useMemo(() => {
    return {
      [PROJECT_CATEGORIES.ACTIVE]: filteredProjects.filter(p => getProjectCategory(p.status) === PROJECT_CATEGORIES.ACTIVE),
      [PROJECT_CATEGORIES.COMPLETED]: filteredProjects.filter(p => getProjectCategory(p.status) === PROJECT_CATEGORIES.COMPLETED),
      [PROJECT_CATEGORIES.CANCELLED]: filteredProjects.filter(p => getProjectCategory(p.status) === PROJECT_CATEGORIES.CANCELLED)
    };
  }, [filteredProjects]);

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

      // Berechne Gesamtkosten aus Buchungen
      const totalBookingCost = projectBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);

      // Berechne Gesamttage
      const totalDays = projectBookings.reduce((sum, b) => sum + (b.dates?.length || 0), 0);

      stats[project.id] = {
        freelancerCount: uniqueFreelancers.size,
        phaseCount: project.phases?.length || 0,
        totalBookingCost,
        totalDays
      };
    });
    return stats;
  }, [agencyProjects, bookings, agencyId]);

  // Aktuelle Projekte basierend auf Kategorie
  const currentProjects = categorizedProjects[activeCategory] || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projekte</h1>
        <div className="flex items-center gap-3">
          {/* Suchfeld */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen..."
              className="pl-9 pr-8 py-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowCreateProject(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm flex items-center gap-2 transition-all hover:shadow-[0_0_20px_var(--color-primary)]"
          >
            <Plus className="w-4 h-4" />
            Neues Projekt
          </button>
        </div>
      </div>

      {/* Kategorie-Tabs und Suchergebnis-Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
        {Object.values(PROJECT_CATEGORIES).map(category => {
          const count = categorizedProjects[category]?.length || 0;
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all border-2
                ${isActive
                  ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {CATEGORY_LABELS[category]}
              {count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        </div>

        {/* Suchergebnis-Info */}
        {searchQuery && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'Ergebnis' : 'Ergebnisse'} für "{searchQuery}"
          </p>
        )}
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
          <p>{searchQuery ? `Keine Treffer für "${searchQuery}" in dieser Kategorie.` : `Keine ${CATEGORY_LABELS[activeCategory].toLowerCase()}en Projekte.`}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentProjects.map(project => (
            <ProjectListCard
              key={project.id}
              project={project}
              stats={projectStats[project.id]}
              onClick={() => onSelectProject(project.id)}
              onUpdateProject={onUpdateProject}
            />
          ))}
        </div>
      )}

      {/* Projekt erstellen Modal */}
      {showCreateProject && (
        <CreateProjectModal
          clients={clients}
          onSave={handleCreateProject}
          onClose={() => setShowCreateProject(false)}
          onCreateClient={onCreateClient}
        />
      )}
    </div>
  );
};

/**
 * Kompakte Projektkarte für Listenansicht mit Farbwähler
 */
const ProjectListCard = ({ project, stats, onClick, onUpdateProject }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const colorPickerRef = useRef(null);
  const buttonRef = useRef(null);

  // Click-Outside Handler für Color Picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  // Position des Dropdowns berechnen
  const handleOpenColorPicker = (e) => {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.top - 10, // Oberhalb des Buttons
        left: rect.right - 250 // Rechtsbündig
      });
    }
    setShowColorPicker(!showColorPicker);
  };

  const budgetPercent = project.budget?.total > 0
    ? Math.round((project.budget.spent / project.budget.total) * 100)
    : 0;

  // Hole die Farbe des Projekts (unterstützt vordefinierte und Custom-Farben)
  const isCustomColor = project.color?.startsWith('#');
  const projectColor = isCustomColor
    ? null
    : (PROJECT_COLORS.find(c => c.id === project.color) || PROJECT_COLORS[0]);

  // Custom Color Styles
  const customStyles = isCustomColor ? {
    backgroundColor: hexToRgba(project.color, 0.1),
    borderColor: hexToRgba(project.color, 0.3),
    '--glow-color': project.color
  } : {
    '--glow-color': projectColor?.glow || 'gray'
  };

  const handleColorChange = (colorId) => {
    onUpdateProject?.(project.id, { color: colorId });
    setShowColorPicker(false);
  };

  const handleCustomColorChange = (e) => {
    onUpdateProject?.(project.id, { color: e.target.value });
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-card shadow-sm hover:shadow-md transition-all cursor-pointer border group ${
        isCustomColor ? '' : `${projectColor.bg} ${projectColor.border}`
      } hover:shadow-[0_0_20px_var(--glow-color)]`}
      style={customStyles}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">{project.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                {PROJECT_STATUS_LABELS[project.status] || 'Planung'}
              </span>
            </div>

            {/* Projektnummer & Kunde */}
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
              {project.projectNumber && (
                <span className="flex items-center gap-1 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  <Hash className="w-3 h-3" />
                  {project.projectNumber}
                </span>
              )}
              <span>{project.client}</span>
            </div>

            {/* Meta Info - Erste Zeile */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
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

              {/* Gebuchte Tage */}
              {stats.totalDays > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {stats.totalDays} Drehtage
                </span>
              )}
            </div>

          </div>

          {/* Rechte Seite: Kosten & Actions */}
          <div className="flex flex-col items-end gap-3 pl-4">
            {/* Projektkosten - prominent dargestellt */}
            {stats.totalBookingCost > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalBookingCost.toLocaleString('de-DE')} €
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Projektkosten
                </p>
              </div>
            )}

            {/* Budget-Fortschritt */}
            {project.budget?.total > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    {project.budget.spent.toLocaleString('de-DE')} / {project.budget.total.toLocaleString('de-DE')} €
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Budget</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Color Picker Button */}
              <button
                ref={buttonRef}
                onClick={handleOpenColorPicker}
                className="p-2 text-gray-300 dark:text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Farbe ändern"
              >
                <Palette className="w-5 h-5" />
              </button>
              {/* Pfeil */}
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Color Picker Dropdown - fixed positioning */}
          {showColorPicker && (
            <div
              ref={colorPickerRef}
              className="fixed p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-[9999]"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                transform: 'translateY(-100%)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Projektfarbe wählen</p>

              {/* Vordefinierte Farben */}
              <div className="flex gap-2 flex-wrap w-[220px] mb-4">
                {PROJECT_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color.id)}
                    className={`w-8 h-8 rounded-lg ${color.preview} transition-all ${
                      project.color === color.id || (!project.color && color.id === 'gray')
                        ? 'ring-2 ring-offset-2 ring-primary scale-110'
                        : 'hover:scale-110'
                    }`}
                    title={color.id}
                  />
                ))}
              </div>

              {/* Custom Color Picker - eigene Zeile */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Eigene Farbe</p>
                <div className="flex items-center gap-3">
                  <label
                    className={`w-10 h-10 rounded-lg cursor-pointer transition-all overflow-hidden border-2 ${
                      isCustomColor
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : 'border-dashed border-gray-300 dark:border-gray-600 hover:border-primary'
                    }`}
                    style={isCustomColor ? { backgroundColor: project.color, borderStyle: 'solid', borderColor: project.color } : {}}
                  >
                    <input
                      type="color"
                      value={isCustomColor ? project.color : '#6366f1'}
                      onChange={handleCustomColorChange}
                      className="w-14 h-14 -m-2 cursor-pointer"
                    />
                  </label>
                  {isCustomColor ? (
                    <div className="flex-1">
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{project.color}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Eigene Farbe aktiv</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Klicken zum Auswählen</p>
                  )}
                </div>
              </div>
            </div>
          )}
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
const CreateProjectModal = ({ clients = [], onSave, onClose, onCreateClient }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: null,
    clientContactId: null,
    projectNumber: '',
    purchaseOrderNumber: ''
  });

  // Ausgewählter Kunde
  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === formData.clientId);
  }, [clients, formData.clientId]);

  // Ausgewählter Kontakt
  const selectedContact = useMemo(() => {
    if (!selectedClient || !formData.clientContactId) return null;
    return selectedClient.contacts?.find(c => c.id === formData.clientContactId);
  }, [selectedClient, formData.clientContactId]);

  // Wenn Kunde gewechselt wird, Kontakt zurücksetzen und Primary-Kontakt auswählen
  const handleClientChange = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    const primaryContact = client?.contacts?.find(c => c.isPrimary) || client?.contacts?.[0];

    setFormData(prev => ({
      ...prev,
      clientId,
      clientContactId: primaryContact?.id || null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      // Kunden-Daten für Anzeige mitspeichern
      const projectData = {
        ...formData,
        // Legacy-Feld für Rückwärtskompatibilität
        client: selectedClient?.companyName || '',
        // Kontakt-Info für schnellen Zugriff
        contactPerson: selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : '',
        contactEmail: selectedContact?.email || '',
        contactPhone: selectedContact?.phone || ''
      };
      onSave(projectData);
    }
  };

  return (
    <ResizableModal
      title="Neues Projekt"
      onClose={onClose}
      defaultWidth={700}
      defaultHeight={750}
      minWidth={550}
      minHeight={600}
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

        {/* Kunde (CRM-Integration) */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Kunde</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Kunde auswählen
              </label>
              <ClientSelector
                clients={clients}
                selectedClientId={formData.clientId}
                onSelect={handleClientChange}
                onCreateNew={onCreateClient}
                placeholder="Kunde aus CRM auswählen..."
              />
            </div>

            {/* Ansprechpartner - nur wenn Kunde gewählt */}
            {selectedClient && selectedClient.contacts?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Ansprechpartner
                </label>
                <ContactSelector
                  contacts={selectedClient.contacts}
                  selectedContactId={formData.clientContactId}
                  onSelect={(contactId) => setFormData(prev => ({ ...prev, clientContactId: contactId }))}
                  placeholder="Ansprechpartner auswählen..."
                />
              </div>
            )}

            {/* Kunden-Info anzeigen wenn gewählt */}
            {selectedClient && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-1">
                    {selectedClient.address?.city && (
                      <p className="text-gray-600 dark:text-gray-400">
                        📍 {selectedClient.address.city}
                      </p>
                    )}
                    {selectedContact && (
                      <p className="text-gray-600 dark:text-gray-400">
                        👤 {selectedContact.firstName} {selectedContact.lastName}
                        {selectedContact.position && ` (${selectedContact.position})`}
                      </p>
                    )}
                    {selectedContact?.email && (
                      <p className="text-gray-500 dark:text-gray-500 text-xs">
                        ✉️ {selectedContact.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projektnummern */}
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bestellnummer (PO)
            </label>
            <input
              type="text"
              value={formData.purchaseOrderNumber}
              onChange={(e) => setFormData({ ...formData, purchaseOrderNumber: e.target.value })}
              placeholder="z.B. PO-12345"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
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
            disabled={!formData.name.trim()}
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
