/**
 * Color Configuration for CrewConnect Dashboard
 * These colors are used alongside Tailwind's color classes
 */

export const COLORS = {
  primary: {
    DEFAULT: '#00D9FF',
    foreground: '#000000',
    muted: 'rgba(0, 217, 255, 0.15)',
  },
  secondary: {
    DEFAULT: '#FFFFFF',
    muted: '#8E8E93',
  },
  grays: {
    50: '#F9F9F9',
    100: '#EBEBEB',
    400: '#636366',
    700: '#2C2C2E',
    800: '#1C1C1E',
    900: '#0A0A0A',
  },
  accents: {
    chartHighlight: '#00D9FF',
    chartBase: '#2C2C2E',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
};

// Chart colors for bar chart
export const CHART_COLORS = {
  dark: {
    highlight: '#00D9FF',
    base: '#2C2C2E',
    grid: '#1C1C1E',
  },
  light: {
    highlight: '#00D9FF',
    base: '#EBEBEB',
    grid: '#F9F9F9',
  },
};

// Status badge colors
export const STATUS_COLORS = {
  completed: {
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    text: 'text-green-700 dark:text-green-400',
  },
  pending: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
  },
  failed: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
  },
};

export default COLORS;
