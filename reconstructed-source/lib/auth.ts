/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the deployed Cloudflare Worker and the surviving source index.
 * Signatures, constants, cryptographic parameters, JWT behavior, and cookie
 * behavior match the latest recovered production bundle.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

import { getRequiredEnv, isProduction } from './env';

export interface AdminTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

export const TOKEN_EXPIRY = '7d';
export const COOKIE_NAME = 'admin_token';

export function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(getRequiredEnv('JWT_SECRET'));
}

/**
 * Hash a password using the Web Crypto API.
 *
 * Format: `<16-byte salt as hex>:<32-byte PBKDF2 result as hex>`.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  const hashHex = Array.from(hashArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');

  if (!saltHex || !hashHex) {
    return false;
  }

  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
  );
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );
  const hashArray = new Uint8Array(derivedBits);
  const computedHashHex = Array.from(hashArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return computedHashHex === hashHex;
}

export async function createToken(
  payload: Omit<AdminTokenPayload, 'iat' | 'exp'>,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyToken(
  token: string,
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  return payload
    ? {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      }
    : null;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Read an admin token from a Bearer header first, then from the session cookie.
 */
export async function getTokenFromRequest(
  request: Request,
): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookieHeader = request.headers.get('Cookie');

  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((cookie) => cookie.split('=')),
    );
    return cookies[COOKIE_NAME] || null;
  }

  return null;
}

export async function getSessionFromRequest(
  request: Request,
): Promise<AdminSession | null> {
  const token = await getTokenFromRequest(request);

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  return payload
    ? {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      }
    : null;
}

export function requireAuth(
  session: AdminSession | null,
): session is AdminSession {
  return session !== null;
}

export function requireSuperAdmin(session: AdminSession | null): boolean {
  return session?.role === 'super_admin';
}
