"use client";

import { useEffect, useMemo, useState } from "react";
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
  ContactImportModal,
  ContactMergeModal,
  ContactsDataTable,
  useContactDuplicatesV1Query,
  useContactsV1Query,
  useCreateContactV1Mutation,
  useDeleteContactV1Mutation,
  useImportContactsV1Mutation,
  useMergeContactsV1Mutation,
  usePatchContactV1Mutation,
} from "../../../features/contacts";
import { exportContactsV1 } from "../../../features/contacts/contact.api";
import { useLabelsV1Query } from "../../../features/labels";
import type { ContactRecordV1 } from "../../../features/contacts/contact.types";

const defaultNewContact = {
  company: "",
  displayName: "",
  email: "",
  phoneNumber: "",
  profileName: "",
};

export default function ContactsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newContactDraft, setNewContactDraft] = useState(defaultNewContact);

  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);

  const contactsQuery = useContactsV1Query({ search });
  const duplicateGroupsQuery = useContactDuplicatesV1Query({ field: "phoneNumberE164" });
  const labelsQuery = useLabelsV1Query();

  const createContactMutation = useCreateContactV1Mutation();
  const patchContactMutation = usePatchContactV1Mutation();
  const deleteContactMutation = useDeleteContactV1Mutation();
  const importContactsMutation = useImportContactsV1Mutation();
  const mergeContactsMutation = useMergeContactsV1Mutation();

  const contacts = contactsQuery.data?.data ?? [];
  const labels = labelsQuery.data?.data ?? [];
  const duplicateGroups = duplicateGroupsQuery.data?.data ?? [];

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact._id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  );

  useEffect(() => {
    if (!selectedContactId && contacts[0]?._id) {
      setSelectedContactId(contacts[0]._id);
    }
  }, [contacts, selectedContactId]);

  const handleOpenChat = (phoneNumber: string) => {
    router.push(`/inbox?search=${encodeURIComponent(phoneNumber)}`);
  };

  const handleCreateContact = () => {
    const payload = {
      company: newContactDraft.company.trim() || undefined,
      displayName: newContactDraft.displayName.trim(),
      email: newContactDraft.email.trim() || undefined,
      phoneNumber: newContactDraft.phoneNumber.trim(),
      phoneNumberE164: newContactDraft.phoneNumber.trim(),
      profileName: newContactDraft.profileName.trim() || undefined,
      waId: newContactDraft.phoneNumber.trim(),
    };

    createContactMutation.mutate(payload, {
      onSuccess: (result) => {
        setFeedback({ message: "Contact created successfully.", tone: "success" });
        setCreateModalOpen(false);
        setNewContactDraft(defaultNewContact);
        setSelectedContactId(result.data._id);
      },
      onError: (err) => {
        setFeedback({
          message: err instanceof Error ? err.message : "Failed to create contact.",
          tone: "error",
        });
      },
    });
  };

  const handleSaveContact = (contactId: string, payload: Partial<ContactRecordV1>) => {
    patchContactMutation.mutate(
      { contactId, payload },
      {
        onSuccess: () => {
          setFeedback({ message: "Contact updated successfully.", tone: "success" });
        },
        onError: (err) => {
          setFeedback({
            message: err instanceof Error ? err.message : "Failed to update contact.",
            tone: "error",
          });
        },
      },
    );
  };

  const handleDeleteContact = (contactId: string) => {
    deleteContactMutation.mutate(contactId, {
      onSuccess: () => {
        setFeedback({ message: "Contact deleted.", tone: "success" });
        if (selectedContactId === contactId) {
          setSelectedContactId(null);
        }
      },
      onError: (err) => {
        setFeedback({
          message: err instanceof Error ? err.message : "Failed to delete contact.",
          tone: "error",
        });
      },
    });
  };

  const handleExport = async () => {
    try {
      const result = await exportContactsV1({ format: "csv", search: search || undefined });
      const url = URL.createObjectURL(result as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "niwa-contacts.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setFeedback({ message: "Failed to export contacts.", tone: "error" });
    }
  };

  const handleImportContacts = (
    importedContacts: Array<{
      company?: string;
      displayName: string;
      email?: string;
      phoneNumber: string;
      phoneNumberE164: string;
      profileName?: string;
      waId: string;
    }>,
  ) => {
    importContactsMutation.mutate(
      { contacts: importedContacts },
      {
        onSuccess: (res) => {
          setFeedback({
            message: `Successfully imported ${res.data.created} contact(s) (${res.data.updated} updated).`,
            tone: "success",
          });
          setImportModalOpen(false);
        },
        onError: (err) => {
          setFeedback({
            message: err instanceof Error ? err.message : "Bulk import failed.",
            tone: "error",
          });
        },
      },
    );
  };

  const handleMergeContacts = (sourceId: string, targetId: string) => {
    mergeContactsMutation.mutate(
      { sourceContactId: sourceId, targetContactId: targetId },
      {
        onSuccess: () => {
          setFeedback({ message: "Contacts merged successfully.", tone: "success" });
          setMergeModalOpen(false);
          setSelectedContactId(targetId);
        },
        onError: (err) => {
          setFeedback({
            message: err instanceof Error ? err.message : "Failed to merge contacts.",
            tone: "error",
          });
        },
      },
    );
  };

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
            onClick={() => setImportModalOpen(true)}
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

      {/* Import Modal */}
      {importModalOpen ? (
        <ContactImportModal
          isPending={importContactsMutation.isPending}
          onClose={() => setImportModalOpen(false)}
          onImport={handleImportContacts}
        />
      ) : null}

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
