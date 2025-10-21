import { NextResponse } from 'next/server';
import { PERSONAS } from '@/lib/utils/constants';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      personas: PERSONAS,
    },
  });
}
