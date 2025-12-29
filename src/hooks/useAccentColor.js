import { useState, useEffect, useCallback } from 'react';

// Preset accent colors
export const ACCENT_COLORS = [
  { name: 'Cyan', hex: '#00D9FF' },
  { name: 'Neon Gelb', hex: '#D9FF00' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Lime', hex: '#84CC16' },
  { name: 'Sky', hex: '#0EA5E9' },
  { name: 'Indigo', hex: '#6366F1' },
];

const STORAGE_KEY = 'crewconnect-accent-color';
const DEFAULT_COLOR = '#00D9FF';

// Convert hex to RGB string for rgba()
function hexToRgbString(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '0, 217, 255';
}

// Determine if color is light or dark for foreground contrast
function isLightColor(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return true;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// Apply color to CSS variables
function applyColor(hex) {
  const rgbString = hexToRgbString(hex);
  const foreground = isLightColor(hex) ? '#000000' : '#FFFFFF';

  document.documentElement.style.setProperty('--color-primary', hex);
  document.documentElement.style.setProperty('--color-primary-rgb', rgbString);
  document.documentElement.style.setProperty('--color-primary-foreground', foreground);
}

export function useAccentColor() {
  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_COLOR;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || DEFAULT_COLOR;
  });

  useEffect(() => {
    applyColor(accentColor);
  }, [accentColor]);

  const changeColor = useCallback((hex) => {
    setAccentColor(hex);
    localStorage.setItem(STORAGE_KEY, hex);
    applyColor(hex);
  }, []);

  const resetColor = useCallback(() => {
    setAccentColor(DEFAULT_COLOR);
    localStorage.setItem(STORAGE_KEY, DEFAULT_COLOR);
    applyColor(DEFAULT_COLOR);
  }, []);

  return {
    accentColor,
    changeColor,
    resetColor,
    presets: ACCENT_COLORS,
    isDefault: accentColor === DEFAULT_COLOR,
  };
}

// Initialize accent color on app load
export function initAccentColor() {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(STORAGE_KEY);
  applyColor(stored || DEFAULT_COLOR);
}
