import React from 'react';

/**
 * Progress bar colors mapping
 */
const progressColors = {
  primary: 'bg-primary',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  emerald: 'bg-emerald-500',
};

/**
 * SpendingCategory - Single spending category with progress bar
 */
const SpendingCategory = ({ name, spent, limit, color = 'primary' }) => {
  const percentage = Math.min((spent / limit) * 100, 100);
  const remaining = limit - spent;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {name}
        </span>
        <span className="text-caption text-gray-500 dark:text-gray-400">
          {spent.toLocaleString('de-DE')} € / {limit.toLocaleString('de-DE')} €
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${progressColors[color] || progressColors.primary}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Remaining */}
      <div className="flex items-center justify-between text-caption">
        <span className={`
          ${percentage >= 90
            ? 'text-red-500'
            : percentage >= 70
              ? 'text-amber-500'
              : 'text-gray-400'
          }
        `}>
          {percentage.toFixed(0)}% verwendet
        </span>
        <span className="text-gray-400">
          {remaining.toLocaleString('de-DE')} € verbleibend
        </span>
      </div>
    </div>
  );
};

/**
 * SpendingLimits - Display multiple spending categories
 */
const SpendingLimits = ({ categories, title = 'Ausgabenlimits' }) => {
  return (
    <div className="
      p-6 rounded-card
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
    ">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {title}
      </h3>

      <div className="space-y-6">
        {categories.map((category, index) => (
          <SpendingCategory key={index} {...category} />
        ))}
      </div>
    </div>
  );
};

export default SpendingLimits;
