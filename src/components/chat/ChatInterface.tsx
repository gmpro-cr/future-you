'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Plus, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Persona } from '@/types';
import { getPersonaById, migratePersonasWithAvatars } from '@/lib/utils/personas';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { InputArea } from './InputArea';
import { ConfirmModal } from '@/components/shared/Modal';
import { logout } from '@/lib/utils/auth';
import { ChatSidebar } from './ChatSidebar';
import { saveConversation } from '@/lib/utils/conversations';
import { FloatingParticles } from '@/components/shared/FloatingParticles';
import { syncConversation } from '@/lib/utils/sync';
import { getUserProfile } from '@/lib/utils/userProfile';

interface ChatInterfaceProps {
  sessionId: string;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const router = useRouter();
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);

  useEffect(() => {
    // Migrate existing personas to add avatars
    migratePersonasWithAvatars();

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
      // Save to localStorage
      saveConversation(sessionId, currentPersona.id, currentPersona.name, messages);

      // Sync to backend if user is signed in with Google
      const profile = getUserProfile();
      if (profile && profile.googleId) {
        // Debounce the sync to avoid too many requests
        const timeoutId = setTimeout(() => {
          syncConversation(currentPersona.id, messages);
        }, 2000); // Wait 2 seconds after last message

        return () => clearTimeout(timeoutId);
      }
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
    <div className="flex h-screen bg-black relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{ backgroundSize: "200% 200%" }}
        />
      </div>
      <FloatingParticles />
      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
      </motion.div>

      {/* Sidebar */}
      <ChatSidebar currentSessionId={sessionId} onNewChat={confirmNewChat} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full min-w-0 relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/personas')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Back to Personas"
            >
              <User className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3">
              {currentPersona?.avatarUrl && (
                <img
                  src={currentPersona.avatarUrl}
                  alt={currentPersona.name}
                  className="w-14 h-14 rounded-xl border-2 border-white/30 shadow-lg object-cover"
                  crossOrigin="anonymous"
                />
              )}
              <h2 className="font-semibold text-white text-lg">
                {currentPersona ? currentPersona.name : 'Future You'}
              </h2>
            </div>
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
                <p className="text-red-300 text-sm">{error}</p>
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
        description="This will clear your current conversation. The conversation will be saved in your browser."
        confirmText="Start New Chat"
        isDestructive
      />
    </div>
  );
}
