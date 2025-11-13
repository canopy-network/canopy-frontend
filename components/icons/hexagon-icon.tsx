"use client";

import React, { useState } from "react";

interface HexagonIconProps {
  /** Icon or text content to display inside the hexagon */
  children: React.ReactNode;
  /** Optional tooltip text (display name) */
  tooltip?: string;
  /** Optional description text to show in tooltip (shown below tooltip if provided) */
  description?: string;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Hexagon-shaped icon wrapper component
 * Used to display icons or text within a hexagonal border
 */
export const HexagonIcon = ({
  children,
  tooltip,
  description,
  className = "",
}: HexagonIconProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative w-4 h-4 flex items-center justify-center cursor-help group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip */}
      {(tooltip || description) && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-popover text-xs rounded-md pointer-events-none transition-all duration-200 shadow-lg max-w-xs ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          } ${description ? "whitespace-normal" : "whitespace-nowrap"}`}
        >
          {tooltip && (
            <div className="font-medium">{tooltip}</div>
          )}
          {description && (
            <div className={`text-[10px] text-popover/80 ${tooltip ? "mt-1" : ""}`}>
              {description}
            </div>
          )}
          {/* Arrow pointing down with rounded tip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px]">
            <svg
              width="14"
              height="7"
              viewBox="0 0 14 7"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L7 6L13 1"
                fill="white"
                stroke="white"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Hexagon SVG */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <polygon
          points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
          className="fill-primary/20 stroke-primary"
          strokeWidth="4"
        />
      </svg>

      {/* Icon Content */}
      <div className="w-2 h-2 relative z-10 text-primary flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
