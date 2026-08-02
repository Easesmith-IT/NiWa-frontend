"use client";

import Image from "next/image";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { navigationGroups, secondaryActions } from "./navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-white/70 bg-[rgba(247,245,240,0.72)] px-3 py-4 backdrop-blur-md transition-[width] duration-200 ease-out lg:flex lg:flex-col",
        collapsed ? "w-[72px]" : "w-[236px]",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-2">
        <Link className="min-w-0" href="/">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Image alt="NiWa logo" className="h-6 w-6 object-contain" height={24} src="/niwa-logo.png" width={24} />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">NiWa</p>
                <p className="truncate text-xs text-muted-foreground">Communication Ops</p>
              </div>
            ) : null}
          </div>
        </Link>
        <Button
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="h-9 w-9 rounded-lg px-0"
          onClick={onToggle}
          type="button"
          variant="ghost"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mt-6 flex-1 space-y-5 overflow-y-auto px-1 pb-4">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {group.label}
              </div>
            ) : null}
            <nav className="space-y-1">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active =
                  href === "/"
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    aria-label={label}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[hsl(var(--focus))] focus:ring-offset-2",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-white/80 hover:text-foreground",
                      collapsed && "justify-center px-0",
                    )}
                    href={href}
                    key={href}
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed ? <span className="truncate">{label}</span> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-border/70 px-2 pt-4">
        <div className="space-y-1">
          {secondaryActions.map(({ href, icon: Icon, label }) => (
            <Link
              aria-label={label}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-white/80 hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
              href={href}
              key={href}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{label}</span> : null}
            </Link>
          ))}
        </div>
        {!collapsed ? (
          <div className="mt-4 rounded-xl border border-border/70 bg-white/65 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Workspace
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">Single-account operator desk</p>
            <p className="mt-1 text-xs text-muted-foreground">Production-oriented WhatsApp operations</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
};
