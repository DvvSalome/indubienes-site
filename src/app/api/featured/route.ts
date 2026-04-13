import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export const runtime = 'nodejs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GIST_ID = '0219a824e7e5307a50d318fa08dc5e3e';
const GIST_FILE = 'featured-ids.json';

// GET: Read current featured IDs from Gist (no rebuild needed)
export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ ids: [], updatedAt: '', updatedBy: '' });
    }

    const gist = await res.json();
    const raw = gist.files?.[GIST_FILE]?.content;
    if (!raw) {
      return NextResponse.json({ ids: [], updatedAt: '', updatedBy: '' });
    }

    const content = JSON.parse(raw);
    return NextResponse.json(content);
  } catch {
    return NextResponse.json({ ids: [], updatedAt: '', updatedBy: '' });
  }
}

// POST: Save featured IDs to Gist (instant, no Vercel rebuild)
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('indubienes_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const session = verifySessionToken(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, updatedBy } = body;

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'ids must be an array' }, { status: 400 });
    }

    const newContent = {
      ids: ids.map(Number),
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'admin',
    };

    // Update Gist (does NOT trigger Vercel rebuild)
    const patchRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [GIST_FILE]: {
            content: JSON.stringify(newContent, null, 2),
          },
        },
      }),
    });

    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error('Gist write error:', err);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Guardadas ${ids.length} propiedades destacadas. Los cambios se reflejan de inmediato.`,
      ...newContent,
    });
  } catch (err) {
    console.error('Featured save error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
