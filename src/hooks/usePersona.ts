import { useState, useEffect } from 'react';
import { Persona, PersonaType } from '@/types';
import { PERSONAS } from '@/lib/utils/constants';

const PERSONA_STORAGE_KEY = 'selected_persona';

export function usePersona() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved persona from localStorage
    const loadSavedPersona = () => {
      try {
        const saved = localStorage.getItem(PERSONA_STORAGE_KEY);
        if (saved) {
          const personaType = saved as PersonaType;
          const persona = PERSONAS.find((p) => p.type === personaType);
          if (persona) {
            setSelectedPersona(persona);
          }
        }
      } catch (error) {
        console.error('Error loading persona:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedPersona();
  }, []);

  const selectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    localStorage.setItem(PERSONA_STORAGE_KEY, persona.type);
  };

  const clearPersona = () => {
    setSelectedPersona(null);
    localStorage.removeItem(PERSONA_STORAGE_KEY);
  };

  return {
    selectedPersona,
    selectPersona,
    clearPersona,
    personas: PERSONAS,
    isLoading,
  };
}
