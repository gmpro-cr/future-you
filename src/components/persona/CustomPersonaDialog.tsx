'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/shared/Button';

interface CustomPersonaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void;
}

export function CustomPersonaDialog({ isOpen, onClose, onSubmit }: CustomPersonaDialogProps) {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (description.trim().length < 20) {
      setError('Please provide at least 20 characters to describe your future self');
      return;
    }

    if (description.trim().length > 300) {
      setError('Please keep your description under 300 characters');
      return;
    }

    onSubmit(description.trim());
    setDescription('');
    setError('');
  };

  const handleClose = () => {
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6" />
                <h3 className="text-2xl font-bold">Create Your Own Future Self</h3>
              </div>
              <p className="text-purple-100 text-sm">
                Describe who you want to become in 10 years
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Examples */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Example Descriptions:
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="pl-4 border-l-2 border-purple-300">
                "I'm a world-renowned chef who owns 3 Michelin-star restaurants in Mumbai and Paris.
                I've mastered Indian-French fusion cuisine and mentor young chefs."
              </p>
              <p className="pl-4 border-l-2 border-indigo-300">
                "I'm a tech entrepreneur who built an AI company valued at $1B. I live in Bangalore,
                work 4 days a week, and spend weekends doing wildlife photography."
              </p>
              <p className="pl-4 border-l-2 border-purple-300">
                "I'm a bestselling author who writes about Indian mythology. I've published 8 novels,
                travel the world for book tours, and teach creative writing workshops."
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
            <h4 className="font-semibold text-gray-900 mb-3">💡 Tips for a Great Description:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Be specific:</strong> Include your profession, achievements, and lifestyle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Use first person:</strong> Write as "I'm..." or "I've become..."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Add personality:</strong> What kind of person are you? Bold? Calm? Creative?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Be aspirational:</strong> Describe your dream life 10 years from now</span>
              </li>
            </ul>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Future Self (20-300 characters)
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError('');
              }}
              placeholder="I'm a successful..."
              className="w-full h-32 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all resize-none"
              maxLength={300}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {description.length}/300 characters
                {description.length < 20 && description.length > 0 && (
                  <span className="text-amber-600 ml-2">
                    • Need {20 - description.length} more
                  </span>
                )}
              </span>
              {description.length >= 20 && (
                <span className="text-xs text-green-600 font-medium">✓ Ready to submit</span>
              )}
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={description.trim().length < 20}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create My Future Self
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
