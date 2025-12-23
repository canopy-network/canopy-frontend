"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LatestUpdatedProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * ISO timestamp string or Date object to calculate time ago
   * If provided, will automatically calculate and update the time ago text
   */
  timestamp?: string | Date;
  /**
   * Pre-formatted time ago string (e.g., "44 secs ago")
   * If provided, will use this instead of calculating from timestamp
   */
  timeAgo?: string;
  /**
   * Whether to show the Live badge
   * @default true
   */
  showLive?: boolean;
  /**
   * Whether to use responsive text (desktop: "Latest update", mobile: "Updated")
   * @default false
   */
  responsive?: boolean;
}

/**
 * Reusable component for displaying "Latest update" information with Live badge
 *
 * @example
 * // With timestamp (auto-updates)
 * <LatestUpdated timestamp={new Date()} />
 *
 * @example
 * // With pre-formatted string
 * <LatestUpdated timeAgo="44 secs ago" />
 *
 * @example
 * // Without Live badge
 * <LatestUpdated timeAgo="2 mins ago" showLive={false} />
 */
export function LatestUpdated({ showLive = true, className, ...props }: LatestUpdatedProps) {
  return (
    <div className={cn("flex items-center gap-2 lg:gap-4", className)} {...props}>
      {showLive && (
        <div className="relative inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-green-500/5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_4px_rgba(0,166,61,0.8)]" />
          <span className="text-sm font-medium text-green-500">Live</span>
        </div>
      )}
    </div>
  );
}
