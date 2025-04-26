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
  token: string;
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

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      organizationId: organization.id,
      role: user.role,
    });

    return { user, token };
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user with all fields
    const user = await prismaClient.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(credentials.password, user.hashedPassword);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    // Create session
    await this.createSession(user.id, token);

    // Update last login
    await prismaClient.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
      organizationId: user.organizationId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt || undefined,
    };

    return {
      user: authUser,
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