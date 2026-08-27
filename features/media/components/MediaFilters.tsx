import React from "react";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

export interface MediaFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  uploadCustomName: string;
  onUploadCustomNameChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  folder: string;
  onFolderChange: (value: string) => void;
  tag: string;
  onTagChange: (value: string) => void;
  isUploading: boolean;
  onUploadFile: (file: File) => void;
  submitMessage: string | null;
  submitError: string | null;
}

export const MediaFilters: React.FC<MediaFiltersProps> = ({
  query,
  onQueryChange,
  uploadCustomName,
  onUploadCustomNameChange,
  type,
  onTypeChange,
  folder,
  onFolderChange,
  tag,
  onTagChange,
  isUploading,
  onUploadFile,
  submitMessage,
  submitError,
}) => {
  return (
    <Card className="space-y-3.5 p-4">
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
        <Input
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by file name..."
          value={query}
        />
        <Input
          onChange={(event) => onUploadCustomNameChange(event.target.value)}
          placeholder="Custom upload name"
          value={uploadCustomName}
        />
        <select
          className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
          onChange={(event) => onTypeChange(event.target.value)}
          value={type}
        >
          <option value="">All types</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="document">Document</option>
          <option value="sticker">Sticker</option>
        </select>
        <Input
          onChange={(event) => onFolderChange(event.target.value)}
          placeholder="Folder..."
          value={folder}
        />
        <Input
          onChange={(event) => onTagChange(event.target.value)}
          placeholder="Tag..."
          value={tag}
        />
        <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-[#176B4D] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#12563E] dark:bg-[#2D8A67] dark:hover:bg-[#26785B]">
          {isUploading ? "Uploading..." : "Upload File"}
          <input
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUploadFile(file);
                event.currentTarget.value = "";
              }
            }}
            type="file"
          />
        </label>
      </div>
      {submitMessage ? <p className="text-xs font-medium text-[#16803C] dark:text-[#3FA66F]">{submitMessage}</p> : null}
      {submitError ? <p className="text-xs font-medium text-[#C2413A] dark:text-[#D7685C]">{submitError}</p> : null}
    </Card>
  );
};
