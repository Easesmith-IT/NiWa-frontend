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
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Media Library
        </p>
        <h2 className="mt-2 text-3xl font-semibold">Upload and Reuse Media IDs</h2>
      </div>

      <Card className="space-y-4 p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_160px_160px_160px_auto]">
          <Input onChange={(event) => setQuery(event.target.value)} placeholder="Search by file name" value={query} />
          <Input
            onChange={(event) => setUploadCustomName(event.target.value)}
            placeholder="Custom name for next upload"
            value={uploadCustomName}
          />
          <select
            className="flex h-11 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
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
          <Input onChange={(event) => setFolder(event.target.value)} placeholder="Folder" value={folder} />
          <Input onChange={(event) => setTag(event.target.value)} placeholder="Tag" value={tag} />
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
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
        {submitMessage ? <p className="text-sm text-green-700">{submitMessage}</p> : null}
        {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4">
          {media.map((item: MediaRecord) => (
            <Card className="p-6" key={item._id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{getMediaDisplayName(item)}</h3>
                  {item.customName ? (
                    <p className="text-xs text-muted-foreground">Original file: {item.fileName}</p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    {item.mediaType} | {item.mimeType} | {formatSize(item.fileSize)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Folder: {item.folder || "Unsorted"} | Tags: {(item.tags ?? []).length ? item.tags?.join(", ") : "None"}
                  </p>
                  <p className="break-all font-mono text-xs text-foreground">
                    Media ID: {item.metaMediaId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {new Date(item.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
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
                    variant="ghost"
                  >
                    Copy ID
                  </Button>
                  <Link href={`/message-studio?mode=${encodeURIComponent(item.mediaType)}&mediaId=${encodeURIComponent(item.metaMediaId)}`}>
                    <Button size="sm" type="button" variant="ghost">
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
            <p className="text-sm text-muted-foreground">No media stored yet.</p>
          ) : null}
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold">Media Detail</h3>
          {mediaDetailQuery.data?.media ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-[#f7f1e4] p-4 text-sm text-foreground">
                <p>{getMediaDisplayName(mediaDetailQuery.data.media)}</p>
                {mediaDetailQuery.data.media.customName ? (
                  <p className="mt-2 text-muted-foreground">Original file: {mediaDetailQuery.data.media.fileName}</p>
                ) : null}
                <p className="mt-2">{mediaDetailQuery.data.media.mediaType} | {mediaDetailQuery.data.media.mimeType}</p>
                <p className="mt-2 text-muted-foreground">
                  Folder: {mediaDetailQuery.data.media.folder || "Unsorted"} | Tags: {(mediaDetailQuery.data.media.tags ?? []).length ? mediaDetailQuery.data.media.tags?.join(", ") : "None"}
                </p>
              </div>
              <div className="space-y-3 rounded-2xl border border-[#eadbbf] bg-[#fff8ea] p-4">
                <p className="text-sm font-medium text-foreground">Metadata</p>
                <Input
                  className="rounded-[20px] bg-[#faf7f1]"
                  onChange={(event) => setMetadataCustomName(event.target.value)}
                  placeholder="Custom media name"
                  value={metadataCustomName}
                />
                <Input
                  className="rounded-[20px] bg-[#faf7f1]"
                  onChange={(event) => setMetadataFolder(event.target.value)}
                  placeholder="Folder name"
                  value={metadataFolder}
                />
                <Input
                  className="rounded-[20px] bg-[#faf7f1]"
                  onChange={(event) => setMetadataTags(event.target.value)}
                  placeholder="Tags, comma separated"
                  value={metadataTags}
                />
                <Button
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
                  type="button"
                  variant="secondary"
                >
                  {metadataMutation.isPending ? "Saving..." : "Save metadata"}
                </Button>
              </div>
              <pre className="overflow-x-auto rounded-xl bg-[#16302b] p-4 text-xs text-[#f8f1de]">
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
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Select a media asset to inspect its stored metadata and Meta response.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
