import { User } from "@supabase/supabase-js";
import { CRM_ROUTES } from "@/features/crm/shared/constants/routes";
import { AuthAccess, AuthPermission, AuthRole } from "@/features/crm/shared/types/auth-access";

export type { AuthAccess, AuthPermission, AuthRole } from "@/features/crm/shared/types/auth-access";

const ALL_AUTH_PERMISSIONS: AuthPermission[] = [
  "crm:access",
  "crm:dashboard:read",
  "crm:leads:read",
  "crm:leads:write",
  "crm:notes:write",
  "crm:tasks:write",
];

const DEFAULT_AUTHENTICATED_PERMISSIONS: AuthPermission[] = [...ALL_AUTH_PERMISSIONS];

export function buildAuthAccess(user: User | null): AuthAccess {
  if (!user) {
    return {
      role: "anonymous",
      permissions: [],
    };
  }

  const resolvedRole = resolveAuthRole(user);
  const customPermissions = readPermissionsFromMetadata(user);

  if (resolvedRole === "admin") {
    return {
      role: resolvedRole,
      permissions: [...ALL_AUTH_PERMISSIONS],
    };
  }

  if (customPermissions.length > 0) {
    return {
      role: resolvedRole,
      permissions: uniquePermissions(["crm:access", ...customPermissions]),
    };
  }

  return {
    role: resolvedRole,
    permissions: [...DEFAULT_AUTHENTICATED_PERMISSIONS],
  };
}

export function hasPermission(access: AuthAccess, permission: AuthPermission) {
  return access.permissions.includes(permission);
}

export function getDefaultAuthorizedCrmRoute(access: AuthAccess) {
  if (hasPermission(access, "crm:dashboard:read")) {
    return CRM_ROUTES.root;
  }

  if (hasPermission(access, "crm:leads:read")) {
    return CRM_ROUTES.leads;
  }

  return CRM_ROUTES.login;
}

function resolveAuthRole(user: User): AuthRole {
  const candidates = [
    user.app_metadata?.crm_role,
    user.user_metadata?.crm_role,
    user.app_metadata?.role,
  ];

  for (const candidate of candidates) {
    if (
      candidate === "admin"
      || candidate === "manager"
      || candidate === "authenticated"
    ) {
      return candidate;
    }
  }

  return "authenticated";
}

function readPermissionsFromMetadata(user: User) {
  const rawPermissions = user.app_metadata?.crm_permissions ?? user.user_metadata?.crm_permissions;

  if (!Array.isArray(rawPermissions)) {
    return [];
  }

  return rawPermissions.filter(isAuthPermission);
}

function isAuthPermission(value: unknown): value is AuthPermission {
  return typeof value === "string" && ALL_AUTH_PERMISSIONS.includes(value as AuthPermission);
}

function uniquePermissions(permissions: AuthPermission[]) {
  return Array.from(new Set(permissions));
}
