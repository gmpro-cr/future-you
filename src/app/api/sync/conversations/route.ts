import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';

// GET - Fetch conversation for a specific persona
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get('personaId');

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
      return NextResponse.json({ conversation: null }, { status: 200 });
    }

    // Fetch conversation for this persona
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('persona_id', personaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No conversation exists yet
        return NextResponse.json({ conversation: null }, { status: 200 });
      }
      console.error('Error fetching conversation:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Conversation fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save/update conversation for a persona
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const body = await request.json();
    const { personaId, messages } = body;

    if (!personaId || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Missing personaId or messages' },
        { status: 400 }
      );
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

    // Check if conversation already exists
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)
      .eq('persona_id', personaId)
      .single();

    let result;

    if (existingConversation) {
      // Update existing conversation
      const { data, error } = await supabase
        .from('conversations')
        .update({ messages })
        .eq('id', existingConversation.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating conversation:', error);
        return NextResponse.json(
          { error: 'Failed to update conversation' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          persona_id: personaId,
          messages,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      conversation: result,
    });
  } catch (error) {
    console.error('Conversation sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete conversation for a persona
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get('personaId');

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

    // Delete the conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', user.id)
      .eq('persona_id', personaId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return NextResponse.json(
        { error: 'Failed to delete conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversation delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
