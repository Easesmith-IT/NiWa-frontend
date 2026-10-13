"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { queryKeys } from "../../../lib/api/query-keys";
import { createContact, createPersonFromContact } from "../contact.api";
import { defaultNewContact, type NewContactDraft } from "../hooks/useContactsOrchestration";

export interface ContactCreateModalProps {
  newContactDraft?: NewContactDraft;
  onDraftChange?: (updater: (prev: NewContactDraft) => NewContactDraft) => void;
  isCreating?: boolean;
  onCreateContact?: (alsoCreatePerson?: boolean) => void;
  onClose: () => void;
}

export const ContactCreateModal: React.FC<ContactCreateModalProps> = ({
  newContactDraft: controlledDraft,
  onDraftChange: controlledOnDraftChange,
  isCreating: controlledIsCreating,
  onCreateContact: controlledOnCreateContact,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [internalDraft, setInternalDraft] = useState<NewContactDraft>(defaultNewContact);
  const [internalCreating, setInternalCreating] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [alsoCreatePerson, setAlsoCreatePerson] = useState(true);

  const draft = controlledDraft ?? internalDraft;
  const setDraft = controlledOnDraftChange ?? setInternalDraft;
  const isSubmitting = controlledIsCreating ?? internalCreating;

  const handleSave = async () => {
    if (controlledOnCreateContact) {
      controlledOnCreateContact(alsoCreatePerson);
      return;
    }

    setInternalError(null);
    setInternalCreating(true);
    try {
      const phone = draft.phoneNumber.trim();
      const created = await createContact({
        company: draft.company.trim() || undefined,
        displayName: draft.displayName.trim(),
        email: draft.email.trim() || undefined,
        phoneNumber: phone,
        phoneNumberE164: phone,
        profileName: draft.profileName.trim() || undefined,
        waId: phone,
      });

      if (alsoCreatePerson && created?.data?._id) {
        try {
          await createPersonFromContact(created.data._id, {
            displayName: draft.displayName.trim(),
            createCompany: Boolean(draft.company.trim()),
            companyName: draft.company.trim() || undefined,
          });
        } catch {
          // Non-blocking if CRM person link fails after contact creation
        }
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
      await queryClient.invalidateQueries({ queryKey: ["crm-people"] });
      await queryClient.invalidateQueries({ queryKey: ["crm-companies"] });
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to create contact.");
      setInternalError(msg);
    } finally {
      setInternalCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-modal dark:border-[#303438] dark:bg-[#17191B]">
        <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3 dark:border-[#282B2E]">
          <div>
            <h3 className="text-base font-semibold text-foreground">Create Customer / Contact</h3>
            <p className="text-[11px] text-muted-foreground">
              Add a WhatsApp contact and optionally link their CRM customer profile.
            </p>
          </div>
          <button
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#25282B]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {internalError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {internalError}
          </div>
        ) : null}

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Display Name *
            </label>
            <Input
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, displayName: e.target.value }))
              }
              placeholder="e.g. Anita Sharma"
              value={draft.displayName}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Phone Number (WhatsApp / E.164) *
            </label>
            <Input
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
              placeholder="e.g. 919876543210"
              value={draft.phoneNumber}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Company Name
            </label>
            <Input
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, company: e.target.value }))
              }
              placeholder="e.g. Acme Corp"
              value={draft.company}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <Input
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="e.g. anita@example.com"
              type="email"
              value={draft.email}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-2.5 dark:border-[#282B2E] dark:bg-[#121416]">
            <input
              checked={alsoCreatePerson}
              className="mt-0.5 h-3.5 w-3.5 rounded border-[#E4E4E7] accent-[#176B4D]"
              onChange={(e) => setAlsoCreatePerson(e.target.checked)}
              type="checkbox"
            />
            <span className="text-xs leading-snug text-foreground">
              <span className="font-semibold">Also create linked CRM Customer (Person) profile</span>
              <span className="block text-[11px] text-muted-foreground">
                Makes this contact immediately selectable in Deals, Quotations, and Sales Orders.
              </span>
            </span>
          </label>
        </div>

        <div className="flex gap-2.5 pt-2">
          <Button
            className="flex-1 bg-[#176B4D] text-white hover:bg-[#12583F] dark:bg-[#208560] dark:hover:bg-[#176B4D]"
            disabled={
              !draft.displayName.trim() ||
              !draft.phoneNumber.trim() ||
              isSubmitting
            }
            onClick={handleSave}
            type="button"
          >
            {isSubmitting ? "Saving..." : "Save Contact"}
          </Button>
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
