import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('indubienes_session');
  if (!sessionCookie) {
    return NextResponse.json({ status: 'ok', message: 'debug endpoint requires auth' }, { status: 401 });
  }
  const session = verifySessionToken(sessionCookie.value);
  if (!session) {
    return NextResponse.json({ status: 'ok', message: 'debug endpoint requires auth' }, { status: 401 });
  }

  const WASI_COMPANY_ID = (process.env.WASI_COMPANY_ID || '1288465').trim();
  const WASI_TOKEN = (process.env.WASI_TOKEN || '***REDACTED***').trim();

  try {
    // Replicate exact wasiRequest logic for highlighted
    const queryParams = new URLSearchParams({
      id_company: WASI_COMPANY_ID,
      wasi_token: WASI_TOKEN,
      for_sale: 'true',
    });
    const url = `https://api.wasi.co/v1/property/highlighted/?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ step: 'response_not_ok', status: response.status, statusText: response.statusText });
    }

    const data = await response.json();

    // Check WASI error
    if (data?.status === 'error' || data?.error) {
      return NextResponse.json({ step: 'wasi_error', data });
    }

    // Extract properties (numeric keys only)
    const properties = Object.entries(data)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([key, value]: [string, unknown]) => {
        const raw = value as Record<string, unknown>;
        return {
          key,
          id: raw.id_property,
          title: (raw.title as string)?.substring(0, 50),
          image: (raw.main_image as Record<string, string>)?.url?.substring(0, 50),
        };
      });

    return NextResponse.json({
      step: 'success',
      token_used: WASI_TOKEN.substring(0, 4) + '...' + WASI_TOKEN.substring(WASI_TOKEN.length - 4),
      company_used: WASI_COMPANY_ID,
      response_keys: Object.keys(data),
      properties_found: properties.length,
      properties: properties.slice(0, 3),
    });
  } catch (error: unknown) {
    return NextResponse.json({
      step: 'exception',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
