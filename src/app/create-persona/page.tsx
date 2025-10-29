'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { PersonaForm } from '@/components/persona/PersonaForm';
import { FloatingParticles } from '@/components/shared/FloatingParticles';
import { Toast } from '@/components/shared/Toast';
import Link from 'next/link';

export default function CreatePersonaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const handleSubmit = async (persona: { name: string; systemPrompt: string }) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: persona.name,
          system_prompt: persona.systemPrompt,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to create persona');
      }

      // Show success toast
      setToast({
        show: true,
        type: 'success',
        message: `${persona.name} has been created successfully!`,
      });

      // Redirect to personas page after a short delay
      setTimeout(() => {
        router.push('/personas');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating persona:', error);
      setToast({
        show: true,
        type: 'error',
        message: error.message || 'Failed to create persona. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/personas');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{ backgroundSize: '200% 200%' }}
        />
      </div>

      {/* Floating Particles */}
      <FloatingParticles count={30} />

      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/personas"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Personas</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            {/* Card */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
              {/* Title */}
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Create New Persona
                </h1>
                <p className="text-white/60 text-sm sm:text-base">
                  Bring a new AI personality to life with just a name and instructions
                </p>
              </div>

              {/* Form */}
              <PersonaForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />

              {/* Loading Overlay */}
              {isSubmitting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                    <span className="text-white font-medium">Creating persona...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center text-white/50 text-sm"
            >
              <p>
                All other persona details (avatar, bio, etc.) will be automatically generated.
              </p>
              <p className="mt-1">You can customize them later if needed.</p>
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
