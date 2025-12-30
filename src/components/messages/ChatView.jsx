import React, { useRef, useEffect } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import MessageBubble from './MessageBubble';
import BookingRefMessage from './BookingRefMessage';
import ChatInput from './ChatInput';
import { MESSAGE_TYPES } from '../../hooks/useMessages';

/**
 * ChatView - Einzelner Chat-Thread
 */
const ChatView = ({
  chat,
  currentUserId,
  currentUserType,
  onSendMessage,
  onOpenBookingFlow,
  onOpenBooking,
  onBack,
  onOpenProfile,
  onMarkAsRead
}) => {
  const messagesEndRef = useRef(null);

  // Anderen Teilnehmer bestimmen
  const isAgency = currentUserType === 'agency';
  const otherName = isAgency ? chat?.freelancerName : chat?.agencyName;
  const otherAvatar = isAgency ? chat?.freelancerAvatar : chat?.agencyLogo;

  // Auto-scroll zu neuester Nachricht
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Als gelesen markieren bei Mount (nur bei Chat-Wechsel)
  useEffect(() => {
    if (chat?.id && onMarkAsRead) {
      onMarkAsRead(chat.id, currentUserType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?.id]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Chat nicht gefunden</p>
      </div>
    );
  }

  // Nachrichten nach Datum gruppieren
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.createdAt);
      const dateKey = date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return groups;
  };

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Heute';
    if (date.toDateString() === yesterday.toDateString()) return 'Gestern';
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const groupedMessages = groupMessagesByDate(chat.messages);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-lg">
              {otherAvatar || <User className="w-5 h-5 text-gray-400" />}
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 dark:text-white">{otherName}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAgency ? 'Freelancer' : 'Agentur'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Nachrichten */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {Object.entries(groupedMessages).map(([dateKey, messages]) => (
          <div key={dateKey}>
            {/* Datum-Trenner */}
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                {formatDateLabel(messages[0].createdAt)}
              </span>
            </div>

            {/* Nachrichten des Tages */}
            <div className="space-y-3">
              {messages.map((msg, index) => {
                const isOwn = msg.senderType === currentUserType;
                const showSender = index === 0 ||
                  messages[index - 1].senderType !== msg.senderType;

                if (msg.type === MESSAGE_TYPES.BOOKING_REF) {
                  return (
                    <BookingRefMessage
                      key={msg.id}
                      message={msg}
                      isOwn={isOwn}
                      onOpenBooking={onOpenBooking}
                    />
                  );
                }

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={isOwn}
                    showSender={showSender}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {chat.messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Noch keine Nachrichten. Starte die Unterhaltung!
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Eingabebereich */}
      <ChatInput
        onSendMessage={onSendMessage}
        onOpenBookingFlow={onOpenBookingFlow}
        showBookingButton={isAgency}
      />
    </div>
  );
};

export default ChatView;
