import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = verifyEmailSchema.parse(body);

    await AuthService.verifyEmail(data.token);

    return NextResponse.json({
      message: 'Email verified successfully',
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