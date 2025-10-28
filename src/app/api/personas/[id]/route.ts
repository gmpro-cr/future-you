import { NextRequest, NextResponse } from 'next/server';
import { getPersonaBySlug, getPersonaById, updatePersonaRecord } from '@/lib/api/personas';
import { updatePersonaById, deletePersonaById } from '@/lib/api/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/personas/[id] - Get single persona by ID or slug
 * This route handles both UUID lookups and slug lookups for backward compatibility
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('📥 GET /api/personas/[id]', { id });

    // Try to determine if this is a UUID or a slug
    // UUIDs have a specific format with hyphens
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let persona;
    if (isUUID) {
      persona = await getPersonaById(id);
    } else {
      // Treat as slug
      persona = await getPersonaBySlug(id);
    }

    if (!persona) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Persona not found'
          }
        },
        { status: 404 }
      );
    }

    console.log('✅ Persona found:', persona.name);

    return NextResponse.json({
      success: true,
      data: { persona }
    });
  } catch (error: any) {
    console.error('❌ Error fetching persona:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Failed to fetch persona'
        }
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, systemPrompt, description, emoji } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (systemPrompt !== undefined) updates.system_prompt = systemPrompt;
    if (description !== undefined) updates.description = description;
    if (emoji !== undefined) updates.emoji = emoji;

    const persona = await updatePersonaById(params.id, updates);

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
    console.error('Error updating persona:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message || 'Failed to update persona',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deletePersonaById(params.id);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Persona deleted successfully',
      },
    });
  } catch (error: any) {
    console.error('Error deleting persona:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || 'Failed to delete persona',
        },
      },
      { status: 500 }
    );
  }
}
