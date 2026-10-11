"use client";

import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { useWorkspace } from "../../lib/workspace/workspace-context";
import { useWorkspaceDefaultCurrency } from "../../lib/workspace/use-workspace-currency";
import { useWorkspaceModules } from "../../lib/workspace/use-workspace-modules";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { navigationGroups, filterNavigationByModules, secondaryActions } from "./navigation";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileNav = ({ open, onOpenChange }: MobileNavProps) => {
  const pathname = usePathname();
  const { activeWorkspaceId } = useWorkspace();
  const { currency, symbol } = useWorkspaceDefaultCurrency();
  const { enabledModuleKeys } = useWorkspaceModules();

  const visibleGroups = useMemo(
    () => filterNavigationByModules(navigationGroups, enabledModuleKeys),
    [enabledModuleKeys],
  );

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, onOpenChange]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        hideClose
        side="left"
        className="w-[280px] max-w-[85vw] p-0 flex flex-col h-full bg-[#FCFCFD] dark:bg-[#101214] border-r border-[#E4E4E7] dark:border-[#24272A]"
      >
        <div className="flex items-center justify-between border-b border-[#E4E4E7] dark:border-[#24272A] px-4 py-3">
          <Link
            className="flex items-center gap-2"
            href="/"
            onClick={handleLinkClick}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF8F3] dark:bg-[#15271F]">
              <Image
                alt="NiWa logo"
                className="h-5 w-5 object-contain dark:brightness-110"
                height={20}
                src="/niwa-logo.png"
                width={20}
              />
            </div>
            <span className="font-semibold text-base tracking-tight text-foreground">
              NiWa
            </span>
          </Link>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#191C1E]"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <DrawerHeader className="sr-only">
          <DrawerTitle>Navigation Menu</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3 niwa-scrollbar">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <div className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
                {group.label}
              </div>
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
                        "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                        active
                          ? "bg-[#EDF8F3] text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]"
                          : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#27272A] dark:text-[#A7ABAF] dark:hover:bg-[#191C1E] dark:hover:text-[#E4E4E7]",
                      )}
                      href={href}
                      key={href}
                      onClick={handleLinkClick}
                    >
                      {active ? (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r bg-[#176B4D] dark:bg-[#3B9B77]" />
                      ) : null}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active
                            ? "text-[#176B4D] dark:text-[#63B592]"
                            : "text-[#71717A] dark:text-[#81868B] group-hover:text-[#27272A] dark:group-hover:text-[#E4E4E7]",
                        )}
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E4E4E7] px-3 pt-3 pb-4 dark:border-[#24272A]">
          <div className="space-y-0.5">
            {secondaryActions.map(({ href, icon: Icon, label }) => (
              <Link
                aria-label={label}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-[#52525B] transition-colors hover:bg-[#F4F4F5] hover:text-[#27272A] dark:text-[#A7ABAF] dark:hover:bg-[#191C1E] dark:hover:text-[#E4E4E7]"
                href={href}
                key={href}
                onClick={handleLinkClick}
              >
                <Icon className="h-4 w-4 shrink-0 text-[#71717A] dark:text-[#81868B]" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-3 rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-2.5 py-2 dark:border-[#24272A] dark:bg-[#17191B]">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                Workspace
              </p>
              {currency ? (
                <span className="inline-flex items-center gap-1 rounded bg-[#EDF8F3] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:bg-[#15271F] dark:text-emerald-400">
                  {currency} ({symbol})
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-xs font-medium text-foreground">
              {activeWorkspaceId ? activeWorkspaceId : "No Active Workspace"}
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
