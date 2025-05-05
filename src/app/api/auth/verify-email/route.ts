import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { z } from 'zod';
import { generateJWT } from '@/lib/auth/utils';

export const runtime = 'nodejs';

const verifyEmailSchema = z.object({
  token: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = verifyEmailSchema.parse(body);

    const user = await AuthService.verifyEmail(data.token);

    // Generate JWT token after successful verification
    const token = generateJWT({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });

    return NextResponse.json({
      message: 'Email verified successfully',
      token,
    });
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
        { status: 400 }
      );
    }

    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
} 