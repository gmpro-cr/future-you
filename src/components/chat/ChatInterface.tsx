'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Persona } from '@/types';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { TypingIndicator } from './TypingIndicator';
import { ConfirmModal } from '../shared/Modal';
import { ChatSidebar } from './ChatSidebar';
import { Plus, LogOut, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DarkLayout } from '@/components/layouts/DarkLayout';

interface ChatInterfaceProps {
  sessionId: string;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxRetries = 3;

  // Load messages from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`chat_${sessionId}`);
      if (stored) {
        const data = JSON.parse(stored);
        setMessages(data.messages || []);
        setCurrentPersona(data.persona || null);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      toast.error('Failed to load chat history');
    }
  }, [sessionId]);

  // Save messages to localStorage
  useEffect(() => {
    try {
      if (messages.length > 0 || currentPersona) {
        localStorage.setItem(
          `chat_${sessionId}`,
          JSON.stringify({ messages, persona: currentPersona })
        );
      }
    } catch (err) {
      console.error('Failed to save chat history:', err);
    }
  }, [messages, currentPersona, sessionId]);

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
          history: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || `Server error: ${response.status} ${response.statusText}`;
        
        logApiError(
          { message: errorMessage, status: response.status },
          'Chat API Request Failed'
        );

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.message) {
        throw new Error('Invalid response format from server');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.persona && !currentPersona) {
        setCurrentPersona(data.persona);
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
    setCurrentPersona(null);
    setError(null);
    setRetryCount(0);
    setLastFailedMessage(null);
    setShowNewChatModal(false);
    localStorage.removeItem(`chat_${sessionId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const displayMessages = messages;

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Sidebar */}
        <ChatSidebar currentSessionId={sessionId} onNewChat={confirmNewChat} />

        {/* Main Chat Area */}
        <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-3">
            {currentPersona && (
              <div className="flex items-center gap-3">
                {currentPersona.avatarUrl && (
                  <img
                    src={currentPersona.avatarUrl}
                    alt={currentPersona.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <h2 className="text-white font-semibold">{currentPersona.name}</h2>
                  <p className="text-white/60 text-sm">Your Future Self</p>
                </div>
              </div>
            )}
            {!currentPersona && (
              <h2 className="text-white font-semibold">Future You</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto">
            {displayMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                personaAvatar={currentPersona?.avatarUrl}
                personaName={currentPersona?.name}
              />
            ))}
            {isLoading && <TypingIndicator />}
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
      </div>
      {/* Modals */}
      <ConfirmModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onConfirm={confirmNewChat}
        title="Start New Chat?"
        description="This will clear your current conversation. The conversation will be saved in your browser."
        confirmText="Start New Chat"
        isDestructive
      />
    </>
  );
}
