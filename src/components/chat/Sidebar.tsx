'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { Persona } from '@/types';
import { Button } from '@/components/shared/Button';

interface SidebarProps {
  persona: Persona;
  onNewChat: () => void;
  onChangePersona: () => void;
  messageCount: number;
}

export function Sidebar({ persona, onNewChat, onChangePersona, messageCount }: SidebarProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 border-r border-gray-200 bg-white flex flex-col"
    >
      {/* Persona Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center text-center">
          <div className="text-6xl mb-4">{persona.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{persona.name}</h2>
          <p className="text-sm text-gray-600 mb-4">{persona.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-center">
            {persona.toneAttributes.map((attribute) => (
              <span
                key={attribute}
                className="text-xs px-3 py-1 rounded-full bg-teal-100 text-teal-700"
              >
                {attribute}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-600">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">
            {messageCount} {messageCount === 1 ? 'message' : 'messages'} in this conversation
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 space-y-3 flex-1">
        <Button variant="outline" onClick={onNewChat} className="w-full justify-start">
          <RotateCcw className="w-4 h-4 mr-2" />
          New Chat
        </Button>

        <Button variant="ghost" onClick={onChangePersona} className="w-full justify-start">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Change Persona
        </Button>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Esperit v1.0
          <br />
          Privacy-first AI conversations
        </p>
      </div>
    </motion.div>
  );
}
