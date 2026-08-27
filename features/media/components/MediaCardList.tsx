import React from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { getMediaDisplayName } from "../../../lib/media";
import type { MediaRecord } from "../media.types";

const formatSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export interface MediaCardListProps {
  media: MediaRecord[];
  isLoading: boolean;
  isDeleting: boolean;
  onSelectDetails: (id: string) => void;
  onCopyMediaId: (metaMediaId: string) => void;
  onDeleteMedia: (id: string) => void;
}

export const MediaCardList: React.FC<MediaCardListProps> = ({
  media,
  isLoading,
  isDeleting,
  onSelectDetails,
  onCopyMediaId,
  onDeleteMedia,
}) => {
  return (
    <div className="grid gap-3">
      {media.map((item: MediaRecord) => (
        <Card className="p-4" key={item._id}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">{getMediaDisplayName(item)}</h3>
              {item.customName ? (
                <p className="text-[11px] text-muted-foreground">Original: {item.fileName}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {item.mediaType} • {item.mimeType} • {formatSize(item.fileSize)}
              </p>
              <p className="text-xs text-muted-foreground">
                Folder: {item.folder || "Unsorted"} • Tags: {(item.tags ?? []).length ? item.tags?.join(", ") : "None"}
              </p>
              <p className="font-mono text-xs font-medium text-foreground">
                Media ID: {item.metaMediaId}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                Uploaded: {new Date(item.uploadedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button onClick={() => onSelectDetails(item._id)} size="sm" type="button" variant="secondary">
                Details
              </Button>
              <Button
                onClick={() => onCopyMediaId(item.metaMediaId)}
                size="sm"
                type="button"
                variant="secondary"
              >
                Copy ID
              </Button>
              <Link href={`/message-studio?mode=${encodeURIComponent(item.mediaType)}&mediaId=${encodeURIComponent(item.metaMediaId)}`}>
                <Button size="sm" type="button" variant="secondary">
                  Reuse
                </Button>
              </Link>
              <Button disabled={isDeleting} onClick={() => onDeleteMedia(item._id)} size="sm" type="button" variant="secondary">
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
      {!isLoading && media.length === 0 ? (
        <Card className="p-4 text-xs text-muted-foreground">No media files stored.</Card>
      ) : null}
    </div>
  );
};
