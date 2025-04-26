import { NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth/auth.utils';
import { AuthService } from '@/lib/auth/auth.service';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 401 }
      );
    }

    // Verify token and get user info
    const verified = await AuthService.validateToken(token);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: verified.userId,
        email: verified.email,
        role: verified.role,
        organizationId: verified.organizationId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
} 