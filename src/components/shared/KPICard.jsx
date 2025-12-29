import React from 'react';

/**
 * KPICard - Wiederverwendbare Karte für Dashboard-KPIs
 */
const KPICard = ({
  icon: Icon,
  label,
  value,
  subValue,
  variant = 'default',
  trend,
  onClick
}) => {
  const variantStyles = {
    default: {
      iconBg: 'bg-gray-100 dark:bg-gray-700',
      iconColor: 'text-gray-600 dark:text-gray-300',
      valueColor: 'text-gray-900 dark:text-white'
    },
    success: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400'
    },
    warning: {
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-600 dark:text-amber-400'
    },
    danger: {
      iconBg: 'bg-red-50 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-600 dark:text-red-400'
    },
    purple: {
      iconBg: 'bg-violet-50 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      valueColor: 'text-violet-600 dark:text-violet-400'
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;

  const trendConfig = {
    up: { icon: '↑', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    down: { icon: '↓', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
    neutral: { icon: '→', color: 'text-gray-400 dark:text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' }
  };

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-card
        border border-gray-200 dark:border-gray-700
        p-5 transition-all
        ${onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${styles.iconBg} p-2.5 rounded-xl`}>
          {Icon && <Icon className={`w-5 h-5 ${styles.iconColor}`} />}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${trendConfig[trend].color} ${trendConfig[trend].bg}`}>
            {trendConfig[trend].icon}
          </span>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-bold ${styles.valueColor} tracking-tight`}>{value}</p>
        {subValue && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
