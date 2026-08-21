"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { fetchMessageMediaBlobV1 } from "../inbox.api";

export interface LightboxImageItem {
  caption?: string | null;
  messageId: string;
  senderName: string;
  timestamp: string;
}

interface ImageLightboxModalProps {
  images: LightboxImageItem[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageLightboxModal({
  images,
  initialIndex,
  onClose,
}: ImageLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loadedUrls, setLoadedUrls] = useState<Record<string, string>>({});

  const currentItem = images[currentIndex] ?? images[0];

  // Fetch blob URL for each image via API layer
  useEffect(() => {
    let disposed = false;
    const fetchBlobForMessage = async (item: LightboxImageItem) => {
      if (!item?.messageId || loadedUrls[item.messageId]) return;

      try {
        const blob = await fetchMessageMediaBlobV1(item.messageId);
        const objectUrl = URL.createObjectURL(blob);

        if (!disposed) {
          setLoadedUrls((prev) => ({ ...prev, [item.messageId]: objectUrl }));
        }
      } catch {
        // Fallback handled gracefully
      }
    };

    images.forEach((item) => {
      void fetchBlobForMessage(item);
    });

    return () => {
      disposed = true;
    };
  }, [images, loadedUrls]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(loadedUrls).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [loadedUrls]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (event.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  if (!currentItem) return null;

  const currentObjectUrl = loadedUrls[currentItem.messageId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-between bg-black/90 p-4 text-white">
      {/* Top Header */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4">
        <div>
          <h3 className="font-semibold text-white">{currentItem.senderName}</h3>
          <p className="text-xs text-white/70">{currentItem.timestamp}</p>
        </div>

        <div className="flex items-center gap-2">
          {currentObjectUrl ? (
            <a
              className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              download={`image-${currentItem.messageId}`}
              href={currentObjectUrl}
              title="Download image"
            >
              <Download className="h-5 w-5" />
            </a>
          ) : null}
          <button
            className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Nav Left */}
      {images.length > 1 ? (
        <button
          className="z-10 rounded-full bg-black/40 p-3 text-white/80 transition hover:bg-black/70 hover:text-white"
          onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
          type="button"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      ) : (
        <div />
      )}

      {/* Main Image View */}
      <div className="flex max-h-[85vh] max-w-[85vw] flex-col items-center justify-center">
        {currentObjectUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={currentItem.caption || "Lightbox media"}
            className="max-h-[75vh] max-w-[80vw] rounded-lg object-contain"
            src={currentObjectUrl}
          />
        ) : (
          <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400">
            Loading image...
          </div>
        )}

        {currentItem.caption ? (
          <p className="mt-4 max-w-xl text-center text-sm text-white/90">{currentItem.caption}</p>
        ) : null}

        {images.length > 1 ? (
          <p className="mt-2 text-xs text-white/50">
            {currentIndex + 1} of {images.length}
          </p>
        ) : null}
      </div>

      {/* Nav Right */}
      {images.length > 1 ? (
        <button
          className="z-10 rounded-full bg-black/40 p-3 text-white/80 transition hover:bg-black/70 hover:text-white"
          onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
          type="button"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}
