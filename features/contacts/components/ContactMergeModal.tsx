"use client";

import { useState } from "react";
import { GitMerge, X } from "lucide-react";

import { Button } from "../../../components/ui/button";
import type { ContactRecordV1 } from "../contact.types";
import { withDisplayPhoneNumber } from "../../shared/mappers";

interface ContactMergeModalProps {
  contacts: ContactRecordV1[];
  duplicateGroups: Array<{
    contacts: ContactRecordV1[];
    count: number;
    value: string;
  }>;
  isPending: boolean;
  onClose: () => void;
  onMerge: (sourceContactId: string, targetContactId: string) => void;
}

export function ContactMergeModal({
  contacts,
  duplicateGroups,
  isPending,
  onClose,
  onMerge,
}: ContactMergeModalProps) {
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");

  const sourceContact = contacts.find((c) => c._id === sourceId);
  const targetContact = contacts.find((c) => c._id === targetId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-[#E4E4E7] bg-white p-6 shadow-modal space-y-5 dark:border-[#303438] dark:bg-[#17191B]">
        <div className="flex items-center justify-between border-b border-[#F0F0F2] pb-4 dark:border-[#202326]">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-[#EDF8F3] p-2 text-[#176B4D] dark:bg-[#15271F] dark:text-[#359B76]">
              <GitMerge className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Merge duplicate contacts</h3>
              <p className="text-xs text-muted-foreground">Consolidate records and activity history</p>
            </div>
          </div>
          <button
            className="rounded-full p-1.5 text-muted-foreground hover:bg-[#F4F4F5] hover:text-foreground dark:hover:bg-[#202326]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Duplicate suggestions */}
        {duplicateGroups.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Detected duplicate groups ({duplicateGroups.length})
            </p>
            <div className="max-h-36 overflow-y-auto space-y-2 niwa-scrollbar">
              {duplicateGroups.map((group, idx) => (
                <div
                  className="flex items-center justify-between rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] p-3 text-xs dark:border-[#292C2F] dark:bg-[#121416]"
                  key={idx}
                >
                  <div>
                    <span className="font-semibold text-foreground">{group.value}</span>
                    <span className="ml-2 text-muted-foreground">({group.count} records)</span>
                  </div>
                  <Button
                    onClick={() => {
                      if (group.contacts[0]?._id && group.contacts[1]?._id) {
                        setSourceId(group.contacts[1]._id);
                        setTargetId(group.contacts[0]._id);
                      }
                    }}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    Select pair
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Selectors */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#C2413A] dark:text-[#D7685C]">
              1. Source (To be merged & deleted)
            </label>
            <select
              className="w-full rounded-xl border border-[#D4D4D8] bg-white p-2.5 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#121416]"
              onChange={(e) => setSourceId(e.target.value)}
              value={sourceId}
            >
              <option value="">Select source contact...</option>
              {contacts.map((c) => (
                <option disabled={c._id === targetId} key={c._id} value={c._id}>
                  {c.displayName} ({withDisplayPhoneNumber(c.phoneNumber)})
                </option>
              ))}
            </select>

            {sourceContact ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs space-y-1 text-[#C2413A] dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-[#D7685C]">
                <p className="font-semibold">{sourceContact.displayName}</p>
                <p>{withDisplayPhoneNumber(sourceContact.phoneNumber)}</p>
                {sourceContact.company ? <p>{sourceContact.company}</p> : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#176B4D] dark:text-[#359B76]">
              2. Target (Primary master contact)
            </label>
            <select
              className="w-full rounded-xl border border-[#D4D4D8] bg-white p-2.5 text-xs text-foreground outline-none dark:border-[#303438] dark:bg-[#121416]"
              onChange={(e) => setTargetId(e.target.value)}
              value={targetId}
            >
              <option value="">Select target contact...</option>
              {contacts.map((c) => (
                <option disabled={c._id === sourceId} key={c._id} value={c._id}>
                  {c.displayName} ({withDisplayPhoneNumber(c.phoneNumber)})
                </option>
              ))}
            </select>

            {targetContact ? (
              <div className="rounded-xl border border-emerald-200 bg-[#EDF8F3] p-3 text-xs space-y-1 text-[#16803C] dark:border-[#24483A] dark:bg-[#13251E] dark:text-[#3FA66F]">
                <p className="font-semibold">{targetContact.displayName}</p>
                <p>{withDisplayPhoneNumber(targetContact.phoneNumber)}</p>
                {targetContact.company ? <p>{targetContact.company}</p> : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1"
            disabled={!sourceId || !targetId || sourceId === targetId || isPending}
            onClick={() => onMerge(sourceId, targetId)}
            type="button"
            variant="primary"
          >
            {isPending ? "Merging records..." : "Confirm & Merge Contacts"}
          </Button>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
