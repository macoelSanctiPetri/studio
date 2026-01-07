import { cookies } from 'next/headers';

const COOKIE_NAME = 'nm_admin_token';
const MAX_AGE = 60 * 60 * 24; // 1 día

const getSecret = () => process.env.ADMIN_SECRET || '';

export function setSessionCookie() {
  const secret = getSecret();
  if (!secret) throw new Error('ADMIN_SECRET no configurado');
  cookies().set(COOKIE_NAME, secret, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/' });
}

export function verifySession(token?: string | null): boolean {
  const secret = getSecret();
  if (!secret || !token) return false;
  return token === secret;
}

export function getSessionToken() {
  return cookies().get(COOKIE_NAME)?.value;
}
