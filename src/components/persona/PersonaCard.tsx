'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Persona } from '@/types';
import { cn } from '@/lib/utils/formatters';

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  customDescription?: string;
  onSelect: (persona: Persona) => void;
}

export function PersonaCard({ persona, isSelected, customDescription, onSelect }: PersonaCardProps) {
  const displayDescription = persona.type === 'custom' && customDescription
    ? customDescription
    : persona.description;

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(persona)}
      className={cn(
        'relative p-6 rounded-2xl border-3 transition-all duration-300',
        'bg-white shadow-lg hover:shadow-2xl text-left w-full min-h-[200px]',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        persona.type === 'custom'
          ? 'focus:ring-purple-500 border-dashed'
          : 'focus:ring-teal-500',
        isSelected
          ? persona.type === 'custom'
            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
            : 'border-teal-500 bg-teal-50 ring-2 ring-teal-500'
          : 'border-gray-200'
      )}
    >
      {/* Emoji */}
      <div className="text-5xl mb-4">{persona.emoji}</div>

      {/* Name */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{persona.name}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed">{displayDescription}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        {persona.toneAttributes.map((attribute) => (
          <span
            key={attribute}
            className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700"
          >
            {attribute}
          </span>
        ))}
      </div>

      {/* Selected indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 bg-teal-500 rounded-full p-2 shadow-lg"
          >
            <Check className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
