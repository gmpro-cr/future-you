'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit2, MessageCircle } from 'lucide-react';
import { Persona } from '@/types';
import { getPersonaAvatar, getPersonaColor } from '@/lib/utils/personaAvatars';

interface PersonaCardProps {
  persona: Persona;
  onSelect: (persona: Persona) => void;
  onEdit?: (persona: Persona) => void;
  onDelete?: (persona: Persona) => void;
}

export function PersonaCard({ persona, onSelect, onEdit, onDelete }: PersonaCardProps) {
  const avatarUrl = getPersonaAvatar(persona.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
    >
      {/* Avatar & Name & Description */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border-2 border-gray-200">
          <img
            src={avatarUrl}
            alt={persona.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{persona.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{persona.description}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onSelect(persona)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(persona)}
            className="p-2 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
            title="Edit persona"
          >
            <Edit2 className="w-4 h-4 text-black" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(persona)}
            className="p-2 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
            title="Delete persona"
          >
            <Trash2 className="w-4 h-4 text-gray-700" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
