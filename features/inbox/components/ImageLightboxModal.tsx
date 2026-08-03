"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { getAccessToken } from "../../../lib/auth";
import { getMessageMediaUrlV1 } from "../../messages/message.api";

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

  // Fetch blob URL for each image
  useEffect(() => {
    let disposed = false;
    const fetchBlobForMessage = async (item: LightboxImageItem) => {
      if (!item?.messageId || loadedUrls[item.messageId]) return;

      try {
        const token = getAccessToken();
        const response = await fetch(getMessageMediaUrlV1(item.messageId), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        if (!response.ok) return;

        const blob = await response.blob();
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

  // Keyboard navigation & ESC close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  if (!currentItem) return null;

  const activeSrc = loadedUrls[currentItem.messageId] || "";

  const handleDownload = () => {
    if (!activeSrc) return;
    const link = document.createElement("a");
    link.href = activeSrc;
    link.download = `whatsapp-image-${currentItem.messageId}.jpg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/92 text-white backdrop-blur-md transition-all">
      {/* Top Header Bar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d644d] text-xs font-bold text-white">
            {currentItem.senderName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{currentItem.senderName}</p>
            <p className="text-xs text-white/60">{currentItem.timestamp}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeSrc ? (
            <button
              className="rounded-full p-2.5 text-white/80 transition hover:bg-white/10 hover:text-white"
              onClick={handleDownload}
              title="Download image"
              type="button"
            >
              <Download className="h-5 w-5" />
            </button>
          ) : null}
          <button
            className="rounded-full p-2.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            title="Close viewer"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Canvas View */}
      <div className="relative flex flex-1 items-center justify-center p-4">
        {/* Navigation Arrows */}
        {images.length > 1 ? (
          <>
            <button
              className="absolute left-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white/80 transition hover:bg-black/80 hover:text-white"
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              type="button"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="absolute right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white/80 transition hover:bg-black/80 hover:text-white"
              onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              type="button"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}

        {/* Main Image Preview */}
        {activeSrc ? (
          <div className="flex flex-col items-center">
            <img
              alt="Preview"
              className="max-h-[72vh] max-w-[85vw] rounded-lg object-contain shadow-2xl transition-all"
              src={activeSrc}
            />
            {currentItem.caption ? (
              <p className="mt-3 max-w-xl text-center text-sm font-normal text-white/90">
                {currentItem.caption}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-white/5 animate-pulse text-xs text-white/60">
            Loading preview...
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip Carousel */}
      {images.length > 0 ? (
        <div className="flex h-24 shrink-0 items-center justify-center border-t border-white/10 bg-black/60 px-4">
          <div className="niwa-scrollbar flex items-center gap-3 overflow-x-auto py-2 px-2 max-w-4xl">
            {images.map((item, idx) => {
              const thumbSrc = loadedUrls[item.messageId];
              const isSelected = idx === currentIndex;

              return (
                <button
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg transition ${
                    isSelected
                      ? "ring-2 ring-[#2d644d] scale-105 opacity-100"
                      : "opacity-50 hover:opacity-100"
                  }`}
                  key={item.messageId}
                  onClick={() => setCurrentIndex(idx)}
                  type="button"
                >
                  {thumbSrc ? (
                    <img
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                      src={thumbSrc}
                    />
                  ) : (
                    <div className="h-full w-full bg-white/10 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
