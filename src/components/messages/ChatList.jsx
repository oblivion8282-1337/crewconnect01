import React, { useState, useMemo } from 'react';
import { Search, MessageCircle, Calendar, FileText } from 'lucide-react';
import { MESSAGE_TYPES } from '../../hooks/useMessages';
import { ProfileAvatar } from '../shared/ProfileField';

/**
 * ChatList - Übersicht aller Chats
 */
const ChatList = ({
  chats,
  currentUserId,
  currentUserType,
  onSelectChat,
  searchQuery: externalSearchQuery,
  onSearchChange
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  const isAgency = currentUserType === 'agency';

  // Gefilterte Chats
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    const query = searchQuery.toLowerCase();
    return chats.filter(chat => {
      const searchName = isAgency ? chat.freelancerName : chat.agencyName;
      return searchName.toLowerCase().includes(query);
    });
  }, [chats, searchQuery, isAgency]);

  const handleSearchChange = (value) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchQuery(value);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `${diffMins} Min.`;
    if (diffHours < 24) return `${diffHours} Std.`;
    if (diffDays < 7) return `${diffDays} Tagen`;
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  const getLastMessagePreview = (chat) => {
    if (chat.messages.length === 0) return 'Keine Nachrichten';

    const lastMsg = chat.messages[chat.messages.length - 1];
    const prefix = lastMsg.senderType === currentUserType ? 'Du: ' : '';

    switch (lastMsg.type) {
      case MESSAGE_TYPES.AVAIL_CHECK:
        return `${prefix}📅 Verfügbarkeitsanfrage`;
      case MESSAGE_TYPES.BOOKING_REF:
        return `${prefix}📋 Buchung: ${lastMsg.bookingRef?.projectName || 'Projekt'}`;
      default:
        const text = lastMsg.text || '';
        return `${prefix}${text.length > 50 ? text.substring(0, 50) + '...' : text}`;
    }
  };

  const getUnreadCount = (chat) => {
    return isAgency ? chat.unreadCountAgency : chat.unreadCountFreelancer;
  };

  if (chats.length === 0 && !searchQuery) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Noch keine Nachrichten
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {isAgency
            ? 'Starte einen Chat mit einem Freelancer aus der Suche.'
            : 'Du erhältst hier Nachrichten von Agenturen.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Suchfeld */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Chats durchsuchen..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Chat-Liste */}
      <div className="space-y-2">
        {filteredChats.map(chat => {
          const otherName = isAgency ? chat.freelancerName : chat.agencyName;
          const otherProfileImage = isAgency ? chat.freelancerProfileImage : chat.agencyProfileImage;
          const nameParts = otherName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          const unreadCount = getUnreadCount(chat);
          const hasUnread = unreadCount > 0;

          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`
                w-full p-4 flex items-start gap-3 rounded-xl transition-colors text-left
                ${hasUnread
                  ? 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 border-primary/20'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                }
                border
              `}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <ProfileAvatar
                  imageUrl={otherProfileImage}
                  firstName={firstName}
                  lastName={lastName}
                  size="sm"
                  className="w-12 h-12 text-base"
                />
                {hasUnread && (
                  <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`font-medium truncate ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {otherName}
                  </h4>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {formatTimeAgo(chat.lastMessageAt)}
                  </span>
                </div>
                <p className={`text-sm truncate ${hasUnread ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                  {getLastMessagePreview(chat)}
                </p>
              </div>
            </button>
          );
        })}

        {filteredChats.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Keine Chats gefunden für "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
