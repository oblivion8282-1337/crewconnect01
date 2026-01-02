import { useState, useCallback, useMemo } from 'react';

/**
 * Nachrichtentypen
 */
export const MESSAGE_TYPES = {
  TEXT: 'text',
  BOOKING_REF: 'booking_ref'
};

/**
 * Initiale Demo-Daten
 */
const INITIAL_CHATS = [
  {
    id: 'chat-1',
    agencyId: 1,
    agencyName: 'Bluescreen Productions',
    agencyProfileImage: null,
    freelancerId: 1,
    freelancerName: 'Anna Schmidt',
    freelancerProfileImage: null,
    lastMessageAt: '2025-01-28T14:30:00Z',
    unreadCountAgency: 1,
    unreadCountFreelancer: 0,
    messages: [
      {
        id: 'msg-1',
        type: MESSAGE_TYPES.TEXT,
        senderId: 1,
        senderType: 'agency',
        senderName: 'Bluescreen Productions',
        text: 'Hallo Anna! Wir planen einen Werbespot für Mercedes im Januar. Hättest du Interesse?',
        createdAt: '2025-01-28T10:00:00Z',
        readAt: '2025-01-28T10:15:00Z'
      },
      {
        id: 'msg-2',
        type: MESSAGE_TYPES.TEXT,
        senderId: 1,
        senderType: 'freelancer',
        senderName: 'Anna Schmidt',
        text: 'Hi! Klingt super spannend. Was sind die Details?',
        createdAt: '2025-01-28T14:30:00Z',
        readAt: null
      }
    ],
    createdAt: '2025-01-28T10:00:00Z'
  },
  {
    id: 'chat-2',
    agencyId: 1,
    agencyName: 'Bluescreen Productions',
    agencyProfileImage: null,
    freelancerId: 2,
    freelancerName: 'Max Weber',
    freelancerProfileImage: null,
    lastMessageAt: '2025-01-27T16:00:00Z',
    unreadCountAgency: 0,
    unreadCountFreelancer: 0,
    messages: [
      {
        id: 'msg-3',
        type: MESSAGE_TYPES.TEXT,
        senderId: 1,
        senderType: 'agency',
        senderName: 'Bluescreen Productions',
        text: 'Hi Max, bist du im Februar für einen Edit verfügbar?',
        createdAt: '2025-01-27T14:00:00Z',
        readAt: '2025-01-27T15:00:00Z'
      },
      {
        id: 'msg-4',
        type: MESSAGE_TYPES.BOOKING_REF,
        senderId: 1,
        senderType: 'agency',
        senderName: 'Bluescreen Productions',
        text: 'Ich habe dir eine Buchungsanfrage geschickt!',
        createdAt: '2025-01-27T16:00:00Z',
        readAt: '2025-01-27T16:30:00Z',
        bookingRef: {
          bookingId: 5,
          projectName: 'Imagefilm BMW',
          dates: ['2025-02-20', '2025-02-21', '2025-02-22'],
          status: 'option_confirmed',
          type: 'option'
        }
      }
    ],
    createdAt: '2025-01-27T14:00:00Z'
  }
];

/**
 * useMessages - Hook für das Messaging-System
 */
