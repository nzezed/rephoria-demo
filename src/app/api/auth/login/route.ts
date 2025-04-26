import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { generateToken } from '@/lib/token';

export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  csrfToken: z.string(),
});

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const storedCsrfToken = cookieStore.get('csrf_token')?.value;
    
    const body = await request.json();
    const data = loginSchema.parse(body);

    // Validate CSRF token
    if (!storedCsrfToken || storedCsrfToken !== data.csrfToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const result = await AuthService.validateCredentials(
      data.email,
      data.password
    );

    // Generate new CSRF token for next request
    const newCsrfToken = generateToken();
    const response = NextResponse.json(result);
    
    response.cookies.set('csrf_token', newCsrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
} 