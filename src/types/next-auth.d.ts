import { Role } from '@/lib/auth/types';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: Role;
      organizationId: string;
      organizationSubdomain: string;
    }
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role: Role;
    organizationId: string;
    isActive: boolean;
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