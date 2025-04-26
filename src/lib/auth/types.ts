export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  orgId: string;
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
  orgId: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER'
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