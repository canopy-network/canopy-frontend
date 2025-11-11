"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ChainAsset } from "@/types/chains";

interface MediaGalleryProps {
  media?: string[];
  assets?: ChainAsset[];
}

export function MediaGallery({ media, assets }: MediaGalleryProps) {
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // If assets are provided, use them (preferred - has type information)
  // Otherwise fall back to media URLs array
  let galleryItems: Array<{ url: string; type: "image" | "video" }> = [];

  if (assets && assets.length > 0) {
    // Filter for media/video/banner assets and map to gallery items
    galleryItems = assets
      .filter(
        (asset) =>
          asset.asset_type === "media" ||
          asset.asset_type === "screenshot" ||
          asset.asset_type === "video" ||
          asset.asset_type === "banner"
      )
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((asset) => ({
        url: asset.file_url,
        type:
          asset.asset_type === "video" || asset.mime_type?.startsWith("video/")
            ? "video"
            : "image",
      }));
  } else if (media && media.length > 0) {
    // Fallback: try to detect video from URL extension
    galleryItems = media.map((url) => {
      const isVideo = /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(url);
      return {
        url,
        type: isVideo ? ("video" as const) : ("image" as const),
      };
    });
  }

  // Don't render if no items
  if (galleryItems.length === 0) {
    return null;
  }

  const navigateGallery = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentGalleryIndex((prev) =>
        prev === 0 ? galleryItems.length - 1 : prev - 1
      );
    } else {
      setCurrentGalleryIndex((prev) =>
        prev === galleryItems.length - 1 ? 0 : prev + 1
      );
    }
  };

  const currentItem = galleryItems[currentGalleryIndex];

  return (
    <>
      <div className="space-y-4">
        {/* Main Gallery Display */}
        <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          {currentItem.type === "video" ? (
            <video
              src={currentItem.url}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentItem.url}
              alt="Gallery Image"
              className="w-full h-full object-cover"
            />
          )}

          {/* Navigation Arrows */}
          {galleryItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background z-10"
                onClick={() => navigateGallery("prev")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background z-10"
                onClick={() => navigateGallery("next")}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        <div className="flex gap-3 p-1 overflow-x-auto">
          {galleryItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentGalleryIndex(idx)}
              className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-muted transition-all relative ${
                currentGalleryIndex === idx ? "ring-2 ring-primary" : ""
              }`}
            >
              {item.type === "video" ? (
                <>
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-medium">
                    VIDEO
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
