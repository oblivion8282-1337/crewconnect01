import React from 'react';
import { Star, MapPin, Briefcase, Mail } from 'lucide-react';
import { getIndustryLabel, getStatusOption } from '../../../constants/clients';
import { formatDate } from '../../../utils/dateUtils';

/**
 * Status-Badge Komponente
 */
const StatusBadge = ({ status }) => {
  const option = getStatusOption(status);

  const colorClasses = {
    green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses[option.color] || colorClasses.gray}`}>
      {option.label}
    </span>
  );
};

/**
 * Logo-Fallback mit Initialen
 */
const ClientLogo = ({ logo, companyName, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  // Erste zwei Buchstaben des Firmennamens
  const initials = companyName
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '??';

  if (logo) {
    return (
      <img
        src={logo}
        alt={companyName}
        className={`${sizeClasses[size]} rounded-xl object-cover`}
      />
    );
  }

  // Generiere eine konsistente Farbe basierend auf dem Firmennamen
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500'
  ];
  const colorIndex = companyName?.charCodeAt(0) % colors.length || 0;

  return (
    <div className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-xl flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  );
};

/**
 * ClientCard - Einzelne Kundenkarte
 */
const ClientCard = ({ client, onClick, onToggleFavorite }) => {
  const primaryContact = client.contacts?.find(c => c.isPrimary) || client.contacts?.[0];
  const stats = client.stats || { projectCount: 0, lastProjectDate: null };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite?.(client.id);
  };

  return (
    <div
      onClick={() => onClick?.(client.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(client.id); }}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer"
    >
      {/* Header mit Logo und Favorit */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ClientLogo logo={client.logo} companyName={client.companyName} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
              {client.companyName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={client.status} />
            </div>
          </div>
        </div>

        <button
          onClick={handleFavoriteClick}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={client.isFavorite ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              client.isFavorite
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
            }`}
          />
        </button>
      </div>

      {/* Branche und Stadt */}
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <Briefcase className="w-4 h-4" />
          {getIndustryLabel(client.industry)}
        </span>
        {client.address?.city && (
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {client.address.city}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        <span className="font-medium text-gray-700 dark:text-gray-300">{stats.projectCount}</span> Projekte
        {stats.lastProjectDate && (
          <span className="ml-2">
            • Letztes: {formatDate(stats.lastProjectDate)}
          </span>
        )}
      </div>

      {/* Hauptansprechpartner */}
      {primaryContact && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {primaryContact.firstName?.[0]}{primaryContact.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                {primaryContact.firstName} {primaryContact.lastName}
              </p>
            </div>
            {primaryContact.email && (
              <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500 truncate">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate text-xs">{primaryContact.email}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCard;
export { ClientLogo, StatusBadge };
