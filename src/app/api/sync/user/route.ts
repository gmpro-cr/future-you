import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const body = await request.json();

    // Extract Google ID from session
    // @ts-ignore - Custom field from Google
    const googleId = session.user.googleId || session.user.id;

    if (!googleId) {
      return NextResponse.json({ error: 'Missing Google ID' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (user doesn't exist yet)
      console.error('Error fetching user:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const userData = {
      google_id: googleId,
      email: body.email || session.user.email || '',
      name: body.name || session.user.name || '',
      image: body.image || session.user.image || null,
      // @ts-ignore
      locale: body.locale || session.user.locale || null,
      // @ts-ignore
      email_verified: body.emailVerified !== undefined ? body.emailVerified : (session.user.emailVerified || false),
      birthdate: body.birthdate || null,
      country: body.country || null,
      profession: body.profession || null,
    };

    let result;

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('google_id', googleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
      }
      result = data;
    } else {
      // Insert new user
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      user: result,
      action: existingUser ? 'updated' : 'created',
    });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // @ts-ignore
    const googleId = session.user.googleId || session.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User doesn't exist yet
        return NextResponse.json({ user: null }, { status: 200 });
      }
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
