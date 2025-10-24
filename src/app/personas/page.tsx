'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Sparkles, LogOut, User, Calendar, Briefcase, MapPin } from 'lucide-react';
import { Persona } from '@/types';
import { getPersonas, savePersona, updatePersona, deletePersona, migratePersonasWithAvatars } from '@/lib/utils/personas';
import { PersonaCard } from '@/components/persona/PersonaCard';
import { PersonaForm } from '@/components/persona/PersonaForm';
import { Button } from '@/components/shared/Button';
import { ConfirmModal } from '@/components/shared/Modal';
import { getUserProfile } from '@/lib/utils/userProfile';
import { logout, isUserLoggedIn } from '@/lib/utils/auth';
import { FloatingParticles } from '@/components/shared/FloatingParticles';

export default function PersonasPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Persona | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      router.push('/');
      return;
    }

    // Migrate existing personas to add avatars
    migratePersonasWithAvatars();

    loadPersonas();
    const profile = getUserProfile();
    if (profile) {
      setUserProfile(profile);
    }
  }, [router]);

  const loadPersonas = () => {
    setPersonas(getPersonas());
  };

  const handleCreatePersona = (data: { name: string; description: string; systemPrompt: string; emoji?: string }) => {
    savePersona(data);
    loadPersonas();
    setShowForm(false);
  };

  const handleUpdatePersona = (data: { name: string; description: string; systemPrompt: string; emoji?: string }) => {
    if (editingPersona) {
      updatePersona(editingPersona.id, data);
      loadPersonas();
      setEditingPersona(null);
    }
  };

  const handleDeletePersona = () => {
    if (deleteConfirm) {
      deletePersona(deleteConfirm.id);
      loadPersonas();
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
    <div className="min-h-screen bg-black flex relative overflow-hidden">
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

      {/* Left Profile Panel */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col relative z-10"
      >
        {/* Profile Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {userProfile?.name || 'User'}
              </h2>
              <p className="text-sm text-white/70">Your Profile</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        {userProfile && (
          <div className="space-y-4 mb-6 flex-1">
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-white/70 mt-0.5" />
              <div>
                <p className="text-xs text-white/50 uppercase font-medium">Profession</p>
                <p className="text-sm text-white font-medium">{userProfile.profession}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-white/70 mt-0.5" />
              <div>
                <p className="text-xs text-white/50 uppercase font-medium">Date of Birth</p>
                <p className="text-sm text-white font-medium">
                  {new Date(userProfile.birthdate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-white/70 mt-0.5" />
              <div>
                <p className="text-xs text-white/50 uppercase font-medium">Country</p>
                <p className="text-sm text-white font-medium">{userProfile.country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg hover:bg-white/20 transition-colors text-white font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-white" />
              <h1 className="text-3xl font-bold text-white">
                Your Personas
              </h1>
            </div>
            <p className="text-white/70">
              {personas.length > 0
                ? "We've created personalized personas based on your profile. Select one to start chatting!"
                : "Create custom AI personas tailored to your goals"}
            </p>
          </motion.div>

          {/* Create Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Button
              onClick={() => setShowForm(true)}
              className="bg-white/10 border-2 border-white/20 hover:bg-white/20 text-white font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
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
