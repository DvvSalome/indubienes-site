import { NextResponse } from 'next/server';
import { getHighlightedProperties } from '@/lib/wasi';

export async function GET() {
  try {
    const properties = await getHighlightedProperties();
    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Error fetching highlighted properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
