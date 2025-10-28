'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FloatingParticles } from '@/components/shared/FloatingParticles';

interface DarkLayoutProps {
  children: ReactNode;
  particleCount?: number;
  showParticles?: boolean;
}

export function DarkLayout({ children, particleCount = 40, showParticles = true }: DarkLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900 to-black">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{ backgroundSize: "200% 200%" }}
        />
      </div>

      {/* Floating Particles */}
      {showParticles && <FloatingParticles count={particleCount} />}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
