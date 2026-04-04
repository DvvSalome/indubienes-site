import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Hardcoded test - bypass env vars entirely
  const COMPANY = '1288465';
  const TOKEN = '***REDACTED***';

  try {
    // Test 1: Using URLSearchParams (like wasi.ts does)
    const params = new URLSearchParams({
      id_company: COMPANY,
      wasi_token: TOKEN,
      for_sale: 'true',
    });
    const url1 = `https://api.wasi.co/v1/property/highlighted/?${params.toString()}`;

    const resp1 = await fetch(url1, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const text1 = await resp1.text();
    let parsed1 = null;
    try { parsed1 = JSON.parse(text1); } catch { /* */ }

    // Test 2: Using template literal (manual)
    const url2 = `https://api.wasi.co/v1/property/highlighted/?id_company=${COMPANY}&wasi_token=${TOKEN}&for_sale=true`;

    const resp2 = await fetch(url2, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const text2 = await resp2.text();
    let parsed2 = null;
    try { parsed2 = JSON.parse(text2); } catch { /* */ }

    return NextResponse.json({
      test1_urlsearchparams: {
        url: url1,
        status: resp1.status,
        keys: parsed1 ? Object.keys(parsed1).slice(0, 5) : null,
        first_title: parsed1?.['0']?.title || null,
        preview: text1.substring(0, 200),
      },
      test2_template: {
        url: url2,
        status: resp2.status,
        keys: parsed2 ? Object.keys(parsed2).slice(0, 5) : null,
        first_title: parsed2?.['0']?.title || null,
        preview: text2.substring(0, 200),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
