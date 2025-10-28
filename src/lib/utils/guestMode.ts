import { supabase } from '@/lib/api/supabase';
import { GuestSessionStatus } from '@/types/conversation';

const GUEST_MESSAGE_LIMIT = 10;

/**
 * Check if session is guest and get message count
 */
export async function checkGuestStatus(sessionId: string): Promise<GuestSessionStatus> {
  // Check if authenticated
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    return {
      isGuest: false,
      messageCount: 0,
      remainingMessages: Infinity,
      conversationIds: []
    };
  }

  // Count guest messages across all conversations for this session
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('id, guest_message_count')
    .eq('session_id', sessionId)
    .eq('is_guest_session', true);

  if (error) {
    console.error('Error checking guest status:', error);
    throw new Error('Failed to check guest status');
  }

  const messageCount = (conversations || []).reduce(
    (sum, conv) => sum + (conv.guest_message_count || 0),
    0
  );

  return {
    isGuest: true,
    messageCount,
    remainingMessages: Math.max(0, GUEST_MESSAGE_LIMIT - messageCount),
    conversationIds: (conversations || []).map(c => c.id)
  };
}

/**
 * Increment guest message count for conversation
 */
export async function incrementGuestMessageCount(conversationId: string): Promise<number> {
  const { data, error } = await supabase
    .from('conversations')
    .select('guest_message_count')
    .eq('id', conversationId)
    .single();

  if (error) {
    console.error('Error fetching conversation:', error);
    throw new Error('Failed to increment message count');
  }

  const newCount = (data?.guest_message_count || 0) + 1;

  const { error: updateError } = await supabase
    .from('conversations')
    .update({ guest_message_count: newCount })
    .eq('id', conversationId);

  if (updateError) {
    console.error('Error updating message count:', updateError);
    throw new Error('Failed to update message count');
  }

  return newCount;
}

/**
 * Migrate guest conversations to authenticated user
 */
export async function migrateGuestConversations(
  guestSessionId: string,
  userId: string
): Promise<number> {
  const { data: guestConversations, error: fetchError } = await supabase
    .from('conversations')
    .select('id')
    .eq('session_id', guestSessionId)
    .eq('is_guest_session', true);

  if (fetchError) {
    console.error('Error fetching guest conversations:', fetchError);
    throw new Error('Failed to migrate conversations');
  }

  if (!guestConversations || guestConversations.length === 0) {
    return 0;
  }

  const { error: updateError } = await supabase
    .from('conversations')
    .update({
      user_id: userId,
      is_guest_session: false
    })
    .eq('session_id', guestSessionId)
    .eq('is_guest_session', true);

  if (updateError) {
    console.error('Error migrating conversations:', updateError);
    throw new Error('Failed to migrate conversations');
  }

  console.log(`✅ Migrated ${guestConversations.length} conversations to user ${userId}`);

  return guestConversations.length;
}

/**
 * Check if guest has reached message limit
 */
export function hasReachedGuestLimit(messageCount: number): boolean {
  return messageCount >= GUEST_MESSAGE_LIMIT;
}

/**
 * Get remaining message count for guest
 */
export function getRemainingGuestMessages(messageCount: number): number {
  return Math.max(0, GUEST_MESSAGE_LIMIT - messageCount);
}

/**
 * Get guest limit constant
 */
export function getGuestMessageLimit(): number {
  return GUEST_MESSAGE_LIMIT;
}
