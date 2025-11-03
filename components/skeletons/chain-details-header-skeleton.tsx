import React from "react";

/**
 * Skeleton loading component for ChainDetailsHeader
 * Matches the exact dimensions and layout of the header
 */
export const ChainDetailsHeaderSkeleton = () => {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-4 animate-pulse-slow">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />

          {/* Title and Badges */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {/* Title skeleton */}
              <div className="h-5 w-40 bg-muted rounded" />

              {/* Hexagon Badges skeleton */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 bg-muted"
                    style={{
                      clipPath:
                        "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }}
                  />
                ))}
                {/* +4 badge skeleton */}
                <div
                  className="w-5 h-5 bg-muted"
                  style={{
                    clipPath:
                      "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  }}
                />
              </div>
            </div>

            {/* Subtitle skeleton */}
            <div className="h-3 w-56 bg-muted rounded" />
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="h-[30px] w-[30px] rounded-lg bg-muted" />
          <div className="h-[30px] w-[30px] rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
};
