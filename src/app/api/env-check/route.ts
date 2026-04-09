import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const wasiCompany = process.env.WASI_COMPANY_ID || '';
  const wasiToken = process.env.WASI_TOKEN || '';
  const ghToken = process.env.GITHUB_TOKEN || '';
  const sessionSecret = process.env.SESSION_SECRET || '';

  return NextResponse.json({
    WASI_COMPANY_ID: { present: !!wasiCompany, length: wasiCompany.length },
    WASI_TOKEN: { present: !!wasiToken, length: wasiToken.length },
    GITHUB_TOKEN: { present: !!ghToken, length: ghToken.length },
    SESSION_SECRET: { present: !!sessionSecret, length: sessionSecret.length },
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
}
