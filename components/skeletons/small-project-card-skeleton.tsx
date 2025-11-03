import React from "react";

/**
 * Skeleton loading component for SmallProjectCard
 * Matches the exact dimensions and layout for both grid and list views
 */
interface SmallProjectCardSkeletonProps {
  viewMode?: "grid" | "list";
}

export const SmallProjectCardSkeleton = ({
  viewMode = "grid",
}: SmallProjectCardSkeletonProps) => {
  // List view skeleton
  if (viewMode === "list") {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow animate-pulse-slow">
        <div className="flex items-center gap-4 p-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          </div>

          {/* Market Cap */}
          <div className="flex-1 min-w-[280px]">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="space-y-1">
                <div className="h-2 w-full bg-muted rounded-full" />
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Change (24h) */}
          <div className="min-w-[100px] text-center space-y-2">
            <div className="h-3 w-16 bg-muted rounded mx-auto" />
            <div className="h-4 w-12 bg-muted rounded mx-auto" />
          </div>

          {/* VOL (24h) */}
          <div className="min-w-[100px] text-center space-y-2">
            <div className="h-3 w-16 bg-muted rounded mx-auto" />
            <div className="h-4 w-16 bg-muted rounded mx-auto" />
          </div>

          {/* Holders */}
          <div className="min-w-[80px] text-center space-y-2">
            <div className="h-3 w-12 bg-muted rounded mx-auto" />
            <div className="h-4 w-12 bg-muted rounded mx-auto" />
          </div>

          {/* Liquidity */}
          <div className="min-w-[100px] text-center space-y-2">
            <div className="h-3 w-16 bg-muted rounded mx-auto" />
            <div className="h-4 w-16 bg-muted rounded mx-auto" />
          </div>

          {/* Age */}
          <div className="min-w-[60px] text-center space-y-2">
            <div className="h-3 w-10 bg-muted rounded mx-auto" />
            <div className="h-4 w-8 bg-muted rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Grid view skeleton (default)
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-4 h-40 flex flex-col gap-3 animate-pulse-slow">
      {/* Header: Avatar + Title + Icons */}
      <div className="flex items-center gap-3">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />

        {/* Title, Ticker, and Hexagon Icons */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {/* Title skeleton */}
            <div className="h-4 w-32 bg-muted rounded" />

            {/* Hexagon Icons skeleton */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 bg-muted"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                />
              ))}
              {/* Overflow indicator skeleton */}
              <div
                className="w-3.5 h-3.5 bg-muted"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
              />
            </div>
          </div>

          {/* Token Symbol skeleton */}
          <div className="h-3 w-16 bg-muted rounded mt-1" />
        </div>
      </div>

      {/* Description skeleton */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-3/4 bg-muted rounded" />
      </div>

      {/* Progress Bar and Metrics skeleton */}
      <div className="mt-auto space-y-1">
        <div className="h-2 w-full bg-muted rounded-full" />
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
};
