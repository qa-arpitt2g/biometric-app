import { NextResponse } from 'next/server';

// Simple in-memory rate limiting (in production, use Redis)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Credentials (in production, use a database with bcrypt hashing)
const VALID_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'Admin@123',
};

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  const errors = [];
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }
  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumber) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return { valid: errors.length === 0, errors };
}

function checkRateLimit(email) {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, firstAttemptTime: now };

  // Reset if lockout period has expired
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
    const { email, password, rememberMe } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Check rate limiting
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

    // Validate password format
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid password format', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Verify credentials
    if (
      sanitizedEmail !== VALID_CREDENTIALS.email ||
      password !== VALID_CREDENTIALS.password
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

    // Clear rate limiting on successful login
    loginAttempts.delete(sanitizedEmail);

    // Create session
    const sessionToken = Buffer.from(`${sanitizedEmail}:${Date.now()}:${Math.random()}`).toString('base64');
    const sessionExpiry = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    // Log successful login
    console.log(`[SECURITY] Successful login: ${sanitizedEmail} at ${new Date().toISOString()}`);

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          email: sanitizedEmail,
          role: 'admin',
        },
        sessionToken,
      },
      { status: 200 }
    );

    // Set secure session cookie
    response.cookies.set('authToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60,
    });

    response.cookies.set('userEmail', sanitizedEmail, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('[ERROR] Login endpoint error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
