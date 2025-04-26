import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthUser, LoginCredentials, RegisterData, JWTPayload, Role, AuthResponse } from './types';

const prisma = new PrismaClient();

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_EXPIRES_IN = '24h';
  private static readonly SALT_ROUNDS = 10;

  static async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create organization first
    const organization = await prisma.organization.create({
      data: {
        name: data.organizationName,
        plan: 'FREE',
      },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        orgId: organization.id,
        role: Role.ADMIN, // First user of org is admin
      },
    });

    // Generate token
    const token = this.generateToken(user);

    // Create session
    await this.createSession(user.id, token);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    // Create session
    await this.createSession(user.id, token);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  static async validateToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      
      // Check if session exists and is valid
      const session = await prisma.session.findFirst({
        where: {
          token,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new Error('Invalid session');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async logout(token: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  private static generateToken(user: any): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  private static async createSession(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  private static sanitizeUser(user: any): AuthUser {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
} 