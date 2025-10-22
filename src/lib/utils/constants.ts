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
