import { NextResponse } from 'next/server';

const protectedRoutes = ['/upload', '/dashboard', '/api/send-email'];
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
    if (!parsed || typeof parsed !== 'object' || !parsed.email || !parsed.sid || !parsed.exp) {
      return false;
    }

    if (!isValidEmail(parsed.email) || Date.now() > Number(parsed.exp)) {
      return false;
    }

    // Single Active Session Validation via Internal API
    const origin = new URL(requestUrl).origin;
    const sessionResponse = await fetch(`${origin}/api/auth/session?email=${encodeURIComponent(parsed.email)}`, {
      headers: { 
        'Accept': 'application/json',
        'x-session-secret': AUTH_TOKEN_SECRET 
      }
    });

    if (!sessionResponse.ok) {
      return false;
    }

    const { sid: activeSid } = await sessionResponse.json();
    return parsed.sid === activeSid;
  } catch (error) {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public Paths that skip all checks
  const isPublicApi = pathname === '/api/auth/login' || pathname === '/api/auth/session' || pathname === '/api/test-bcrypt';
  const isStatic = pathname.startsWith('/_next') || pathname.includes('favicon.ico');
  const isRoot = pathname === '/';

  if (isPublicApi || isStatic) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('authToken')?.value;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route)) || pathname.startsWith('/api/');

  let response;

  if (isProtectedRoute && !isPublicApi) {
    const tokenValid = await isValidAuthToken(authToken, request.url);
    if (!tokenValid) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('authToken');
      return response;
    }
  }

  if (isRoot && authToken) {
    const tokenValid = await isValidAuthToken(authToken, request.url);
    if (tokenValid) {
      return NextResponse.redirect(new URL('/upload', request.url));
    }
  }

  response = NextResponse.next();

  // Add Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self';");

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
