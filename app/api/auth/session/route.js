import { NextResponse } from 'next/server';
import sessionStore from '@/lib/sessionStore';

/**
 * Internal API to bridge the gap between Edge Middleware and Node.js Session Store.
 * This route allows the middleware to validate the session ID.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const activeSid = sessionStore.getActiveSession(email);
  
  return NextResponse.json({ sid: activeSid });
}
