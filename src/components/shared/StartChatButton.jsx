import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * StartChatButton - Button zum Öffnen/Starten eines Chats
 */
const StartChatButton = ({
  targetUserId,
  targetUserType,
  targetUserName,
  targetUserAvatar,
  currentUserId,
  currentUserType,
  currentUserName,
  currentUserAvatar,
  variant = 'button',
  size = 'md',
  onClick,
  getOrCreateChat
}) => {
  const handleClick = () => {
    if (!getOrCreateChat || !onClick) return;

    // Chat finden oder erstellen
    let chat;
    if (currentUserType === 'agency') {
      chat = getOrCreateChat(
        currentUserId,
        currentUserName,
        currentUserAvatar,
        targetUserId,
        targetUserName,
        targetUserAvatar
      );
    } else {
      chat = getOrCreateChat(
        targetUserId,
        targetUserName,
        targetUserAvatar,
        currentUserId,
        currentUserName,
        currentUserAvatar
      );
    }

    onClick(chat.id);
  };

  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-xs gap-1',
      icon: 'w-7 h-7',
      iconSize: 'w-3.5 h-3.5'
    },
    md: {
      button: 'px-3 py-2 text-sm gap-2',
      icon: 'w-9 h-9',
      iconSize: 'w-4 h-4'
    },
    lg: {
      button: 'px-4 py-2.5 text-base gap-2',
      icon: 'w-11 h-11',
      iconSize: 'w-5 h-5'
    }
  };

  const sizeConfig = sizeClasses[size];

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`
          ${sizeConfig.icon}
          inline-flex items-center justify-center rounded-lg
          bg-blue-100 dark:bg-blue-900/30
          text-blue-600 dark:text-blue-400
          hover:bg-blue-200 dark:hover:bg-blue-900/50
          transition-colors
        `}
        title="Nachricht senden"
      >
        <MessageCircle className={sizeConfig.iconSize} />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleClick}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
      >
        Nachricht senden
      </button>
    );
  }

  // Default: button
  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeConfig.button}
        inline-flex items-center justify-center rounded-lg font-medium
        bg-blue-600 text-white hover:bg-blue-700
        transition-colors
      `}
    >
      <MessageCircle className={sizeConfig.iconSize} />
      <span>Nachricht</span>
    </button>
  );
};

export default StartChatButton;