export const useMessages = () => {
  const [chats, setChats] = useState(INITIAL_CHATS);

  /**
   * Hilfsfunktion: Eindeutige ID generieren
   */
  const generateId = useCallback((prefix) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // === Chat-Funktionen ===

  /**
   * Chat finden oder erstellen
   */
  const getOrCreateChat = useCallback((agencyId, agencyName, agencyProfileImage, freelancerId, freelancerName, freelancerProfileImage) => {
    // Suche bestehenden Chat
    const existingChat = chats.find(c =>
      c.agencyId === agencyId && c.freelancerId === freelancerId
    );

    if (existingChat) {
      return existingChat;
    }

    // Neuen Chat erstellen
    const now = new Date().toISOString();
    const newChat = {
      id: generateId('chat'),
      agencyId,
      agencyName,
      agencyProfileImage: agencyProfileImage || null,
      freelancerId,
      freelancerName,
      freelancerProfileImage: freelancerProfileImage || null,
      lastMessageAt: now,
      unreadCountAgency: 0,
      unreadCountFreelancer: 0,
      messages: [],
      createdAt: now
    };

    setChats(prev => [newChat, ...prev]);
    return newChat;
  }, [chats, generateId]);

  /**
   * Chat by ID holen
   */
  const getChatById = useCallback((chatId) => {
    return chats.find(c => c.id === chatId) || null;
  }, [chats]);

  /**
   * Chats für Agentur
   */
  const getChatsForAgency = useCallback((agencyId) => {
    return chats
      .filter(c => c.agencyId === agencyId)
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  }, [chats]);

  /**
   * Chats für Freelancer
   */
  const getChatsForFreelancer = useCallback((freelancerId) => {
    return chats
      .filter(c => c.freelancerId === freelancerId)
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  }, [chats]);

  /**
   * Ungelesene Nachrichten zählen
   */
  const getUnreadCount = useCallback((userId, userType) => {
    return chats.reduce((sum, chat) => {
      if (userType === 'agency' && chat.agencyId === userId) {
        return sum + chat.unreadCountAgency;
      }
      if (userType === 'freelancer' && chat.freelancerId === userId) {
        return sum + chat.unreadCountFreelancer;
      }
      return sum;
    }, 0);
  }, [chats]);

  /**
   * Chat als gelesen markieren
   */
  const markChatAsRead = useCallback((chatId, userType) => {
    const now = new Date().toISOString();

    setChats(prev => prev.map(chat => {
      if (chat.id !== chatId) return chat;

      const updatedMessages = chat.messages.map(msg => {
        // Nur Nachrichten des anderen Teilnehmers als gelesen markieren
        if (msg.senderType !== userType && !msg.readAt) {
          return { ...msg, readAt: now };
        }
        return msg;
      });

      return {
        ...chat,
        messages: updatedMessages,
        ...(userType === 'agency'
          ? { unreadCountAgency: 0 }
          : { unreadCountFreelancer: 0 }
        )
      };
    }));
  }, []);

  /**
   * Alle Nachrichten als gelesen markieren
   */
  const markAllMessagesAsRead = useCallback((userType) => {
    const now = new Date().toISOString();

    setChats(prev => prev.map(chat => {
      const updatedMessages = chat.messages.map(msg => {
        // Nur Nachrichten des anderen Teilnehmers als gelesen markieren
        if (msg.senderType !== userType && !msg.readAt) {
          return { ...msg, readAt: now };
        }
        return msg;
      });

      return {
        ...chat,
        messages: updatedMessages,
        ...(userType === 'agency'
          ? { unreadCountAgency: 0 }
          : { unreadCountFreelancer: 0 }
        )
      };
    }));
  }, []);

  // === Nachrichten-Funktionen ===

  /**
   * Text-Nachricht senden
   */
  const sendMessage = useCallback((chatId, senderId, senderType, senderName, text) => {
    const now = new Date().toISOString();
    const newMessage = {
      id: generateId('msg'),
      type: MESSAGE_TYPES.TEXT,
      senderId,
      senderType,
      senderName,
      text,
      createdAt: now,
      readAt: null
    };

    setChats(prev => prev.map(chat => {
      if (chat.id !== chatId) return chat;

      return {
        ...chat,
        messages: [...chat.messages, newMessage],
        lastMessageAt: now,
        ...(senderType === 'agency'
          ? { unreadCountFreelancer: chat.unreadCountFreelancer + 1 }
          : { unreadCountAgency: chat.unreadCountAgency + 1 }
        )
      };
    }));

    return newMessage;
  }, [generateId]);

  /**
   * Buchungs-Referenz senden
   */
  const sendBookingRef = useCallback((chatId, senderId, senderType, senderName, text, bookingData) => {
    const now = new Date().toISOString();

    const newMessage = {
      id: generateId('msg'),
      type: MESSAGE_TYPES.BOOKING_REF,
      senderId,
      senderType,
      senderName,
      text,
      createdAt: now,
      readAt: null,
      bookingRef: {
        bookingId: bookingData.bookingId,
        projectName: bookingData.projectName,
        dates: bookingData.dates,
        status: bookingData.status,
        type: bookingData.type
      }
    };

    setChats(prev => prev.map(chat => {
      if (chat.id !== chatId) return chat;

      return {
        ...chat,
        messages: [...chat.messages, newMessage],
        lastMessageAt: now,
        ...(senderType === 'agency'
          ? { unreadCountFreelancer: chat.unreadCountFreelancer + 1 }
          : { unreadCountAgency: chat.unreadCountAgency + 1 }
        )
      };
    }));

    return newMessage;
  }, [generateId]);

  /**
   * Buchungs-Referenz Status aktualisieren
   */
  const updateBookingRefStatus = useCallback((chatId, bookingId, newStatus) => {
    setChats(prev => prev.map(chat => {
      if (chat.id !== chatId) return chat;

      const updatedMessages = chat.messages.map(msg => {
        if (msg.type !== MESSAGE_TYPES.BOOKING_REF) return msg;
        if (msg.bookingRef?.bookingId !== bookingId) return msg;

        return {
          ...msg,
          bookingRef: {
            ...msg.bookingRef,
            status: newStatus
          }
        };
      });

      return {
        ...chat,
        messages: updatedMessages
      };
    }));
  }, []);

  /**
   * Chat für Buchung finden (für automatische Updates)
   */
  const findChatForBooking = useCallback((agencyId, freelancerId) => {
    return chats.find(c =>
      c.agencyId === agencyId && c.freelancerId === freelancerId
    );
  }, [chats]);

  return {
    chats,
    // Chat-Funktionen
    getOrCreateChat,
    getChatById,
    getChatsForAgency,
    getChatsForFreelancer,
    getUnreadCount,
    markChatAsRead,
    markAllMessagesAsRead,
    // Nachrichten-Funktionen
    sendMessage,
    sendBookingRef,
    updateBookingRefStatus,
    findChatForBooking
  };
};
