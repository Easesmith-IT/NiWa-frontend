"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { useLabelsV1Query } from "../../labels";
import { exportContactsV1 } from "../contact.api";
import {
  useContactDuplicatesV1Query,
  useContactsV1Query,
  useCreateContactV1Mutation,
  useDeleteContactV1Mutation,
  useMergeContactsV1Mutation,
  usePatchContactV1Mutation,
} from "../contact.queries";
import type { ContactRecordV1 } from "../contact.types";

export interface NewContactDraft {
  company: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  profileName: string;
}

export const defaultNewContact: NewContactDraft = {
  company: "",
  displayName: "",
  email: "",
  phoneNumber: "",
  profileName: "",
};

export interface ContactsFeedback {
  message: string;
  tone: "error" | "success";
}

export function useContactsOrchestration() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newContactDraft, setNewContactDraft] = useState<NewContactDraft>(defaultNewContact);
  const [feedback, setFeedback] = useState<ContactsFeedback | null>(null);

  const contactsQuery = useContactsV1Query({ search });
  const duplicateGroupsQuery = useContactDuplicatesV1Query({ field: "phoneNumberE164" });
  const labelsQuery = useLabelsV1Query();

  const createContactMutation = useCreateContactV1Mutation();
  const patchContactMutation = usePatchContactV1Mutation();
  const deleteContactMutation = useDeleteContactV1Mutation();
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
      onError: (err: unknown) => {
        let msg = "Failed to create contact.";
        if (isAxiosError(err)) {
          const issues = err.response?.data?.issues?.fieldErrors;
          if (issues && typeof issues === "object") {
            const issueMsg = Object.entries(issues as Record<string, unknown>)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? (v as unknown[]).join(", ") : String(v)}`)
              .join("; ");
            if (issueMsg) {
              msg = issueMsg;
            }
          }
          if (msg === "Failed to create contact." && err.response?.data?.message) {
            msg = String(err.response.data.message);
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }

        setFeedback({
          message: msg,
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

  return {
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
    contactsQuery,
    duplicateGroupsQuery,
    labelsQuery,
    createContactMutation,
    patchContactMutation,
    deleteContactMutation,
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
  };
}
