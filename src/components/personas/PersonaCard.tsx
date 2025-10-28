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
        className="group relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Premium Badge */}
        {persona.is_premium && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full px-3 py-1 flex items-center gap-1">
            <Crown className="w-3 h-3 text-white" />
            <span className="text-xs font-semibold text-white">Premium</span>
          </div>
        )}

        {/* Avatar */}
        <div className="aspect-square relative bg-gradient-to-br from-white/5 to-white/10">
          <Image
            src={persona.avatar_url}
            alt={persona.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">
            {persona.name}
          </h3>

          <p className="text-sm text-white/60 mb-3 line-clamp-2">
            {persona.short_description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {persona.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-white/10 text-white/80 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-xs text-white/50">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{persona.conversation_count.toLocaleString()} chats</span>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.div>
    </Link>
  );
}
