import { Resend } from 'resend';
import { render } from '@react-email/render';
import {
  PasswordResetEmail,
  WelcomeEmail,
  VerificationEmail,
} from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    name?: string
  ) {
    console.log('Preparing password reset email for:', to);
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    const html = await render(PasswordResetEmail({ resetLink, name }));
    console.log('Password reset link generated:', resetLink);

    await this.sendEmail({
      to,
      subject: 'Reset Your Password',
      html,
    });
  }

  static async sendWelcomeEmail(to: string, name?: string) {
    console.log('Preparing welcome email for:', to);
    const html = await render(WelcomeEmail({ name }));

    await this.sendEmail({
      to,
      subject: 'Welcome to Rephoria!',
      html,
    });
  }

  static async sendVerificationEmail(
    to: string,
    verificationToken: string,
    name?: string
  ) {
    console.log('Preparing verification email for:', to);
    const verifyLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`;
    const html = await render(VerificationEmail({ verifyLink, name }));
    console.log('Verification link generated:', verifyLink);

    await this.sendEmail({
      to,
      subject: 'Verify Your Email',
      html,
    });
  }

  private static async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    if (!process.env.RESEND_API_KEY) {
      console.error('Resend API key is missing. Please check your environment variables.');
      throw new Error('Email service is not configured properly. Please check your environment variables.');
    }

    if (!process.env.NEXTAUTH_URL) {
      console.error('NEXTAUTH_URL is missing. Please check your environment variables.');
      throw new Error('Email service is not configured properly. Please check your environment variables.');
    }

    try {
      console.log('Attempting to send email to:', to);
      console.log('Using NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
      console.log('Using Resend API key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
      
      const { data, error } = await resend.emails.send({
        from: 'Rephoria <onboarding@resend.dev>',
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Failed to send email. Resend error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log('Email sent successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Failed to send email. Error details:', error);
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
  }
} 