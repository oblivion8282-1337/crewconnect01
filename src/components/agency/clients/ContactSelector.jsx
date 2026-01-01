import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Star, Plus } from 'lucide-react';

/**
 * ContactSelector - Dropdown zur Ansprechpartner-Auswahl
 */
const ContactSelector = ({
  contacts = [],
  selectedContactId,
  onSelect,
  onAddNew,
  placeholder = 'Ansprechpartner auswählen...',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Schließen bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Ausgewählter Kontakt
  const selectedContact = contacts.find(c => c.id === selectedContactId);

  // Kontakte sortiert (Hauptkontakt zuerst)
  const sortedContacts = [...contacts].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
  });

  const handleSelect = (contactId) => {
    onSelect(contactId);
    setIsOpen(false);
  };

  const getInitials = (contact) => {
    return `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase() || '??';
  };

  const getFullName = (contact) => {
    return `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unbekannt';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center gap-3 p-2.5 border rounded-lg text-left transition-colors ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
            : isOpen
              ? 'border-primary ring-2 ring-primary/50 bg-white dark:bg-gray-900'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        {selectedContact ? (
          <>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {getInitials(selectedContact)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {getFullName(selectedContact)}
              </p>
              {selectedContact.position && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {selectedContact.position}
                </p>
              )}
            </div>
            {selectedContact.isPrimary && (
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <span className="flex-1 text-gray-500 dark:text-gray-400">
              {placeholder}
            </span>
          </>
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Liste */}
          <div className="max-h-60 overflow-y-auto p-2">
            {sortedContacts.length > 0 ? (
              sortedContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => handleSelect(contact.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                    selectedContactId === contact.id
                      ? 'bg-primary/10'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {/* Radio Button */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedContactId === contact.id
                      ? 'border-primary'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedContactId === contact.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {getInitials(contact)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium truncate ${
                        selectedContactId === contact.id
                          ? 'text-primary'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {getFullName(contact)}
                      </p>
                      {contact.isPrimary && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                          Hauptkontakt
                        </span>
                      )}
                    </div>
                    {(contact.position || contact.email) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {contact.position || contact.email}
                      </p>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="py-6 text-center">
                <User className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Keine Ansprechpartner vorhanden
                </p>
              </div>
            )}
          </div>

          {/* Neuen Kontakt hinzufügen */}
          {onAddNew && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onAddNew();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-primary hover:bg-primary/5 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Neuen Ansprechpartner hinzufügen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactSelector;
