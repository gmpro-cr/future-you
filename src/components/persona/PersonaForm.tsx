'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/shared/Button';

interface PersonaFormProps {
  onSubmit: (persona: {
    name: string;
    description: string;
    systemPrompt: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    description: string;
    systemPrompt: string;
  };
}

export function PersonaForm({ onSubmit, onCancel, initialData }: PersonaFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(
    initialData?.systemPrompt || "You are the user's future self who has achieved their goals. Speak in first person, sharing wisdom from your journey. Keep responses conversational and insightful, typically 2-4 sentences unless asked for details."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim() && systemPrompt.trim()) {
      onSubmit({ name: name.trim(), description: description.trim(), systemPrompt: systemPrompt.trim() });
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 max-w-2xl w-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Persona</h2>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Persona Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Tech Entrepreneur, Mindful Leader, Artist"
            required
            maxLength={50}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description *
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this future self"
            required
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt * <span className="text-xs text-gray-500">(Instructions for the AI)</span>
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Describe how this persona should respond..."
            required
            rows={6}
            maxLength={1000}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Use first person ("I am...") to define the persona's character and speaking style.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!name.trim() || !description.trim() || !systemPrompt.trim()}
          className="flex-1 bg-black hover:bg-gray-800 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Persona
        </Button>
      </div>
    </motion.form>
  );
}
