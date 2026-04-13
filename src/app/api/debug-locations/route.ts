import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const WASI_BASE = 'https://api.wasi.co/v1';
  const id_company = (process.env.WASI_COMPANY_ID || '').trim();
  const wasi_token = (process.env.WASI_TOKEN || '').trim();
  const results: Record<string, unknown> = { id_company: id_company ? 'SET' : 'MISSING', wasi_token: wasi_token ? 'SET' : 'MISSING' };

  // Test 1: POST regions
  try {
    const r1 = await fetch(`${WASI_BASE}/location/regions-by-country`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_company, wasi_token, id_country: 1 }),
      cache: 'no-store',
    });
    const d1 = await r1.json();
    const keys = Object.keys(d1).slice(0, 10);
    results.regions_post = { status: r1.status, keys, sample: JSON.stringify(d1).slice(0, 500) };
  } catch (e: unknown) { results.regions_post = { error: String(e) }; }

  // Test 2: GET regions
  try {
    const params = new URLSearchParams({ id_company, wasi_token, id_country: '1' });
    const r2 = await fetch(`${WASI_BASE}/location/regions-by-country?${params}`, { cache: 'no-store' });
    const d2 = await r2.json();
    const keys = Object.keys(d2).slice(0, 10);
    results.regions_get = { status: r2.status, keys, sample: JSON.stringify(d2).slice(0, 500) };
  } catch (e: unknown) { results.regions_get = { error: String(e) }; }

  // Test 3: cities for Antioquia (region 2) POST
  try {
    const r3 = await fetch(`${WASI_BASE}/location/cities-by-region`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_company, wasi_token, id_region: 2 }),
      cache: 'no-store',
    });
    const d3 = await r3.json();
    const keys = Object.keys(d3).slice(0, 10);
    results.cities_antioquia = { status: r3.status, keys, sample: JSON.stringify(d3).slice(0, 500) };
  } catch (e: unknown) { results.cities_antioquia = { error: String(e) }; }

  return NextResponse.json(results);
}
