'use client';

import { Sparkles } from 'lucide-react';

interface ConversationStartersProps {
  starters: string[];
  onSelect: (starter: string) => void;
}

export function ConversationStarters({ starters, onSelect }: ConversationStartersProps) {
  if (!starters || starters.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-white/60" />
        <h3 className="text-sm font-medium text-white/60">Suggested questions</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {starters.slice(0, 4).map((starter, index) => (
          <button
            key={index}
            onClick={() => onSelect(starter)}
            className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-sm text-white/80 hover:text-white"
          >
            {starter}
          </button>
        ))}
      </div>
    </div>
  );
}
