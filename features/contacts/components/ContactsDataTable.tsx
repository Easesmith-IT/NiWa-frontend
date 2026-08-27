"use client";

import { useMemo } from "react";
import { MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { withDisplayPhoneNumber } from "../../shared/mappers";
import type { ContactRecord } from "../contact.types";

const avatarColorStyles = [
  "bg-[#EDF8F3] text-[#176B4D]",
  "bg-[#F4F4F5] text-[#3F3F46]",
  "bg-[#F0F0F2] text-[#27272A]",
  "bg-[#EDF8F3] text-[#12563E]",
  "bg-[#F4F4F5] text-[#18181B]",
  "bg-[#EDF8F3] text-[#176B4D]",
];

const getAvatarColorStyle = (name?: string | null) => {
  if (!name) return avatarColorStyles[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  return avatarColorStyles[hash % avatarColorStyles.length];
};

const buildInitials = (value?: string | null) => {
  const source = value?.trim();
  if (!source) return "NW";

  const digitsOnly = source.replace(/\D/g, "");
  if (digitsOnly.length >= 7 && (source.startsWith("+") || /^\d+$/.test(source))) {
    if (digitsOnly.startsWith("91") && digitsOnly.length === 12) {
      return `9${digitsOnly[2]}`;
    }
    return digitsOnly.slice(0, 2);
  }

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

interface ContactsDataTableProps {
  contacts: ContactRecord[];
  onDeleteContact: (contactId: string) => void;
  onEditContact: (contact: ContactRecord) => void;
  onOpenChat?: (phoneNumber: string) => void;
  onSelectContact: (contactId: string) => void;
  selectedContactId: string | null;
}

export function ContactsDataTable({
  contacts,
  onDeleteContact,
  onEditContact,
  onOpenChat,
  onSelectContact,
  selectedContactId,
}: ContactsDataTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E4E4E7] bg-white shadow-subtle dark:border-[#24272A] dark:bg-[#121416]">
      <div className="niwa-scrollbar overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[11px] font-medium text-muted-foreground dark:border-[#24272A] dark:bg-[#151719]">
            <tr>
              <th className="py-3 pl-4 pr-3">Contact</th>
              <th className="px-3 py-3">Phone Number</th>
              <th className="px-3 py-3">Company</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">WhatsApp Profile</th>
              <th className="py-3 pl-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F2] dark:divide-[#24272A]">
            {contacts.map((contact) => {
              const isSelected = contact._id === selectedContactId;
              const formattedPhone =
                withDisplayPhoneNumber(contact.phoneNumber) ?? contact.phoneNumber;

              return (
                <tr
                  className={`group cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#EDF8F3] font-medium dark:bg-[#14251E]"
                      : "hover:bg-[#FAFAFA] dark:hover:bg-[#191B1D]"
                  }`}
                  key={contact._id}
                  onClick={() => onSelectContact(contact._id)}
                >
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-2.5">
                      {contact.avatarUrl ? (
                        <img
                          alt={contact.displayName}
                          className="h-8 w-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                          src={contact.avatarUrl}
                        />
                      ) : (
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColorStyle(
                            contact.displayName,
                          )}`}
                        >
                          {buildInitials(contact.displayName)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          {contact.displayName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    <span className="inline-flex items-center rounded-md bg-[#F4F4F5] border border-[#E4E4E7] px-2 py-0.5 text-[11px] font-medium text-foreground">
                      {formattedPhone}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {contact.company || <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {contact.email || <span className="text-muted-foreground/40">—</span>}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {contact.profileName ? (
                      <span className="text-xs text-muted-foreground">{contact.profileName}</span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="py-3 pl-3 pr-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onOpenChat ? (
                        <button
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[#EDF8F3] hover:text-[#176B4D]"
                          onClick={() => onOpenChat(contact.phoneNumber)}
                          title="Open WhatsApp Chat"
                          type="button"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                      <button
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-[#F4F4F5] hover:text-foreground"
                        onClick={() => onEditContact(contact)}
                        title="Edit Contact"
                        type="button"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => onDeleteContact(contact._id)}
                        title="Delete Contact"
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {contacts.length === 0 ? (
              <tr>
                <td className="py-10 text-center text-xs text-muted-foreground" colSpan={6}>
                  No contacts found matching your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

