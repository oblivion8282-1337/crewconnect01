import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, MapPin, Globe, Laptop, Star, Heart, Filter,
  ChevronDown, ChevronUp, X, Mail, Phone, ExternalLink,
  Calendar, Users, Euro, Briefcase, Check, CheckSquare, Square
} from 'lucide-react';
import { formatDateShort, getDateRange, parseLocalDate } from '../../utils/dateUtils';
import { PROFESSIONS } from '../../constants/profileOptions';
import DateRangePicker from '../shared/DateRangePicker';
import ResizableModal from '../shared/ResizableModal';

/**
 * FreelancerSearchModal - Umfangreiche Freelancer-Suche als Modal
 */
const FreelancerSearchModal = ({
  project,
  phase,
  freelancers,
  getDayStatus,
  agencyId,
  onBook,
  onClose
}) => {
  // Prüfe ob Phase Datum hat
  const phaseHasDates = phase.startDate && phase.endDate;

  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    profession: '',
    city: '',
    country: '',
    radius: 50,
    remoteOnly: false,
    onlyFullyAvailable: false,
    favoritesOnly: false
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Custom Date Range (wenn Phase kein Datum hat)
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  // DatePicker nur initial anzeigen wenn Phase keine Termine hat UND noch kein custom Datum gewählt wurde
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Booking State
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [bookingType, setBookingType] = useState('option');
  const [includeWeekends, setIncludeWeekends] = useState(false);
  const [lastClickedIndex, setLastClickedIndex] = useState(null);

  // Datumsbereich: entweder aus Phase oder custom
  const effectiveStartDate = phaseHasDates ? phase.startDate : customDateRange.startDate;
  const effectiveEndDate = phaseHasDates ? phase.endDate : customDateRange.endDate;
  const hasValidDateRange = effectiveStartDate && effectiveEndDate;
  const dateRange = hasValidDateRange ? getDateRange(effectiveStartDate, effectiveEndDate) : [];

  // Berechne Verfügbarkeit für einen Freelancer (aus Agentur-Sicht!)
  const calculateAvailability = (freelancerIdParam) => {
    if (!hasValidDateRange) {
      return { days: [], availableDays: 0, totalWorkDays: 0, percentage: 0 };
    }

    const days = [];
    let availableDays = 0;
    let totalWorkDays = 0;

    dateRange.forEach(dateStr => {
      const d = parseLocalDate(dateStr);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!isWeekend) {
        totalWorkDays++;
        // WICHTIG: agencyId übergeben für korrekte Agentur-Sicht!
        // Damit sieht man nur eigene pending/Optionen als belegt,
        // andere Agenturen's pending/Optionen bleiben grün (privat)
        const status = getDayStatus(freelancerIdParam, dateStr, agencyId);
        const isAvailable = !status.isBlocked && !status.hasBooking;
        if (isAvailable) availableDays++;

        days.push({
          date: d,
          dateStr,
          isWeekend,
          isAvailable,
          status
        });
      } else {
        days.push({
          date: d,
          dateStr,
          isWeekend,
          isAvailable: false,
          status: null
        });
      }
    });

    return {
      days,
      availableDays,
      totalWorkDays,
      percentage: totalWorkDays > 0 ? Math.round((availableDays / totalWorkDays) * 100) : 100
    };
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

      // Land Filter
      if (filters.country.trim()) {
        if (!freelancer.address?.country?.toLowerCase().includes(filters.country.toLowerCase())) return false;
      }

      // Remote Filter
      if (filters.remoteOnly && !freelancer.remoteWork) return false;

      // Favoriten Filter
      if (filters.favoritesOnly && !favorites.has(freelancer.id)) return false;

      // 100% Verfügbar Filter
      if (filters.onlyFullyAvailable) {
        const availability = calculateAvailability(freelancer.id);
        if (availability.percentage < 100) return false;
      }

      return true;
    });
  }, [freelancers, filters, favorites, dateRange]);

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

  // Tag anklicken (mit Shift-Support für Mehrfachauswahl)
  const handleDayClick = useCallback((freelancer, dayIndex, day, shiftKey) => {
    const isBookable = day.isAvailable || (includeWeekends && day.isWeekend);
    if (!isBookable) return;

    if (selectedFreelancer?.id !== freelancer.id) {
      // Anderen Freelancer ausgewählt - reset
      setSelectedFreelancer(freelancer);
      setSelectedDays([day.dateStr]);
      setLastClickedIndex(dayIndex);
    } else if (shiftKey && lastClickedIndex !== null) {
      // Shift-Klick: Bereich auswählen
      const availability = calculateAvailability(freelancer.id);
      const start = Math.min(lastClickedIndex, dayIndex);
      const end = Math.max(lastClickedIndex, dayIndex);

      const newDays = new Set(selectedDays);
      for (let i = start; i <= end; i++) {
        const d = availability.days[i];
        if (d && (d.isAvailable || (includeWeekends && d.isWeekend))) {
          newDays.add(d.dateStr);
        }
      }
      setSelectedDays([...newDays].sort());
      setLastClickedIndex(dayIndex);
    } else {
      // Normaler Klick: Toggle
      if (selectedDays.includes(day.dateStr)) {
        setSelectedDays(selectedDays.filter(d => d !== day.dateStr));
      } else {
        setSelectedDays([...selectedDays, day.dateStr].sort());
      }
      setLastClickedIndex(dayIndex);
    }
  }, [selectedFreelancer, selectedDays, lastClickedIndex, includeWeekends, calculateAvailability]);

  // Alle verfügbaren Tage auswählen
  const handleSelectAll = useCallback((freelancer) => {
    const availability = calculateAvailability(freelancer.id);
    const allDays = availability.days
      .filter(d => d.isAvailable || (includeWeekends && d.isWeekend))
      .map(d => d.dateStr);

    setSelectedFreelancer(freelancer);
    setSelectedDays(allDays);
    setLastClickedIndex(null);
  }, [includeWeekends, calculateAvailability]);

  // Alle Tage abwählen
  const handleDeselectAll = useCallback(() => {
    setSelectedDays([]);
    setLastClickedIndex(null);
  }, []);

  // Wochenenden toggle
  const handleToggleWeekends = useCallback((freelancer, include) => {
    setIncludeWeekends(include);

    if (selectedFreelancer?.id === freelancer.id) {
      const availability = calculateAvailability(freelancer.id);

      if (include) {
        // Wochenenden hinzufügen
        const weekendDays = availability.days
          .filter(d => d.isWeekend)
          .map(d => d.dateStr);
        setSelectedDays(prev => [...new Set([...prev, ...weekendDays])].sort());
      } else {
        // Wochenenden entfernen
        const weekendDates = new Set(
          availability.days.filter(d => d.isWeekend).map(d => d.dateStr)
        );
        setSelectedDays(prev => prev.filter(d => !weekendDates.has(d)));
      }
    }
  }, [selectedFreelancer, calculateAvailability]);

  const handleSubmit = (rateInfo) => {
    onBook(selectedFreelancer, selectedDays, bookingType, project, phase, rateInfo);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      name: '',
      profession: '',
      city: '',
      country: '',
      radius: 50,
      remoteOnly: false,
      onlyFullyAvailable: false,
      favoritesOnly: false
    });
  };

  const formatDateDisplay = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    return `${start.getDate()}. ${monthNames[start.getMonth()]} – ${end.getDate()}. ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
  };

  const modalSubtitle = `${project.name} → ${phase.name}${hasValidDateRange ? ` • ${formatDateDisplay(effectiveStartDate, effectiveEndDate)}` : ''}`;

  return (
    <ResizableModal
      title="Freelancer suchen"
      subtitle={modalSubtitle}
      onClose={onClose}
      defaultWidth={1000}
      defaultHeight={700}
      minWidth={600}
      minHeight={400}
    >

        {/* Datumsauswahl wenn Phase kein Datum hat */}
        {!phaseHasDates && (
          <div className="border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full p-3 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {hasValidDateRange
                    ? formatDateDisplay(customDateRange.startDate, customDateRange.endDate)
                    : 'Buchungszeitraum wählen'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>
            {showDatePicker && (
              <div className="px-3 pb-3">
                <DateRangePicker
                  startDate={customDateRange.startDate}
                  endDate={customDateRange.endDate}
                  onChange={({ startDate, endDate }) => {
                    setCustomDateRange({ startDate, endDate });
                    setSelectedDays([]);
                    if (startDate && endDate) {
                      setShowDatePicker(false);
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Filter Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Hauptfilter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  placeholder="Suchen..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Berufsfeld */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Berufsfeld</label>
              <select
                value={filters.profession}
                onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Berufe</option>
                {PROFESSIONS.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>

            {/* Stadt */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stadt</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="z.B. Berlin"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Land */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Land</label>
              <div className="relative">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  placeholder="z.B. Deutschland"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Erweiterte Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Filter className="w-4 h-4" />
              Erweiterte Filter
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{filteredFreelancers.length} Freelancer</span>
              <button
                onClick={handleReset}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>

          {/* Erweiterte Filter */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              {/* Radius */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Radius: {filters.radius} km
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={filters.radius}
                  onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              {/* Remote */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.remoteOnly}
                    onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 rounded-full transition-colors ${
                    filters.remoteOnly ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      filters.remoteOnly ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <span className="text-sm flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <Laptop className="w-4 h-4" />
                  Nur Remote
                </span>
              </label>

              {/* 100% Verfügbar */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.onlyFullyAvailable}
                    onChange={(e) => setFilters({ ...filters, onlyFullyAvailable: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 rounded-full transition-colors ${
                    filters.onlyFullyAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      filters.onlyFullyAvailable ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <span className="text-sm flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4" />
                  100% verfügbar
                </span>
              </label>

              {/* Favoriten */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.favoritesOnly}
                    onChange={(e) => setFilters({ ...filters, favoritesOnly: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-9 h-5 rounded-full transition-colors ${
                    filters.favoritesOnly ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      filters.favoritesOnly ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <span className="text-sm flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <Heart className="w-4 h-4" />
                  Favoriten
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Freelancer-Liste */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasValidDateRange ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-blue-300 dark:text-blue-700 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Bitte wähle zuerst einen Zeitraum</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Wähle oben Start- und Enddatum für die Buchung</p>
            </div>
          ) : filteredFreelancers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Keine Freelancer gefunden</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Passe die Filterkriterien an</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFreelancers.map(freelancer => (
                <FreelancerResultCard
                  key={freelancer.id}
                  freelancer={freelancer}
                  dateRange={dateRange}
                  selectedDays={selectedDays}
                  selectedFreelancer={selectedFreelancer}
                  bookingType={bookingType}
                  includeWeekends={includeWeekends}
                  getDayStatus={getDayStatus}
                  isFavorite={favorites.has(freelancer.id)}
                  onToggleFavorite={() => toggleFavorite(freelancer.id)}
                  onDayClick={handleDayClick}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onToggleWeekends={handleToggleWeekends}
                  onTypeChange={setBookingType}
                  onSubmit={handleSubmit}
                  calculateAvailability={calculateAvailability}
                />
              ))}
            </div>
          )}
        </div>
    </ResizableModal>
  );
};

/**
 * Freelancer-Ergebnis-Karte mit Verfügbarkeit und Buchung
 */
const FreelancerResultCard = ({
  freelancer,
  dateRange,
  selectedDays,
  selectedFreelancer,
  bookingType,
  includeWeekends,
  getDayStatus,
  isFavorite,
  onToggleFavorite,
  onDayClick,
  onSelectAll,
  onDeselectAll,
  onToggleWeekends,
  onTypeChange,
  onSubmit,
  calculateAvailability
}) => {
  const [expanded, setExpanded] = useState(false);
  const [rateType, setRateType] = useState('daily'); // 'daily' oder 'flat'
  const [customDayRate, setCustomDayRate] = useState(freelancer.dayRate || 0);
  const [flatRate, setFlatRate] = useState(0);

  const isSelected = selectedFreelancer?.id === freelancer.id;
  const showBookingOptions = selectedDays.length > 0 && isSelected;
  const visibility = freelancer.visibility || {};

  // Berechne Gesamtkosten
  const totalCost = rateType === 'daily'
    ? customDayRate * selectedDays.length
    : flatRate;

  const availability = calculateAvailability(freelancer.id);
  const fullName = `${freelancer.firstName} ${freelancer.lastName}`;

  // Füge Index zu jedem Tag hinzu (für Shift-Klick)
  const daysWithIndex = availability.days.map((day, index) => ({ ...day, index }));

  const getPercentageColor = (pct) => {
    if (pct >= 80) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (pct >= 50) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  // Gruppiere Tage nach Monat für Übersicht (mit Index)
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

  // Zähle ausgewählte Tage für diesen Freelancer
  const selectedCount = isSelected ? selectedDays.length : 0;

  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-colors ${
      isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="text-4xl">{freelancer.avatar}</div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{fullName}</h3>
                  {freelancer.verified && (
                    <span className="text-blue-500" title="Verifiziert">✓</span>
                  )}
                  <button
                    onClick={onToggleFavorite}
                    className={`p-1 rounded transition-colors ${
                      isFavorite ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{(freelancer.professions || []).join(', ')}</p>
              </div>

              {/* Rating & Tagessatz */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{freelancer.rating}</span>
                </div>
                {visibility.dayRate !== false && freelancer.dayRate && (
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{freelancer.dayRate}€/Tag</p>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {visibility.address !== false && freelancer.address?.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {freelancer.address.city}
                </span>
              )}
              {freelancer.remoteWork && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Laptop className="w-3.5 h-3.5" />
                  Remote
                </span>
              )}
              {freelancer.experience && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {freelancer.experience}J
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Verfügbarkeits-Summary */}
        <div className="mt-3 flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPercentageColor(availability.percentage)}`}>
            {availability.percentage}% verfügbar
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {availability.availableDays} von {availability.totalWorkDays} Arbeitstagen
          </span>
        </div>
      </div>

      {/* Verfügbarkeits-Grid */}
      <div className="px-4 pb-3">
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {/* Selektion Controls */}
          <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
            {/* Alle auswählen / Alle abwählen */}
            <div className="flex gap-2">
              <button
                onClick={() => onSelectAll(freelancer)}
                className="px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Alle auswählen
              </button>
              <button
                onClick={onDeselectAll}
                disabled={selectedCount === 0}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square className="w-3.5 h-3.5" />
                Alle abwählen
              </button>
            </div>

            {/* Wochenenden Switch */}
            <label className="flex items-center gap-2 cursor-pointer ml-auto">
              <span className="text-xs text-gray-600 dark:text-gray-400">Wochenenden</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={includeWeekends}
                  onChange={(e) => onToggleWeekends(freelancer, e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-9 h-5 rounded-full transition-colors ${
                  includeWeekends ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    includeWeekends ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </label>

            {/* Selektions-Info */}
            {selectedCount > 0 && (
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                {selectedCount} Tag{selectedCount !== 1 ? 'e' : ''} ausgewählt
              </span>
            )}
          </div>

          {/* Shift-Klick Hinweis */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            Shift + Klick für Mehrfachauswahl
          </p>

          {/* Tage-Grid */}
          <div className="flex flex-wrap gap-4">
            {Object.values(monthGroups).map(group => (
              <div key={`${group.year}-${group.month}`} className="flex-shrink-0">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {monthNames[group.month]} {group.year}
                </div>
                <div className="flex flex-wrap gap-0.5" style={{ maxWidth: '160px' }}>
                  {group.days.map(day => {
                    const isSelectedDay = selectedDays.includes(day.dateStr) && isSelected;
                    const statusColor = day.status?.color;
                    const isYellow = statusColor === 'yellow'; // Meine pending/Option
                    const isRed = statusColor === 'red'; // Fix-Buchung oder geblockt
                    const isBookable = day.isAvailable || (includeWeekends && day.isWeekend);

                    // Tooltip-Text basierend auf Status
                    const getTooltip = () => {
                      if (day.isWeekend) return 'Wochenende';
                      if (isYellow) {
                        const booking = day.status?.booking;
                        if (day.status?.status === 'pending') return `Meine Anfrage (pending)`;
                        return `Meine Option`;
                      }
                      if (isRed) return 'Fix gebucht / Belegt';
                      if (day.isAvailable) return 'Verfügbar';
                      return 'Nicht verfügbar';
                    };

                    return (
                      <button
                        key={day.dateStr}
                        onClick={(e) => onDayClick(freelancer, day.index, day, e.shiftKey)}
                        disabled={!isBookable}
                        title={`${day.date.getDate()}. ${monthNames[day.date.getMonth()]} - ${getTooltip()}${isSelectedDay ? ' (ausgewählt)' : ''}`}
                        className={`w-5 h-5 rounded text-[9px] flex items-center justify-center font-medium transition-all ${
                          isSelectedDay
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1'
                            : day.isWeekend
                              ? includeWeekends
                                ? 'bg-gray-300 text-gray-600 hover:bg-gray-400 cursor-pointer'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : isYellow
                                ? 'bg-yellow-400 text-yellow-900 cursor-not-allowed'
                                : isRed
                                  ? 'bg-red-500 text-white cursor-not-allowed'
                                  : day.isAvailable
                                    ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                                    : 'bg-red-400 text-white cursor-not-allowed'
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
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-600 ring-2 ring-blue-300 ring-offset-1" /> Ausgewählt
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" /> Verfügbar
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-400" /> Meine Anfrage/Option
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" /> Fix gebucht
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-600" /> Wochenende
            </span>
          </div>
        </div>
      </div>

      {/* Mehr anzeigen */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1"
      >
        {expanded ? 'Weniger' : 'Mehr Infos'}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Erweiterte Infos */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-3">
          {visibility.bio !== false && freelancer.bio && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Über mich</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{freelancer.bio}</p>
            </div>
          )}

          {freelancer.skills?.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {freelancer.skills.map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {visibility.equipment !== false && freelancer.equipment?.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Equipment</h4>
              <div className="flex flex-wrap gap-1">
                {freelancer.equipment.map(item => (
                  <span key={item} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {freelancer.languages?.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sprachen</h4>
              <div className="flex flex-wrap gap-1">
                {freelancer.languages.map(lang => (
                  <span key={lang} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Kontakt */}
          <div className="flex flex-wrap gap-3 pt-2">
            {visibility.email !== false && freelancer.email && (
              <a href={`mailto:${freelancer.email}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {freelancer.email}
              </a>
            )}
            {visibility.phone !== false && freelancer.phone && (
              <a href={`tel:${freelancer.phone}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {freelancer.phone}
              </a>
            )}
            {visibility.website !== false && freelancer.website && (
              <a href={freelancer.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" />
                Website
              </a>
            )}
          </div>
        </div>
      )}

      {/* Buchungsoptionen */}
      {showBookingOptions && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 space-y-3">
          {/* Erste Zeile: Buchungstyp und Gage */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Buchungstyp: Option/Fix */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Buchungstyp</label>
              <div className="flex gap-1">
                <button
                  onClick={() => onTypeChange('option')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    bookingType === 'option'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Option
                </button>
                <button
                  onClick={() => onTypeChange('fix')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    bookingType === 'fix'
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Fix
                </button>
              </div>
            </div>

            {/* Gagentyp: Tagesgage/Pauschal */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Gagentyp</label>
              <div className="flex gap-1">
                <button
                  onClick={() => setRateType('daily')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    rateType === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Tagesgage
                </button>
                <button
                  onClick={() => setRateType('flat')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    rateType === 'flat'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Pauschal
                </button>
              </div>
            </div>

            {/* Gagen-Eingabe */}
            <div className="flex-1 min-w-[150px]">
              {rateType === 'daily' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Tagesgage (€)
                  </label>
                  <input
                    type="number"
                    value={customDayRate}
                    onChange={(e) => setCustomDayRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    min="0"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Pauschalgage (€)
                  </label>
                  <input
                    type="number"
                    value={flatRate}
                    onChange={(e) => setFlatRate(Number(e.target.value))}
                    placeholder="Pauschalbetrag eingeben"
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    min="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Zweite Zeile: Zusammenfassung und Button */}
          <div className="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
            <div className="text-sm text-gray-900 dark:text-white">
              <span className="font-medium">{selectedDays.length} Tage</span>
              {rateType === 'daily' && (
                <span className="text-gray-500 dark:text-gray-400 ml-2">× {customDayRate}€/Tag</span>
              )}
              <span className="text-gray-500 dark:text-gray-400 mx-2">=</span>
              <span className="font-bold text-blue-700 dark:text-blue-400 text-lg">{totalCost.toLocaleString('de-DE')}€</span>
              {rateType === 'flat' && (
                <span className="text-gray-500 dark:text-gray-400 ml-1 text-xs">(pauschal)</span>
              )}
            </div>

            <button
              onClick={() => onSubmit({ rateType, dayRate: customDayRate, flatRate, totalCost })}
              disabled={totalCost <= 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingType === 'option' ? 'Option anfragen' : 'Fix buchen'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerSearchModal;
