import React from "react";
import { ConversationsInfoSidebarProps } from "../conversations.types";

export const ConversationsInfoSidebar: React.FC<ConversationsInfoSidebarProps> = ({
  contactProfileNode,
  labelsCardNode,
  notesCardNode,
}) => {
  return (
    <div className="space-y-4">
      {contactProfileNode}
      {labelsCardNode}
      {notesCardNode}
    </div>
  );
};
