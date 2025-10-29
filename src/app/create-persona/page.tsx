'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { FloatingParticles } from '@/components/shared/FloatingParticles';
import { toast } from 'sonner';

export default function CreatePersonaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'creators' as const,
    short_description: '',
    bio: '',
    personality_traits: '',
    conversation_starters: '',
    tags: '',
    avatar_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.short_description || !formData.bio) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Parse comma-separated values
      const personalityTraits = formData.personality_traits
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const conversationStarters = formData.conversation_starters
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const tags = formData.tags
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // Create slug from name
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Generate a default avatar URL if not provided
      const avatarUrl = formData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=400&background=random`;

      // Create persona object
      const personaData = {
        name: formData.name,
        slug,
        category: formData.category,
        short_description: formData.short_description,
        bio: formData.bio,
        personality_traits: personalityTraits.length > 0 ? personalityTraits : ['friendly', 'helpful'],
        conversation_starters: conversationStarters.length > 0 ? conversationStarters : [
          `Tell me about yourself`,
          `What's your philosophy?`,
          `Share your wisdom`,
          `What advice do you have?`
        ],
        tags: tags.length > 0 ? tags : [formData.category],
        knowledge_areas: tags.length > 0 ? tags : [formData.category, 'general'],
        avatar_url: avatarUrl,
        is_premium: false,
        is_active: true,
        sort_order: 999,
      };

      // Make API call to create persona
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personaData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to create persona');
      }

      toast.success('Persona created successfully!');
      router.push(`/chat/${slug}`);
    } catch (error: any) {
      console.error('Error creating persona:', error);
      toast.error(error.message || 'Failed to create persona');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
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

      <FloatingParticles count={30} />

      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="backdrop-blur-xl bg-black/60 border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/personas"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <Sparkles className="w-6 h-6 text-white" />
                <h1 className="text-2xl font-bold text-white">Create Custom Persona</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Form */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-black/60 rounded-2xl p-6 sm:p-8 border border-white/10"
            >
              <p className="text-white/70 mb-6">
                Create your own AI persona! Fill in the details below and start chatting with your custom character.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 outline-none transition-colors"
                    placeholder="e.g., Albert Einstein"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:bg-white/10 focus:border-white/20 outline-none transition-colors"
                    required
                  >
                    <option value="creators">Creators</option>
                    <option value="business">Business</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="sports">Sports</option>
                    <option value="historical">Historical</option>
                    <option value="mythological">Mythological</option>
                  </select>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Short Description <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 outline-none transition-colors"
                    placeholder="e.g., Theoretical Physicist & Genius"
                    maxLength={100}
                    required
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Biography <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 outline-none transition-colors min-h-[150px]"
                    placeholder="Write a detailed biography about this persona..."
                    required
                  />
                </div>

                {/* Personality Traits */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Personality Traits (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.personality_traits}
                    onChange={(e) => setFormData({ ...formData, personality_traits: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 outline-none transition-colors"
                    placeholder="e.g., intelligent, curious, thoughtful, humble"
                  />
                </div>

                {/* Conversation Starters */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Conversation Starters (one per line)
                  </label>
                  <textarea
                    value={formData.conversation_starters}
                    onChange={(e) => setFormData({ ...formData, conversation_starters: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 outline-none transition-colors min-h-[100px]"
                    placeholder={"What is your theory of relativity?\nTell me about your work\nWhat inspires you?"}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 outline-none transition-colors"
                    placeholder="e.g., science, physics, genius, innovation"
                  />
                </div>

                {/* Avatar URL (optional) */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Avatar URL (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 outline-none transition-colors"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-white/40 mt-2">
                    Leave empty to auto-generate an avatar
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Link
                    href="/personas"
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Create Persona
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
