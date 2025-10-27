"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaGalleryProps {
  media?: string[];
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // Use media prop or default to empty array
  const galleryImages = media || [];

  // Don't render if no images
  if (galleryImages.length === 0) {
    return null;
  }

  const navigateGallery = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentGalleryIndex((prev) =>
        prev === 0 ? galleryImages.length - 1 : prev - 1
      );
    } else {
      setCurrentGalleryIndex((prev) =>
        prev === galleryImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Gallery Display */}
        <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src={galleryImages[currentGalleryIndex]}
            alt="Gallery Image"
            className="w-full h-full object-cover"
          />

          {/* Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={() => navigateGallery("prev")}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={() => navigateGallery("next")}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        <div className="flex gap-3 p-1 overflow-x-auto">
          {galleryImages.map((imageUrl, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentGalleryIndex(idx)}
              className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-muted transition-all ${
                currentGalleryIndex === idx ? "ring-2 ring-primary" : ""
              }`}
            >
              <img
                src={imageUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
