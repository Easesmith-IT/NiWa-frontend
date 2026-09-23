"use client";

import { useWorkspace } from "lib/workspace/workspace-context";
import {
  FINANCE_PERMISSIONS,
  FinancePermissionKey,
  hasFinancePermission,
  hasPermissionLevel,
  resolveWorkspacePermission,
  PermissionLevel,
} from "../finance.permissions";

export function useFinancePermissions() {
  const { activeMembership, activeWorkspaceId } = useWorkspace();
  const role = activeMembership?.role;
  const permissionLevel: PermissionLevel = resolveWorkspacePermission(role);

  const isViewer = role === "viewer";
  const canManage = hasPermissionLevel(permissionLevel, "WRITE");
  const canPost = canManage;
  const canReconcile = canManage;

  // Granular capability flags derived directly from backend authorization model
  const canReadOverview = hasFinancePermission(role, FINANCE_PERMISSIONS.OVERVIEW, "READ");
  const canManageAccounts = hasFinancePermission(role, FINANCE_PERMISSIONS.ACCOUNTS, "WRITE");
  const canManageExpenses = hasFinancePermission(role, FINANCE_PERMISSIONS.EXPENSES, "WRITE");
  const canPostJournal = hasFinancePermission(role, FINANCE_PERMISSIONS.JOURNAL_POST, "WRITE");
  const canManageReceivables = hasFinancePermission(role, FINANCE_PERMISSIONS.RECEIVABLES, "WRITE");
  const canManagePayables = hasFinancePermission(role, FINANCE_PERMISSIONS.PAYABLES, "WRITE");
  const canConfigure = hasFinancePermission(role, FINANCE_PERMISSIONS.SETTINGS, "WRITE");

  const hasPermission = (
    permission: FinancePermissionKey | string,
    requiredLevel: "READ" | "WRITE" = "READ",
  ) => hasFinancePermission(role, permission, requiredLevel);

  return {
    role,
    permissionLevel,
    isViewer,
    canManage,
    canPost,
    canReconcile,
    canConfigure,
    canReadOverview,
    canManageAccounts,
    canManageExpenses,
    canPostJournal,
    canManageReceivables,
    canManagePayables,
    hasPermission,
    activeWorkspaceId,
    activeMembership,
  };
}
