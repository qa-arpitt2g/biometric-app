import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Signed out successfully' },
      { status: 200 }
    );

    response.cookies.delete('authToken');
    response.cookies.delete('userEmail');

    console.log(`[SECURITY] User signed out at ${new Date().toISOString()}`);

    return response;
  } catch (error) {
    console.error('[ERROR] Sign-out failed:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
