import { NextResponse } from 'next/server';
import { searchProperties } from '@/lib/wasi';

export const dynamic = 'force-dynamic';

// GET /api/properties/all — Fetch all properties for admin selector (up to 100)
export async function GET() {
  try {
    const result = await searchProperties({ skip: 0, take: 100 });
    return NextResponse.json({
      properties: result.properties.map(p => ({
        id_property: p.id_property,
        title: p.title,
        sale_price: p.sale_price,
        rent_price: p.rent_price,
        city_label: p.city_label,
        zone_label: p.zone_label,
        property_type_label: p.property_type_label,
        main_image: p.main_image,
        for_sale: p.for_sale,
        for_rent: p.for_rent,
      })),
      total: result.total,
    });
  } catch (error) {
    console.error('Error fetching all properties:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
