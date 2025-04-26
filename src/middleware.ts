import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTokenFromRequest, verifyAuth, isProtectedRoute, getErrorMessage } from '@/lib/auth/auth.utils'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip auth check for public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    try {
      // Get token from request
      const token = getTokenFromRequest(request)
      
      if (!token) {
        // Redirect to login if no token
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }

      // Verify token and get user info
      const verified = await verifyAuth(token)

      // Add user info to request headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', verified.userId)
      requestHeaders.set('x-user-role', verified.role)
      requestHeaders.set('x-org-id', verified.orgId)

      // Continue with added context
      return NextResponse.next({
        headers: requestHeaders,
      })
    } catch (error) {
      console.error('Auth error:', getErrorMessage(error))
      
      // Handle API routes differently than page routes
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Redirect to login for page routes
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     * 4. public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 