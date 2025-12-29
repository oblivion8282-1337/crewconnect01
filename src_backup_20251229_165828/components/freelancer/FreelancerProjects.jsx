import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Users,
  Euro,
  Clock,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { formatDate } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isConfirmedStatus,
  isPendingStatus,
  isTerminalStatus
} from '../../constants/calendar';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../data/initialData';

/**
 * FreelancerProjects - Projektansicht für Freelancer
 * Zeigt nur die Phasen, in denen der Freelancer gebucht ist
 */
const FreelancerProjects = ({
  bookings,
  projects,
  freelancers,
  freelancerId
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);

  // Finde alle Projekte, in denen der Freelancer gebucht ist
  const myProjects = useMemo(() => {
    const myBookings = bookings.filter(b =>
      b.freelancerId === freelancerId &&
      !isTerminalStatus(b.status)
    );

    // Gruppiere nach Projekt
    const projectMap = new Map();

    myBookings.forEach(booking => {
      const project = projects.find(p => p.id === booking.projectId);
      if (!project) return;

      if (!projectMap.has(project.id)) {
        projectMap.set(project.id, {
          project,
          phases: new Map(),
          bookings: []
        });
      }

      const entry = projectMap.get(project.id);
      entry.bookings.push(booking);

      // Phase hinzufügen
      if (booking.phaseId && !entry.phases.has(booking.phaseId)) {
        const phase = project.phases?.find(p => p.id === booking.phaseId);
        if (phase) {
          entry.phases.set(booking.phaseId, phase);
        }
      }
    });

    return Array.from(projectMap.values());
  }, [bookings, projects, freelancerId]);

  // Aktuelle Auswahl
  const selectedProject = selectedProjectId
    ? myProjects.find(p => p.project.id === selectedProjectId)
    : null;

  const selectedPhase = selectedProject && selectedPhaseId
    ? selectedProject.phases.get(selectedPhaseId)
    : null;

  // Team in der ausgewählten Phase
  const phaseTeam = useMemo(() => {
    if (!selectedProject || !selectedPhaseId) return [];

    // Finde alle Buchungen für diese Phase (von allen Freelancern)
    const phaseBookings = bookings.filter(b =>
      b.projectId === selectedProject.project.id &&
      b.phaseId === selectedPhaseId &&
      isConfirmedStatus(b.status) &&
      b.freelancerId !== freelancerId
    );

    // Gruppiere nach Freelancer
    const teamMap = new Map();
    phaseBookings.forEach(booking => {
      const freelancer = freelancers.find(f => f.id === booking.freelancerId);
      if (freelancer && !teamMap.has(freelancer.id)) {
        teamMap.set(freelancer.id, {
          freelancer,
          booking
        });
      }
    });

    return Array.from(teamMap.values());
  }, [bookings, freelancers, selectedProject, selectedPhaseId, freelancerId]);

  // Meine Buchungen für die ausgewählte Phase
  const myPhaseBookings = useMemo(() => {
    if (!selectedProject || !selectedPhaseId) return [];
    return selectedProject.bookings.filter(b => b.phaseId === selectedPhaseId);
  }, [selectedProject, selectedPhaseId]);

  // Zurück-Handler
  const handleBack = () => {
    if (selectedPhaseId) {
      setSelectedPhaseId(null);
    } else {
      setSelectedProjectId(null);
    }
  };

  // Phase-Detail Ansicht
  if (selectedProject && selectedPhaseId && selectedPhase) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header mit Zurück */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Zurück zu {selectedProject.project.name}
        </button>

        {/* Phase Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{selectedPhase.icon || '📋'}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{selectedPhase.name}</h1>
              <p className="text-gray-600">{selectedProject.project.name}</p>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                {selectedPhase.startDate && selectedPhase.endDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedPhase.startDate)} – {formatDate(selectedPhase.endDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Meine Buchungen in dieser Phase */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Meine Buchungen
          </h2>

          {myPhaseBookings.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Keine Buchungen in dieser Phase</p>
          ) : (
            <div className="space-y-3">
              {myPhaseBookings.map(booking => (
                <div
                  key={booking.id}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{booking.agencyAvatar}</span>
                        <span className="font-medium">{booking.agencyName}</span>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {booking.dates.map(date => (
                      <span key={date} className="px-2 py-1 text-xs rounded bg-white border">
                        {formatDate(date)}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {booking.dates.length} Tag{booking.dates.length > 1 ? 'e' : ''}
                    </span>
                    <span className="font-bold">{booking.totalCost?.toLocaleString('de-DE')}€</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team in dieser Phase */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Team in dieser Phase
          </h2>

          {phaseTeam.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Keine weiteren Teammitglieder</p>
          ) : (
            <div className="grid gap-3">
              {phaseTeam.map(({ freelancer, booking }) => (
                <div
                  key={freelancer.id}
                  className="p-4 rounded-lg border border-gray-200 flex items-center gap-4"
                >
                  <span className="text-3xl">{freelancer.avatar}</span>
                  <div className="flex-1">
                    <p className="font-medium">
                      {freelancer.firstName} {freelancer.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {freelancer.professions?.[0] || 'Freelancer'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{booking.dates.length} Tag{booking.dates.length > 1 ? 'e' : ''}</p>
                    <p>{formatDate(booking.dates[0])} – {formatDate(booking.dates[booking.dates.length - 1])}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Projekt-Detail Ansicht (Phasen-Liste)
  if (selectedProject) {
    const phases = Array.from(selectedProject.phases.values());

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header mit Zurück */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Zurück zur Übersicht
        </button>

        {/* Projekt Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{selectedProject.project.name}</h1>
              <p className="text-gray-600">{selectedProject.project.client}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${PROJECT_STATUS_COLORS[selectedProject.project.status] || 'bg-gray-100'}`}>
              {PROJECT_STATUS_LABELS[selectedProject.project.status] || 'Planung'}
            </span>
          </div>

          {selectedProject.project.description && (
            <p className="text-gray-600 mb-4">{selectedProject.project.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {selectedProject.project.startDate && selectedProject.project.endDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(selectedProject.project.startDate)} – {formatDate(selectedProject.project.endDate)}
              </span>
            )}
          </div>
        </div>

        {/* Meine Phasen */}
        <h2 className="font-semibold mb-4">Meine Phasen ({phases.length})</h2>

        <div className="space-y-3">
          {phases.map(phase => {
            const phaseBookings = selectedProject.bookings.filter(b => b.phaseId === phase.id);
            const totalDays = phaseBookings.reduce((sum, b) => sum + b.dates.length, 0);
            const totalCost = phaseBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);

            return (
              <div
                key={phase.id}
                onClick={() => setSelectedPhaseId(phase.id)}
                className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{phase.icon || '📋'}</span>
                    <div>
                      <h3 className="font-bold">{phase.name}</h3>
                      {phase.startDate && phase.endDate && (
                        <p className="text-sm text-gray-500">
                          {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold">{totalCost.toLocaleString('de-DE')}€</p>
                      <p className="text-sm text-gray-500">{totalDays} Tag{totalDays > 1 ? 'e' : ''}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Projekt-Liste
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Meine Projekte</h1>

      {myProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          <p className="mb-2">Du hast noch keine aktiven Projekte.</p>
          <p className="text-sm">Sobald eine Agentur dich bucht, erscheinen die Projekte hier.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myProjects.map(({ project, phases, bookings: projectBookings }) => {
            const totalDays = projectBookings.reduce((sum, b) => sum + b.dates.length, 0);
            const totalCost = projectBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
            const phaseCount = phases.size;

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-bold text-lg">{project.name}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100'}`}>
                        {PROJECT_STATUS_LABELS[project.status] || 'Planung'}
                      </span>
                    </div>
                    <p className="text-gray-600">{project.client}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {totalDays} Tag{totalDays > 1 ? 'e' : ''} gebucht
                  </span>
                  <span className="flex items-center gap-1">
                    📋 {phaseCount} Phase{phaseCount > 1 ? 'n' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    {totalCost.toLocaleString('de-DE')}€
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FreelancerProjects;
