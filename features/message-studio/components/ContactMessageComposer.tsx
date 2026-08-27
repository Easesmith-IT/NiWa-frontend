import React from "react";
import { Input } from "../../../components/ui/input";
import { ContactMessageComposerProps } from "../message-studio.types";

export const ContactMessageComposer: React.FC<ContactMessageComposerProps> = ({
  contactFormattedName,
  onContactFormattedNameChange,
  contactFirstName,
  onContactFirstNameChange,
  contactLastName,
  onContactLastNameChange,
  contactPhone,
  onContactPhoneChange,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Formatted Name *</label>
        <Input
          className="text-xs"
          onChange={(event) => onContactFormattedNameChange(event.target.value)}
          placeholder="e.g. John Doe"
          value={contactFormattedName}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">First Name *</label>
          <Input
            className="text-xs"
            onChange={(event) => onContactFirstNameChange(event.target.value)}
            placeholder="e.g. John"
            value={contactFirstName}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">Last Name</label>
          <Input
            className="text-xs"
            onChange={(event) => onContactLastNameChange(event.target.value)}
            placeholder="e.g. Doe"
            value={contactLastName}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground">Phone Number *</label>
        <Input
          className="text-xs font-mono"
          onChange={(event) => onContactPhoneChange(event.target.value)}
          placeholder="e.g. +1234567890"
          value={contactPhone}
        />
      </div>
    </div>
  );
};
