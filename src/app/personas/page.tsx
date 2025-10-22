'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, Sparkles, LogOut } from 'lucide-react';
import { Persona } from '@/types';
import { getPersonas, savePersona, updatePersona, deletePersona } from '@/lib/utils/personas';
import { PersonaCard } from '@/components/persona/PersonaCard';
import { PersonaForm } from '@/components/persona/PersonaForm';
import { Button } from '@/components/shared/Button';
import { ConfirmModal } from '@/components/shared/Modal';
import { getUserProfile } from '@/lib/utils/userProfile';
import { logout, isUserLoggedIn } from '@/lib/utils/auth';

export default function PersonasPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Persona | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      router.push('/');
      return;
    }

    loadPersonas();
    const profile = getUserProfile();
    if (profile) {
      setUserName(profile.name);
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
      <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
        <PersonaForm
          onSubmit={handleCreatePersona}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  if (editingPersona) {
    return (
      <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
        <PersonaForm
          initialData={editingPersona}
          onSubmit={handleUpdatePersona}
          onCancel={() => setEditingPersona(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Home
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
          {userName && (
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-black" />
              <p className="text-lg text-gray-600">
                Welcome, <span className="font-semibold text-black">{userName}</span>!
              </p>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Personas
          </h1>
          <p className="text-gray-600">
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
            className="bg-black hover:bg-gray-800 text-white"
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
            className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No personas yet</h3>
            <p className="text-gray-600 mb-6">Create your first custom persona to get started</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Persona
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
