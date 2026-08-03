"use client";

import { useMemo } from "react";
import { MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { withDisplayPhoneNumber } from "../../shared/mappers";
import type { ContactRecordV1 } from "../contact.types";

const avatarColorStyles = [
  "bg-[#dfe5dc] text-[#2d644d]",
  "bg-[#e0e8f5] text-[#2b5288]",
  "bg-[#f5e6e0] text-[#883d2b]",
  "bg-[#eee0f5] text-[#632b88]",
  "bg-[#f5f2e0] text-[#70642b]",
  "bg-[#e0f5f2] text-[#2b7d70]",
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
  contacts: ContactRecordV1[];
  onDeleteContact: (contactId: string) => void;
  onEditContact: (contact: ContactRecordV1) => void;
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
    <div className="overflow-hidden rounded-2xl border border-[#e5ddd3] bg-white shadow-sm">
      <div className="niwa-scrollbar overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#eee4d8] bg-[#fbf7f1] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f7f75]">
            <tr>
              <th className="py-3.5 pl-6 pr-4">Contact</th>
              <th className="px-4 py-3.5">Phone Number</th>
              <th className="px-4 py-3.5">Company</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">WhatsApp Profile</th>
              <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2ebe2]">
            {contacts.map((contact) => {
              const isSelected = contact._id === selectedContactId;
              const formattedPhone =
                withDisplayPhoneNumber(contact.phoneNumber) ?? contact.phoneNumber;

              return (
                <tr
                  className={`group cursor-pointer transition ${
                    isSelected
                      ? "bg-[#f4efe6] font-medium"
                      : "hover:bg-[#fcf9f4]"
                  }`}
                  key={contact._id}
                  onClick={() => onSelectContact(contact._id)}
                >
                  <td className="py-3.5 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      {contact.avatarUrl ? (
                        <img
                          alt={contact.displayName}
                          className="h-9 w-9 rounded-full object-cover shadow-sm"
                          referrerPolicy="no-referrer"
                          src={contact.avatarUrl}
                        />
                      ) : (
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold shadow-sm ${getAvatarColorStyle(
                            contact.displayName,
                          )}`}
                        >
                          {buildInitials(contact.displayName)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#25342f] group-hover:text-[#1e4535]">
                          {contact.displayName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#44534d]">
                    <span className="inline-flex items-center rounded-md bg-[#f4efe6] px-2.5 py-1 text-xs font-medium text-[#2d644d]">
                      {formattedPhone}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[#56675d]">
                    {contact.company || <span className="text-[#a0aca4]">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-[#56675d]">
                    {contact.email || <span className="text-[#a0aca4]">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-[#56675d]">
                    {contact.profileName ? (
                      <span className="text-xs text-[#6f7f75]">{contact.profileName}</span>
                    ) : (
                      <span className="text-[#a0aca4]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 pl-4 pr-6 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {onOpenChat ? (
                        <button
                          className="rounded-lg p-1.5 text-[#6f7f75] transition hover:bg-[#e6eee6] hover:text-[#2d644d]"
                          onClick={() => onOpenChat(contact.phoneNumber)}
                          title="Open WhatsApp Chat"
                          type="button"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        className="rounded-lg p-1.5 text-[#6f7f75] transition hover:bg-[#efe7db] hover:text-[#25342f]"
                        onClick={() => onEditContact(contact)}
                        title="Edit Contact"
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded-lg p-1.5 text-[#6f7f75] transition hover:bg-[#fdeaea] hover:text-[#9d3434]"
                        onClick={() => onDeleteContact(contact._id)}
                        title="Delete Contact"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {contacts.length === 0 ? (
              <tr>
                <td className="py-12 text-center text-[#7a8b82]" colSpan={6}>
                  No contacts found matching your criteria.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
