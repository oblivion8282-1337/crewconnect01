import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Palette,
  Save,
  MapPin,
  Briefcase,
  ExternalLink,
  FileText
} from 'lucide-react';
import { getIndustryLabel } from '../../constants/clients';
import FreelancerSearchModal from '../modals/FreelancerSearchModal';
import { ProjectCrewSection } from './team';
import DateRangePicker from '../shared/DateRangePicker';
import ResizableModal from '../shared/ResizableModal';
import { ProfileAvatar } from '../shared/ProfileField';
import { formatDate } from '../../utils/dateUtils';
import { useUnsavedChangesContext } from '../../contexts/UnsavedChangesContext';
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

// Vordefinierte Farben für Phasen
const PHASE_COLORS = [
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
 * ProjectDetail - Detailansicht eines Projekts
 */
/**
 * Bestätigungs-Modal für kritische Aktionen
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = 'red', icon: Icon }) => {
  if (!isOpen) return null;

  const colorClasses = {
    red: {
      bg: 'bg-red-100 dark:bg-red-900/40',
      icon: 'text-red-600 dark:text-red-400',
      button: 'bg-red-600 hover:bg-red-700'
    },
    green: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/40',
      icon: 'text-emerald-600 dark:text-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-700'
    }
  };

  const colors = colorClasses[confirmColor] || colorClasses.red;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${colors.icon}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 ${colors.button} text-white rounded-xl font-medium transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectDetail = ({
  project,
  bookings,
  freelancers,
  agencyId,
  agencyProfile,
  getDayStatus,
  onBack,
  onBackToProjects,
  onBook,
  onConvertToFix,
  onWithdraw,
  onUpdateProject,
  onDeleteProject,
  onCancelProjectBookings,
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
  onOpenAddToListModal,
  // Chat Props
  getOrCreateChat,
  onOpenChat,
  // CRM Props
  client,
  onNavigateToClient,
  // Team Props (interne Mitarbeiter)
  teamMembers,
  teamAssignments,
  onAddTeamAssignment,
  onRemoveTeamAssignment,
  checkTeamConflicts
}) => {
  const [searchContext, setSearchContext] = useState(null);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null });

  // Ungespeicherte Änderungen tracken (globaler Context)
  const { setUnsaved, clearUnsaved, confirmNavigation } = useUnsavedChangesContext();

  // Wenn editingSection aktiv ist, gibt es ungespeicherte Änderungen
  useEffect(() => {
    setUnsaved(editingSection !== null);
  }, [editingSection, setUnsaved]);

  // Sichere Navigation mit Warnung bei ungespeicherten Änderungen
  const handleSafeBack = () => {
    if (confirmNavigation('Du hast ungespeicherte Änderungen. Möchtest du wirklich zurück?')) {
      setEditingSection(null);
      setEditData({});
      clearUnsaved();
      onBack();
    }
  };

  const handleSafeBackToProjects = () => {
    if (confirmNavigation('Du hast ungespeicherte Änderungen. Möchtest du wirklich zurück?')) {
      setEditingSection(null);
      setEditData({});
      clearUnsaved();
      onBackToProjects();
    }
  };

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

  // Ausgaben-Berechnung: Summe aller Buchungskosten
  const totalExpenses = useMemo(() => {
    return projectBookings.reduce((sum, booking) => sum + (booking.totalCost || 0), 0);
  }, [projectBookings]);

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

  // Projekt-Farbe für Breadcrumb
  const isProjectCustomColor = project.color?.startsWith('#');
  const projectColorDef = isProjectCustomColor
    ? null
    : (PHASE_COLORS.find(c => c.id === project.color) || PHASE_COLORS[1]); // Default: blue

  const projectBreadcrumbStyle = isProjectCustomColor ? {
    backgroundColor: hexToRgba(project.color, 0.15),
    color: project.color,
    borderColor: hexToRgba(project.color, 0.3)
  } : {};

  const projectBreadcrumbClass = isProjectCustomColor
    ? 'border'
    : `${projectColorDef.bg} ${projectColorDef.text} ${projectColorDef.border}`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb Navigation - mit Projektfarbe */}
      <nav className="flex items-center gap-3 mb-6">
        <button
          onClick={handleSafeBackToProjects}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Projekte
        </button>
        <span className="text-gray-400 dark:text-gray-500">→</span>
        <span
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${projectBreadcrumbClass}`}
          style={projectBreadcrumbStyle}
        >
          {project.name}
        </span>
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
                  {/* Projektname */}
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{project.name}</h1>

                  {/* Metadaten Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Kunde */}
                    <div>
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Kunde</p>
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        {project.client}
                      </span>
                    </div>

                    {/* Projektnummer */}
                    <div>
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Projektnummer</p>
                      {project.projectNumber ? (
                        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-mono">
                          #{project.projectNumber}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">Nicht vergeben</span>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </span>
                    </div>

                    {/* Zeitraum */}
                    <div>
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Zeitraum</p>
                      {(project.startDate || project.endDate) ? (
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {project.startDate && project.endDate
                            ? `${formatDate(project.startDate)} – ${formatDate(project.endDate)}`
                            : project.startDate
                              ? `Ab ${formatDate(project.startDate)}`
                              : `Bis ${formatDate(project.endDate)}`
                          }
                        </p>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">Nicht festgelegt</span>
                      )}
                    </div>
                  </div>

                  {/* Beschreibung */}
                  {project.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">{project.description}</p>
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
                    projectNumber: project.projectNumber || '',
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

      {/* Kunde & Ansprechpartner */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kunde</h2>
          </div>
          {client && onNavigateToClient && (
            <button
              onClick={() => onNavigateToClient(client.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Im CRM öffnen
            </button>
          )}
        </div>

        {client ? (
          // CRM-Kunde verknüpft - Zeige alle Details
          <div className="space-y-4">
            {/* Firmeninfo */}
            <div className="flex items-start gap-4">
              {/* Logo/Initialen */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                {client.logo ? (
                  <img src={client.logo} alt={client.companyName} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <span className="text-xl font-bold text-primary">
                    {client.companyName?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {client.companyName}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {client.industry && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {getIndustryLabel(client.industry)}
                    </span>
                  )}
                  {client.address?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {client.address.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ansprechpartner */}
            {(() => {
              const contact = client.contacts?.find(c => c.id === project.clientContactId)
                || client.contacts?.find(c => c.isPrimary)
                || client.contacts?.[0];

              if (!contact) return null;

              return (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                    Ansprechpartner
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {contact.firstName?.[0]}{contact.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contact.firstName} {contact.lastName}
                        {contact.isPrimary && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                            Hauptkontakt
                          </span>
                        )}
                      </p>
                      {contact.position && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{contact.position}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-primary">
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-primary">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bestellnummer */}
            {project.purchaseOrderNumber && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  Bestellnummer (PO)
                </p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  {project.purchaseOrderNumber}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Kein CRM-Kunde - Zeige Legacy-Daten oder "Kein Kunde"
          <div>
            {project.client ? (
              <div className="space-y-3">
                <p className="font-medium text-gray-900 dark:text-white">{project.client}</p>
                {(project.contactPerson || project.clientContact?.name) && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                      Ansprechpartner
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {project.contactPerson || project.clientContact?.name}
                      </p>
                      {(project.contactEmail || project.clientContact?.email) && (
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          {project.contactEmail || project.clientContact?.email}
                        </p>
                      )}
                      {(project.contactPhone || project.clientContact?.phone) && (
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          {project.contactPhone || project.clientContact?.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                Kein Kunde zugeordnet
              </p>
            )}
          </div>
        )}
      </div>

      {/* Gesamt-Ausgaben */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gesamt-Ausgaben</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalExpenses.toLocaleString('de-DE')} €
          </p>
        </div>

        {project.phases?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {project.phases.map(phase => {
              const phaseBookings = projectBookings.filter(b => b.phaseId === phase.id);
              const phaseExpenses = phaseBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
              const phaseDates = phaseBookings.flatMap(b => b.dates).sort();
              const startDate = phaseDates[0];
              const endDate = phaseDates[phaseDates.length - 1];

              return (
                <div key={phase.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{phase.name}</p>
                      {startDate && endDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(startDate)} – {formatDate(endDate)}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {phaseExpenses.toLocaleString('de-DE')} €
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
              <strong>Phasen</strong> sind die verschiedenen Abschnitte deines Projekts (z.B. Drehphase, Schnittphase, etc.).
              Für jede Phase kannst du separat Freelancer suchen und buchen.
            </p>

            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-primary rounded-xl animate-ping opacity-30" style={{ animationDuration: '2s' }} />
              <button
                onClick={() => setShowAddPhase(true)}
                className="relative inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              >
                <Plus className="w-5 h-5" />
                Erste Phase erstellen
              </button>
            </div>

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
                  onUpdatePhase={onUpdatePhase}
                  onSelectPhase={onSelectPhase}
                />
              ))}
            </div>

            <button
              onClick={() => setShowAddPhase(true)}
              className="w-full mt-4 py-3 border-2 border-dashed border-primary/50 rounded-lg text-primary hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Phase hinzufügen
            </button>
          </>
        )}
      </div>

      {/* Phasen-Timeline */}
      <div className="mb-6">
        <PhaseTimeline
          phases={project.phases || []}
          bookings={projectBookings}
          onSelectPhase={onSelectPhase}
        />
      </div>

      {/* Team */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Team ({team.length})
        </h2>

        {team.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Noch niemand gebucht</p>
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

      {/* Interne Crew */}
      {teamMembers && teamMembers.length > 0 && (
        <div className="mb-6">
          <ProjectCrewSection
            project={project}
            teamMembers={teamMembers}
            assignments={teamAssignments || []}
            onAddAssignment={onAddTeamAssignment}
            onRemoveAssignment={onRemoveTeamAssignment}
            checkConflicts={checkTeamConflicts}
          />
        </div>
      )}

      {/* Projekt-Aktionen */}
      {project.status !== PROJECT_STATUS.COMPLETED && project.status !== PROJECT_STATUS.CANCELLED && (
        <div className="mt-6 space-y-4">
          {/* Projekt abschließen */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-card p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Projekt abschließen</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3">
                  Markiere dieses Projekt als erfolgreich abgeschlossen. Es wird in den Tab "Abgeschlossen" verschoben.
                </p>
                <button
                  onClick={() => setConfirmModal({ isOpen: true, type: 'complete' })}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Projekt abschließen
                </button>
              </div>
            </div>
          </div>

          {/* Projekt stornieren */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-card p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">Projekt abbrechen</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  Brich dieses Projekt ab. <strong>Alle offenen Buchungen werden automatisch storniert</strong> und die Freelancer werden benachrichtigt. Das Projekt wird in den Tab "Abgebrochen" verschoben.
                </p>
                <button
                  onClick={() => setConfirmModal({ isOpen: true, type: 'cancel' })}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Projekt abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {searchContext && (
        <FreelancerSearchModal
          project={searchContext.project}
          phase={searchContext.phase}
          freelancers={freelancers}
          getDayStatus={getDayStatus}
          agencyId={agencyId}
          agencyProfile={agencyProfile}
          onBook={onBook}
          onClose={() => setSearchContext(null)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          crewLists={crewLists}
          getListsForFreelancer={getListsForFreelancer}
          onAddToList={onAddToList}
          onRemoveFromList={onRemoveFromList}
          onOpenAddToListModal={onOpenAddToListModal}
          getOrCreateChat={getOrCreateChat}
          onOpenChat={onOpenChat}
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

      {/* Bestätigungs-Modal: Projekt abschließen */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'complete'}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onConfirm={() => {
          onUpdateProject(project.id, { status: PROJECT_STATUS.COMPLETED });
          onBack();
        }}
        title="Projekt abschließen?"
        message={`Möchtest du "${project.name}" als abgeschlossen markieren? Das Projekt wird in den Tab "Abgeschlossen" verschoben.`}
        confirmText="Ja, abschließen"
        confirmColor="green"
        icon={CheckCircle}
      />

      {/* Bestätigungs-Modal: Projekt abbrechen */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'cancel'}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onConfirm={() => {
          // Erst alle Buchungen stornieren
          if (onCancelProjectBookings) {
            onCancelProjectBookings(project.id, 'Projekt wurde abgebrochen');
          }
          // Dann Projekt-Status ändern
          onUpdateProject(project.id, { status: PROJECT_STATUS.CANCELLED });
          onBack();
        }}
        title="Projekt abbrechen?"
        message={(() => {
          const activeBookings = projectBookings.filter(b => !['declined', 'withdrawn', 'cancelled'].includes(b.status));
          if (activeBookings.length > 0) {
            return `Möchtest du "${project.name}" wirklich abbrechen? ${activeBookings.length} aktive Buchung(en) werden storniert und die Freelancer werden benachrichtigt. Diese Aktion kann nicht rückgängig gemacht werden.`;
          }
          return `Möchtest du "${project.name}" wirklich abbrechen? Diese Aktion kann nicht rückgängig gemacht werden.`;
        })()}
        confirmText="Ja, abbrechen"
        confirmColor="red"
        icon={AlertTriangle}
      />
    </div>
  );
};

/**
 * Phasen-Timeline - Visuelle Übersicht aller Phasen im Projekt
 * Design wie die Freelancer-Timeline in PhaseDetail
 */
const PhaseTimeline = ({ phases, bookings, onSelectPhase }) => {
  const [zoomLevel, setZoomLevel] = useState(2);
  const timelineContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Container-Breite messen für Zoom-Level 0
  useEffect(() => {
    if (timelineContainerRef.current) {
      setContainerWidth(timelineContainerRef.current.clientWidth);
    }
  }, []);

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

  // Dynamische Zellbreite (Zoom 0 = fit-all)
  const getCellWidth = useMemo(() => {
    if (zoomLevel === 0 && containerWidth > 0 && timelineDays.length > 0) {
      const nameColumnWidth = 200;
      const availableWidth = containerWidth - nameColumnWidth - 20;
      return Math.max(16, Math.floor(availableWidth / timelineDays.length));
    }
    return [20, 28, 36, 48, 64][zoomLevel];
  }, [zoomLevel, containerWidth, timelineDays.length]);

  // Farben für Phasen mit Gradient
  const phaseColors = [
    { gradient: 'from-blue-400 to-blue-500', shadow: 'shadow-blue-200 dark:shadow-blue-900', light: 'bg-blue-50', text: 'text-blue-700' },
    { gradient: 'from-emerald-400 to-emerald-500', shadow: 'shadow-emerald-200 dark:shadow-emerald-900', light: 'bg-emerald-50', text: 'text-emerald-700' },
    { gradient: 'from-amber-400 to-amber-500', shadow: 'shadow-amber-200 dark:shadow-amber-900', light: 'bg-amber-50', text: 'text-amber-700' },
    { gradient: 'from-violet-400 to-violet-500', shadow: 'shadow-violet-200 dark:shadow-violet-900', light: 'bg-violet-50', text: 'text-violet-700' },
    { gradient: 'from-rose-400 to-rose-500', shadow: 'shadow-rose-200 dark:shadow-rose-900', light: 'bg-rose-50', text: 'text-rose-700' },
    { gradient: 'from-cyan-400 to-cyan-500', shadow: 'shadow-cyan-200 dark:shadow-cyan-900', light: 'bg-cyan-50', text: 'text-cyan-700' }
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
          <div
            ref={timelineContainerRef}
            className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900"
          >
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {/* Month Header Row */}
                <div className="flex bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  {/* Sticky empty cell for name column */}
                  <div
                    className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"
                    style={{ width: '200px', minWidth: '200px' }}
                  />
                  {/* Month spans */}
                  <div className="flex">
                    {(() => {
                      const months = [];
                      let currentMonth = null;
                      let startIndex = 0;

                      timelineDays.forEach((day, index) => {
                        const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`;
                        if (monthKey !== currentMonth) {
                          if (currentMonth !== null) {
                            months.push({
                              key: currentMonth,
                              label: timelineDays[startIndex].date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
                              span: index - startIndex
                            });
                          }
                          currentMonth = monthKey;
                          startIndex = index;
                        }
                      });
                      // Push last month
                      if (currentMonth !== null) {
                        months.push({
                          key: currentMonth,
                          label: timelineDays[startIndex].date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
                          span: timelineDays.length - startIndex
                        });
                      }

                      return months.map((month, idx) => (
                        <div
                          key={month.key}
                          className={`flex items-center justify-center py-1.5 text-xs font-semibold text-primary border-r border-gray-200 dark:border-gray-700 ${
                            idx > 0 ? 'border-l-2 border-l-primary/30' : ''
                          }`}
                          style={{ width: `${month.span * getCellWidth}px`, minWidth: `${month.span * getCellWidth}px` }}
                        >
                          {month.label}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Date Header Row */}
                <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  {/* Sticky Phase Column Header */}
                  <div
                    className="sticky left-0 z-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center px-4"
                    style={{ width: '200px', minWidth: '200px' }}
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

                      return (
                        <div
                          key={day.dateStr}
                          className={`flex flex-col items-center justify-center py-2 border-r border-gray-100 dark:border-gray-700 ${
                            isWeekend ? 'bg-gray-50 dark:bg-gray-900' : ''
                          } ${isFirstOfMonth ? 'border-l-2 border-l-gray-300 dark:border-l-gray-600' : ''}`}
                          style={{ width: `${getCellWidth}px`, minWidth: `${getCellWidth}px` }}
                        >
                          {getCellWidth >= 28 && (
                            <div className={`text-[10px] font-medium ${isWeekend ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                              {day.date.toLocaleDateString('de-DE', { weekday: getCellWidth >= 40 ? 'short' : 'narrow' })}
                            </div>
                          )}
                          <div className={`text-sm font-bold ${isWeekend ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
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

                  return (
                    <div
                      key={phase.id}
                      className="flex cursor-pointer bg-white dark:bg-gray-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => onSelectPhase?.(phase)}
                    >
                      {/* Sticky Phase Name */}
                      <div
                        className="sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800"
                        style={{ width: '200px', minWidth: '200px' }}
                      >
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${color.gradient} shadow-sm flex-shrink-0`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {phase.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {phase.bookingCount} Buchung{phase.bookingCount !== 1 ? 'en' : ''}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      </div>

                      {/* Day Cells */}
                      <div className="flex items-stretch">
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
                              className={`border-r border-gray-100 dark:border-gray-700 flex items-center justify-center py-1.5 px-0.5 ${
                                isWeekend ? 'bg-gray-100/50 dark:bg-gray-700/30' : ''
                              }`}
                              style={{ width: `${getCellWidth}px`, minWidth: `${getCellWidth}px` }}
                            >
                              {isInPhase && (
                                <div
                                  className={`w-full h-full min-h-[28px] bg-gradient-to-b ${color.gradient} shadow-sm ${color.shadow} ${
                                    isPhaseStart && isPhaseEnd ? 'rounded-lg' :
                                    isPhaseStart ? 'rounded-l-lg' :
                                    isPhaseEnd ? 'rounded-r-lg' : ''
                                  } ${hasBooking ? 'opacity-100' : 'opacity-40'} transition-all hover:scale-105 hover:z-10`}
                                  title={`${phase.name}\n${formatDate(phase.effectiveStart)} - ${formatDate(phase.effectiveEnd)}`}
                                />
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

          {/* Legende */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-6 text-xs">
              <span className="text-gray-400 dark:text-gray-500 font-medium">Phasen:</span>
              {phaseRanges.slice(0, 4).map((phase, index) => {
                const color = phaseColors[index % phaseColors.length];
                return (
                  <span key={phase.id} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded bg-gradient-to-b ${color.gradient} shadow-sm`} />
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
  onUpdatePhase,
  onSelectPhase
}) => {
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
        top: rect.top - 10,
        left: rect.right - 250
      });
    }
    setShowColorPicker(!showColorPicker);
  };

  const confirmedCount = bookings.filter(b => isConfirmedStatus(b.status)).length;
  const pendingCount = bookings.filter(b => isPendingStatus(b.status)).length;
  const totalBookings = bookings.length;

  // Berechne Ausgaben (Summe aller Buchungskosten)
  const totalSpent = useMemo(() =>
    bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0),
    [bookings]
  );

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

  // Hole die Farbe der Phase (unterstützt vordefinierte und Custom-Farben)
  const isCustomColor = phase.color?.startsWith('#');
  const phaseColor = isCustomColor
    ? null
    : (PHASE_COLORS.find(c => c.id === phase.color) || PHASE_COLORS[0]);

  // Custom Color Styles
  const customStyles = isCustomColor ? {
    backgroundColor: hexToRgba(phase.color, 0.1),
    borderColor: hexToRgba(phase.color, 0.3),
    '--glow-color': phase.color
  } : {
    '--glow-color': phaseColor?.glow || 'gray'
  };

  const handleColorChange = (colorId) => {
    onUpdatePhase?.(projectId, phase.id, { color: colorId });
    setShowColorPicker(false);
  };

  const handleCustomColorChange = (e) => {
    onUpdatePhase?.(projectId, phase.id, { color: e.target.value });
  };

  return (
    <div
      className={`relative border rounded-xl p-4 cursor-pointer transition-all group ${
        isCustomColor ? '' : `${phaseColor.bg} ${phaseColor.border}`
      } hover:shadow-[0_0_20px_var(--glow-color)]`}
      style={customStyles}
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
              {totalSpent > 0 && ` • ${totalSpent.toLocaleString('de-DE')} €`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {confirmedCount > 0 && (
            <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-lg text-xs font-medium">
              {confirmedCount} {confirmedCount === 1 ? 'Buchung' : 'Buchungen'}
            </span>
          )}
          {pendingCount > 0 && (
            <span className="px-2 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-800 rounded-lg text-xs font-medium">
              {pendingCount} {pendingCount === 1 ? 'Anfrage' : 'Anfragen'}
            </span>
          )}
          {totalBookings === 0 && (
            <span className="px-2 py-1 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 rounded-lg text-xs">
              Keine Buchungen
            </span>
          )}
          {/* Color Picker Button */}
          <button
            ref={buttonRef}
            onClick={handleOpenColorPicker}
            className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Farbe ändern"
          >
            <Palette className="w-4 h-4" />
          </button>

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
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Phasenfarbe wählen</p>

              {/* Vordefinierte Farben */}
              <div className="flex gap-2 flex-wrap w-[220px] mb-4">
                {PHASE_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color.id)}
                    className={`w-8 h-8 rounded-lg ${color.preview} transition-all ${
                      phase.color === color.id || (!phase.color && color.id === 'gray')
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
                    style={isCustomColor ? { backgroundColor: phase.color, borderStyle: 'solid', borderColor: phase.color } : {}}
                  >
                    <input
                      type="color"
                      value={isCustomColor ? phase.color : '#6366f1'}
                      onChange={handleCustomColorChange}
                      className="w-14 h-14 -m-2 cursor-pointer"
                    />
                  </label>
                  {isCustomColor ? (
                    <div className="flex-1">
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{phase.color}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Eigene Farbe aktiv</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Klicken zum Auswählen</p>
                  )}
                </div>
              </div>
            </div>
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
          <ProfileAvatar
            imageUrl={freelancer.profileImage}
            firstName={freelancer.firstName}
            lastName={freelancer.lastName}
            size="md"
          />
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Projektname</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
          <select
            value={data.status || PROJECT_STATUS.PLANNING}
            onChange={(e) => onChange({ ...data, status: e.target.value })}
            className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          >
            {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kunde</label>
          <input
            type="text"
            value={data.client || ''}
            onChange={(e) => onChange({ ...data, client: e.target.value })}
            className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Projektnummer</label>
          <input
            type="text"
            value={data.projectNumber || ''}
            onChange={(e) => onChange({ ...data, projectNumber: e.target.value })}
            placeholder="z.B. PRJ-2025-001"
            className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Beschreibung</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={2}
          className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Zeitraum</label>
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-left flex items-center justify-between hover:border-gray-400 transition-colors"
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

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={onSave}
          className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Speichern
        </button>
      </div>
    </div>
  );
};

const ClientEditForm = ({ data, onChange, onSave, onCancel }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ansprechpartner</label>
      <input
        type="text"
        value={data.name || ''}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">E-Mail</label>
      <input
        type="email"
        value={data.email || ''}
        onChange={(e) => onChange({ ...data, email: e.target.value })}
        className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Telefon</label>
      <input
        type="tel"
        value={data.phone || ''}
        onChange={(e) => onChange({ ...data, phone: e.target.value })}
        className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
      />
    </div>
    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={onCancel}
        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
      >
        Abbrechen
      </button>
      <button
        onClick={onSave}
        className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
      >
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
    color: 'gray'
  });

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
      defaultWidth={450}
      defaultHeight={380}
      minWidth={350}
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hintergrundfarbe</label>
          <div className="flex gap-2 flex-wrap items-center">
            {PHASE_COLORS.map(color => (
              <button
                key={color.id}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.id })}
                className={`w-8 h-8 rounded-lg ${color.preview} transition-all ${
                  formData.color === color.id
                    ? 'ring-2 ring-offset-2 ring-primary scale-110'
                    : 'hover:scale-105'
                }`}
                title={color.id}
              />
            ))}
            {/* Custom Color Picker */}
            <label className={`w-8 h-8 rounded-lg cursor-pointer transition-all overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 ${
              formData.color?.startsWith('#') ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105 hover:border-gray-400'
            }`}
              style={formData.color?.startsWith('#') ? { backgroundColor: formData.color, borderStyle: 'solid', borderColor: formData.color } : {}}
              title="Eigene Farbe wählen"
            >
              <input
                type="color"
                value={formData.color?.startsWith('#') ? formData.color : '#6366f1'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-12 -m-2 cursor-pointer opacity-0"
              />
              {!formData.color?.startsWith('#') && (
                <span className="flex items-center justify-center w-full h-full text-gray-400 text-lg">+</span>
              )}
            </label>
          </div>
          {formData.color?.startsWith('#') && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Custom: {formData.color}
            </p>
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
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 font-medium"
          >
            Phase hinzufügen
          </button>
        </div>
      </form>
    </ResizableModal>
  );
};

export default ProjectDetail;
