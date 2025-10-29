'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, MessageCircle, Clock, Trash2, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { logout as localLogout, getUserSession } from '@/lib/utils/auth';
import Link from 'next/link';

interface ChatHistory {
  personaSlug: string;
  personaName: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidePanel({ isOpen, onClose }: SidePanelProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    loadChatHistory();
    loadUserInfo();
  }, [session]);

  const loadUserInfo = () => {
    if (session?.user) {
      setUserName(session.user.name || session.user.email || 'User');
    } else {
      const localSession = getUserSession();
      if (localSession) {
        setUserName(localSession.name);
      }
    }
  };

  const loadChatHistory = () => {
    if (typeof window === 'undefined') return;

    const history: ChatHistory[] = [];
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith('chat_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.messages && data.messages.length > 0) {
            const personaSlug = key.split('_').slice(2).join('_');
            const lastMessage = data.messages[data.messages.length - 1];

            history.push({
              personaSlug,
              personaName: personaSlug.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '),
              lastMessage: lastMessage.content.substring(0, 60) + '...',
              timestamp: lastMessage.timestamp,
              messageCount: data.messages.length,
            });
          }
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      }
    });

    // Sort by timestamp descending
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setChatHistory(history);
  };

  const handleLogout = async () => {
    // Clear localStorage
    localLogout();

    // Sign out from NextAuth if authenticated
    if (session) {
      await signOut({ redirect: false });
    }

    // Redirect to home
    router.push('/');
  };

  const clearChatHistory = (personaSlug: string) => {
    const sessionId = localStorage.getItem('user_session') || '';
    const key = `chat_${sessionId}_${personaSlug}`;
    localStorage.removeItem(key);
    loadChatHistory();
  };

  const formatTimestamp = (timestamp: string) => {
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
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-black/95 backdrop-blur-xl border-r border-white/10 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <p className="text-sm text-white/60">{userName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Chats
                </h3>

                {chatHistory.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-sm">
                    No chat history yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatHistory.map((chat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <Link
                          href={`/chat/${chat.personaSlug}`}
                          onClick={onClose}
                          className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-white line-clamp-1 flex-1">
                              {chat.personaName}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                clearChatHistory(chat.personaSlug);
                              }}
                              className="p-1 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                          <p className="text-xs text-white/60 mb-2 line-clamp-2">
                            {chat.lastMessage}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-white/40">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {chat.messageCount}
                            </span>
                            <span>{formatTimestamp(chat.timestamp)}</span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 hover:border-red-500/30 transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Toggle Button Component
export function SidePanelToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed left-4 top-4 z-30 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-lg border border-white/10 transition-all"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5 text-white" />
    </button>
  );
}
