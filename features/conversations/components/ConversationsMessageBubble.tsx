import React from "react";
import { CheckCheck, CircleDot } from "lucide-react";
import { ConversationMessageRecord } from "../../../lib/api/types";
import { ConversationsMessageBubbleProps } from "../conversations.types";

const statusTone = (status: string, direction: "incoming" | "outgoing") => {
  if (direction === "incoming") {
    return "bg-[#EDF8F3] text-[#16803C]";
  }
  if (status === "read") {
    return "bg-[#E0F2FE] text-[#0284C7]";
  }
  if (status === "delivered") {
    return "bg-[#F4F4F5] text-[#7A8B82]";
  }
  if (status === "failed") {
    return "bg-[#FEE2E2] text-[#C2413A]";
  }

  return "bg-[#FAFAFA] text-muted-foreground";
};

const renderMessageBody = (message: ConversationMessageRecord) => {
  const payload = message.payload as Record<string, unknown> | null;
  const type = message.messageType;

  if (type === "location") {
    const location = payload?.location as { name?: string; address?: string; latitude?: number; longitude?: number } | undefined;
    return [
      location?.name,
      location?.address,
      location?.latitude && location?.longitude
        ? `${location.latitude}, ${location.longitude}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (type === "document") {
    const document = (payload?.document ?? {}) as { filename?: string; caption?: string };
    return [document.filename, document.caption].filter(Boolean).join("\n") || message.previewText;
  }

  if (type === "contacts") {
    const contacts = Array.isArray(payload?.contacts) ? payload.contacts : [];
    return contacts
      .map((contact: { name?: { formatted_name?: string }; phones?: Array<{ phone?: string }> }) => {
        const name = contact?.name?.formatted_name ?? "Contact";
        const phone = contact?.phones?.[0]?.phone ?? "";
        return `${name}${phone ? ` - ${phone}` : ""}`;
      })
      .join("\n");
  }

  if (type === "interactive") {
    const interactive = (payload?.interactive ?? {}) as { button_reply?: { title?: string }; list_reply?: { title?: string } };
    return interactive?.button_reply?.title ?? interactive?.list_reply?.title ?? message.previewText;
  }

  if (type === "reaction") {
    const reaction = payload?.reaction as { emoji?: string } | undefined;
    return reaction?.emoji ? `Reaction: ${reaction.emoji}` : message.previewText;
  }

  if (["image", "video", "audio", "sticker"].includes(type)) {
    const mediaPayload = (payload?.[type] ?? {}) as { id?: string };
    return [message.previewText, mediaPayload?.id ? `Media ID: ${mediaPayload.id}` : null]
      .filter(Boolean)
      .join("\n");
  }

  return message.previewText || JSON.stringify(message.payload, null, 2);
};

const formatShortTime = (value?: string) => {
  if (!value) {
    return "--:--";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const messageTypeLabel = (type: string) =>
  type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const ConversationsMessageBubble: React.FC<ConversationsMessageBubbleProps> = ({
  message,
}) => {
  const isOutgoing = message.direction === "outgoing";

  return (
    <div className={isOutgoing ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] rounded-lg p-3 text-xs shadow-subtle ${
          isOutgoing
            ? "border border-[#C4E8DA] bg-[#EDF8F3] text-foreground dark:border-[#203D31] dark:bg-[#14251E] dark:text-[#E8F3EE]"
            : "border border-[#E4E4E7] bg-white text-foreground dark:border-[#282C2F] dark:bg-[#1C1F21] dark:text-[#ECEDEE]"
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">
            {messageTypeLabel(message.messageType)}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${statusTone(
              message.status,
              message.direction,
            )}`}
          >
            {isOutgoing ? message.status : "incoming"}
          </span>
        </div>
        <p className="whitespace-pre-wrap leading-relaxed">{renderMessageBody(message)}</p>
        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground font-mono">
          <span>{formatShortTime(message.timestamp)}</span>
          {isOutgoing ? (
            <CheckCheck className="h-3 w-3 text-[#34B7F1] dark:text-[#53BDEB]" />
          ) : (
            <CircleDot className="h-3 w-3 text-[#7A8B82] dark:text-[#8D9691]" />
          )}
        </div>
      </div>
    </div>
  );
};
