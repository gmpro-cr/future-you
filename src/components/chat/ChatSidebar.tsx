'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Compass,
  Trash2,
  X,
  Menu,
} from 'lucide-react';
import { getConversations, deleteConversation, type Conversation } from '@/lib/utils/conversations';
import { generatePersonaAvatar, suggestAvatarStyle, getPersonaColor } from '@/lib/utils/avatarGenerator';

interface ChatSidebarProps {
  currentSessionId: string;
  onNewChat: () => void;
}

export function ChatSidebar({ currentSessionId, onNewChat }: ChatSidebarProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadConversations();

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadConversations = () => {
    setConversations(getConversations());
  };

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    deleteConversation(conversationId);
    loadConversations();

    // If deleting current conversation, redirect to new chat
    if (conversationId === currentSessionId) {
      onNewChat();
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    // Store selected persona and navigate to chat
    localStorage.setItem('selected_persona_id', conversation.personaId);
    router.push(`/chat?session=${conversation.id}`);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Toggle */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-lg shadow-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
            )}

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: isMobile ? -280 : 0 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col z-40 lg:relative lg:z-0"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Conversations</h2>
                  {isMobile && (
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 hover:bg-white/20 rounded-lg"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onNewChat();
                      if (isMobile) setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">New Chat</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/personas');
                      if (isMobile) setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 border-2 border-white/20 rounded-lg hover:bg-white/10 transition-colors text-white"
                  >
                    <Compass className="w-5 h-5" />
                    <span className="font-medium">Discover Personas</span>
                  </button>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto p-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-sm text-white/50">
                      No conversations yet. Start chatting!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => {
                      // Generate avatar from conversation persona name (no emoji available here)
                      const avatarUrl = generatePersonaAvatar(conversation.personaName, 'realistic', undefined, undefined);
                      const isActive = conversation.id === currentSessionId;

                      return (
                        <div
                          key={conversation.id}
                          onClick={() => handleConversationClick(conversation)}
                          className={`w-full text-left p-3 rounded-lg transition-colors group relative cursor-pointer ${
                            isActive
                              ? 'bg-white/10 border border-white/30'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-white/30">
                              <img
                                src={avatarUrl}
                                alt={conversation.personaName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-white truncate">
                                  {conversation.title}
                                </p>
                                <button
                                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-opacity"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-white/70" />
                                </button>
                              </div>
                              <p className="text-xs text-white/70 truncate mb-1">
                                {conversation.personaName}
                              </p>
                              <p className="text-xs text-white/50">
                                {formatDate(conversation.timestamp)} · {conversation.messageCount}{' '}
                                messages
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
