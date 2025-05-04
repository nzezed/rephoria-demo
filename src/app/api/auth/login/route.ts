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
    const data = loginSchema.parse(body);

    // Get CSRF token from request headers
    const storedCsrfToken = request.headers.get('x-csrf-token');
    
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

    // --- Audit Log Entry ---
    try {
      await prisma.auditLog.create({
        data: {
          userId: result.user.id,
          action: 'USER_LOGIN',
        },
      });
    } catch (auditError) {
      console.error('Failed to create audit log for login:', auditError);
    }
    // --- End Audit Log ---

    return NextResponse.json(result);
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
