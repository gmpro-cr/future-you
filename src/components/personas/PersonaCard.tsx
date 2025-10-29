'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { PersonaCardData } from '@/types/persona';
import { MessageCircle, Crown } from 'lucide-react';

interface PersonaCardProps {
  persona: PersonaCardData;
}

export function PersonaCard({ persona }: PersonaCardProps) {
  return (
    <Link href={`/chat/${persona.slug}`}>
      <motion.div
        className="group relative backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Premium Badge */}
        {persona.is_premium && (
          <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full px-2 py-0.5 flex items-center gap-0.5">
            <Crown className="w-2.5 h-2.5 text-white" />
            <span className="text-[10px] font-semibold text-white">Pro</span>
          </div>
        )}

        {/* Avatar */}
        <div className="aspect-square relative bg-gradient-to-br from-white/5 to-white/10">
          <Image
            src={persona.avatar_url}
            alt={persona.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Name overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-white/90 transition-colors">
              {persona.name}
            </h3>
          </div>
        </div>

        {/* Content - Minimal */}
        <div className="p-2">
          <p className="text-xs text-white/60 mb-2 line-clamp-1">
            {persona.short_description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-1 text-[10px] text-white/50">
            <MessageCircle className="w-3 h-3" />
            <span>{persona.conversation_count.toLocaleString()}</span>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.div>
    </Link>
  );
}
