import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronDown, Search } from 'lucide-react';

/**
 * ProfileField - Wiederverwendbare Komponente für Profilfelder
 *
 * Unterstützt verschiedene Feldtypen: text, textarea, number, select, tags, url
 * Im Edit-Modus werden Eingabefelder angezeigt, sonst der Wert.
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
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    ) : (
      <p className="text-gray-900">{value || <span className="text-gray-400">-</span>}</p>
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
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </label>
    {isEditing ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    ) : (
      <p className="text-gray-900 whitespace-pre-wrap">
        {value || <span className="text-gray-400">-</span>}
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
    <label className="block text-sm font-medium text-gray-600 mb-1">
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
          className="w-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {suffix && <span className="text-gray-600">{suffix}</span>}
      </div>
    ) : (
      <p className="text-gray-900">
        {value ? `${value}${suffix}` : <span className="text-gray-400">-</span>}
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
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </label>
    {isEditing ? (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Auswählen...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <p className="text-gray-900">{value || <span className="text-gray-400">-</span>}</p>
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
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 mb-1">
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
                className="hover:bg-black/10 rounded-full p-0.5"
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
              className="px-3 py-1 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            />
            <button
              onClick={handleAdd}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {!isEditing && values.length === 0 && (
        <p className="text-gray-400">-</p>
      )}
    </div>
  );
};

/**
 * URL-Liste (Portfolio-Links)
 */
export const UrlListField = ({
  label,
  values = [],
  onAdd,
  onRemove,
  isEditing,
  icon = null
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

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </label>

      <div className="space-y-2">
        {values.map(url => (
          <div key={url} className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm truncate flex-1"
            >
              {url}
            </a>
            {isEditing && (
              <button
                onClick={() => onRemove(url)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://..."
              className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAdd}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {!isEditing && values.length === 0 && (
        <p className="text-gray-400">-</p>
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
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ) : (
        <span className={value ? 'text-green-600' : 'text-gray-400'}>
          {value ? '✓' : '✗'}
        </span>
      )}
      <span className="text-sm font-medium text-gray-600">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </span>
    </label>
  </div>
);

/**
 * ComboboxField - Suchbares Dropdown mit Vorschlägen
 *
 * Kombiniert Suchfeld mit Dropdown-Liste von Vorschlägen.
 * Erlaubt auch das Hinzufügen eigener Werte.
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
  const inputRef = useRef(null);

  // Schließe Dropdown bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtere Vorschläge basierend auf Suchbegriff und bereits ausgewählten Werten
  const filteredSuggestions = suggestions
    .filter(s => !values.includes(s))
    .filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  // Zeige Top-Vorschläge (erste X die noch nicht ausgewählt sind)
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
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-600 mb-1">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </label>
      )}

      {/* Ausgewählte Tags */}
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
                className="hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Dropdown (nur im Edit-Modus) */}
      {isEditing && (
        <div className="relative" ref={dropdownRef}>
          {/* Suchfeld */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Dropdown-Liste */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {/* Suchergebnisse */}
              {searchTerm && filteredSuggestions.length > 0 && (
                <div className="p-2 border-b">
                  <p className="text-xs text-gray-500 mb-1 px-2">Suchergebnisse</p>
                  {filteredSuggestions.slice(0, maxSuggestions).map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => handleSelect(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Eigenen Wert hinzufügen */}
              {searchTerm && !suggestions.includes(searchTerm) && !values.includes(searchTerm) && (
                <div className="p-2 border-b">
                  <button
                    onClick={handleAddCustom}
                    className="w-full text-left px-3 py-2 hover:bg-green-50 rounded text-sm flex items-center gap-2 text-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    "{searchTerm}" hinzufügen
                  </button>
                </div>
              )}

              {/* Beliebte Vorschläge */}
              {!searchTerm && topSuggestions.length > 0 && (
                <div className="p-2">
                  <p className="text-xs text-gray-500 mb-1 px-2">Vorschläge</p>
                  {topSuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => handleSelect(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Keine Ergebnisse */}
              {searchTerm && filteredSuggestions.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Keine Vorschläge gefunden
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!isEditing && values.length === 0 && (
        <p className="text-gray-400">-</p>
      )}
    </div>
  );
};

/**
 * Profilsektion mit Überschrift
 */
export const ProfileSection = ({ title, icon, children, extra }) => (
  <div className="bg-white rounded-xl shadow p-6 mb-4">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {extra && <div>{extra}</div>}
    </div>
    {children}
  </div>
);
