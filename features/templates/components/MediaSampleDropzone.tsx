"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import { useUploadTemplateSampleMutation } from "../templates.queries";

interface MediaSampleDropzoneProps {
  format: "IMAGE" | "VIDEO" | "DOCUMENT";
  headerHandle: string | null;
  fileName: string | null;
  filePreviewUrl?: string | null;
  onUploadSuccess: (handle: string, fileName: string, filePreviewUrl?: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function MediaSampleDropzone({
  format,
  headerHandle,
  fileName,
  filePreviewUrl,
  onUploadSuccess,
  onRemove,
  disabled = false,
}: MediaSampleDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadTemplateSampleMutation();

  const getFormatDetails = useCallback(() => {
    switch (format) {
      case "IMAGE":
        return {
          label: "Image",
          accept: "image/jpeg,image/png",
          hint: "JPEG or PNG, max 5 MB",
          maxSize: 5 * 1024 * 1024,
          icon: ImageIcon,
        };
      case "VIDEO":
        return {
          label: "Video",
          accept: "video/mp4,video/3gpp",
          hint: "MP4 or 3GPP, max 16 MB",
          maxSize: 16 * 1024 * 1024,
          icon: Video,
        };
      case "DOCUMENT":
        return {
          label: "Document",
          accept: "application/pdf",
          hint: "PDF, max 100 MB",
          maxSize: 100 * 1024 * 1024,
          icon: FileText,
        };
    }
  }, [format]);

  const details = getFormatDetails();
  const IconComponent = details.icon;

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);

    // Validate size client-side
    if (file.size > details.maxSize) {
      setErrorMessage(`File exceeds the maximum allowed size of ${details.hint}.`);
      return;
    }

    // Create local object URL for instant image thumbnail
    let localPreviewUrl: string | undefined;
    if (format === "IMAGE" && file.type.startsWith("image/")) {
      localPreviewUrl = URL.createObjectURL(file);
    }

    try {
      const response = await uploadMutation.mutateAsync(file);
      if (response.headerHandle) {
        onUploadSuccess(response.headerHandle, file.name, localPreviewUrl);
      } else {
        setErrorMessage("Meta did not return an asset handle. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload sample media to Meta.";
      setErrorMessage(msg);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploadMutation.isPending) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || uploadMutation.isPending) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) handleProcessFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) handleProcessFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <IconComponent className="h-3.5 w-3.5 text-[#176B4D] dark:text-[#359B76]" />
          <span>{details.label} Sample (Required for Meta Review)</span>
        </label>
        <span className="text-[11px] text-muted-foreground">{details.hint}</span>
      </div>

      <input
        accept={details.accept}
        className="hidden"
        disabled={disabled || uploadMutation.isPending}
        onChange={handleFileInputChange}
        ref={fileInputRef}
        type="file"
      />

      {headerHandle ? (
        /* Uploaded Asset Card */
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-[#EDF8F3] p-3 dark:border-[#1F4D3C] dark:bg-[#13251E]">
          <div className="flex items-center gap-3 truncate">
            {filePreviewUrl ? (
              <img
                alt="Sample preview"
                className="h-10 w-10 shrink-0 rounded object-cover border border-emerald-300 dark:border-emerald-700"
                src={filePreviewUrl}
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-emerald-100 text-[#176B4D] dark:bg-[#1D3B2F] dark:text-[#359B76]">
                <IconComponent className="h-5 w-5" />
              </div>
            )}
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-medium text-foreground">
                  {fileName || "Sample File"}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-medium text-[#176B4D] dark:bg-[#1D3B2F] dark:text-[#359B76]">
                  <CheckCircle2 className="h-3 w-3" />
                  Handle Ready
                </span>
              </div>
              <p className="truncate font-mono text-[10px] text-muted-foreground">
                handle: {headerHandle.substring(0, 32)}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              className="rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
              disabled={disabled || uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Replace
            </button>
            <button
              className="rounded p-1 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
              disabled={disabled || uploadMutation.isPending}
              onClick={onRemove}
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Box */
        <div
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors ${
            isDragOver
              ? "border-[#176B4D] bg-[#EDF8F3] dark:border-[#359B76] dark:bg-[#13251E]"
              : "border-[#D4D4D8] bg-[#F7F8FA] hover:border-[#176B4D]/50 hover:bg-[#F2FBF7] dark:border-[#303438] dark:bg-[#151719] dark:hover:bg-[#17201D]"
          } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          onClick={() => !disabled && !uploadMutation.isPending && fileInputRef.current?.click()}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {uploadMutation.isPending ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#176B4D] dark:text-[#359B76]" />
              <p className="text-xs font-medium text-foreground">
                Uploading sample to Meta Resumable Upload API...
              </p>
              <p className="text-[11px] text-muted-foreground">Generating asset handle...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="rounded-full bg-white p-2 shadow-subtle dark:bg-[#1C1F21]">
                <UploadCloud className="h-5 w-5 text-[#176B4D] dark:text-[#359B76]" />
              </div>
              <div className="text-xs text-foreground">
                <span className="font-semibold text-[#176B4D] hover:underline dark:text-[#359B76]">
                  Choose file from device
                </span>{" "}
                or drag and drop here
              </div>
              <p className="text-[11px] text-muted-foreground">
                Meta requires a sample {details.label.toLowerCase()} to evaluate template quality and prevent spam.
              </p>
            </div>
          )}
        </div>
      )}

      {errorMessage ? (
        <div className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-[#D7685C]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </div>
  );
}
