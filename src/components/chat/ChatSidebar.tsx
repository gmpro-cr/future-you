'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Plus,
  Compass,
  Trash2,
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

  useEffect(() => {
    loadConversations();
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
    <div className="w-64 lg:w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col"
    >
      {/* Header */}
      <div className="p-3 lg:p-4 border-b border-white/10">
        <div className="mb-3 lg:mb-4">
          <h2 className="text-base lg:text-lg font-semibold text-white">Conversations</h2>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm lg:text-base"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="font-medium">New Chat</span>
          </button>

          <button
            onClick={() => router.push('/personas')}
            className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 border-2 border-white/20 rounded-lg hover:bg-white/10 transition-colors text-white text-sm lg:text-base"
          >
            <Compass className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="font-medium">Discover Personas</span>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center py-6 lg:py-8 px-3 lg:px-4">
            <MessageSquare className="w-10 h-10 lg:w-12 lg:h-12 text-white/30 mx-auto mb-2 lg:mb-3" />
            <p className="text-xs lg:text-sm text-white/50">
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
                  className={`w-full text-left p-2 lg:p-3 rounded-lg transition-colors group relative cursor-pointer ${
                    isActive
                      ? 'bg-white/10 border border-white/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2 lg:gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-white/30">
                      <img
                        src={avatarUrl}
                        alt={conversation.personaName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs lg:text-sm font-medium text-white truncate">
                          {conversation.title}
                        </p>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conversation.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-white/70" />
                        </button>
                      </div>
                      <p className="text-xs text-white/70 truncate mb-1">
                        {conversation.personaName}
                      </p>
                      <p className="text-xs text-white/50 hidden lg:block">
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
    </div>
  );
}
