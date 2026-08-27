"use client";

import { ReactNode, useState } from "react";

import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar onToggleSidebar={() => setSidebarCollapsed((current) => !current)} />
        <main className="flex flex-1 flex-col min-h-0 overflow-y-auto p-4 md:p-5 lg:p-6 bg-slate-50/50 dark:bg-[#0d1014]">
          {children}
        </main>
      </div>
    </div>
  );
};
