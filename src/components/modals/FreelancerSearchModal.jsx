import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Search, MapPin, Globe, Laptop, Star, Heart,
  ChevronDown, ChevronUp, X, Mail, Phone, ExternalLink,
  Calendar, Users, Euro, Briefcase, Check, CheckSquare, Square
} from 'lucide-react';

/**
 * Durchsuchbares Single-Select Dropdown
 */
const SearchableSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter(opt =>
      opt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="min-h-[38px] px-3 py-2 flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <span className={`text-sm ${value ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button
              onClick={handleClear}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          {/* Suchfeld */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Suchen..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* Optionen */}
          <div className="max-h-48 overflow-y-auto">
            <button
              onClick={() => handleSelect('')}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                !value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Alle
            </button>
            {filteredOptions.map(option => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  option === value
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {option}
              </button>
            ))}
            {filteredOptions.length === 0 && searchTerm && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Keine Ergebnisse für "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Durchsuchbares Multi-Select Dropdown (Design wie SearchableSelect)
 */
const MultiSearchableSelect = ({ values = [], onChange, options, placeholder, tagColorClass }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term (exclude already selected)
  const filteredOptions = useMemo(() => {
    let filtered = options.filter(opt => !values.includes(opt));
    if (searchTerm.trim()) {
      filtered = filtered.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [options, searchTerm, values]);

  const handleSelect = (option) => {
    onChange([...values, option]);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleRemove = (option, e) => {
    e?.stopPropagation();
    onChange(values.filter(v => v !== option));
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      // Add custom search term if not in options
      if (!values.includes(searchTerm.trim())) {
        onChange([...values, searchTerm.trim()]);
        setSearchTerm('');
      }
    } else if (e.key === 'Backspace' && !searchTerm && values.length > 0) {
      // Remove last tag on backspace when input is empty
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Hauptfeld - klickbar zum Öffnen */}
      <div
        className="min-h-[38px] px-3 py-2 flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <div className="flex-1 min-w-0 flex flex-wrap gap-1 items-center">
          {values.length === 0 ? (
            <span className="text-sm text-gray-400 dark:text-gray-500">{placeholder}</span>
          ) : (
            values.map(val => (
              <span
                key={val}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${tagColorClass}`}
              >
                {val}
                <button
                  onClick={(e) => handleRemove(val, e)}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {values.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          {/* Suchfeld */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Suchen..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* Optionen */}
          <div className="max-h-48 overflow-y-auto">
            {searchTerm.trim() && !options.includes(searchTerm.trim()) && !values.includes(searchTerm.trim()) && (
              <button
                onClick={() => {
                  onChange([...values, searchTerm.trim()]);
                  setSearchTerm('');
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 border-b border-gray-100 dark:border-gray-700"
              >
                "{searchTerm}" hinzufügen
              </button>
            )}
            {filteredOptions.length === 0 && !searchTerm.trim() && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Alle Optionen ausgewählt
              </div>
            )}
            {filteredOptions.length === 0 && searchTerm.trim() && options.some(o => o.toLowerCase().includes(searchTerm.toLowerCase())) && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Keine weiteren Ergebnisse
              </div>
            )}
            {filteredOptions.map(option => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
import { formatDateShort, getDateRange, parseLocalDate } from '../../utils/dateUtils';
import { PROFESSIONS, SKILLS, EQUIPMENT } from '../../constants/profileOptions';
import DateRangePicker from '../shared/DateRangePicker';
import ResizableModal from '../shared/ResizableModal';
import FavoriteButton from '../shared/FavoriteButton';
import BookingConfirmationModal from './BookingConfirmationModal';

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
  onClose,
  // Favoriten & Crew-Listen Props
  isFavorite,
  onToggleFavorite,
  crewLists = [],
  getListsForFreelancer,
  onAddToList,
  onRemoveFromList,
  onOpenAddToListModal
}) => {
  // Prüfe ob Phase Datum hat
  const phaseHasDates = phase.startDate && phase.endDate;

  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    profession: '',
    skills: [],
    equipment: [],
    city: '',
    country: '',
    radius: 50,
    remoteOnly: false,
    onlyFullyAvailable: false,
    favoritesOnly: false
  });

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

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState(null);

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

      // Skills Filter (mehrere Skills, alle müssen matchen)
      if (filters.skills.length > 0) {
        const freelancerSkills = freelancer.skills || [];
        const allSkillsMatch = filters.skills.every(filterSkill => {
          const searchTerm = filterSkill.toLowerCase();
          return freelancerSkills.some(skill =>
            skill.toLowerCase().includes(searchTerm)
          );
        });
        if (!allSkillsMatch) return false;
      }

      // Equipment Filter (mehrere Equipment-Items, alle müssen matchen)
      if (filters.equipment.length > 0) {
        const freelancerEquipment = freelancer.equipment || [];
        const allEquipmentMatch = filters.equipment.every(filterEquip => {
          const searchTerm = filterEquip.toLowerCase();
          return freelancerEquipment.some(item =>
            item.toLowerCase().includes(searchTerm)
          );
        });
        if (!allEquipmentMatch) return false;
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
      if (filters.favoritesOnly && !isFavorite?.(freelancer.id)) return false;

      // 100% Verfügbar Filter
      if (filters.onlyFullyAvailable) {
        const availability = calculateAvailability(freelancer.id);
        if (availability.percentage < 100) return false;
      }

      return true;
    });
  }, [freelancers, filters, isFavorite, dateRange]);

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

  // Öffnet das Bestätigungs-Modal
  const handleOpenConfirmation = (rateInfo) => {
    setConfirmationModal({
      freelancer: selectedFreelancer,
      selectedDays,
      bookingType,
      project,
      phase,
      rateInfo
    });
  };

  // Bestätigt die Buchung und schließt alles
  const handleConfirmBooking = (rateInfoWithMessage) => {
    onBook(selectedFreelancer, selectedDays, bookingType, project, phase, rateInfoWithMessage);
    setConfirmationModal(null);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      name: '',
      profession: '',
      skills: [],
      equipment: [],
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

  // Custom Header mit prominenter Projekt/Phase/Zeitraum Anzeige (einzeilig, zentriert)
  const customSubtitle = (
    <div className="flex items-center gap-2">
      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded font-medium text-sm">
        {project.name}
      </span>
      <span className="text-gray-400 dark:text-gray-500">→</span>
      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded font-medium text-sm">
        {phase.name}
      </span>
      {hasValidDateRange && (
        <>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded font-medium text-sm">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateDisplay(effectiveStartDate, effectiveEndDate)}
          </span>
        </>
      )}
    </div>
  );

  // Modal soll 80% der Breite und 90% der Höhe des Browserfensters ausfüllen
  const modalWidth = Math.round(window.innerWidth * 0.8);
  const modalHeight = Math.round(window.innerHeight * 0.9);

  return (
    <ResizableModal
      title="Freelancer suchen"
      subtitle={customSubtitle}
      onClose={onClose}
      defaultWidth={modalWidth}
      defaultHeight={modalHeight}
      minWidth={950}
      minHeight={500}
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
          {/* Hauptfilter - Erste Zeile */}
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
              <SearchableSelect
                value={filters.profession}
                onChange={(val) => setFilters({ ...filters, profession: val })}
                options={PROFESSIONS}
                placeholder="Alle Berufe"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Skills</label>
              <MultiSearchableSelect
                values={filters.skills}
                onChange={(vals) => setFilters({ ...filters, skills: vals })}
                options={SKILLS}
                placeholder="Skills suchen..."
                tagColorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              />
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Equipment</label>
              <MultiSearchableSelect
                values={filters.equipment}
                onChange={(vals) => setFilters({ ...filters, equipment: vals })}
                options={EQUIPMENT}
                placeholder="Equipment suchen..."
                tagColorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
              />
            </div>
          </div>

          {/* Zweite Zeile: Stadt, Land & Toggle-Filter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 items-end">
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
                  placeholder="z.B. DE"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Radius: {filters.radius}km
              </label>
              <div className="h-[38px] flex items-center">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={filters.radius}
                  onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                  className="w-full accent-primary h-2 cursor-pointer"
                />
              </div>
            </div>

            {/* Toggle-Filter - gleiches Styling wie Input-Felder */}
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Filter</label>
              <div className="min-h-[38px] px-2 flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                {/* Remote */}
                <label className="flex items-center gap-1 cursor-pointer" title="Nur Remote-Freelancer anzeigen">
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
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">Remote</span>
                </label>

                {/* 100% Verfügbar */}
                <label className="flex items-center gap-1 cursor-pointer" title="Nur 100% verfügbare Freelancer anzeigen">
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
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">100%</span>
                </label>

                {/* Favoriten */}
                <label className="flex items-center gap-1 cursor-pointer" title="Nur Favoriten anzeigen">
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
                  <Heart className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                </label>
              </div>
            </div>
          </div>

          {/* Dritte Zeile: Info + Reset */}
          <div className="flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{filteredFreelancers.length} Freelancer</span>
            <button
              onClick={handleReset}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset
            </button>
          </div>
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
                  isFavorite={isFavorite?.(freelancer.id)}
                  onToggleFavorite={onToggleFavorite}
                  crewLists={crewLists}
                  getListsForFreelancer={getListsForFreelancer}
                  onAddToList={onAddToList}
                  onRemoveFromList={onRemoveFromList}
                  onOpenAddToListModal={onOpenAddToListModal}
                  onDayClick={handleDayClick}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onToggleWeekends={handleToggleWeekends}
                  onTypeChange={setBookingType}
                  onSubmit={handleOpenConfirmation}
                  calculateAvailability={calculateAvailability}
                />
              ))}
            </div>
          )}
        </div>

      {/* Confirmation Modal */}
      {confirmationModal && (
        <BookingConfirmationModal
          freelancer={confirmationModal.freelancer}
          selectedDays={confirmationModal.selectedDays}
          bookingType={confirmationModal.bookingType}
          project={confirmationModal.project}
          phase={confirmationModal.phase}
          rateInfo={confirmationModal.rateInfo}
          onConfirm={handleConfirmBooking}
          onCancel={() => setConfirmationModal(null)}
        />
      )}
    </ResizableModal>
  );
};

/**
 * Freelancer-Ergebnis-Karte mit Verfügbarkeit und Buchung
 */
/**
 * "...mehr" Button mit Popover für überlaufende Items
 */
const OverflowInfo = ({ items, label, colorClass }) => {
  const [showPopover, setShowPopover] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        className={`px-1.5 py-0.5 rounded ${colorClass} text-[10px] font-medium cursor-help leading-none`}
      >
        ...mehr
      </button>
      {showPopover && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg shadow-xl p-2.5 min-w-[160px] max-w-[280px]">
          <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</div>
          <div className="flex flex-wrap gap-1">
            {items.map(item => (
              <span key={item} className={`px-1.5 py-0.5 rounded text-[10px] ${colorClass}`}>
                {item}
              </span>
            ))}
          </div>
          {/* Pfeil nach oben */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white dark:border-b-gray-800" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-transparent border-b-gray-200 dark:border-b-gray-600 -mb-px" />
        </div>
      )}
    </span>
  );
};

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
  crewLists,
  getListsForFreelancer,
  onAddToList,
  onRemoveFromList,
  onOpenAddToListModal,
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
  const [skillsContainerRef, setSkillsContainerRef] = useState(null);
  const [visibleSkills, setVisibleSkills] = useState(6);
  const [visibleEquipment, setVisibleEquipment] = useState(4);

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

  // Skills und Equipment mit Overflow-Handling
  const allSkills = freelancer.skills || [];
  const allEquipment = (visibility.equipment !== false ? freelancer.equipment : null) || [];
  const displayedSkills = allSkills.slice(0, visibleSkills);
  const hiddenSkills = allSkills.slice(visibleSkills);
  const displayedEquipment = allEquipment.slice(0, visibleEquipment);
  const hiddenEquipment = allEquipment.slice(visibleEquipment);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border transition-all ${
      isSelected ? 'border-blue-500 shadow-lg ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      {/* Kompakter Header */}
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="text-3xl flex-shrink-0">{freelancer.avatar}</div>

          {/* Haupt-Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white">{fullName}</h3>
              {freelancer.verified && <span className="text-blue-500 text-sm">✓</span>}
              <FavoriteButton
                freelancerId={freelancer.id}
                isFavorite={isFavorite}
                onToggle={onToggleFavorite}
                crewLists={crewLists}
                getListsForFreelancer={getListsForFreelancer}
                onAddToList={onAddToList}
                onRemoveFromList={onRemoveFromList}
                onOpenAddToListModal={onOpenAddToListModal}
                size="sm"
              />
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPercentageColor(availability.percentage)}`}>
                {availability.percentage}%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{(freelancer.professions || []).join(', ')}</p>

            {/* Meta-Info Zeile */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
              {visibility.dayRate !== false && freelancer.dayRate && (
                <span className="font-semibold text-gray-700 dark:text-gray-300">{freelancer.dayRate}€/Tag</span>
              )}
              <span className="flex items-center gap-0.5 text-yellow-500">
                <Star className="w-3 h-3 fill-current" />{freelancer.rating}
              </span>
              {visibility.address !== false && freelancer.address?.city && (
                <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{freelancer.address.city}</span>
              )}
              {freelancer.remoteWork && (
                <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400"><Laptop className="w-3 h-3" />Remote</span>
              )}
              {freelancer.experience && (
                <span>{freelancer.experience}J Erfahrung</span>
              )}
            </div>

            {/* Skills & Equipment - so viele wie möglich + Info-Icon für Rest */}
            {(allSkills.length > 0 || allEquipment.length > 0) && (
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {displayedSkills.map(skill => (
                  <span key={skill} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[10px]">
                    {skill}
                  </span>
                ))}
                {hiddenSkills.length > 0 && (
                  <OverflowInfo
                    items={hiddenSkills}
                    label={`+${hiddenSkills.length} weitere Skills`}
                    colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  />
                )}
                {displayedEquipment.map(item => (
                  <span key={item} className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-[10px]">
                    {item}
                  </span>
                ))}
                {hiddenEquipment.length > 0 && (
                  <OverflowInfo
                    items={hiddenEquipment}
                    label={`+${hiddenEquipment.length} weiteres Equipment`}
                    colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                  />
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Kalender-Grid - größer */}
      <div className="px-3 pb-3">
        <div className="flex items-start gap-4">
          {/* Controls links */}
          <div className="flex flex-col gap-1.5 flex-shrink-0 pt-4">
            <button
              onClick={() => onSelectAll(freelancer)}
              className="px-2.5 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 whitespace-nowrap"
            >
              Alle auswählen
            </button>
            <button
              onClick={onDeselectAll}
              disabled={selectedCount === 0}
              className="px-2.5 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 whitespace-nowrap"
            >
              Keine auswählen
            </button>
            <label className="flex items-center gap-2 cursor-pointer px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <input
                type="checkbox"
                checked={includeWeekends}
                onChange={(e) => onToggleWeekends(freelancer, e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Wochenenden</span>
            </label>
          </div>

          {/* Tage-Grid - größer */}
          <div className="flex flex-wrap gap-4 flex-1">
            {Object.values(monthGroups).map(group => (
              <div key={`${group.year}-${group.month}`} className="flex-shrink-0">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {monthNames[group.month]}
                </div>
                <div className="flex flex-wrap gap-0.5" style={{ maxWidth: '238px' }}>
                  {group.days.map(day => {
                    const isSelectedDay = selectedDays.includes(day.dateStr) && isSelected;
                    const statusColor = day.status?.color;
                    const isYellow = statusColor === 'yellow';
                    const isRed = statusColor === 'red';
                    const isBookable = day.isAvailable || (includeWeekends && day.isWeekend);

                    return (
                      <button
                        key={day.dateStr}
                        onClick={(e) => onDayClick(freelancer, day.index, day, e.shiftKey)}
                        disabled={!isBookable}
                        title={`${day.date.getDate()}. ${monthNames[day.date.getMonth()]} (Shift+Klick für Mehrfachauswahl)`}
                        className={`w-8 h-5 rounded text-[10px] flex items-center justify-center font-medium transition-all ${
                          isSelectedDay
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                            : day.isWeekend
                              ? includeWeekends
                                ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-400 cursor-pointer'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
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
        </div>

        {/* Selection Info + Expand Button */}
        <div className="flex items-center justify-between mt-2">
          {selectedCount > 0 ? (
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {selectedCount} Tag{selectedCount !== 1 ? 'e' : ''} ausgewählt
            </div>
          ) : (
            <div />
          )}

          {/* Aufklapp-Button für Profildetails */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <span>{expanded ? 'Weniger anzeigen' : 'Mehr Details'}</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Erweiterte Infos - ohne Skills/Equipment Tags */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-gray-700 space-y-2">
          {visibility.bio !== false && freelancer.bio && (
            <p className="text-xs text-gray-600 dark:text-gray-400">{freelancer.bio}</p>
          )}
          {/* Sprachen */}
          {freelancer.languages?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Sprachen:</span>
              {freelancer.languages.map(lang => (
                <span key={lang} className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px]">{lang}</span>
              ))}
            </div>
          )}
          {/* Kontakt */}
          <div className="flex flex-wrap gap-3 text-xs">
            {visibility.email !== false && freelancer.email && (
              <a href={`mailto:${freelancer.email}`} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <Mail className="w-3 h-3" />{freelancer.email}
              </a>
            )}
            {visibility.phone !== false && freelancer.phone && (
              <a href={`tel:${freelancer.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <Phone className="w-3 h-3" />{freelancer.phone}
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
