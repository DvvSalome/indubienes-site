import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '***REDACTED***';
const REPO = 'adriangar333/indubienes-site';
const FILE_PATH = 'data/hero-videos.json';
const BRANCH = 'master';

interface HeroVideo {
  id: string;
  label: string;
  desktop: string;
  mobile: string;
  active: boolean;
}

interface HeroVideoConfig {
  videos: HeroVideo[];
  posterDesktop: string;
  posterMobile: string;
  updatedAt: string;
  updatedBy: string;
}

async function getFileFromGitHub(): Promise<{ content: HeroVideoConfig; sha: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    return {
      content: { videos: [], posterDesktop: '', posterMobile: '', updatedAt: '', updatedBy: '' },
      sha: '',
    };
  }

  const data = await res.json();
  const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content: JSON.parse(decoded), sha: data.sha };
}

async function saveFileToGitHub(content: HeroVideoConfig, sha: string): Promise<boolean> {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update hero videos config',
        content: encoded,
        sha,
        branch: BRANCH,
      }),
    }
  );
  return res.ok;
}

export async function GET() {
  try {
    const { content } = await getFileFromGitHub();
    return NextResponse.json(content);
  } catch {
    return NextResponse.json({ videos: [], posterDesktop: '', posterMobile: '' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { content: current, sha } = await getFileFromGitHub();

    const updated: HeroVideoConfig = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin',
    };

    const success = await saveFileToGitHub(updated, sha);
    if (!success) {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
