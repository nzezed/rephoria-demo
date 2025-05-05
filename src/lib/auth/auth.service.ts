import { PrismaClient, User, Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthUser, LoginCredentials, RegisterData, JWTPayload, AuthResponse } from './types';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, generateVerificationToken, generatePasswordResetToken, generateJWT } from './utils';
import { EmailService } from '@/lib/email/email.service';

const prismaClient = new PrismaClient();

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  organizationId: string;
}

export interface AuthResult {
  user: User;
  token: string | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  organizationName: string;
  subdomain: string;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_EXPIRES_IN = '24h';
  private static readonly SALT_ROUNDS = 10;

  static async register(data: RegisterInput): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Check if subdomain is available
    const existingOrg = await prisma.organization.findUnique({
      where: { subdomain: data.subdomain },
    });

    if (existingOrg) {
      throw new Error('Subdomain is already taken');
    }

    // Create organization first
    const organization = await prisma.organization.create({
      data: {
        name: data.organizationName,
        subdomain: data.subdomain,
        plan: 'free',
      },
    });

    // Check if this is the first user for this organization
    const orgUsers = await prisma.user.count({
      where: { organizationId: organization.id }
    });

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateVerificationToken();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        hashedPassword,
        name: data.name,
        organization: {
          connect: { id: organization.id }
        },
        verificationToken,
        role: orgUsers === 0 ? Role.ADMIN : Role.USER, // Only first user is admin
      },
    });

    try {
      await EmailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.name || undefined
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    // Return user without token since email is not verified
    return { user, token: null };
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;
    console.log('AuthService login attempt for email:', email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      console.error('User not found for email:', email);
      throw new Error('Invalid credentials');
    }

    console.log('User found:', { 
      id: user.id, 
      email: user.email, 
      emailVerified: user.emailVerified,
      hashedPassword: user.hashedPassword ? 'exists' : 'missing'
    });

    // For existing users without email verification, mark them as verified
    if (!user.emailVerified) {
      console.log('User not verified, marking as verified');
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
      user.emailVerified = new Date();
    }

    // Verify password
    console.log('Verifying password...');
    console.log('Input password length:', password.length);
    console.log('Hashed password exists:', !!user.hashedPassword);
    
    if (!user.hashedPassword) {
      console.error('No hashed password found for user');
      throw new Error('Invalid credentials');
    }

    const isValid = await verifyPassword(password, user.hashedPassword);
    console.log('Password verification result:', isValid);
    
    if (!isValid) {
      console.error('Invalid password for user:', email);
      throw new Error('Invalid credentials');
    }
    console.log('Password verified successfully');

    // Generate JWT token
    console.log('Generating JWT token...');
    const token = generateJWT({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });
    console.log('JWT token generated');

    // Create session
    console.log('Creating session...');
    await this.createSession(user.id, token);
    console.log('Session created successfully');

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  static async validateToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      
      // Check if session exists and is valid
      const session = await prismaClient.session.findFirst({
        where: {
          sessionToken: token,
          expires: { gt: new Date() },
        },
      });

      if (!session) {
        throw new Error('Invalid session');
      }

      const payload: JWTPayload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId,
      };

      return payload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async logout(token: string): Promise<void> {
    await prismaClient.session.deleteMany({
      where: { sessionToken: token },
    });
  }

  private static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  private static async createSession(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return prismaClient.session.create({
      data: {
        userId,
        sessionToken: token,
        expires: expiresAt,
      },
    });
  }

  private static sanitizeUser(user: any): AuthUser {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  static async createUser({
    email,
    password,
    name,
    organizationId,
  }: CreateUserInput): Promise<User> {
    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    const userData: Prisma.UserCreateInput = {
      email,
      hashedPassword,
      name,
      organization: {
        connect: { id: organizationId }
      },
      verificationToken,
      role: Role.USER,
    };

    const user = await prisma.user.create({
      data: userData,
    });

    await EmailService.sendVerificationEmail(email, verificationToken, name);

    return user;
  }

  static async verifyEmail(token: string): Promise<User> {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    return prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });
  }

  static async initiatePasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return silently for security
      return;
    }

    const resetToken = generatePasswordResetToken();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    await EmailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name || undefined
    );
  }

  static async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    // Invalidate all sessions for the user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Log the password reset event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET',
        details: 'User reset their password via reset link.'
      }
    });

    return prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  static async validateCredentials(email: string, password: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new Error('Email not verified');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });

    return { user, token };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await verifyPassword(currentPassword, user.hashedPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);

    return prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword,
      },
    });
  }
} 