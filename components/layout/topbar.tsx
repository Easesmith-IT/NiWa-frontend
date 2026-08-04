"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Menu, Search, Wifi } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { clearAccessToken } from "../../lib/auth";
import { apiClient } from "../../lib/api/client";
import { Button } from "../ui/button";
import { routeMeta } from "./navigation";

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onToggleSidebar: () => void;
}

export const Topbar = ({ onOpenCommandPalette, onToggleSidebar }: TopbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      clearAccessToken();
      queryClient.clear();
      router.replace("/login");
    }
  };

  const currentRoute =
    [...routeMeta.entries()].find(([href]) =>
      href === "/"
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`),
    )?.[1] ?? routeMeta.get("/");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#E4E4E7] bg-white px-4 md:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button className="h-8 w-8 rounded-md px-0 lg:hidden" onClick={onToggleSidebar} type="button" variant="ghost">
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold leading-6 text-foreground tracking-tight">{currentRoute?.label || "NiWa"}</h1>
          <p className="truncate text-xs text-muted-foreground">{currentRoute?.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          className="hidden h-8.5 min-w-[260px] items-center gap-2 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-3 text-xs text-[#71717A] transition-colors hover:border-[#A1A1AA] hover:text-[#18181B] md:flex"
          onClick={onOpenCommandPalette}
          type="button"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-[#71717A]" />
          <span className="flex-1 text-left truncate">Search contacts, conversations...</span>
          <kbd className="rounded border border-[#E4E4E7] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#71717A]">Ctrl K</kbd>
        </button>
        <div className="hidden items-center gap-1.5 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-1 text-xs text-muted-foreground sm:flex">
          <Wifi className="h-3.5 w-3.5 text-[#16803C]" />
          <span className="font-medium text-[12px] text-[#52525B]">API Live</span>
        </div>
        <Button className="h-8 rounded-md px-3 text-xs font-medium" onClick={handleLogout} size="sm" type="button" variant="secondary">
          Logout
        </Button>
      </div>
    </header>
  );
};

