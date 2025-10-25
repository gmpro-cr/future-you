'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/shared/Button';

interface PersonaFormProps {
  onSubmit: (persona: {
    name: string;
    systemPrompt: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    systemPrompt: string;
  };
}

export function PersonaForm({ onSubmit, onCancel, initialData }: PersonaFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [systemPrompt, setSystemPrompt] = useState(
    initialData?.systemPrompt || 'Persona Description'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && systemPrompt.trim()) {
      onSubmit({ name: name.trim(), systemPrompt: systemPrompt.trim() });
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="backdrop-blur-xl bg-black/60 rounded-3xl p-8 shadow-2xl border border-white/20 max-w-2xl w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {initialData ? 'Edit Persona' : 'Create Your Persona'}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Persona Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Tech Entrepreneur, Mindful Leader, Artist"
            required
            maxLength={50}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
          />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            System Prompt * <span className="text-xs text-white/50">(Instructions for the AI)</span>
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Describe how this persona should respond..."
            required
            rows={6}
            maxLength={1000}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none"
          />
          <p className="text-xs text-white/50 mt-1">
            <strong>Important:</strong> Be VERY specific! Include personality traits, speaking style, example phrases, and unique characteristics. The more detailed, the better the AI will stay in character.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white/10 border-2 border-white/20 text-white hover:bg-white/20"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!name.trim() || !systemPrompt.trim()}
          className="flex-1 bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 font-medium"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Persona
        </Button>
      </div>
    </motion.form>
  );
}
