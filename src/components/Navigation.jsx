import React from 'react';
import {
  LayoutDashboard,
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
 */
const Navigation = ({ userRole, currentView, onViewChange, badgeCount = 0 }) => {
  const navItems = userRole === USER_ROLES.FREELANCER
    ? FREELANCER_NAV_ITEMS
    : AGENCY_NAV_ITEMS;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex gap-1 py-3 overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const showBadge = item.showBadge && badgeCount > 0;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                relative px-3 sm:px-4 py-2.5 rounded-xl font-medium
                flex items-center gap-2 sm:gap-2.5 text-sm
                transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-gray-400 dark:text-gray-500'}`} />
              <span className="hidden sm:inline">{item.label}</span>
              {showBadge && (
                <span className={`
                  px-2 py-0.5 text-[11px] font-semibold rounded-full
                  ${isActive
                    ? 'bg-gray-900 text-primary'
                    : 'bg-red-500 text-white'
                  }
                `}>
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
