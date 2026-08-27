"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Menu, ShieldAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { clearAccessToken } from "../../lib/auth";
import { logout } from "../../features/auth";
import { Button } from "../../components/ui/button";
import { adminNavigationGroups } from "../config/navigation";
import { ThemeSwitcher } from "../../components/layout/theme-switcher";

interface AdminTopbarProps {
  onToggleSidebar: () => void;
}

export const AdminTopbar = ({ onToggleSidebar }: AdminTopbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearAccessToken();
      queryClient.clear();
      router.replace("/login");
    }
  };

  const currentRoute = adminNavigationGroups
    .flatMap((g) => g.items)
    .find((item) =>
      item.href === "/admin"
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    );

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#E4E4E7] bg-white px-4 transition-colors dark:border-[#24272A] dark:bg-[#121416] md:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button className="h-8 w-8 rounded-md px-0 lg:hidden" onClick={onToggleSidebar} type="button" variant="ghost">
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold leading-6 text-foreground tracking-tight">
            {currentRoute?.label || "Admin Console"}
          </h1>
          <p className="truncate text-xs text-muted-foreground">{currentRoute?.description || "Platform management"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400 sm:flex">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span className="font-medium text-[12px]">Super Admin Mode</span>
        </div>
        <ThemeSwitcher />
        <Button className="h-8 rounded-md px-3 text-xs font-medium" onClick={handleLogout} size="sm" type="button" variant="secondary">
          Logout
        </Button>
      </div>
    </header>
  );
};
