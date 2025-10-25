'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/Button';
import { ArrowRight, Sparkles, LogIn, UserCircle } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto text-center w-full">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-black/5 border border-gray-200 px-4 py-2 rounded-full text-black text-sm mb-6 sm:mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Discover Your Potential Through Conversation</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-black leading-tight"
        >
          Connect with Your
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {' '}Future Self
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed px-4"
        >
          Explore personal growth through meaningful conversations with AI personas representing your
          aspirational future. Get guidance on career, life balance, and purpose.
        </motion.p>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mb-12 sm:mb-16"
        >
          {/* Sign In Option */}
          <div className="flex flex-col items-center w-full sm:w-auto max-w-xs">
            <p className="text-sm text-gray-600 mb-3 text-center">
              Start with your Google account
            </p>
            <Button
              onClick={() => router.push('/auth/signin')}
              size="lg"
              variant="primary"
              className="group shadow-lg w-full sm:w-auto min-w-[220px]"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Guest Option */}
          <div className="flex flex-col items-center w-full sm:w-auto max-w-xs">
            <p className="text-sm text-gray-600 mb-3 text-center">
              Browse without saving
            </p>
            <Button
              onClick={onCTAClick}
              size="lg"
              variant="outline"
              className="group w-full sm:w-auto min-w-[220px]"
            >
              <UserCircle className="w-5 h-5 mr-2" />
              Explore as Guest
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-gray-600 px-4"
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
              className="text-center p-4 sm:p-6 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-semibold text-black mb-1 text-sm sm:text-base">{feature.label}</h3>
              <p className="text-xs sm:text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
