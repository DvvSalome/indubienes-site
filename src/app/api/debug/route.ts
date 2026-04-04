import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const WASI_BASE_URL = 'https://api.wasi.co/v1';
  const WASI_COMPANY_ID = (process.env.WASI_COMPANY_ID || '1288465').trim();
  const WASI_TOKEN = (process.env.WASI_TOKEN || '***REDACTED***').trim();

  // Token reveal: first 4 + last 4 chars for debugging
  const rawToken = process.env.WASI_TOKEN || '';
  const tokenReveal = rawToken.length > 8
    ? rawToken.substring(0, 4) + '...' + rawToken.substring(rawToken.length - 4)
    : 'too_short';
  const trimmedTokenReveal = WASI_TOKEN.length > 8
    ? WASI_TOKEN.substring(0, 4) + '...' + WASI_TOKEN.substring(WASI_TOKEN.length - 4)
    : 'too_short';

  try {
    const url = `${WASI_BASE_URL}/property/highlighted/?id_company=${WASI_COMPANY_ID}&wasi_token=${WASI_TOKEN}&for_sale=true`;

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const text = await response.text();

    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // not json
    }

    return NextResponse.json({
      debug: true,
      env_token_raw_length: rawToken.length,
      env_token_trimmed_length: WASI_TOKEN.length,
      token_reveal_raw: tokenReveal,
      token_reveal_trimmed: trimmedTokenReveal,
      env_company_raw: process.env.WASI_COMPANY_ID,
      env_company_trimmed: WASI_COMPANY_ID,
      response_status: response.status,
      response_keys: parsed ? Object.keys(parsed).slice(0, 10) : null,
      first_property_title: parsed && parsed['0'] ? parsed['0'].title : null,
      raw_preview: text.substring(0, 300),
    });
  } catch (error: unknown) {
    return NextResponse.json({
      debug: true,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
