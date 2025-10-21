import { NextRequest, NextResponse } from 'next/server';
import { getConversationsBySession, getConversationHistory } from '@/lib/api/supabase';
import { handleError } from '@/lib/middleware/error-handler';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required',
          },
        },
        { status: 400 }
      );
    }

    const conversations = await getConversationsBySession(sessionId);

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        total: conversations.length,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
