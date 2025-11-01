import React from "react";
import { RecentsProjectsCarouselSkeleton } from "@/components/skeletons/recents-projects-carousel-skeleton";
import { SmallProjectCardSkeleton } from "@/components/skeletons/small-project-card-skeleton";
import { Container } from "@/components/layout/container";

/**
 * Full page skeleton for the home/launchpad dashboard
 * Displays loading state with carousel, filter bar, and project cards grid
 */
export const HomePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-black">
      <Container type="2xl">
        {/* Main Content */}
        {/* Recent Projects Carousel */}
        <div className="mb-6 lg:mb-12">
          <RecentsProjectsCarouselSkeleton />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow p-1 flex items-center justify-between mb-8 animate-pulse-slow">
          <div className="flex items-center gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-muted rounded-md" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-muted rounded-md" />
            <div className="h-10 w-20 bg-muted/50 rounded-lg" />
          </div>
        </div>

        {/* Projects Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SmallProjectCardSkeleton key={i} viewMode="grid" />
          ))}
        </div>
      </Container>
    </div>
  );
};
