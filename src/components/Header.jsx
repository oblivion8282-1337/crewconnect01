import React, { useState } from 'react';
import { ChevronDown, Sun, Moon, Menu } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { USER_ROLES } from '../constants/calendar';

/**
 * ThemeToggle - Inline theme toggle
 */
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');

    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        relative flex items-center justify-center
        w-10 h-10 rounded-xl
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-all duration-200
      "
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        className={`
          w-5 h-5 text-amber-500
          absolute transition-all duration-200
          ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
        `}
      />
      <Moon
        className={`
          w-5 h-5 text-gray-400
          absolute transition-all duration-200
          ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
        `}
      />
    </button>
  );
};

/**
 * Header - Top header with user switcher and notifications
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
  freelancerId,
  agencyId,
  freelancers = [],
  agencies = [],
  onFreelancerChange,
  onAgencyChange,
  onOpenSidebar
}) => {
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  const handleRoleSwitch = (newRole) => {
    onRoleChange(newRole);
  };

  const currentFreelancer = freelancers.find(f => f.id === freelancerId);
  const currentAgency = agencies.find(a => a.id === agencyId);

  const currentUserName = userRole === USER_ROLES.FREELANCER
    ? currentFreelancer ? `${currentFreelancer.firstName} ${currentFreelancer.lastName}` : 'Freelancer'
    : currentAgency?.name || 'Agentur';

  const currentUserAvatar = userRole === USER_ROLES.FREELANCER
    ? currentFreelancer?.avatar || '👤'
    : currentAgency?.logo || '🎬';

  return (
    <header className="
      sticky top-0 z-30
      h-[72px] px-4 lg:px-8
      bg-white/80 dark:bg-gray-900/80
      backdrop-blur-lg
      border-b border-gray-200 dark:border-gray-800
      flex items-center justify-between
    ">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Menü öffnen"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-h1 text-gray-900 dark:text-white">
            {userRole === USER_ROLES.FREELANCER ? 'Freelancer' : 'Agentur'}
          </h1>
          <p className="text-caption text-gray-500 dark:text-gray-400 hidden sm:block">
            {userRole === USER_ROLES.FREELANCER
              ? `Angemeldet als ${currentUserName}`
              : `Angemeldet als ${currentUserName}`
            }
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User-Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
            className="
              flex items-center gap-2 sm:gap-3
              bg-gray-100 dark:bg-gray-800
              hover:bg-gray-200 dark:hover:bg-gray-700
              rounded-xl px-3 sm:px-4 py-2.5
              text-sm transition-all duration-200
            "
          >
            <span className="text-lg">{currentUserAvatar}</span>
            <span className="font-medium max-w-[100px] sm:max-w-[140px] truncate hidden sm:block text-gray-900 dark:text-white">
              {currentUserName}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserSwitcher ? 'rotate-180' : ''}`} />
          </button>

          {showUserSwitcher && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserSwitcher(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                {/* Freelancer Section */}
                <div className="p-3">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Freelancer
                  </div>
                  <div className="space-y-1">
                    {freelancers.map(f => (
                      <button
                        key={f.id}
                        onClick={() => {
                          onFreelancerChange(f.id);
                          onRoleChange(USER_ROLES.FREELANCER);
                          setShowUserSwitcher(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200 ${
                          freelancerId === f.id && userRole === USER_ROLES.FREELANCER
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-lg">{f.avatar}</span>
                        <span className="font-medium">{f.firstName} {f.lastName}</span>
                        {freelancerId === f.id && userRole === USER_ROLES.FREELANCER && (
                          <span className="ml-auto text-[10px] bg-gray-900 text-primary px-2 py-0.5 rounded-full font-semibold">
                            aktiv
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agency Section */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Agenturen
                  </div>
                  <div className="space-y-1">
                    {agencies.map(a => (
                      <button
                        key={a.id}
                        onClick={() => {
                          onAgencyChange(a.id);
                          onRoleChange(USER_ROLES.AGENCY);
                          setShowUserSwitcher(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-200 ${
                          agencyId === a.id && userRole === USER_ROLES.AGENCY
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-lg">{a.logo}</span>
                        <span className="font-medium">{a.name}</span>
                        {agencyId === a.id && userRole === USER_ROLES.AGENCY && (
                          <span className="ml-auto text-[10px] bg-gray-900 text-primary px-2 py-0.5 rounded-full font-semibold">
                            aktiv
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Role Toggle */}
        <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => handleRoleSwitch(USER_ROLES.AGENCY)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              userRole === USER_ROLES.AGENCY
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {currentAgency?.logo || '🎬'}
          </button>
          <button
            onClick={() => handleRoleSwitch(USER_ROLES.FREELANCER)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              userRole === USER_ROLES.FREELANCER
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {currentFreelancer?.avatar || '👤'}
          </button>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationCenter
          notifications={notifications}
          unreadCount={unreadCount}
          isOpen={showNotifications}
          onToggle={onToggleNotifications}
          onMarkAllAsRead={onMarkAllAsRead}
          onMarkAsRead={onMarkAsRead}
        />
      </div>
    </header>
  );
};

export default Header;
