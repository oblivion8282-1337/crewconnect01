import React, { useMemo } from 'react';

/**
 * BalanceChart - Bar chart showing monthly balance
 */
const BalanceChart = ({
  data,
  currentMonth = 'Apr',
  title = 'Verfügbares Guthaben',
  showAllMonths = true,
}) => {
  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    return Math.max(...data.map(d => d.value));
  }, [data]);

  // Determine which months to show based on screen size
  const visibleData = useMemo(() => {
    if (showAllMonths) return data;
    // Show last 6 months on smaller screens
    return data.slice(-6);
  }, [data, showAllMonths]);

  return (
    <div className="
      p-6 rounded-card
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-caption text-gray-500 dark:text-gray-400">
              Aktueller Monat
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600" />
            <span className="text-caption text-gray-500 dark:text-gray-400">
              Vergangene Monate
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-right pr-4 w-16">
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((val, i) => (
            <span key={i} className="text-caption text-gray-400">
              {(val / 1000).toFixed(0)}k
            </span>
          ))}
        </div>

        {/* Chart Area */}
        <div className="ml-16">
          {/* Grid Lines */}
          <div className="absolute left-16 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className="border-t border-gray-100 dark:border-gray-700"
              />
            ))}
          </div>

          {/* Bars */}
          <div className="relative h-64 flex items-end justify-between gap-1 sm:gap-2 pb-8">
            {visibleData.map((item, index) => {
              const heightPercent = (item.value / maxValue) * 100;
              const isCurrent = item.month === currentMonth;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  {/* Bar */}
                  <div className="relative w-full flex justify-center">
                    <div
                      className={`
                        w-full max-w-8 sm:max-w-12 rounded-t-lg
                        transition-all duration-300 ease-out
                        hover:opacity-80 cursor-pointer
                        ${isCurrent
                          ? 'bg-primary shadow-lg shadow-primary/20'
                          : 'bg-gray-200 dark:bg-gray-700'
                        }
                      `}
                      style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                      title={`${item.month}: ${item.value.toLocaleString('de-DE')} €`}
                    >
                      {/* Tooltip on hover */}
                      <div className="
                        absolute -top-8 left-1/2 -translate-x-1/2
                        px-2 py-1 rounded-lg
                        bg-gray-900 dark:bg-gray-700
                        text-white text-caption
                        opacity-0 hover:opacity-100
                        transition-opacity duration-200
                        whitespace-nowrap
                        pointer-events-none
                      ">
                        {item.value.toLocaleString('de-DE')} €
                      </div>
                    </div>
                  </div>

                  {/* Month Label */}
                  <span className={`
                    text-caption font-medium
                    ${isCurrent
                      ? 'text-primary'
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * MiniBalanceChart - Compact version for smaller spaces
 */
export const MiniBalanceChart = ({ data, currentMonth = 'Apr' }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const last6Months = data.slice(-6);

  return (
    <div className="flex items-end justify-between gap-1 h-16">
      {last6Months.map((item, index) => {
        const heightPercent = (item.value / maxValue) * 100;
        const isCurrent = item.month === currentMonth;

        return (
          <div
            key={index}
            className={`
              flex-1 rounded-t-sm
              transition-all duration-200
              ${isCurrent ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
            `}
            style={{ height: `${heightPercent}%`, minHeight: '4px' }}
          />
        );
      })}
    </div>
  );
};

export default BalanceChart;
