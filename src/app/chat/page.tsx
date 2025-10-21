'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePersona } from '@/hooks/usePersona';
import { useFingerprint } from '@/hooks/useFingerprint';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { FullPageLoader } from '@/components/shared/Loader';

export default function ChatPage() {
  const router = useRouter();
  const { selectedPersona, isLoading: personaLoading } = usePersona();
  const { fingerprint, isLoading: fingerprintLoading } = useFingerprint();

  useEffect(() => {
    if (!personaLoading && !selectedPersona) {
      router.push('/persona');
    }
  }, [selectedPersona, personaLoading, router]);

  if (personaLoading || fingerprintLoading || !selectedPersona || !fingerprint) {
    return <FullPageLoader />;
  }

  const handleChangePersona = () => {
    router.push('/persona');
  };

  return (
    <ChatInterface
      persona={selectedPersona}
      sessionId={fingerprint}
      onChangePersona={handleChangePersona}
    />
  );
}
