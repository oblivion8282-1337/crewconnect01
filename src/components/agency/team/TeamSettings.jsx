import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Settings,
  Shield,
  Save,
  RotateCcw,
  Info
} from 'lucide-react';
import { MEMBER_PERMISSIONS, PERMISSION_CATEGORIES } from '../../../constants/team';
import { getDefaultPermissions } from '../../../utils/permissions';

/**
 * TeamSettings - Agentur-weite Team-Einstellungen
 *
 * @param {Object} agencyDefaults - Aktuelle Agentur-Standard-Permissions
 * @param {Function} updateDefaultMemberPermissions - Funktion zum Aktualisieren
 * @param {Function} onBack - Zurück zur Liste
 */
const TeamSettings = ({
  agencyDefaults = {},
  updateDefaultMemberPermissions,
  onBack
}) => {
  const systemDefaults = getDefaultPermissions();
  const [localPermissions, setLocalPermissions] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with merged defaults
  useEffect(() => {
    setLocalPermissions({
      ...systemDefaults,
      ...agencyDefaults
    });
  }, [agencyDefaults]);

  // Check for changes
  useEffect(() => {
    const current = { ...systemDefaults, ...agencyDefaults };
    const changed = Object.keys(localPermissions).some(
      key => localPermissions[key] !== current[key]
    );
    setHasChanges(changed);
  }, [localPermissions, agencyDefaults, systemDefaults]);

  const handleToggle = (key) => {
    setLocalPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    updateDefaultMemberPermissions?.(localPermissions);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPermissions(systemDefaults);
  };

  const handleResetToAgency = () => {
    setLocalPermissions({
      ...systemDefaults,
      ...agencyDefaults
    });
    setHasChanges(false);
  };

  // Group permissions by category
  const permissionsByCategory = PERMISSION_CATEGORIES.map(cat => ({
    ...cat,
    permissions: MEMBER_PERMISSIONS.filter(p => p.category === cat.key)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Team-Einstellungen
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Standard-Berechtigungen für alle Mitarbeiter
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleResetToAgency}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Zurücksetzen
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Speichern
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-400">
          <p className="font-medium mb-1">Berechtigungshierarchie</p>
          <p>
            Diese Einstellungen gelten als Standard für alle Team-Mitglieder.
            Sie können auf Projekt-Ebene oder für einzelne Mitarbeiter überschrieben werden.
          </p>
          <ol className="mt-2 list-decimal list-inside text-xs space-y-1">
            <li>Projekt-spezifische Mitarbeiter-Einstellungen (höchste Priorität)</li>
            <li>Projekt-Standard-Einstellungen</li>
            <li>Mitarbeiter-individuelle Einstellungen</li>
            <li><strong>Agentur-Standard (diese Seite)</strong></li>
            <li>System-Standard (niedrigste Priorität)</li>
          </ol>
        </div>
      </div>

      {/* Reset to System Defaults */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            System-Standardwerte wiederherstellen
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Setzt alle Einstellungen auf die System-Vorgaben zurück
          </div>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          Zurücksetzen
        </button>
      </div>

      {/* Permissions by Category */}
      <div className="space-y-8">
        {permissionsByCategory.map(category => (
          <div key={category.key} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" />
              {category.label}
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {category.permissions.map(perm => {
                const isEnabled = localPermissions[perm.key] ?? perm.default;
                const isSystemDefault = perm.default;
                const isDifferentFromSystem = isEnabled !== isSystemDefault;

                return (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {perm.label}
                        </span>
                        {isDifferentFromSystem && (
                          <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            Angepasst
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {perm.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        System-Standard: {isSystemDefault ? 'Ja' : 'Nein'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggle(perm.key)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        isEnabled
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          isEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Save Bar (when changes) */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Du hast ungespeicherte Änderungen
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToAgency}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Verwerfen
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Änderungen speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSettings;
