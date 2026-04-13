import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const B = 'https://api.wasi.co/v1';
  const id_company = (process.env.WASI_COMPANY_ID || '').trim();
  const wasi_token = (process.env.WASI_TOKEN || '').trim();
  
  const results: Record<string, unknown> = {};
  
  // Just test 3 specific IDs
  for (const id of [1, 2, 3]) {
    try {
      const r = await fetch(`${B}/location/region/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_company, wasi_token }),
        cache: 'no-store',
      });
      results[`region_${id}`] = { status: r.status, body: await r.text().then(t => t.slice(0, 200)) };
    } catch (e: unknown) { results[`region_${id}`] = String(e); }
  }

  // Test city 496 (Medellin)
  try {
    const r = await fetch(`${B}/location/city/496`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_company, wasi_token }),
      cache: 'no-store',
    });
    results.city_496 = { status: r.status, body: await r.text().then(t => t.slice(0, 200)) };
  } catch (e: unknown) { results.city_496 = String(e); }

  // Test getting location from property data
  try {
    const r = await fetch(`${B}/property/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_company, wasi_token, take: 3, skip: 0 }),
      cache: 'no-store',
    });
    const d = await r.json();
    const props = Object.entries(d).filter(([k]) => !isNaN(Number(k))).map(([,v]) => {
      const p = v as Record<string, unknown>;
      return { id: p.id_property, region: p.id_region, region_label: p.region_label, city: p.id_city, city_label: p.city_label, zone: p.id_zone, zone_label: p.zone_label };
    });
    results.property_locations = props;
  } catch (e: unknown) { results.property_locations = String(e); }

  return NextResponse.json(results);
}
