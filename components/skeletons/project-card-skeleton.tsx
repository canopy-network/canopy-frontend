import React from "react";
import { Card } from "@/components/ui/card";

/**
 * Skeleton loading component for ProjectCard
 * Matches the exact dimensions and layout of the actual ProjectCard
 */
export const ProjectCardSkeleton = () => {
  return (
    <Card className="rounded-xl border text-card-foreground p-6 pb-0 bg-gradient-to-br from-card to-muted/20 animate-pulse-slow">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Avatar skeleton */}
            <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                {/* Token symbol skeleton */}
                <div className="h-4 w-16 bg-muted rounded" />

                {/* Hexagon badges skeleton */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-muted"
                      style={{
                        clipPath:
                          "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Chain name and created date skeleton */}
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
          </div>

          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-7 w-3/4 bg-muted rounded" />
          </div>

          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>

          {/* Progress Bar skeleton */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
            <div className="h-2 w-full bg-muted rounded-full" />
            <div className="flex justify-between items-center">
              <div className="h-3 w-32 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          </div>

          {/* Bottom Stats skeleton */}
          <div className="flex items-center gap-6 pt-2 border-t border-border/50 pb-4">
            {/* Holder avatars skeleton */}
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-muted border-2 border-card"
                  />
                ))}
              </div>
              <div className="ml-3 h-3 w-20 bg-muted rounded" />
            </div>

            {/* Stats skeleton */}
            <div className="flex items-center gap-6">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </div>
        </div>

        {/* Right Column - Chart skeleton */}
        <div className="flex items-center">
          <div className="w-full h-[280px] bg-muted/50 rounded-lg flex items-center justify-center">
            {/* Chart placeholder with simple wave pattern */}
            <div className="w-full h-full p-4">
              <div className="w-full h-full relative">
                {/* Simulated chart bars */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-1 h-full px-2">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const heights = [
                      30, 45, 35, 50, 60, 45, 55, 70, 65, 55, 60, 50, 45, 55,
                      65, 70, 60, 50, 55, 45,
                    ];
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-muted rounded-t"
                        style={{ height: `${heights[i]}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
