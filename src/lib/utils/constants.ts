import { Persona } from '@/types';

export const PERSONAS: Persona[] = [
  {
    type: 'entrepreneur',
    name: 'Entrepreneur',
    description: 'Built a successful startup; reflects on risk and resilience',
    emoji: '🚀',
    toneAttributes: ['bold', 'confident', 'practical'],
  },
  {
    type: 'mindful',
    name: 'Mindful',
    description: 'Achieved balance and calm after years of chaos',
    emoji: '🧘',
    toneAttributes: ['peaceful', 'patient', 'grounded'],
  },
  {
    type: 'visionary',
    name: 'Visionary',
    description: 'Reached the top of your field through clarity and focus',
    emoji: '🔭',
    toneAttributes: ['strategic', 'wise', 'composed'],
  },
  {
    type: 'creative',
    name: 'Creative',
    description: 'The artist, writer, or dreamer you became',
    emoji: '🎨',
    toneAttributes: ['imaginative', 'encouraging', 'empathetic'],
  },
  {
    type: 'wealthy',
    name: 'Wealthy',
    description: 'Achieved financial independence through discipline',
    emoji: '💰',
    toneAttributes: ['pragmatic', 'reassuring', 'realistic'],
  },
  {
    type: 'ias_officer',
    name: 'IAS Officer',
    description: 'Embodies purpose, discipline, and service',
    emoji: '🇮🇳',
    toneAttributes: ['calm', 'inspiring', 'principled'],
  },
  {
    type: 'balanced',
    name: 'Balanced',
    description: 'Harmony between ambition and peace — your ideal self',
    emoji: '⚖️',
    toneAttributes: ['gentle', 'reflective', 'insightful'],
  },
];

export const APP_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_MESSAGES_IN_CONTEXT: 10,
  RATE_LIMIT_PER_HOUR: 50,
  SESSION_EXPIRY_DAYS: 30,
  CONVERSATION_TITLE_MAX_LENGTH: 50,
} as const;

export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'You have reached the message limit. Please try again later.',
  API_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  CONTENT_MODERATED: 'Your message contains inappropriate content. Please rephrase.',
  INVALID_INPUT: 'Please enter a valid message.',
  SESSION_EXPIRED: 'Your session has expired. Please refresh the page.',
} as const;

export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully',
  CONVERSATION_SAVED: 'Conversation saved',
  FEEDBACK_SUBMITTED: 'Thank you for your feedback',
} as const;
