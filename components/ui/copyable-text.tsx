"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyableTextProps {
  /** The text content to display and copy */
  text: string;
  /** Optional function to truncate/format the display text */
  truncate?: (text: string) => string;
  /** Additional className for the container */
  className?: string;
  /** Additional className for the text */
  textClassName?: string;
  /** Additional className for the copy button */
  buttonClassName?: string;
  /** Prefix to show before the text */
  prefix?: string;
  /** Suffix to show after the text */
  suffix?: string;
  /** Whether the icon should use muted-foreground color (default: true) */
  iconMuted?: boolean;
}

/**
 * Reusable component that displays text with a copy-to-clipboard button
 * The copy button appears on the right side and copies the full text content
 */
export function CopyableText({
  text,
  truncate,
  className,
  textClassName = "text-sm text-muted-foreground",
  prefix,
  suffix,
  iconMuted = true,
}: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, [text]);

  const displayText = truncate ? truncate(text) : text;

  return (
    <div className={cn("inline-flex items-center gap-1.5 group", className)}>
      <span className={cn(textClassName)}>
        {prefix}
        {displayText}
        {suffix}
      </span>
      <TooltipProvider>
        <Tooltip open={copied}>
          <TooltipTrigger asChild>
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy
                stroke="currentColor"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopy();
                }}
                aria-label="Copy to clipboard"
                className={cn(
                  "w-4 h-4 pointer-events-none",
                  iconMuted ? "text-muted-foreground" : "text-white"
                )}
              />
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>Copied to clipboard!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
