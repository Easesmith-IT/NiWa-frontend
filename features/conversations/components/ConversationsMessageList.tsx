import React from "react";
import { MessageCircleMore } from "lucide-react";
import { ConversationsMessageListProps } from "../conversations.types";
import { ConversationsMessageBubble } from "./ConversationsMessageBubble";

export const ConversationsMessageList: React.FC<ConversationsMessageListProps> = ({
  messages,
  isLoading,
}) => {
  return (
    <div
      className="flex-1 space-y-3 overflow-y-auto p-4 min-h-[420px] bg-repeat bg-center bg-[#F7F8FA] dark:bg-[#101312] dark:bg-blend-multiply"
      style={{ backgroundImage: "url('/whatsapp-bg.png')", backgroundSize: "450px" }}
    >
      {messages.map((message) => (
        <ConversationsMessageBubble key={message._id} message={message} />
      ))}

      {!isLoading && messages.length === 0 ? (
        <div className="flex h-full min-h-[200px] items-center justify-center">
          <div className="text-center text-xs text-muted-foreground">
            <MessageCircleMore className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            No messages in this conversation yet.
          </div>
        </div>
      ) : null}
    </div>
  );
};
