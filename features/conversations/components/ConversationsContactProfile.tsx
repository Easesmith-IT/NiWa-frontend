import React from "react";
import { UserRound } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { ConversationsContactProfileProps } from "../conversations.types";

export const ConversationsContactProfile: React.FC<ConversationsContactProfileProps> = ({
  conversation,
}) => {
  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2">
        <UserRound className="h-4 w-4 text-[#176B4D]" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Contact Profile</h3>
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <p className="text-muted-foreground text-[11px]">Contact Name</p>
          <p className="font-semibold text-foreground">{conversation?.contactName || "Not set"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[11px]">Phone Number</p>
          <p className="font-mono text-xs text-foreground">{conversation?.contactPhoneNumber || "N/A"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[11px]">WhatsApp ID (waId)</p>
          <p className="font-mono text-xs text-foreground">{conversation?.waId || "N/A"}</p>
        </div>
      </div>
    </Card>
  );
};
