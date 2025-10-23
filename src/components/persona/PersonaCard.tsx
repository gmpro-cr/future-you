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
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-all"
    >
      {/* Avatar & Name & Description */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-24 h-24 rounded-2xl flex-shrink-0 flex items-center justify-center border-3 border-white/30 bg-white/10 relative overflow-hidden shadow-xl">
          <img
            src={avatarUrl}
            alt={persona.name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('❌ Failed to load avatar:', avatarUrl);
              const target = e.currentTarget;
              target.style.display = 'none';
              // Show fallback emoji/initial
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'fallback text-4xl font-bold text-white';
                fallback.textContent = persona.emoji || persona.name.charAt(0).toUpperCase();
                parent.appendChild(fallback);
              }
            }}
            onLoad={() => console.log('✅ Avatar loaded:', avatarUrl)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate">{persona.name}</h3>
          <p className="text-sm text-white/70 mt-2 line-clamp-3">{persona.description}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onSelect(persona)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black rounded-lg text-sm font-medium transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
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
    </motion.div>
  );
}
