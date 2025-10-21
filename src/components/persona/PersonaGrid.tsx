'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Persona } from '@/types';
import { PersonaCard } from './PersonaCard';
import { Button } from '@/components/shared/Button';

interface PersonaGridProps {
  personas: Persona[];
  selectedPersona: Persona | null;
  onPersonaSelect: (persona: Persona) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function PersonaGrid({
  personas,
  selectedPersona,
  onPersonaSelect,
  onContinue,
  onBack,
}: PersonaGridProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-heading">
            Choose Your Future Self
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a persona that resonates with your aspirations. Each represents a different path
            your future could take.
          </p>
        </motion.div>

        {/* Persona Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {personas.map((persona, index) => (
            <motion.div
              key={persona.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <PersonaCard
                persona={persona}
                isSelected={selectedPersona?.type === persona.type}
                onSelect={onPersonaSelect}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
          <Button
            onClick={onContinue}
            disabled={!selectedPersona}
            className="w-full sm:w-auto min-w-[200px]"
            size="lg"
          >
            Continue to Chat
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

        {/* Helper text */}
        {!selectedPersona && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-gray-500 text-sm mt-6"
          >
            Select a persona to continue
          </motion.p>
        )}
      </div>
    </div>
  );
}
