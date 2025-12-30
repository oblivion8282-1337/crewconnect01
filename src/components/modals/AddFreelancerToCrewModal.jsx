import React, { useState, useMemo, useRef, useCallback } from 'react';
import { X, Search, Heart, UserPlus, MessageSquare, GripHorizontal } from 'lucide-react';
import { CREW_LIST_COLORS } from '../../hooks/useProfile';
import { ProfileAvatar } from '../shared/ProfileField';

/**
 * AddFreelancerToCrewModal - Modal zum Suchen und Hinzufügen von Freelancern zur Crew
 *
 * Ermöglicht:
 * - Suche nach allen Freelancern (nicht nur Crew)
 * - Favoriten-Toggle
 * - Zu Liste hinzufügen
 * - Chat öffnen
 */
const AddFreelancerToCrewModal = ({
  isOpen,
  onClose,
  freelancers,
  onToggleFavorite,
  onAddToList,
  onOpenChat,
  isFavorite,
  getListsForFreelancer,
  initialListId = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Reset when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Drag handlers
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Gefilterte Freelancer basierend auf Suche
  const filteredFreelancers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return freelancers.filter(f => {
      const fullName = `${f.firstName || ''} ${f.lastName || ''}`.toLowerCase();
      const professions = (f.professions || []).join(' ').toLowerCase();
      const city = (f.address?.city || '').toLowerCase();
      return fullName.includes(query) || professions.includes(query) || city.includes(query);
    }).slice(0, 10); // Limit to 10 results
  }, [freelancers, searchQuery]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToList = (freelancerId) => {
    if (initialListId && onAddToList) {
      onAddToList(initialListId, freelancerId);
    }
  };

  const handleOpenChat = (freelancerId) => {
    if (onOpenChat) {
      onOpenChat(freelancerId);
      onClose();
    }
  };

  const FreelancerRow = ({ freelancer }) => {
    const fullName = `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim() || 'Unbekannt';
    const isInFavorites = isFavorite(freelancer.id);
    const freelancerLists = getListsForFreelancer(freelancer.id);

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        {/* Avatar */}
        <ProfileAvatar
          imageUrl={freelancer.profileImage}
          firstName={freelancer.firstName}
          lastName={freelancer.lastName}
          size="sm"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-white truncate">
            {fullName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {freelancer.professions?.join(', ') || 'Keine Berufe'}{freelancer.address?.city ? ` • ${freelancer.address.city}` : ''}
          </div>
          {/* Liste-Tags */}
          {freelancerLists.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {freelancerLists.map(list => {
                const color = CREW_LIST_COLORS.find(c => c.id === list.color) || CREW_LIST_COLORS[0];
                return (
                  <span
                    key={list.id}
                    className={`text-xs px-1.5 py-0.5 rounded ${color.bg} ${color.text}`}
                  >
                    {list.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Favoriten-Toggle - nur wenn von Favoriten geöffnet (kein initialListId) */}
          {!initialListId && (
            <button
              onClick={() => onToggleFavorite(freelancer.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                isInFavorites
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              title={isInFavorites ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              <Heart className="w-4 h-4" fill={isInFavorites ? 'currentColor' : 'none'} />
            </button>
          )}

          {/* Zu Liste hinzufügen - nur wenn von einer Liste geöffnet */}
          {initialListId && (
            <button
              onClick={() => handleAddToList(freelancer.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                freelancerLists.some(l => l.id === initialListId)
                  ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                  : 'text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
              title="Zur Liste hinzufügen"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}

          {/* Chat */}
          <button
            onClick={() => handleOpenChat(freelancer.id)}
            className="p-1.5 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Chat öffnen"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {/* Header - Draggable */}
        <div
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-move select-none"
          onMouseDown={handleMouseDown}
          ref={dragRef}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Crew hinzufügen
            </h2>
          </div>
          <button
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Freelancer suchen (Name, Beruf, Stadt)..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {!searchQuery.trim() ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Gib einen Namen, Beruf oder Ort ein</p>
                <p className="text-sm mt-1">um Freelancer zu finden</p>
              </div>
            ) : filteredFreelancers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Keine Freelancer gefunden für "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {filteredFreelancers.length} {filteredFreelancers.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
                </p>
                {filteredFreelancers.map(freelancer => (
                  <FreelancerRow key={freelancer.id} freelancer={freelancer} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFreelancerToCrewModal;
