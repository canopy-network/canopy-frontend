"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface ExpandableDetailProps {
  title: string;
  value: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function ExpandableDetail({
  title,
  value,
  children,
  defaultExpanded = false,
}: ExpandableDetailProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{value}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t pt-4">{children}</div>
      )}
    </div>
  );
}
