import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { z } from 'zod';

export const runtime = 'nodejs';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Forgot password request received for email:', body.email);
    
    const data = forgotPasswordSchema.parse(body);
    console.log('Email validated successfully');

    console.log('Initiating password reset...');
    await AuthService.initiatePasswordReset(data.email);
    console.log('Password reset initiated successfully');

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    
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
        { status: 400 }
      );
    }

    console.error('Unknown error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
} 