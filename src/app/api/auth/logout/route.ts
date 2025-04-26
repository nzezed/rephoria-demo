import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { getTokenFromRequest } from '@/lib/auth/auth.utils';
import { cookies } from 'next/headers';
import { type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    if (token) {
      // Invalidate session in database
      await AuthService.logout(token);
    }

    // Clear auth cookie
    cookies().delete('auth_token');

    return NextResponse.json({
      message: 'Logout successful',
    });
  } catch (error) {
    // Even if there's an error, we want to clear the cookie
    cookies().delete('auth_token');
    
    return NextResponse.json({
      message: 'Logged out',
    });
  }
} 