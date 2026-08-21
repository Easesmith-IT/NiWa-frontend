"use client";

import React from "react";
import { UserPlus, X } from "lucide-react";
import type { useContactsOrchestration } from "../hooks/useContactsOrchestration";
import { ContactCreateModal } from "./ContactCreateModal";
import { ContactDetailDrawer } from "./ContactDetailDrawer";
import { ContactMergeModal } from "./ContactMergeModal";
import { ContactsDataTable } from "./ContactsDataTable";
import { ContactsHeader } from "./ContactsHeader";

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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col space-y-4">
      <ContactsHeader
        duplicateCount={duplicateGroups.length}
        onExportCsv={handleExport}
        onOpenCreateModal={() => setCreateModalOpen(true)}
        onOpenMergeModal={() => setMergeModalOpen(true)}
        onSearchChange={setSearch}
        search={search}
      />

      {feedback ? (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium ${
            feedback.tone === "success"
              ? "border-[#bfd8c6] bg-[#eef8f0] text-[#244b42]"
              : "border-[#e6c2bc] bg-[#fdf0ee] text-[#9a3d33]"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-4 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-h-0 overflow-y-auto">
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

        <div className="min-h-0">
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
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#ddd2c3] bg-[#fbf7f1] p-8 text-center text-[#7a8b82]">
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
    </div>
  );
};
