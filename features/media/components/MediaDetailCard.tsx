import React from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { getMediaDisplayName } from "../../../lib/media";
import type { MediaRecord } from "../media.types";

export interface MediaDetailCardProps {
  selectedMedia: MediaRecord | null;
  metadataCustomName: string;
  onMetadataCustomNameChange: (value: string) => void;
  metadataFolder: string;
  onMetadataFolderChange: (value: string) => void;
  metadataTags: string;
  onMetadataTagsChange: (value: string) => void;
  isUpdatingMetadata: boolean;
  onSaveMetadata: () => void;
}

export const MediaDetailCard: React.FC<MediaDetailCardProps> = ({
  selectedMedia,
  metadataCustomName,
  onMetadataCustomNameChange,
  metadataFolder,
  onMetadataFolderChange,
  metadataTags,
  onMetadataTagsChange,
  isUpdatingMetadata,
  onSaveMetadata,
}) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="border-b border-[#F0F0F2] pb-2 dark:border-[#202326]">
        <h3 className="text-sm font-semibold text-foreground">Media Asset Detail</h3>
      </div>
      {selectedMedia ? (
        <div className="space-y-3 text-xs">
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 space-y-1 dark:border-[#292C2F] dark:bg-[#17191B]">
            <p className="font-semibold text-foreground">{getMediaDisplayName(selectedMedia)}</p>
            {selectedMedia.customName ? (
              <p className="text-muted-foreground">Original: {selectedMedia.fileName}</p>
            ) : null}
            <p className="text-muted-foreground">{selectedMedia.mediaType} • {selectedMedia.mimeType}</p>
            <p className="font-mono text-[11px] text-[#176B4D] dark:text-[#359B76]">Media ID: {selectedMedia.metaMediaId}</p>
          </div>

          <div className="space-y-2 rounded-md border border-[#E4E4E7] bg-white p-3 dark:border-[#292C2F] dark:bg-[#121416]">
            <p className="text-xs font-semibold text-foreground">Update Metadata</p>
            <div>
              <label className="mb-0.5 block text-[11px] text-muted-foreground">Custom Name</label>
              <Input
                onChange={(event) => onMetadataCustomNameChange(event.target.value)}
                placeholder="Custom name"
                value={metadataCustomName}
              />
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] text-muted-foreground">Folder</label>
              <Input
                onChange={(event) => onMetadataFolderChange(event.target.value)}
                placeholder="Folder name"
                value={metadataFolder}
              />
            </div>
            <div>
              <label className="mb-0.5 block text-[11px] text-muted-foreground">Tags (comma separated)</label>
              <Input
                onChange={(event) => onMetadataTagsChange(event.target.value)}
                placeholder="tag1, tag2"
                value={metadataTags}
              />
            </div>
            <Button
              className="w-full mt-1"
              disabled={isUpdatingMetadata}
              onClick={onSaveMetadata}
              size="sm"
              type="button"
              variant="primary"
            >
              {isUpdatingMetadata ? "Saving..." : "Save Metadata"}
            </Button>
          </div>

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payload Technical Record</p>
            <pre className="overflow-x-auto rounded-md border border-[#292C2F] bg-[#0F1112] p-2.5 font-mono text-[10px] text-[#E4E4E7]">
              {JSON.stringify(
                {
                  requestPayload: selectedMedia.requestPayload,
                  responsePayload: selectedMedia.responsePayload,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Select a media asset from the list to view metadata and technical API payloads.
        </p>
      )}
    </Card>
  );
};
