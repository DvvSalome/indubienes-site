import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'indubienes_session';

export function middleware(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;

  // Allow /admin/login without authentication
  if (pathname === '/admin/login') {
    return undefined;
  }

  // Protect /admin and /admin/* routes
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!sessionToken || !isSessionTokenValidEdge(sessionToken)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  return undefined;
}

function isSessionTokenValidEdge(sessionToken: string): boolean {
  try {
    const decoded = atob(sessionToken);
    const payload = JSON.parse(decoded);

    if (!payload.data || typeof payload.data !== 'object') {
      return false;
    }

    const { expiresAt } = payload.data as { expiresAt?: number };
    if (typeof expiresAt !== 'number') return false;

    return expiresAt > Date.now();
  } catch {
    return false;
  }
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
