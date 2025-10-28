import { NextRequest, NextResponse } from 'next/server';
import { getAllPersonas, getPersonaCategories, createPersonaRecord } from '@/lib/api/personas';
import { PersonaCategory } from '@/types/persona';

export const dynamic = 'force-dynamic';

/**
 * GET /api/personas - List all personas with filtering
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category') as PersonaCategory | null;
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    console.log('📥 GET /api/personas', { category, search, tags });

    const [personas, categories] = await Promise.all([
      getAllPersonas(category || undefined, search || undefined, tags),
      getPersonaCategories()
    ]);

    console.log(`✅ Returning ${personas.length} personas`);

    return NextResponse.json({
      success: true,
      data: {
        personas,
        categories,
        total: personas.length
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching personas:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Failed to fetch personas'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/personas - Create new persona (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await req.json();

    console.log('📝 POST /api/personas', { name: body.name, category: body.category });

    const persona = await createPersonaRecord(body);

    console.log('✅ Persona created:', persona.id);

    return NextResponse.json({
      success: true,
      data: { persona }
    });
  } catch (error: any) {
    console.error('❌ Error creating persona:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || 'Failed to create persona'
        }
      },
      { status: 500 }
    );
  }
}
