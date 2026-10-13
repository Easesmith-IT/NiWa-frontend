"use client";

import React from "react";
import { UserPlus, X } from "lucide-react";
import type { useContactsOrchestration } from "../hooks/useContactsOrchestration";
import { ContactCreateModal } from "./ContactCreateModal";
import { ContactDetailDrawer } from "./ContactDetailDrawer";
import { ContactMergeModal } from "./ContactMergeModal";
import { ContactsDataTable } from "./ContactsDataTable";
import { ContactsHeader } from "./ContactsHeader";
import { CrmPageShell } from "../../crm/components/CrmPageShell";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export interface ContactsShellProps {
  orchestration: ReturnType<typeof useContactsOrchestration>;
}

export const ContactsShell: React.FC<ContactsShellProps> = ({ orchestration }) => {
  const {
    search,
    setSearch,
    selectedContactId,
    setSelectedContactId,
    mergeModalOpen,
    setMergeModalOpen,
    createModalOpen,
    setCreateModalOpen,
    newContactDraft,
    setNewContactDraft,
    feedback,
    setFeedback,
    createContactMutation,
    mergeContactsMutation,
    contacts,
    labels,
    duplicateGroups,
    selectedContact,
    handleOpenChat,
    handleCreateContact,
    handleSaveContact,
    handleDeleteContact,
    handleExport,
    handleMergeContacts,
  } = orchestration;

  const router = require("next/navigation").useRouter();

  return (
    <CrmPageShell
      breadcrumb="CRM / Contacts"
      title="Customer Registry"
      description="Enterprise CRM for WhatsApp business contacts, tags, and notes"
      primaryAction={
        <>
          <Button
            className="bg-[#176B4D] text-white hover:bg-[#12583F] dark:bg-[#208560] dark:hover:bg-[#176B4D]"
            onClick={() => setCreateModalOpen(true)}
            size="sm"
            type="button"
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            New Contact
          </Button>

          <Button
            onClick={() => router.push("/contacts/import")}
            size="sm"
            type="button"
            variant="outline"
          >
            Import
          </Button>

          <Button
            onClick={() => setMergeModalOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            Merge Duplicates ({duplicateGroups.length})
          </Button>

          <Button
            onClick={handleExport}
            size="sm"
            type="button"
            variant="outline"
          >
            Export CSV
          </Button>
        </>
      }
      queryControls={
        <div className="relative w-full sm:w-72">
          <Input
            className="h-8 text-xs"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, company..."
            value={search}
          />
        </div>
      }
      dataSurface={
        <div className="flex h-full flex-col">
          {feedback ? (
            <div
              className={`flex items-center justify-between border-b px-4 py-2 text-xs font-medium ${
                feedback.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              }`}
            >
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback(null)} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <div className="grid min-h-0 flex-1 gap-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] overflow-hidden">
            <div className="min-h-0 overflow-y-auto border-r border-[#E4E4E7] dark:border-[#24272A]">
              <ContactsDataTable
                contacts={contacts}
                onDeleteContact={handleDeleteContact}
                onEditContact={(contact) => {
                  setSelectedContactId(contact._id);
                }}
                onOpenChat={handleOpenChat}
                onSelectContact={(contactId) => setSelectedContactId(contactId)}
                selectedContactId={selectedContactId}
              />
            </div>

            <div className="min-h-0 bg-[#FAFAFA] dark:bg-[#121416] overflow-y-auto">
              {selectedContact ? (
                <ContactDetailDrawer
                  availableLabels={labels}
                  contact={selectedContact}
                  onClose={() => setSelectedContactId(null)}
                  onDeleteContact={handleDeleteContact}
                  onOpenChat={handleOpenChat}
                  onSaveContact={handleSaveContact}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <UserPlus className="h-10 w-10 text-muted-foreground/60" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    No contact selected
                  </p>
                  <p className="mt-1 text-xs">
                    Select a contact from the registry table to view details & notes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      }
    >
      {mergeModalOpen ? (
        <ContactMergeModal
          contacts={contacts}
          duplicateGroups={duplicateGroups}
          isPending={mergeContactsMutation.isPending}
          onClose={() => setMergeModalOpen(false)}
          onMerge={handleMergeContacts}
        />
      ) : null}

      {createModalOpen ? (
        <ContactCreateModal
          isCreating={createContactMutation.isPending}
          newContactDraft={newContactDraft}
          onClose={() => setCreateModalOpen(false)}
          onCreateContact={handleCreateContact}
          onDraftChange={setNewContactDraft}
        />
      ) : null}
    </CrmPageShell>
  );
};
