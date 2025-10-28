'use client';

import { PersonaCategory } from '@/types/persona';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
  categories: Array<{ category: PersonaCategory; count: number }>;
  selected: PersonaCategory | 'all';
  onChange: (category: PersonaCategory | 'all') => void;
}

const CATEGORY_LABELS: Record<PersonaCategory | 'all', string> = {
  all: 'All',
  business: 'Business',
  entertainment: 'Entertainment',
  sports: 'Sports',
  historical: 'Historical',
  mythological: 'Mythological',
  creators: 'Creators'
};

const CATEGORY_EMOJIS: Record<PersonaCategory | 'all', string> = {
  all: '✨',
  business: '💼',
  entertainment: '🎬',
  sports: '⚽',
  historical: '📜',
  mythological: '🕉️',
  creators: '📱'
};

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  const allCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* All tab */}
      <CategoryTab
        label="All"
        emoji="✨"
        count={allCount}
        active={selected === 'all'}
        onClick={() => onChange('all')}
      />

      {/* Category tabs */}
      {categories.map(({ category, count }) => (
        <CategoryTab
          key={category}
          label={CATEGORY_LABELS[category]}
          emoji={CATEGORY_EMOJIS[category]}
          count={count}
          active={selected === category}
          onClick={() => onChange(category)}
        />
      ))}
    </div>
  );
}

interface CategoryTabProps {
  label: string;
  emoji: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function CategoryTab({ label, emoji, count, active, onClick }: CategoryTabProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors
        ${active
          ? 'bg-white text-black'
          : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/10'
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      <span className={`text-xs ${active ? 'text-black/60' : 'text-white/50'}`}>
        ({count})
      </span>

      {active && (
        <motion.div
          layoutId="activeCategory"
          className="absolute inset-0 bg-white rounded-xl -z-10"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}
