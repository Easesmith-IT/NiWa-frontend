import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { getMediaDisplayName } from "../../../lib/media";
import {
  useDeleteMediaMutation,
  useMediaDetailQuery,
  useMediaListQuery,
  useUpdateMediaMetadataMutation,
  useUploadMediaMutation,
} from "../media.queries";

export function useMediaOrchestration() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [folder, setFolder] = useState("");
  const [tag, setTag] = useState("");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadCustomName, setUploadCustomName] = useState("");
  const [metadataCustomName, setMetadataCustomName] = useState("");
  const [metadataFolder, setMetadataFolder] = useState("");
  const [metadataTags, setMetadataTags] = useState("");

  const mediaQuery = useMediaListQuery({ query, type, folder, tag });
  const mediaDetailQuery = useMediaDetailQuery(selectedId);

  const uploadMutation = useUploadMediaMutation();
  const deleteMutation = useDeleteMediaMutation();
  const metadataMutation = useUpdateMediaMetadataMutation();

  const media = useMemo(() => mediaQuery.data?.media ?? [], [mediaQuery.data]);
  const selectedMedia = mediaDetailQuery.data?.media ?? null;

  useEffect(() => {
    if (!selectedMedia) {
      setMetadataCustomName("");
      setMetadataFolder("");
      setMetadataTags("");
      return;
    }

    setMetadataCustomName(selectedMedia.customName ?? "");
    setMetadataFolder(selectedMedia.folder ?? "");
    setMetadataTags((selectedMedia.tags ?? []).join(", "));
  }, [selectedMedia]);

  const handleUpload = (file: File) => {
    setSubmitMessage(null);
    setSubmitError(null);
    uploadMutation.mutate(
      { customName: uploadCustomName, file },
      {
        onSuccess: (data) => {
          setSubmitError(null);
          setSubmitMessage(`Uploaded ${getMediaDisplayName(data.media)} successfully.`);
          setUploadCustomName("");
        },
        onError: (error) => {
          setSubmitMessage(null);
          setSubmitError(
            error instanceof AxiosError
              ? error.response?.data?.message ?? "Upload failed."
              : "Upload failed.",
          );
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setSubmitError(null);
        setSubmitMessage("Media deleted.");
        setSelectedId(null);
      },
      onError: (error) => {
        setSubmitMessage(null);
        setSubmitError(
          error instanceof AxiosError
            ? error.response?.data?.message ?? "Delete failed."
            : "Delete failed.",
        );
      },
    });
  };

  const handleUpdateMetadata = () => {
    if (!selectedMedia?._id) {
      return;
    }

    setSubmitMessage(null);
    setSubmitError(null);
    metadataMutation.mutate(
      {
        customName: metadataCustomName,
        id: selectedMedia._id,
        folder: metadataFolder,
        tags: metadataTags
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          setSubmitError(null);
          setSubmitMessage("Media metadata updated.");
        },
        onError: (error) => {
          setSubmitMessage(null);
          setSubmitError(
            error instanceof AxiosError
              ? error.response?.data?.message ?? "Metadata update failed."
              : "Metadata update failed.",
          );
        },
      },
    );
  };

  const handleCopyMediaId = async (metaMediaId: string) => {
    await navigator.clipboard.writeText(metaMediaId);
    setSubmitMessage("Media ID copied.");
  };

  return {
    query,
    setQuery,
    type,
    setType,
    folder,
    setFolder,
    tag,
    setTag,
    submitMessage,
    setSubmitMessage,
    submitError,
    setSubmitError,
    selectedId,
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
    mediaDetailQuery,
    media,
    selectedMedia,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdatingMetadata: metadataMutation.isPending,
    handleUpload,
    handleDelete,
    handleUpdateMetadata,
    handleCopyMediaId,
  };
}
