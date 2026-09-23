import { describe, expect, it } from "vitest";
import {
  FINANCE_PERMISSIONS,
  hasFinancePermission,
  hasPermissionLevel,
  resolveWorkspacePermission,
} from "./finance.permissions";

describe("Finance Frontend Permission Alignment (Section 11 Matrix)", () => {
  it("resolves workspace permission levels correctly across all roles", () => {
    // WRITE roles
    expect(resolveWorkspacePermission("owner")).toBe("WRITE");
    expect(resolveWorkspacePermission("admin")).toBe("WRITE");
    expect(resolveWorkspacePermission("member")).toBe("WRITE");

    // READ roles
    expect(resolveWorkspacePermission("viewer")).toBe("READ");

    // Invalid, unknown, null, or undefined roles
    expect(resolveWorkspacePermission("unknown_role" as any)).toBe("NONE");
    expect(resolveWorkspacePermission("guest" as any)).toBe("NONE");
    expect(resolveWorkspacePermission("")).toBe("NONE");
    expect(resolveWorkspacePermission(null)).toBe("NONE");
    expect(resolveWorkspacePermission(undefined)).toBe("NONE");
  });

  it("checks permission levels correctly with proper hierarchy (WRITE > READ > NONE)", () => {
    // WRITE satisfies both READ and WRITE
    expect(hasPermissionLevel("WRITE", "READ")).toBe(true);
    expect(hasPermissionLevel("WRITE", "WRITE")).toBe(true);

    // READ satisfies READ only, not WRITE
    expect(hasPermissionLevel("READ", "READ")).toBe(true);
    expect(hasPermissionLevel("READ", "WRITE")).toBe(false);

    // NONE satisfies neither READ nor WRITE
    expect(hasPermissionLevel("NONE", "READ")).toBe(false);
    expect(hasPermissionLevel("NONE", "WRITE")).toBe(false);
  });

  it("verifies full capability matrix for owner (has full READ and WRITE)", () => {
    const role = "owner";
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.OVERVIEW, "READ")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.ACCOUNTS, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.EXPENSES, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.JOURNAL_POST, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.RECEIVABLES, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.PAYABLES, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.SETTINGS, "WRITE")).toBe(true);
  });

  it("verifies full capability matrix for admin (has full READ and WRITE)", () => {
    const role = "admin";
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.OVERVIEW, "READ")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.ACCOUNTS, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.EXPENSES, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.JOURNAL_POST, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.RECEIVABLES, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.PAYABLES, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.SETTINGS, "WRITE")).toBe(true);
  });

  it("verifies full capability matrix for member (has full READ and WRITE)", () => {
    const role = "member";
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.OVERVIEW, "READ")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.ACCOUNTS, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.EXPENSES, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.JOURNAL_POST, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.RECEIVABLES, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.PAYABLES, "WRITE")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.SETTINGS, "WRITE")).toBe(true);
  });

  it("verifies full capability matrix for viewer (READ only, zero WRITE)", () => {
    const role = "viewer";
    // READ permissions allowed
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.OVERVIEW, "READ")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.ACCOUNTS, "READ")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.REPORTS, "READ")).toBe(true);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.SETTINGS, "READ")).toBe(true);

    // WRITE permissions strictly denied
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.ACCOUNTS, "WRITE")).toBe(false);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.EXPENSES, "WRITE")).toBe(false);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.JOURNAL_POST, "WRITE")).toBe(false);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.RECEIVABLES, "WRITE")).toBe(false);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.PAYABLES, "WRITE")).toBe(false);
    expect(hasFinancePermission(role, FINANCE_PERMISSIONS.SETTINGS, "WRITE")).toBe(false);
  });

  it("verifies full capability matrix for unknown, null, or undefined roles (zero access)", () => {
    const unauthenticated = [null, undefined, "unknown_role", "contractor"];

    for (const role of unauthenticated) {
      expect(hasFinancePermission(role, FINANCE_PERMISSIONS.OVERVIEW, "READ")).toBe(false);
      expect(hasFinancePermission(role, FINANCE_PERMISSIONS.ACCOUNTS, "READ")).toBe(false);
      expect(hasFinancePermission(role, FINANCE_PERMISSIONS.ACCOUNTS, "WRITE")).toBe(false);
      expect(hasFinancePermission(role, FINANCE_PERMISSIONS.EXPENSES, "WRITE")).toBe(false);
      expect(hasFinancePermission(role, FINANCE_PERMISSIONS.JOURNAL_POST, "WRITE")).toBe(false);
      expect(hasFinancePermission(role, FINANCE_PERMISSIONS.SETTINGS, "WRITE")).toBe(false);
    }
  });
});
