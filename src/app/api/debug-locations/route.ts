import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function test(url: string, method: string, body?: Record<string, unknown>) {
  const id_company = (process.env.WASI_COMPANY_ID || '').trim();
  const wasi_token = (process.env.WASI_TOKEN || '').trim();
  try {
    let finalUrl = url;
    const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' }, cache: 'no-store' };
    if (method === 'GET') {
      const params = new URLSearchParams({ id_company, wasi_token, ...(body as Record<string,string> || {}) });
      finalUrl = `${url}?${params}`;
    } else {
      opts.body = JSON.stringify({ id_company, wasi_token, ...body });
    }
    const r = await fetch(finalUrl, opts);
    const text = await r.text();
    const isJson = text.startsWith('{') || text.startsWith('[');
    return { s: r.status, ok: isJson, d: text.slice(0, 400) };
  } catch (e: unknown) { return { err: String(e) }; }
}

export async function GET() {
  const B = 'https://api.wasi.co/v1';
  const r: Record<string, unknown> = {};
  
  // /location/country patterns
  r['POST /location/country/all'] = await test(`${B}/location/country/all`, 'POST');
  r['POST /location/country/1'] = await test(`${B}/location/country/1`, 'POST');
  
  // /location/region patterns  
  r['POST /location/region/1'] = await test(`${B}/location/region/1`, 'POST');
  r['POST /location/region/2'] = await test(`${B}/location/region/2`, 'POST');
  r['POST /location/regions'] = await test(`${B}/location/regions`, 'POST', { id_country: 1 });
  
  // /location/city patterns
  r['POST /location/city/496'] = await test(`${B}/location/city/496`, 'POST');
  r['POST /location/cities'] = await test(`${B}/location/cities`, 'POST', { id_region: 2 });
  
  // /location/zone patterns
  r['POST /location/zone/1'] = await test(`${B}/location/zone/1`, 'POST');
  r['POST /location/zones'] = await test(`${B}/location/zones`, 'POST', { id_city: 496 });

  // Try searching with property that has location data
  r['POST /property/search (1 result)'] = await test(`${B}/property/search`, 'POST', { take: 1, skip: 0 });
  
  return NextResponse.json(r);
}
