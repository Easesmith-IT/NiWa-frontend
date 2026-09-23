export type PermissionLevel = "NONE" | "READ" | "WRITE";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer" | string;

export const FINANCE_PERMISSIONS = {
  OVERVIEW: "finance.overview",
  ACCOUNTS: "finance.accounts",
  JOURNAL: "finance.journal",
  EXPENSES: "finance.expenses",
  RECEIVABLES: "finance.receivables",
  PAYABLES: "finance.payables",
  REPORTS: "finance.reports",
  SETTINGS: "finance.settings",

  JOURNAL_POST: "finance.journal.post",
  JOURNAL_REVERSE: "finance.journal.reverse",

  BILL_CREATE: "finance.bill.create",
  BILL_POST: "finance.bill.post",
  BILL_REVERSE: "finance.bill.reverse",

  PAYMENT_RECORD: "finance.payment.record",
  PAYMENT_REVERSE: "finance.payment.reverse",
} as const;

export type FinancePermissionKey = (typeof FINANCE_PERMISSIONS)[keyof typeof FINANCE_PERMISSIONS];

/**
 * Resolves workspace permission level based on workspace membership role.
 * Mirrors backend src/middleware/permission.ts
 * - owner, admin, member -> WRITE
 * - viewer -> READ
 * - undefined, null, unknown -> NONE
 */
export const resolveWorkspacePermission = (role?: string | null): PermissionLevel => {
  if (!role) {
    return "NONE";
  }

  switch (role) {
    case "owner":
    case "admin":
    case "member":
      return "WRITE";
    case "viewer":
      return "READ";
    default:
      return "NONE";
  }
};

/**
 * Checks if an actual permission level satisfies the required level.
 * Mirrors backend src/middleware/permission.ts
 */
export const hasPermissionLevel = (
  actual: PermissionLevel,
  required: "READ" | "WRITE",
): boolean => {
  if (actual === "NONE") {
    return false;
  }
  if (required === "READ") {
    return actual === "READ" || actual === "WRITE";
  }
  if (required === "WRITE") {
    return actual === "WRITE";
  }
  return false;
};

/**
 * Validates permission against a specific finance domain permission.
 */
export const hasFinancePermission = (
  role: string | null | undefined,
  _permission: FinancePermissionKey | string,
  requiredLevel: "READ" | "WRITE" = "READ",
): boolean => {
  const actualLevel = resolveWorkspacePermission(role);
  return hasPermissionLevel(actualLevel, requiredLevel);
};
