import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import sessionStore from '@/lib/sessionStore';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD;
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET;

// Simple in-memory rate limiting
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function createAuthToken(email, sessionId, expiresAt) {
  const payload = JSON.stringify({ email, sid: sessionId, exp: expiresAt });
  const signature = crypto
    .createHmac('sha256', AUTH_TOKEN_SECRET)
    .update(payload)
    .digest('hex');
  const token = `${payload}.${signature}`;
  return Buffer.from(token).toString('base64url');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function checkRateLimit(email) {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, firstAttemptTime: now };

  if (now - attempts.firstAttemptTime > LOCKOUT_TIME) {
    loginAttempts.delete(email);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((LOCKOUT_TIME - (now - attempts.firstAttemptTime)) / 1000),
    };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - attempts.count };
}

function recordLoginAttempt(email) {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, firstAttemptTime: now };
  attempts.count++;
  loginAttempts.set(email, attempts);
}

export async function POST(request) {
  try {
    // CSRF Protection: Verify Origin
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && !origin.includes(host)) {
      console.warn(`[SECURITY] CSRF attempt detected from origin: ${origin}`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { email, password, rememberMe = false } = body;
    if (!email || !password) {
      return NextResponse.json({ error: 'Credentials required' }, { status: 400 });
    }

    const sanitizedEmail = String(email).trim().toLowerCase();
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const rateLimit = checkRateLimit(sanitizedEmail);
    if (!rateLimit.allowed) {
      console.warn(`[SECURITY] Rate limit exceeded: ${sanitizedEmail}`);
      return NextResponse.json(
        { error: `Too many attempts. Retry in ${rateLimit.retryAfter}s`, retryAfter: rateLimit.retryAfter },
        { status: 429 }
      );
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !AUTH_TOKEN_SECRET) {
      console.error('[ERROR] Auth environment misconfigured:', {
        ADMIN_EMAIL: ADMIN_EMAIL ? 'present' : 'missing',
        ADMIN_PASSWORD: ADMIN_PASSWORD_HASH ? 'present' : 'missing',
        AUTH_TOKEN_SECRET: AUTH_TOKEN_SECRET ? 'present' : 'missing'
      });
      return NextResponse.json({ error: 'Authentication unavailable' }, { status: 500 });
    }

    // Verify password against stored hash
    console.log(`[DEBUG] Attempt: "${sanitizedEmail}" | Admin: "${ADMIN_EMAIL}"`);
    const passwordMatch = sanitizedEmail === ADMIN_EMAIL && await bcrypt.compare(String(password), ADMIN_PASSWORD_HASH);

    if (!passwordMatch) {
      recordLoginAttempt(sanitizedEmail);
      console.warn(`[SECURITY] Failed login attempt for: ${sanitizedEmail}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    loginAttempts.delete(sanitizedEmail);

    const sessionId = crypto.randomUUID();
    sessionStore.setActiveSession(sanitizedEmail, sessionId);

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
    const expiresAt = Date.now() + maxAge * 1000;
    const authToken = createAuthToken(sanitizedEmail, sessionId, expiresAt);

    console.log(`[AUDIT] Login successful: ${sanitizedEmail} | SID: ${sessionId.slice(0, 8)}...`);

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: { email: sanitizedEmail, role: 'admin' },
      },
      { status: 200 }
    );

    response.cookies.set('authToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[ERROR] Internal login error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
