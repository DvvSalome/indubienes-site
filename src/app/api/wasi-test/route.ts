import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env_company = (process.env.WASI_COMPANY_ID || '').trim();
  const env_token = (process.env.WASI_TOKEN || '').trim();
  const hard_company = '1288465';
  const hard_token = '***REDACTED***';

  async function callWasi(c: string, t: string) {
    const url = `https://api.wasi.co/v1/property/highlighted/?id_company=${encodeURIComponent(c)}&wasi_token=${encodeURIComponent(t)}&for_sale=true`;
    const r = await fetch(url, { cache: 'no-store' });
    const text = await r.text();
    return { status: r.status, body: text.substring(0, 200) };
  }

  const env_charcodes = Array.from(env_token).map(c => c.charCodeAt(0));
  const hard_charcodes = Array.from(hard_token).map(c => c.charCodeAt(0));
  const env_eq_hard = env_token === hard_token;

  const env_result = await callWasi(env_company, env_token);
  const hard_result = await callWasi(hard_company, hard_token);

  return NextResponse.json({
    env_token_length: env_token.length,
    hard_token_length: hard_token.length,
    env_eq_hard,
    env_charcodes,
    hard_charcodes,
    env_company_eq: env_company === hard_company,
    env_company_chars: Array.from(env_company).map(c => c.charCodeAt(0)),
    env_result,
    hard_result,
  });
}
