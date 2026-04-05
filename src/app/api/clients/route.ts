import { NextRequest, NextResponse } from 'next/server';
import { searchClients, getClientStats, createClient } from '@/lib/wasi';

export const dynamic = 'force-dynamic';

/**
 * GET /api/clients
 * Fetch WASI clients (leads/contacts)
 * Query params: skip, take, stats
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const clientStats = await getClientStats();
      return NextResponse.json(clientStats);
    }

    const skip = Number(searchParams.get('skip')) || 0;
    const take = Number(searchParams.get('take')) || 10;
    const query = searchParams.get('query') || undefined;

    const result = await searchClients({ skip, take, query });
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/clients error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/clients — Create a new client in WASI
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await createClient(body);

    if (result.status === 'success') {
      return NextResponse.json({ status: 'success', id_client: result.id_client });
    }

    return NextResponse.json({ error: result.message }, { status: 400 });
  } catch (error) {
    console.error('POST /api/clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
