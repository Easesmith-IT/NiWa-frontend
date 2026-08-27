"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { getProfile } from "../../features/auth";
import { getAccessToken } from "../../lib/auth";
import { queryKeys } from "../../lib/api/query-keys";

export const AdminGuard = ({ children }: { children: ReactNode }) => {
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

    if (profileQuery.isSuccess) {
      const role = profileQuery.data?.user?.platformRole || profileQuery.data?.operator?.platformRole;
      if (role !== "SUPER_ADMIN") {
        console.warn("AdminGuard: Unauthorized role", role, profileQuery.data);
      }
    }
  }, [hasToken, pathname, profileQuery.isError, profileQuery.isSuccess, profileQuery.data, router]);

  if (!hasToken || profileQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  if (profileQuery.isError) {
    return null;
  }

  const role = profileQuery.data?.user?.platformRole || profileQuery.data?.operator?.platformRole;
  if (role !== "SUPER_ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-sm text-muted-foreground p-6 text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">Unauthorized</h2>
        <p>You do not have the required Super Admin privileges to view this page.</p>
        <p className="mt-1 opacity-70">Current role: {role || "none"}</p>
        <button onClick={() => router.replace("/")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Return to App
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
