import { NextRequest, NextResponse } from 'next/server';
import { checkGuestStatus } from '@/lib/utils/guestMode';

export const dynamic = 'force-dynamic';

/**
 * GET /api/guest/status - Check guest session status
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_SESSION_ID',
            message: 'Session ID is required'
          }
        },
        { status: 400 }
      );
    }

    const status = await checkGuestStatus(sessionId);

    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error('Error checking guest status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STATUS_CHECK_ERROR',
          message: error.message || 'Failed to check guest status'
        }
      },
      { status: 500 }
    );
  }
}
