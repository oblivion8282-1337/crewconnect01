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
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-900'
    },
    success: {
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600'
    },
    warning: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600'
    },
    danger: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600'
    },
    purple: {
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      valueColor: 'text-violet-600'
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;

  const trendConfig = {
    up: { icon: '↑', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    down: { icon: '↓', color: 'text-red-500', bg: 'bg-red-50' },
    neutral: { icon: '→', color: 'text-slate-400', bg: 'bg-slate-50' }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-5 transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-lg' : ''
      }`}
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
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-2xl font-bold ${styles.valueColor} tracking-tight`}>{value}</p>
        {subValue && (
          <p className="text-xs text-slate-400 mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );
};

export default KPICard;
