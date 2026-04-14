export type AuthRole = "anonymous" | "authenticated" | "manager" | "admin";

export type AuthPermission =
  | "crm:access"
  | "crm:dashboard:read"
  | "crm:leads:read"
  | "crm:leads:write"
  | "crm:notes:write"
  | "crm:tasks:write";

export interface AuthAccess {
  role: AuthRole;
  permissions: AuthPermission[];
}
