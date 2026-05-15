import { NextResponse } from 'next/server';

const protectedRoutes = ['/upload', '/dashboard'];
const publicRoutes = ['/', '/api/auth/login'];
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function base64UrlDecode(value) {
  let input = String(value).replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4 !== 0) {
    input += '=';
  }
  return atob(input);
}

async function computeHmacHex(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function isValidAuthToken(token, requestUrl) {
  if (!AUTH_TOKEN_SECRET || !token) {
    return false;
  }

  try {
    const decoded = base64UrlDecode(token);
    const separatorIndex = decoded.lastIndexOf('.');
    if (separatorIndex === -1) {
      return false;
    }

    const payload = decoded.slice(0, separatorIndex);
    const signature = decoded.slice(separatorIndex + 1);
    const expectedSignature = await computeHmacHex(payload, AUTH_TOKEN_SECRET);

    if (signature !== expectedSignature) {
      return false;
    }

    const parsed = JSON.parse(payload);
    if (!parsed || typeof parsed !== 'object') {
      return false;
    }

    if (!parsed.email || !isValidEmail(parsed.email)) {
      return false;
    }

    if (!parsed.exp || Number.isNaN(Number(parsed.exp)) || Date.now() > Number(parsed.exp)) {
      return false;
    }

    // Single Active Session Validation
    // Edge Middleware calls the Node.js API to validate the session ID
    // We use the full URL to ensure fetch works correctly in both local and deployed environments
    const origin = new URL(requestUrl).origin;
    const sessionResponse = await fetch(`${origin}/api/auth/session?email=${encodeURIComponent(parsed.email)}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!sessionResponse.ok) {
      console.warn(`[SECURITY] Failed to fetch active session for ${parsed.email}`);
      return false;
    }

    const { sid: activeSid } = await sessionResponse.json();
    
    if (!parsed.sid || parsed.sid !== activeSid) {
      console.warn(`[SECURITY] Session ID mismatch for ${parsed.email}. Token SID: ${parsed.sid}, Active SID: ${activeSid}`);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('[SECURITY] Invalid auth token or session check failed:', error);
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('authToken')?.value;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const tokenValid = await isValidAuthToken(authToken, request.url);
    if (!tokenValid) {
      console.warn(`[SECURITY] Unauthorized or invalid SID for ${pathname}`);
      const response = NextResponse.redirect(new URL('/', request.url));
      // Clear the invalid cookie
      response.cookies.delete('authToken');
      return response;
    }
  }

  if (pathname === '/' && authToken) {
    const tokenValid = await isValidAuthToken(authToken, request.url);
    if (tokenValid) {
      return NextResponse.redirect(new URL('/upload', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
