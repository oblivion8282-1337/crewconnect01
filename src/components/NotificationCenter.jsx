import React from 'react';
import { Bell } from 'lucide-react';
import { formatTimeAgo } from '../utils/dateUtils';

/**
 * NotificationCenter - Dropdown für Benachrichtigungen
 *
 * @param {Object} props
 * @param {Array} props.notifications - Liste der Benachrichtigungen
 * @param {number} props.unreadCount - Anzahl ungelesener Benachrichtigungen
 * @param {boolean} props.isOpen - Ob das Dropdown geöffnet ist
 * @param {Function} props.onToggle - Callback zum Öffnen/Schließen
 * @param {Function} props.onMarkAllAsRead - Callback zum Markieren aller als gelesen
 * @param {Function} props.onMarkAsRead - Callback zum Markieren einer einzelnen als gelesen
 */
const NotificationCenter = ({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onMarkAllAsRead,
  onMarkAsRead
}) => {
  return (
    <div className="relative">
      {/* Bell-Button */}
      <button
        onClick={onToggle}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Benachrichtigungen"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop zum Schließen */}
          <div
            className="fixed inset-0 z-40"
            onClick={onToggle}
          />

          {/* Dropdown-Inhalt */}
          <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white text-sm">
                Benachrichtigungen
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Alle gelesen
                </button>
              )}
            </div>

            {/* Benachrichtigungsliste */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Keine Benachrichtigungen
                </div>
              ) : (
                notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Einzelne Benachrichtigung
 */
const NotificationItem = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    onMarkAsRead(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
        !notification.read ? 'bg-blue-50 dark:bg-blue-900/30' : ''
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <p className={`font-medium text-sm ${
          !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
        }`}>
          {notification.title}
        </p>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {notification.message}
      </p>
    </div>
  );
};

export default NotificationCenter;
