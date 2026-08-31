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
            className="bg-[#2d644d] text-white hover:bg-[#255440]"
            onClick={() => setCreateModalOpen(true)}
            size="sm"
            type="button"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            New Contact
          </Button>

          <Button
            className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
            onClick={() => router.push("/contacts/import")}
            size="sm"
            type="button"
            variant="secondary"
          >
            Import
          </Button>

          <Button
            className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
            onClick={() => setMergeModalOpen(true)}
            size="sm"
            type="button"
            variant="secondary"
          >
            Merge Duplicates ({duplicateGroups.length})
          </Button>

          <Button
            className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
            onClick={handleExport}
            size="sm"
            type="button"
            variant="secondary"
          >
            Export CSV
          </Button>
        </>
      }
      queryControls={
        <div className="relative w-full sm:w-72">
          <Input
            className="rounded-xl border-[#ddd2c3] bg-white text-xs text-[#25342f] placeholder:text-[#7a8b82]"
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
                  ? "bg-[#eef8f0] text-[#244b42] border-[#bfd8c6]"
                  : "bg-[#fdf0ee] text-[#9a3d33] border-[#e6c2bc]"
              }`}
            >
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback(null)} type="button">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <div className="grid min-h-0 flex-1 gap-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] overflow-hidden">
            <div className="min-h-0 overflow-y-auto border-r border-slate-200">
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

            <div className="min-h-0 bg-slate-50 overflow-y-auto">
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
                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-[#7a8b82]">
                  <UserPlus className="h-10 w-10 text-[#a0aca4]" />
                  <p className="mt-3 text-sm font-semibold text-[#25342f]">
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
