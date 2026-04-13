import { NextRequest, NextResponse } from 'next/server';
import { uploadPropertyImage } from '@/lib/wasi';

export const dynamic = 'force-dynamic';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = 'Adriangar333/indubienes-site';
const GITHUB_BRANCH = 'master';

/**
 * POST /api/media/upload
 *
 * Unified media upload endpoint.
 * Images should be pre-compressed client-side via compressImage() utility
 * before upload for optimal performance.
 *
 * Accepts multipart/form-data with:
 *   - image (required): the file blob (ideally pre-compressed)
 *   - target (required): "property" | "blog"
 *   - entityId (optional): property ID (required for target=property)
 *   - description (optional)
 *   - position (optional)
 *   - filename (optional): custom filename for blog images
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const target = (formData.get('target') as string) || '';

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No se recibió la imagen' }, { status: 400 });
    }

    if (!['property', 'blog'].includes(target)) {
      return NextResponse.json(
        { error: 'Target inválido. Usa "property" o "blog".' },
        { status: 400 }
      );
    }

    // --- PROPERTY: forward to WASI ---
    if (target === 'property') {
      const entityId = formData.get('entityId');
      const id = entityId ? parseInt(String(entityId), 10) : NaN;
      if (isNaN(id) || id <= 0) {
        return NextResponse.json({ error: 'entityId (property ID) requerido' }, { status: 400 });
      }
      const description = (formData.get('description') as string) || undefined;
      const posRaw = formData.get('position');
      const position = posRaw ? Number(posRaw) : undefined;
      const filename =
        file instanceof File && file.name ? file.name : `property-${id}-${Date.now()}.jpg`;

      const result = await uploadPropertyImage(id, file, filename, { description, position });
      if (result.status === 'success') {
        return NextResponse.json({ status: 'success', id_image: result.id_image });
      }
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // --- BLOG: push to GitHub → public/blog/ ---
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN no configurado' }, { status: 500 });
    }

    const customName = formData.get('filename') as string | null;
    const originalName =
      file instanceof File && file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '-') : '';
    const safeName = customName
      ? customName.replace(/[^a-zA-Z0-9._-]/g, '-')
      : originalName || `blog-${Date.now()}.jpg`;

    const filePath = `public/blog/${safeName}`;
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    };

    let existingSha: string | undefined;
    try {
      const check = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, { headers });
      if (check.ok) {
        const data = await check.json();
        existingSha = data.sha;
      }
    } catch {
      // File doesn't exist yet
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Content = buffer.toString('base64');

    const body: Record<string, unknown> = {
      message: `media: upload blog image ${safeName}`,
      content: base64Content,
      branch: GITHUB_BRANCH,
      committer: {
        name: 'Adrian Garzon',
        email: 'adriangarzon22@gmail.com',
      },
    };
    if (existingSha) body.sha = existingSha;

    const pushRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!pushRes.ok) {
      const err = await pushRes.json().catch(() => ({}));
      console.error('GitHub push error:', err);
      return NextResponse.json(
        { error: `Error subiendo a GitHub: ${err.message || pushRes.status}` },
        { status: 500 }
      );
    }

    const pushData = await pushRes.json();
    const publicUrl = `/blog/${safeName}`;

    return NextResponse.json({
      status: 'success',
      url: publicUrl,
      sha: pushData.content?.sha,
      commit: pushData.commit?.sha?.slice(0, 7),
      size: buffer.length,
    });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 });
  }
}

/**
 * GET /api/media/upload?target=blog
 */
export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('target');

  if (target !== 'blog') {
    return NextResponse.json({ error: 'Solo soporta target=blog' }, { status: 400 });
  }

  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: 'GITHUB_TOKEN no configurado' }, { status: 500 });
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/public/blog?ref=${GITHUB_BRANCH}`;
    const res = await fetch(url, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ images: [] });
    }

    const files = await res.json();
    const images = (Array.isArray(files) ? files : [])
      .filter((f: { name: string }) => /\.(jpe?g|png|webp|gif)$/i.test(f.name))
      .map((f: { name: string; size: number; sha: string }) => ({
        name: f.name,
        url: `/blog/${f.name}`,
        size: f.size,
        sha: f.sha,
      }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error('List blog images error:', error);
    return NextResponse.json({ images: [] });
  }
}
