export interface Conversation {
  id: string;
  personaId: string;
  personaName: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

const CONVERSATIONS_KEY = 'conversations';

export const saveConversation = (
  sessionId: string,
  personaId: string,
  personaName: string,
  messages: any[]
): void => {
  if (typeof window === 'undefined' || messages.length === 0) return;

  const conversations = getConversations();
  const lastMessage = messages[messages.length - 1];

  // Generate title from first user message or use default
  const firstUserMessage = messages.find(m => m.role === 'user');
  const title = firstUserMessage
    ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
    : 'New Conversation';

  const conversation: Conversation = {
    id: sessionId,
    personaId,
    personaName,
    title,
    lastMessage: lastMessage.content.substring(0, 100),
    timestamp: new Date().toISOString(),
    messageCount: messages.length,
  };

  // Update or add conversation
  const existingIndex = conversations.findIndex(c => c.id === sessionId);
  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.unshift(conversation); // Add to beginning
  }

  // Keep only last 50 conversations
  const trimmed = conversations.slice(0, 50);

  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(trimmed));
};

export const getConversations = (): Conversation[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(CONVERSATIONS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const deleteConversation = (conversationId: string): void => {
  if (typeof window === 'undefined') return;

  const conversations = getConversations();
  const filtered = conversations.filter(c => c.id !== conversationId);
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filtered));

  // Also delete the conversation messages
  localStorage.removeItem(`chat_${conversationId}`);
};

export const getConversationById = (conversationId: string): Conversation | null => {
  const conversations = getConversations();
  return conversations.find(c => c.id === conversationId) || null;
};
