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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-[#ddd2c3] bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#eee4d8] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-[#e6eee6] p-2 text-[#2d644d]">
              <GitMerge className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#25342f]">Merge duplicate contacts</h3>
              <p className="text-xs text-[#6f7f75]">Consolidate records and activity history</p>
            </div>
          </div>
          <button
            className="rounded-full p-1.5 text-[#6f7f75] hover:bg-[#efe7db] hover:text-[#25342f]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Duplicate suggestions */}
        {duplicateGroups.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7f75]">
              Detected duplicate groups ({duplicateGroups.length})
            </p>
            <div className="max-h-36 overflow-y-auto space-y-2 niwa-scrollbar">
              {duplicateGroups.map((group, idx) => (
                <div
                  className="flex items-center justify-between rounded-xl border border-[#e2d8ca] bg-[#fbf7f1] p-3 text-xs"
                  key={idx}
                >
                  <div>
                    <span className="font-semibold text-[#25342f]">{group.value}</span>
                    <span className="ml-2 text-[#6f7f75]">({group.count} records)</span>
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
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#9d3434]">
              1. Source (To be merged & deleted)
            </label>
            <select
              className="w-full rounded-xl border border-[#ddd2c3] bg-white p-2.5 text-xs text-[#25342f] outline-none"
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
              <div className="rounded-xl border border-[#f3d3d3] bg-[#fdeaea] p-3 text-xs space-y-1 text-[#9d3434]">
                <p className="font-semibold">{sourceContact.displayName}</p>
                <p>{withDisplayPhoneNumber(sourceContact.phoneNumber)}</p>
                {sourceContact.company ? <p>{sourceContact.company}</p> : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#2d644d]">
              2. Target (Primary master contact)
            </label>
            <select
              className="w-full rounded-xl border border-[#ddd2c3] bg-white p-2.5 text-xs text-[#25342f] outline-none"
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
              <div className="rounded-xl border border-[#bfd8c6] bg-[#eef8f0] p-3 text-xs space-y-1 text-[#244b42]">
                <p className="font-semibold">{targetContact.displayName}</p>
                <p>{withDisplayPhoneNumber(targetContact.phoneNumber)}</p>
                {targetContact.company ? <p>{targetContact.company}</p> : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1 bg-[#2d644d] text-white hover:bg-[#255440]"
            disabled={!sourceId || !targetId || sourceId === targetId || isPending}
            onClick={() => onMerge(sourceId, targetId)}
            type="button"
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
