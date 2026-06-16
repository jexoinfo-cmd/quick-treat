import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/patient-register',
  '/desk-register',
  '/auth/callback',
]

const roleRoutes = {
  patient: ['/patient'],
  doctor: ['/doctor'],
  hospital: ['/hospital'],
  desk: ['/desk'],
  admin: ['/admin'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Static files & public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Auth check
  const accessToken =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('supabase-auth-token')?.value

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url)

    loginUrl.searchParams.set(
      'redirect',
      pathname
    )

    return NextResponse.redirect(loginUrl)
  }

  /*
    OPTIONAL ROLE CHECK

    Cookie example:
    role=doctor

    Better:
    role DB থেকে fetch করবে
    অথবা JWT claim ব্যবহার করবে
  */

  const role =
    request.cookies.get('role')?.value

  if (role) {
    const roleEntries = Object.entries(roleRoutes)

    for (const [allowedRole, routes] of roleEntries) {
      const isProtectedRoute = routes.some(
        (route) =>
          pathname === route ||
          pathname.startsWith(`${route}/`)
      )

      if (
        isProtectedRoute &&
        role !== allowedRole
      ) {
        return NextResponse.redirect(
          new URL('/unauthorized', request.url)
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}