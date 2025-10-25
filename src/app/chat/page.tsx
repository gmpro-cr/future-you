'use client';
import { useFingerprint } from '@/hooks/useFingerprint';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { FullPageLoader } from '@/components/shared/Loader';

export default function ChatPage() {
  const { fingerprint, isLoading: fingerprintLoading, error: fingerprintError } = useFingerprint();

  if (fingerprintLoading) {
    return <FullPageLoader />;
  }

  if (fingerprintError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Session Initialization Error</h2>
          <p className="text-gray-600 mb-4">{fingerprintError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!fingerprint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Unable to Start Session</h2>
          <p className="text-gray-600 mb-4">Could not initialize chat session. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
