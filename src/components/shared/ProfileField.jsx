import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronDown, Search } from 'lucide-react';

/**
 * ProfileField - Wiederverwendbare Komponente für Profilfelder
 */

/**
 * Einfaches Textfeld
 */
export const TextField = ({
  label,
  value,
  onChange,
  isEditing,
  placeholder = '',
  icon = null,
  type = 'text'
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    ) : (
      <p className="text-gray-900 dark:text-white">{value || <span className="text-gray-400 dark:text-gray-500">-</span>}</p>
    )}
  </div>
);

/**
 * Textarea für längere Texte
 */
export const TextAreaField = ({
  label,
  value,
  onChange,
  isEditing,
  placeholder = '',
  icon = null,
  rows = 4
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </label>
    {isEditing ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
      />
    ) : (
      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
        {value || <span className="text-gray-400 dark:text-gray-500">-</span>}
      </p>
    )}
  </div>
);

/**
 * Nummernfeld
 */
export const NumberField = ({
  label,
  value,
  onChange,
  isEditing,
  suffix = '',
  icon = null,
  min = 0
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </label>
    {isEditing ? (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          min={min}
          className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {suffix && <span className="text-gray-600 dark:text-gray-400">{suffix}</span>}
      </div>
    ) : (
      <p className="text-gray-900 dark:text-white">
        {value ? `${value}${suffix}` : <span className="text-gray-400 dark:text-gray-500">-</span>}
      </p>
    )}
  </div>
);

/**
 * Select-Dropdown
 */
export const SelectField = ({
  label,
  value,
  onChange,
  isEditing,
  options = [],
  icon = null
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </label>
    {isEditing ? (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">Auswählen...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <p className="text-gray-900 dark:text-white">{value || <span className="text-gray-400 dark:text-gray-500">-</span>}</p>
    )}
  </div>
);

/**
 * Tag-Liste (Skills, Equipment, Sprachen)
 */
export const TagsField = ({
  label,
  values = [],
  onAdd,
  onRemove,
  isEditing,
  placeholder = 'Hinzufügen...',
  icon = null,
  color = 'blue'
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {values.map(tag => (
          <span
            key={tag}
            className={`px-3 py-1 rounded-full text-sm ${colorClasses[color]} flex items-center gap-1`}
          >
            {tag}
            {isEditing && (
              <button
                onClick={() => onRemove(tag)}
                className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {isEditing && (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-40"
            />
            <button
              onClick={handleAdd}
              className="p-1 text-primary hover:bg-primary/10 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {!isEditing && values.length === 0 && (
        <p className="text-gray-400 dark:text-gray-500">-</p>
      )}
    </div>
  );
};

/**
 * Checkbox-Feld
 */
export const CheckboxField = ({
  label,
  value,
  onChange,
  isEditing,
  icon = null
}) => (
  <div className="mb-4">
    <label className="flex items-center gap-2">
      {isEditing ? (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
        />
      ) : (
        <span className={value ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}>
          {value ? '✓' : '✗'}
        </span>
      )}
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </span>
    </label>
  </div>
);

/**
 * ComboboxField - Suchbares Dropdown mit Vorschlägen
 */
export const ComboboxField = ({
  label,
  values = [],
  suggestions = [],
  onAdd,
  onRemove,
  isEditing,
  placeholder = 'Suchen oder hinzufügen...',
  icon = null,
  color = 'blue',
  maxSuggestions = 15
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = suggestions
    .filter(s => !values.includes(s))
    .filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  const topSuggestions = suggestions
    .filter(s => !values.includes(s))
    .slice(0, maxSuggestions);

  const handleSelect = (value) => {
    onAdd(value);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleAddCustom = () => {
    if (searchTerm.trim() && !values.includes(searchTerm.trim())) {
      onAdd(searchTerm.trim());
      setSearchTerm('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        handleSelect(filteredSuggestions[0]);
      } else if (searchTerm.trim()) {
        handleAddCustom();
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-2 mb-2">
        {values.map(tag => (
          <span
            key={tag}
            className={`px-3 py-1 rounded-full text-sm ${colorClasses[color]} flex items-center gap-1`}
          >
            {tag}
            {isEditing && (
              <button
                onClick={() => onRemove(tag)}
                className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {isEditing && (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchTerm && filteredSuggestions.length > 0 && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">Suchergebnisse</p>
                  {filteredSuggestions.slice(0, maxSuggestions).map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => handleSelect(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-primary/10 rounded text-sm text-gray-900 dark:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {searchTerm && !suggestions.includes(searchTerm) && !values.includes(searchTerm) && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleAddCustom}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded text-sm flex items-center gap-2 text-emerald-700 dark:text-emerald-400"
                  >
                    <Plus className="w-4 h-4" />
                    "{searchTerm}" hinzufügen
                  </button>
                </div>
              )}

              {!searchTerm && topSuggestions.length > 0 && (
                <div className="p-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">Vorschläge</p>
                  {topSuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => handleSelect(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-primary/10 rounded text-sm text-gray-900 dark:text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {searchTerm && filteredSuggestions.length === 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  Keine Vorschläge gefunden
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!isEditing && values.length === 0 && (
        <p className="text-gray-400 dark:text-gray-500">-</p>
      )}
    </div>
  );
};

/**
 * Profilsektion mit Überschrift
 */
export const ProfileSection = ({ title, children, extra }) => (
  <div className="bg-white dark:bg-gray-800 rounded-card shadow-sm p-6 mb-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      {extra && <div>{extra}</div>}
    </div>
    {children}
  </div>
);

/**
 * ProfileAvatar - Rundes Profilbild mit Initialen-Fallback
 * Verwendet profileImage wenn vorhanden, sonst Initialen aus Vor-/Nachname
 */
export const ProfileAvatar = ({
  imageUrl,
  firstName,
  lastName,
  size = 'lg',
  className = ''
}) => {
  const initials = `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();

  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
    xl: 'w-24 h-24 text-3xl'
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-semibold text-white ${className}`}>
      {initials || '?'}
    </div>
  );
};
