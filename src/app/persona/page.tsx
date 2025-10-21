'use client';

import { useRouter } from 'next/navigation';
import { usePersona } from '@/hooks/usePersona';
import { PersonaGrid } from '@/components/persona/PersonaGrid';
import { Persona } from '@/types';
import { FullPageLoader } from '@/components/shared/Loader';

export default function PersonaPage() {
  const router = useRouter();
  const { personas, selectedPersona, selectPersona, isLoading } = usePersona();

  if (isLoading) {
    return <FullPageLoader />;
  }

  const handlePersonaSelect = (persona: Persona) => {
    selectPersona(persona);
  };

  const handleContinue = () => {
    if (selectedPersona) {
      router.push('/chat');
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <PersonaGrid
      personas={personas}
      selectedPersona={selectedPersona}
      onPersonaSelect={handlePersonaSelect}
      onContinue={handleContinue}
      onBack={handleBack}
    />
  );
}
