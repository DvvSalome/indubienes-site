import { NextRequest, NextResponse } from 'next/server';
import { getHighlightedProperties, createProperty } from '@/lib/wasi';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const properties = await getHighlightedProperties();
    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Error fetching highlighted properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

// POST /api/properties — Create a new property in WASI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createProperty(body);

    if (result.status === 'success') {
      return NextResponse.json({ status: 'success', id_property: result.id_property });
    }

    return NextResponse.json({ error: result.message }, { status: 400 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
