import React from "react";
import { MessageRecipientFieldProps } from "../message-studio.types";
import { MessageRecipientSelector } from "./MessageRecipientSelector";

export const MessageRecipientField: React.FC<MessageRecipientFieldProps> = (props) => {
  return <MessageRecipientSelector {...props} />;
};
