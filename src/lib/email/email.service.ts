import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import {
  PasswordResetEmail,
  WelcomeEmail,
  VerificationEmail,
} from './templates';

export class EmailService {
  private static readonly transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  static async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    name?: string
  ) {
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    const html = render(PasswordResetEmail({ resetLink, name })).toString();

    await this.sendEmail({
      to,
      subject: 'Reset Your Password',
      html,
    });
  }

  static async sendWelcomeEmail(to: string, name?: string) {
    const html = render(WelcomeEmail({ name })).toString();

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
    const verifyLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`;
    const html = render(VerificationEmail({ verifyLink, name })).toString();

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
    if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.error('Email configuration is missing:', {
        host: !!process.env.EMAIL_SERVER_HOST,
        user: !!process.env.EMAIL_SERVER_USER,
        pass: !!process.env.EMAIL_SERVER_PASSWORD,
      });
      throw new Error('Email service is not configured properly. Please check your environment variables.');
    }

    if (!process.env.EMAIL_FROM) {
      console.error('EMAIL_FROM is not configured');
      throw new Error('Email service is not configured properly. EMAIL_FROM is missing.');
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email. Please check your email configuration and try again.');
    }
  }
} 