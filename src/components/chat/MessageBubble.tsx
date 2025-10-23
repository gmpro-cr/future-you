'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/types';
import { cn } from '@/lib/utils/formatters';
import { formatTimestamp } from '@/lib/utils/formatters';

interface MessageBubbleProps {
  message: Message;
  personaAvatar?: string;
  personaName?: string;
}

export function MessageBubble({ message, personaAvatar, personaName }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className={cn('flex gap-2 max-w-[75%] sm:max-w-[70%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {/* Avatar for assistant messages */}
        {!isUser && personaAvatar && (
          <img
            src={personaAvatar}
            alt={personaName || 'Assistant'}
            className="w-12 h-12 rounded-xl border-2 border-white/30 flex-shrink-0 mt-1 shadow-md object-cover"
            crossOrigin="anonymous"
          />
        )}

        <div className="flex-1">
          <div
            className={cn(
              'rounded-2xl px-4 py-3 shadow-sm',
              isUser
                ? 'bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-br-sm'
                : 'bg-white/5 backdrop-blur-xl border border-white/20 text-white rounded-bl-sm'
            )}
          >
            <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
              {message.content}
            </p>
          </div>
          <p
            className={cn(
              'text-xs text-white/50 mt-1 px-2',
              isUser ? 'text-right' : 'text-left'
            )}
          >
            {formatTimestamp(message.timestamp)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
