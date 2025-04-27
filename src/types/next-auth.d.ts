import { Role } from '@prisma/client';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: Role;
    isActive: boolean;
    organizationId: string;
    organizationSubdomain: string;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    organizationId: string;
    isActive: boolean;
  }
} 