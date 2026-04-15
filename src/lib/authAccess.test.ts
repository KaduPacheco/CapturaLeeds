import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { buildAuthAccess, getDefaultAuthorizedCrmRoute, hasPermission } from "@/lib/authAccess";

function createUser(overrides: Partial<User> = {}) {
  return {
    id: "user-1",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-04-13T10:00:00.000Z",
    ...overrides,
  } as User;
}

describe("authAccess", () => {
  it("builds anonymous access when there is no user", () => {
    const access = buildAuthAccess(null);

    expect(access).toEqual({
      role: "anonymous",
      permissions: [],
    });
    expect(hasPermission(access, "crm:access")).toBe(false);
  });

  it("grants all permissions to admin users", () => {
    const user = createUser({
      app_metadata: {
        crm_role: "admin",
      },
    });

    const access = buildAuthAccess(user);

    expect(access.role).toBe("admin");
    expect(access.permissions).toEqual([
      "crm:access",
      "crm:dashboard:read",
      "crm:leads:read",
      "crm:leads:write",
      "crm:notes:write",
      "crm:tasks:write",
    ]);
    expect(hasPermission(access, "crm:tasks:write")).toBe(true);
  });

  it("preserves custom permissions from metadata and adds crm:access once", () => {
    const user = createUser({
      app_metadata: {
        crm_role: "manager",
      },
      user_metadata: {
        crm_permissions: [
          "crm:leads:read",
          "crm:notes:write",
          "crm:leads:read",
          "invalid-permission",
        ],
      },
    });

    const access = buildAuthAccess(user);

    expect(access.role).toBe("manager");
    expect(access.permissions).toEqual([
      "crm:access",
      "crm:leads:read",
      "crm:notes:write",
    ]);
    expect(hasPermission(access, "crm:notes:write")).toBe(true);
    expect(hasPermission(access, "crm:tasks:write")).toBe(false);
  });

  it("prioritizes app metadata permissions and falls back to app metadata role", () => {
    const user = createUser({
      app_metadata: {
        role: "manager",
        crm_permissions: ["crm:dashboard:read", "crm:leads:read"],
      },
      user_metadata: {
        crm_permissions: ["crm:tasks:write"],
      },
    });

    const access = buildAuthAccess(user);

    expect(access.role).toBe("manager");
    expect(access.permissions).toEqual([
      "crm:access",
      "crm:dashboard:read",
      "crm:leads:read",
    ]);
    expect(hasPermission(access, "crm:tasks:write")).toBe(false);
  });

  it("falls back to the default authenticated permission set when no custom permissions exist", () => {
    const user = createUser({
      user_metadata: {
        crm_role: "authenticated",
      },
    });

    const access = buildAuthAccess(user);

    expect(access.role).toBe("authenticated");
    expect(access.permissions).toEqual([
      "crm:access",
      "crm:dashboard:read",
      "crm:leads:read",
      "crm:leads:write",
      "crm:notes:write",
      "crm:tasks:write",
    ]);
  });

  it("resolves the safest CRM fallback route from the current permissions", () => {
    expect(
      getDefaultAuthorizedCrmRoute({
        role: "manager",
        permissions: ["crm:access", "crm:dashboard:read"],
      }),
    ).toBe("/crm");

    expect(
      getDefaultAuthorizedCrmRoute({
        role: "manager",
        permissions: ["crm:access", "crm:leads:read"],
      }),
    ).toBe("/crm/leads");

    expect(
      getDefaultAuthorizedCrmRoute({
        role: "authenticated",
        permissions: ["crm:access"],
      }),
    ).toBe("/crm/login");
  });
});
