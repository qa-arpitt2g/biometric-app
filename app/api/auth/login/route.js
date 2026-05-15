import { NextResponse } from 'next/server';
import crypto from 'crypto';
import sessionStore from '@/lib/sessionStore';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET;

// Simple in-memory rate limiting (for production use a persistent store like Redis)
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

function ensureAuthEnvironment() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Missing authentication environment variables');
  }
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
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, password, rememberMe = false } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = String(email).trim().toLowerCase();

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    const rateLimit = checkRateLimit(sanitizedEmail);
    if (!rateLimit.allowed) {
      console.warn(`[SECURITY] Rate limit exceeded for email: ${sanitizedEmail}`);
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${rateLimit.retryAfter} seconds`,
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    ensureAuthEnvironment();

    if (!AUTH_TOKEN_SECRET) {
      console.error('[ERROR] Missing auth token secret');
      return NextResponse.json(
        { error: 'Server authentication is not configured' },
        { status: 500 }
      );
    }

    if (
      sanitizedEmail !== ADMIN_EMAIL ||
      String(password) !== ADMIN_PASSWORD
    ) {
      recordLoginAttempt(sanitizedEmail);
      const rateCheckAfter = checkRateLimit(sanitizedEmail);

      console.warn(`[SECURITY] Failed login attempt for: ${sanitizedEmail}`);
      return NextResponse.json(
        {
          error: 'Invalid email or password',
          attemptsRemaining: rateCheckAfter.remaining,
        },
        { status: 401 }
      );
    }

    loginAttempts.delete(sanitizedEmail);

    // Generate a unique session ID for this login
    // This will invalidate any previous sessions for the same user
    const sessionId = crypto.randomUUID();
    sessionStore.setActiveSession(sanitizedEmail, sessionId);

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
    const expiresAt = Date.now() + maxAge * 1000;
    const authToken = createAuthToken(sanitizedEmail, sessionId, expiresAt);

    console.log(`[SECURITY] Successful login: ${sanitizedEmail} (SID: ${sessionId}) at ${new Date().toISOString()}`);

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          email: sanitizedEmail,
          role: 'admin',
        },
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
    console.error('[ERROR] Login endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to process login request' },
      { status: 500 }
    );
  }
}
