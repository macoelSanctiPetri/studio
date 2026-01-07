import { NextResponse } from 'next/server';
import { getSessionToken, verifySession } from '@/lib/auth';

export async function GET() {
  const token = getSessionToken();
  const ok = verifySession(token);
  return NextResponse.json({ ok });
}
