import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, SortAsc, Building2, Star, UserPlus } from 'lucide-react';
import ClientCard from './ClientCard';
import { CLIENT_STATUS_OPTIONS, CLIENT_STATUS } from '../../../constants/clients';

/**
 * Tab-Button Komponente
 */
const TabButton = ({ active, onClick, count, children }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-xl text-sm font-medium transition-all border-2
      flex items-center gap-2
      ${active
        ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }
    `}
  >
    {children}
    {count > 0 && (
      <span className={`
        min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full flex items-center justify-center
        ${active ? 'bg-primary text-primary-foreground' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
      `}>
        {count}
      </span>
    )}
  </button>
);

/**
 * ClientList - Übersicht aller Kunden
 */
const ClientList = ({
  clients,
  onSelectClient,
  onCreateClient,
  onToggleFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'recent' | 'projects'
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favorites' | 'leads'
  const [showFilters, setShowFilters] = useState(false);

  // Gefilterte und sortierte Clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Tab-Filter
    if (activeTab === 'favorites') {
      result = result.filter(c => c.isFavorite);
    } else if (activeTab === 'leads') {
      result = result.filter(c => c.status === CLIENT_STATUS.LEAD);
    }

    // Status-Filter
    if (statusFilter) {
      result = result.filter(c => c.status === statusFilter);
    }

    // Archivierte ausblenden (außer explizit gefiltert)
    if (statusFilter !== CLIENT_STATUS.ARCHIVED) {
      result = result.filter(c => c.status !== CLIENT_STATUS.ARCHIVED);
    }

    // Suche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.companyName.toLowerCase().includes(query) ||
        c.contacts?.some(contact =>
          contact.firstName?.toLowerCase().includes(query) ||
          contact.lastName?.toLowerCase().includes(query) ||
          contact.email?.toLowerCase().includes(query)
        ) ||
        c.tags?.some(tag => tag.includes(query))
      );
    }

    // Sortierung
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case 'projects':
        result.sort((a, b) => (b.stats?.projectCount || 0) - (a.stats?.projectCount || 0));
        break;
      case 'name':
      default:
        result.sort((a, b) => a.companyName.localeCompare(b.companyName));
        break;
    }

    return result;
  }, [clients, activeTab, statusFilter, searchQuery, sortBy]);

  // Zähler für Tabs
  const counts = useMemo(() => ({
    all: clients.filter(c => c.status !== CLIENT_STATUS.ARCHIVED).length,
    favorites: clients.filter(c => c.isFavorite).length,
    leads: clients.filter(c => c.status === CLIENT_STATUS.LEAD).length
  }), [clients]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 text-primary" />
            Kunden
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {counts.all} Kunden insgesamt
          </p>
        </div>

        <button
          onClick={onCreateClient}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Neuer Kunde
        </button>
      </div>

      {/* Suche und Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Suchfeld */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kunde suchen..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>

        {/* Status-Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl font-medium transition-colors ${
              statusFilter
                ? 'border-primary text-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
            }`}
          >
            <Filter className="w-4 h-4" />
            Status
          </button>

          {showFilters && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                <button
                  onClick={() => { setStatusFilter(null); setShowFilters(false); }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${!statusFilter ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  Alle Status
                </button>
                {CLIENT_STATUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => { setStatusFilter(option.value); setShowFilters(false); }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${statusFilter === option.value ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sortierung */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        >
          <option value="name">Name A-Z</option>
          <option value="recent">Zuletzt bearbeitet</option>
          <option value="projects">Meiste Projekte</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <TabButton
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          count={counts.all}
        >
          Alle
        </TabButton>
        <TabButton
          active={activeTab === 'favorites'}
          onClick={() => setActiveTab('favorites')}
          count={counts.favorites}
        >
          <Star className="w-4 h-4" />
          Favoriten
        </TabButton>
        <TabButton
          active={activeTab === 'leads'}
          onClick={() => setActiveTab('leads')}
          count={counts.leads}
        >
          <UserPlus className="w-4 h-4" />
          Leads
        </TabButton>
      </div>

      {/* Client Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={onSelectClient}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          {searchQuery || statusFilter ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Keine Kunden gefunden
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Versuche es mit anderen Suchbegriffen oder Filtern.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter(null); }}
                className="text-primary hover:underline"
              >
                Filter zurücksetzen
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Noch keine Kunden angelegt
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Lege deinen ersten Kunden an, um loszulegen.
              </p>
              <button
                onClick={onCreateClient}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                Ersten Kunden anlegen
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientList;
