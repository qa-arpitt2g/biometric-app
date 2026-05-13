import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the session/auth data from request headers if needed for validation
    const { sessionToken } = await request.json().catch(() => ({}));

    // Clear authentication cookies
    const response = NextResponse.json(
      { message: 'Signed out successfully' },
      { status: 200 }
    );

    // Clear auth-related cookies
    response.cookies.delete('authToken');
    response.cookies.delete('sessionId');
    response.cookies.delete('userPreferences');

    // Log sign-out event for security audit
    console.log(`[SECURITY] User signed out at ${new Date().toISOString()}`);

    return response;
  } catch (error) {
    console.error('Error during sign-out:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
