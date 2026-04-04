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
    // WASI API uses query parameters for authentication, not headers
    const params = new URLSearchParams({
      id_company: companyId,
      wasi_token: token,
      take: '1',
      skip: '0',
    });

    const response = await fetch(
      `https://api.wasi.co/v1/property/search?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Check if we got a valid JSON response (not an error page)
    if (!response.ok) return false;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return false;

    const data = await response.json();
    // WASI returns an object with numeric keys for properties
    return data && typeof data === 'object' && !data.error;
  } catch (error) {
    console.error('WASI API verification failed:', error);
    return false;
  }
}
