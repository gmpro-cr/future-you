'use client';

import { PersonaCard } from './PersonaCard';
import { PersonaCardData } from '@/types/persona';

interface PersonaGridProps {
  personas: PersonaCardData[];
  loading?: boolean;
}

export function PersonaGrid({ personas, loading }: PersonaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🤔</div>
        <h3 className="text-xl font-semibold text-white mb-2">No personas found</h3>
        <p className="text-white/60">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {personas.map((persona) => (
        <PersonaCard key={persona.id} persona={persona} />
      ))}
    </div>
  );
}
