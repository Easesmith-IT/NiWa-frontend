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
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-white/70 bg-[rgba(247,245,240,0.82)] px-4 backdrop-blur-md md:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button className="h-9 w-9 rounded-lg px-0 lg:hidden" onClick={onToggleSidebar} type="button" variant="ghost">
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{currentRoute?.label || "NiWa"}</p>
          <p className="truncate text-xs text-muted-foreground">{currentRoute?.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="hidden h-9 min-w-[260px] items-center gap-2 rounded-xl border border-border/80 bg-white/72 px-3 text-sm text-muted-foreground transition hover:border-border hover:text-foreground md:flex"
          onClick={onOpenCommandPalette}
          type="button"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search contacts, conversations, notes</span>
          <span className="rounded border border-border/80 px-1.5 py-0.5 text-[11px]">Ctrl K</span>
        </button>
        <div className="hidden items-center gap-2 rounded-xl border border-border/80 bg-white/72 px-3 py-2 text-xs text-muted-foreground sm:flex">
          <Wifi className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
          API connected
        </div>
        <Button className="h-9 rounded-lg" onClick={handleLogout} size="sm" type="button" variant="secondary">
          Logout
        </Button>
      </div>
    </header>
  );
};
