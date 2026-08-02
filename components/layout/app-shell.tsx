"use client";

import { ReactNode, useEffect, useState } from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="flex min-h-screen bg-transparent">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          />
          <div className="min-h-0 flex-1 px-4 pb-4 md:px-5 lg:px-6 lg:pb-6">
            <div className="h-full rounded-2xl border border-white/70 bg-[rgba(255,255,255,0.62)] shadow-[var(--shadow-soft)] backdrop-blur-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
      <CommandPalette onClose={() => setCommandPaletteOpen(false)} open={commandPaletteOpen} />
    </>
  );
};
