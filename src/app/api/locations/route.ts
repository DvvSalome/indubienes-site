import { NextRequest, NextResponse } from 'next/server';
import { getRegions, getCities, getZones, getPropertyTypes } from '@/lib/wasi';

export const dynamic = 'force-dynamic';

// GET /api/locations?type=regions&country=1
// GET /api/locations?type=cities&region=2
// GET /api/locations?type=zones&city=496
// GET /api/locations?type=property-types
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (type === 'regions') {
      const countryId = Number(searchParams.get('country')) || 1;
      const regions = await getRegions(countryId);
      return NextResponse.json({ data: regions });
    }

    if (type === 'cities') {
      const regionId = Number(searchParams.get('region'));
      if (!regionId) return NextResponse.json({ error: 'region param required' }, { status: 400 });
      const cities = await getCities(regionId);
      return NextResponse.json({ data: cities });
    }

    if (type === 'zones') {
      const cityId = Number(searchParams.get('city'));
      if (!cityId) return NextResponse.json({ error: 'city param required' }, { status: 400 });
      const zones = await getZones(cityId);
      return NextResponse.json({ data: zones });
    }

    if (type === 'property-types') {
      const types = await getPropertyTypes();
      return NextResponse.json({ data: types });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
