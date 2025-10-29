'use client';

import { useState, useEffect } from 'react';
import { PersonaGrid } from '@/components/personas/PersonaGrid';
import { CategoryFilter } from '@/components/personas/CategoryFilter';
import { SidePanel, SidePanelToggle } from '@/components/personas/SidePanel';
import { PersonaCardData, PersonaCategory } from '@/types/persona';
import { Search, Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FloatingParticles } from '@/components/shared/FloatingParticles';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<PersonaCardData[]>([]);
  const [categories, setCategories] = useState<Array<{ category: PersonaCategory; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PersonaCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  useEffect(() => {
    fetchPersonas();
  }, [selectedCategory]);

  async function fetchPersonas() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/personas?${params}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch personas');
      }

      setPersonas(result.data.personas);
      setCategories(result.data.categories);
    } catch (error: any) {
      console.error('Error fetching personas:', error);
      setError(error.message || 'Failed to load personas');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchPersonas();
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Side Panel */}
      <SidePanel isOpen={sidePanelOpen} onClose={() => setSidePanelOpen(false)} />

      {/* Side Panel Toggle Button */}
      <SidePanelToggle onClick={() => setSidePanelOpen(true)} />

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black">
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
      <FloatingParticles count={40} />

      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
      </motion.div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 ml-16">
              <Sparkles className="w-6 h-6 text-white" />
              <h1 className="text-2xl font-bold text-white">Choose Your AI Companion</h1>
            </div>

            <Link
              href="/create-persona"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all font-medium text-sm"
              aria-label="Create Persona"
            >
              <Plus className="w-4 h-4" />
              Create Persona
            </Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search personas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 outline-none transition-colors"
              />
            </div>
          </form>

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Error loading personas</h3>
            <p className="text-white/60 mb-4">{error}</p>
            <button
              onClick={() => fetchPersonas()}
              className="px-6 py-3 bg-white hover:bg-white/90 text-black rounded-xl transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <PersonaGrid personas={personas} loading={loading} />
        )}
      </main>
    </div>
  );
}
