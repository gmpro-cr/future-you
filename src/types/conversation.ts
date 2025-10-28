export interface Conversation {
  id: string;
  user_id?: string;
  session_id: string;
  persona_id?: string;  // NEW
  is_guest_session: boolean;  // NEW
  guest_message_count: number;  // NEW
  created_at: string;
  updated_at: string;
}

export interface GuestSessionStatus {
  isGuest: boolean;
  messageCount: number;
  remainingMessages: number;
  conversationIds: string[];
}
