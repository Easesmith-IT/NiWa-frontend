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
      // In a real system, you might check for "SUPER_ADMIN".
      // Here we assume "admin" is the required role or we just ensure the user is an admin.
      const role = profileQuery.data?.user?.role;
      if (role !== "admin" && role !== "SUPER_ADMIN") {
        router.replace("/"); // Redirect to customer app if not admin
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

  const role = profileQuery.data?.user?.role;
  if (role !== "admin" && role !== "SUPER_ADMIN") {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};
