import React from 'react';
import {
  LayoutDashboard,
  Home,
  Calendar,
  Archive,
  Briefcase,
  CheckCircle,
  User,
  Inbox
} from 'lucide-react';
import { USER_ROLES } from '../constants/calendar';

/**
 * Navigations-Items für Freelancer
 */
const FREELANCER_NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'requests', icon: Inbox, label: 'Anfragen', showBadge: true },
  { id: 'projects', icon: Briefcase, label: 'Projekte' },
  { id: 'calendar', icon: Calendar, label: 'Kalender' },
  { id: 'history', icon: Archive, label: 'Historie' },
  { id: 'profile', icon: User, label: 'Profil' }
];

/**
 * Navigations-Items für Agenturen
 */
const AGENCY_NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'projects', icon: Briefcase, label: 'Projekte' },
  { id: 'bookings', icon: CheckCircle, label: 'Buchungen' },
  { id: 'history', icon: Archive, label: 'Historie' },
  { id: 'profile', icon: User, label: 'Profil' }
];

/**
 * Navigation - Sekundäre Navigation unter dem Header
 *
 * @param {Object} props
 * @param {string} props.userRole - Aktuelle Benutzerrolle
 * @param {string} props.currentView - Aktuell ausgewählte Ansicht
 * @param {Function} props.onViewChange - Callback beim Wechsel der Ansicht
 * @param {number} props.badgeCount - Anzahl für das Badge (z.B. offene Anfragen)
 */
const Navigation = ({ userRole, currentView, onViewChange, badgeCount = 0 }) => {
  const navItems = userRole === USER_ROLES.FREELANCER
    ? FREELANCER_NAV_ITEMS
    : AGENCY_NAV_ITEMS;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 flex gap-1 py-3">
        {navItems.map(item => {
          const Icon = item.icon;
          const showBadge = item.showBadge && badgeCount > 0;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative px-4 py-2.5 rounded-xl font-medium flex items-center gap-2.5 text-sm transition-all ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {item.label}
              {showBadge && (
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                  isActive ? 'bg-white text-slate-900' : 'bg-red-500 text-white'
                }`}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
