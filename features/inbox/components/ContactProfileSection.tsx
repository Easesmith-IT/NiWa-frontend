"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, Unlink, UserCheck, UserPlus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { queryKeys } from "../../../lib/api/query-keys";
import {
  createPersonFromContact,
  linkContactPerson,
  unlinkContactPerson,
} from "../../contacts/contact.api";
import { listPeople } from "../../people/people.api";
import { ContactAvatar } from "./ContactAvatar";

export interface ContactProfileSectionProps {
  contact: {
    _id: string;
    avatarUrl?: string | null;
    company?: string | null;
    companyId?: string | { _id: string; name?: string } | null;
    displayName?: string | null;
    email?: string | null;
    personId?: string | { _id: string; displayName?: string; jobTitle?: string } | null;
    phoneNumber?: string | null;
    profileName?: string | null;
  };
  editingContact: boolean;
  onEditingContactChange: (editing: boolean) => void;
  editDisplayName: string;
  onEditDisplayNameChange: (val: string) => void;
  editCompany: string;
  onEditCompanyChange: (val: string) => void;
  editEmail: string;
  onEditEmailChange: (val: string) => void;
  editAvatarUrl: string;
  onEditAvatarUrlChange: (val: string) => void;
  onSaveContact: () => void;
  isSaving: boolean;
}

export function ContactProfileSection({
  contact,
  editingContact,
  onEditingContactChange,
  editDisplayName,
  onEditDisplayNameChange,
  editCompany,
  onEditCompanyChange,
  editEmail,
  onEditEmailChange,
  editAvatarUrl,
  onEditAvatarUrlChange,
  onSaveContact,
  isSaving,
}: ContactProfileSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedPersonToLink, setSelectedPersonToLink] = useState("");

  const linkedPersonId =
    typeof contact.personId === "object" && contact.personId !== null
      ? contact.personId._id
      : (contact.personId as string | undefined) || null;

  const linkedPersonName =
    typeof contact.personId === "object" && contact.personId !== null
      ? contact.personId.displayName || contact.displayName || "CRM Person"
      : contact.displayName || "Linked CRM Person";

  const { data: peopleList = [] } = useQuery({
    queryKey: ["crm-people"],
    queryFn: () => listPeople(),
    enabled: !linkedPersonId,
  });

  const invalidateAfterLink = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
    queryClient.invalidateQueries({ queryKey: ["crm-people"] });
  };

  const promotePersonMutation = useMutation({
    mutationFn: () =>
      createPersonFromContact(contact._id, {
        displayName: contact.displayName || contact.phoneNumber || "Customer",
        createCompany: Boolean(contact.company),
        companyName: contact.company || undefined,
      }),
    onSuccess: invalidateAfterLink,
  });

  const linkPersonMutation = useMutation({
    mutationFn: (personId: string) => linkContactPerson(contact._id, personId),
    onSuccess: () => {
      setSelectedPersonToLink("");
      invalidateAfterLink();
    },
  });

  const unlinkPersonMutation = useMutation({
    mutationFn: () => unlinkContactPerson(contact._id),
    onSuccess: invalidateAfterLink,
  });

  return (
    <div className="space-y-4 px-5 py-5">
      {editingContact ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Display name</label>
            <Input
              onChange={(event) => onEditDisplayNameChange(event.target.value)}
              value={editDisplayName}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Company</label>
            <Input
              onChange={(event) => onEditCompanyChange(event.target.value)}
              value={editCompany}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
            <Input
              onChange={(event) => onEditEmailChange(event.target.value)}
              value={editEmail}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Avatar URL</label>
            <Input
              onChange={(event) => onEditAvatarUrlChange(event.target.value)}
              value={editAvatarUrl}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              className="bg-[#176B4D] text-white hover:bg-[#12583F] dark:bg-[#208560] dark:hover:bg-[#176B4D]"
              disabled={!editDisplayName.trim() || isSaving}
              onClick={onSaveContact}
              size="sm"
              type="button"
            >
              Save changes
            </Button>
            <Button
              onClick={() => onEditingContactChange(false)}
              size="sm"
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <ContactAvatar
            avatarUrl={contact.avatarUrl}
            className="h-20 w-20 text-xl"
            name={contact.displayName}
          />
          <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
            {contact.displayName}
          </h3>
          <p className="mt-1 text-xs font-medium text-[#176B4D] dark:text-[#63B592]">
            {contact.phoneNumber || "No phone available"}
          </p>
          {contact.profileName && contact.profileName !== contact.displayName ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              WhatsApp profile: {contact.profileName}
            </p>
          ) : null}
          {contact.company ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{contact.company}</p>
          ) : null}
          <Button
            className="mt-3 text-xs"
            onClick={() => {
              onEditDisplayNameChange(contact.displayName ?? "");
              onEditCompanyChange(contact.company ?? "");
              onEditEmailChange(contact.email ?? "");
              onEditAvatarUrlChange(contact.avatarUrl ?? "");
              onEditingContactChange(true);
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            Edit contact details
          </Button>
        </div>
      )}

      {/* CRM Customer Identity Bridge */}
      <div className="rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 space-y-2.5 dark:border-[#282B2E] dark:bg-[#17191B]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <UserCheck className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#63B592]" />
            CRM Customer Identity
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
              linkedPersonId
                ? "bg-[#EDF8F3] text-[#176B4D] dark:bg-[#15271F] dark:text-[#63B592]"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
            }`}
          >
            {linkedPersonId ? "LINKED" : "UNLINKED"}
          </span>
        </div>

        {linkedPersonId ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-[#E4E4E7] bg-white px-2.5 py-2 text-xs dark:border-[#282B2E] dark:bg-[#121416]">
              <span className="font-semibold text-foreground truncate">{linkedPersonName}</span>
              <button
                type="button"
                onClick={() => unlinkPersonMutation.mutate()}
                disabled={unlinkPersonMutation.isPending}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:underline dark:text-rose-400"
              >
                <Unlink className="h-3 w-3" /> Unlink
              </button>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                router.push(
                  `/crm/customer-360?recordType=Person&recordId=${encodeURIComponent(linkedPersonId)}`
                )
              }
              className="w-full h-7 text-xs text-[#176B4D] border-[#176B4D]/30 hover:bg-[#EDF8F3] dark:text-[#63B592] dark:hover:bg-[#15271F]"
            >
              <ExternalLink className="mr-1.5 h-3 w-3" /> Open Customer 360
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Link to a CRM Person profile to unlock Deals, Quotations, Sales Orders, and Customer 360.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={promotePersonMutation.isPending}
              onClick={() => promotePersonMutation.mutate()}
              className="w-full h-7 text-xs bg-[#176B4D] text-white hover:bg-[#12583F] dark:bg-[#208560]"
            >
              {promotePersonMutation.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              )}
              Promote to CRM Customer (1-Click)
            </Button>
            {peopleList.length > 0 && (
              <div className="flex gap-1.5">
                <select
                  value={selectedPersonToLink}
                  onChange={(e) => setSelectedPersonToLink(e.target.value)}
                  className="h-7 flex-1 rounded-md border border-[#E4E4E7] bg-white px-2 text-xs text-foreground dark:border-[#303438] dark:bg-[#121416]"
                >
                  <option value="">Or link existing person...</option>
                  {peopleList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.displayName}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!selectedPersonToLink || linkPersonMutation.isPending}
                  onClick={() => linkPersonMutation.mutate(selectedPersonToLink)}
                  className="h-7 px-2.5 text-xs"
                >
                  Link
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
