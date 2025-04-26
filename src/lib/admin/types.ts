import { Role } from '@/lib/auth/types';

export type UserRole = 'admin' | 'manager' | 'user';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  lastLoginAt: Date | null;
} 