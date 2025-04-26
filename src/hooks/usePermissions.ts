import { useSession } from 'next-auth/react';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/auth/permissions';
import { Role } from '@/lib/auth/types';

export function usePermissions() {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role | undefined;

  return {
    can: (permission: Permission): boolean => {
      if (!userRole) return false;
      return hasPermission(userRole, permission);
    },
    
    canAny: (permissions: Permission[]): boolean => {
      if (!userRole) return false;
      return hasAnyPermission(userRole, permissions);
    },
    
    canAll: (permissions: Permission[]): boolean => {
      if (!userRole) return false;
      return hasAllPermissions(userRole, permissions);
    },
    
    isAdmin: (): boolean => {
      return userRole === Role.ADMIN;
    },
    
    isManager: (): boolean => {
      return userRole === Role.MANAGER;
    },
    
    role: userRole,
  };
} 