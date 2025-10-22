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
    <div className="bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center gap-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            disabled={disabled || isLoading}
            maxLength={maxCharacters}
            rows={1}
            className={cn(
              'flex-1 resize-none rounded-2xl border border-gray-200',
              'px-4 py-3 focus:outline-none focus:ring-2',
              'focus:ring-gray-300 focus:border-transparent bg-white',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'max-h-32 overflow-y-auto text-sm sm:text-base'
            )}
          />

          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading || disabled}
            size="sm"
            className="rounded-xl self-end"
          >
            {isLoading ? (
              <span className="text-sm">Sending...</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Helper text */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
