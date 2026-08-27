"use client";

import Image from "next/image";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { adminNavigationGroups } from "../config/navigation";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 border-r border-slate-800 bg-slate-900 px-3 py-3 transition-[width] duration-200 ease-out dark:border-[#24272A] dark:bg-[#0B0F15] lg:flex lg:flex-col",
        collapsed ? "w-[68px]" : "w-[230px]",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-2 py-1">
        <Link className="min-w-0 flex items-center" href="/admin">
          {collapsed ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <span className="font-bold text-blue-700 dark:text-blue-400">SA</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 h-8 px-1">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 dark:bg-blue-900/40">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">SA</span>
              </div>
              <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 text-sm">Super Admin</span>
            </div>
          )}
        </Link>
        <Button
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="h-8 w-8 rounded-md px-0 text-muted-foreground hover:bg-[#F1F5F9] hover:text-foreground dark:hover:bg-[#1E293B]"
          onClick={onToggle}
          type="button"
          variant="ghost"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <div className="mt-5 flex-1 space-y-4 overflow-y-auto px-0.5 pb-3 niwa-scrollbar">
        {adminNavigationGroups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <div className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
                {group.label}
              </div>
            ) : null}
            <nav className="space-y-0.5">
              {group.items.map(({ href, icon: Icon, label }) => {
                const active =
                  href === "/admin"
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    aria-label={label}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                      active
                        ? "bg-slate-800 text-blue-400 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200",
                      collapsed && "justify-center px-0",
                    )}
                    href={href}
                    key={href}
                    title={collapsed ? label : undefined}
                  >
                    {active ? (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r bg-blue-500 dark:bg-blue-500" />
                    ) : null}
                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-blue-400 dark:text-blue-400" : "text-slate-500 group-hover:text-slate-300 dark:text-slate-500 dark:group-hover:text-slate-300")} />
                    {!collapsed ? <span className="truncate">{label}</span> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
      
      <div className="border-t border-[#E4E4E7] px-0.5 pt-3 dark:border-[#24272A]">
        <Link
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200",
            collapsed && "justify-center px-0",
          )}
          href="/"
          title={collapsed ? "Back to App" : undefined}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          {!collapsed ? <span>Back to App</span> : null}
        </Link>
      </div>
    </aside>
  );
};
