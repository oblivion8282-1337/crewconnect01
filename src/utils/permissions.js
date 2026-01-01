/**
 * Permissions Utility für Team-Mitglieder
 *
 * Berechtigungen werden in 3 Ebenen aufgelöst:
 * 1. Projekt-Ebene: Mitarbeiter-spezifisch
 * 2. Projekt-Ebene: Projekt-Standard
 * 3. Mitarbeiter-Ebene: permissionOverrides
 * 4. Agentur-Ebene: defaultMemberPermissions
 */

import { MEMBER_PERMISSIONS } from '../constants/team';

/**
 * Generiere Default-Permissions Objekt basierend auf MEMBER_PERMISSIONS
 */
export const getDefaultPermissions = () => {
  const defaults = {};
  MEMBER_PERMISSIONS.forEach(p => {
    defaults[p.key] = p.default;
  });
  return defaults;
};

/**
 * Berechne effektive Berechtigung für eine einzelne Permission
 *
 * @param {string} permission - Der Permission-Key (z.B. 'canSeeBudget')
 * @param {object} member - Das Team-Mitglied Objekt
 * @param {object|null} project - Das Projekt (optional)
 * @param {object|null} agencyDefaults - Die Agentur-Standard-Permissions
 * @returns {boolean} - Ob die Berechtigung erteilt ist
 */
export const getEffectivePermission = (
  permission,
  member,
  project = null,
  agencyDefaults = null
) => {
  // Projektleitung kann immer alles
  if (member?.role === 'projectlead') return true;

  // 1. Projekt-Ebene: Mitarbeiter-spezifisch
  if (project?.memberPermissions?.memberOverrides?.[member?.id]?.[permission] !== undefined) {
    return project.memberPermissions.memberOverrides[member.id][permission];
  }

  // 2. Projekt-Ebene: Projekt-Standard
  if (project?.memberPermissions?.defaults?.[permission] !== undefined) {
    return project.memberPermissions.defaults[permission];
  }

  // 3. Mitarbeiter-Ebene
  if (member?.permissionOverrides?.[permission] !== undefined) {
    return member.permissionOverrides[permission];
  }

  // 4. Agentur-Standard
  if (agencyDefaults?.[permission] !== undefined) {
    return agencyDefaults[permission];
  }

  // 5. Fallback auf System-Default
  return getDefaultPermissions()[permission] ?? false;
};

/**
 * Berechne alle effektiven Permissions für einen Mitarbeiter in einem Projekt
 *
 * @param {object} member - Das Team-Mitglied Objekt
 * @param {object|null} project - Das Projekt (optional)
 * @param {object|null} agencyDefaults - Die Agentur-Standard-Permissions
 * @returns {object} - Objekt mit allen Permissions und ihren effektiven Werten
 */
export const getAllEffectivePermissions = (member, project = null, agencyDefaults = null) => {
  const effective = {};
  MEMBER_PERMISSIONS.forEach(p => {
    effective[p.key] = getEffectivePermission(p.key, member, project, agencyDefaults);
  });
  return effective;
};

/**
 * Prüfe ob ein Mitglied Projektleitung ist
 *
 * @param {object} member - Das Team-Mitglied Objekt
 * @returns {boolean}
 */
export const isProjectLead = (member) => member?.role === 'projectlead';

/**
 * Prüfe ob Mitarbeiter bestimmte Berechtigung hat
 * Shorthand für getEffectivePermission
 *
 * @param {object} member - Das Team-Mitglied Objekt
 * @param {object|null} project - Das Projekt (optional)
 * @param {object|null} agencyDefaults - Die Agentur-Standard-Permissions
 * @param {string} permission - Der Permission-Key
 * @returns {boolean}
 */
export const canMember = (member, project, agencyDefaults, permission) => {
  return getEffectivePermission(permission, member, project, agencyDefaults);
};

/**
 * Ermittle die Quelle einer Berechtigung (für UI-Anzeige)
 *
 * @param {string} permission - Der Permission-Key
 * @param {object} member - Das Team-Mitglied Objekt
 * @param {object|null} project - Das Projekt (optional)
 * @param {object|null} agencyDefaults - Die Agentur-Standard-Permissions
 * @returns {'projectlead' | 'project_member' | 'project_default' | 'member' | 'agency' | 'system'}
 */
export const getPermissionSource = (permission, member, project = null, agencyDefaults = null) => {
  if (member?.role === 'projectlead') return 'projectlead';

  if (project?.memberPermissions?.memberOverrides?.[member?.id]?.[permission] !== undefined) {
    return 'project_member';
  }

  if (project?.memberPermissions?.defaults?.[permission] !== undefined) {
    return 'project_default';
  }

  if (member?.permissionOverrides?.[permission] !== undefined) {
    return 'member';
  }

  if (agencyDefaults?.[permission] !== undefined) {
    return 'agency';
  }

  return 'system';
};

/**
 * Erstelle eine Zusammenfassung der Berechtigungen mit Quellen
 *
 * @param {object} member - Das Team-Mitglied Objekt
 * @param {object|null} project - Das Projekt (optional)
 * @param {object|null} agencyDefaults - Die Agentur-Standard-Permissions
 * @returns {Array<{key: string, label: string, value: boolean, source: string}>}
 */
export const getPermissionsSummary = (member, project = null, agencyDefaults = null) => {
  return MEMBER_PERMISSIONS.map(p => ({
    key: p.key,
    label: p.label,
    description: p.description,
    category: p.category,
    value: getEffectivePermission(p.key, member, project, agencyDefaults),
    source: getPermissionSource(p.key, member, project, agencyDefaults),
    systemDefault: p.default
  }));
};

/**
 * Prüfe ob ein Mitglied irgendwelche individuellen Overrides hat
 *
 * @param {object} member - Das Team-Mitglied Objekt
 * @returns {boolean}
 */
export const hasCustomPermissions = (member) => {
  return member?.permissionOverrides !== null &&
         member?.permissionOverrides !== undefined &&
         Object.keys(member.permissionOverrides).length > 0;
};

/**
 * Zähle wie viele Permissions vom Standard abweichen
 *
 * @param {object} member - Das Team-Mitglied Objekt
 * @param {object|null} agencyDefaults - Die Agentur-Standard-Permissions
 * @returns {number}
 */
export const countCustomPermissions = (member, agencyDefaults = null) => {
  if (!member?.permissionOverrides) return 0;

  let count = 0;
  Object.keys(member.permissionOverrides).forEach(key => {
    const memberValue = member.permissionOverrides[key];
    const defaultValue = agencyDefaults?.[key] ?? getDefaultPermissions()[key];
    if (memberValue !== defaultValue) count++;
  });

  return count;
};
