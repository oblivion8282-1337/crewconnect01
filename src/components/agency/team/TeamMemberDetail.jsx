import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Clock,
  Shield,
  Save,
  X,
  Edit2,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  CalendarDays,
  ChevronRight
} from 'lucide-react';
import {
  TEAM_ROLES,
  EMPLOYMENT_TYPES,
  WEEKDAYS,
  ABSENCE_TYPES,
  getAbsenceTypeLabel,
  getAbsenceTypeColor
} from '../../../constants/team';
import { MEMBER_PERMISSIONS, PERMISSION_CATEGORIES } from '../../../constants/team';
import { getPermissionsSummary, getEffectivePermission } from '../../../utils/permissions';
import { useUnsavedChangesContext } from '../../../contexts/UnsavedChangesContext';
import TeamMemberCalendar from './TeamMemberCalendar';
import TeamMemberTimeline from './TeamMemberTimeline';

/**
 * TeamMemberDetail - Detailansicht für ein Team-Mitglied
 *
 * @param {Object} member - Das Team-Mitglied
 * @param {Array} memberAbsences - Abwesenheiten des Mitglieds
 * @param {Array} memberAssignments - Einplanungen des Mitglieds
 * @param {Function} onBack - Zurück zur Liste
 * @param {Object} teamHandlers - CRUD-Operationen vom useTeam Hook
 * @param {Object} agencyDefaults - Agentur-Standard-Permissions
 * @param {Array} projects - Alle Projekte für Lookup
 * @param {Function} onNavigateToPhase - Navigation zu Phase (projectId, phaseId)
 */
