"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { apiClient } from "../lib/api/client";
import { getAccessToken } from "../lib/auth";
import { ProfileResponse } from "../lib/api/types";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const hasToken = Boolean(getAccessToken());
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await apiClient.get<ProfileResponse>("/auth/profile");
      return response.data;
    },
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
    }
  }, [hasToken, pathname, profileQuery.isError, router]);

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
