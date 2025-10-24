import { useState, useEffect, useCallback } from 'react';
import { ChatState, Message } from '@/types';
import { generateId } from '@/lib/utils/formatters';
import { getPersonaById } from '@/lib/utils/personas';
import axios from 'axios';

export function useChat(sessionId: string, personaId?: string) {
  const [state, setState] = useState<ChatState>({
    conversationId: null,
    messages: [],
    isLoading: false,
    error: null,
  });

  const storageKey = personaId ? `conversation_${personaId}` : 'conversation_main';

  // Load conversation from localStorage on mount
  useEffect(() => {
    const loadConversation = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setState((prev) => ({
            ...prev,
            conversationId: parsed.conversationId,
            messages: parsed.messages || [],
          }));
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    if (sessionId) {
      loadConversation();
    }
  }, [sessionId, storageKey]);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (state.messages.length > 0) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            conversationId: state.conversationId,
            messages: state.messages,
          })
        );
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
  }, [state.messages, state.conversationId, storageKey]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim()) return;

      // Add user message immediately (optimistic update)
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        const persona = personaId ? await getPersonaById(personaId) : null;

        // Debug logging
        if (persona) {
          console.log('🎭 CLIENT: Using Persona:', {
            id: persona.id,
            name: persona.name,
            description: persona.description,
            systemPromptFull: persona.systemPrompt,
            systemPromptLength: persona.systemPrompt?.length,
          });
        } else {
          console.log('⚠️ CLIENT: No persona found for ID:', personaId);
        }

        const response = await axios.post('/api/chat', {
          sessionId,
          conversationId: state.conversationId,
          personaId,
          personaPrompt: persona?.systemPrompt,
          message: content.trim(),
        });

        const { data } = response.data;

        // Add assistant response
        const assistantMessage: Message = {
          id: data.messageId,
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp,
        };

        setState((prev) => ({
          ...prev,
          conversationId: data.conversationId,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));
      } catch (error: any) {
        let errorMessage = 'Failed to send message. Please try again.';

        if (error.response?.data?.error) {
          errorMessage = error.response.data.error.message;
        } else if (error.message === 'Network Error') {
          errorMessage = 'Network error. Please check your connection.';
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        // Remove optimistic user message on error
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((msg) => msg.id !== userMessage.id),
        }));
      }
    },
    [sessionId, state.conversationId, personaId]
  );

  const clearConversation = useCallback(() => {
    setState({
      conversationId: null,
      messages: [],
      isLoading: false,
      error: null,
    });
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    conversationId: state.conversationId,
    sendMessage,
    clearConversation,
    clearError,
  };
}
