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
    // WASI caps `take` around 100 per request, so we page through explicitly.
    const pageSize = 100;
    const safetyCap = 2000; // guard against runaway loops
    const maxPages = 20;
    let skip = 0;
    let total = Infinity;
    const ids = new Set<number>();

    for (let page = 0; page < maxPages && skip < total && ids.size < safetyCap; page++) {
      const { properties, total: t } = await searchProperties({ skip, take: pageSize });
      if (t) total = t;
      if (!properties.length) break;
      for (const p of properties) {
        if (p.id_property) ids.add(p.id_property);
      }
      // If this page returned less than a full page, we're done.
      if (properties.length < pageSize) break;
      skip += pageSize;
    }

    propertyRoutes = Array.from(ids).map((id) => ({
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
