import React, { useState, useRef, useEffect } from 'react';
import { Send, CalendarPlus } from 'lucide-react';

/**
 * ChatInput - Eingabebereich für Chat
 */
const ChatInput = ({
  onSendMessage,
  onOpenBookingFlow,
  showBookingButton = false
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 100; // ~3 Zeilen
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-start gap-2">
        {/* Booking Button */}
        {showBookingButton && (
          <button
            onClick={onOpenBookingFlow}
            className="flex-shrink-0 h-[42px] w-[42px] flex items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            title="Buchung erstellen"
            aria-label="Buchung erstellen"
          >
            <CalendarPlus className="w-5 h-5" aria-hidden="true" />
          </button>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nachricht schreiben..."
          rows={1}
          className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden leading-[22px]"
          style={{ minHeight: '42px' }}
          aria-label="Nachricht schreiben"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="flex-shrink-0 h-[42px] w-[42px] flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Nachricht senden"
        >
          <Send className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Hilfetext */}
      <p className="text-xs text-gray-400 mt-2 pl-1">
        Enter zum Senden, Shift+Enter für neue Zeile
      </p>
    </div>
  );
};

export default ChatInput;
