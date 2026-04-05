import { NextRequest, NextResponse } from 'next/server';
import { updateClient } from '@/lib/wasi';

export const dynamic = 'force-dynamic';

// PUT /api/clients/[id] — Update a client in WASI
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const body = await request.json();
    const result = await updateClient(id, body);

    if (result.status === 'success') {
      return NextResponse.json({ status: 'success' });
    }

    return NextResponse.json({ error: result.message }, { status: 400 });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}
