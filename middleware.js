import { NextResponse } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/upload', '/dashboard'];
const publicRoutes = ['/', '/api/auth/login'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies
  const authToken = request.cookies.get('authToken')?.value;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If accessing protected route without token
  if (isProtectedRoute && !authToken) {
    console.warn(`[SECURITY] Unauthorized access attempt to ${pathname}`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If accessing login page with valid token, redirect to dashboard
  if (pathname === '/' && authToken) {
    return NextResponse.redirect(new URL('/upload', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
