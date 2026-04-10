import type { MetadataRoute } from 'next';
import { searchProperties } from '@/lib/wasi';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://indubienes-site.vercel.app';

// Revalidate the sitemap every 6 hours so new WASI listings are picked up
// without hammering the API on every crawl.
export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static, high-priority routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/propiedades`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contacto`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/politica-privacidad`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/autorizacion-datos`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic property detail pages — fetch every property from WASI.
  // We pull in pages of 100 until we've collected `total` or hit a safety cap.
  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const pageSize = 100;
    const safetyCap = 1000; // guard against runaway loops
    let skip = 0;
    let total = Infinity;
    const ids: number[] = [];

    while (skip < total && ids.length < safetyCap) {
      const { properties, total: t } = await searchProperties({ skip, take: pageSize });
      if (!properties.length) break;
      total = t;
      for (const p of properties) {
        if (p.id_property) ids.push(p.id_property);
      }
      skip += pageSize;
    }

    propertyRoutes = ids.map((id) => ({
      url: `${SITE_URL}/propiedad/${id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (err) {
    // If WASI is down at build/revalidate time we still return static routes
    // instead of breaking the whole sitemap.
    console.error('sitemap: failed to fetch WASI properties', err);
  }

  return [...staticRoutes, ...propertyRoutes];
}
