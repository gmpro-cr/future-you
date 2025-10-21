'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/shared/Button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onCTAClick: () => void;
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-500 via-teal-600 to-indigo-600"
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Discover Your Potential Through Conversation</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-heading"
        >
          Talk to Your{' '}
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400"
          >
            Future Self
          </motion.span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Explore personal growth through meaningful conversations with AI personas representing your
          aspirational future. Get guidance on career, life balance, and purpose.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button onClick={onCTAClick} size="lg" className="group shadow-2xl">
            Start Your Journey
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-white/80"
        >
          {[
            { label: '7 Unique Personas', description: 'From Entrepreneur to Mindful' },
            { label: 'AI-Powered Insights', description: 'Deep, personalized conversations' },
            { label: 'Privacy First', description: 'Your journey stays yours' },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-center"
            >
              <h3 className="font-semibold text-white mb-1">{feature.label}</h3>
              <p className="text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
