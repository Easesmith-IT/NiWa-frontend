"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";
import { UniversalCreateModal } from "./universal-create-modal";
import { LeadFormModal } from "../../features/leads/components/LeadFormModal";
import { DealFormModal } from "../../features/deals/components/DealFormModal";
import { TaskFormModal } from "../../features/tasks/components/TaskFormModal";
import { ContactCreateModal } from "../../features/contacts/components/ContactCreateModal";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [universalCreateOpen, setUniversalCreateOpen] = useState(false);

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen((current) => !current);
      }
      if (
        event.altKey &&
        event.key.toLowerCase() === "c" &&
        !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement)?.tagName)
      ) {
        event.preventDefault();
        setUniversalCreateOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} />
        <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onOpenUniversalCreate={() => setUniversalCreateOpen(true)}
            onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          />
          <main className="flex flex-1 flex-col min-h-0 overflow-y-auto p-4 md:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette
        onClose={() => setCommandPaletteOpen(false)}
        onOpenUniversalCreate={() => setUniversalCreateOpen(true)}
        open={commandPaletteOpen}
      />
      <UniversalCreateModal
        isOpen={universalCreateOpen}
        onClose={() => setUniversalCreateOpen(false)}
        onSelectContact={() => setContactModalOpen(true)}
        onSelectDeal={() => setDealModalOpen(true)}
        onSelectLead={() => setLeadModalOpen(true)}
        onSelectTask={() => setTaskModalOpen(true)}
      />
      {contactModalOpen && (
        <ContactCreateModal
          onClose={() => setContactModalOpen(false)}
        />
      )}
      {leadModalOpen && (
        <LeadFormModal
          isOpen={leadModalOpen}
          onClose={() => setLeadModalOpen(false)}
        />
      )}
      {dealModalOpen && (
        <DealFormModal
          isOpen={dealModalOpen}
          onClose={() => setDealModalOpen(false)}
        />
      )}
      {taskModalOpen && (
        <TaskFormModal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
        />
      )}
    </>
  );
};

