import React from "react";

/**
 * Skeleton loading component for WalletContent sidebar
 * Matches the wallet interface dimensions
 */
export const WalletContentSkeleton = () => {
  return (
    <div className="card p-4 animate-pulse-slow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="h-5 w-24 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded-lg" />
        </div>

        {/* Token Selector */}
        <div className="space-y-2">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-12 w-full bg-muted rounded-lg" />
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-12 w-full bg-muted rounded-lg" />
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {["25%", "50%", "75%", "100%"].map((_, i) => (
            <div key={i} className="h-8 w-full bg-muted rounded-md" />
          ))}
        </div>

        {/* Swap Info */}
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>

        {/* Action Button */}
        <div className="h-12 w-full bg-muted rounded-lg" />

        {/* Additional Info */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-4/5 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
};
