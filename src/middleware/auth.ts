import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Permission, hasPermission } from '@/lib/auth/permissions';
import { Role } from '@/lib/auth/types';
import { AuthService } from '@/lib/auth/auth.service';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/auth/signin',
  '/auth/signup',
  '/api/auth/signup',
  '/api/auth/[...nextauth]',
];

// Route permission requirements
const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/dashboard/users': [Permission.VIEW_USERS],
  '/dashboard/analytics': [Permission.VIEW_ANALYTICS],
  '/dashboard/calls': [Permission.VIEW_CALLS],
  '/dashboard/agents': [Permission.VIEW_AGENTS],
  '/dashboard/integrations': [Permission.VIEW_INTEGRATIONS],
  '/dashboard/settings': [Permission.VIEW_SETTINGS],
  '/api/users': [Permission.UPDATE_USERS],
  '/api/calls': [Permission.MANAGE_CALLS],
  '/api/analytics': [Permission.VIEW_ANALYTICS],
  '/api/integrations': [Permission.MANAGE_INTEGRATIONS],
  '/api/agents': [Permission.MANAGE_AGENTS],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from cookie or header
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    // Validate token and get user info
    const payload = await AuthService.validateToken(token);
    const { role } = payload;

    // Check route permissions
    const requiredPermissions = getRoutePermissions(pathname);
    if (requiredPermissions && !hasRequiredPermissions(role, requiredPermissions)) {
      return new NextResponse(JSON.stringify({ 
        error: 'Insufficient permissions' 
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-organization-id', payload.organizationId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function getRoutePermissions(pathname: string): Permission[] | null {
  // Find the most specific matching route
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS)
    .find(route => pathname.startsWith(route));
  
  return matchingRoute ? ROUTE_PERMISSIONS[matchingRoute] : null;
}

function hasRequiredPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

// Configure which routes should be processed by this middleware
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
}; 