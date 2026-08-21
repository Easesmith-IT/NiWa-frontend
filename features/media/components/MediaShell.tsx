import React from "react";
import type { useMediaOrchestration } from "../hooks/useMediaOrchestration";
import { MediaCardList } from "./MediaCardList";
import { MediaDetailCard } from "./MediaDetailCard";
import { MediaFilters } from "./MediaFilters";
import { MediaHeader } from "./MediaHeader";

export interface MediaShellProps {
  orchestration: ReturnType<typeof useMediaOrchestration>;
}

export const MediaShell: React.FC<MediaShellProps> = ({ orchestration }) => {
  const {
    query,
    setQuery,
    type,
    setType,
    folder,
    setFolder,
    tag,
    setTag,
    submitMessage,
    submitError,
    setSelectedId,
    uploadCustomName,
    setUploadCustomName,
    metadataCustomName,
    setMetadataCustomName,
    metadataFolder,
    setMetadataFolder,
    metadataTags,
    setMetadataTags,
    mediaQuery,
    media,
    selectedMedia,
    isUploading,
    isDeleting,
    isUpdatingMetadata,
    handleUpload,
    handleDelete,
    handleUpdateMetadata,
    handleCopyMediaId,
  } = orchestration;

  return (
    <div className="space-y-4">
      <MediaHeader />

      <MediaFilters
        query={query}
        onQueryChange={setQuery}
        uploadCustomName={uploadCustomName}
        onUploadCustomNameChange={setUploadCustomName}
        type={type}
        onTypeChange={setType}
        folder={folder}
        onFolderChange={setFolder}
        tag={tag}
        onTagChange={setTag}
        isUploading={isUploading}
        onUploadFile={handleUpload}
        submitMessage={submitMessage}
        submitError={submitError}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <MediaCardList
          media={media}
          isLoading={mediaQuery.isLoading}
          isDeleting={isDeleting}
          onSelectDetails={setSelectedId}
          onCopyMediaId={handleCopyMediaId}
          onDeleteMedia={handleDelete}
        />

        <MediaDetailCard
          selectedMedia={selectedMedia}
          metadataCustomName={metadataCustomName}
          onMetadataCustomNameChange={setMetadataCustomName}
          metadataFolder={metadataFolder}
          onMetadataFolderChange={setMetadataFolder}
          metadataTags={metadataTags}
          onMetadataTagsChange={setMetadataTags}
          isUpdatingMetadata={isUpdatingMetadata}
          onSaveMetadata={handleUpdateMetadata}
        />
      </div>
    </div>
  );
};
