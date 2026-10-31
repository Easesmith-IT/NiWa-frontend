"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, Phone, Search, X, Check, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "../../../components/ui/input";
import { ContactAvatar } from "../../inbox/components/ContactAvatar";
import { useContactsQuery } from "../../contacts/contact.queries";
import { MessageRecipientFieldProps } from "../message-studio.types";
import type { ContactRecord } from "../../contacts/contact.types";

export const MessageRecipientSelector: React.FC<MessageRecipientFieldProps> = ({
  value,
  onChange,
  selectedContact = null,
  onContactSelect,
}) => {
  const [recipientType, setRecipientType] = useState<"contact" | "direct">(
    selectedContact ? "contact" : "contact",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query contacts
  const contactsQuery = useContactsQuery({
    search: debouncedSearch.trim() || undefined,
    limit: 12,
  });

  const contactsList = (contactsQuery.data?.data || []) as ContactRecord[];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectContact = (contact: ContactRecord) => {
    const phone = contact.phoneNumberE164 || contact.phoneNumber || "";
    onChange(phone);
    if (onContactSelect) {
      onContactSelect(contact);
    }
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleClearContact = () => {
    onChange("");
    if (onContactSelect) {
      onContactSelect(null);
    }
    setSearchTerm("");
  };

  return (
    <div className="space-y-2">
      {/* Recipient Mode Tabs */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground">Recipient *</label>
        <div className="flex items-center rounded-lg border border-[#E4E4E7] bg-[#F4F4F5] p-0.5 dark:border-[#282C2F] dark:bg-[#1A1D1F]">
          <button
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
              recipientType === "contact"
                ? "bg-white text-foreground shadow-sm dark:bg-[#25282A] dark:text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setRecipientType("contact")}
            type="button"
          >
            <Users className="h-3 w-3 text-[#176B4D] dark:text-[#359B76]" />
            CRM Contact
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
              recipientType === "direct"
                ? "bg-white text-foreground shadow-sm dark:bg-[#25282A] dark:text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setRecipientType("direct")}
            type="button"
          >
            <Phone className="h-3 w-3 text-[#176B4D] dark:text-[#359B76]" />
            Direct Phone
          </button>
        </div>
      </div>

      {recipientType === "contact" ? (
        <div className="relative" ref={dropdownRef}>
          {selectedContact ? (
            /* Selected Contact Card */
            <div className="flex items-center justify-between rounded-lg border border-[#C4E8DA] bg-[#EDF8F3] p-2.5 dark:border-[#203D31] dark:bg-[#14251E]">
              <div className="flex items-center gap-2.5 min-w-0">
                <ContactAvatar
                  avatarUrl={selectedContact.avatarUrl}
                  className="h-8 w-8 text-xs font-semibold shadow-xs"
                  name={selectedContact.displayName}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {selectedContact.displayName}
                    </p>
                    {selectedContact.company && (
                      <span className="rounded bg-white/70 px-1.5 py-0.2 text-[10px] text-muted-foreground dark:bg-black/30">
                        {selectedContact.company}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-[#176B4D] dark:text-[#3DB687]">
                    {selectedContact.phoneNumberE164 || selectedContact.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-white hover:text-foreground dark:hover:bg-[#1A1D1F]"
                  href={`/inbox?contactId=${selectedContact._id}`}
                  target="_blank"
                  title="Open in Inbox"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline">Thread</span>
                </Link>
                <button
                  aria-label="Clear contact"
                  className="rounded-md p-1 text-muted-foreground hover:bg-white hover:text-[#C2413A] dark:hover:bg-[#1A1D1F]"
                  onClick={handleClearContact}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Search Input */
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 text-xs"
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search contacts by name, company, or phone..."
                  value={searchTerm}
                />
                {contactsQuery.isLoading && (
                  <Loader2 className="absolute right-3 top-2.5 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && (
                <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-[#E4E4E7] bg-white p-1 shadow-lg dark:border-[#292C2F] dark:bg-[#17191B]">
                  {contactsList.length > 0 ? (
                    contactsList.map((contact) => (
                      <button
                        className="flex w-full items-center justify-between rounded-md p-2 text-left text-xs transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#202326]"
                        key={contact._id}
                        onClick={() => handleSelectContact(contact)}
                        type="button"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ContactAvatar
                            avatarUrl={contact.avatarUrl}
                            className="h-7 w-7 text-[10px]"
                            name={contact.displayName}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {contact.displayName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {contact.company ? `${contact.company} • ` : ""}
                              <span className="font-mono">
                                {contact.phoneNumberE164 || contact.phoneNumber}
                              </span>
                            </p>
                          </div>
                        </div>
                        {value === (contact.phoneNumberE164 || contact.phoneNumber) && (
                          <Check className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      {contactsQuery.isLoading ? "Searching contacts..." : "No matching contacts found."}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Direct Phone Mode */
        <div>
          <Input
            className="font-mono text-xs"
            onChange={(event) => onChange(event.target.value)}
            placeholder="e.g. +919876543210"
            value={value}
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Include international country code prefix (e.g. +91 for India).
          </p>
        </div>
      )}
    </div>
  );
};
