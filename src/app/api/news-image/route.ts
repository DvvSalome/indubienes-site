import { NextRequest, NextResponse } from 'next/server';

// Server-side proxy that fetches a WASI news image and auto-trims
// the white borders that WASI bakes into thumbnails. Result is cached
// aggressively so Next/Image can re-optimize downstream.
//
// Usage: /api/news-image?u=<wasi_image_filename_or_full_url>
// Only images.wasi.co URLs are allowed as a safety measure.

export const runtime = 'nodejs';
export const revalidate = 86400; // 24h

const ALLOWED_HOSTS = new Set(['images.wasi.co', 'image.wasi.co']);

function resolveWasiUrl(input: string): string | null {
  if (!input) return null;
  // If it looks like a bare filename (e.g. b20260310035715.png), try to
  // promote to the largest size prefix WASI exposes ("m" → 578×270)
  // and build the canonical URL.
  if (!/^https?:\/\//i.test(input)) {
    const bare = input.replace(/^\/+/, '').replace(/^noticias\//, '');
    // If it starts with a known prefix letter, swap to 'm'
    const promoted = bare.replace(/^[bsmgo](\d)/, 'm$1');
    return `https://images.wasi.co/noticias/${promoted}`;
  }
  try {
    const u = new URL(input);
    if (!ALLOWED_HOSTS.has(u.hostname)) return null;
    // Promote /noticias/bXXXX.png → /noticias/mXXXX.png for higher res
    u.pathname = u.pathname.replace(
      /\/noticias\/([bsmgo])(\d)/,
      '/noticias/m$2'
    );
    return u.toString();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('u') || '';
  const src = resolveWasiUrl(raw);

  if (!src) {
    return NextResponse.json(
      { error: 'invalid url' },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(src, {
      headers: { 'User-Agent': 'indubienes-site/1.0' },
      cache: 'force-cache',
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'upstream error', status: upstream.status },
        { status: 502 }
      );
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());

    // Dynamic import so the module doesn't crash at build time if sharp
    // isn't resolvable in the build environment.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sharpMod: any = null;
    try {
      sharpMod = (await import('sharp')).default;
    } catch {
      sharpMod = null;
    }

    // Auto-trim white borders with a tolerant threshold, then resize to
    // a sensible max and output webp. Falls back to original if sharp
    // isn't available.
    let processed: Buffer = buffer;
    let contentType = upstream.headers.get('content-type') || 'image/png';

    if (sharpMod) {
      try {
        processed = await sharpMod(buffer)
          .trim({ background: '#ffffff', threshold: 12 })
          .resize({
            width: 1200,
            height: 900,
            fit: 'inside',
            withoutEnlargement: false,
          })
          .webp({ quality: 86 })
          .toBuffer();
        contentType = 'image/webp';
      } catch {
        try {
          processed = await sharpMod(buffer)
            .resize({ width: 1200, withoutEnlargement: false })
            .webp({ quality: 86 })
            .toBuffer();
          contentType = 'image/webp';
        } catch {
          // keep original
        }
      }
    }

    return new NextResponse(processed, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control':
          'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        'X-Wasi-Src': src,
      },
    });
  } catch (err) {
    console.error('news-image proxy error', err);
    return NextResponse.json({ error: 'proxy failed' }, { status: 500 });
  }
}
