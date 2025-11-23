"use client";

import * as React from "react";
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiveStatusComponent } from "./live-status-component";

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
   * Whether to show the Box icon
   * @default true
   */
  showIcon?: boolean;
  /**
   * Whether to use responsive text (desktop: "Latest update", mobile: "Updated")
   * @default false
   */
  responsive?: boolean;
}

/**
 * Formats a timestamp into a human-readable "time ago" string
 */
function formatTimeAgo(timestamp: string | Date): string {
  const now = Date.now();
  const time =
    typeof timestamp === "string"
      ? new Date(timestamp).getTime()
      : timestamp.getTime();
  const seconds = Math.floor((now - time) / 1000);

  if (seconds < 60) return `${seconds} secs ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hrs ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

/**
 * Reusable component for displaying "Latest update" information
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
 * // Responsive mode
 * <LatestUpdated timestamp={timestamp} responsive />
 *
 * @example
 * // Without icon
 * <LatestUpdated timeAgo="2 mins ago" showIcon={false} />
 */
export function LatestUpdated({
  timestamp,
  timeAgo,
  showIcon = true,
  responsive = false,
  className,
  ...props
}: LatestUpdatedProps) {
  const [currentTime, setCurrentTime] = React.useState(Date.now());

  // Update time every second if using timestamp
  React.useEffect(() => {
    if (!timestamp) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  // Calculate time ago from timestamp
  const calculatedTimeAgo = React.useMemo(() => {
    if (timeAgo) return timeAgo;
    if (timestamp) return formatTimeAgo(timestamp);
    return "0 secs ago";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamp, timeAgo, currentTime]);

  const prefix = responsive ? (
    <>
      <span className="text-xs lg:text-sm lg:block hidden">
        Latest update {calculatedTimeAgo}
      </span>
      <span className="text-xs block lg:hidden">
        Updated {calculatedTimeAgo}
      </span>
    </>
  ) : (
    <span>Latest update {calculatedTimeAgo}</span>
  );

  return (
    <div className="flex items-center gap-2 lg:gap-4">
      <LiveStatusComponent className="lg:block hidden" />
      <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap text-sm bg-white/[0.05] rounded-lg px-2 lg:px-4 py-2">
        <Box className="w-4 h-4 lg:block hidden" />
        <LiveStatusComponent className="lg:hidden block" />

        <span className="text-xs lg:text-sm lg:block hidden whitespace-nowrap">
          Latest update {calculatedTimeAgo}
        </span>
        <span className="text-xs  block lg:hidden whitespace-nowrap">
          Updated {calculatedTimeAgo}
        </span>
      </div>
    </div>
  );
}
