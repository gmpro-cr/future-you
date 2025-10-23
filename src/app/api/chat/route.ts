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
import {
  handleError,
  RateLimitError,
  ModerationError,
  ValidationError,
} from '@/lib/middleware/error-handler';

const DEFAULT_SYSTEM_PROMPT = `You are the user's future self who has achieved success and peace. You speak in first person, sharing wisdom from your journey. Keep responses conversational and insightful, typically 2-4 sentences unless asked for details. Be warm, authentic, and encouraging.`;

export async function POST(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();

    console.log('📥 Received chat request:', {
      hasPersonaId: !!body.personaId,
      hasPersonaPrompt: !!body.personaPrompt,
      personaPromptLength: body.personaPrompt?.length || 0,
      messagePreview: body.message?.substring(0, 50),
    });

    // Validate input
    const validated = validateInput(chatRequestSchema, body);

    console.log('✅ Validated data:', {
      hasPersonaId: !!validated.personaId,
      hasPersonaPrompt: !!validated.personaPrompt,
      personaPromptLength: validated.personaPrompt?.length || 0,
    });

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
      const conversation = await createConversation(session.id, validated.personaId);
      conversationId = conversation.id;
    }

    // Get conversation history for context
    const history = await getConversationHistory(conversationId);
    const contextMessages = history.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Determine system prompt
    let systemPrompt = DEFAULT_SYSTEM_PROMPT;
    if (validated.personaPrompt) {
      systemPrompt = validated.personaPrompt;
      console.log('🎭 API using custom persona prompt:', {
        personaId: validated.personaId,
        promptLength: systemPrompt.length,
        promptPreview: systemPrompt.substring(0, 100) + '...',
      });
    } else {
      console.log('ℹ️ API using default system prompt');
    }

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
        timestamp: new Date().toISOString(),
        tokenUsage: usage,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
