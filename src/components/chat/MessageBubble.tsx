'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/types';
import { cn } from '@/lib/utils/formatters';
import { formatTimestamp } from '@/lib/utils/formatters';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className="max-w-[75%] sm:max-w-[70%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-md',
            isUser
              ? 'bg-white text-gray-900 rounded-br-sm'
              : 'bg-gradient-to-r from-teal-500 to-indigo-500 text-white rounded-bl-sm'
          )}
        >
          <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
            {message.content}
          </p>
        </div>
        <p
          className={cn(
            'text-xs text-gray-500 mt-1 px-2',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}
