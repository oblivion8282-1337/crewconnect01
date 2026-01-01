import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Building2, Star, Clock, ChevronDown, X, Plus } from 'lucide-react';
import { ClientLogo } from './ClientCard';
import { getIndustryLabel } from '../../../constants/clients';

/**
 * ClientSelector - Dropdown/Modal zur Kundenauswahl
 */
const ClientSelector = ({
  clients,
  selectedClientId,
  onSelect,
  onCreateNew,
  placeholder = 'Kunde auswählen...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Position des Dropdowns berechnen
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 400; // Geschätzte max Höhe

      // Prüfe ob genug Platz unten ist, sonst nach oben öffnen
      const openUpward = spaceBelow < dropdownHeight && rect.top > spaceBelow;

      setDropdownPosition({
        top: openUpward ? rect.top - dropdownHeight : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        openUpward
      });
    }
  }, [isOpen]);

  // Schließen bei Klick außerhalb oder Scroll
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (event) => {
      // Nur schließen wenn außerhalb des Dropdowns gescrollt wird
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  // Fokus auf Suchfeld wenn geöffnet
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Ausgewählter Kunde
  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  // Gefilterte und gruppierte Clients
  const groupedClients = useMemo(() => {
    let filtered = clients.filter(c => c.status !== 'archived');

    // Suche anwenden
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.companyName.toLowerCase().includes(query) ||
        c.contacts?.some(contact =>
          contact.firstName?.toLowerCase().includes(query) ||
          contact.lastName?.toLowerCase().includes(query)
        )
      );
    }

    // Gruppieren
    const favorites = filtered.filter(c => c.isFavorite);
    const recent = filtered
      .filter(c => !c.isFavorite)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
    const recentIds = new Set(recent.map(c => c.id));
    const favoriteIds = new Set(favorites.map(c => c.id));
    const others = filtered
      .filter(c => !favoriteIds.has(c.id) && !recentIds.has(c.id))
      .sort((a, b) => a.companyName.localeCompare(b.companyName));

    return { favorites, recent, others };
  }, [clients, searchQuery]);

  const handleSelect = (clientId) => {
    onSelect(clientId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
  };

  const ClientOption = ({ client }) => (
    <button
      onClick={() => handleSelect(client.id)}
      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
        selectedClientId === client.id
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <ClientLogo logo={client.logo} companyName={client.companyName} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {client.companyName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {getIndustryLabel(client.industry)}
        </p>
      </div>
      {client.isFavorite && (
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
      )}
    </button>
  );

  const SectionHeader = ({ icon: Icon, children }) => (
    <div className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      <Icon className="w-3.5 h-3.5" />
      {children}
    </div>
  );

  const hasResults = groupedClients.favorites.length > 0 ||
    groupedClients.recent.length > 0 ||
    groupedClients.others.length > 0;

  const handleTriggerClick = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center gap-3 p-2.5 border rounded-lg text-left transition-colors cursor-pointer ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
            : isOpen
              ? 'border-primary ring-2 ring-primary/50 bg-white dark:bg-gray-900'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        {selectedClient ? (
          <>
            <ClientLogo logo={selectedClient.logo} companyName={selectedClient.companyName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {selectedClient.companyName}
              </p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <span className="flex-1 text-gray-500 dark:text-gray-400">
              {placeholder}
            </span>
          </>
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown - Fixed positioning to prevent overflow issues in modals */}
      {isOpen && (
        <div
          className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: 400
          }}
        >
          {/* Suchfeld */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kunde suchen..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-72 overflow-y-auto p-2">
            {hasResults ? (
              <>
                {/* Favoriten */}
                {groupedClients.favorites.length > 0 && (
                  <div className="mb-2">
                    <SectionHeader icon={Star}>Favoriten</SectionHeader>
                    {groupedClients.favorites.map(client => (
                      <ClientOption key={client.id} client={client} />
                    ))}
                  </div>
                )}

                {/* Zuletzt verwendet */}
                {groupedClients.recent.length > 0 && (
                  <div className="mb-2">
                    <SectionHeader icon={Clock}>Zuletzt verwendet</SectionHeader>
                    {groupedClients.recent.map(client => (
                      <ClientOption key={client.id} client={client} />
                    ))}
                  </div>
                )}

                {/* Alle anderen */}
                {groupedClients.others.length > 0 && (
                  <div>
                    <SectionHeader icon={Building2}>Alle Kunden</SectionHeader>
                    {groupedClients.others.map(client => (
                      <ClientOption key={client.id} client={client} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="py-6 text-center">
                <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'Keine Kunden gefunden' : 'Keine Kunden vorhanden'}
                </p>
              </div>
            )}
          </div>

          {/* Neuen Kunden erstellen */}
          {onCreateNew && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onCreateNew();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-primary hover:bg-primary/5 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Neuen Kunden anlegen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSelector;
