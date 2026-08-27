import { Check, CheckCheck, Clock3, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { MessageRecord } from "../inbox.types";
import { formatConversationTime, formatDateTime } from "../utils/formatters";
import { MessageMedia } from "./MessageMedia";

const renderOutgoingStatusIcon = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "read":
    case "seen":
      return (
        <span title="Read / Seen by customer">
          <CheckCheck className="h-4 w-4 text-[#34b7f1]" />
        </span>
      );
    case "delivered":
      return (
        <span title="Delivered to recipient's phone">
          <CheckCheck className="h-4 w-4 text-[#7a8b82]" />
        </span>
      );
    case "sent":
    case "submitted":
      return (
        <span title="Sent to WhatsApp servers">
          <Check className="h-4 w-4 text-[#7a8b82]" />
        </span>
      );
    case "queued":
    case "accepted":
      return (
        <span title="Sending / Queued in dispatch">
          <Clock3 className="h-4 w-4 text-[#7a8b82] animate-pulse" />
        </span>
      );
    case "failed":
      return (
        <span title="Failed to send">
          <X className="h-4 w-4 text-[#bf5b4b]" />
        </span>
      );
    default:
      return (
        <span title="Sent">
          <Check className="h-4 w-4 text-[#7a8b82]" />
        </span>
      );
  }
};

const buildMessageStatusDetails = (message: MessageRecord) => {
  const currentStatus = (message.status ?? "sent").toUpperCase();
  const parts = [
    `Current Status: ${currentStatus}`,
    message.statusTimestamps?.queuedAt ? `Queued: ${formatDateTime(message.statusTimestamps.queuedAt)}` : null,
    message.statusTimestamps?.sentAt ? `Sent: ${formatDateTime(message.statusTimestamps.sentAt)}` : null,
    message.statusTimestamps?.deliveredAt
      ? `Delivered: ${formatDateTime(message.statusTimestamps.deliveredAt)}`
      : null,
    message.statusTimestamps?.readAt ? `Read / Seen: ${formatDateTime(message.statusTimestamps.readAt)}` : null,
    message.statusTimestamps?.failedAt ? `Failed: ${formatDateTime(message.statusTimestamps.failedAt)}` : null,
    message.status === "failed" && message.errorDetails ? `Failure Reason: ${message.errorDetails}` : null,
  ].filter(Boolean);

  return parts.join("\n");
};

export interface ChatMessageItemProps {
  message: MessageRecord;
  onImageClick: (messageId: string) => void;
}

export function ChatMessageItem({ message, onImageClick }: ChatMessageItemProps) {
  const outgoing = message.direction === "outgoing";
  const mediaMimeType = message.media?.mimeType ?? null;
  const messageTime = message.metaTimestamp || message.createdAt || "";
  const statusDetails = outgoing ? buildMessageStatusDetails(message) : "";
  const locationData = (message.locationData ?? {}) as {
    address?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
  };
  const hasLocation =
    typeof locationData.latitude === "number" &&
    typeof locationData.longitude === "number";

  return (
    <div
      className={cn("flex", outgoing ? "justify-end" : "justify-start")}
      data-message-id={message._id}
    >
      <div
        className={cn(
          "max-w-[65%] rounded-xl px-3.5 py-2.5 border shadow-subtle",
          outgoing
            ? "rounded-br-xs bg-[#EDF8F3] border-[#C4E8DA] text-foreground dark:bg-[#14251E] dark:border-[#203D31] dark:text-[#E8F3EE]"
            : "rounded-bl-xs bg-white border-[#E4E4E7] text-foreground dark:bg-[#1C1F21] dark:border-[#282C2F] dark:text-[#ECEDEE]",
        )}
      >
        {message.replyTo ? (
          <div className="mb-1.5 rounded-md border-l-2 border-primary/30 bg-black/5 px-2.5 py-1 text-xs text-muted-foreground">
            {message.replyTo.previewText || `[${message.replyTo.messageType}]`}
          </div>
        ) : null}
        {message.textBody ? (
          <p className="whitespace-pre-wrap text-xs leading-5">
            {message.textBody}
          </p>
        ) : message.messageType === "text" || (message.previewText && message.previewText !== "[image]") ? (
          <p className="whitespace-pre-wrap text-xs leading-5">
            {message.previewText}
          </p>
        ) : null}
        {message.media?.metaMediaId ? (
          <MessageMedia
            messageId={message._id}
            mimeType={mediaMimeType}
            onImageClick={() => onImageClick(message._id)}
          />
        ) : null}
        {message.media?.caption && message.media.caption !== message.textBody ? (
          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-4 opacity-90">
            {message.media.caption}
          </p>
        ) : null}
        {hasLocation ? (
          <a
            className="mt-1.5 block rounded-md bg-black/5 px-2.5 py-1.5 text-xs underline-offset-2 hover:underline"
            href={`https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}`}
            rel="noreferrer"
            target="_blank"
          >
            {locationData.name || locationData.address || "Open location"}
          </a>
        ) : null}
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground opacity-80">
          {message.generatedByAI || message.source === "ai" ? (
            <span className="mr-1 inline-flex items-center gap-0.5 font-[#176B4D] font-bold text-[#176B4D] dark:text-[#2D8A67]" title="AI Generated Response">
              <span>◆</span>
              <span>AI</span>
            </span>
          ) : null}
          <span>{formatConversationTime(messageTime)}</span>
          {outgoing ? (
            <span title={statusDetails || undefined}>{renderOutgoingStatusIcon(message.status)}</span>
          ) : null}
        </div>
        {message.status === "failed" && message.errorDetails ? (
          <p className="mt-1 text-[11px] text-[#C2413A]">{message.errorDetails}</p>
        ) : null}
      </div>
    </div>
  );
}
