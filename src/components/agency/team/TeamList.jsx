import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Settings,
  Calendar,
  ArrowLeft,
  Shield,
  UserCheck
} from 'lucide-react';
import TeamMemberCard from './TeamMemberCard';
import TeamMemberDetail from './TeamMemberDetail';
import AbsenceRequestsPanel from './AbsenceRequestsPanel';
import TeamSettings from './TeamSettings';
import { TEAM_ROLES, EMPLOYMENT_TYPES } from '../../../constants/team';

/**
 * TeamList - Hauptkomponente für Team-Verwaltung
 *
 * @param {Array} teamMembers - Array aller Team-Mitglieder
 * @param {Array} teamAbsences - Array aller genehmigten Abwesenheiten
 * @param {Array} teamAssignments - Array aller Einplanungen
 * @param {Object} teamHandlers - CRUD-Operationen vom useTeam Hook
 * @param {Array} absenceRequests - Offene Abwesenheitsanfragen
 * @param {Object} agencyDefaults - Agentur-Standard-Permissions
 * @param {Function} updateDefaultMemberPermissions - Funktion zum Aktualisieren der Defaults
 * @param {Function} getAbsencesForMember - Funktion zum Abrufen der Abwesenheiten eines Mitglieds
 * @param {Function} getAssignmentsForMember - Funktion zum Abrufen der Einplanungen eines Mitglieds
 * @param {Array} projects - Alle Projekte für Lookup
 * @param {Function} onNavigateToPhase - Navigation zu Phase (projectId, phaseId)
 */
const TeamList = ({
  teamMembers = [],
  teamAbsences = [],
  teamAssignments = [],
  teamHandlers = {},
  absenceRequests = [],
  agencyDefaults = {},
  updateDefaultMemberPermissions,
  getUtilization,
  getAbsencesForMember,
  getAssignmentsForMember,
  projects = [],
  onNavigateToPhase
}) => {
  // View State
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'settings' | 'requests'
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [employmentFilter, setEmploymentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Selected Member
  const selectedMember = teamMembers.find(m => m.id === selectedMemberId);

  // Pending Requests nach Mitglied
  const pendingRequestsByMember = useMemo(() => {
    const map = {};
    absenceRequests
      .filter(r => r.status === 'pending')
      .forEach(r => {
        map[r.memberId] = (map[r.memberId] || 0) + 1;
      });
    return map;
  }, [absenceRequests]);

  const totalPendingRequests = Object.values(pendingRequestsByMember).reduce((a, b) => a + b, 0);

  // Gefilterte Mitglieder
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      // Suche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${member.firstName} ${member.lastName}`.toLowerCase().includes(query);
        const matchesEmail = member.email?.toLowerCase().includes(query);
        const matchesPosition = member.position?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPosition) return false;
      }

      // Rolle
      if (roleFilter !== 'all' && member.role !== roleFilter) return false;

      // Anstellung
      if (employmentFilter !== 'all' && member.employmentType !== employmentFilter) return false;

      return true;
    });
  }, [teamMembers, searchQuery, roleFilter, employmentFilter]);

  // Mitglieder nach Rolle gruppiert
  const groupedMembers = useMemo(() => {
    const projectLeads = filteredMembers.filter(m => m.role === 'projectlead');
    const members = filteredMembers.filter(m => m.role === 'member');
    return { projectLeads, members };
  }, [filteredMembers]);

  // Handler
  const handleMemberClick = (member) => {
    setSelectedMemberId(member.id);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedMemberId(null);
  };

  // Render Detail View
  if (view === 'detail' && selectedMember) {
    // Hole Abwesenheiten und Einplanungen für dieses Mitglied
    const memberAbsences = getAbsencesForMember?.(selectedMember.id) ||
      teamAbsences.filter(a => a.memberId === selectedMember.id);
    const memberAssignments = getAssignmentsForMember?.(selectedMember.id) ||
      teamAssignments.filter(a => a.memberId === selectedMember.id);

    return (
      <TeamMemberDetail
        member={selectedMember}
        memberAbsences={memberAbsences}
        memberAssignments={memberAssignments}
        onBack={handleBack}
        teamHandlers={teamHandlers}
        agencyDefaults={agencyDefaults}
        projects={projects}
        onNavigateToPhase={onNavigateToPhase}
      />
    );
  }

  // Render Settings View
  if (view === 'settings') {
    return (
      <TeamSettings
        agencyDefaults={agencyDefaults}
        updateDefaultMemberPermissions={updateDefaultMemberPermissions}
        onBack={() => setView('list')}
      />
    );
  }

  // Render Requests View
  if (view === 'requests') {
    return (
      <AbsenceRequestsPanel
        requests={absenceRequests}
        teamMembers={teamMembers}
        onBack={() => setView('list')}
        onApprove={teamHandlers.approveAbsenceRequest}
        onReject={teamHandlers.rejectAbsenceRequest}
      />
    );
  }

  // Render List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {teamMembers.length} Mitarbeiter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Abwesenheitsanfragen Button */}
          {totalPendingRequests > 0 && (
            <button
              onClick={() => setView('requests')}
              className="relative flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Anfragen</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalPendingRequests}
              </span>
            </button>
          )}

          {/* Settings */}
          <button
            onClick={() => setView('settings')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Team-Einstellungen"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Neuer Mitarbeiter */}
          <button
            onClick={() => teamHandlers.addMember?.({
              name: 'Neuer Mitarbeiter',
              role: 'member',
              email: '',
              phone: ''
            })}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Mitarbeiter</span>
          </button>
        </div>
      </div>

      {/* Suche & Filter */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Mitarbeiter suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-colors ${
              showFilters || roleFilter !== 'all' || employmentFilter !== 'all'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Alle Rollen</option>
              {TEAM_ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            <select
              value={employmentFilter}
              onChange={(e) => setEmploymentFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">Alle Anstellungen</option>
              {EMPLOYMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            {(roleFilter !== 'all' || employmentFilter !== 'all') && (
              <button
                onClick={() => {
                  setRoleFilter('all');
                  setEmploymentFilter('all');
                }}
                className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Team-Liste */}
      <div className="space-y-6">
        {/* Projektleitung */}
        {groupedMembers.projectLeads.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Projektleitung ({groupedMembers.projectLeads.length})</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupedMembers.projectLeads.map(member => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onClick={() => handleMemberClick(member)}
                  utilization={getUtilization?.(member.id)}
                  hasAbsenceRequest={pendingRequestsByMember[member.id] > 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mitarbeiter */}
        {groupedMembers.members.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <UserCheck className="w-4 h-4 text-gray-400" />
              <span>Mitarbeiter ({groupedMembers.members.length})</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupedMembers.members.map(member => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onClick={() => handleMemberClick(member)}
                  utilization={getUtilization?.(member.id)}
                  hasAbsenceRequest={pendingRequestsByMember[member.id] > 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Leerer Zustand */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            {teamMembers.length === 0 ? (
              <>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Noch keine Team-Mitglieder vorhanden
                </p>
                <button
                  onClick={() => teamHandlers.addMember?.({
                    name: 'Neuer Mitarbeiter',
                    role: 'member',
                    email: '',
                    phone: ''
                  })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ersten Mitarbeiter hinzufügen
                </button>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Keine Mitarbeiter gefunden
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamList;
