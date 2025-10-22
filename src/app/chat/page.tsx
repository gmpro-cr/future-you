'use client';

import { useFingerprint } from '@/hooks/useFingerprint';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { FullPageLoader } from '@/components/shared/Loader';

export default function ChatPage() {
  const { fingerprint, isLoading: fingerprintLoading } = useFingerprint();

  if (fingerprintLoading || !fingerprint) {
    return <FullPageLoader />;
  }

  return (
    <ChatInterface
      sessionId={fingerprint}
    />
  );
}
