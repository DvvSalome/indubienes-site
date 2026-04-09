import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export const runtime = 'nodejs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO = 'adriangar333/indubienes-site';
const FILE_PATH = 'data/featured-ids.json';
const BRANCH = 'master';

// GET: Read current featured IDs from GitHub
export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json({ ids: [], updatedAt: '', updatedBy: '' });
    }

    const data = await res.json();
    const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));

    return NextResponse.json({ ...content, sha: data.sha });
  } catch {
    return NextResponse.json({ ids: [], updatedAt: '', updatedBy: '' });
  }
}

// POST: Save featured IDs to GitHub (triggers Vercel rebuild)
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

    // Get current file SHA (needed for update)
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        cache: 'no-store',
      }
    );

    let sha: string | undefined;
    if (getRes.ok) {
      const current = await getRes.json();
      sha = current.sha;
    }

    const newContent = {
      ids: ids.map(Number),
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'admin',
    };

    // Write file via GitHub Contents API
    const putRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `feat: update featured properties [${ids.length} selected]`,
          content: Buffer.from(JSON.stringify(newContent, null, 2) + '\n').toString('base64'),
          sha,
          branch: BRANCH,
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.text();
      console.error('GitHub write error:', err);
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Guardadas ${ids.length} propiedades destacadas. Vercel reconstruirá el sitio en ~1 minuto.`,
      ...newContent,
    });
  } catch (err) {
    console.error('Featured save error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
