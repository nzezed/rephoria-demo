import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import crypto from 'crypto';

const SALT_ROUNDS = 12;
const TOKEN_BYTES = 32;

export interface JWTPayload {
  userId: string;
  organizationId: string;
  role: string;
  [key: string]: any;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(length: number = TOKEN_BYTES): string {
  return crypto.randomBytes(length).toString('hex');
}

export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

type ExpiresIn = string | number;

export function generateJWT(payload: JWTPayload, expiresIn: ExpiresIn = '24h'): string {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.sign(payload, secret, { expiresIn } as any);
}

export function verifyJWT(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function generateSessionToken(): string {
  return generateToken(32);
}

export function generateVerificationToken(): string {
  return generateToken(32);
}

export function generatePasswordResetToken(): string {
  return generateToken(32);
} 