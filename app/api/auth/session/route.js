import { NextResponse } from 'next/server';
import sessionStore from '@/lib/sessionStore';

const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET;

/**
 * Internal API to bridge the gap between Edge Middleware and Node.js Session Store.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const secret = request.headers.get('x-session-secret');

  // Only allow authorized internal calls
  if (!AUTH_TOKEN_SECRET || secret !== AUTH_TOKEN_SECRET) {
    console.warn(`[SECURITY] Unauthorized internal session check attempt`);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const activeSid = sessionStore.getActiveSession(email);
  return NextResponse.json({ sid: activeSid });
}
