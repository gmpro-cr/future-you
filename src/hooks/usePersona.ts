import { useState, useEffect } from 'react';
import { Persona, PersonaType } from '@/types';
import { PERSONAS } from '@/lib/utils/constants';

const PERSONA_STORAGE_KEY = 'selected_persona';
const CUSTOM_DESCRIPTION_KEY = 'custom_persona_description';

export function usePersona() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [customDescription, setCustomDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved persona and custom description from localStorage
    const loadSavedPersona = () => {
      try {
        const saved = localStorage.getItem(PERSONA_STORAGE_KEY);
        const savedCustom = localStorage.getItem(CUSTOM_DESCRIPTION_KEY);

        if (saved) {
          const personaType = saved as PersonaType;
          const persona = PERSONAS.find((p) => p.type === personaType);
          if (persona) {
            setSelectedPersona(persona);
            if (personaType === 'custom' && savedCustom) {
              setCustomDescription(savedCustom);
            }
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

  const selectPersona = (persona: Persona, description?: string) => {
    setSelectedPersona(persona);
    localStorage.setItem(PERSONA_STORAGE_KEY, persona.type);

    if (persona.type === 'custom' && description) {
      setCustomDescription(description);
      localStorage.setItem(CUSTOM_DESCRIPTION_KEY, description);
    }
  };

  const clearPersona = () => {
    setSelectedPersona(null);
    setCustomDescription('');
    localStorage.removeItem(PERSONA_STORAGE_KEY);
    localStorage.removeItem(CUSTOM_DESCRIPTION_KEY);
  };

  return {
    selectedPersona,
    customDescription,
    selectPersona,
    clearPersona,
    personas: PERSONAS,
    isLoading,
  };
}
