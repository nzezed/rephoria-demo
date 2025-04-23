import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit } from './utils/error-handling'

export async function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Get client IP
  const ip = request.ip || 'unknown'

  // Check rate limiting
  if (!checkRateLimit(ip)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  )

  return response
}

export const config = {
  matcher: '/api/:path*',
} 