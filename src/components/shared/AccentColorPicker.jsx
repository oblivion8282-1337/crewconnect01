import React, { useRef } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { useAccentColor, ACCENT_COLORS } from '../../hooks/useAccentColor';

/**
 * AccentColorPicker - Komponente zur Auswahl der Akzentfarbe
 */
const AccentColorPicker = () => {
  const { accentColor, changeColor, resetColor, isDefault } = useAccentColor();
  const colorInputRef = useRef(null);

  const handleCustomClick = () => {
    colorInputRef.current?.click();
  };

  const handleCustomChange = (e) => {
    changeColor(e.target.value);
  };

  const isSelected = (hex) => accentColor.toLowerCase() === hex.toLowerCase();

  // Colors that need dark text
  const lightColors = ['#D9FF00', '#F59E0B', '#84CC16', '#00D4FF'];

  return (
    <div className="space-y-4">
      {/* Preset Colors Grid */}
      <div className="grid grid-cols-6 gap-3">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.hex}
            onClick={() => changeColor(color.hex)}
            className={`
              relative w-10 h-10 rounded-lg transition-all duration-200
              hover:scale-110 hover:shadow-lg
              ${isSelected(color.hex)
                ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 dark:ring-offset-gray-900 scale-110'
                : ''
              }
            `}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          >
            {isSelected(color.hex) && (
              <Check
                className="absolute inset-0 m-auto w-5 h-5"
                style={{ color: lightColors.includes(color.hex) ? '#000' : '#fff' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Custom Color & Reset */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        {/* Custom Color Picker */}
        <button
          onClick={handleCustomClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
        >
          <div
            className="w-5 h-5 rounded border border-gray-300 dark:border-gray-500"
            style={{ backgroundColor: accentColor }}
          />
          <span>Eigene Farbe</span>
        </button>
        <input
          ref={colorInputRef}
          type="color"
          value={accentColor}
          onChange={handleCustomChange}
          className="sr-only"
        />

        {/* Reset Button */}
        {!isDefault && (
          <button
            onClick={resetColor}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Zurücksetzen</span>
          </button>
        )}

        {/* Current Color Display */}
        <div className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-mono">
          {accentColor.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default AccentColorPicker;
