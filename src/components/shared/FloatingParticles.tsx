'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

interface FloatingParticlesProps {
  count?: number;
}

export function FloatingParticles({ count = 40 }: FloatingParticlesProps) {
  const [mounted, setMounted] = useState(false);

  // Generate particles data only once on client
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 2 + Math.random() * 3,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: 0.3 + Math.random() * 0.4,
        duration: 4 + Math.random() * 3,
        delay: Math.random() * 3,
        yOffset: -40 - Math.random() * 30,
        xOffset: Math.random() * 20 - 10,
      })),
    [count]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            backgroundColor: `rgba(255, 255, 255, ${particle.opacity})`,
          }}
          animate={{
            y: [0, particle.yOffset, 0],
            x: [0, particle.xOffset, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
