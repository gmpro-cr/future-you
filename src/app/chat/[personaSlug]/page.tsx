'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useFingerprint } from '@/hooks/useFingerprint';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { FullPageLoader } from '@/components/shared/Loader';
import { Persona } from '@/types/persona';
import { toast } from 'sonner';

export default function PersonaChatPage() {
  const params = useParams();
  const personaSlug = params.personaSlug as string;

  const { fingerprint, isLoading: fingerprintLoading } = useFingerprint();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (personaSlug) {
      fetchPersona();
    }
  }, [personaSlug]);

  async function fetchPersona() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/personas/${personaSlug}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 404) {
          setError('NOT_FOUND');
        } else {
          throw new Error(result.error?.message || 'Failed to load persona');
        }
        return;
      }

      setPersona(result.data.persona);
    } catch (error: any) {
      console.error('Error fetching persona:', error);
      setError(error.message || 'Failed to load persona');
      toast.error(error.message || 'Failed to load persona');
    } finally {
      setLoading(false);
    }
  }

  // Loading state - show loader while fingerprint or persona is loading
  if (fingerprintLoading || loading) {
    return <FullPageLoader />;
  }

  // Session error - unable to generate fingerprint
  if (!fingerprint) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md backdrop-blur-xl bg-black/60 rounded-3xl p-12 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Start Session</h2>
          <p className="text-white/70 mb-6">Could not initialize chat session. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black rounded-xl hover:bg-white/90 transition-colors font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // 404 Error - persona not found
  if (error === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md backdrop-blur-xl bg-black/60 rounded-3xl p-12 border border-white/20">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-2xl font-semibold text-white mb-3">Persona Not Found</h2>
          <p className="text-white/70 mb-6">
            The persona you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            href="/personas"
            className="inline-block px-6 py-3 bg-white text-black rounded-xl hover:bg-white/90 transition-colors font-semibold"
          >
            Browse Personas
          </Link>
        </div>
      </div>
    );
  }

  // API Error - failed to fetch persona
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md backdrop-blur-xl bg-black/60 rounded-3xl p-12 border border-white/20">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-white mb-3">Something Went Wrong</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => fetchPersona()}
              className="px-6 py-3 bg-white text-black rounded-xl hover:bg-white/90 transition-colors font-semibold"
            >
              Try Again
            </button>
            <Link
              href="/personas"
              className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors font-semibold"
            >
              Back to Personas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success - render chat interface with persona
  if (!persona) {
    // This shouldn't happen, but just in case
    return <FullPageLoader />;
  }

  return (
    <ChatInterface
      sessionId={fingerprint}
      persona={persona}
    />
  );
}
