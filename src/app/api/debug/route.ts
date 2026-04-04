import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const WASI_BASE_URL = 'https://api.wasi.co/v1';
  const WASI_COMPANY_ID = (process.env.WASI_COMPANY_ID || '1288465').trim();
  const WASI_TOKEN = (process.env.WASI_TOKEN || '***REDACTED***').trim();

  try {
    const url = `${WASI_BASE_URL}/property/highlighted/?id_company=${WASI_COMPANY_ID}&wasi_token=${WASI_TOKEN}&for_sale=true`;

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const status = response.status;
    const text = await response.text();

    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      // not json
    }

    return NextResponse.json({
      debug: true,
      env_token_set: !!process.env.WASI_TOKEN,
      env_token_length: (process.env.WASI_TOKEN || '').length,
      env_company: WASI_COMPANY_ID,
      fallback_token_used: !process.env.WASI_TOKEN,
      api_url: url.replace(WASI_TOKEN, '***'),
      response_status: status,
      response_length: text.length,
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
