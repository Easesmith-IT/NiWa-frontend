"use client";

import React, { useState } from "react";
import {
  Boxes,
  Package,
  ShoppingCart,
  Truck,
  Users,
  MessageSquare,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useWorkspace } from "../../../lib/workspace/workspace-context";
import { useWorkspaceModules, useUpdateWorkspaceModule } from "../settings.queries";
import type { WorkspaceModuleItem } from "../settings.types";

const MODULE_ICONS: Record<string, React.ReactNode> = {
  crm: <Users className="h-4 w-4 text-primary" />,
  communication: <MessageSquare className="h-4 w-4 text-emerald-500" />,
  products: <Package className="h-4 w-4 text-blue-500" />,
  inventory: <Boxes className="h-4 w-4 text-amber-500" />,
  sales: <ShoppingCart className="h-4 w-4 text-purple-500" />,
  purchasing: <Truck className="h-4 w-4 text-indigo-500" />,
};

export const WorkspaceModulesCard: React.FC = () => {
  const { activeMembership, activeWorkspaceId } = useWorkspace();
  const { data: modules, isLoading, isError, error } = useWorkspaceModules();
  const updateMutation = useUpdateWorkspaceModule();

  const [activeActionKey, setActiveActionKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const currentUserRole = activeMembership?.workspaceId === activeWorkspaceId
    ? activeMembership.role
    : "viewer";
  const canManageModules = currentUserRole === "owner" || currentUserRole === "admin";

  const handleToggle = async (moduleKey: string, targetStatus: "ENABLED" | "DISABLED") => {
    setActionError(null);
    setActionSuccess(null);
    setActiveActionKey(moduleKey);

    try {
      await updateMutation.mutateAsync({ moduleKey, status: targetStatus });
      setActionSuccess(
        `Module successfully ${targetStatus === "ENABLED" ? "enabled" : "disabled"}.`
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update module status.";
      setActionError(msg);
    } finally {
      setActiveActionKey(null);
    }
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#F0F0F2] pb-3 dark:border-[#202326]">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Workspace Modules & Features</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Enable or configure business modules for this workspace. Core capabilities are always active.
          </p>
        </div>
        {!canManageModules && (
          <span className="mt-1 text-xs text-muted-foreground sm:mt-0">
            Read-only (Admin or Owner role required to toggle modules)
          </span>
        )}
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading workspace modules...
        </div>
      ) : isError ? (
        <div className="py-4 text-xs text-red-500">
          Failed to load modules: {(error as Error)?.message || "Unknown error"}
        </div>
      ) : (
        <div className="divide-y divide-[#F0F0F2] dark:divide-[#202326]">
          {modules?.map((mod: WorkspaceModuleItem) => {
            const isPending = updateMutation.isPending && activeActionKey === mod.key;
            const isEnabled = mod.status === "ENABLED";

            return (
              <div
                key={mod.key}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E4E7] bg-white p-1.5 shadow-sm dark:border-[#292C2F] dark:bg-[#17191B]">
                    {MODULE_ICONS[mod.key] || <Package className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{mod.name}</span>
                      {mod.isCore ? (
                        <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <Lock className="h-2.5 w-2.5" /> Core
                        </span>
                      ) : isEnabled ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{mod.description}</p>
                    {mod.dependencies?.length > 0 && (
                      <p className="mt-1 text-[10px] text-muted-foreground/80">
                        Prerequisites:{" "}
                        <span className="font-mono text-foreground/80">
                          {mod.dependencies.join(", ")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {mod.isCore ? (
                    <span className="text-xs text-muted-foreground italic px-2">Always Active</span>
                  ) : isEnabled ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending || !canManageModules}
                      onClick={() => handleToggle(mod.key, "DISABLED")}
                      className="h-8 text-xs text-muted-foreground hover:text-red-600 hover:border-red-300"
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Disable"}
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isPending || !canManageModules}
                      onClick={() => handleToggle(mod.key, "ENABLED")}
                      className="h-8 text-xs"
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Enable"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
