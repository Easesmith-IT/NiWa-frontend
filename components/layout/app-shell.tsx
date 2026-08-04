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
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          />
          <main className="flex flex-1 flex-col min-h-0 overflow-y-auto p-4 md:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette onClose={() => setCommandPaletteOpen(false)} open={commandPaletteOpen} />
    </>
  );
};

