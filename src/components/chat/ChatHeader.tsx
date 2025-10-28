'use client';

import { Persona } from '@/types/persona';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';

interface ChatHeaderProps {
  persona: Persona;
}

export function ChatHeader({ persona }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-3">
        <Link
          href="/personas"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={persona.avatar_url}
              alt={persona.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-white font-semibold">{persona.name}</h2>
            <p className="text-white/60 text-sm">{persona.short_description}</p>
          </div>
        </div>
      </div>

      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
        <Settings className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
