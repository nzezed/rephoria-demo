import { NextRequest } from 'next/server';
import { AuthService } from './auth.service';
import { JWTPayload } from './types';

export async function verifyAuth(token: string): Promise<JWTPayload> {
  return AuthService.validateToken(token);
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookie
  const token = request.cookies.get('auth_token');
  return token?.value || null;
}

export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/api/integrations',
    '/api/analytics',
    '/api/organizations',
  ];

  return protectedPaths.some(path => pathname.startsWith(path));
}

export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
} 