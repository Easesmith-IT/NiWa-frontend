"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/api-client";
import { useWorkspace } from "./workspace-context";

export interface WorkspaceModuleItem {
  key: string;
  name: string;
  description: string;
  isCore: boolean;
  status: "ENABLED" | "DISABLED";
  dependencies: string[];
}

export function useWorkspaceModules() {
  const { activeWorkspaceId } = useWorkspace();

  const { data, isLoading, isError, error } = useQuery<{ data: WorkspaceModuleItem[] } | WorkspaceModuleItem[]>({
    queryKey: ["workspace-modules", activeWorkspaceId],
    queryFn: async () => {
      const res = await apiClient.get<any>("/api/modules");
      return res.data;
    },
    enabled: !!activeWorkspaceId,
    staleTime: 60_000,
  });

  const modules: WorkspaceModuleItem[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];

  const enabledModuleKeys = modules
    .filter((m) => m.status === "ENABLED")
    .map((m) => m.key.toLowerCase());

  // Core modules are always enabled
  const effectiveEnabledKeys = Array.from(
    new Set(["crm", "communication", ...enabledModuleKeys])
  );

  const isModuleEnabled = (moduleKey: string): boolean => {
    const key = moduleKey.toLowerCase();
    if (key === "crm" || key === "communication") return true;
    // If modules have not finished loading yet, return true to avoid layout flicker
    if (modules.length === 0 && isLoading) return true;
    return effectiveEnabledKeys.includes(key);
  };

  return {
    modules,
    enabledModuleKeys: effectiveEnabledKeys,
    isModuleEnabled,
    isLoading,
    isError,
    error,
  };
}
