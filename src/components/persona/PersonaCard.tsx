'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit2, MessageCircle } from 'lucide-react';
import { Persona } from '@/types';
import { generatePersonaAvatar, suggestAvatarStyle } from '@/lib/utils/avatarGenerator';

interface PersonaCardProps {
  persona: Persona;
  onSelect: (persona: Persona) => void;
  onEdit?: (persona: Persona) => void;
  onDelete?: (persona: Persona) => void;
}

export function PersonaCard({ persona, onSelect, onEdit, onDelete }: PersonaCardProps) {
  // Use stored avatar or generate a new one
  const avatarUrl = persona.avatarUrl || generatePersonaAvatar(
    persona.name,
    suggestAvatarStyle(persona.name, persona.description)
  );

  console.log('PersonaCard render:', {
    name: persona.name,
    hasStoredAvatar: !!persona.avatarUrl,
    avatarUrl: avatarUrl
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 hover:bg-white/15 transition-all"
    >
      {/* Avatar & Name & Description */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center border-2 border-white/30 bg-gradient-to-br from-white/20 to-white/5 relative overflow-hidden shadow-lg">
          <img
            src={avatarUrl}
            alt={persona.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              console.error('❌ Failed to load avatar:', avatarUrl);
              const target = e.currentTarget;
              target.style.display = 'none';
              // Show fallback emoji/initial
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'fallback text-3xl font-bold text-white flex items-center justify-center w-full h-full';
                fallback.textContent = persona.emoji || persona.name.charAt(0).toUpperCase();
                parent.appendChild(fallback);
              }
            }}
            onLoad={() => console.log('✅ Avatar loaded:', avatarUrl)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">{persona.name}</h3>
          <p className="text-xs text-white/70 mt-1 line-clamp-2">{persona.description}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 justify-between">
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(persona)}
              className="p-2 hover:bg-white/20 border border-white/30 rounded-lg transition-colors"
              title="Edit persona"
            >
              <Edit2 className="w-4 h-4 text-white" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(persona)}
              className="p-2 hover:bg-white/20 border border-white/30 rounded-lg transition-colors"
              title="Delete persona"
            >
              <Trash2 className="w-4 h-4 text-white/70" />
            </button>
          )}
        </div>
        <button
          onClick={() => onSelect(persona)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black rounded-lg text-sm font-medium transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
      </div>
    </motion.div>
  );
}
