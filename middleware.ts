import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin');

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('nm_admin_token')?.value;
  const valid = verifySession(token);

  if (valid) return NextResponse.next();

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
