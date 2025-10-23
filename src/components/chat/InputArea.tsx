'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { APP_CONFIG } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/formatters';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function InputArea({ onSendMessage, isLoading, disabled = false }: InputAreaProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !isLoading && !disabled) {
      onSendMessage(trimmed);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 128; // max-h-32 in pixels (4 lines * 32px)
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [message]);

  const characterCount = message.length;
  const maxCharacters = APP_CONFIG.MAX_MESSAGE_LENGTH;
  const isNearLimit = characterCount > maxCharacters * 0.9;

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 focus-within:ring-2 focus-within:ring-white/50 focus-within:border-transparent">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={disabled || isLoading}
            maxLength={maxCharacters}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent',
              'px-4 py-2.5 focus:outline-none',
              'disabled:cursor-not-allowed',
              'max-h-32 overflow-y-auto text-sm sm:text-base text-white placeholder-white/50'
            )}
          />

          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading || disabled}
            className={cn(
              'p-2 m-1 rounded-lg transition-all flex-shrink-0',
              !message.trim() || isLoading || disabled
                ? 'bg-white/20 text-white/50 cursor-not-allowed'
                : 'bg-white text-black hover:bg-white/90'
            )}
          >
            {isLoading ? (
              <span className="text-xs px-1">...</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Helper text */}
        <p className="text-xs text-white/50 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
