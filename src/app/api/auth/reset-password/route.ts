import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = resetPasswordSchema.parse(body);

    await AuthService.resetPassword(data.token, data.password);

    return NextResponse.json({
      message: 'Password has been reset successfully',
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

    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
} 