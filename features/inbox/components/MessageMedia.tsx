import { useEffect, useState } from "react";
import { fetchMessageMediaBlob } from "../inbox.api";

export interface MessageMediaProps {
  messageId: string;
  mimeType?: string | null;
  onImageClick?: () => void;
}

export function MessageMedia({ messageId, mimeType, onImageClick }: MessageMediaProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let objectUrl: string | null = null;

    const load = async () => {
      try {
        const blob = await fetchMessageMediaBlob(messageId);
        objectUrl = URL.createObjectURL(blob);

        if (!disposed) {
          setMediaUrl(objectUrl);
        }
      } catch {
        if (!disposed) {
          setMediaUrl(null);
        }
      }
    };

    void load();

    return () => {
      disposed = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [messageId]);

  if (!mediaUrl) {
    return (
      <div className="mt-2 rounded-xl bg-black/5 px-3 py-2 text-xs text-[#6f7f75]">
        Loading media...
      </div>
    );
  }

  if (mimeType?.startsWith("image/")) {
    return (
      <img
        alt="WhatsApp media"
        className="mt-2 max-h-72 rounded-xl object-cover cursor-pointer hover:opacity-95 transition shadow-sm"
        onClick={onImageClick}
        src={mediaUrl}
      />
    );
  }

  if (mimeType?.startsWith("video/")) {
    return <video className="mt-2 max-h-72 rounded-xl" controls src={mediaUrl} />;
  }

  if (mimeType?.startsWith("audio/")) {
    return <audio className="mt-2 w-full" controls src={mediaUrl} />;
  }

  return (
    <a
      className="mt-2 inline-flex rounded-xl bg-black/5 px-3 py-2 text-sm text-[#2d644d] underline-offset-2 hover:underline"
      href={mediaUrl}
      rel="noreferrer"
      target="_blank"
    >
      Open attachment
    </a>
  );
}
