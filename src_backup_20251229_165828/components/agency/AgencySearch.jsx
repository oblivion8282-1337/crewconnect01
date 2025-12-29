import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, MapPin, Globe, Laptop, Star, Heart, Filter,
  ChevronDown, ChevronUp, X, Mail, Phone, ExternalLink,
  Calendar, Users, Euro, Briefcase, Check, CheckSquare, Square
} from 'lucide-react';
import DateRangePicker from '../shared/DateRangePicker';
import { PROFESSIONS } from '../../constants/profileOptions';

/**
 * AgencySearch - Erweiterte Freelancer-Suche für Agenturen
 */
const AgencySearch = ({
  projects,
  freelancers,
  agencyId,
  getDayStatus,
  onBook
}) => {
  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    profession: '',
    startDate: '',
    endDate: '',
    city: '',
    country: '',
    radius: 50,
    remoteOnly: false,
    onlyFullyAvailable: false,
    favoritesOnly: false
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  // Prüfe ob mindestens ein Filter gesetzt ist
  const hasActiveFilters = useMemo(() => {
    return (
      filters.name.trim() !== '' ||
      filters.profession !== '' ||
      filters.startDate !== '' ||
      filters.city.trim() !== '' ||
      filters.country.trim() !== '' ||
      filters.remoteOnly ||
      filters.favoritesOnly
    );
  }, [filters]);

  // Gefilterte Freelancer
  const filteredFreelancers = useMemo(() => {
    if (!hasSearched || !hasActiveFilters) return [];

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

      // Land Filter
      if (filters.country.trim()) {
        if (!freelancer.address?.country?.toLowerCase().includes(filters.country.toLowerCase())) return false;
      }

      // Remote Filter
      if (filters.remoteOnly && !freelancer.remoteWork) return false;

      // Favoriten Filter
      if (filters.favoritesOnly && !favorites.has(freelancer.id)) return false;

      // Verfügbarkeit prüfen (wenn Zeitraum gewählt)
      if (filters.startDate && filters.endDate && filters.onlyFullyAvailable) {
        const availability = calculateAvailability(freelancer.id, filters.startDate, filters.endDate);
        if (availability.percentage < 100) return false;
      }

      return true;
    });
  }, [freelancers, filters, hasSearched, hasActiveFilters, favorites]);

  // Berechne Verfügbarkeit für einen Freelancer im Zeitraum (aus Agentur-Sicht!)
  const calculateAvailability = (freelancerIdParam, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];
    let availableDays = 0;
    let totalWorkDays = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!isWeekend) {
        totalWorkDays++;
        // WICHTIG: agencyId übergeben für korrekte Agentur-Sicht!
        const status = getDayStatus(freelancerIdParam, dateStr, agencyId);
        const isAvailable = !status.isBlocked && !status.hasBooking;
        if (isAvailable) availableDays++;

        days.push({
          date: new Date(d),
          dateStr,
          isWeekend,
          isAvailable,
          status
        });
      } else {
        days.push({
          date: new Date(d),
          dateStr,
          isWeekend,
          isAvailable: false,
          status: null
        });
      }
    }

    return {
      days,
      availableDays,
      totalWorkDays,
      percentage: totalWorkDays > 0 ? Math.round((availableDays / totalWorkDays) * 100) : 100
    };
  };

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleReset = () => {
    setFilters({
      name: '',
      profession: '',
      startDate: '',
      endDate: '',
      city: '',
      country: '',
      radius: 50,
      remoteOnly: false,
      onlyFullyAvailable: false,
      favoritesOnly: false
    });
    setHasSearched(false);
    setShowDatePicker(false);
  };

  const toggleFavorite = (freelancerId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(freelancerId)) {
        newFavorites.delete(freelancerId);
      } else {
        newFavorites.add(freelancerId);
      }
      return newFavorites;
    });
  };

  const formatDateRange = () => {
    if (!filters.startDate) return 'Zeitraum wählen';
    const start = new Date(filters.startDate);
    const end = filters.endDate ? new Date(filters.endDate) : null;
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

    if (end) {
      return `${start.getDate()}. ${monthNames[start.getMonth()]} – ${end.getDate()}. ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
    }
    return `Ab ${start.getDate()}. ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Freelancer suchen</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        {/* Hauptfilter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                placeholder="Name suchen..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Berufsfeld */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Berufsfeld</label>
            <select
              value={filters.profession}
              onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle Berufe</option>
              {PROFESSIONS.map(prof => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
            </select>
          </div>

          {/* Stadt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="z.B. Berlin"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Land */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                placeholder="z.B. Deutschland"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Zeitraum */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Zeitraum</label>
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`w-full md:w-auto px-4 py-2 border rounded-lg text-left flex items-center gap-2 transition-colors ${
              showDatePicker ? 'border-blue-500 ring-2 ring-blue-200' : 'hover:border-gray-400'
            }`}
          >
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={filters.startDate ? 'text-gray-900' : 'text-gray-400'}>
              {formatDateRange()}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
          </button>

          {showDatePicker && (
            <div className="mt-3">
              <DateRangePicker
                startDate={filters.startDate}
                endDate={filters.endDate}
                onChange={({ startDate, endDate }) => setFilters({ ...filters, startDate, endDate })}
              />
            </div>
          )}
        </div>

        {/* Erweiterte Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <Filter className="w-4 h-4" />
          Erweiterte Filter
          {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Erweiterte Filter */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius: {filters.radius} km
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={filters.radius}
                onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Switches */}
            <div className="flex flex-col gap-3">
              {/* Remote */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.remoteOnly}
                    onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${
                    filters.remoteOnly ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      filters.remoteOnly ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <span className="text-sm flex items-center gap-1">
                  <Laptop className="w-4 h-4" />
                  Nur Remote
                </span>
              </label>

              {/* 100% Verfügbar */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.onlyFullyAvailable}
                    onChange={(e) => setFilters({ ...filters, onlyFullyAvailable: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${
                    filters.onlyFullyAvailable ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      filters.onlyFullyAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <span className="text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Nur 100% verfügbar
                </span>
              </label>
            </div>

            {/* Favoriten */}
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.favoritesOnly}
                    onChange={(e) => setFilters({ ...filters, favoritesOnly: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${
                    filters.favoritesOnly ? 'bg-red-500' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      filters.favoritesOnly ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <span className="text-sm flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Nur Favoriten
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Such-Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            disabled={!hasActiveFilters}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Suchen
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Zurücksetzen
          </button>
        </div>
      </div>

      {/* Ergebnisse */}
      {!hasSearched ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">Freelancer finden</h2>
          <p className="text-gray-400">
            Nutze die Filter oben, um passende Freelancer zu finden.
          </p>
        </div>
      ) : filteredFreelancers.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">Keine Ergebnisse</h2>
          <p className="text-gray-400">
            Keine Freelancer gefunden. Versuche andere Filterkriterien.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {filteredFreelancers.length} Freelancer gefunden
          </p>

          {filteredFreelancers.map(freelancer => (
            <FreelancerCard
              key={freelancer.id}
              freelancer={freelancer}
              startDate={filters.startDate}
              endDate={filters.endDate}
              isFavorite={favorites.has(freelancer.id)}
              onToggleFavorite={() => toggleFavorite(freelancer.id)}
              calculateAvailability={calculateAvailability}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Freelancer Ergebnis-Karte
 */
const FreelancerCard = ({
  freelancer,
  startDate,
  endDate,
  isFavorite,
  onToggleFavorite,
  calculateAvailability
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState(null);
  const [includeWeekends, setIncludeWeekends] = useState(false);
  const visibility = freelancer.visibility || {};

  // Verfügbarkeit berechnen wenn Zeitraum gewählt
  const availability = startDate && endDate
    ? calculateAvailability(freelancer.id, startDate, endDate)
    : null;

  // Alle verfügbaren Tage im Buchungszeitraum auswählen
  const handleSelectAll = useCallback(() => {
    if (!availability) return;
    const newSelected = new Set();
    availability.days.forEach(day => {
      if (day.isAvailable || (includeWeekends && day.isWeekend)) {
        newSelected.add(day.dateStr);
      }
    });
    setSelectedDays(newSelected);
    setLastClickedIndex(null);
  }, [availability, includeWeekends]);

  // Alle Tage abwählen
  const handleDeselectAll = useCallback(() => {
    setSelectedDays(new Set());
    setLastClickedIndex(null);
  }, []);

  // Wochenenden toggle
  const handleToggleWeekends = useCallback((include) => {
    setIncludeWeekends(include);
    if (!availability) return;

    setSelectedDays(prev => {
      const newSelected = new Set(prev);
      availability.days.forEach(day => {
        if (day.isWeekend) {
          if (include) {
            newSelected.add(day.dateStr);
          } else {
            newSelected.delete(day.dateStr);
          }
        }
      });
      return newSelected;
    });
  }, [availability]);

  // Tag anklicken (mit Shift-Support)
  const handleDayClick = useCallback((dayIndex, day, shiftKey) => {
    if (!availability) return;

    setSelectedDays(prev => {
      const newSelected = new Set(prev);

      if (shiftKey && lastClickedIndex !== null) {
        // Shift-Klick: Bereich auswählen
        const start = Math.min(lastClickedIndex, dayIndex);
        const end = Math.max(lastClickedIndex, dayIndex);

        for (let i = start; i <= end; i++) {
          const d = availability.days[i];
          if (d.isAvailable || (includeWeekends && d.isWeekend)) {
            newSelected.add(d.dateStr);
          }
        }
      } else {
        // Normaler Klick: Toggle
        if (newSelected.has(day.dateStr)) {
          newSelected.delete(day.dateStr);
        } else if (day.isAvailable || (includeWeekends && day.isWeekend)) {
          newSelected.add(day.dateStr);
        }
      }

      return newSelected;
    });

    setLastClickedIndex(dayIndex);
  }, [availability, lastClickedIndex, includeWeekends]);

  const fullName = `${freelancer.firstName} ${freelancer.lastName}`;

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 flex gap-4">
        {/* Avatar */}
        <div className="text-5xl">{freelancer.avatar}</div>

        {/* Infos */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{fullName}</h3>
                {freelancer.verified && (
                  <span className="text-blue-500" title="Verifiziert">✓</span>
                )}
                <button
                  onClick={onToggleFavorite}
                  className={`p-1 rounded transition-colors ${
                    isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              <p className="text-gray-600">{(freelancer.professions || []).join(', ')}</p>
            </div>

            {/* Rating & Tagessatz */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">{freelancer.rating}</span>
              </div>
              {visibility.dayRate !== false && freelancer.dayRate && (
                <p className="text-sm text-gray-500">{freelancer.dayRate}€ / Tag</p>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
            {visibility.address !== false && freelancer.address?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {freelancer.address.city}, {freelancer.address.country}
              </span>
            )}
            {freelancer.remoteWork && (
              <span className="flex items-center gap-1 text-green-600">
                <Laptop className="w-4 h-4" />
                Remote möglich
              </span>
            )}
            {freelancer.experience && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {freelancer.experience} Jahre Erfahrung
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verfügbarkeitsanzeige */}
      {availability && (
        <div className="px-4 pb-4">
          <AvailabilityDisplay
            availability={availability}
            selectedDays={selectedDays}
            includeWeekends={includeWeekends}
            onDayClick={handleDayClick}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onToggleWeekends={handleToggleWeekends}
          />
        </div>
      )}

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 border-t bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-1"
      >
        {expanded ? 'Weniger anzeigen' : 'Mehr anzeigen'}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 border-t bg-gray-50 space-y-4">
          {/* Bio */}
          {visibility.bio !== false && freelancer.bio && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Über mich</h4>
              <p className="text-sm text-gray-600">{freelancer.bio}</p>
            </div>
          )}

          {/* Skills */}
          {freelancer.skills?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {visibility.equipment !== false && freelancer.equipment?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Equipment</h4>
              <div className="flex flex-wrap gap-2">
                {freelancer.equipment.map(item => (
                  <span key={item} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sprachen */}
          {freelancer.languages?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sprachen</h4>
              <div className="flex flex-wrap gap-2">
                {freelancer.languages.map(lang => (
                  <span key={lang} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Kontakt */}
          <div className="flex flex-wrap gap-4">
            {visibility.email !== false && freelancer.email && (
              <a href={`mailto:${freelancer.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {freelancer.email}
              </a>
            )}
            {visibility.phone !== false && freelancer.phone && (
              <a href={`tel:${freelancer.phone}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {freelancer.phone}
              </a>
            )}
            {visibility.website !== false && freelancer.website && (
              <a href={freelancer.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                Website
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Verfügbarkeitsanzeige mit kompakter Monatsübersicht und Tages-Selektion
 */
const AvailabilityDisplay = ({
  availability,
  selectedDays,
  includeWeekends,
  onDayClick,
  onSelectAll,
  onDeselectAll,
  onToggleWeekends
}) => {
  const { days, availableDays, totalWorkDays, percentage } = availability;

  // Berechne einen globalen Index für jeden Tag (für Shift-Klick)
  let globalIndex = 0;
  const daysWithIndex = days.map(day => ({ ...day, globalIndex: globalIndex++ }));

  // Gruppiere Tage nach Monat
  const monthGroups = {};
  daysWithIndex.forEach(day => {
    const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`;
    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = {
        year: day.date.getFullYear(),
        month: day.date.getMonth(),
        days: []
      };
    }
    monthGroups[monthKey].days.push(day);
  });

  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  // Farbe basierend auf Verfügbarkeit
  const getPercentageColor = (pct) => {
    if (pct >= 80) return 'text-green-600 bg-green-100';
    if (pct >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const selectedCount = selectedDays.size;

  return (
    <div className="border rounded-lg p-3 bg-white">
      {/* Zusammenfassung */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Verfügbarkeit im Zeitraum</span>
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getPercentageColor(percentage)}`}>
          {percentage}% ({availableDays}/{totalWorkDays} Tage)
        </span>
      </div>

      {/* Fortschrittsbalken */}
      <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Selektion Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4 pb-3 border-b">
        {/* Alle auswählen / Alle abwählen */}
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Alle auswählen
          </button>
          <button
            onClick={onDeselectAll}
            disabled={selectedCount === 0}
            className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="w-3.5 h-3.5" />
            Alle abwählen
          </button>
        </div>

        {/* Wochenenden Switch */}
        <label className="flex items-center gap-2 cursor-pointer ml-auto">
          <span className="text-xs text-gray-600">Wochenenden</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={includeWeekends}
              onChange={(e) => onToggleWeekends(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-9 h-5 rounded-full transition-colors ${
              includeWeekends ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                includeWeekends ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </div>
        </label>

        {/* Selektions-Info */}
        {selectedCount > 0 && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {selectedCount} Tag{selectedCount !== 1 ? 'e' : ''} ausgewählt
          </span>
        )}
      </div>

      {/* Shift-Klick Hinweis */}
      <p className="text-xs text-gray-400 mb-2">
        Tipp: Shift + Klick für Mehrfachauswahl
      </p>

      {/* Kompakte Monatsansicht */}
      <div className="flex flex-wrap gap-4">
        {Object.values(monthGroups).map(group => (
          <div key={`${group.year}-${group.month}`} className="flex-shrink-0">
            <div className="text-xs font-medium text-gray-500 mb-1">
              {monthNames[group.month]} {group.year}
            </div>
            <div className="flex flex-wrap gap-0.5" style={{ maxWidth: '140px' }}>
              {group.days.map(day => {
                const isSelected = selectedDays.has(day.dateStr);
                const isSelectable = day.isAvailable || (includeWeekends && day.isWeekend);

                return (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={(e) => onDayClick(day.globalIndex, day, e.shiftKey)}
                    disabled={!isSelectable && !day.isWeekend}
                    title={`${day.date.getDate()}. ${monthNames[day.date.getMonth()]} - ${
                      day.isWeekend ? 'Wochenende' : day.isAvailable ? 'Verfügbar' : 'Nicht verfügbar'
                    }${isSelected ? ' (ausgewählt)' : ''}`}
                    className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-medium transition-all
                      ${isSelected
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-1'
                        : day.isWeekend
                          ? includeWeekends
                            ? 'bg-gray-200 text-gray-500 hover:bg-gray-300 cursor-pointer'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : day.isAvailable
                            ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                            : 'bg-red-500 text-white cursor-not-allowed'
                      }`}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legende */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500 ring-2 ring-blue-300 ring-offset-1" />
          Ausgewählt
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          Verfügbar
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          Belegt
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-100" />
          Wochenende
        </span>
      </div>
    </div>
  );
};

export default AgencySearch;
