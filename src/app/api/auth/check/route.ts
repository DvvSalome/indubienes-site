import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionCookie = request.cookies.get('indubienes_session');
    if (!sessionCookie) {
      return NextResponse.json({ isValid: false, error: 'No session' }, { status: 401 });
    }
    const session = verifySessionToken(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ isValid: false, error: 'Invalid session' }, { status: 401 });
    }
    return NextResponse.json({ isValid: true, companyId: session.companyId });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isValid: false, error: 'Server error' }, { status: 500 });
  }
}
