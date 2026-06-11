import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/', '/auth/callback']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if it's a public route
  if (publicRoutes.some(route => pathname === route)) {
    return NextResponse.next()
  }
  
  // Check for static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico') || pathname.startsWith('/assets')) {
    return NextResponse.next()
  }
  
  // Get the session token from cookies
  const supabaseToken = request.cookies.get('sb-access-token')?.value
  
  // If no token and trying to access protected route, redirect to home
  if (!supabaseToken) {
    const url = new URL('/', request.url)
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Match all request paths except static files
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
}