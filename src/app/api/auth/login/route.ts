import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const secret = body?.secret ? String(body.secret) : '';
  const expected = process.env.ADMIN_SECRET || '';
  if (!expected || secret !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  setSessionCookie();
  return NextResponse.json({ ok: true });
}
