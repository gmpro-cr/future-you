import { NextResponse } from 'next/server';
import { getPersonas } from '@/lib/utils/personas';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      personas: getPersonas(),
    },
  });
}
