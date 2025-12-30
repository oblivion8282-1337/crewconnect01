import React from 'react';

/**
 * MessageBubble - Standard-Textnachricht
 */
const MessageBubble = ({
  message,
  isOwn,
  showSender = false
}) => {
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-2
          ${isOwn
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
          }
        `}
      >
        {showSender && !isOwn && (
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {message.senderName}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <p className={`text-xs mt-1 text-right ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
