import { NextRequest, NextResponse } from 'next/server';
import { getAllPersonas, createPersona } from '@/lib/api/supabase';

export async function GET() {
  try {
    const personas = await getAllPersonas();

    // Transform to match frontend format
    const transformedPersonas = personas.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      systemPrompt: p.system_prompt,
      emoji: p.emoji,
      type: p.type,
      createdAt: p.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        personas: transformedPersonas,
      },
    });
  } catch (error: any) {
    console.error('Error fetching personas:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Failed to fetch personas',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔵 POST /api/personas - Request received');

    const body = await req.json();
    console.log('📦 Request body:', {
      name: body.name,
      systemPromptLength: body.systemPrompt?.length,
      description: body.description,
      emoji: body.emoji,
    });

    const { name, systemPrompt, description, emoji } = body;

    if (!name || !systemPrompt) {
      console.error('❌ Validation failed - missing name or systemPrompt');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name and system prompt are required',
          },
        },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed, calling createPersona...');
    const persona = await createPersona(name, systemPrompt, description, emoji);
    console.log('✅ Persona created successfully:', persona.id);

    return NextResponse.json({
      success: true,
      data: {
        persona: {
          id: persona.id,
          name: persona.name,
          description: persona.description,
          systemPrompt: persona.system_prompt,
          emoji: persona.emoji,
          createdAt: persona.created_at,
        },
      },
    });
  } catch (error: any) {
    console.error('💥 Error creating persona:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || 'Failed to create persona',
          details: error.details || error.hint || undefined,
        },
      },
      { status: 500 }
    );
  }
}
