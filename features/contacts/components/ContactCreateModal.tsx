import React from "react";
import { X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { NewContactDraft } from "../hooks/useContactsOrchestration";

export interface ContactCreateModalProps {
  newContactDraft: NewContactDraft;
  onDraftChange: (updater: (prev: NewContactDraft) => NewContactDraft) => void;
  isCreating: boolean;
  onCreateContact: () => void;
  onClose: () => void;
}

export const ContactCreateModal: React.FC<ContactCreateModalProps> = ({
  newContactDraft,
  onDraftChange,
  isCreating,
  onCreateContact,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#ddd2c3] bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#eee4d8] pb-3">
          <h3 className="text-lg font-semibold text-[#25342f]">Create new contact</h3>
          <button
            className="rounded-full p-1.5 text-[#6f7f75] hover:bg-[#efe7db] hover:text-[#25342f]"
            onClick={onClose}
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
                onDraftChange((prev) => ({ ...prev, displayName: e.target.value }))
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
                onDraftChange((prev) => ({ ...prev, phoneNumber: e.target.value }))
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
                onDraftChange((prev) => ({ ...prev, company: e.target.value }))
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
                onDraftChange((prev) => ({ ...prev, email: e.target.value }))
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
              isCreating
            }
            onClick={onCreateContact}
            type="button"
          >
            {isCreating ? "Creating..." : "Save Contact"}
          </Button>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
