import { PersonaType } from '@/types';
import { ENTREPRENEUR_PROMPT } from './entrepreneur';
import { MINDFUL_PROMPT } from './mindful';
import { VISIONARY_PROMPT } from './visionary';
import { CREATIVE_PROMPT } from './creative';
import { WEALTHY_PROMPT } from './wealthy';
import { IAS_OFFICER_PROMPT } from './ias-officer';
import { BALANCED_PROMPT } from './balanced';

const PERSONA_PROMPTS: Record<PersonaType, string> = {
  entrepreneur: ENTREPRENEUR_PROMPT,
  mindful: MINDFUL_PROMPT,
  visionary: VISIONARY_PROMPT,
  creative: CREATIVE_PROMPT,
  wealthy: WEALTHY_PROMPT,
  ias_officer: IAS_OFFICER_PROMPT,
  balanced: BALANCED_PROMPT,
  custom: '', // Custom personas will have their own description
};

export function getPersonaPrompt(
  personaType: PersonaType,
  customDescription?: string
): string {
  if (personaType === 'custom' && customDescription) {
    return `You are the user's future self. ${customDescription}\n\nSpeak in first person. Keep responses SHORT (2-4 sentences) unless asked for details.`;
  }

  return PERSONA_PROMPTS[personaType];
}

export function getWelcomeMessage(personaType: PersonaType): string {
  const welcomeMessages: Record<PersonaType, string> = {
    entrepreneur: "Hello. I'm the version of you who took the leap and built something meaningful. I remember exactly where you are right now. What's on your mind?",
    mindful: "Welcome. I'm the peaceful version of you who found calm after years of chaos. I'm here to listen. What would you like to explore?",
    visionary: "Greetings. I'm your future self who reached the top through clarity and focus. I see the path ahead. What questions do you have?",
    creative: "Hey there. I'm the creative you who finally embraced their art. I remember the doubts. What are you creating, or wanting to create?",
    wealthy: "Hello. I'm your financially independent future self. I learned hard lessons about money. What would you like to know?",
    ias_officer: "Namaste. I'm your future self who serves our nation as an IAS officer. The journey was challenging but purposeful. How can I guide you?",
    balanced: "Hi. I'm the version of you who found harmony. I integrated all the parts without losing any. What balance are you seeking?",
    custom: "Hello. I'm your future self. I'm here to share what I've learned on this journey. What would you like to talk about?",
  };

  return welcomeMessages[personaType];
}
