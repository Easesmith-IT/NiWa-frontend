import { describe, expect, it } from "vitest";
import {
  FINANCE_PERMISSIONS,
  hasFinancePermission,
  hasPermissionLevel,
  resolveWorkspacePermission,
} from "./finance.permissions";

describe("Finance Frontend Permission Alignment", () => {
  it("resolves workspace permission levels correctly", () => {
    expect(resolveWorkspacePermission("owner")).toBe("WRITE");
    expect(resolveWorkspacePermission("admin")).toBe("WRITE");
    expect(resolveWorkspacePermission("member")).toBe("WRITE");
    expect(resolveWorkspacePermission("viewer")).toBe("READ");
    expect(resolveWorkspacePermission("guest" as any)).toBe("NONE");
    expect(resolveWorkspacePermission(null)).toBe("NONE");
    expect(resolveWorkspacePermission(undefined)).toBe("NONE");
  });

  it("checks permission levels correctly", () => {
    // WRITE satisfies both READ and WRITE
    expect(hasPermissionLevel("WRITE", "READ")).toBe(true);
    expect(hasPermissionLevel("WRITE", "WRITE")).toBe(true);

    // READ satisfies READ only
    expect(hasPermissionLevel("READ", "READ")).toBe(true);
    expect(hasPermissionLevel("READ", "WRITE")).toBe(false);

    // NONE satisfies neither
    expect(hasPermissionLevel("NONE", "READ")).toBe(false);
    expect(hasPermissionLevel("NONE", "WRITE")).toBe(false);
  });

  it("checks finance permissions by role", () => {
    // Members can read and write finance
    expect(hasFinancePermission("member", FINANCE_PERMISSIONS.OVERVIEW, "READ")).toBe(true);
    expect(hasFinancePermission("member", FINANCE_PERMISSIONS.ACCOUNTS, "WRITE")).toBe(true);
    expect(hasFinancePermission("member", FINANCE_PERMISSIONS.EXPENSES, "WRITE")).toBe(true);

    // Viewers can only read
    expect(hasFinancePermission("viewer", FINANCE_PERMISSIONS.OVERVIEW, "READ")).toBe(true);
    expect(hasFinancePermission("viewer", FINANCE_PERMISSIONS.ACCOUNTS, "WRITE")).toBe(false);
    expect(hasFinancePermission("viewer", FINANCE_PERMISSIONS.EXPENSES, "WRITE")).toBe(false);

    // Unassigned or invalid roles have no access
    expect(hasFinancePermission(null, FINANCE_PERMISSIONS.OVERVIEW, "READ")).toBe(false);
    expect(hasFinancePermission("unauthorized", FINANCE_PERMISSIONS.OVERVIEW, "READ")).toBe(false);
  });
});
