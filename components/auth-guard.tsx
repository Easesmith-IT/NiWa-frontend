"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { getProfile } from "../features/auth";
import { getAccessToken } from "../lib/auth";
import { queryKeys } from "../lib/api/query-keys";
import { getActiveWorkspaceId, isValidWorkspaceId, setActiveWorkspaceId } from "../lib/workspace/workspace-state";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const hasToken = Boolean(getAccessToken());
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled: hasToken,
    retry: false,
  });

  useEffect(() => {
    if (!hasToken) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (profileQuery.isError) {
      router.replace("/login");
      return;
    }

    if (profileQuery.isSuccess && profileQuery.data) {
      const serverWorkspaceId =
        profileQuery.data.activeWorkspaceId || profileQuery.data.activeMembership?.workspaceId;
      if (serverWorkspaceId && isValidWorkspaceId(serverWorkspaceId)) {
        const currentActive = getActiveWorkspaceId();
        if (!currentActive) {
          setActiveWorkspaceId(serverWorkspaceId);
        }
      }
    }
  }, [hasToken, pathname, profileQuery.isError, profileQuery.isSuccess, profileQuery.data, router]);

  if (!hasToken || profileQuery.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-white/50 bg-white/70 p-6 text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  if (profileQuery.isError) {
    return null;
  }

  return <>{children}</>;
};
