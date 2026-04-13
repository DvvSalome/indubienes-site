import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const B = 'https://api.wasi.co/v1';
  const id_company = (process.env.WASI_COMPANY_ID || '').trim();
  const wasi_token = (process.env.WASI_TOKEN || '').trim();

  // Discover all regions (1-35)
  const regionPromises = Array.from({ length: 35 }, (_, i) => i + 1).map(async (id) => {
    try {
      const r = await fetch(`${B}/location/region/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_company, wasi_token }),
        cache: 'no-store',
      });
      const d = await r.json();
      if (d.status === 'success' && d.id_region) {
        return { id: d.id_region, name: d.name };
      }
      return null;
    } catch { return null; }
  });

  const regions = (await Promise.all(regionPromises)).filter(Boolean);

  // Discover Antioquia cities (try IDs around 490-520, plus common ones)
  const cityIds = [...Array.from({ length: 50 }, (_, i) => 480 + i), ...Array.from({ length: 30 }, (_, i) => 1 + i)];
  const cityPromises = cityIds.map(async (id) => {
    try {
      const r = await fetch(`${B}/location/city/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_company, wasi_token }),
        cache: 'no-store',
      });
      const d = await r.json();
      if (d.status === 'success' && d.id_city) {
        return { id: d.id_city, name: d.name, region: d.id_region };
      }
      return null;
    } catch { return null; }
  });

  const cities = (await Promise.all(cityPromises)).filter(Boolean);
  const antioquiaCities = cities.filter((c: { region?: number }) => c && c.region === 2);

  return NextResponse.json({ regions, antioquiaCities, allCitiesFound: cities });
}
