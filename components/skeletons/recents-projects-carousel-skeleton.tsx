import React from "react";
import { ProjectCardSkeleton } from "@/components/skeletons/project-card-skeleton";

/**
 * Skeleton loading component for RecentsProjectsCarousel
 * Displays a single ProjectCardSkeleton with pagination dots
 * Matches the exact dimensions and layout of the actual carousel
 */
export const RecentsProjectsCarouselSkeleton = () => {
  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="relative rounded-lg mb-2">
        <ProjectCardSkeleton />
      </div>

      {/* Dots Indicator - Skeleton */}
      <div className="flex justify-center mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <button
            key={index}
            disabled
            className="cursor-not-allowed py-3 px-1"
            aria-label={`Loading slide ${index + 1}`}
          >
            <span
              className={`block h-2 rounded-full transition-all duration-200 animate-pulse-slow ${
                index === 0 ? "bg-muted w-12" : "bg-muted/50 w-3"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
