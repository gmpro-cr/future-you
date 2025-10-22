'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Plus, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Persona } from '@/types';
import { getPersonaById } from '@/lib/utils/personas';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { InputArea } from './InputArea';
import { ConfirmModal } from '@/components/shared/Modal';
import { logout } from '@/lib/utils/auth';
import { ChatSidebar } from './ChatSidebar';
import { saveConversation } from '@/lib/utils/conversations';

interface ChatInterfaceProps {
  sessionId: string;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const router = useRouter();
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);

  useEffect(() => {
    const personaId = localStorage.getItem('selected_persona_id');
    if (personaId) {
      const persona = getPersonaById(personaId);
      setCurrentPersona(persona);
    }
  }, []);

  const { messages, isLoading, error, sendMessage, clearConversation } = useChat(sessionId, currentPersona?.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0 && currentPersona) {
      saveConversation(sessionId, currentPersona.id, currentPersona.name, messages);
    }
  }, [messages, sessionId, currentPersona]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const confirmNewChat = () => {
    clearConversation();
    setShowNewChatModal(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getWelcomeMessage = () => {
    if (currentPersona) {
      return `Hello! I'm ${currentPersona.name}. ${currentPersona.description} What would you like to talk about?`;
    }
    return "Hello! I'm your future self. I'm here to share what I've learned on this journey. What would you like to talk about?";
  };

  const displayMessages =
    messages.length === 0
      ? [
          {
            id: 'welcome',
            role: 'assistant' as const,
            content: getWelcomeMessage(),
            timestamp: new Date().toISOString(),
          },
        ]
      : messages;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <ChatSidebar currentSessionId={sessionId} onNewChat={confirmNewChat} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/personas')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Personas"
            >
              <User className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 text-lg">
                {currentPersona ? currentPersona.name : 'Future You'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          <div className="max-w-3xl mx-auto">
            {displayMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200">
          <InputArea onSendMessage={sendMessage} isLoading={isLoading} />
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
    </div>
  );
}
