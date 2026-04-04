import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

interface LoginRequest {
  company_id: string;
  wasi_token: string;
}

/**
 * POST /api/auth/login
 * Verifies WASI API credentials and creates a session cookie on success.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as LoginRequest;

    const { company_id, wasi_token } = body;

    // Validate input
    if (!company_id || !wasi_token) {
      return NextResponse.json(
        { error: 'Missing company_id or wasi_token' },
        { status: 400 }
      );
    }

    // Verify credentials by calling WASI API
    const isValid = await verifyWasiCredentials(company_id, wasi_token);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid WASI credentials' },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = createSessionToken(company_id, wasi_token);

    // Create response
    const response = NextResponse.json({ success: true });

    // Set secure httpOnly cookie
    response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verifies WASI API credentials by making a test API call.
 * Returns true if the call succeeds (credentials are valid), false otherwise.
 */
async function verifyWasiCredentials(
  companyId: string,
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(
      'https://api.wasi.co/v1/property/search',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Company-ID': companyId,
          'Content-Type': 'application/json',
        },
      }
    );

    // If response is 2xx, credentials are valid
    return response.ok;
  } catch (error) {
    console.error('WASI API verification failed:', error);
    return false;
  }
}
