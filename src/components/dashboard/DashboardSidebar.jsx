import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  BookOpen,
  BarChart3,
  Settings,
  Search,
  Sparkles,
  X,
  Menu
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  BookOpen,
  BarChart3,
  Settings,
};

/**
 * DashboardSidebar - Navigation sidebar for the dashboard
 */
const DashboardSidebar = ({
  navItems,
  activeItem,
  onNavChange,
  isOpen,
  onClose,
  isCollapsed = false,
}) => {
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
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-200 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'lg:w-sidebar-collapsed' : 'lg:w-sidebar'}
          w-sidebar
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                CrewConnect
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Suchen..."
                className="
                  w-full pl-10 pr-4 py-2.5
                  bg-gray-100 dark:bg-gray-800
                  border-0 rounded-xl
                  text-sm text-gray-900 dark:text-white
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-primary/50
                  transition-all duration-200
                "
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = activeItem === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavChange(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200 ease-in-out
                      ${isActive
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    {!isCollapsed && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Upgrade CTA */}
        {!isCollapsed && (
          <div className="p-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-950">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold text-white text-sm">Pro Upgrade</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Schalte erweiterte Funktionen und Analysen frei.
              </p>
              <button className="
                w-full py-2.5 px-4 rounded-xl
                bg-primary text-primary-foreground
                font-semibold text-sm
                hover:opacity-90
                transition-all duration-200
              ">
                Jetzt upgraden
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

/**
 * Mobile Menu Button
 */
export const MobileMenuButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
      lg:hidden p-2.5 rounded-xl
      bg-gray-100 dark:bg-gray-800
      hover:bg-gray-200 dark:hover:bg-gray-700
      transition-all duration-200
    "
  >
    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
  </button>
);

export default DashboardSidebar;
