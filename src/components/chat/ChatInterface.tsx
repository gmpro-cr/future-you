'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Persona } from '@/types';
import { useChat } from '@/hooks/useChat';
import { getWelcomeMessage } from '@/lib/prompts';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { InputArea } from './InputArea';
import { Sidebar } from './Sidebar';
import { ConfirmModal } from '@/components/shared/Modal';
import { generateId } from '@/lib/utils/formatters';

interface ChatInterfaceProps {
  persona: Persona;
  sessionId: string;
  onChangePersona: () => void;
}

export function ChatInterface({ persona, sessionId, onChangePersona }: ChatInterfaceProps) {
  const { messages, isLoading, error, sendMessage, clearConversation } = useChat(
    persona.type,
    sessionId
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showChangePersonaModal, setShowChangePersonaModal] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Add welcome message if no messages
  useEffect(() => {
    if (messages.length === 0) {
      // Simulate welcome message from persona
      const timer = setTimeout(() => {
        // This is a display-only message, not saved to state
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages.length, persona.type]);

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const confirmNewChat = () => {
    clearConversation();
    setShowNewChatModal(false);
  };

  const handleChangePersona = () => {
    setShowChangePersonaModal(true);
  };

  const confirmChangePersona = () => {
    onChangePersona();
  };

  const displayMessages =
    messages.length === 0
      ? [
          {
            id: 'welcome',
            role: 'assistant' as const,
            content: getWelcomeMessage(persona.type),
            timestamp: new Date().toISOString(),
          },
        ]
      : messages;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          persona={persona}
          onNewChat={handleNewChat}
          onChangePersona={handleChangePersona}
          messageCount={messages.length}
        />
      </div>

      {/* Mobile Sidebar */}
      {showSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed left-0 top-0 h-full w-80 z-50 lg:hidden"
          >
            <Sidebar
              persona={persona}
              onNewChat={handleNewChat}
              onChangePersona={handleChangePersona}
              messageCount={messages.length}
            />
          </motion.div>
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden border-b border-gray-200 bg-white p-4 flex items-center justify-between">
          <button onClick={() => setShowSidebar(!showSidebar)} className="p-2">
            {showSidebar ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{persona.emoji}</div>
            <div>
              <h2 className="font-semibold text-gray-900">{persona.name}</h2>
              <p className="text-xs text-gray-600 truncate max-w-[200px]">
                {persona.description}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
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
        <InputArea onSendMessage={sendMessage} isLoading={isLoading} />
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

      <ConfirmModal
        isOpen={showChangePersonaModal}
        onClose={() => setShowChangePersonaModal(false)}
        onConfirm={confirmChangePersona}
        title="Change Persona?"
        description="Your current conversation will be saved and you can return to it later."
        confirmText="Change Persona"
      />
    </div>
  );
}
