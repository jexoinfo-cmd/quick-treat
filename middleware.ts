import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/patient-register',
  '/desk-register',
  '/auth/callback',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // TEMPORARY: allow all routes
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}