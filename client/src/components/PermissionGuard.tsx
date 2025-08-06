import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  action?: string;
}

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 4,
  [UserRole.INVENTORY_MANAGER]: 3,
  [UserRole.WAREHOUSE_STAFF]: 2,
  [UserRole.DEPARTMENT_USER]: 1,
};

// Action-based permissions
const ACTION_PERMISSIONS: Record<string, UserRole[]> = {
  create_item: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER],
  edit_item: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER, UserRole.WAREHOUSE_STAFF],
  delete_item: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER],
  create_location: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER],
  edit_location: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER],
  delete_location: [UserRole.ADMIN],
  create_user: [UserRole.ADMIN],
  edit_user: [UserRole.ADMIN],
  delete_user: [UserRole.ADMIN],
  create_supplier: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER],
  edit_supplier: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER],
  delete_supplier: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER],
  view_reports: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER],
  export_data: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER],
  manage_settings: [UserRole.ADMIN],
  create_transaction: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER, UserRole.WAREHOUSE_STAFF],
  view_analytics: [UserRole.ADMIN, UserRole.INVENTORY_MANAGER],
};

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRole,
  requiredRoles,
  fallback = null,
  action,
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <>{fallback}</>;
  }

  const userRole = currentUser.role as UserRole;
  const userRoleLevel = ROLE_HIERARCHY[userRole];

  // Check action-based permissions
  if (action) {
    const allowedRoles = ACTION_PERMISSIONS[action];
    if (!allowedRoles || !allowedRoles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  // Check specific role requirement
  if (requiredRole) {
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];
    if (userRoleLevel < requiredRoleLevel) {
      return <>{fallback}</>;
    }
  }

  // Check multiple role requirements
  if (requiredRoles) {
    if (!requiredRoles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

export default PermissionGuard;

// Hook for checking permissions in components
export const usePermissions = () => {
  const { currentUser } = useAuth();

  const hasPermission = (action: string): boolean => {
    if (!currentUser) return false;

    const userRole = currentUser.role as UserRole;
    const allowedRoles = ACTION_PERMISSIONS[action];

    return allowedRoles ? allowedRoles.includes(userRole) : false;
  };

  const hasRole = (role: UserRole): boolean => {
    if (!currentUser) return false;

    const userRole = currentUser.role as UserRole;
    const userRoleLevel = ROLE_HIERARCHY[userRole];
    const requiredRoleLevel = ROLE_HIERARCHY[role];

    return userRoleLevel >= requiredRoleLevel;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!currentUser) return false;

    const userRole = currentUser.role as UserRole;
    return roles.includes(userRole);
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    currentRole: currentUser?.role as UserRole,
    isAdmin: currentUser?.role === UserRole.ADMIN,
    isInventoryManager: currentUser?.role === UserRole.INVENTORY_MANAGER,
    isWarehouseStaff: currentUser?.role === UserRole.WAREHOUSE_STAFF,
    isDepartmentUser: currentUser?.role === UserRole.DEPARTMENT_USER,
  };
};
