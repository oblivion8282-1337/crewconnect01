import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { useLocationIQ } from '../../hooks/useLocationIQ';

/**
 * AddressAutocomplete - Adressfeld mit Autocomplete-Funktion
 *
 * @param {Object} props
 * @param {string} props.value - Aktueller Wert (Adress-String)
 * @param {Function} props.onChange - Callback bei Textänderung
 * @param {Function} props.onSelect - Callback bei Auswahl einer Adresse (liefert vollständige Adressdaten inkl. Koordinaten)
 * @param {string} props.placeholder - Placeholder-Text
 * @param {string} props.label - Label für das Feld
 * @param {boolean} props.disabled - Deaktiviert
 */
const AddressAutocomplete = ({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Adresse eingeben...',
  label,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const {
    suggestions,
    isLoading,
    searchAddress,
    clearSuggestions,
    isConfigured
  } = useLocationIQ();

  // Sync input value with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Debounced search
   */
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce API call
    debounceRef.current = setTimeout(() => {
      if (newValue.length >= 3) {
        searchAddress(newValue);
        setShowSuggestions(true);
      } else {
        clearSuggestions();
        setShowSuggestions(false);
      }
    }, 300);
  };

  /**
   * Handle suggestion selection
   */
  const handleSelect = (suggestion) => {
    setInputValue(suggestion.displayName);
    onChange?.(suggestion.displayName);
    onSelect?.(suggestion);
    setShowSuggestions(false);
    clearSuggestions();
  };

  /**
   * Keyboard navigation
   */
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  /**
   * Clear input
   */
  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    onSelect?.(null);
    clearSuggestions();
    inputRef.current?.focus();
  };

  if (!isConfigured) {
    // Fallback wenn API Key fehlt
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {label}
          </label>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-amber-600 mt-1">
          Adress-Autocomplete nicht verfügbar (API Key fehlt)
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}

        {!isLoading && inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-start gap-3 ${
                index === highlightedIndex ? 'bg-blue-50' : ''
              } ${index !== suggestions.length - 1 ? 'border-b' : ''}`}
            >
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">
                  {suggestion.address.street} {suggestion.address.houseNumber}
                </p>
                <p className="text-gray-500 text-xs">
                  {suggestion.address.postalCode} {suggestion.address.city}
                  {suggestion.address.state && `, ${suggestion.address.state}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
