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
  buttonClassName,
  prefix,
  suffix,
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
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopy();
              }}
              className={cn(
                "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted/50 flex-shrink-0",
                "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50",
                buttonClassName
              )}
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copied to clipboard!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
