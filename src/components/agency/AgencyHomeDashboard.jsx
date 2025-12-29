import React, { useMemo } from 'react';
import {
  Briefcase,
  Euro,
  Clock,
  Users,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { createDateKey } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isTerminalStatus,
  MONTH_NAMES
} from '../../constants/calendar';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../data/initialData';

/**
 * AgencyHomeDashboard - Dashboard für Agenturen mit Budget-Übersicht
 */
const AgencyHomeDashboard = ({
  projects,
  bookings,
  freelancers,
  agencyId,
  onSelectProject,
  onConvertToFix,
  onViewBookings,
  onViewProjects,
  onAddProject
}) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtere Daten für diese Agentur
  const agencyProjects = useMemo(() =>
    projects.filter(p => p.agencyId === agencyId),
    [projects, agencyId]
  );

  const agencyBookings = useMemo(() =>
    bookings.filter(b =>
      b.agencyId === agencyId &&
      !isTerminalStatus(b.status)
    ),
    [bookings, agencyId]
  );

  // Monatliche Ausgaben berechnen (für Jahresübersicht)
  const monthlySpending = useMemo(() => {
    const spending = Array(12).fill(0);

    const allAgencyBookings = bookings.filter(b => b.agencyId === agencyId);

    allAgencyBookings.forEach(b => {
      if (b.status === BOOKING_STATUS.FIX_CONFIRMED) {
        b.dates.forEach(d => {
          const date = new Date(d);
          if (date.getFullYear() === currentYear) {
            const month = date.getMonth();
            spending[month] += (b.dayRate || 0);
          }
        });
      }
    });

    return spending;
  }, [bookings, agencyId, currentYear]);

  // KPI Berechnungen
  const stats = useMemo(() => {
    // Aktive Projekte (nicht abgeschlossen/storniert)
    const activeProjects = agencyProjects.filter(p =>
      !['completed', 'cancelled'].includes(p.status)
    );

    // Budget
    const totalBudget = agencyProjects.reduce((sum, p) => sum + (p.budget?.total || 0), 0);
    const spentBudget = agencyProjects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0);
    const budgetPercent = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0;

    // Pending Anfragen
    const pendingCount = agencyBookings.filter(b => isPendingStatus(b.status)).length;

    // Unique Freelancer
    const confirmedBookings = agencyBookings.filter(b => isConfirmedStatus(b.status));
    const uniqueFreelancers = new Set(confirmedBookings.map(b => b.freelancerId));

    // Monatliche Ausgaben
    const spentThisMonth = monthlySpending[currentMonth];
    const yearlySpending = monthlySpending.reduce((sum, val) => sum + val, 0);

    return {
      activeProjectsCount: activeProjects.length,
      totalBudget,
      spentBudget,
      budgetPercent,
      pendingCount,
      bookedFreelancersCount: uniqueFreelancers.size,
      spentThisMonth,
      yearlySpending
    };
  }, [agencyProjects, agencyBookings, monthlySpending, currentMonth]);

  // Pipeline Daten
  const pipeline = useMemo(() => {
    const pending = agencyBookings.filter(b => isPendingStatus(b.status));
    const options = agencyBookings.filter(b => b.status === BOOKING_STATUS.OPTION_CONFIRMED);
    const fixed = agencyBookings.filter(b => b.status === BOOKING_STATUS.FIX_CONFIRMED);

    return {
      pending: {
        count: pending.length,
        value: pending.reduce((sum, b) => sum + (b.totalCost || 0), 0)
      },
      options: {
        count: options.length,
        value: options.reduce((sum, b) => sum + (b.totalCost || 0), 0),
        bookings: options
      },
      fixed: {
        count: fixed.length,
        value: fixed.reduce((sum, b) => sum + (b.totalCost || 0), 0)
      }
    };
  }, [agencyBookings]);

  // Team Timeline Daten (nächste 14 Tage)
  const timelineData = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateKey = createDateKey(date.getFullYear(), date.getMonth(), date.getDate());
      days.push({
        date: dateKey,
        dayName: date.toLocaleDateString('de-DE', { weekday: 'short' }),
        dayNum: date.getDate(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }

    // Freelancer mit Buchungen in diesem Zeitraum
    const confirmedBookings = agencyBookings.filter(b => isConfirmedStatus(b.status));
    const freelancerIds = [...new Set(confirmedBookings.map(b => b.freelancerId))];

    const freelancerRows = freelancerIds.map(fId => {
      const freelancer = freelancers.find(f => f.id === fId);
      const fBookings = confirmedBookings.filter(b => b.freelancerId === fId);

      const dayStatuses = {};
      days.forEach(day => {
        const booking = fBookings.find(b => b.dates.includes(day.date));
        if (booking) {
          dayStatuses[day.date] = {
            status: booking.status,
            projectName: booking.projectName
          };
        }
      });

      return {
        id: fId,
        name: freelancer ? `${freelancer.firstName} ${freelancer.lastName}` : `Freelancer ${fId}`,
        avatar: freelancer?.avatar || '👤',
        dayStatuses
      };
    });

    return { days, freelancerRows };
  }, [agencyBookings, freelancers]);

  // Projekt-Statistiken
  const projectStats = useMemo(() => {
    const stats = {};
    agencyProjects.forEach(project => {
      const projectBookings = agencyBookings.filter(b => b.projectId === project.id);
      const uniqueFreelancers = new Set(projectBookings.map(b => b.freelancerId));
      const confirmed = projectBookings.filter(b => isConfirmedStatus(b.status));
      const pending = projectBookings.filter(b => isPendingStatus(b.status));

      stats[project.id] = {
        freelancerCount: uniqueFreelancers.size,
        confirmedCount: confirmed.length,
        pendingCount: pending.length
      };
    });
    return stats;
  }, [agencyProjects, agencyBookings]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Briefcase}
          label="Aktive Projekte"
          value={stats.activeProjectsCount}
          onClick={onViewProjects}
        />
        <StatsCard
          icon={Wallet}
          label="Ausgaben (Monat)"
          value={`${stats.spentThisMonth.toLocaleString('de-DE')} €`}
          change="+5%"
          trend="up"
        />
        <StatsCard
          icon={Clock}
          label="Offene Anfragen"
          value={stats.pendingCount}
          onClick={onViewBookings}
          highlight={stats.pendingCount > 0}
        />
        <StatsCard
          icon={Users}
          label="Gebuchte Freelancer"
          value={stats.bookedFreelancersCount}
        />
      </div>

      {/* Budget Overview */}
      <div className="p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gesamtbudget</h3>
            <p className="text-caption text-gray-500 dark:text-gray-400">
              {stats.spentBudget.toLocaleString('de-DE')}€ von {stats.totalBudget.toLocaleString('de-DE')}€ verwendet
            </p>
          </div>
          <div className={`
            px-3 py-1.5 rounded-lg text-sm font-semibold
            ${stats.budgetPercent > 90 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
              stats.budgetPercent > 70 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
              'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            }
          `}>
            {stats.budgetPercent}%
          </div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              stats.budgetPercent > 90 ? 'bg-red-500' :
              stats.budgetPercent > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(stats.budgetPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Offene Optionen Warnung */}
      {pipeline.options.count > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-card">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                {pipeline.options.count} offene Option{pipeline.options.count > 1 ? 'en' : ''} warten auf Fix-Buchung
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                Gesamtwert: {pipeline.options.value.toLocaleString('de-DE')}€
              </p>
              <div className="space-y-2">
                {pipeline.options.bookings.slice(0, 2).map(option => (
                  <div key={option.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <div>
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{option.freelancerName}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm"> • {option.projectName}</span>
                    </div>
                    <button
                      onClick={() => onConvertToFix(option)}
                      className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                    >
                      Fix buchen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Spending Chart */}
        <div className="lg:col-span-3">
          <SpendingChart
            data={monthlySpending}
            currentMonth={currentMonth}
            title="Ausgaben Übersicht"
          />
        </div>

        {/* Pipeline */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Buchungs-Pipeline</h3>
            <div className="space-y-4">
              <PipelineStage
                label="Pending"
                count={pipeline.pending.count}
                value={pipeline.pending.value}
                color="purple"
              />
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 rotate-90" />
              </div>
              <PipelineStage
                label="Options"
                count={pipeline.options.count}
                value={pipeline.options.value}
                color="yellow"
              />
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 rotate-90" />
              </div>
              <PipelineStage
                label="Fix gebucht"
                count={pipeline.fixed.count}
                value={pipeline.fixed.value}
                color="green"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projekte + Timeline */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Projekte */}
        <div className="p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">Projekte</h3>
            {onViewProjects && (
              <button
                onClick={onViewProjects}
                className="text-caption text-primary hover:underline"
              >
                Alle anzeigen <ArrowRight className="inline w-3 h-3" />
              </button>
            )}
          </div>

          {agencyProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <p className="mb-3">Noch keine Projekte</p>
              {onAddProject && (
                <button
                  onClick={onAddProject}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  Erstes Projekt erstellen
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {agencyProjects.slice(0, 4).map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  stats={projectStats[project.id]}
                  onClick={() => onSelectProject(project.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Team Timeline */}
        <div className="p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">Team Timeline</h3>
            <span className="text-caption text-gray-500 dark:text-gray-400">Nächste 14 Tage</span>
          </div>

          {timelineData.freelancerRows.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              Keine gebuchten Freelancer
            </div>
          ) : (
            <TeamTimeline data={timelineData} />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Stats Card Component (analog zu FreelancerHomeDashboard)
 */
const StatsCard = ({ icon: Icon, label, value, subValue, change, trend, onClick, highlight }) => (
  <div
    className={`
      p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
      transition-all duration-200
      ${onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg' : ''}
      ${highlight ? 'ring-2 ring-primary/50' : ''}
    `}
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </div>
      {change && (
        <span className={`
          text-caption font-medium px-2 py-1 rounded-lg
          ${trend === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : ''}
          ${trend === 'down' ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : ''}
        `}>
          {change}
        </span>
      )}
    </div>
    <p className="text-caption text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-stat text-gray-900 dark:text-white">{value}</p>
    {subValue && (
      <p className="text-caption text-gray-400 mt-1">{subValue}</p>
    )}
  </div>
);

/**
 * Spending Chart - Balkendiagramm für monatliche Ausgaben
 */
const SpendingChart = ({ data, currentMonth, title }) => {
  const maxValue = Math.max(...data, 1000);

  return (
    <div className="p-6 rounded-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-caption text-gray-500 dark:text-gray-400">Aktueller Monat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600" />
            <span className="text-caption text-gray-500 dark:text-gray-400">Vergangene Monate</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-right pr-4 w-14">
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((val, i) => (
            <span key={i} className="text-caption text-gray-400">
              {(val / 1000).toFixed(0)}k
            </span>
          ))}
        </div>

        {/* Chart Area */}
        <div className="ml-14">
          {/* Grid Lines */}
          <div className="absolute left-14 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((_, i) => (
              <div key={i} className="border-t border-gray-100 dark:border-gray-700" />
            ))}
          </div>

          {/* Bars */}
          <div className="relative h-64 flex items-end justify-between gap-1 sm:gap-2 pb-8">
            {data.map((value, index) => {
              const heightPercent = (value / maxValue) * 100;
              const isCurrent = index === currentMonth;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex justify-center group">
                    <div
                      className={`
                        w-full max-w-8 sm:max-w-10 rounded-t-lg transition-all duration-300
                        ${isCurrent
                          ? 'bg-primary shadow-lg shadow-primary/20'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }
                      `}
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="
                      absolute -top-10 left-1/2 -translate-x-1/2
                      px-2 py-1 rounded-lg bg-gray-900 text-white text-caption
                      opacity-0 group-hover:opacity-100 transition-opacity
                      whitespace-nowrap pointer-events-none z-10
                    ">
                      {value.toLocaleString('de-DE')} €
                    </div>
                  </div>
                  <span className={`
                    text-caption font-medium
                    ${isCurrent ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}
                  `}>
                    {MONTH_NAMES[index]?.substring(0, 3)}
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
 * Pipeline Stage
 */
const PipelineStage = ({ label, count, value, color }) => {
  const colors = {
    purple: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
    green: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
  };

  const dotColors = {
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-400',
    green: 'bg-emerald-500'
  };

  const textColors = {
    purple: 'text-purple-700 dark:text-purple-300',
    yellow: 'text-yellow-700 dark:text-yellow-300',
    green: 'text-emerald-700 dark:text-emerald-300'
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColors[color]}`}></span>
          <span className={`text-sm font-medium ${textColors[color]}`}>{label}</span>
        </div>
        <span className={`text-2xl font-bold ${textColors[color]}`}>{count}</span>
      </div>
      <p className={`text-xs mt-1 ${textColors[color]} opacity-75`}>
        {value.toLocaleString('de-DE')}€
      </p>
    </div>
  );
};

/**
 * Kompakte Projektkarte
 */
const ProjectCard = ({ project, stats, onClick }) => {
  const budgetPercent = project.budget?.total > 0
    ? Math.round((project.budget.spent / project.budget.total) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm cursor-pointer transition-all bg-gray-50 dark:bg-gray-900"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900 dark:text-white truncate">{project.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100 dark:bg-gray-700'}`}>
              {PROJECT_STATUS_LABELS[project.status] || 'Planung'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{project.client}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      </div>

      {/* Budget Bar */}
      {project.budget?.total > 0 && (
        <div className="mt-2">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                budgetPercent > 90 ? 'bg-red-500' :
                budgetPercent > 70 ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {stats?.freelancerCount || 0}
        </span>
        {stats?.confirmedCount > 0 && (
          <span className="text-emerald-600 dark:text-emerald-400">{stats.confirmedCount} bestätigt</span>
        )}
        {stats?.pendingCount > 0 && (
          <span className="text-purple-600 dark:text-purple-400">{stats.pendingCount} pending</span>
        )}
      </div>
    </div>
  );
};

/**
 * Team Timeline Komponente
 */
const TeamTimeline = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Header mit Tagen */}
        <div className="flex">
          <div className="w-32 flex-shrink-0"></div>
          {data.days.map(day => (
            <div
              key={day.date}
              className={`w-8 text-center text-xs ${day.isWeekend ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <div>{day.dayName}</div>
              <div className="font-medium">{day.dayNum}</div>
            </div>
          ))}
        </div>

        {/* Freelancer Rows */}
        <div className="mt-2 space-y-1">
          {data.freelancerRows.map(row => (
            <div key={row.id} className="flex items-center">
              <div className="w-32 flex-shrink-0 flex items-center gap-2 pr-2">
                <span className="text-lg">{row.avatar}</span>
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{row.name}</span>
              </div>
              {data.days.map(day => {
                const status = row.dayStatuses[day.date];
                const bgColor = status
                  ? status.status === BOOKING_STATUS.FIX_CONFIRMED
                    ? 'bg-red-500'
                    : 'bg-yellow-400'
                  : day.isWeekend
                    ? 'bg-gray-50 dark:bg-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700';

                return (
                  <div
                    key={day.date}
                    className={`w-8 h-6 ${bgColor} rounded-sm mx-px`}
                    title={status ? `${status.projectName}` : ''}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legende */}
        <div className="mt-4 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-400"></span>
            <span>Option</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span>Fix</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyHomeDashboard;
