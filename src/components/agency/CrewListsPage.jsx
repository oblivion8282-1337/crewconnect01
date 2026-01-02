import React, { useState, useMemo } from 'react';
import {
  Heart,
  Users,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  UserMinus,
  ChevronDown,
  ChevronRight,
  Palette,
  Search,
  MessageSquare,
  UserPlus
} from 'lucide-react';
import { CREW_LIST_COLORS } from '../../hooks/useProfile';
import FavoriteButton from '../shared/FavoriteButton';
import { ProfileAvatar } from '../shared/ProfileField';

/**
 * CrewListsPage - Übersichtsseite für Favoriten und Crew-Listen
 *
 * Zeigt:
 * - Alle Favoriten (Freelancer mit Herz)
 * - Alle Crew-Listen mit deren Mitgliedern
 * - Aktionen: Liste erstellen, umbenennen, löschen, Farbe ändern
 */
const CrewListsPage = ({
  freelancers,
  favorites,
  crewLists,
  onToggleFavorite,
  onCreateList,
  onDeleteList,
  onRenameList,
  onUpdateListColor,
  onAddToList,
  onRemoveFromList,
  onOpenAddToListModal,
  onOpenAddFreelancerModal,
  onOpenChat,
  onSelectFreelancer,
  isFavorite,
  getListsForFreelancer
}) => {
  const [expandedLists, setExpandedLists] = useState({});
  const [editingListId, setEditingListId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Favoriten-Freelancer laden
  const favoriteFreelancers = freelancers.filter(f => favorites.includes(f.id));

  // Alle Freelancer aus Crew (Favoriten + Listen)
  const crewFreelancerIds = useMemo(() => {
    const ids = new Set(favorites);
    crewLists.forEach(list => {
      list.freelancerIds.forEach(id => ids.add(id));
    });
    return ids;
  }, [favorites, crewLists]);

  const crewFreelancers = useMemo(() => {
    return freelancers.filter(f => crewFreelancerIds.has(f.id));
  }, [freelancers, crewFreelancerIds]);

  // Gefilterte Freelancer basierend auf Suche
  const filteredCrewFreelancers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return crewFreelancers.filter(f => {
      const fullName = `${f.firstName || ''} ${f.lastName || ''}`.toLowerCase();
      const professions = (f.professions || []).join(' ').toLowerCase();
      return fullName.includes(query) || professions.includes(query);
    });
  }, [crewFreelancers, searchQuery]);

  const toggleListExpansion = (listId) => {
    setExpandedLists(prev => ({
      ...prev,
      [listId]: !prev[listId]
    }));
  };

  const startEditing = (list) => {
    setEditingListId(list.id);
    setEditingName(list.name);
    setOpenMenuId(null);
  };

  const saveEditing = () => {
    if (editingName.trim() && editingListId) {
      onRenameList(editingListId, editingName.trim());
    }
    setEditingListId(null);
    setEditingName('');
  };

  const handleDeleteList = (listId) => {
    if (window.confirm('Liste wirklich löschen? Freelancer werden nicht gelöscht, nur aus der Liste entfernt.')) {
      onDeleteList(listId);
    }
    setOpenMenuId(null);
  };

  const getColorClasses = (colorId) => {
    return CREW_LIST_COLORS.find(c => c.id === colorId) || CREW_LIST_COLORS[0];
  };

  const FreelancerCard = ({ freelancer, showRemoveFromList, listId }) => {
    const fullName = `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim() || 'Unbekannt';

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        {/* Avatar + Info - Klickbar zum Profil */}
        <button
          onClick={() => onSelectFreelancer?.(freelancer.id)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <ProfileAvatar
            imageUrl={freelancer.profileImage}
            firstName={freelancer.firstName}
            lastName={freelancer.lastName}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {fullName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {freelancer.professions?.join(', ') || 'Keine Berufe angegeben'}
            </div>
          </div>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Chat Button */}
          {onOpenChat && (
            <button
              onClick={() => onOpenChat(freelancer.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Chat öffnen"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          <FavoriteButton
            freelancerId={freelancer.id}
            isFavorite={isFavorite(freelancer.id)}
            onToggle={onToggleFavorite}
            crewLists={crewLists}
            getListsForFreelancer={getListsForFreelancer}
            onAddToList={onAddToList}
            onRemoveFromList={onRemoveFromList}
            onOpenAddToListModal={onOpenAddToListModal}
            size="sm"
          />

          {showRemoveFromList && (
            <button
              onClick={() => onRemoveFromList(listId, freelancer.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Aus Liste entfernen"
            >
              <UserMinus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meine Freelancer</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {crewFreelancers.length} Freelancer • Favoriten und Crew-Listen verwalten
            </p>
          </div>

        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="In meiner Crew suchen..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Search Results */}
        {searchQuery.trim() && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              {filteredCrewFreelancers.length} {filteredCrewFreelancers.length === 1 ? 'Ergebnis' : 'Ergebnisse'} für "{searchQuery}"
            </h3>
            {filteredCrewFreelancers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Keine Freelancer in deiner Crew gefunden.
              </p>
            ) : (
              <div className="grid gap-2">
                {filteredCrewFreelancers.map(freelancer => (
                  <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Favoriten-Sektion */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Favoriten</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {favoriteFreelancers.length} {favoriteFreelancers.length === 1 ? 'Freelancer' : 'Freelancer'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAddFreelancerModal?.()}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Hinzufügen
          </button>
        </div>

        <div className="p-4">
          {favoriteFreelancers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Noch keine Favoriten vorhanden</p>
              <p className="text-sm mt-1">Markiere Freelancer mit dem Herz-Symbol</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {favoriteFreelancers.map(freelancer => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Crew-Listen */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Crew-Listen</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {crewLists.length} {crewLists.length === 1 ? 'Liste' : 'Listen'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAddToListModal(null)}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Neue Liste
          </button>
        </div>

        {crewLists.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Noch keine Crew-Listen erstellt</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Erstelle eine Liste um Freelancer zu gruppieren</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {crewLists.map(list => {
              const colorClasses = getColorClasses(list.color);
              const isExpanded = expandedLists[list.id] !== false; // Default: expanded
              const listFreelancers = freelancers.filter(f => list.freelancerIds.includes(f.id));

              return (
                <div key={list.id}>
                  {/* List Header */}
                  <div className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <button
                      onClick={() => toggleListExpansion(list.id)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    <div className={`w-3 h-3 rounded-full ${colorClasses.bg}`} />

                    {editingListId === list.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={saveEditing}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                        className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleListExpansion(list.id)}
                      >
                        <h3 className="font-medium text-gray-900 dark:text-white">{list.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {listFreelancers.length} {listFreelancers.length === 1 ? 'Mitglied' : 'Mitglieder'}
                        </p>
                      </div>
                    )}

                    {/* Add Freelancer Button */}
                    <button
                      onClick={() => onOpenAddFreelancerModal?.(list.id)}
                      className="px-2.5 py-1 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">Hinzufügen</span>
                    </button>

                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === list.id ? null : list.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === list.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
                          <button
                            onClick={() => startEditing(list)}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-200"
                          >
                            <Edit2 className="w-4 h-4" />
                            Umbenennen
                          </button>
                          <button
                            onClick={() => {
                              setShowColorPicker(list.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-200"
                          >
                            <Palette className="w-4 h-4" />
                            Farbe ändern
                          </button>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                          <button
                            onClick={() => handleDeleteList(list.id)}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                            Liste löschen
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Color Picker */}
                  {showColorPicker === list.id && (
                    <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Farbe:</span>
                      {CREW_LIST_COLORS.map(color => (
                        <button
                          key={color.id}
                          onClick={() => {
                            onUpdateListColor(list.id, color.id);
                            setShowColorPicker(null);
                          }}
                          className={`w-6 h-6 rounded-full ${color.bg} hover:scale-110 transition-transform ${
                            list.color === color.id ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''
                          }`}
                          title={color.name}
                        />
                      ))}
                      <button
                        onClick={() => setShowColorPicker(null)}
                        className="ml-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Abbrechen
                      </button>
                    </div>
                  )}

                  {/* List Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700/50 pt-3">
                      {listFreelancers.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <p className="text-sm">Noch keine Freelancer in dieser Liste</p>
                          <p className="text-xs mt-1">Füge Freelancer über die Suche hinzu</p>
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {listFreelancers.map(freelancer => (
                            <FreelancerCard
                              key={freelancer.id}
                              freelancer={freelancer}
                              showRemoveFromList
                              listId={list.id}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrewListsPage;
