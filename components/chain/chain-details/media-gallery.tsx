"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: number;
  url: string;
  alt: string;
}

interface MediaGalleryProps {
  images?: GalleryImage[];
}

export function MediaGallery({ images }: MediaGalleryProps) {
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // Default gallery data if no images provided
  const galleryImages = images || [
    { id: 1, url: "/placeholder.jpg", alt: "Gallery Image 1" },
    { id: 2, url: "/placeholder.jpg", alt: "Gallery Image 2" },
    { id: 3, url: "/placeholder.jpg", alt: "Gallery Image 3" },
  ];

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
          <span className="text-muted-foreground">
            Gallery Image {currentGalleryIndex + 1}
          </span>

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
          {galleryImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentGalleryIndex(idx)}
              className={`flex-shrink-0 w-24 h-16 rounded-lg bg-muted flex items-center justify-center transition-all ${
                currentGalleryIndex === idx ? "ring-2 ring-primary" : ""
              }`}
            >
              <span className="text-xs text-muted-foreground">{idx + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
