"use client";

import { useWorkspace } from "lib/workspace/workspace-context";

export function useFinancePermissions() {
  const { activeMembership, activeWorkspaceId } = useWorkspace();
  const role = activeMembership?.role;
  const isViewer = role === "viewer";
  const canManage = !isViewer && !!role;
  const canPost = canManage;
  const canReconcile = canManage;
  const canConfigure = role === "owner" || role === "admin";

  return {
    role,
    isViewer,
    canManage,
    canPost,
    canReconcile,
    canConfigure,
    activeWorkspaceId,
    activeMembership,
  };
}
