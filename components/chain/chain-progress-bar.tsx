"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

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

interface Sparkle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  offsetX: number;
  offsetY: number;
  endOffsetX: number;
  endOffsetY: number;
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
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);
  const previousProgressRef = useRef(progress);
  const previousPriceChangeRef = useRef(priceChange);

  // Generate sparkles when progress or priceChange changes
  useEffect(() => {
    const progressChanged = progress !== previousProgressRef.current;
    const priceChanged = priceChange !== previousPriceChangeRef.current;

    if (progressChanged || priceChanged) {
      const newSparkles: Sparkle[] = [];
      const sparkleCount = 8;

      // Generate sparkles around progress bar
      if (progressBarRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        for (let i = 0; i < sparkleCount; i++) {
          newSparkles.push({
            id: Date.now() + i,
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            delay: Math.random() * 200,
            duration: 600 + Math.random() * 400,
            offsetX: Math.random() * 20 - 10,
            offsetY: Math.random() * 20 - 10,
            endOffsetX: Math.random() * 30 - 15,
            endOffsetY: Math.random() * 30 - 15,
          });
        }
      }

      // Generate sparkles around percentage
      if (percentageRef.current) {
        const rect = percentageRef.current.getBoundingClientRect();
        for (let i = 0; i < 4; i++) {
          newSparkles.push({
            id: Date.now() + sparkleCount + i,
            x: Math.random() * rect.width - 10,
            y: Math.random() * rect.height - 10,
            delay: Math.random() * 200,
            duration: 600 + Math.random() * 400,
            offsetX: Math.random() * 20 - 10,
            offsetY: Math.random() * 20 - 10,
            endOffsetX: Math.random() * 30 - 15,
            endOffsetY: Math.random() * 30 - 15,
          });
        }
      }

      setSparkles(newSparkles);

      // Clean up sparkles after animation
      const timeout = setTimeout(() => {
        setSparkles([]);
      }, 1500);

      previousProgressRef.current = progress;
      previousPriceChangeRef.current = priceChange;

      return () => clearTimeout(timeout);
    }
  }, [progress, priceChange]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress Bar */}
      {progressColor ? (
        // Custom colored progress bar (for variant A / carousel)
        <div
          ref={progressBarRef}
          className="relative w-full overflow-visible rounded-full bg-primary/20 h-2 lg:h-3"
        >
          <Progress value={progress} className="w-full h-2 lg:h-3" />
          {/* Sparkles around progress bar */}
          {sparkles.slice(0, 8).map((sparkle) => (
            <div
              key={sparkle.id}
              className="absolute pointer-events-none"
              style={
                {
                  left: `${sparkle.x}px`,
                  top: `${sparkle.y}px`,
                  animationDelay: `${sparkle.delay}ms`,
                  animationDuration: `${sparkle.duration}ms`,
                  "--sparkle-x": `${sparkle.offsetX}px`,
                  "--sparkle-y": `${sparkle.offsetY}px`,
                  "--sparkle-end-x": `${sparkle.endOffsetX}px`,
                  "--sparkle-end-y": `${sparkle.endOffsetY}px`,
                } as React.CSSProperties
              }
            >
              <div className="sparkle-particle" />
            </div>
          ))}
        </div>
      ) : (
        // Standard progress bar (for variant B / small cards)
        <div ref={progressBarRef} className="relative w-full overflow-visible">
          <Progress value={progress} className="w-full h-2" />
          {/* Sparkles around progress bar */}
          {sparkles.slice(0, 8).map((sparkle) => (
            <div
              key={sparkle.id}
              className="absolute pointer-events-none"
              style={
                {
                  left: `${sparkle.x}px`,
                  top: `${sparkle.y}px`,
                  animationDelay: `${sparkle.delay}ms`,
                  animationDuration: `${sparkle.duration}ms`,
                  "--sparkle-x": `${sparkle.offsetX}px`,
                  "--sparkle-y": `${sparkle.offsetY}px`,
                  "--sparkle-end-x": `${sparkle.endOffsetX}px`,
                  "--sparkle-end-y": `${sparkle.endOffsetY}px`,
                } as React.CSSProperties
              }
            >
              <div className="sparkle-particle" />
            </div>
          ))}
        </div>
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
        <span
          ref={percentageRef}
          className={cn(
            "relative inline-block",
            isPositive ? "text-green-500" : "text-red-500"
          )}
        >
          {isPositive ? "+" : ""}
          {priceChange.toFixed(1)}%{/* Sparkles around percentage */}
          {sparkles.slice(8).map((sparkle) => (
            <div
              key={sparkle.id}
              className="absolute pointer-events-none"
              style={
                {
                  left: `${sparkle.x}px`,
                  top: `${sparkle.y}px`,
                  animationDelay: `${sparkle.delay}ms`,
                  animationDuration: `${sparkle.duration}ms`,
                  "--sparkle-x": `${sparkle.offsetX}px`,
                  "--sparkle-y": `${sparkle.offsetY}px`,
                  "--sparkle-end-x": `${sparkle.endOffsetX}px`,
                  "--sparkle-end-y": `${sparkle.endOffsetY}px`,
                } as React.CSSProperties
              }
            >
              <div className="sparkle-particle" />
            </div>
          ))}
        </span>
      </div>
    </div>
  );
};
