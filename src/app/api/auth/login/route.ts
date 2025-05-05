import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { z } from 'zod';
import { generateToken } from '@/lib/token';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  csrfToken: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Login attempt for email:', body.email);
    
    const data = loginSchema.parse(body);
    console.log('Login data validated successfully');

    // Get CSRF token from request headers
    const storedCsrfToken = request.headers.get('x-csrf-token');
    
    // Validate CSRF token
    if (!storedCsrfToken || storedCsrfToken !== data.csrfToken) {
      console.error('Invalid CSRF token');
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    console.log('Attempting to authenticate user...');
    const result = await AuthService.login({
      email: data.email,
      password: data.password,
    });
    console.log('User authenticated successfully');

    // --- Audit Log Entry ---
    try {
      await prisma.auditLog.create({
        data: {
          userId: result.user.id,
          action: 'USER_LOGIN',
        },
      });
      console.log('Audit log created successfully');
    } catch (auditError) {
      console.error('Failed to create audit log for login:', auditError);
    }
    // --- End Audit Log ---

    return NextResponse.json(result);
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
