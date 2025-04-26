import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { getErrorMessage } from '@/lib/auth/auth.utils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await AuthService.login(body);

    // Set auth token in HTTP-only cookie
    cookies().set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      user: result.user,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', getErrorMessage(error));
    
    return NextResponse.json(
      {
        error: getErrorMessage(error),
        code: 'AUTH_ERROR',
      },
      { status: 401 }
    );
  }
} 