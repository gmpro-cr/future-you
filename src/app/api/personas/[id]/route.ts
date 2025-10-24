import { NextRequest, NextResponse } from 'next/server';
import { updatePersonaById, deletePersonaById } from '@/lib/api/supabase';

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
