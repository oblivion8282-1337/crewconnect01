import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  User,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

/**
 * ProjectCrewSection - Zeigt interne Team-Mitglieder die einem Projekt zugewiesen sind
 *
 * @param {Object} project - Das aktuelle Projekt
 * @param {Array} teamMembers - Alle Team-Mitglieder
 * @param {Array} assignments - Alle Zuweisungen aus useTeam
 * @param {Function} onAddAssignment - Zuweisung hinzufügen
 * @param {Function} onRemoveAssignment - Zuweisung entfernen
 * @param {Function} checkConflicts - Konflikte prüfen
 */
const ProjectCrewSection = ({
  project,
  teamMembers = [],
  assignments = [],
  onAddAssignment,
  onRemoveAssignment,
  checkConflicts
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState({});

  // Zuweisungen für dieses Projekt
  const projectAssignments = useMemo(() => {
    return assignments.filter(a => a.projectId === project?.id);
  }, [assignments, project?.id]);

  // Gruppiert nach Phase
  const assignmentsByPhase = useMemo(() => {
    const byPhase = {};
    projectAssignments.forEach(assignment => {
      const phaseId = assignment.phaseId;
      if (!byPhase[phaseId]) {
        byPhase[phaseId] = [];
      }
      byPhase[phaseId].push(assignment);
    });
    return byPhase;
  }, [projectAssignments]);

  // Eindeutige Mitglieder im Projekt
  const uniqueMembers = useMemo(() => {
    const memberIds = new Set(projectAssignments.map(a => a.memberId));
    return teamMembers.filter(m => memberIds.has(m.id));
  }, [projectAssignments, teamMembers]);

  const getMemberById = (id) => teamMembers.find(m => m.id === id);

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const handleOpenAddModal = (phase) => {
    setSelectedPhase(phase);
    setShowAddModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Interne Crew ({uniqueMembers.length})
        </h2>
      </div>

      {project?.phases?.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 text-center py-8">
          Erstelle zuerst Phasen, um Team-Mitglieder einzuplanen
        </p>
      ) : uniqueMembers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500 mb-4">
            Noch keine internen Mitarbeiter eingeplant
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Plane Mitarbeiter über die einzelnen Phasen ein
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Übersicht: Alle eingeplanten Mitarbeiter */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
            {uniqueMembers.map(member => {
              const memberAssignments = projectAssignments.filter(a => a.memberId === member.id);
              const totalDays = new Set(memberAssignments.map(a => a.date)).size;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.firstName} {member.lastName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({totalDays} Tage)
                  </span>
                </div>
              );
            })}
          </div>

          {/* Nach Phase */}
          <div className="space-y-2">
            {project?.phases?.map(phase => {
              const phaseAssignments = assignmentsByPhase[phase.id] || [];
              const isExpanded = expandedPhases[phase.id];

              return (
                <div
                  key={phase.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Phase Header */}
                  <div
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => togglePhase(phase.id)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {phase.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({phaseAssignments.length} Einplanungen)
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(phase);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Mitarbeiter
                    </button>
                  </div>

                  {/* Phase Content */}
                  {isExpanded && (
                    <div className="p-3 space-y-2">
                      {phaseAssignments.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                          Keine Mitarbeiter für diese Phase eingeplant
                        </p>
                      ) : (
                        phaseAssignments.map(assignment => {
                          const member = getMemberById(assignment.memberId);
                          if (!member) return null;

                          return (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                {member.avatar ? (
                                  <img
                                    src={member.avatar}
                                    alt={`${member.firstName} ${member.lastName}`}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {member.firstName} {member.lastName}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(assignment.date).toLocaleDateString('de-DE')}
                                    {assignment.startTime && assignment.endTime && (
                                      <>
                                        <Clock className="w-3 h-3 ml-2" />
                                        {assignment.startTime} - {assignment.endTime}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => onRemoveAssignment?.(assignment.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Einplanung entfernen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddModal && selectedPhase && (
        <AddAssignmentModal
          phase={selectedPhase}
          project={project}
          teamMembers={teamMembers}
          existingAssignments={assignmentsByPhase[selectedPhase.id] || []}
          onAdd={(assignment) => {
            onAddAssignment?.(assignment);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
          checkConflicts={checkConflicts}
        />
      )}
    </div>
  );
};

/**
 * Modal zum Hinzufügen einer neuen Zuweisung
 */
const AddAssignmentModal = ({
  phase,
  project,
  teamMembers,
  existingAssignments,
  onAdd,
  onClose,
  checkConflicts
}) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [date, setDate] = useState(phase.startDate || '');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [note, setNote] = useState('');
  const [conflicts, setConflicts] = useState([]);

  // Prüfe Konflikte wenn sich Member oder Datum ändert
  const handleMemberChange = (memberId) => {
    setSelectedMember(memberId);
    if (memberId && date) {
      const memberConflicts = checkConflicts?.(parseInt(memberId), date);
      setConflicts(memberConflicts || []);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (selectedMember && newDate) {
      const memberConflicts = checkConflicts?.(parseInt(selectedMember), newDate);
      setConflicts(memberConflicts || []);
    }
  };

  const handleSubmit = () => {
    if (!selectedMember || !date) return;

    onAdd({
      memberId: parseInt(selectedMember),
      projectId: project.id,
      phaseId: phase.id,
      date,
      startTime,
      endTime,
      note
    });
  };

  // Bereits eingeplante Member für dieses Datum filtern
  const alreadyAssignedToday = existingAssignments
    .filter(a => a.date === date)
    .map(a => a.memberId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Mitarbeiter einplanen
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Phase: <strong className="text-gray-900 dark:text-white">{phase.name}</strong>
          </div>

          {/* Mitarbeiter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mitarbeiter *
            </label>
            <select
              value={selectedMember}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Mitarbeiter auswählen...</option>
              {teamMembers
                .filter(m => m.role !== 'projectlead') // Projektleitung nicht manuell einplanen
                .map(member => (
                  <option
                    key={member.id}
                    value={member.id}
                    disabled={alreadyAssignedToday.includes(member.id)}
                  >
                    {member.firstName} {member.lastName}
                    {alreadyAssignedToday.includes(member.id) ? ' (bereits eingeplant)' : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Datum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Datum *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={phase.startDate}
              max={phase.endDate}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Konflikt-Warnung */}
          {conflicts.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-400">
                <p className="font-medium">Mögliche Konflikte:</p>
                <ul className="mt-1 list-disc list-inside">
                  {conflicts.map((conflict, idx) => (
                    <li key={idx}>{conflict.type}: {conflict.description}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Zeiten */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Startzeit
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Endzeit
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Notiz */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notiz (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="z.B. Setup vor Ort"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedMember || !date}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Einplanen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCrewSection;
