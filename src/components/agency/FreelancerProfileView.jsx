import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  Euro,
  Star,
  Mail,
  Phone,
  Globe,
  Calendar,
  Briefcase,
  Package,
  Languages,
  ExternalLink,
  Clock,
  CheckCircle,
  ListPlus,
  Lock,
  Users,
  MessageCircle
} from 'lucide-react';
import FavoriteButton from '../shared/FavoriteButton';
import StartChatButton from '../shared/StartChatButton';
import { formatDate } from '../../utils/dateUtils';
import { isConfirmedStatus, isFixStatus, BOOKING_STATUS } from '../../constants/calendar';
import { CALENDAR_VISIBILITY } from '../../hooks/useProfile';

/**
 * FreelancerProfileView - Vollständige Profilansicht eines Freelancers
 */
const FreelancerProfileView = ({
  freelancer,
  bookings,
  agencyId,
  agencyProfile,
  getDayStatus,
  onBack,
  onOpenBookingModal,
  onOpenAddToListModal,
  // Chat Props
  getOrCreateChat,
  onOpenChat,
  // Favoriten Props
  isFavorite,
  onToggleFavorite,
  crewLists,
  getListsForFreelancer,
  onAddToList,
  onRemoveFromList
}) => {
  const fullName = `${freelancer.firstName} ${freelancer.lastName}`;
  const initials = `${freelancer.firstName?.[0] || ''}${freelancer.lastName?.[0] || ''}`;
  const visibility = freelancer.visibility || {};
  const calendarVisibility = freelancer.calendarVisibility || CALENDAR_VISIBILITY.PUBLIC;

  // Prüfe ob bisherige Zusammenarbeit besteht (Fix-Buchung)
  const hasWorkedTogether = useMemo(() => {
    return bookings.some(b =>
      b.freelancerId === freelancer.id &&
      b.agencyId === agencyId &&
      b.status === BOOKING_STATUS.FIX_CONFIRMED
    );
  }, [bookings, freelancer.id, agencyId]);

  // Kalender-Sichtbarkeit für diese Agentur
  const canSeeCalendar = useMemo(() => {
    if (calendarVisibility === CALENDAR_VISIBILITY.PUBLIC) return true;
    if (calendarVisibility === CALENDAR_VISIBILITY.CONTACTS_ONLY && hasWorkedTogether) return true;
    // Bei 'on_request' oder 'contacts_only' ohne Zusammenarbeit: nicht sichtbar
    return false;
  }, [calendarVisibility, hasWorkedTogether]);

  // Bisherige Zusammenarbeit berechnen
  const collaborationHistory = useMemo(() => {
    const pastBookings = bookings.filter(b =>
      b.freelancerId === freelancer.id &&
      b.agencyId === agencyId &&
      isConfirmedStatus(b.status)
    );

    if (pastBookings.length === 0) return null;

    const sortedBookings = pastBookings.sort((a, b) => {
      const dateA = a.dates[a.dates.length - 1];
      const dateB = b.dates[b.dates.length - 1];
      return dateB.localeCompare(dateA);
    });

    const lastBooking = sortedBookings[0];
    const totalDays = pastBookings.reduce((sum, b) => sum + b.dates.length, 0);

    return {
      count: pastBookings.length,
      totalDays,
      lastDate: lastBooking.dates[lastBooking.dates.length - 1]
    };
  }, [bookings, freelancer.id, agencyId]);

  // Kalender-Vorschau (nächste 6 Wochen)
  const calendarWeeks = useMemo(() => {
    const weeks = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Montag

    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + (w * 7) + d);
        const dateStr = date.toISOString().split('T')[0];
        const status = getDayStatus(freelancer.id, dateStr, agencyId);
        const isWeekend = d === 5 || d === 6; // Sa, So

        week.push({
          date,
          dateStr,
          isWeekend,
          isToday: dateStr === today.toISOString().split('T')[0],
          isAvailable: !status.isBlocked && !status.hasBooking,
          status
        });
      }
      weeks.push(week);
    }

    return weeks;
  }, [freelancer.id, agencyId, getDayStatus]);

  const getStatusColor = (day) => {
    if (day.isWeekend) return 'bg-gray-100 dark:bg-gray-700 text-gray-400';
    if (day.status?.color === 'red') return 'bg-red-500 text-white';
    if (day.status?.color === 'yellow') return 'bg-yellow-400 text-yellow-900';
    if (day.isAvailable) return 'bg-green-500 text-white';
    return 'bg-gray-200 dark:bg-gray-600 text-gray-500';
  };

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header mit Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Zurück zur Suche</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <FavoriteButton
            freelancerId={freelancer.id}
            isFavorite={isFavorite?.(freelancer.id)}
            onToggle={onToggleFavorite}
            crewLists={crewLists}
            getListsForFreelancer={getListsForFreelancer}
            onAddToList={onAddToList}
            onRemoveFromList={onRemoveFromList}
            onOpenAddToListModal={onOpenAddToListModal}
            size="md"
          />

          <button
            onClick={() => onOpenAddToListModal?.(freelancer.id)}
            className="px-3 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ListPlus className="w-4 h-4" />
            <span className="text-sm font-medium">Zu Liste</span>
          </button>

          {/* Chat Button */}
          {getOrCreateChat && onOpenChat && (
            <StartChatButton
              targetUserId={freelancer.id}
              targetUserType="freelancer"
              targetUserName={fullName}
              targetUserAvatar={freelancer.avatar}
              currentUserId={agencyId}
              currentUserType="agency"
              currentUserName={agencyProfile?.name || 'Agentur'}
              currentUserAvatar={agencyProfile?.logo}
              variant="icon"
              size="md"
              onClick={onOpenChat}
              getOrCreateChat={getOrCreateChat}
            />
          )}

          <button
            onClick={() => onOpenBookingModal?.(freelancer)}
            className="px-4 py-2 flex items-center gap-2 bg-accent text-gray-900 rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            <Calendar className="w-4 h-4" />
            <span>Buchen</span>
          </button>
        </div>
      </div>

      {/* Profil-Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center text-3xl font-bold text-gray-700 dark:text-gray-200 flex-shrink-0">
            {freelancer.avatar || initials}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
              {freelancer.verified && (
                <CheckCircle className="w-5 h-5 text-blue-500" title="Verifiziert" />
              )}
              {freelancer.rating && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">{freelancer.rating}</span>
                </div>
              )}
            </div>

            {/* Berufe */}
            <div className="flex flex-wrap gap-2 mb-3">
              {freelancer.professions?.map(prof => (
                <span
                  key={prof}
                  className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
                >
                  {prof}
                </span>
              ))}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {visibility.address !== false && freelancer.address?.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {freelancer.address.city}{freelancer.address.country ? `, ${freelancer.address.country}` : ''}
                </span>
              )}
              {visibility.dayRate !== false && freelancer.dayRate && (
                <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                  <Euro className="w-4 h-4" />
                  {freelancer.dayRate}€/Tag
                </span>
              )}
              {freelancer.experience && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {freelancer.experience} Jahre Erfahrung
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bisherige Zusammenarbeit */}
        {collaborationHistory && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-white">{collaborationHistory.count}x</strong> gebucht
                ({collaborationHistory.totalDays} Tage), zuletzt am {formatDate(collaborationHistory.lastDate)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linke Spalte */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {visibility.bio !== false && freelancer.bio && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Über mich</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{freelancer.bio}</p>
            </div>
          )}

          {/* Skills */}
          {freelancer.skills?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {visibility.equipment !== false && freelancer.equipment?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                Equipment
              </h2>
              <div className="flex flex-wrap gap-2">
                {freelancer.equipment.map(item => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {visibility.portfolio !== false && freelancer.portfolio?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Portfolio</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {freelancer.portfolio.map(item => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-accent" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-accent">
                        {item.title || 'Link'}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rechte Spalte */}
        <div className="space-y-6">
          {/* Kalender-Vorschau */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              Verfügbarkeit
            </h2>

            {canSeeCalendar ? (
              <>
                {/* Wochentage Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Kalender-Grid */}
                <div className="space-y-1">
                  {calendarWeeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                      {week.map(day => (
                        <div
                          key={day.dateStr}
                          className={`aspect-square flex items-center justify-center rounded text-xs font-medium ${getStatusColor(day)} ${day.isToday ? 'ring-2 ring-accent ring-offset-1' : ''}`}
                          title={`${day.date.getDate()}. ${monthNames[day.date.getMonth()]} - ${day.isAvailable ? 'Verfügbar' : 'Belegt'}`}
                        >
                          {day.date.getDate()}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legende */}
                <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500" /> Verfügbar
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-400" /> Option
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500" /> Gebucht
                  </span>
                </div>

                {/* Buchen Button */}
                <button
                  onClick={() => onOpenBookingModal?.(freelancer)}
                  className="w-full mt-4 py-2.5 bg-accent text-gray-900 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  Jetzt buchen
                </button>
              </>
            ) : (
              /* Kalender nicht sichtbar */
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                  {calendarVisibility === CALENDAR_VISIBILITY.ON_REQUEST ? (
                    <Lock className="w-6 h-6 text-gray-400" />
                  ) : (
                    <Users className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  {calendarVisibility === CALENDAR_VISIBILITY.ON_REQUEST
                    ? 'Kalender nur auf Anfrage sichtbar'
                    : 'Kalender nur für bisherige Kontakte sichtbar'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Kontaktiere den Freelancer per Chat, um die Verfügbarkeit anzufragen.
                </p>
              </div>
            )}
          </div>

          {/* Sprachen */}
          {freelancer.languages?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Languages className="w-5 h-5 text-gray-400" />
                Sprachen
              </h2>
              <div className="flex flex-wrap gap-2">
                {freelancer.languages.map(lang => (
                  <span
                    key={lang}
                    className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Kontakt */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Kontakt</h2>
            <div className="space-y-3">
              {visibility.email !== false && freelancer.email && (
                <a
                  href={`mailto:${freelancer.email}`}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-accent"
                >
                  <Mail className="w-4 h-4" />
                  {freelancer.email}
                </a>
              )}
              {visibility.phone !== false && freelancer.phone && (
                <a
                  href={`tel:${freelancer.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-accent"
                >
                  <Phone className="w-4 h-4" />
                  {freelancer.phone}
                </a>
              )}
              {visibility.website !== false && freelancer.website && (
                <a
                  href={freelancer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-accent"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfileView;
