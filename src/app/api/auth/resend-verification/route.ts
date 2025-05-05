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
    console.log('Received resend verification request');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { email } = resendVerificationSchema.parse(body);
    console.log('Parsed email:', email);

    // Check if user exists and is not verified
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log('Found user:', user);

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      console.log('Email already verified');
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    console.log('Generated verification token:', verificationToken);
    
    const verifyLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
    console.log('Generated verification link:', verifyLink);
    
    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });
    console.log('Updated user with new verification token');

    return NextResponse.json({
      message: 'Verification link generated successfully',
      verifyLink,
    });
  } catch (error) {
    console.error('Error in resend verification:', error);
    
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

    return NextResponse.json(
      { error: 'Failed to generate verification link' },
      { status: 500 }
    );
  }
} 