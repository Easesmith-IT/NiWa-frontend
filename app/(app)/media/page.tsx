"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";

import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { apiClient } from "../../../lib/api/client";
import { MediaDetailResponse, MediaListResponse, MediaRecord, MediaUploadResponse } from "../../../lib/api/types";
import { getMediaDisplayName } from "../../../lib/media";

const formatSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function MediaPage() {
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

  const mediaQuery = useQuery({
    queryKey: ["media", query, type, folder, tag],
    queryFn: async () => {
      const response = await apiClient.get<MediaListResponse>("/media", {
        params: {
          ...(query ? { query } : {}),
          ...(type ? { type } : {}),
          ...(folder ? { folder } : {}),
          ...(tag ? { tag } : {}),
        },
      });
      return response.data;
    },
  });

  const mediaDetailQuery = useQuery({
    queryKey: ["media-detail", selectedId],
    queryFn: async () => {
      const response = await apiClient.get<MediaDetailResponse>(`/media/${selectedId}`);
      return response.data;
    },
    enabled: Boolean(selectedId),
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ customName, file }: { customName: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (customName.trim()) {
        formData.append("customName", customName.trim());
      }
      const response = await apiClient.post<MediaUploadResponse>("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSubmitError(null);
      setSubmitMessage(`Uploaded ${getMediaDisplayName(data.media)} successfully.`);
      setUploadCustomName("");
      mediaQuery.refetch();
    },
    onError: (error) => {
      setSubmitMessage(null);
      setSubmitError(
        error instanceof AxiosError
          ? error.response?.data?.message ?? "Upload failed."
          : "Upload failed.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/media/${id}`);
    },
    onSuccess: () => {
      setSubmitError(null);
      setSubmitMessage("Media deleted.");
      setSelectedId(null);
      mediaQuery.refetch();
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

  const metadataMutation = useMutation({
    mutationFn: async (payload: { customName: string; id: string; folder: string; tags: string[] }) => {
      const response = await apiClient.patch<MediaDetailResponse>(`/media/${payload.id}`, {
        customName: payload.customName.trim() || null,
        folder: payload.folder.trim() || null,
        tags: payload.tags,
      });
      return response.data;
    },
    onSuccess: () => {
      setSubmitError(null);
      setSubmitMessage("Media metadata updated.");
      mediaQuery.refetch();
      mediaDetailQuery.refetch();
    },
    onError: (error) => {
      setSubmitMessage(null);
      setSubmitError(
        error instanceof AxiosError
          ? error.response?.data?.message ?? "Metadata update failed."
          : "Metadata update failed.",
      );
    },
  });

  const media = useMemo(() => mediaQuery.data?.media ?? [], [mediaQuery.data]);

  useEffect(() => {
    if (!mediaDetailQuery.data?.media) {
      setMetadataCustomName("");
      setMetadataFolder("");
      setMetadataTags("");
      return;
    }

    setMetadataCustomName(mediaDetailQuery.data.media.customName ?? "");
    setMetadataFolder(mediaDetailQuery.data.media.folder ?? "");
    setMetadataTags((mediaDetailQuery.data.media.tags ?? []).join(", "));
  }, [mediaDetailQuery.data]);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <section className="rounded-lg border border-[#E4E4E7] bg-white p-5 shadow-subtle dark:border-[#292C2F] dark:bg-[#121416]">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Media Asset Vault
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Upload, manage, and reuse Meta Cloud API media attachments (Images, Documents, Audio, Video).
        </p>
      </section>

      <Card className="space-y-3.5 p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          <Input onChange={(event) => setQuery(event.target.value)} placeholder="Search by file name..." value={query} />
          <Input
            onChange={(event) => setUploadCustomName(event.target.value)}
            placeholder="Custom upload name"
            value={uploadCustomName}
          />
          <select
            className="h-8.5 w-full rounded-md border border-[#D4D4D8] bg-[#FAFAFA] px-2.5 text-xs text-foreground outline-none focus:border-primary dark:border-[#303438] dark:bg-[#17191B]"
            onChange={(event) => setType(event.target.value)}
            value={type}
          >
            <option value="">All types</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="document">Document</option>
            <option value="sticker">Sticker</option>
          </select>
          <Input onChange={(event) => setFolder(event.target.value)} placeholder="Folder..." value={folder} />
          <Input onChange={(event) => setTag(event.target.value)} placeholder="Tag..." value={tag} />
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-[#176B4D] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#12563E] dark:bg-[#2D8A67] dark:hover:bg-[#26785B]">
            {uploadMutation.isPending ? "Uploading..." : "Upload File"}
            <input
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setSubmitMessage(null);
                  setSubmitError(null);
                  uploadMutation.mutate({
                    customName: uploadCustomName,
                    file,
                  });
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

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
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
                  <Button onClick={() => setSelectedId(item._id)} size="sm" type="button" variant="secondary">
                    Details
                  </Button>
                  <Button
                    onClick={async () => {
                      await navigator.clipboard.writeText(item.metaMediaId);
                      setSubmitMessage("Media ID copied.");
                    }}
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
                  <Button disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(item._id)} size="sm" type="button" variant="secondary">
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {!mediaQuery.isLoading && media.length === 0 ? (
            <Card className="p-4 text-xs text-muted-foreground">No media files stored.</Card>
          ) : null}
        </div>

        <Card className="space-y-3.5 p-4">
          <div className="border-b border-[#F0F0F2] pb-2 dark:border-[#202326]">
            <h3 className="text-sm font-semibold text-foreground">Media Asset Detail</h3>
          </div>
          {mediaDetailQuery.data?.media ? (
            <div className="space-y-3 text-xs">
              <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 space-y-1 dark:border-[#292C2F] dark:bg-[#17191B]">
                <p className="font-semibold text-foreground">{getMediaDisplayName(mediaDetailQuery.data.media)}</p>
                {mediaDetailQuery.data.media.customName ? (
                  <p className="text-muted-foreground">Original: {mediaDetailQuery.data.media.fileName}</p>
                ) : null}
                <p className="text-muted-foreground">{mediaDetailQuery.data.media.mediaType} • {mediaDetailQuery.data.media.mimeType}</p>
                <p className="font-mono text-[11px] text-[#176B4D] dark:text-[#359B76]">Media ID: {mediaDetailQuery.data.media.metaMediaId}</p>
              </div>

              <div className="space-y-2 rounded-md border border-[#E4E4E7] bg-white p-3 dark:border-[#292C2F] dark:bg-[#121416]">
                <p className="text-xs font-semibold text-foreground">Update Metadata</p>
                <div>
                  <label className="mb-0.5 block text-[11px] text-muted-foreground">Custom Name</label>
                  <Input
                    onChange={(event) => setMetadataCustomName(event.target.value)}
                    placeholder="Custom name"
                    value={metadataCustomName}
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-muted-foreground">Folder</label>
                  <Input
                    onChange={(event) => setMetadataFolder(event.target.value)}
                    placeholder="Folder name"
                    value={metadataFolder}
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-muted-foreground">Tags (comma separated)</label>
                  <Input
                    onChange={(event) => setMetadataTags(event.target.value)}
                    placeholder="tag1, tag2"
                    value={metadataTags}
                  />
                </div>
                <Button
                  className="w-full mt-1"
                  disabled={metadataMutation.isPending}
                  onClick={() => {
                    if (!mediaDetailQuery.data?.media?._id) {
                      return;
                    }

                    setSubmitMessage(null);
                    setSubmitError(null);
                    metadataMutation.mutate({
                      customName: metadataCustomName,
                      id: mediaDetailQuery.data.media._id,
                      folder: metadataFolder,
                      tags: metadataTags
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean),
                    });
                  }}
                  size="sm"
                  type="button"
                  variant="primary"
                >
                  {metadataMutation.isPending ? "Saving..." : "Save Metadata"}
                </Button>
              </div>

              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payload Technical Record</p>
                <pre className="overflow-x-auto rounded-md border border-[#292C2F] bg-[#0F1112] p-2.5 font-mono text-[10px] text-[#E4E4E7]">
                  {JSON.stringify(
                    {
                      requestPayload: mediaDetailQuery.data.media.requestPayload,
                      responsePayload: mediaDetailQuery.data.media.responsePayload,
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
      </div>
    </div>
  );
}

