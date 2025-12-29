import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * StatsCard - Display a single statistic with comparison
 */
const StatsCard = ({
  label,
  value,
  change,
  changeLabel,
  trend = 'up',
  prefix = '',
  suffix = '',
  icon: Icon,
}) => {
  const isPositive = trend === 'up';
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString('de-DE')
    : value;

  return (
    <div className="
      group relative p-6 rounded-card
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      hover:border-primary/50 dark:hover:border-primary/50
      hover:shadow-lg hover:shadow-primary/5
      transition-all duration-200 ease-in-out
      cursor-default
    ">
      {/* Optional Icon */}
      {Icon && (
        <div className="
          absolute top-4 right-4
          w-10 h-10 rounded-xl
          bg-gray-100 dark:bg-gray-700
          flex items-center justify-center
          group-hover:bg-primary/10 dark:group-hover:bg-primary/20
          transition-colors duration-200
        ">
          <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors duration-200" />
        </div>
      )}

      {/* Label */}
      <p className="text-caption text-gray-500 dark:text-gray-400 mb-2">
        {label}
      </p>

      {/* Value */}
      <p className="text-stat text-gray-900 dark:text-white mb-3">
        {prefix}{formattedValue}{suffix}
      </p>

      {/* Change Indicator */}
      <div className="flex items-center gap-2">
        <span className={`
          flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
          ${isPositive
            ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
            : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
          }
        `}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(change)}%
        </span>
        <span className="text-caption text-gray-400">
          {changeLabel}
        </span>
      </div>
    </div>
  );
};

/**
 * StatsCardGrid - Grid layout for multiple stats cards
 */
export const StatsCardGrid = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
    {children}
  </div>
);

export default StatsCard;
