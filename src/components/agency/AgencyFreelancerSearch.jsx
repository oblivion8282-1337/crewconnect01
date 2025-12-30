import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Euro,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Briefcase,
  Star
} from 'lucide-react';
import { PROFESSIONS } from '../../constants/profileOptions';
import FavoriteButton from '../shared/FavoriteButton';

/**
 * AgencyFreelancerSearch - Eigenständige Suchseite für Freelancer
 */
const AgencyFreelancerSearch = ({
  freelancers,
  getDayStatus,
  agencyId,
  onSelectFreelancer,
  // Favoriten & Crew-Listen Props
  isFavorite,
  onToggleFavorite,
  crewLists,
  getListsForFreelancer,
  onAddToList,
  onRemoveFromList,
  onOpenAddToListModal
}) => {
  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    profession: '',
    city: '',
    skills: '',
    equipment: '',
    minRate: '',
    maxRate: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Berechne Verfügbarkeits-Status für die nächsten 7 Tage
  const getAvailabilityStatus = (freelancerId) => {
    const today = new Date();
    let availableDays = 0;
    let totalDays = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();

      // Nur Werktage zählen
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
        const dateStr = date.toISOString().split('T')[0];
        const status = getDayStatus(freelancerId, dateStr, agencyId);

        if (!status.isBlocked && !status.hasBooking) {
          availableDays++;
        }
      }
    }

    if (totalDays === 0) return 'green';
    const percentage = availableDays / totalDays;

    if (percentage >= 0.8) return 'green';
    if (percentage >= 0.3) return 'yellow';
    return 'red';
  };

  // Gefilterte Freelancer
  const filteredFreelancers = useMemo(() => {
    return freelancers.filter(freelancer => {
      // Name Filter
      if (filters.name.trim()) {
        const fullName = `${freelancer.firstName} ${freelancer.lastName}`.toLowerCase();
        if (!fullName.includes(filters.name.toLowerCase())) return false;
      }

      // Beruf Filter
      if (filters.profession) {
        if (!freelancer.professions?.includes(filters.profession)) return false;
      }

      // Stadt Filter
      if (filters.city.trim()) {
        if (!freelancer.address?.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
      }

      // Skills Filter
      if (filters.skills.trim()) {
        const searchSkills = filters.skills.toLowerCase().split(',').map(s => s.trim());
        const hasSkill = searchSkills.some(skill =>
          freelancer.skills?.some(s => s.toLowerCase().includes(skill))
        );
        if (!hasSkill) return false;
      }

      // Equipment Filter
      if (filters.equipment.trim()) {
        const searchEquipment = filters.equipment.toLowerCase().split(',').map(e => e.trim());
        const hasEquipment = searchEquipment.some(equip =>
          freelancer.equipment?.some(e => e.toLowerCase().includes(equip))
        );
        if (!hasEquipment) return false;
      }

      // Tagessatz Range Filter
      if (filters.minRate) {
        if (!freelancer.dayRate || freelancer.dayRate < parseInt(filters.minRate)) return false;
      }
      if (filters.maxRate) {
        if (!freelancer.dayRate || freelancer.dayRate > parseInt(filters.maxRate)) return false;
      }

      return true;
    });
  }, [freelancers, filters]);

  const handleReset = () => {
    setFilters({
      name: '',
      profession: '',
      city: '',
      skills: '',
      equipment: '',
      minRate: '',
      maxRate: ''
    });
  };

  const availabilityColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  const availabilityLabels = {
    green: 'Verfügbar',
    yellow: 'Teilweise belegt',
    red: 'Ausgebucht'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Freelancer finden</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Suche nach Freelancern für deine Projekte
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        {/* Hauptfilter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                placeholder="Suchen..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Beruf */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beruf</label>
            <select
              value={filters.profession}
              onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">Alle Berufe</option>
              {PROFESSIONS.map(prof => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
            </select>
          </div>

          {/* Stadt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stadt</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="z.B. Berlin"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Erweiterte Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Filter className="w-4 h-4" />
            Erweiterte Filter
            {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredFreelancers.length} Ergebnisse
            </span>
            <button
              onClick={handleReset}
              className="text-sm text-accent hover:underline"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>

        {/* Erweiterte Filter */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                placeholder="z.B. Premiere, DaVinci"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipment</label>
              <input
                type="text"
                value={filters.equipment}
                onChange={(e) => setFilters({ ...filters, equipment: e.target.value })}
                placeholder="z.B. RED, ARRI"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* Min Tagessatz */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagessatz min (€)</label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={filters.minRate}
                  onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Max Tagessatz */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagessatz max (€)</label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={filters.maxRate}
                  onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                  placeholder="2000"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ergebnis-Grid */}
      {filteredFreelancers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Keine Freelancer gefunden</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Versuche andere Filterkriterien</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFreelancers.map(freelancer => {
            const availabilityStatus = getAvailabilityStatus(freelancer.id);
            const fullName = `${freelancer.firstName} ${freelancer.lastName}`;
            const initials = `${freelancer.firstName?.[0] || ''}${freelancer.lastName?.[0] || ''}`;

            return (
              <div
                key={freelancer.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-accent hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => onSelectFreelancer(freelancer.id)}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-200 flex-shrink-0">
                    {freelancer.avatar || initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{fullName}</h3>
                      {/* Verfügbarkeits-Dot */}
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${availabilityColors[availabilityStatus]} flex-shrink-0`}
                        title={availabilityLabels[availabilityStatus]}
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {freelancer.professions?.slice(0, 2).join(', ') || 'Keine Berufe'}
                    </p>
                  </div>

                  {/* Favorit Button */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <FavoriteButton
                      freelancerId={freelancer.id}
                      isFavorite={isFavorite?.(freelancer.id)}
                      onToggle={onToggleFavorite}
                      crewLists={crewLists}
                      getListsForFreelancer={getListsForFreelancer}
                      onAddToList={onAddToList}
                      onRemoveFromList={onRemoveFromList}
                      onOpenAddToListModal={onOpenAddToListModal}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {/* Standort & Tagessatz */}
                  <div className="flex items-center justify-between text-sm">
                    {freelancer.address?.city && (
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {freelancer.address.city}
                      </span>
                    )}
                    {freelancer.dayRate && (
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {freelancer.dayRate}€/Tag
                      </span>
                    )}
                  </div>

                  {/* Skills Preview */}
                  {freelancer.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {freelancer.skills.slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {freelancer.skills.length > 3 && (
                        <span className="px-2 py-0.5 text-gray-400 dark:text-gray-500 text-xs">
                          +{freelancer.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Rating */}
                  {freelancer.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{freelancer.rating}</span>
                    </div>
                  )}
                </div>

                {/* Hover Indicator */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm text-accent font-medium">Profil ansehen →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgencyFreelancerSearch;
