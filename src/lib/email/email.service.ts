import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import {
  PasswordResetEmail,
  WelcomeEmail,
  VerificationEmail,
} from './templates';

export class EmailService {
  private static readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    name?: string
  ) {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    const html = render(PasswordResetEmail({ resetLink, name }));

    await this.sendEmail({
      to,
      subject: 'Reset Your Password',
      html,
    });
  }

  static async sendWelcomeEmail(to: string, name?: string) {
    const html = render(WelcomeEmail({ name }));

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
    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${verificationToken}`;
    const html = render(VerificationEmail({ verifyLink, name }));

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
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }
} 