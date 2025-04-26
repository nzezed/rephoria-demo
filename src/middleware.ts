import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AuthService } from '@/lib/auth/auth.service'

export async function middleware(request: NextRequest) {
  // Paths that don't require authentication
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
  ]

  // Check if the path is public
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    // Validate the token
    const payload = await AuthService.validateToken(token)
    
    // Add user info to request headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('X-User-Id', payload.userId)
    requestHeaders.set('X-Organization-Id', payload.organizationId)
    requestHeaders.set('X-User-Role', payload.role)

    // Clone the request with new headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
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