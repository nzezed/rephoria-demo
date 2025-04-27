import { Role } from '@prisma/client';
export { Role };

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  organizationId: string;
  organizationSubdomain: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name?: string;
  organizationName: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
  userAgent?: string;
  ipAddress?: string;
} 