import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/auth/utils';
import { EmailService } from '@/lib/email/email.service';

export const runtime = 'nodejs';

const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = resendVerificationSchema.parse(body);

    // Check if user exists and is not verified
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verifyLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`;
    
    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // Log the verification link instead of sending email
    console.log('Verification link:', verifyLink);

    return NextResponse.json({
      message: 'Verification link generated successfully',
      verifyLink, // Include the link in the response for testing
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

    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to generate verification link' },
      { status: 500 }
    );
  }
} 