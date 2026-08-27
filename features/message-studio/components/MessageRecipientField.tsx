import React from "react";
import { Input } from "../../../components/ui/input";
import { MessageRecipientFieldProps } from "../message-studio.types";

export const MessageRecipientField: React.FC<MessageRecipientFieldProps> = ({
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">
        Recipient Number *
      </label>
      <Input
        className="font-mono text-xs"
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. +919876543210"
        value={value}
      />
    </div>
  );
};
