import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateSession,
  createConversation,
  saveMessage,
  getConversationHistory,
} from '@/lib/api/supabase';
import { getPersonaById, getPersonaBySlug } from '@/lib/api/personas';
import { checkGuestStatus, incrementGuestMessageCount, hasReachedGuestLimit } from '@/lib/utils/guestMode';
import { buildSystemPrompt } from '@/lib/utils/prompts';
import { moderateContent, generateChatResponse } from '@/lib/api/openai';
import { chatRequestSchema, validateInput } from '@/lib/utils/validators';
import { ModerationError } from '@/lib/middleware/error-handler';

const DEFAULT_SYSTEM_PROMPT = `You are the user's future self who has achieved success and peace. You speak in first person, sharing wisdom from your journey. Keep responses conversational and insightful, typically 2-4 sentences unless asked for details. Be warm, authentic, and encouraging.`;

interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: string;
  timestamp: string;
}

function createErrorResponse(
  error: string,
  details?: string,
  code?: string,
  status: number = 500
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error,
    details,
    code,
    timestamp: new Date().toISOString(),
  };

  console.error('API Error Response:', {
    ...response,
    status,
  });

  return NextResponse.json(response, { status });
}

export async function POST(req: NextRequest) {
  try {
    // Get request body
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return createErrorResponse(
        'Invalid request format',
        'Request body must be valid JSON',
        'INVALID_JSON',
        400
      );
    }

    console.log('📥 Received chat request:', {
      hasPersonaId: !!body.personaId,
      hasPersonaSlug: !!body.personaSlug,
      hasSessionId: !!body.sessionId,
      messagePreview: body.message?.substring(0, 50),
    });

    // Validate input
    let validated;
    try {
      validated = validateInput(chatRequestSchema, body);
    } catch (err: any) {
      return createErrorResponse(
        'Validation error',
        err.message || 'Invalid request data',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate that we have either personaId or personaSlug
    if (!validated.personaId && !validated.personaSlug) {
      return createErrorResponse(
        'Missing persona identifier',
        'Either personaId or personaSlug is required',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate sessionId is provided
    if (!validated.sessionId) {
      return createErrorResponse(
        'Missing session identifier',
        'sessionId is required',
        'VALIDATION_ERROR',
        400
      );
    }

    console.log('✅ Validated data:', {
      hasPersonaId: !!validated.personaId,
      hasPersonaSlug: !!validated.personaSlug,
      messageLength: validated.message.length,
    });

    // Check guest limits BEFORE processing
    const guestStatus = await checkGuestStatus(validated.sessionId);

    if (guestStatus.isGuest && hasReachedGuestLimit(guestStatus.messageCount)) {
      console.log('❌ Guest limit reached:', guestStatus.messageCount);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GUEST_LIMIT_REACHED',
            message: 'Sign up to continue chatting',
            requiresAuth: true
          }
        },
        { status: 403 }
      );
    }

    // Fetch persona by ID or slug
    let persona;
    try {
      if (validated.personaId) {
        persona = await getPersonaById(validated.personaId);
      } else if (validated.personaSlug) {
        persona = await getPersonaBySlug(validated.personaSlug);
      }

      if (!persona) {
        return createErrorResponse(
          'Persona not found',
          'The requested persona does not exist or is not active',
          'PERSONA_NOT_FOUND',
          404
        );
      }

      console.log('✅ Persona fetched:', {
        id: persona.id,
        name: persona.name,
        slug: persona.slug
      });
    } catch (err: any) {
      console.error('❌ Error fetching persona:', err);
      return createErrorResponse(
        'Failed to fetch persona',
        err.message || 'Unable to retrieve persona information',
        'PERSONA_FETCH_ERROR',
        500
      );
    }

    // Moderate user message
    try {
      const moderationResult = await moderateContent(validated.message);
      if (moderationResult.flagged) {
        console.warn('⚠️ Content moderation triggered:', moderationResult);
        return createErrorResponse(
          'Content policy violation',
          'Your message contains content that violates our policies. Please rephrase and try again.',
          'MODERATION_ERROR',
          400
        );
      }
    } catch (err: any) {
      console.error('❌ Moderation check failed:', err);
      // Continue without moderation if service is unavailable
      // This prevents complete failure when moderation API is down
    }

    // Get or create session
    let session;
    try {
      session = await getOrCreateSession(validated.sessionId);
      console.log('✅ Session retrieved/created:', session.id);
    } catch (err: any) {
      console.error('❌ Session creation failed:', err);
      return createErrorResponse(
        'Session initialization failed',
        'Unable to create or retrieve session. Please try again.',
        'SESSION_ERROR',
        500
      );
    }

    // Get or create conversation with persona_id
    let conversationId: string = validated.conversationId || '';
    if (!conversationId) {
      try {
        const conversation = await createConversation({
          session_id: session.id,
          persona_id: persona.id, // Link conversation to persona
        });
        conversationId = conversation.id;
        console.log('✅ New conversation created:', conversationId, 'with persona:', persona.name);
      } catch (err: any) {
        console.error('❌ Conversation creation failed:', err);
        return createErrorResponse(
          'Conversation initialization failed',
          'Unable to create conversation. Please try again.',
          'CONVERSATION_ERROR',
          500
        );
      }
    }

    // At this point, conversationId is guaranteed to be a non-empty string
    if (!conversationId) {
      return createErrorResponse(
        'Conversation ID missing',
        'Unable to identify conversation. Please try again.',
        'CONVERSATION_ERROR',
        500
      );
    }

    // Save user message
    try {
      await saveMessage(conversationId, 'user', validated.message);
      console.log('✅ User message saved');
    } catch (err: any) {
      console.error('❌ Failed to save user message:', err);
      return createErrorResponse(
        'Message storage failed',
        'Unable to save your message. Please try again.',
        'STORAGE_ERROR',
        500
      );
    }

    // Get conversation history
    let history;
    try {
      history = await getConversationHistory(conversationId!);
      console.log('✅ Retrieved conversation history:', history.length, 'messages');
    } catch (err: any) {
      console.error('❌ Failed to retrieve history:', err);
      // Continue with empty history if retrieval fails
      history = [];
    }

    // Build system prompt from persona characteristics
    const systemPrompt = persona.system_prompt
      ? buildSystemPrompt(persona)
      : DEFAULT_SYSTEM_PROMPT;

    console.log('🤖 Generating AI response with:', {
      personaName: persona.name,
      historyLength: history.length,
      systemPromptLength: systemPrompt.length,
      isGuest: guestStatus.isGuest,
      guestMessageCount: guestStatus.messageCount,
    });

    // Generate AI response
    let aiResponse;
    try {
      aiResponse = await generateChatResponse({
        message: validated.message,
        history: history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        systemPrompt,
      });

      if (!aiResponse || typeof aiResponse !== 'string') {
        throw new Error('Invalid AI response format');
      }

      console.log('✅ AI response generated:', {
        responseLength: aiResponse.length,
      });
    } catch (err: any) {
      console.error('❌ AI generation failed:', err);
      return createErrorResponse(
        'AI response generation failed',
        err.message || 'Unable to generate response. Please try again in a moment.',
        'AI_ERROR',
        503
      );
    }

    // Save assistant message
    try {
      await saveMessage(conversationId, 'assistant', aiResponse);
      console.log('✅ Assistant message saved');
    } catch (err: any) {
      console.error('❌ Failed to save assistant message:', err);
      // Continue even if save fails - user still gets the response
    }

    // Increment guest message count if guest
    let updatedMessageCount = guestStatus.messageCount;
    if (guestStatus.isGuest && conversationId) {
      try {
        updatedMessageCount = await incrementGuestMessageCount(conversationId);
        console.log('✅ Guest message count incremented to:', updatedMessageCount);
      } catch (err: any) {
        console.error('❌ Failed to increment guest message count:', err);
        // Non-critical, continue without incrementing
      }
    }

    // Build response with persona info and guest status
    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
        conversationId,
        timestamp: new Date().toISOString(),
        persona: {
          id: persona.id,
          name: persona.name,
          slug: persona.slug,
          avatar_url: persona.avatar_url,
          short_description: persona.short_description,
        },
        guestLimit: guestStatus.isGuest ? {
          current: updatedMessageCount,
          max: 10,
          remainingMessages: Math.max(0, 10 - updatedMessageCount),
          isGuest: true
        } : null
      }
    });
  } catch (err: any) {
    console.error('❌ Unhandled error in chat route:', err);

    // Handle specific error types
    if (err instanceof ModerationError) {
      return createErrorResponse(
        'Content policy violation',
        err.message,
        'MODERATION_ERROR',
        400
      );
    }

    // Generic error handler
    return createErrorResponse(
      'Internal server error',
      'An unexpected error occurred. Please try again.',
      'INTERNAL_ERROR',
      500
    );
  }
}
