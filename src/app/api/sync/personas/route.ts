import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';

// GET - Fetch all personas for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // @ts-ignore
    const googleId = session.user.googleId || session.user.id;

    // Get user ID from google_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('google_id', googleId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ personas: [] }, { status: 200 });
    }

    // Fetch all personas for this user
    const { data: personas, error } = await supabase
      .from('personas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching personas:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ personas: personas || [] });
  } catch (error) {
    console.error('Personas fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Sync personas from localStorage (batch upsert)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const body = await request.json();
    const { personas } = body;

    if (!Array.isArray(personas)) {
      return NextResponse.json({ error: 'Invalid personas data' }, { status: 400 });
    }

    // @ts-ignore
    const googleId = session.user.googleId || session.user.id;

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('google_id', googleId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get existing personas for this user
    const { data: existingPersonas, error: fetchError } = await supabase
      .from('personas')
      .select('id')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Error fetching existing personas:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const existingIds = new Set(existingPersonas?.map(p => p.id) || []);
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
    };

    // Process each persona
    for (const persona of personas) {
      const personaData = {
        user_id: user.id,
        name: persona.name,
        description: persona.description,
        system_prompt: persona.systemPrompt,
        emoji: persona.emoji || null,
        avatar_url: persona.avatarUrl || null,
      };

      if (existingIds.has(persona.id)) {
        // Update existing persona
        const { error } = await supabase
          .from('personas')
          .update(personaData)
          .eq('id', persona.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating persona:', error);
          results.failed++;
        } else {
          results.updated++;
        }
      } else {
        // Insert new persona with the same ID from localStorage
        const { error } = await supabase
          .from('personas')
          .insert({ ...personaData, id: persona.id });

        if (error) {
          console.error('Error creating persona:', error);
          results.failed++;
        } else {
          results.created++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Personas sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific persona
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get('id');

    if (!personaId) {
      return NextResponse.json({ error: 'Missing persona ID' }, { status: 400 });
    }

    // @ts-ignore
    const googleId = session.user.googleId || session.user.id;

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('google_id', googleId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the persona (only if it belongs to this user)
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('id', personaId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting persona:', error);
      return NextResponse.json({ error: 'Failed to delete persona' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Persona delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
