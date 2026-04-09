import { createHmac } from 'crypto';

// Session configuration
export const AUTH_COOKIE_NAME = 'indubienes_session';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'indubienes-admin-secret-change-me';
export const SESSION_EXPIRY_HOURS = 24;

interface SessionData {
  companyId: string;
  token: string;
  expiresAt: number;
}

/**
 * Creates a signed session token with HMAC signature and base64 encoding.
 * Token includes company ID, API token, and 24-hour expiry timestamp.
 */
export function createSessionToken(companyId: string, token: string): string {
  const expiresAt = Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000;

  const sessionData: SessionData = {
    companyId,
    token,
    expiresAt,
  };

  const jsonData = JSON.stringify(sessionData);
  const signature = createHmac('sha256', SESSION_SECRET)
    .update(jsonData)
    .digest('hex');

  const payload = JSON.stringify({
    data: sessionData,
    signature,
  });

  return Buffer.from(payload).toString('base64');
}

/**
 * Verifies and decodes a signed session token.
 * Returns the decoded session data if valid and not expired, null otherwise.
 */
export function verifySessionToken(
  sessionToken: string
): { companyId: string; token: string } | null {
  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);

    const { data, signature } = payload as {
      data: SessionData;
      signature: string;
    };

    // Verify signature
    const jsonData = JSON.stringify(data);
    const expectedSignature = createHmac('sha256', SESSION_SECRET)
      .update(jsonData)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    // Check expiry
    if (data.expiresAt < Date.now()) {
      return null;
    }

    return {
      companyId: data.companyId,
      token: data.token,
    };
  } catch {
    return null;
  }
}

/**
 * Checks if a session token is valid and not expired (lightweight check for middleware).
 * This does not verify the HMAC signature; full verification happens in API routes.
 */
export function isSessionTokenValid(sessionToken: string): boolean {
  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);

    const { data } = payload as { data: SessionData };

    // Only check expiry in middleware; signature verification happens server-side
    return data.expiresAt > Date.now();
  } catch {
    return false;
  }
}
