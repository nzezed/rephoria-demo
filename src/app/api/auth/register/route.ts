import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { getErrorMessage } from '@/lib/auth/auth.utils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password || !body.organizationName) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const result = await AuthService.register(body);

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
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Registration error:', getErrorMessage(error));
    
    // Handle specific error cases
    const errorMessage = getErrorMessage(error);
    if (errorMessage.includes('already exists')) {
      return NextResponse.json(
        {
          error: errorMessage,
          code: 'USER_EXISTS',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code: 'REGISTRATION_ERROR',
      },
      { status: 400 }
    );
  }
} 