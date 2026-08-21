"use client";

import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  GitMerge,
  Plus,
  Search,
  Upload,
  UserPlus,
  X,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  ContactDetailDrawer,
  ContactMergeModal,
  ContactsDataTable,
  useContactsOrchestration,
} from "../../../features/contacts";

export default function ContactsPage() {
  const router = useRouter();

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
  } = useContactsOrchestration();

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col space-y-4">
      {/* Top Enterprise Control Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e5ddd3] bg-[#fbf7f1] p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#25342f]">
            Customer Registry
          </h1>
          <p className="text-xs text-[#6f7f75]">
            Enterprise CRM for WhatsApp business contacts, tags, and notes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#7a8b82]" />
            <Input
              className="rounded-xl border-[#ddd2c3] bg-white pl-9 text-xs text-[#25342f] placeholder:text-[#7a8b82]"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, company..."
              value={search}
            />
          </div>

          <Button
            className="bg-[#2d644d] text-white hover:bg-[#255440]"
            onClick={() => setCreateModalOpen(true)}
            size="sm"
            type="button"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Contact
          </Button>

          <Button
            className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
            onClick={() => router.push("/contacts/import")}
            size="sm"
            type="button"
            variant="secondary"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5 text-[#2d644d]" />
            Import
          </Button>

          <Button
            className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
            onClick={() => setMergeModalOpen(true)}
            size="sm"
            type="button"
            variant="secondary"
          >
            <GitMerge className="mr-1.5 h-3.5 w-3.5 text-[#2d644d]" />
            Merge Duplicates ({duplicateGroups.length})
          </Button>

          <Button
            className="border-[#ddd2c3] bg-white text-[#25342f] hover:bg-[#f6f1e9]"
            onClick={handleExport}
            size="sm"
            type="button"
            variant="secondary"
          >
            <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Global Feedback Banner */}
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

      {/* Main Workspace Area: Table + Sliding Detail Drawer */}
      <div className="grid min-h-0 flex-1 gap-4 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Contacts Data Table */}
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

        {/* Selected Contact Inspector Drawer */}
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

      {/* Merge Modal */}
      {mergeModalOpen ? (
        <ContactMergeModal
          contacts={contacts}
          duplicateGroups={duplicateGroups}
          isPending={mergeContactsMutation.isPending}
          onClose={() => setMergeModalOpen(false)}
          onMerge={handleMergeContacts}
        />
      ) : null}

      {/* New Contact Creation Modal */}
      {createModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#ddd2c3] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#eee4d8] pb-3">
              <h3 className="text-lg font-semibold text-[#25342f]">Create new contact</h3>
              <button
                className="rounded-full p-1.5 text-[#6f7f75] hover:bg-[#efe7db] hover:text-[#25342f]"
                onClick={() => setCreateModalOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7f75]">
                  Display Name *
                </label>
                <Input
                  onChange={(e) =>
                    setNewContactDraft((prev) => ({ ...prev, displayName: e.target.value }))
                  }
                  placeholder="e.g. Anita Sharma"
                  value={newContactDraft.displayName}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7f75]">
                  Phone Number (E.164) *
                </label>
                <Input
                  onChange={(e) =>
                    setNewContactDraft((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  placeholder="e.g. 919876543210"
                  value={newContactDraft.phoneNumber}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7f75]">
                  Company Name
                </label>
                <Input
                  onChange={(e) =>
                    setNewContactDraft((prev) => ({ ...prev, company: e.target.value }))
                  }
                  placeholder="e.g. Acme Corp"
                  value={newContactDraft.company}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7f75]">
                  Email Address
                </label>
                <Input
                  onChange={(e) =>
                    setNewContactDraft((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="e.g. anita@example.com"
                  type="email"
                  value={newContactDraft.email}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-[#2d644d] text-white hover:bg-[#255440]"
                disabled={
                  !newContactDraft.displayName.trim() ||
                  !newContactDraft.phoneNumber.trim() ||
                  createContactMutation.isPending
                }
                onClick={handleCreateContact}
                type="button"
              >
                {createContactMutation.isPending ? "Creating..." : "Save Contact"}
              </Button>
              <Button onClick={() => setCreateModalOpen(false)} type="button" variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
