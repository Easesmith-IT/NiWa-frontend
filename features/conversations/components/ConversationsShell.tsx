import React from "react";
import { ConversationsShellProps } from "../conversations.types";

export const ConversationsShell: React.FC<ConversationsShellProps> = ({
  headerNode,
  threadsListNode,
  chatWindowNode,
  infoSidebarNode,
}) => {
  return (
    <div className="space-y-4">
      {headerNode}

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        {threadsListNode}
        {chatWindowNode}
        {infoSidebarNode}
      </div>
    </div>
  );
};
