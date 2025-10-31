"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ChainProgressBarProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Current amount raised */
  currentAmount: string;
  /** Target amount to reach */
  targetAmount: string;
  /** Price change percentage */
  priceChange: number;
  /** Variant A: carousel style (larger, white text) or B: compact style (smaller, muted text) */
  variant?: "A" | "B";
  /** Custom color for the progress bar */
  progressColor?: string;
  /** Additional className for the container */
  className?: string;
}

export const ChainProgressBar = ({
  progress,
  currentAmount,
  targetAmount,
  priceChange,
  variant = "B",
  progressColor,
  className,
}: ChainProgressBarProps) => {
  const isVariantA = variant === "A";
  const isPositive = priceChange >= 0;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress Bar */}
      {progressColor ? (
        // Custom colored progress bar (for variant A / carousel)
        <div className="relative w-full overflow-hidden rounded-full bg-primary/20 h-3">
          <Progress value={progress} className="w-full h-3" />
        </div>
      ) : (
        // Standard progress bar (for variant B / small cards)
        <Progress value={progress} className="w-full h-2" />
      )}

      {/* Text Information */}
      <div
        className={cn(
          "flex items-center justify-between",
          isVariantA ? "text-sm" : "text-xs"
        )}
      >
        <span
          className={cn(
            "font-medium",
            isVariantA ? "text-white" : "text-muted-foreground"
          )}
        >
          ${currentAmount} / ${targetAmount}
          {isVariantA && " until graduation"}
        </span>
        <span className={isPositive ? "text-green-500" : "text-red-500"}>
          {isPositive ? "+" : ""}
          {priceChange.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
