import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { USER_ROLES } from '../constants/calendar';

/**
 * Header - Haupt-Header der Anwendung mit Logo, User-Switcher und Rollen-Switcher
 *
 * @param {Object} props
 * @param {string} props.userRole - Aktuelle Benutzerrolle ('freelancer' oder 'agency')
 * @param {Function} props.onRoleChange - Callback beim Wechsel der Rolle
 * @param {Array} props.notifications - Liste der Benachrichtigungen
 * @param {number} props.unreadCount - Anzahl ungelesener Benachrichtigungen
 * @param {boolean} props.showNotifications - Ob das Benachrichtigungsmenü geöffnet ist
 * @param {Function} props.onToggleNotifications - Callback zum Öffnen/Schließen des Menüs
 * @param {Function} props.onMarkAllAsRead - Callback zum Markieren aller als gelesen
 * @param {Function} props.onMarkAsRead - Callback zum Markieren einer Benachrichtigung als gelesen
 * @param {number} props.freelancerId - ID des aktuellen Freelancers
 * @param {number} props.agencyId - ID der aktuellen Agentur
 * @param {Array} props.freelancers - Liste aller Freelancer
 * @param {Array} props.agencies - Liste aller Agenturen
 * @param {Function} props.onFreelancerChange - Callback beim Wechsel des Freelancers
 * @param {Function} props.onAgencyChange - Callback beim Wechsel der Agentur
 */
const Header = ({
  userRole,
  onRoleChange,
  notifications,
  unreadCount,
  showNotifications,
  onToggleNotifications,
  onMarkAllAsRead,
  onMarkAsRead,
  // User-Switcher Props
  freelancerId,
  agencyId,
  freelancers = [],
  agencies = [],
  onFreelancerChange,
  onAgencyChange
}) => {
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  const handleRoleSwitch = (newRole) => {
    onRoleChange(newRole);
  };

  // Aktueller User basierend auf Rolle
  const currentFreelancer = freelancers.find(f => f.id === freelancerId);
  const currentAgency = agencies.find(a => a.id === agencyId);

  const currentUserName = userRole === USER_ROLES.FREELANCER
    ? currentFreelancer ? `${currentFreelancer.firstName} ${currentFreelancer.lastName}` : 'Freelancer'
    : currentAgency?.name || 'Agentur';

  const currentUserAvatar = userRole === USER_ROLES.FREELANCER
    ? currentFreelancer?.avatar || '👤'
    : currentAgency?.logo || '🎬';

  return (
    <div className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <span className="font-semibold text-xl tracking-tight">CrewConnect</span>
          <span className="text-[10px] uppercase tracking-wider bg-slate-700 text-slate-300 px-2 py-1 rounded-md font-medium">Beta</span>
        </div>

        {/* Rechte Seite: User-Switcher, Rollen-Switcher und Benachrichtigungen */}
        <div className="flex items-center gap-4">
          {/* User-Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserSwitcher(!showUserSwitcher)}
              className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-4 py-2 text-sm transition-all"
            >
              <span className="text-lg">{currentUserAvatar}</span>
              <span className="font-medium max-w-[140px] truncate">{currentUserName}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserSwitcher ? 'rotate-180' : ''}`} />
            </button>

            {showUserSwitcher && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                {/* Freelancer Section */}
                <div className="p-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Freelancer</div>
                  <div className="space-y-1">
                    {freelancers.map(f => (
                      <button
                        key={f.id}
                        onClick={() => {
                          onFreelancerChange(f.id);
                          onRoleChange(USER_ROLES.FREELANCER);
                          setShowUserSwitcher(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                          freelancerId === f.id && userRole === USER_ROLES.FREELANCER
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-lg">{f.avatar}</span>
                        <span className="font-medium">{f.firstName} {f.lastName}</span>
                        {freelancerId === f.id && userRole === USER_ROLES.FREELANCER && (
                          <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">aktiv</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agency Section */}
                <div className="p-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Agenturen</div>
                  <div className="space-y-1">
                    {agencies.map(a => (
                      <button
                        key={a.id}
                        onClick={() => {
                          onAgencyChange(a.id);
                          onRoleChange(USER_ROLES.AGENCY);
                          setShowUserSwitcher(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                          agencyId === a.id && userRole === USER_ROLES.AGENCY
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-lg">{a.logo}</span>
                        <span className="font-medium">{a.name}</span>
                        {agencyId === a.id && userRole === USER_ROLES.AGENCY && (
                          <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">aktiv</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rollen-Toggle (schneller Wechsel zwischen aktuellen Usern) */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
            <button
              onClick={() => handleRoleSwitch(USER_ROLES.AGENCY)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                userRole === USER_ROLES.AGENCY
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {currentAgency?.logo || '🎬'}
            </button>
            <button
              onClick={() => handleRoleSwitch(USER_ROLES.FREELANCER)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                userRole === USER_ROLES.FREELANCER
                  ? 'bg-white text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {currentFreelancer?.avatar || '👤'}
            </button>
          </div>

          {/* Benachrichtigungen */}
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            isOpen={showNotifications}
            onToggle={onToggleNotifications}
            onMarkAllAsRead={onMarkAllAsRead}
            onMarkAsRead={onMarkAsRead}
          />
        </div>
      </div>

      {/* User-Info Bar */}
      <div className="bg-slate-800/50 text-[11px] py-2 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex gap-6 text-slate-400">
          <span>
            <span className="text-slate-500">Freelancer:</span> {currentFreelancer?.firstName} {currentFreelancer?.lastName}
          </span>
          <span>
            <span className="text-slate-500">Agentur:</span> {currentAgency?.name}
          </span>
          <span>
            <span className="text-slate-500">Ansicht:</span> <span className="text-white font-medium">{userRole === USER_ROLES.FREELANCER ? 'Freelancer' : 'Agentur'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
