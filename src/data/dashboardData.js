/**
 * Sample data for the CrewConnect Dashboard
 */

// Monthly balance data for bar chart
export const MONTHLY_BALANCE = [
  { month: 'Mai', value: 12500, year: 2024 },
  { month: 'Jun', value: 18200, year: 2024 },
  { month: 'Jul', value: 15800, year: 2024 },
  { month: 'Aug', value: 22100, year: 2024 },
  { month: 'Sep', value: 19500, year: 2024 },
  { month: 'Okt', value: 24800, year: 2024 },
  { month: 'Nov', value: 21300, year: 2024 },
  { month: 'Dez', value: 28500, year: 2024 },
  { month: 'Jan', value: 31200, year: 2025 },
  { month: 'Feb', value: 26800, year: 2025 },
  { month: 'Mär', value: 29400, year: 2025 },
  { month: 'Apr', value: 35200, year: 2025 },
];

// Stats for the dashboard cards
export const DASHBOARD_STATS = {
  totalBalance: {
    label: 'Gesamtguthaben',
    value: 35200,
    change: 12.5,
    changeLabel: 'vs. letzten Monat',
    trend: 'up',
  },
  monthlyIncome: {
    label: 'Monatliche Einnahmen',
    value: 8450,
    change: 8.2,
    changeLabel: 'vs. letzten Monat',
    trend: 'up',
  },
  pendingPayments: {
    label: 'Ausstehende Zahlungen',
    value: 3200,
    change: -5.1,
    changeLabel: 'vs. letzten Monat',
    trend: 'down',
  },
  activeProjects: {
    label: 'Aktive Projekte',
    value: 12,
    change: 2,
    changeLabel: 'neu diese Woche',
    trend: 'up',
  },
};

// Sample transactions
export const TRANSACTIONS = [
  {
    id: 1,
    name: 'Mercedes-Benz Kampagne',
    type: 'Eingang',
    amount: 4500,
    date: '2025-04-15',
    status: 'completed',
    avatar: '🚗',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 2,
    name: 'Adobe Creative Suite',
    type: 'Ausgang',
    amount: -89.99,
    date: '2025-04-14',
    status: 'completed',
    avatar: '🎨',
    paymentMethod: 'Kreditkarte',
  },
  {
    id: 3,
    name: 'BMW Fotoshooting',
    type: 'Eingang',
    amount: 2800,
    date: '2025-04-12',
    status: 'pending',
    avatar: '📸',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 4,
    name: 'Equipment Miete',
    type: 'Ausgang',
    amount: -350,
    date: '2025-04-10',
    status: 'completed',
    avatar: '🎬',
    paymentMethod: 'PayPal',
  },
  {
    id: 5,
    name: 'Porsche Event',
    type: 'Eingang',
    amount: 6200,
    date: '2025-04-08',
    status: 'completed',
    avatar: '🏎️',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 6,
    name: 'Studio Buchung',
    type: 'Ausgang',
    amount: -180,
    date: '2025-04-05',
    status: 'failed',
    avatar: '🏢',
    paymentMethod: 'Kreditkarte',
  },
];

// Navigation items for sidebar
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'projects', label: 'Projekte', icon: 'FolderKanban' },
  { id: 'calendar', label: 'Kalender', icon: 'Calendar' },
  { id: 'bookings', label: 'Buchungen', icon: 'BookOpen' },
  { id: 'analytics', label: 'Statistiken', icon: 'BarChart3' },
  { id: 'settings', label: 'Einstellungen', icon: 'Settings' },
];

// Spending categories for the limit section
export const SPENDING_CATEGORIES = [
  { name: 'Equipment', spent: 2400, limit: 5000, color: 'primary' },
  { name: 'Software', spent: 890, limit: 1500, color: 'blue' },
  { name: 'Reisen', spent: 1200, limit: 2000, color: 'violet' },
  { name: 'Marketing', spent: 450, limit: 1000, color: 'amber' },
];

// Card details for the visa card display
export const CARD_DETAILS = {
  number: '4532 •••• •••• 8901',
  holder: 'MICHAEL SCHMIDT',
  expiry: '09/28',
  type: 'VISA',
};
