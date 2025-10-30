'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, LogOut, User } from 'lucide-react';
import { Persona } from '@/types';
import { getPersonas, savePersona, updatePersona, deletePersona, migratePersonasWithAvatars } from '@/lib/utils/personas';
import { PersonaCard } from '@/components/persona/PersonaCard';
import { PersonaForm } from '@/components/persona/PersonaForm';
import { Button } from '@/components/shared/Button';
import { ConfirmModal } from '@/components/shared/Modal';
import { getUserProfile, saveUserProfile } from '@/lib/utils/userProfile';
import { logout, isUserLoggedIn, createUserSession } from '@/lib/utils/auth';
import { FloatingParticles } from '@/components/shared/FloatingParticles';
import { performCompleteSync, startAutoSync } from '@/lib/utils/sync';

export default function PersonasPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Persona | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return;

    // Check if user is logged in (either via NextAuth or guest)
    if (status === 'unauthenticated' && !isUserLoggedIn()) {
      router.push('/');
      return;
    }

    // Auto-save Google user data if signed in with Google
    if (session?.user) {
      const existingProfile = getUserProfile();

      // Save or update Google user data
      const googleUserData = {
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
        // @ts-ignore - Custom fields from Google
        googleId: session.user.googleId || '',
        // @ts-ignore
        locale: session.user.locale || '',
        // @ts-ignore
        emailVerified: session.user.emailVerified || false,
        birthdate: existingProfile?.birthdate || '', // Preserve existing data
        country: existingProfile?.country || '', // Preserve existing data
        profession: existingProfile?.profession || '', // Preserve existing data
      };

      saveUserProfile(googleUserData);

      // Create session if doesn't exist
      if (!existingProfile) {
        createUserSession(
          // @ts-ignore
          session.user.googleId || session.user.id || `google_${Date.now()}`,
          session.user.name || 'User'
        );
        console.log('✅ Google user data saved automatically:', {
          name: googleUserData.name,
          email: googleUserData.email,
          googleId: googleUserData.googleId,
          locale: googleUserData.locale,
          emailVerified: googleUserData.emailVerified,
        });
      }

      // Load the profile
      const profile = getUserProfile();
      if (profile) {
        setUserProfile({
          ...profile,
          name: profile.name || session.user.name,
          image: profile.image || session.user.image,
        });
      }

      // Sync data with backend after successful Google sign-in
      if (profile && profile.googleId) {
        console.log('🔄 Starting initial sync with backend...');
        performCompleteSync(true).then((result) => {
          console.log('✅ Initial sync completed:', result);
        });

        // Start auto-sync every 5 minutes
        const syncInterval = startAutoSync(5);

        // Cleanup on unmount
        return () => {
          clearInterval(syncInterval);
        };
      }
    } else {
      // Guest user - load existing profile if any
      const profile = getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    }

    // Migrate existing personas to add avatars
    migratePersonasWithAvatars();

    loadPersonas();
  }, [router, session, status]);

  const loadPersonas = async () => {
    const fetchedPersonas = await getPersonas();
    setPersonas(fetchedPersonas);
  };

  const handleCreatePersona = async (data: { name: string; systemPrompt: string; emoji?: string }) => {
    try {
      await savePersona(data);
      await loadPersonas();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating persona:', error);
      alert('Failed to create persona. Please try again.');
    }
  };

  const handleUpdatePersona = async (data: { name: string; systemPrompt: string; emoji?: string }) => {
    if (editingPersona) {
      try {
        await updatePersona(editingPersona.id, data);
        await loadPersonas();
        setEditingPersona(null);
      } catch (error) {
        console.error('Error updating persona:', error);
        alert('Failed to update persona. Please try again.');
      }
    }
  };

  const handleDeletePersona = async () => {
    if (deleteConfirm) {
      // Delete from database
      await deletePersona(deleteConfirm.id);
      await loadPersonas();
      setDeleteConfirm(null);
    }
  };

  const handleSelectPersona = (persona: Persona) => {
    // Store selected persona ID
    localStorage.setItem('selected_persona_id', persona.id);
    router.push('/chat');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-black py-8 px-4 flex items-center justify-center relative overflow-hidden">
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
        <FloatingParticles />
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
        >
          <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
        </motion.div>
        <div className="relative z-10">
          <PersonaForm
            onSubmit={handleCreatePersona}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  if (editingPersona) {
    return (
      <div className="min-h-screen bg-black py-8 px-4 flex items-center justify-center relative overflow-hidden">
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
        <FloatingParticles />
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
        >
          <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
        </motion.div>
        <div className="relative z-10">
          <PersonaForm
            initialData={editingPersona}
            onSubmit={handleUpdatePersona}
            onCancel={() => setEditingPersona(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row relative overflow-hidden">
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
      <FloatingParticles />
      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
      </motion.div>

      {/* Left Profile Panel - Always visible */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 lg:w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 p-4 lg:p-6 flex-col relative z-10 flex"
      >
        {/* Profile Header */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 lg:w-8 lg:h-8 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base lg:text-xl font-bold text-white truncate">
                {userProfile?.name || 'User'}
              </h2>
              <p className="text-xs lg:text-sm text-white/70">Your Profile</p>
            </div>
          </div>
        </div>

        {/* Recent Personas */}
        <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6 flex-1 overflow-y-auto">
          <h3 className="text-xs lg:text-sm text-white/50 uppercase font-medium mb-2 lg:mb-3">Recent Interactions</h3>
          {personas.slice(0, 5).map((persona) => (
            <div
              key={persona.id}
              onClick={() => handleSelectPersona(persona)}
              className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-base lg:text-lg">{persona.emoji || '🤖'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm text-white font-medium truncate">{persona.name}</p>
                <p className="text-xs text-white/50 hidden lg:block">Click to chat</p>
              </div>
            </div>
          ))}
          {personas.length === 0 && (
            <p className="text-xs lg:text-sm text-white/50 text-center py-4">No personas yet</p>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 lg:px-4 py-2 lg:py-3 bg-white/10 border-2 border-white/20 rounded-lg hover:bg-white/20 transition-colors text-white font-medium text-sm lg:text-base"
        >
          <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>Logout</span>
        </button>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 py-4 sm:py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Your Personas
              </h1>
            </div>
            <p className="text-sm sm:text-base text-white/70">
              {personas.length > 0
                ? "Select a persona to start chatting!"
                : "create your favourite AI spirit"}
            </p>
          </motion.div>

          {/* Create Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4 sm:mb-6"
          >
            <Button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto bg-white/10 border-2 border-white/20 hover:bg-white/20 text-white font-medium text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Create New Persona
            </Button>
          </motion.div>

          {/* Personas Grid */}
          {personas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12 bg-white/5 backdrop-blur-xl rounded-xl border-2 border-dashed border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-2">No personas yet</h3>
              <p className="text-white/70">Click the button above to create your first custom persona</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 lg:gap-3"
            >
              {personas.map((persona, index) => (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <PersonaCard
                    persona={persona}
                    onSelect={handleSelectPersona}
                    onEdit={setEditingPersona}
                    onDelete={setDeleteConfirm}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeletePersona}
        title="Delete Persona?"
        description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}
