import { ReactNode } from 'react';
import { Permission } from '@/lib/auth/permissions';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  permissions?: Permission | Permission[];
  requireAll?: boolean;
}

export function PermissionGate({
  children,
  fallback = null,
  permissions,
  requireAll = true,
}: PermissionGateProps) {
  const { can, canAll, canAny } = usePermissions();

  if (!permissions) {
    return <>{children}</>;
  }

  const hasAccess = Array.isArray(permissions)
    ? requireAll
      ? canAll(permissions)
      : canAny(permissions)
    : can(permissions);

  return <>{hasAccess ? children : fallback}</>;
}

// HOC version for class components or when you need to wrap an entire page
export function withPermissions(
  WrappedComponent: React.ComponentType<any>,
  permissions?: Permission | Permission[],
  requireAll = true,
  fallback: ReactNode = null,
) {
  return function PermissionWrappedComponent(props: any) {
    return (
      <PermissionGate
        permissions={permissions}
        requireAll={requireAll}
        fallback={fallback}
      >
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
} 