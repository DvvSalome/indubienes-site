import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function testEndpoint(url: string, method: string, body?: Record<string, unknown>) {
  const id_company = (process.env.WASI_COMPANY_ID || '').trim();
  const wasi_token = (process.env.WASI_TOKEN || '').trim();
  
  try {
    let finalUrl = url;
    const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' }, cache: 'no-store' };
    
    if (method === 'GET') {
      const params = new URLSearchParams({ id_company, wasi_token, ...(body as Record<string, string> || {}) });
      finalUrl = `${url}?${params}`;
    } else {
      opts.body = JSON.stringify({ id_company, wasi_token, ...body });
    }
    
    const r = await fetch(finalUrl, opts);
    const text = await r.text();
    const isJson = text.startsWith('{') || text.startsWith('[');
    return { status: r.status, isJson, sample: text.slice(0, 300) };
  } catch (e: unknown) { return { error: String(e) }; }
}

export async function GET() {
  const BASE = 'https://api.wasi.co/v1';
  const results: Record<string, unknown> = {};
  
  // Try various location endpoints
  results['POST /location/regions-by-country'] = await testEndpoint(`${BASE}/location/regions-by-country`, 'POST', { id_country: 1 });
  results['GET /location/regions-by-country'] = await testEndpoint(`${BASE}/location/regions-by-country`, 'GET', { id_country: '1' });
  results['POST /region/all'] = await testEndpoint(`${BASE}/region/all`, 'POST', { id_country: 1 });
  results['GET /region/all'] = await testEndpoint(`${BASE}/region/all`, 'GET', { id_country: '1' });
  results['POST /location/region/all'] = await testEndpoint(`${BASE}/location/region/all`, 'POST', { id_country: 1 });
  results['GET /location/all-regions'] = await testEndpoint(`${BASE}/location/all-regions`, 'GET', { id_country: '1' });
  results['POST /location/get-regions'] = await testEndpoint(`${BASE}/location/get-regions`, 'POST', { id_country: 1 });
  
  // Also test city endpoint variants
  results['POST /location/cities-by-region'] = await testEndpoint(`${BASE}/location/cities-by-region`, 'POST', { id_region: 2 });
  results['POST /city/all'] = await testEndpoint(`${BASE}/city/all`, 'POST', { id_region: 2 });
  results['GET /location/cities'] = await testEndpoint(`${BASE}/location/cities`, 'GET', { id_region: '2' });

  return NextResponse.json(results);
}
