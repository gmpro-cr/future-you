// Core type definitions for Future You application

export interface Persona {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  emoji?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title?: string;
  personaId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatState {
  conversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryAfter?: number;
  };
}

export interface ChatRequest {
  sessionId: string;
  conversationId?: string;
  personaId?: string;
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  messageId: string;
  response: string;
  timestamp: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface FeedbackRequest {
  messageId: string;
  type: 'thumbs_up' | 'thumbs_down' | 'rating';
  rating?: number;
  comment?: string;
}
