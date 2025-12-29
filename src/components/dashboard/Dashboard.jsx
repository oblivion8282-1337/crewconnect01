import React, { useState } from 'react';
import { Bell, Download, Plus, Wallet, TrendingUp, Clock, FolderKanban } from 'lucide-react';

// Components
import DashboardSidebar, { MobileMenuButton } from './DashboardSidebar';
import ThemeSwitch from './ThemeSwitch';
import StatsCard, { StatsCardGrid } from './StatsCard';
import BalanceChart from './BalanceChart';
import TransactionTable from './TransactionTable';
import SpendingLimits from './SpendingLimits';
import VisaCard from './VisaCard';

// Data
import {
  MONTHLY_BALANCE,
  DASHBOARD_STATS,
  TRANSACTIONS,
  NAV_ITEMS,
  SPENDING_CATEGORIES,
  CARD_DETAILS,
} from '../../data/dashboardData';

/**
 * Dashboard - Main dashboard page component
 */
const Dashboard = ({ onBack }) => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <DashboardSidebar
        navItems={NAV_ITEMS}
        activeItem={activeNav}
        onNavChange={setActiveNav}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="lg:ml-sidebar transition-all duration-200">
        {/* Header */}
        <header className="
          sticky top-0 z-30
          h-header px-4 lg:px-8
          bg-white/80 dark:bg-gray-900/80
          backdrop-blur-lg
          border-b border-gray-200 dark:border-gray-800
          flex items-center justify-between
        ">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <div>
              <h1 className="text-h1 text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-caption text-gray-500 dark:text-gray-400 hidden sm:block">
                Willkommen zurück! Hier ist deine Übersicht.
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Back Button (if provided) */}
            {onBack && (
              <button
                onClick={onBack}
                className="
                  hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl
                  text-sm font-medium
                  text-gray-600 dark:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-colors duration-200
                "
              >
                Zurück zur App
              </button>
            )}

            {/* Export Button */}
            <button className="
              hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-gray-100 dark:bg-gray-800
              text-sm font-medium text-gray-700 dark:text-gray-300
              hover:bg-gray-200 dark:hover:bg-gray-700
              transition-colors duration-200
            ">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Notifications */}
            <button className="
              relative p-2.5 rounded-xl
              bg-gray-100 dark:bg-gray-800
              hover:bg-gray-200 dark:hover:bg-gray-700
              transition-colors duration-200
            ">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="
                absolute -top-1 -right-1 w-5 h-5
                bg-primary text-primary-foreground
                text-xs font-bold rounded-full
                flex items-center justify-center
              ">
                3
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeSwitch />

            {/* New Transaction */}
            <button className="
              flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-primary text-primary-foreground
              font-medium text-sm
              hover:opacity-90
              transition-all duration-200
            ">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Neu</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 max-w-screen-2xl mx-auto">
          {/* Stats Cards */}
          <section className="mb-8">
            <StatsCardGrid>
              <StatsCard
                label={DASHBOARD_STATS.totalBalance.label}
                value={DASHBOARD_STATS.totalBalance.value}
                change={DASHBOARD_STATS.totalBalance.change}
                changeLabel={DASHBOARD_STATS.totalBalance.changeLabel}
                trend={DASHBOARD_STATS.totalBalance.trend}
                suffix=" €"
                icon={Wallet}
              />
              <StatsCard
                label={DASHBOARD_STATS.monthlyIncome.label}
                value={DASHBOARD_STATS.monthlyIncome.value}
                change={DASHBOARD_STATS.monthlyIncome.change}
                changeLabel={DASHBOARD_STATS.monthlyIncome.changeLabel}
                trend={DASHBOARD_STATS.monthlyIncome.trend}
                suffix=" €"
                icon={TrendingUp}
              />
              <StatsCard
                label={DASHBOARD_STATS.pendingPayments.label}
                value={DASHBOARD_STATS.pendingPayments.value}
                change={DASHBOARD_STATS.pendingPayments.change}
                changeLabel={DASHBOARD_STATS.pendingPayments.changeLabel}
                trend={DASHBOARD_STATS.pendingPayments.trend}
                suffix=" €"
                icon={Clock}
              />
              <StatsCard
                label={DASHBOARD_STATS.activeProjects.label}
                value={DASHBOARD_STATS.activeProjects.value}
                change={DASHBOARD_STATS.activeProjects.change}
                changeLabel={DASHBOARD_STATS.activeProjects.changeLabel}
                trend={DASHBOARD_STATS.activeProjects.trend}
                icon={FolderKanban}
              />
            </StatsCardGrid>
          </section>

          {/* Main Grid - Chart & Card */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Balance Chart */}
            <div className="lg:col-span-3">
              <BalanceChart
                data={MONTHLY_BALANCE}
                currentMonth="Apr"
                title="Verfügbares Guthaben"
              />
            </div>

            {/* Card & Limits */}
            <div className="lg:col-span-2 space-y-6">
              <VisaCard cardDetails={CARD_DETAILS} />
              <SpendingLimits
                categories={SPENDING_CATEGORIES}
                title="Ausgabenlimits"
              />
            </div>
          </section>

          {/* Transactions Table */}
          <section>
            <TransactionTable
              transactions={TRANSACTIONS}
              title="Letzte Transaktionen"
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
