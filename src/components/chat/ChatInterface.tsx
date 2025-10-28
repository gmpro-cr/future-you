'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '@/types';
import { Persona } from '@/types/persona';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { TypingIndicator } from './TypingIndicator';
import { ChatHeader } from './ChatHeader';
import { GuestLimitBanner } from './GuestLimitBanner';
import { ConversationStarters } from './ConversationStarters';
import { ConfirmModal } from '../shared/Modal';
import { Plus, LogOut, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ChatInterfaceProps {
  sessionId: string;
  persona: Persona;
}

export function ChatInterface({ sessionId, persona }: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [guestStatus, setGuestStatus] = useState<{ current: number; max: number; remainingMessages: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxRetries = 3;

  // Load messages from localStorage (persona-specific)
  useEffect(() => {
    try {
      const storageKey = `chat_${sessionId}_${persona.slug}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        setMessages(data.messages || []);
        setCurrentConversationId(data.conversationId || null);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      toast.error('Failed to load chat history');
    }
  }, [sessionId, persona.slug]);

  // Save messages to localStorage (persona-specific)
  useEffect(() => {
    try {
      if (messages.length > 0 || currentConversationId) {
        const storageKey = `chat_${sessionId}_${persona.slug}`;
        localStorage.setItem(
          storageKey,
          JSON.stringify({ messages, conversationId: currentConversationId })
        );
      }
    } catch (err) {
      console.error('Failed to save chat history:', err);
    }
  }, [messages, currentConversationId, sessionId, persona.slug]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const logApiError = useCallback((error: any, context: string) => {
    const errorDetails = {
      context,
      message: error.message,
      status: error.status,
      timestamp: new Date().toISOString(),
      sessionId,
    };
    console.error('API Error:', errorDetails);
    
    // Log to external service if available
    if (typeof window !== 'undefined' && (window as any).errorLogger) {
      (window as any).errorLogger.log(errorDetails);
    }
  }, [sessionId]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Clear previous error
    setError(null);
    setLastFailedMessage(content);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId,
          personaId: persona.id,
          conversationId: currentConversationId,
          history: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for guest limit error
        if (data.error?.code === 'GUEST_LIMIT_REACHED') {
          setShowSignupModal(true);
          // Remove the user message since it wasn't sent
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
          toast.error('Guest message limit reached. Please sign up to continue.');
          return;
        }

        const errorMessage = data.error?.message || data.details || `Server error: ${response.status} ${response.statusText}`;

        logApiError(
          { message: errorMessage, status: response.status },
          'Chat API Request Failed'
        );

        throw new Error(errorMessage);
      }

      if (!data.success || !data.data?.message) {
        throw new Error('Invalid response format from server');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update conversation ID if returned
      if (data.data.conversationId) {
        setCurrentConversationId(data.data.conversationId);
      }

      // Update guest status if provided
      if (data.data.guestLimit) {
        setGuestStatus({
          current: data.data.guestLimit.current,
          max: data.data.guestLimit.max,
          remainingMessages: data.data.guestLimit.remainingMessages
        });
      }

      // Reset retry count on success
      setRetryCount(0);
      setLastFailedMessage(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send message. Please try again.';
      setError(errorMessage);

      logApiError(err, 'Message Send Failed');

      // Remove the user message on error to avoid confusion
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));

      // Show toast notification
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = useCallback(() => {
    if (lastFailedMessage && retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      sendMessage(lastFailedMessage);
    } else if (retryCount >= maxRetries) {
      toast.error('Maximum retry attempts reached. Please try again later.');
    }
  }, [lastFailedMessage, retryCount, maxRetries]);

  const handleNewChat = () => {
    if (messages.length > 0) {
      setShowNewChatModal(true);
    }
  };

  const confirmNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setGuestStatus(null);
    setError(null);
    setRetryCount(0);
    setLastFailedMessage(null);
    setShowNewChatModal(false);
    const storageKey = `chat_${sessionId}_${persona.slug}`;
    localStorage.removeItem(storageKey);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const displayMessages = messages;

  return (
    <>
      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header with Persona Info */}
        <ChatHeader persona={persona} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto">
            {/* Guest Limit Banner (show at 7+ messages) */}
            {guestStatus && guestStatus.current >= 7 && (
              <GuestLimitBanner
                current={guestStatus.current}
                max={guestStatus.max}
                remainingMessages={guestStatus.remainingMessages}
              />
            )}

            {/* Conversation Starters (show when no messages) */}
            {messages.length === 0 && (
              <ConversationStarters
                starters={persona.conversation_starters}
                onSelect={(starter) => sendMessage(starter)}
              />
            )}

            {/* Message List */}
            {displayMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                personaAvatar={persona.avatar_url}
                personaName={persona.name}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && <TypingIndicator />}

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-300 text-sm font-medium mb-2">Error</p>
                    <p className="text-red-200 text-sm">{error}</p>
                    {lastFailedMessage && retryCount < maxRetries && (
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-sm transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                      </button>
                    )}
                    {retryCount >= maxRetries && (
                      <p className="text-red-300 text-xs mt-2">Maximum retry attempts reached. Please try again later.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-black/40 backdrop-blur-xl border-t border-white/10">
          <InputArea onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onConfirm={confirmNewChat}
        title="Start New Chat?"
        description={`This will clear your current conversation with ${persona.name}. The conversation will be saved in your browser.`}
        confirmText="Start New Chat"
        isDestructive
      />

      {/* Signup Modal for Guest Limit */}
      <ConfirmModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onConfirm={() => router.push('/')}
        title="Guest Limit Reached"
        description="You've reached the 10 message limit for guest users. Sign up to continue chatting with unlimited messages!"
        confirmText="Sign Up Now"
        cancelText="Maybe Later"
      />
    </>
  );
}
