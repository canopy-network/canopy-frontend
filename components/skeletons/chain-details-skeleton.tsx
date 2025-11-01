import React from "react";
import { Card } from "@/components/ui/card";

/**
 * Skeleton loading component for ChainDetails
 * Includes chart, tabs, and content areas
 */
export const ChainDetailsSkeleton = () => {
  return (
    <>
      {/* Main Chart Card */}
      <Card className="p-1 mt-4 animate-pulse-slow">
        <div className="space-y-2">
          {/* Price Tabs and Value */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="space-y-2 flex-1">
              {/* Metric Toggle Tabs skeleton */}
              <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                <div className="h-7 w-20 bg-muted rounded-md" />
                <div className="h-7 w-24 bg-muted rounded-md" />
                <div className="h-7 w-20 bg-muted rounded-md" />
              </div>

              {/* Price/Volume Display skeleton */}
              <div className="flex items-baseline gap-2">
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>

            {/* Timeframe Buttons skeleton */}
            <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
              {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((_, i) => (
                <div key={i} className="h-7 w-10 bg-muted rounded-md" />
              ))}
            </div>
          </div>

          {/* Chart Area skeleton */}
          <div className="h-[400px] bg-muted/50 rounded-lg flex items-center justify-center">
            {/* Simulated chart lines */}
            <div className="w-full h-full p-8">
              <div className="w-full h-full relative">
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-1 h-full px-4">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const heights = [
                      30, 45, 35, 50, 60, 45, 55, 70, 65, 55, 60, 50, 45, 55,
                      65, 70, 60, 50, 55, 45, 50, 60, 55, 65, 70, 60, 55, 50,
                      45, 40,
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
      </Card>

      {/* Details Tabs Card */}
      <Card className="p-4 mt-4 animate-pulse-slow">
        <div className="space-y-4">
          {/* Tabs skeleton */}
          <div className="flex gap-2 border-b border-border pb-2">
            {[
              "Overview",
              "Milestones",
              "Blocks",
              "Trades",
              "Holders",
              "Code",
            ].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-muted rounded" />
            ))}
          </div>

          {/* Tab Content skeleton - Overview */}
          <div className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-6 w-24 bg-muted rounded" />
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-32 bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded-full" />
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>

            {/* Additional sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-20 w-full bg-muted rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-20 w-full bg-muted rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
