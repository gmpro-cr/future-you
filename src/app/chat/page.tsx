'use client';
import { useFingerprint } from '@/hooks/useFingerprint';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { FullPageLoader } from '@/components/shared/Loader';

export default function ChatPage() {
  const { fingerprint, isLoading: fingerprintLoading } = useFingerprint();

  if (fingerprintLoading) {
    return <FullPageLoader />;
  }

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

  return (
    <ChatInterface
      sessionId={fingerprint}
    />
  );
}
