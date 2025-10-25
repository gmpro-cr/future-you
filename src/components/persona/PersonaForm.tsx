'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, AlertCircle } from 'lucide-react';
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
    initialData?.systemPrompt || ''
  );
  const [nameError, setNameError] = useState('');
  const [promptError, setPromptError] = useState('');
  const [touched, setTouched] = useState({ name: false, prompt: false });

  const validateName = (value: string): string => {
    if (!value.trim()) {
      return 'Persona name is required';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (value.length > 50) {
      return 'Name must not exceed 50 characters';
    }
    return '';
  };

  const validatePrompt = (value: string): string => {
    if (!value.trim()) {
      return 'System prompt is required';
    }
    if (value.trim().length < 10) {
      return 'Prompt must be at least 10 characters for better results';
    }
    if (value.length > 1000) {
      return 'Prompt must not exceed 1000 characters';
    }
    return '';
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (touched.name) {
      setNameError(validateName(value));
    }
  };

  const handleNameBlur = () => {
    setTouched({ ...touched, name: true });
    setNameError(validateName(name));
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSystemPrompt(value);
    if (touched.prompt) {
      setPromptError(validatePrompt(value));
    }
  };

  const handlePromptBlur = () => {
    setTouched({ ...touched, prompt: true });
    setPromptError(validatePrompt(systemPrompt));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameValidationError = validateName(name);
    const promptValidationError = validatePrompt(systemPrompt);
    
    setNameError(nameValidationError);
    setPromptError(promptValidationError);
    setTouched({ name: true, prompt: true });
    
    if (!nameValidationError && !promptValidationError) {
      onSubmit({ name: name.trim(), systemPrompt: systemPrompt.trim() });
    }
  };

  const isFormValid = !validateName(name) && !validatePrompt(systemPrompt);
  const charactersRemaining = {
    name: 50 - name.length,
    prompt: 1000 - systemPrompt.length
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Persona Name */}
      <div className="space-y-2">
        <label 
          htmlFor="persona-name"
          className="block text-sm font-medium text-white"
        >
          Persona Name *
        </label>
        <input
          id="persona-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          placeholder="e.g., Tech Entrepreneur, Mindful Leader, Creative Artist"
          maxLength={50}
          aria-invalid={!!nameError}
          aria-describedby={nameError ? 'name-error' : 'name-hint'}
          className={`w-full px-4 py-2.5 sm:py-3 bg-white/10 border ${
            nameError && touched.name
              ? 'border-red-400 focus:ring-red-400/50'
              : 'border-white/20 focus:ring-white/50'
          } text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
        />
        {nameError && touched.name && (
          <div id="name-error" className="flex items-center gap-1.5 text-red-400 text-sm" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{nameError}</span>
          </div>
        )}
        {!nameError && (
          <p id="name-hint" className="text-xs text-white/50">
            {charactersRemaining.name} characters remaining
          </p>
        )}
      </div>

      {/* System Prompt */}
      <div className="space-y-2">
        <label 
          htmlFor="persona-prompt"
          className="block text-sm font-medium text-white"
        >
          System Prompt * 
          <span className="text-xs text-white/50 font-normal ml-1.5">
            (Instructions for the AI)
          </span>
        </label>
        <textarea
          id="persona-prompt"
          value={systemPrompt}
          onChange={handlePromptChange}
          onBlur={handlePromptBlur}
          placeholder="Describe how this persona should respond. Be specific about personality traits, speaking style, tone, and unique characteristics. Example: 'You are a thoughtful tech entrepreneur who speaks with enthusiasm about innovation...'"
          rows={6}
          maxLength={1000}
          aria-invalid={!!promptError}
          aria-describedby={promptError ? 'prompt-error' : 'prompt-hint'}
          className={`w-full px-4 py-2.5 sm:py-3 bg-white/10 border ${
            promptError && touched.prompt
              ? 'border-red-400 focus:ring-red-400/50'
              : 'border-white/20 focus:ring-white/50'
          } text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-colors`}
        />
        {promptError && touched.prompt && (
          <div id="prompt-error" className="flex items-center gap-1.5 text-red-400 text-sm" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{promptError}</span>
          </div>
        )}
        {!promptError && (
          <div id="prompt-hint" className="space-y-1">
            <p className="text-xs text-white/50">
              {charactersRemaining.prompt} characters remaining
            </p>
            <p className="text-xs text-white/60">
              <strong className="text-white/80">Tip:</strong> Include personality traits, speaking style, example phrases, and unique characteristics. The more detailed and specific, the better the AI will embody this persona.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 py-2.5 sm:py-2"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid}
          variant="primary"
          className="flex-1 bg-white text-gray-900 hover:bg-white/90 disabled:bg-white/30 disabled:text-white/50 disabled:cursor-not-allowed font-medium py-2.5 sm:py-2 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          {initialData ? 'Update Persona' : 'Create Persona'}
        </Button>
      </div>
    </motion.form>
  );
}
