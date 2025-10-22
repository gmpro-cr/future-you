'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { ArrowRight, Sparkles, LogIn } from 'lucide-react';

interface HeroSectionProps {
  onCTAClick: () => void;
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  const router = useRouter();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-white relative"
    >
      {/* Login button in top right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-6 right-6"
      >
        <Button
          onClick={() => router.push('/auth/signin')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </motion.div>
      <div className="max-w-4xl mx-auto text-center">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-black/5 border border-gray-200 px-4 py-2 rounded-full text-black text-sm mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Discover Your Potential Through Conversation</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 font-heading"
        >
          Talk to Your{' '}
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-gray-600 underline decoration-4 decoration-gray-300"
          >
            Future Self
          </motion.span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed"
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
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-gray-600"
        >
          {[
            { label: 'Custom Personas', description: 'Create your own unique personas' },
            { label: 'AI-Powered Insights', description: 'Deep, personalized conversations' },
            { label: 'Privacy First', description: 'Your journey stays yours' },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <h3 className="font-semibold text-black mb-1">{feature.label}</h3>
              <p className="text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
