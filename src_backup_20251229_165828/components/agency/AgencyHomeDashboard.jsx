import React, { useMemo } from 'react';
import {
  Briefcase,
  Euro,
  Clock,
  Users,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  Calendar,
  TrendingUp
} from 'lucide-react';
import KPICard from '../shared/KPICard';
import StatusBadge from '../shared/StatusBadge';
import { formatDate, createDateKey, getDaysInMonth } from '../../utils/dateUtils';
import {
  BOOKING_STATUS,
  isPendingStatus,
  isConfirmedStatus,
  isTerminalStatus,
  WEEKDAY_NAMES
} from '../../constants/calendar';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS
} from '../../data/initialData';

/**
 * AgencyHomeDashboard - Neue Startseite für Agenturen
 * Zeigt KPIs, Pipeline, Projekte und Team-Timeline
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

    return {
      activeProjectsCount: activeProjects.length,
      totalBudget,
      spentBudget,
      budgetPercent,
      pendingCount,
      bookedFreelancersCount: uniqueFreelancers.size
    };
  }, [agencyProjects, agencyBookings]);

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

  const now = new Date();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-sm text-gray-500">
          {now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Briefcase}
          label="Aktive Projekte"
          value={stats.activeProjectsCount}
          variant="default"
          onClick={onViewProjects}
        />
        <KPICard
          icon={Euro}
          label="Gesamtbudget"
          value={`${stats.spentBudget.toLocaleString('de-DE')}€`}
          subValue={`von ${stats.totalBudget.toLocaleString('de-DE')}€ (${stats.budgetPercent}%)`}
          variant={stats.budgetPercent > 90 ? 'danger' : stats.budgetPercent > 70 ? 'warning' : 'success'}
        />
        <KPICard
          icon={Clock}
          label="Offene Anfragen"
          value={stats.pendingCount}
          variant={stats.pendingCount > 0 ? 'purple' : 'default'}
          onClick={onViewBookings}
        />
        <KPICard
          icon={Users}
          label="Gebuchte Freelancer"
          value={stats.bookedFreelancersCount}
          variant="default"
        />
      </div>

      {/* Offene Optionen Warnung */}
      {pipeline.options.count > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-yellow-800">
                {pipeline.options.count} offene Option{pipeline.options.count > 1 ? 'en' : ''} warten auf Fix-Buchung
              </p>
              <p className="text-sm text-yellow-700 mb-3">
                Gesamtwert: {pipeline.options.value.toLocaleString('de-DE')}€
              </p>
              <div className="space-y-2">
                {pipeline.options.bookings.slice(0, 2).map(option => (
                  <div key={option.id} className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <div>
                      <span className="font-medium text-sm">{option.freelancerName}</span>
                      <span className="text-gray-500 text-sm"> • {option.projectName}</span>
                    </div>
                    <button
                      onClick={() => onConvertToFix(option)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
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

      {/* Pipeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold mb-4">Buchungs-Pipeline</h2>
        <div className="flex items-center justify-between">
          <PipelineStage
            label="Pending"
            count={pipeline.pending.count}
            value={pipeline.pending.value}
            color="purple"
          />
          <ArrowRight className="w-6 h-6 text-gray-300" />
          <PipelineStage
            label="Options"
            count={pipeline.options.count}
            value={pipeline.options.value}
            color="yellow"
          />
          <ArrowRight className="w-6 h-6 text-gray-300" />
          <PipelineStage
            label="Fix"
            count={pipeline.fixed.count}
            value={pipeline.fixed.value}
            color="green"
          />
        </div>
      </div>

      {/* Hauptbereich: Projekte + Timeline */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Projekte */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Projekte</h2>
            {onViewProjects && (
              <button
                onClick={onViewProjects}
                className="text-xs text-blue-600 hover:underline"
              >
                Alle anzeigen <ArrowRight className="inline w-3 h-3" />
              </button>
            )}
          </div>

          {agencyProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="mb-3">Noch keine Projekte</p>
              {onAddProject && (
                <button
                  onClick={onAddProject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Team Timeline</h2>
            <span className="text-xs text-gray-500">Nächste 14 Tage</span>
          </div>

          {timelineData.freelancerRows.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
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
 * Pipeline Stage
 */
const PipelineStage = ({ label, count, value, color }) => {
  const colors = {
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    green: 'bg-green-100 text-green-700 border-green-200'
  };

  const dotColors = {
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-400',
    green: 'bg-green-500'
  };

  return (
    <div className={`flex-1 p-4 rounded-xl border ${colors[color]} text-center`}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${dotColors[color]}`}></span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs opacity-75">{value.toLocaleString('de-DE')}€</p>
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
      className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{project.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100'}`}>
              {PROJECT_STATUS_LABELS[project.status] || 'Planung'}
            </span>
          </div>
          <p className="text-xs text-gray-500">{project.client}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* Budget Bar */}
      {project.budget?.total > 0 && (
        <div className="mt-2">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                budgetPercent > 90 ? 'bg-red-500' :
                budgetPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-3 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {stats?.freelancerCount || 0}
        </span>
        {stats?.confirmedCount > 0 && (
          <span className="text-green-600">{stats.confirmedCount} bestätigt</span>
        )}
        {stats?.pendingCount > 0 && (
          <span className="text-purple-600">{stats.pendingCount} pending</span>
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
              className={`w-8 text-center text-xs ${day.isWeekend ? 'text-gray-300' : 'text-gray-500'}`}
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
                <span className="text-xs truncate">{row.name}</span>
              </div>
              {data.days.map(day => {
                const status = row.dayStatuses[day.date];
                const bgColor = status
                  ? status.status === BOOKING_STATUS.FIX_CONFIRMED
                    ? 'bg-red-500'
                    : 'bg-yellow-400'
                  : day.isWeekend
                    ? 'bg-gray-50'
                    : 'bg-gray-100';

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
        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-400"></span>
            <span>Option</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span>Fix</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyHomeDashboard;
