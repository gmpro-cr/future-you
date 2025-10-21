import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateSession,
  createConversation,
  saveMessage,
  getConversationHistory,
} from '@/lib/api/supabase';
import { moderateContent, generateChatResponse } from '@/lib/api/openai';
// import { checkRateLimit } from '@/lib/api/redis'; // Disabled for now
import { chatRequestSchema, validateInput } from '@/lib/utils/validators';
import { getPersonaPrompt } from '@/lib/prompts';
import {
  handleError,
  RateLimitError,
  ModerationError,
  ValidationError,
} from '@/lib/middleware/error-handler';

export async function POST(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();

    // Validate input
    const validated = validateInput(chatRequestSchema, body);

    // Rate limiting disabled (Upstash not configured)
    // const rateLimitResult = await checkRateLimit(validated.sessionId);
    // if (!rateLimitResult.success) {
    //   throw new RateLimitError(rateLimitResult.reset);
    // }

    // Content moderation
    const isFlagged = await moderateContent(validated.message);
    if (isFlagged) {
      throw new ModerationError();
    }

    // Get or create session
    const session = await getOrCreateSession(validated.sessionId);

    // Get or create conversation
    let conversationId = validated.conversationId;
    if (!conversationId) {
      const conversation = await createConversation(
        session.id,
        validated.personaType,
        validated.customPersonaDescription
      );
      conversationId = conversation.id;
    }

    // Get conversation history for context
    const history = await getConversationHistory(conversationId);
    const contextMessages = history.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Get persona prompt
    const systemPrompt = getPersonaPrompt(
      validated.personaType,
      validated.customPersonaDescription
    );

    // Generate AI response
    const { response, usage } = await generateChatResponse(
      systemPrompt,
      contextMessages,
      validated.message
    );

    // Save messages to database
    await saveMessage(conversationId, 'user', validated.message, usage.prompt);
    const assistantMessage = await saveMessage(
      conversationId,
      'assistant',
      response,
      usage.completion
    );

    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        messageId: assistantMessage.id,
        response,
        personaType: validated.personaType,
        timestamp: new Date().toISOString(),
        tokenUsage: usage,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
