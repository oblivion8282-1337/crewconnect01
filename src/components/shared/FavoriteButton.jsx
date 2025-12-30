import React, { useState, useRef, useEffect } from 'react';
import { Heart, ChevronDown, Plus, Check } from 'lucide-react';
import { CREW_LIST_COLORS } from '../../hooks/useProfile';

/**
 * FavoriteButton - Herz-Icon zum Favorisieren mit optionalem Dropdown für Crew-Listen
 *
 * @param {number} freelancerId - ID des Freelancers
 * @param {boolean} isFavorite - Ist der Freelancer ein Favorit?
 * @param {function} onToggle - Callback zum Toggling des Favoriten-Status
 * @param {Array} crewLists - Liste der Crew-Listen (optional)
 * @param {function} getListsForFreelancer - Gibt Listen zurück, in denen Freelancer ist (optional)
 * @param {function} onAddToList - Callback zum Hinzufügen zu einer Liste (optional)
 * @param {function} onRemoveFromList - Callback zum Entfernen aus einer Liste (optional)
 * @param {function} onOpenAddToListModal - Öffnet das Modal zum Erstellen einer neuen Liste (optional)
 * @param {string} size - Größe: 'sm', 'md', 'lg'
 * @param {boolean} showDropdown - Zeigt Dropdown für Listen an
 */
const FavoriteButton = ({
  freelancerId,
  isFavorite,
  onToggle,
  crewLists = [],
  getListsForFreelancer,
  onAddToList,
  onRemoveFromList,
  onOpenAddToListModal,
  size = 'md',
  showDropdown = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Schließe Dropdown bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  const freelancerLists = getListsForFreelancer ? getListsForFreelancer(freelancerId) : [];
  const hasLists = crewLists.length > 0;
  const canShowDropdown = showDropdown && hasLists && onAddToList;

  const handleHeartClick = (e) => {
    e.stopPropagation();
    onToggle(freelancerId);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleListToggle = (listId, isInList) => {
    if (isInList) {
      onRemoveFromList?.(listId, freelancerId);
    } else {
      onAddToList?.(listId, freelancerId);
    }
  };

  const getColorClasses = (colorId) => {
    const color = CREW_LIST_COLORS.find(c => c.id === colorId);
    return color || CREW_LIST_COLORS[0];
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      {/* Herz-Button */}
      <button
        onClick={handleHeartClick}
        className={`${buttonSizeClasses[size]} rounded-lg transition-all duration-200
          ${isFavorite
            ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20'
            : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        title={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      >
        <Heart
          className={sizeClasses[size]}
          fill={isFavorite ? 'currentColor' : 'none'}
        />
      </button>

      {/* Dropdown-Pfeil (nur wenn Listen vorhanden) */}
      {canShowDropdown && (
        <button
          onClick={handleDropdownClick}
          className={`${buttonSizeClasses[size]} -ml-1 rounded-lg transition-colors
            text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
          title="Zu Liste hinzufügen"
        >
          <ChevronDown className={`${sizeClasses[size]} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Dropdown-Menü */}
      {isOpen && canShowDropdown && (
        <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Zu Liste hinzufügen
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {crewLists.map(list => {
              const isInList = freelancerLists.some(l => l.id === list.id);
              const colorClasses = getColorClasses(list.color);

              return (
                <button
                  key={list.id}
                  onClick={() => handleListToggle(list.id, isInList)}
                  className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className={`w-3 h-3 rounded-full ${colorClasses.bg}`} />
                  <span className="flex-1 text-left text-sm text-gray-700 dark:text-gray-200 truncate">
                    {list.name}
                  </span>
                  {isInList && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </button>
              );
            })}
          </div>

          {onOpenAddToListModal && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-1" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAddToListModal(freelancerId);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-accent"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Neue Liste erstellen</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;
