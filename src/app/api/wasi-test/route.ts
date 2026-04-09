import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const raw_company = process.env.WASI_COMPANY_ID || '';
  const raw_token = process.env.WASI_TOKEN || '';
  const company = raw_company.trim();
  const token = raw_token.trim();

  const url = `https://api.wasi.co/v1/property/highlighted/?id_company=${encodeURIComponent(company)}&wasi_token=${encodeURIComponent(token)}&for_sale=true`;

  try {
    const r = await fetch(url, { cache: 'no-store' });
    const text = await r.text();
    let parsed: unknown = null;
    try { parsed = JSON.parse(text); } catch {}
    const numericKeys = parsed && typeof parsed === 'object'
      ? Object.keys(parsed as Record<string, unknown>).filter(k => !isNaN(Number(k)))
      : [];

    return NextResponse.json({
      raw_company_length: raw_company.length,
      raw_company_charcodes: Array.from(raw_company).map(c => c.charCodeAt(0)),
      raw_token_length: raw_token.length,
      raw_token_first_4: raw_token.substring(0, 4),
      raw_token_last_4: raw_token.substring(raw_token.length - 4),
      raw_token_last_charcode: raw_token.length > 0 ? raw_token.charCodeAt(raw_token.length - 1) : null,
      trimmed_company_length: company.length,
      trimmed_token_length: token.length,
      http_status: r.status,
      response_preview: text.substring(0, 300),
      numeric_keys_count: numericKeys.length,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
