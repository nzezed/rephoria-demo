import { Role } from './types';

export enum Permission {
  // User Management
  VIEW_USERS = 'VIEW_USERS',
  CREATE_USERS = 'CREATE_USERS',
  UPDATE_USERS = 'UPDATE_USERS',
  DELETE_USERS = 'DELETE_USERS',
  
  // Organization Management
  MANAGE_ORGANIZATION = 'MANAGE_ORGANIZATION',
  VIEW_ORGANIZATION = 'VIEW_ORGANIZATION',
  
  // Call Management
  VIEW_CALLS = 'VIEW_CALLS',
  MANAGE_CALLS = 'MANAGE_CALLS',
  DELETE_CALLS = 'DELETE_CALLS',
  
  // Analytics
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  EXPORT_ANALYTICS = 'EXPORT_ANALYTICS',
  
  // Integration Management
  VIEW_INTEGRATIONS = 'VIEW_INTEGRATIONS',
  MANAGE_INTEGRATIONS = 'MANAGE_INTEGRATIONS',
  
  // Agent Management
  VIEW_AGENTS = 'VIEW_AGENTS',
  MANAGE_AGENTS = 'MANAGE_AGENTS',
  
  // Settings
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  VIEW_SETTINGS = 'VIEW_SETTINGS',
}

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission), // Admins have all permissions
  
  [Role.MANAGER]: [
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    Permission.VIEW_ORGANIZATION,
    Permission.VIEW_CALLS,
    Permission.MANAGE_CALLS,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.VIEW_INTEGRATIONS,
    Permission.VIEW_AGENTS,
    Permission.MANAGE_AGENTS,
    Permission.VIEW_SETTINGS,
  ],
  
  [Role.USER]: [
    Permission.VIEW_CALLS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_AGENTS,
    Permission.VIEW_SETTINGS,
  ],
};

// Helper functions for permission checking
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
} 