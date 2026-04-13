import { NextRequest, NextResponse } from 'next/server';
import { uploadPropertyImage } from '@/lib/wasi';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = 'Adriangar333/indubienes-site';
const GITHUB_BRANCH = 'master';

/** Max width for blog hero images (px) */
const BLOG_MAX_WIDTH = 1600;
/** JPEG quality for compressed blog images */
const BLOG_JPEG_QUALITY = 82;
/** Max file size before compression kicks in (bytes) — 200 KB */
const COMPRESSION_THRESHOLD = 200 * 1024;

/**
 * Compress and optimize an image buffer using sharp.
 * - Resizes to max width (preserving aspect ratio)
 * - Converts to progressive JPEG at controlled quality
 * - Strips EXIF metadata to save bytes
 * Returns { buffer, format, width, height, originalSize, compressedSize }
 */
async function compressImage(
  inputBuffer: Buffer,
  options: { maxWidth?: number; quality?: number } = {}
): Promise<{
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}> {
  const maxWidth = options.maxWidth || BLOG_MAX_WIDTH;
  const quality = options.quality || BLOG_JPEG_QUALITY;
  const originalSize = inputBuffer.length;

  // Get metadata first
  const meta = await sharp(inputBuffer).metadata();
  const needsResize = (meta.width || 0) > maxWidth;

  let pipeline = sharp(inputBuffer).rotate(); // auto-rotate based on EXIF

  if (needsResize) {
    pipeline = pipeline.resize(maxWidth, undefined, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Output as progressive JPEG, strip metadata
  const output = await pipeline
    .jpeg({ quality, progressive: true, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    format: 'jpeg',
    width: output.info.width,
    height: output.info.height,
    originalSize,
    compressedSize: output.data.length,
  };
}

/**
 * POST /api/media/upload
 *
 * Unified media upload endpoint with automatic image compression.
 * Accepts multipart/form-data with:
 *   - image (required): the file blob
 *   - target (required): "property" | "blog"
 *   - entityId (optional): property ID (required for target=property)
 *   - description (optional)
 *   - position (optional)
 *   - filename (optional): custom filename for blog images
 *   - skipCompression (optional): "true" to upload raw file
 *
 * Blog images are automatically:
 *   - Resized to max 1600px wide
 *   - Converted to progressive JPEG (quality 82)
 *   - Stripped of EXIF metadata
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

    // --- BLOG: compress + push to GitHub → public/blog/ ---
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN no configurado' }, { status: 500 });
    }

    // Determine filename
    const customName = formData.get('filename') as string | null;
    const originalName =
      file instanceof File && file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '-') : '';
    let safeName = customName
      ? customName.replace(/[^a-zA-Z0-9._-]/g, '-')
      : originalName || `blog-${Date.now()}.jpg`;

    // Ensure .jpg extension since we compress to JPEG
    const skipCompression = formData.get('skipCompression') === 'true';
    if (!skipCompression) {
      safeName = safeName.replace(/\.(png|webp|gif|bmp|tiff?)$/i, '.jpg');
      if (!/\.(jpe?g)$/i.test(safeName)) {
        safeName = safeName.replace(/\.[^.]+$/, '.jpg');
        if (!/\.jpg$/i.test(safeName)) safeName += '.jpg';
      }
    }

    const filePath = `public/blog/${safeName}`;
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    };

    // Check if file already exists (need SHA to update)
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

    // Read file into buffer
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    let finalBuffer = rawBuffer;
    let compressionInfo = '';

    // Compress if above threshold and not skipped
    if (!skipCompression && rawBuffer.length > COMPRESSION_THRESHOLD) {
      try {
        const result = await compressImage(rawBuffer);
        finalBuffer = result.buffer;
        const savedPct = Math.round(100 - (result.compressedSize * 100) / result.originalSize);
        compressionInfo = ` (${result.width}x${result.height}, ${Math.round(result.compressedSize / 1024)}KB, -${savedPct}%)`;
        console.log(
          `[upload] Compressed ${safeName}: ${Math.round(result.originalSize / 1024)}KB → ${Math.round(result.compressedSize / 1024)}KB (${savedPct}% smaller, ${result.width}x${result.height})`
        );
      } catch (err) {
        // If compression fails, fall back to raw upload
        console.warn(`[upload] Compression failed for ${safeName}, uploading raw:`, err);
        finalBuffer = rawBuffer;
      }
    }

    // Convert to base64 and push to GitHub
    const base64Content = finalBuffer.toString('base64');

    const body: Record<string, unknown> = {
      message: `media: upload blog image ${safeName}${compressionInfo}`,
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
      compression: {
        originalSize: rawBuffer.length,
        finalSize: finalBuffer.length,
        savedPercent: Math.round(100 - (finalBuffer.length * 100) / rawBuffer.length),
        skipped: skipCompression || rawBuffer.length <= COMPRESSION_THRESHOLD,
      },
    });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 });
  }
}

/**
 * GET /api/media/upload?target=blog
 *
 * List existing blog images from GitHub.
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
