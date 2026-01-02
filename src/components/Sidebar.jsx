import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  CheckCircle,
  User,
  Users,
  UsersRound,
  Search,
  Inbox,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Building2,
  Palmtree,
  Film
} from 'lucide-react';
import { USER_ROLES } from '../constants/calendar';

/**
 * Navigations-Items für Freelancer
 */
const FREELANCER_NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'projects', icon: Briefcase, label: 'Projekte' },
  { id: 'requests', icon: Inbox, label: 'Buchungen', showBadge: true },
  { id: 'messages', icon: MessageCircle, label: 'Nachrichten', showMessageBadge: true },
  { id: 'calendar', icon: Calendar, label: 'Kalender' },
  { id: 'profile', icon: User, label: 'Profil' }
];

/**
 * Navigations-Items für Agenturen (Projektleitung)
 */
const AGENCY_NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'projects', icon: Briefcase, label: 'Projekte' },
  { id: 'clients', icon: Building2, label: 'Kunden' },
  { id: 'team', icon: UsersRound, label: 'Team', showTeamBadge: true },
  { id: 'bookings', icon: CheckCircle, label: 'Buchungen', showBookingsBadge: true },
  { id: 'messages', icon: MessageCircle, label: 'Nachrichten', showMessageBadge: true },
  { id: 'freelancer-search', icon: Search, label: 'Freelancer' },
  { id: 'crew', icon: Users, label: 'Meine Freelancer' },
  { id: 'profile', icon: User, label: 'Profil' }
];

/**
 * Navigations-Items für Team-Mitarbeiter (eingeschränkte Ansicht)
 */
const MEMBER_NAV_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'calendar', icon: Calendar, label: 'Kalender' },
  { id: 'my-projects', icon: Film, label: 'Meine Projekte' },
  { id: 'absences', icon: Palmtree, label: 'Urlaub' },
  { id: 'profile', icon: User, label: 'Profil' }
];

/**
 * Sidebar - Linke Navigation
 */
const Sidebar = ({
  userRole,
  currentView,
  onViewChange,
  badgeCount = 0,
  messageBadgeCount = 0,
  bookingsBadgeCount = 0,
  teamBadgeCount = 0,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  isMemberView = false
}) => {
  // Wähle die richtigen Nav-Items basierend auf Rolle und Member-View
  const navItems = userRole === USER_ROLES.FREELANCER
    ? FREELANCER_NAV_ITEMS
    : isMemberView
      ? MEMBER_NAV_ITEMS
      : AGENCY_NAV_ITEMS;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
      `}>
        {/* Logo */}
        <div className={`
          h-[72px] flex items-center border-b border-gray-200 dark:border-gray-800
          ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}
        `}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">CrewConnect</span>
                <span className="ml-2 text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold">
                  Beta
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
          )}

          {/* Close Button (Mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            aria-label="Menü schließen"
          >
            <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const showBadge = item.showBadge && badgeCount > 0;
              const showMessageBadge = item.showMessageBadge && messageBadgeCount > 0;
              const showBookingsBadge = item.showBookingsBadge && bookingsBadgeCount > 0;
              const showTeamBadge = item.showTeamBadge && teamBadgeCount > 0;
              const isActive = currentView === item.id;
              const displayBadgeCount = showBadge ? badgeCount : (showMessageBadge ? messageBadgeCount : (showBookingsBadge ? bookingsBadgeCount : (showTeamBadge ? teamBadgeCount : 0)));
              const hasBadge = showBadge || showMessageBadge || showBookingsBadge || showTeamBadge;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    onClose?.();
                  }}
                  className={`
                    w-full flex items-center gap-3 rounded-xl
                    transition-all duration-200 relative
                    ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-foreground' : ''}`} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium text-sm">{item.label}</span>
                      {hasBadge && (
                        <span className={`
                          ml-auto min-w-[22px] h-[22px] px-1.5 text-xs font-semibold rounded-full
                          flex items-center justify-center
                          ${isActive
                            ? 'bg-primary-foreground text-primary'
                            : 'bg-primary text-primary-foreground'
                          }
                        `}>
                          {displayBadgeCount > 99 ? '99+' : displayBadgeCount}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && hasBadge && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Collapse Toggle (Desktop) */}
        <div className="hidden lg:block p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onToggleCollapse}
            className={`
              w-full flex items-center gap-3 rounded-xl p-3
              text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            aria-label={isCollapsed ? 'Navigation ausklappen' : 'Navigation einklappen'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm">Einklappen</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
