import { NextRequest, NextResponse } from 'next/server';
import { searchProperties } from '@/lib/wasi';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json();
    const result = await searchProperties(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json({ error: 'Failed to search properties' }, { status: 500 });
  }
}