const TeamMemberDetail = ({
  member,
  memberAbsences = [],
  memberAssignments = [],
  onBack,
  teamHandlers,
  agencyDefaults,
  projects = [],
  onNavigateToPhase
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'info' | 'absences' | 'permissions' | 'assignments'
  const [formData, setFormData] = useState({});
  const [showAddAbsence, setShowAddAbsence] = useState(false);
  const [newAbsence, setNewAbsence] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    note: ''
  });

  // Unsaved changes protection
  const { setUnsaved, clearUnsaved, confirmNavigation } = useUnsavedChangesContext();

  // Track unsaved changes when editing
  useEffect(() => {
    setUnsaved(isEditing);
    return () => clearUnsaved();
  }, [isEditing, setUnsaved, clearUnsaved]);

  // Initialize form data when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phone: member.phone || '',
        position: member.position || '',
        role: member.role || 'member',
        employmentType: member.employmentType || 'fulltime',
        workingDays: member.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHours: member.workingHours || { start: '09:00', end: '18:00' },
        permissionOverrides: member.permissionOverrides || {}
      });
    }
  }, [member]);

  // Safe back navigation
  const handleSafeBack = () => {
    if (confirmNavigation('Du hast ungespeicherte Änderungen. Möchtest du wirklich zurück?')) {
      setIsEditing(false);
      clearUnsaved();
      onBack();
    }
  };

  const isProjectLead = member?.role === 'projectlead';

  // Permissions Summary
  const permissionsSummary = getPermissionsSummary(member, null, agencyDefaults);

  // Grouped by category
  const permissionsByCategory = PERMISSION_CATEGORIES.map(cat => ({
    ...cat,
    permissions: permissionsSummary.filter(p => p.category === cat.key)
  }));

  // Handler
  const handleSave = () => {
    teamHandlers.updateMember?.(member.id, formData);
    setIsEditing(false);
    clearUnsaved();
  };

  const handleCancel = () => {
    setFormData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      phone: member.phone || '',
      position: member.position || '',
      role: member.role || 'member',
      employmentType: member.employmentType || 'fulltime',
      workingDays: member.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: member.workingHours || { start: '09:00', end: '18:00' },
      permissionOverrides: member.permissionOverrides || {}
    });
    setIsEditing(false);
    clearUnsaved();
  };

  const handleAddAbsence = () => {
    if (!newAbsence.startDate || !newAbsence.endDate) return;

    teamHandlers.addAbsence?.(member.id, {
      type: newAbsence.type,
      startDate: newAbsence.startDate,
      endDate: newAbsence.endDate,
      note: newAbsence.note
    });

    setNewAbsence({
      type: 'vacation',
      startDate: '',
      endDate: '',
      note: ''
    });
    setShowAddAbsence(false);
  };

  const memberName = `${member?.firstName || ''} ${member?.lastName || ''}`.trim() || 'Unbekannt';

  const handleDeleteMember = () => {
    if (window.confirm(`Möchtest du "${memberName}" wirklich aus dem Team entfernen?`)) {
      teamHandlers.removeMember?.(member.id);
      clearUnsaved();
      onBack();
    }
  };

  const toggleWorkingDay = (day) => {
    const current = formData.workingDays || [];
    setFormData({
      ...formData,
      workingDays: current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    });
  };

  const togglePermissionOverride = (key) => {
    if (isProjectLead) return; // Projektleitung hat alle Rechte

    const currentOverrides = formData.permissionOverrides || {};
    const currentValue = currentOverrides[key];

    // Cyclic toggle: undefined -> true -> false -> undefined
    let newValue;
    if (currentValue === undefined) {
      newValue = true;
    } else if (currentValue === true) {
      newValue = false;
    } else {
      // Remove override
      const { [key]: removed, ...rest } = currentOverrides;
      setFormData({ ...formData, permissionOverrides: rest });
      return;
    }

    setFormData({
      ...formData,
      permissionOverrides: { ...currentOverrides, [key]: newValue }
    });
  };

  const tabs = [
    { key: 'calendar', label: 'Kalender', icon: CalendarDays },
    { key: 'info', label: 'Stammdaten', icon: User },
    { key: 'absences', label: 'Abwesenheiten', icon: Calendar },
    { key: 'permissions', label: 'Berechtigungen', icon: Shield },
    { key: 'assignments', label: 'Einplanungen', icon: Briefcase }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSafeBack}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={memberName}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-7 h-7 text-gray-500 dark:text-gray-400" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {memberName}
                </h1>
                {isProjectLead && (
                  <Shield className="w-5 h-5 text-blue-500" title="Projektleitung" />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {member.position || TEAM_ROLES.find(r => r.value === member.role)?.label}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Speichern
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDeleteMember}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Mitarbeiter entfernen"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Bearbeiten
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {/* Kalender Tab - Eigener Container ohne p-6 */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Timeline */}
          <TeamMemberTimeline
            memberAbsences={memberAbsences}
            memberAssignments={memberAssignments}
            projects={projects}
            onAssignmentClick={onNavigateToPhase}
            limit={8}
          />

          {/* Kalender */}
          <TeamMemberCalendar
            member={member}
            memberAbsences={memberAbsences}
            memberAssignments={memberAssignments}
            projects={projects}
            onAssignmentClick={onNavigateToPhase}
            onAddAbsence={teamHandlers?.addAbsence}
            onRemoveAbsence={teamHandlers?.removeAbsence}
          />
        </div>
      )}

      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${activeTab === 'calendar' ? 'hidden' : ''}`}>
        {/* Stammdaten Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Grunddaten */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vorname
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{member.firstName || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nachname
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{member.lastName || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="z.B. Producer, Editor"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{member.position || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-Mail
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{member.email || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefon
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{member.phone || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rolle
                </label>
                {isEditing ? (
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {TEAM_ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {TEAM_ROLES.find(r => r.value === member.role)?.label}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Anstellung
                </label>
                {isEditing ? (
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {EMPLOYMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {EMPLOYMENT_TYPES.find(t => t.value === member.employmentType)?.label || '-'}
                  </p>
                )}
              </div>
            </div>

            {/* Arbeitszeiten */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Arbeitszeiten
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Arbeitstage
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map(day => (
                      <button
                        key={day.value}
                        onClick={() => isEditing && toggleWorkingDay(day.value)}
                        disabled={!isEditing}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          (isEditing ? formData.workingDays : member.workingDays || []).includes(day.value)
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        } ${isEditing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Arbeitsbeginn
                    </label>
                    {isEditing ? (
                      <input
                        type="time"
                        value={formData.workingHours?.start || '09:00'}
                        onChange={(e) => setFormData({
                          ...formData,
                          workingHours: { ...formData.workingHours, start: e.target.value }
                        })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {member.workingHours?.start || '09:00'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Arbeitsende
                    </label>
                    {isEditing ? (
                      <input
                        type="time"
                        value={formData.workingHours?.end || '18:00'}
                        onChange={(e) => setFormData({
                          ...formData,
                          workingHours: { ...formData.workingHours, end: e.target.value }
                        })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {member.workingHours?.end || '18:00'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Abwesenheiten Tab */}
        {activeTab === 'absences' && (
          <div className="space-y-6">
            {/* Add Absence Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Abwesenheiten
              </h3>
              <button
                onClick={() => setShowAddAbsence(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Abwesenheit hinzufügen
              </button>
            </div>

            {/* Add Absence Form */}
            {showAddAbsence && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={newAbsence.type}
                    onChange={(e) => setNewAbsence({ ...newAbsence, type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {ABSENCE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={newAbsence.startDate}
                    onChange={(e) => setNewAbsence({ ...newAbsence, startDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />

                  <input
                    type="date"
                    value={newAbsence.endDate}
                    onChange={(e) => setNewAbsence({ ...newAbsence, endDate: e.target.value })}
                    min={newAbsence.startDate}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />

                  <input
                    type="text"
                    value={newAbsence.note}
                    onChange={(e) => setNewAbsence({ ...newAbsence, note: e.target.value })}
                    placeholder="Notiz (optional)"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddAbsence(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleAddAbsence}
                    disabled={!newAbsence.startDate || !newAbsence.endDate}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Hinzufügen
                  </button>
                </div>
              </div>
            )}

            {/* Absences List */}
            <div className="space-y-2">
              {memberAbsences.length === 0 ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Keine Abwesenheiten eingetragen
                </p>
              ) : (
                memberAbsences.map(absence => (
                  <div
                    key={absence.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded bg-${getAbsenceTypeColor(absence.type)}-100 dark:bg-${getAbsenceTypeColor(absence.type)}-900/30 text-${getAbsenceTypeColor(absence.type)}-700 dark:text-${getAbsenceTypeColor(absence.type)}-400`}>
                        {getAbsenceTypeLabel(absence.type)}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(absence.startDate).toLocaleDateString('de-DE')} - {new Date(absence.endDate).toLocaleDateString('de-DE')}
                      </span>
                      {absence.note && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {absence.note}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => teamHandlers.removeAbsence?.(absence.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Berechtigungen Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            {isProjectLead && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-400">
                <Shield className="w-5 h-5" />
                <span>Projektleitungen haben automatisch alle Berechtigungen.</span>
              </div>
            )}

            {permissionsByCategory.map(category => (
              <div key={category.key} className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {category.label}
                </h3>

                <div className="space-y-2">
                  {category.permissions.map(perm => {
                    const hasOverride = member.permissionOverrides?.[perm.key] !== undefined;
                    const overrideValue = member.permissionOverrides?.[perm.key];

                    return (
                      <div
                        key={perm.key}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          hasOverride
                            ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {perm.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {perm.description}
                          </div>
                          {hasOverride && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Individuelle Einstellung
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isEditing && !isProjectLead ? (
                            <button
                              onClick={() => togglePermissionOverride(perm.key)}
                              className={`relative w-14 h-7 rounded-full transition-colors ${
                                formData.permissionOverrides?.[perm.key] === true
                                  ? 'bg-green-500'
                                  : formData.permissionOverrides?.[perm.key] === false
                                  ? 'bg-red-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            >
                              <div
                                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                  formData.permissionOverrides?.[perm.key] === true
                                    ? 'translate-x-8'
                                    : formData.permissionOverrides?.[perm.key] === false
                                    ? 'translate-x-1'
                                    : 'translate-x-4'
                                }`}
                              />
                            </button>
                          ) : (
                            <div className={`flex items-center gap-1 ${perm.value ? 'text-green-600' : 'text-red-600'}`}>
                              {perm.value ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <XCircle className="w-5 h-5" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Einplanungen Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Aktuelle Einplanungen
            </h3>

            {memberAssignments.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                Keine Einplanungen vorhanden
              </p>
            ) : (
              <div className="space-y-2">
                {memberAssignments.map(assignment => {
                  const project = projects.find(p => p.id === assignment.projectId);
                  const phase = project?.phases?.find(ph => ph.id === assignment.phaseId);
                  const isClickable = onNavigateToPhase && assignment.projectId && assignment.phaseId;

                  return (
                    <div
                      key={assignment.id}
                      onClick={() => isClickable && onNavigateToPhase(assignment.projectId, assignment.phaseId)}
                      className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${
                        isClickable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {assignment.projectRole || 'Einplanung'}
                          </div>
                          {project && (
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              {project.name}
                              {phase && <span className="text-gray-400"> / {phase.name}</span>}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {assignment.dates?.length > 0 ? (
                              <>
                                {assignment.dates.length === 1
                                  ? new Date(assignment.dates[0]).toLocaleDateString('de-DE')
                                  : `${new Date(assignment.dates[0]).toLocaleDateString('de-DE')} - ${new Date(assignment.dates[assignment.dates.length - 1]).toLocaleDateString('de-DE')}`
                                }
                                <span className="text-gray-400"> ({assignment.dates.length} Tag{assignment.dates.length > 1 ? 'e' : ''})</span>
                              </>
                            ) : (
                              'Keine Daten'
                            )}
                          </div>
                        </div>
                      </div>
                      {isClickable && (
                        <div className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1">
                          Zur Phase
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberDetail;
