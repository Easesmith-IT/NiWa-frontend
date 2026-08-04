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
        "sticky top-0 hidden h-screen shrink-0 border-r border-[#E4E4E7] bg-[#FCFCFD] px-3 py-3 transition-[width] duration-200 ease-out lg:flex lg:flex-col",
        collapsed ? "w-[68px]" : "w-[230px]",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-2 py-1">
        <Link className="min-w-0" href="/">
          <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary-soft))]">
              <Image alt="NiWa logo" className="h-5 w-5 object-contain" height={20} src="/niwa-logo.png" width={20} />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-foreground">NiWa</p>
                <p className="truncate text-[11px] font-medium text-muted-foreground">Operations Desk</p>
              </div>
            ) : null}
          </div>
        </Link>
        <Button
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="h-8 w-8 rounded-md px-0 text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground"
          onClick={onToggle}
          type="button"
          variant="ghost"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mt-5 flex-1 space-y-4 overflow-y-auto px-0.5 pb-3 niwa-scrollbar">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <div className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
                {group.label}
              </div>
            ) : null}
            <nav className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active =
                  href === "/"
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    aria-label={label}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                      active
                        ? "bg-[#EDF8F3] text-[#176B4D]"
                        : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#27272A]",
                      collapsed && "justify-center px-0",
                    )}
                    href={href}
                    key={href}
                    title={collapsed ? label : undefined}
                  >
                    {active ? (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r bg-[#176B4D]" />
                    ) : null}
                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-[#176B4D]" : "text-[#71717A] group-hover:text-[#27272A]")} />
                    {!collapsed ? <span className="truncate">{label}</span> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-[#E4E4E7] px-0.5 pt-3">
        <div className="space-y-0.5">
          {secondaryActions.map(({ href, icon: Icon, label }) => (
            <Link
              aria-label={label}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-[#52525B] transition-colors hover:bg-[#F4F4F5] hover:text-[#27272A]",
                collapsed && "justify-center px-0",
              )}
              href={href}
              key={href}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0 text-[#71717A]" />
              {!collapsed ? <span>{label}</span> : null}
            </Link>
          ))}
        </div>
        {!collapsed ? (
          <div className="mt-3 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-2">
            <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
              Workspace
            </p>
            <p className="mt-0.5 truncate text-xs font-medium text-foreground">Production Operator</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
};

